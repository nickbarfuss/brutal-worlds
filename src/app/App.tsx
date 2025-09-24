import React, { useState, useRef, useEffect } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useConnection } from '@/hooks/useConnection';
import Loader from '@/components/features/system/Loader';
import GameStartDialog from '@/components/features/setup/GameStartDialog';
import MainMenuScreen from '@/screens/MainMenuScreen';
// Re-enable GameScreen to test the rendering pipeline.
import GameScreen from '@/screens/GameScreen';
import Backdrop from '@/components/ui/Backdrop';
import OfflineOverlay from '@/components/features/system/OfflineOverlay';
import { AudioChannel } from '@/types/game';
import { CONFIG } from '@/data/config';
import { ARCHETYPES } from '@/data/archetypes';
import { WORLD_LIBRARY } from '@/data/worlds';

const App: React.FC = () => {
    const { isOnline } = useConnection();
    const engine = useGameEngine();
    const [isClosingStartDialog, setIsClosingStartDialog] = useState(false);
    const closeDialogTimeoutRef = useRef<number | null>(null);
    const isStartingGameRef = useRef(false); // State lock to prevent race conditions

    useEffect(() => {
        // Cleanup timeout on unmount to prevent state updates on an unmounted component.
        return () => {
            if (closeDialogTimeoutRef.current) {
                clearTimeout(closeDialogTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (engine.gamePhase === 'playing' || engine.gamePhase === 'mainMenu') {
            isStartingGameRef.current = false;
        }
    }, [engine.gamePhase]);

    const handleCloseStartDialog = () => {
        // Only proceed if the game is not currently playing or actively starting
        // and the dialog is actually open (i.e., gamePhase is archetypeSelection).
        if (engine.gamePhase === 'playing' || (isStartingGameRef.current && engine.gamePhase !== 'archetypeSelection')) {
            // If we are already playing or in the process of starting,
            // do not force a return to the main menu.
            console.warn('[App] handleCloseStartDialog: Ignoring close request as game is already starting or playing.');
            return;
        }

        // If the game was attempting to start, reset the lock and go to main menu.
        // This path should only be taken if the user explicitly closed the dialog
        // while it was open for archetype selection, not if the game is trying to start.
        if (isStartingGameRef.current) {
            isStartingGameRef.current = false;
            engine.goToMainMenu();
        }

        setIsClosingStartDialog(true);
        if (closeDialogTimeoutRef.current) clearTimeout(closeDialogTimeoutRef.current);
        closeDialogTimeoutRef.current = window.setTimeout(() => {
            engine.closeArchetypeSelection();
            setIsClosingStartDialog(false); // Reset for next time
        }, 300); // Animation duration should match backdrop
    };

    const handleConfirmStartDialog = (archetypeKey: string, worldKey: string, selectedLegacyKey: string) => {
        // Engage the lock to prevent interruptions.
        isStartingGameRef.current = true;
        
        // FIX: Clear any pending close-dialog timeouts to prevent a race condition
        // where the game phase is incorrectly reset to 'mainMenu' after starting.
        if (closeDialogTimeoutRef.current) {
            clearTimeout(closeDialogTimeoutRef.current);
        }
        
        // FIX: Explicitly reset the closing state to prevent the dialog from
        // getting "stuck" if confirm is clicked during the closing animation. This
        // guarantees a clean transition to the game screen.
        setIsClosingStartDialog(false);

        engine.sfxManager.playSound('ui-common-buttonDialogComplete', 'ui');
        engine.startGame(archetypeKey, worldKey, selectedLegacyKey);
        // engine.completeIntro(); // Ensure intro is marked complete after game start
        // isStartingGameRef.current = false; // Moved to useEffect to ensure game phase is stable
    };
    
    const handleBegin = async () => {
        console.log('[DEBUG][App] handleBegin called. isStartingGameRef.current:', isStartingGameRef.current, 'engine.gamePhase:', engine.gamePhase);
        if (isStartingGameRef.current) return;
        isStartingGameRef.current = true;

        // This now waits for the audio context to be ready before proceeding.
        await engine.handleUserInteraction();
    
        // These sounds will now play immediately and reliably.
        // Gemini note: these sounds shoud not be hardcoded here.
        // they should be loaded from assets
        engine.sfxManager.playSound('ui-common-buttonGameStart', 'ui');
    
        // Open the dialog.
        if (CONFIG.QUICK_START.enabled) {
            console.log('[DEBUG][App] handleBegin: Quick start enabled. Calling engine.startGame.');
            const { player1Archetype, player1Legacy, player2Archetype, player2Legacy, worldKey } = CONFIG.QUICK_START;
    
            const archetypeKeys = Object.keys(ARCHETYPES);
            const worldKeys = WORLD_LIBRARY.map(w => w.key);
            
            const finalP1Archetype = player1Archetype && ARCHETYPES[player1Archetype] 
                ? player1Archetype 
                : archetypeKeys[Math.floor(Math.random() * archetypeKeys.length)];

            const finalP2Archetype = player2Archetype && ARCHETYPES[player2Archetype] 
                ? player2Archetype 
                : archetypeKeys[Math.floor(Math.random() * archetypeKeys.length)];
            
            const finalWorldKey = worldKey && WORLD_LIBRARY.find(w => w.key === worldKey)
                ? worldKey
                : worldKeys[Math.floor(Math.random() * worldKeys.length)];

            const p1ArchetypeData = ARCHETYPES[finalP1Archetype];
            let p1LegacyKey = '';
            if (p1ArchetypeData.legacies) {
                const legacies = Object.values(p1ArchetypeData.legacies);
                if (legacies.length > 0) {
                    const legacy = legacies.find(l => l.key === player1Legacy);
                    if (legacy) {
                        p1LegacyKey = legacy.key;
                    } else {
                        const randomIndex = Math.floor(Math.random() * legacies.length);
                        p1LegacyKey = legacies[randomIndex].key;
                    }
                }
            }

            const p2ArchetypeData = ARCHETYPES[finalP2Archetype];
            let p2LegacyKey = '';
            if (p2ArchetypeData.legacies) {
                const legacies = Object.values(p2ArchetypeData.legacies);
                if (legacies.length > 0) {
                    const legacy = legacies.find(l => l.key === player2Legacy);
                    if (legacy) {
                        p2LegacyKey = legacy.key;
                    } else {
                        const randomIndex = Math.floor(Math.random() * legacies.length);
                        p2LegacyKey = legacies[randomIndex].key;
                    }
                }
            }
            
            engine.startGame(finalP1Archetype, finalWorldKey, p1LegacyKey, finalP2Archetype, p2LegacyKey);
            // engine.completeIntro(); // Ensure intro is marked complete after game start
        } else {
            console.log('[DEBUG][App] handleBegin: Quick start disabled. Opening archetype selection.');
            // Normal flow: open the archetype selection dialog.
            if (closeDialogTimeoutRef.current) {
                clearTimeout(closeDialogTimeoutRef.current);
            }
            setIsClosingStartDialog(false);
            engine.openArchetypeSelection();
        }
        
        // isStartingGameRef.current = false; // Moved to useEffect to ensure game phase is stable
    };

    // ARCHITECTURAL FIX: Check for a fatal error first, regardless of game phase.
    // This provides a robust, top-level error boundary that was previously missing.
    if (engine.error) {
        console.log('[DEBUG][App] Rendering Loader due to engine.error:', engine.error);
        return <Loader text={engine.error} hasError={true} />;
    }
    
    if (engine.gamePhase === 'loading' || !engine.isInitialized) {
        console.log('[DEBUG][App] Rendering Loader for loading phase. Message:', engine.loadingMessage);
        return <Loader text={engine.loadingMessage} />;
    }

    const showStartDialog = engine.gamePhase === 'archetypeSelection' || isClosingStartDialog;

    if (engine.gamePhase === 'mainMenu' || showStartDialog) {
        console.log('[DEBUG][App] Rendering MainMenuScreen or GameStartDialog. Current phase:', engine.gamePhase);
        return (
            <>
                {!isOnline && <OfflineOverlay />}
                <MainMenuScreen onBegin={handleBegin} />
                {showStartDialog && (
                    <>
                        <Backdrop isClosing={isClosingStartDialog} />
                        <GameStartDialog
                            onConfirm={handleConfirmStartDialog}
                            onClose={handleCloseStartDialog}
                            isClosing={isClosingStartDialog}
                            playSound={(key: string, channel?: AudioChannel) => engine.sfxManager.playSound(key, channel || 'ui')}
                        />
                    </>
                )}
            </>
        );
    }
    
    // The actual game screen is now re-enabled to test the 3D rendering pipeline.
    // The background worker remains disabled, so the game will not be interactive.
    // For 'playing' and 'gameOver' phases
    if (engine.gamePhase === 'playing' || engine.gamePhase === 'gameOver') {
        console.log('[DEBUG][App] Rendering GameScreen. Current phase:', engine.gamePhase, 'gameSessionId:', engine.gameSessionId);
        return <GameScreen key={engine.gameSessionId} engine={engine} />;
    }

    return null; // Fallback for any unhandled game phase
};

export default App;