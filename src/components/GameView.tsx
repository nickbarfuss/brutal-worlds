import React, { useState, useRef, useEffect } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import Loader from '@/components/Loader';
import GameStartDialog from '@/components/GameStartDialog';
import MainScreen from '@/components/MainScreen';
// Re-enable GameScreen to test the rendering pipeline.
import GameScreen from '@/components/GameScreen';
import Backdrop from '@/components/ui/Backdrop';
import { AudioChannel } from '@/types/game';
import { GAME_CONFIG } from '@/data/config';
import { ARCHETYPES } from '@/data/archetypes';
import { WORLD_LIBRARY } from '@/data/worlds';

const GameView: React.FC = () => {
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

    const handleCloseStartDialog = () => {
        // If the game is already in the process of starting, ignore close requests.
        if (isStartingGameRef.current) return;

        setIsClosingStartDialog(true);
        if (closeDialogTimeoutRef.current) clearTimeout(closeDialogTimeoutRef.current);
        closeDialogTimeoutRef.current = window.setTimeout(() => {
            engine.closeArchetypeSelection();
            setIsClosingStartDialog(false); // Reset for next time
        }, 300); // Animation duration should match backdrop
    };

    const handleConfirmStartDialog = (archetypeKey: string, worldKey: string, archetypeSkinIndex: number) => {
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

        engine.sfxManager.playSound('ui-button-dialog-complete', 'ui');
        engine.startGame(archetypeKey, worldKey, archetypeSkinIndex);
    };
    
    const handleBegin = async () => {
        // This now waits for the audio context to be ready before proceeding.
        await engine.handleUserInteraction();
    
        // These sounds will now play immediately and reliably.
        engine.sfxManager.playSound('ui-button-game-start', 'ui');
        engine.sfxManager.playLoopIfNotPlaying('music');
    
        // Open the dialog.
        if (GAME_CONFIG.QUICK_START.enabled) {
            const { player1Archetype, player1Legacy, player2Archetype, player2Legacy, worldKey } = GAME_CONFIG.QUICK_START;
    
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
            let p1LegacyIndex = 0;
            if (p1ArchetypeData.legacies && p1ArchetypeData.legacies.length > 0) {
                const legacyIndex = p1ArchetypeData.legacies.findIndex(l => l.key === player1Legacy);
                p1LegacyIndex = legacyIndex !== -1 ? legacyIndex : Math.floor(Math.random() * p1ArchetypeData.legacies.length);
            }

            const p2ArchetypeData = ARCHETYPES[finalP2Archetype];
            let p2LegacyIndex = 0;
            if (p2ArchetypeData.legacies && p2ArchetypeData.legacies.length > 0) {
                const legacyIndex = p2ArchetypeData.legacies.findIndex(l => l.key === player2Legacy);
                p2LegacyIndex = legacyIndex !== -1 ? legacyIndex : Math.floor(Math.random() * p2ArchetypeData.legacies.length);
            }
            
            console.log('Calling engine.startGame with:', { finalP1Archetype, finalWorldKey, p1LegacyIndex, finalP2Archetype, p2LegacyIndex });
            engine.startGame(finalP1Archetype, finalWorldKey, p1LegacyIndex, finalP2Archetype, p2LegacyIndex);
        } else {
            // Normal flow: open the archetype selection dialog.
            isStartingGameRef.current = false;
            if (closeDialogTimeoutRef.current) {
                clearTimeout(closeDialogTimeoutRef.current);
            }
            setIsClosingStartDialog(false);
            engine.openArchetypeSelection();
        }
    };

    // ARCHITECTURAL FIX: Check for a fatal error first, regardless of game phase.
    // This provides a robust, top-level error boundary that was previously missing.
    if (engine.error) {
        return <Loader text={engine.error} hasError={true} />;
    }
    
    if (engine.gamePhase === 'loading' || !engine.isInitialized) {
        return <Loader text={engine.loadingMessage} />;
    }

    const showStartDialog = engine.gamePhase === 'archetypeSelection' || isClosingStartDialog;

    if (engine.gamePhase === 'mainMenu' || showStartDialog) {
        return (
            <>
                <MainScreen onBegin={handleBegin} />
                {showStartDialog && (
                    <>
                        <Backdrop isClosing={isClosingStartDialog} />
                        <GameStartDialog
                            onConfirm={handleConfirmStartDialog}
                            onClose={handleCloseStartDialog}
                            isClosing={isClosingStartDialog}
                            playSound={(key: string, channel?: AudioChannel) => engine.sfxManager.playSound(key, channel)}
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
        return <GameScreen key={engine.gameSessionId} engine={engine} />;
    }

    return null; // Fallback for any unhandled game phase
};

export default GameView;