import { useCallback, useRef, useEffect, useReducer } from 'react';
import * as THREE from 'three';
import {
    Enclave, PendingOrders, GamePhase, GameState, ActiveHighlight, AudioChannel, MaterialProperties, Order, Vector3, EffectQueueItem, PlayerIdentifier, InspectedMapEntity
} from '@/types/game';
import { WorldCanvasHandle } from '@/features/world/WorldCanvas';
import { VfxManager } from '@/logic/VfxManager';
import { SfxManager } from '@/logic/SfxManager';
import { useGameInitializer } from '@/hooks/useGameInitializer';
import { useGameLoop } from '@/hooks/useGameLoop';
import { reducer as gameReducer, initialState } from '@/logic/reducers';
import { deserializeResolvedTurn, serializeGameStateForWorker } from '@/utils/threeUtils';
import { calculateAIOrderChanges } from '@/logic/ai';
import { getAssistMultiplierForEnclave } from '@/logic/birthrightManager.ts';
import { v4 as uuidv4 } from 'uuid';
import { useConnection } from '@/hooks/useConnection';


const getInvalidPlayerAssistOrders = (
    playerPendingOrders: PendingOrders,
    enclaveData: { [id: number]: Enclave }
): number[] => {
    const ordersToCancel: number[] = [];

    for (const fromIdStr in playerPendingOrders) {
        const fromId = parseInt(fromIdStr, 10);
        const order = playerPendingOrders[fromId];
        const fromEnclave = enclaveData[fromId];

        if (order.type === 'assist' && fromEnclave && fromEnclave.owner === 'player-1') {
            const assistMultiplier = getAssistMultiplierForEnclave(fromEnclave);
            const safeForces = Number.isFinite(fromEnclave.forces) ? fromEnclave.forces : 0;
            const forceToSend = Math.ceil(safeForces * assistMultiplier);
            if (safeForces - forceToSend <= 0) {
                ordersToCancel.push(fromId);
            }
        }
    }
    return ordersToCancel;
};

export const useGameEngine = (worldCanvasHandle: React.RefObject<WorldCanvasHandle | null>) => {
    const { setOnline } = useConnection();
    const vfxManager = useRef(new VfxManager());
    const sfxManager = useRef(new SfxManager());
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const workerRef = useRef<Worker | null>(null);
    const aiActionTimeoutsRef = useRef<number[]>([]);
    const stateRef = useRef<GameState>(state); // New: Ref to hold the latest state
    const playedEffectIdsRef = useRef<Set<string>>(new Set()); // New: To track played effects per turn
    
    // Update stateRef on every render
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const gameSessionIdRef = useRef<number>(state.gameSessionId);
    gameSessionIdRef.current = state.gameSessionId;

    const gamePhaseRef = useRef<GamePhase>(state.gamePhase);
    gamePhaseRef.current = state.gamePhase;

    const getState = useCallback(() => state, [state]); // New: Function to get the latest state

    // Reset playedEffectIdsRef when a new turn starts
    useEffect(() => {
        playedEffectIdsRef.current.clear();
    }, [state.currentTurn]);

    


    // --- State-dispatching callbacks ---
    const setInitializationState = useCallback((isInitialized, message, error) => {
        dispatch({ type: 'SET_INITIALIZATION_STATE', payload: { isInitialized, message, error } });
    }, []);

    const setGamePhase = useCallback((phase: GamePhase) => dispatch({ type: 'SET_GAME_PHASE', payload: phase }), []);
    const startGame = useCallback((playerArchetypeKey: string, worldKey: string, playerLegacyKey: string, opponentArchetypeKey?: string, opponentLegacyKey?: string) => {
        vfxManager.current.reset();
        dispatch({ type: 'START_GAME', payload: { playerArchetypeKey, worldKey, playerLegacyKey, opponentArchetypeKey, opponentLegacyKey } });
    }, []);

    const completeIntro = useCallback(() => dispatch({ type: 'COMPLETE_INTRO' }), []);

    const resetGame = useCallback(() => {
        sfxManager.current.reset();
        dispatch({ type: 'RESET_GAME' });
    }, []);
    const togglePause = useCallback(() => dispatch({ type: 'TOGGLE_PAUSE' }), []);
    const goToMainMenu = useCallback(() => {
        sfxManager.current.reset();
        dispatch({ type: 'GO_TO_MAIN_MENU' });
    }, []);

    const handleUserInteraction = useCallback(async () => {
        await sfxManager.current.handleUserInteraction();
        // Now that the audio context is confirmed to be ready, immediately apply the
        // current volume and mute state to prevent race conditions on startup.
        if (sfxManager.current) {
            const latestState = stateRef.current;
            (Object.keys(latestState.volumes) as AudioChannel[]).forEach(channel => {
                const isMuted = latestState.isGloballyMuted || latestState.mutedChannels[channel];
                const volume = latestState.volumes[channel];
                sfxManager.current.setVolume(channel, isMuted ? 0 : volume);
            });
        }
    }, []);

    // Effect to schedule AI actions for the current turn with human-like delays.
    useEffect(() => {
        const cleanup = () => {
            aiActionTimeoutsRef.current.forEach(clearTimeout);
            aiActionTimeoutsRef.current = [];
        };

        // AI should only schedule actions if the game is playing, not paused, and not resolving a turn.
        // The timeouts should only be cleared if the game phase changes or the turn is 0.
        if (state.gamePhase !== 'playing' || state.isPaused || state.currentTurn === 0) {
            cleanup(); // Clear timeouts if game is not playing, paused, or turn 0
            
            return;
        }

        // If the turn is resolving, AI should not schedule new actions, but existing timeouts should not be cleared.
        if (state.isResolvingTurn) {
            
            return;
        }

        
        const { newOrders, ordersToCancel } = calculateAIOrderChanges(state.enclaveData, state.routes, state.aiPendingOrders);
        
        
        const timeouts: number[] = [];

        ordersToCancel.forEach(fromId => {
            const delay = Math.random() * (state.gameConfig.TURN_DURATION - 2) * 1000 + 1000;
            const timeoutId = window.setTimeout(() => {
                dispatch({ type: 'AI_CANCEL_ORDER', payload: { fromId } });
            }, delay);
            timeouts.push(timeoutId);
        });

        Object.entries(newOrders).forEach(([fromIdStr, order]) => {
            const fromId = parseInt(fromIdStr, 10);
            const delay = Math.random() * (state.gameConfig.TURN_DURATION - 2) * 1000 + 1000;

            const timeoutId = window.setTimeout(() => {
                
                dispatch({ type: 'AI_ISSUE_ORDER', payload: { fromId, order: order as Order } });
            }, delay);
            timeouts.push(timeoutId);
        });

        aiActionTimeoutsRef.current = timeouts;

        return cleanup;
    }, [state.currentTurn, state.isPaused, state.gamePhase, state.isResolvingTurn, state.enclaveData, state.routes, state.aiPendingOrders, state.gameConfig.TURN_DURATION]);

    // This effect runs whenever the game state changes, ensuring player assist orders
    // are automatically canceled if they become invalid (e.g., due to force changes).
    useEffect(() => {
        if (state.gamePhase !== 'playing' || state.isPaused || state.isResolvingTurn) {
            return;
        }
    
        const invalidOrderIds = getInvalidPlayerAssistOrders(state.playerPendingOrders, state.enclaveData);
    
        if (invalidOrderIds.length > 0) {
            dispatch({ type: 'PLAYER_CANCEL_ORDERS', payload: invalidOrderIds });
        }
    }, [state.enclaveData, state.playerPendingOrders, state.gamePhase, state.isPaused, state.isResolvingTurn]);
    
    useEffect(() => {
        try {
            const worker = new Worker(new URL('../logic/turnResolver.ts', import.meta.url), {
                type: 'module'
            });
            workerRef.current = worker;

            const handleMessage = (e: MessageEvent) => {
                try {
                    const result = JSON.parse(e.data);

                    if (result.error) {
                        console.error("Worker Error:", result.error);
                        dispatch({ type: 'SET_INITIALIZATION_STATE', payload: { isInitialized: true, message: '', error: result.error } });
                        return;
                    }
                    
                    if (result.gameSessionId !== gameSessionIdRef.current || gamePhaseRef.current !== 'playing') {
                        console.log(`Ignoring stale/irrelevant turn result from session ${result.gameSessionId} (current is ${gameSessionIdRef.current}, phase is ${gamePhaseRef.current})`);
                        return;
                    }

                    const deserializedResult = deserializeResolvedTurn(result);
                    
                    dispatch({ type: 'APPLY_RESOLVED_TURN', payload: deserializedResult });

                    
                } catch (error) {
                    console.error("Error processing message from worker:", error, "Data:", e.data);
                    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while processing the turn.";
                    dispatch({ type: 'SET_INITIALIZATION_STATE', payload: { isInitialized: true, message: '', error: `Could not process turn result: ${errorMessage}` } });
                }
            };

            worker.addEventListener('message', handleMessage);
            
            worker.onerror = (e: ErrorEvent) => {
                console.error("A fatal worker error occurred:", e);
                setOnline(false);
                let errorMessage = 'A fatal error occurred in the background process.';
                if (e && e.message) {
                    errorMessage = `${e.message} (at ${e.filename}:${e.lineno})`;
                } else if (e && e.error && e.error.message) {
                    errorMessage = e.error.message;
                }
                dispatch({
                    type: 'SET_INITIALIZATION_STATE',
                    payload: { isInitialized: true, message: '', error: errorMessage },
                });
            };
        
            return () => {
              workerRef.current?.terminate();
              workerRef.current = null;
            };
        } catch (error) {
            console.error("Failed to create Web Worker:", error);
            setOnline(false);
            dispatch({
                type: 'SET_INITIALIZATION_STATE',
                payload: { isInitialized: true, message: '', error: `Failed to initialize game: ${error instanceof Error ? error.message : 'Unknown error'}` },
            });
        }
      }, [setOnline]);

    useEffect(() => {
        if (state.latestEffect) {
            const timerId = setTimeout(() => {
                dispatch({ type: 'CLEAR_LATEST_EFFECT' });
            }, 5100);

            return () => clearTimeout(timerId);
        }
    }, [state.latestEffect, dispatch]);

    const resolveTurn = useCallback(() => { // No longer accepts latestState as argument
        const latestState = getState(); // Get the latest state
        if (latestState.isResolvingTurn || !workerRef.current) return;
    
        dispatch({ type: 'START_RESOLVING_TURN' });
        
        
        
        const serializableState = serializeGameStateForWorker({
            enclaveData: latestState.enclaveData,
            playerPendingOrders: latestState.playerPendingOrders,
            aiPendingOrders: latestState.aiPendingOrders, // Use latestState
            routes: latestState.routes,
            mapData: latestState.mapData,
            currentTurn: latestState.currentTurn,
            gameSessionId: latestState.gameSessionId,
            activeEffectMarkers: latestState.activeEffectMarkers,
            gameConfig: latestState.gameConfig,
            playerArchetypeKey: latestState.playerArchetypeKey,
            playerLegacyKey: latestState.playerLegacyKey,
            opponentArchetypeKey: latestState.opponentArchetypeKey,
            opponentLegacyKey: latestState.opponentLegacyKey,
            playerHasHadFirstConquestDialog: latestState.playerHasHadFirstConquestDialog,
            opponentHasHadFirstConquestDialog: latestState.opponentHasHadFirstConquestDialog,
        });

        workerRef.current.postMessage(JSON.stringify(serializableState));
    }, [
        dispatch,
        workerRef,
        getState, // Add getState to dependencies
    ]);
    
    const clearLatestEffect = useCallback(() => dispatch({ type: 'CLEAR_LATEST_EFFECT' }), []);
    
    const triggerEffect = useCallback((key: string) => {
        dispatch({ type: 'TRIGGER_EFFECT', payload: key });
    }, []);
    
    const setHoveredCellId = useCallback((id: number) => dispatch({ type: 'SET_HOVERED_CELL', payload: id }), []);
    const handleMapClick = useCallback((cellId: number | null, isCtrlPressed: boolean) => {
        dispatch({ type: 'HANDLE_MAP_CLICK', payload: { cellId, isCtrlPressed } });
    }, []);
    const handleEnclaveDblClick = useCallback((enclaveId: number | null) => dispatch({ type: 'HANDLE_DBL_CLICK', payload: enclaveId }), []);
    const focusOnEnclave = useCallback((id: number) => dispatch({ type: 'FOCUS_ON_ENCLAVE', payload: id }), []);
    const focusOnVector = useCallback((vector: Vector3) => dispatch({ type: 'FOCUS_ON_VECTOR', payload: vector }), []);
    const setInspectedArchetypeOwner = useCallback((owner: PlayerIdentifier | null) => dispatch({ type: 'SET_INSPECTED_ARCHETYPE_OWNER', payload: owner }), []);
    const setInspectedMapEntity = useCallback((entity: InspectedMapEntity | { type: 'world' } | null) => dispatch({ type: 'SET_INSPECTED_MAP_ENTITY', payload: entity }), []);
    const setWorldInspectorManuallyClosed = useCallback((isClosed: boolean) => dispatch({ type: 'SET_WORLD_INSPECTOR_MANUALLY_CLOSED', payload: isClosed }), []);
    const setActiveHighlight = useCallback((highlight: ActiveHighlight | null) => dispatch({ type: 'SET_ACTIVE_HIGHLIGHT', payload: highlight }), []);
    const toggleSettingsDrawer = useCallback(() => dispatch({ type: 'TOGGLE_SETTINGS_DRAWER' }), []);
    
    const toggleGlobalMute = useCallback(() => dispatch({ type: 'TOGGLE_GLOBAL_MUTE' }), []);
    const setVolume = useCallback((channel: AudioChannel, volume: number) => {
        dispatch({ type: 'SET_VOLUME', payload: { channel, volume } });
    }, []);
    const toggleMuteChannel = useCallback((channel: AudioChannel) => {
        dispatch({ type: 'TOGGLE_MUTE_CHANNEL', payload: channel });
    }, []);

    const setBloomEnabled = useCallback((enabled: boolean) => dispatch({ type: 'SET_BLOOM_ENABLED', payload: enabled }), []);
    const setBloomValue = useCallback((key: 'threshold' | 'strength' | 'radius', value: number) => {
        dispatch({ type: 'SET_BLOOM_VALUE', payload: { key, value } });
    }, []);
    const setMaterialValue = useCallback((type: keyof GameState['materialSettings'], key: keyof MaterialProperties, value: number) => {
        dispatch({ type: 'SET_MATERIAL_VALUE', payload: { type, key, value } });
    }, []);
    const setAmbientLightIntensity = useCallback((value: number) => {
        dispatch({ type: 'SET_AMBIENT_LIGHT_INTENSITY', payload: value });
    }, []);
    const setTonemappingStrength = useCallback((value: number) => {
        dispatch({ type: 'SET_TONEMAPPING_STRENGTH', payload: value });
    }, []);
    
    
    const playPendingEffects = useCallback(() => {
        if (!worldCanvasHandle.current || !worldCanvasHandle.current.camera || stateRef.current.pendingEffects.length === 0) return;

        const camera = worldCanvasHandle.current.camera;
        const frustum = new THREE.Frustum();
        const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(matrix);

        const effectsToPlayThisFrame: EffectQueueItem[] = [];

        stateRef.current.pendingEffects.forEach(effect => {
            if (!playedEffectIdsRef.current.has(effect.id) && effect.position && frustum.containsPoint(effect.position)) {
                effectsToPlayThisFrame.push(effect);
                playedEffectIdsRef.current.add(effect.id);
            }
        });

        if (effectsToPlayThisFrame.length > 0) {
            // Staggered audio playback
            effectsToPlayThisFrame.forEach((effect, index) => {
                setTimeout(() => {
                    if (effect.vfx && effect.position) {
                        const vfxItems = Array.isArray(effect.vfx) ? effect.vfx : [effect.vfx];
                        vfxItems.forEach(v => {
                            const key = typeof v === 'string' ? v : v.key;
                            if (key) {
                                vfxManager.current.playEffect(key, effect.position as THREE.Vector3);
                            }
                        });
                    }
                    if (effect.sfx) {
                        sfxManager.current.playSound(effect.sfx.key, effect.sfx.channel, effect.sfx.position);
                    }
                }, index * 100); // 100ms delay between each effect's audio
            });
        }
    }, [worldCanvasHandle, vfxManager, sfxManager]);

    useGameLoop(state.isPaused, state.gamePhase, state.isResolvingTurn, state.currentWorld, state.currentTurn, resolveTurn, state.isIntroComplete, playPendingEffects);
    useGameInitializer(vfxManager, sfxManager, startGame, setGamePhase, setInitializationState);
    
    useEffect(() => {
        if (sfxManager.current) {
            (Object.keys(state.volumes) as AudioChannel[]).forEach(channel => {
                const isMuted = state.isGloballyMuted || state.mutedChannels[channel];
                const volume = state.volumes[channel];
                sfxManager.current.setVolume(channel, isMuted ? 0 : volume);
            });
        }
    }, [state.volumes, state.mutedChannels, state.isGloballyMuted]);

    

    // Effect to process the effectQueue (for newly triggered effects)
    useEffect(() => {
        if (state.effectQueue.length > 0) {
            const playedEffectIds: string[] = [];
            state.effectQueue.forEach(effect => {
                if (effect.vfx && effect.position) {
                    const vfxItems = Array.isArray(effect.vfx) ? effect.vfx : [effect.vfx];
                    vfxItems.forEach(v => {
                        const key = typeof v === 'string' ? v : v.key;
                        if (key) {
                            vfxManager.current.playEffect(key, effect.position as THREE.Vector3);
                        }
                    });
                }
                if (effect.sfx) {
                    sfxManager.current.playSound(effect.sfx.key, effect.sfx.channel, effect.sfx.position);
                }
                playedEffectIds.push(effect.id); // Collect IDs of played effects
            });
            // Dispatch action to remove played effects from the queue
            if (playedEffectIds.length > 0) {
                dispatch({ type: 'PROCESS_EFFECT_QUEUE', payload: { playedIds: playedEffectIds } });
            }
        }
    }, [state.effectQueue, dispatch]);

    useEffect(() => {
        if (state.isIntroComplete && state.gamePhase === 'playing' && state.currentTurn === 0) {
            const timer = setTimeout(() => {
                dispatch({ type: 'START_FIRST_TURN' });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [state.isIntroComplete, state.gamePhase, state.currentTurn]);

    useEffect(() => {
        const sfx = sfxManager.current;
        if (state.gamePhase === 'playing' && state.currentTurn >= 1 && !state.isPaused) {
            if (sfx.isReady() && !sfx.hasLoop('ambient')) {
                sfx.playRandomLoop('ambient');
            }
        } else {
            sfx.stopLoop('ambient');
        }
    }, [state.gamePhase, state.currentTurn, state.isPaused]);
    
    useEffect(() => {
        const musicManager = sfxManager.current;
        const phase = state.gamePhase;
    
        const shouldPlayMusic = (
            phase === 'mainMenu' || 
            phase === 'archetypeSelection' ||
            phase === 'playing'
        );
    
        if (shouldPlayMusic && musicManager.isReady() && !musicManager.hasLoop('music')) {
            musicManager.playRandomLoop('music');
        } else if (!shouldPlayMusic) {
            musicManager.stopLoop('music');
        }
    }, [state.gamePhase]);

    // Effect for command mode sounds and VFX
    const prevSelectedEnclaveId = useRef<number | null>(null);
    useEffect(() => {
        const sfx = sfxManager.current;

        if (state.selectedEnclaveId !== prevSelectedEnclaveId.current) {
            if (state.selectedEnclaveId !== null) {
                // Entering command mode
                sfx.playSound('order-commandMode-sfx-enter', 'ui');
            } else if (prevSelectedEnclaveId.current !== null) {
                // Exiting command mode
                sfx.playSound('order-commandMode-sfx-exit', 'ui');
            }
            prevSelectedEnclaveId.current = state.selectedEnclaveId;
        }
    }, [state.selectedEnclaveId]);

    


    return {
        ...state,
        dispatch,
        vfxManager: vfxManager.current,
        sfxManager: sfxManager.current,
        setGamePhase,
        startGame,
        completeIntro,
        resetGame,
        openArchetypeSelection: () => setGamePhase('archetypeSelection'),
        closeArchetypeSelection: () => setGamePhase('mainMenu'),
        goToMainMenu,
        togglePause,
        clearLatestEffect,
        triggerEffect,
        setHoveredCellId,
        handleMapClick,
        handleEnclaveDblClick,
        focusOnEnclave,
        focusOnVector,
        setInspectedArchetypeOwner,
        setInspectedMapEntity,
        setWorldInspectorManuallyClosed,
        setActiveHighlight,
        toggleSettingsDrawer,
        toggleGlobalMute,
        setVolume,
        toggleMuteChannel,
        handleUserInteraction, // Export the new centralized function
        setBloomEnabled,
        setBloomValue,
        setMaterialValue,
        setAmbientLightIntensity,
        setTonemappingStrength,
        
        getState, // New: Export getState
    };
};