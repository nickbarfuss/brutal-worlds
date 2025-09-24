import React, { useState, useRef, useEffect } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useConnection } from '@/hooks/useConnection';
import Loader from '@/components/features/system/Loader';
import GameStartDialog from '@/components/features/setup/GameStartDialog';
import MainMenuScreen from '@/screens/MainMenuScreen';
import GameScreen from '@/screens/GameScreen';
import Backdrop from '@/components/ui/Backdrop';
import OfflineOverlay from '@/components/features/system/OfflineOverlay';
import { AudioChannel } from '@/types/game';
import { CONFIG } from '@/data/config';
import { ARCHETYPES } from '@/data/archetypes';
import { WORLD_LIBRARY, getWorldByKey } from '@/data/worlds';

const App: React.FC = () => {
    const { isOnline } = useConnection();
    const engine = useGameEngine();
    const [isClosingStartDialog, setIsClosingStartDialog] = useState(false);
    const closeDialogTimeoutRef = useRef<number | null>(null);
    const [isStartingGame, setIsStartingGame] = useState(false);

    useEffect(() => {
        return () => {
            if (closeDialogTimeoutRef.current) {
                clearTimeout(closeDialogTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (engine.gamePhase === 'playing' || engine.gamePhase === 'mainMenu') {
            setIsStartingGame(false);
        }
    }, [engine.gamePhase]);

    const handleCloseStartDialog = () => {
        if (engine.gamePhase === 'playing' || (isStartingGame && engine.gamePhase !== 'archetypeSelection')) {
            console.warn('[App] handleCloseStartDialog: Ignoring close request as game is already starting or playing.');
            return;
        }

        if (isStartingGame) {
            setIsStartingGame(false);
            engine.goToMainMenu();
        }

        setIsClosingStartDialog(true);
        if (closeDialogTimeoutRef.current) clearTimeout(closeDialogTimeoutRef.current);
        closeDialogTimeoutRef.current = window.setTimeout(() => {
            engine.closeArchetypeSelection();
            setIsClosingStartDialog(false);
        }, 300); 
    };

    const handleConfirmStartDialog = (archetypeKey: string, worldKey: string, selectedLegacyKey: string) => {
        setIsStartingGame(true);
        
        if (closeDialogTimeoutRef.current) {
            clearTimeout(closeDialogTimeoutRef.current);
        }
        
        setIsClosingStartDialog(false);

        engine.sfxManager.playSound('ui-common-buttonDialogComplete', 'ui');
        engine.startGame(archetypeKey, worldKey, selectedLegacyKey);
    };
    
    const handleBegin = async () => {
        
        if (isStartingGame) return;
        setIsStartingGame(true);

        await engine.handleUserInteraction();
    
        engine.sfxManager.playSound('ui-common-buttonGameStart', 'ui');
    
        if (CONFIG.QUICK_START.enabled) {
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
        } else {
            if (closeDialogTimeoutRef.current) {
                clearTimeout(closeDialogTimeoutRef.current);
            }
            setIsClosingStartDialog(false);
            engine.openArchetypeSelection();
        }
        
    };

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
    
    if (engine.gamePhase === 'playing' || engine.gamePhase === 'gameOver') {
        return <GameScreen key={engine.gameSessionId} engine={engine} />;
    }

    return null;
};

export default App;