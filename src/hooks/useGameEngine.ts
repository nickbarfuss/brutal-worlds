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
    const playedEffectIdsRef = useRef<Set<string>>(new Set());
    const gameSessionIdRef = useRef<number>(state.gameSessionId);
    gameSessionIdRef.current = state.gameSessionId;

    const gamePhaseRef = useRef<GamePhase>(state.gamePhase);
    gamePhaseRef.current = state.gamePhase;

    const getState = useCallback(() => state, [state]);

    useEffect(() => {
        playedEffectIdsRef.current.clear();
    }, [state.currentTurn]);

    useEffect(() => {
        if (state.immediateEffects.length > 0) {
            state.immediateEffects.forEach(effect => {
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
            });
            dispatch({ type: 'CLEAR_IMMEDIATE_EFFECTS' });
        }
    }, [state.immediateEffects, dispatch, vfxManager, sfxManager]);

    const processEffects = useCallback((currentState: GameState) => {
        if (currentState.effects.length === 0) {
            return;
        }

        const effectsToProcess = currentState.effects;
        const sfxToPlay: { [channel: string]: EffectQueueItem['sfx'] } = {};
        const vfxToPlay: { key: string; position: THREE.Vector3 }[] = [];
        const effectIdsToRemove = new Set<string>();

        effectsToProcess.forEach(effect => {
            let canPlay = false;
            if (worldCanvasHandle.current && worldCanvasHandle.current.camera) {
                const camera = worldCanvasHandle.current.camera;
                camera.updateMatrixWorld();
                const frustum = new THREE.Frustum();
                const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                frustum.setFromProjectionMatrix(matrix);
                if (effect.position && frustum.containsPoint(effect.position)) {
                    canPlay = true;
                }
            }

            if (canPlay) {
                if (!playedEffectIdsRef.current.has(effect.id)) {
                    if (effect.vfx && effect.position) {
                        const vfxItems = Array.isArray(effect.vfx) ? effect.vfx : [effect.vfx];
                        vfxItems.forEach(v => {
                            const key = typeof v === 'string' ? v : v.key;
                            if (key) {
                                vfxToPlay.push({ key, position: effect.position as THREE.Vector3 });
                            }
                        });
                    }
                    if (effect.sfx) {
                        sfxToPlay[effect.sfx.channel] = effect.sfx;
                    }
                    playedEffectIdsRef.current.add(effect.id);
                }
                effectIdsToRemove.add(effect.id);
            }
        });

        if (vfxToPlay.length > 0) {
            vfxToPlay.forEach(vfx => vfxManager.current.playEffect(vfx.key, vfx.position));
        }

        if (Object.keys(sfxToPlay).length > 0) {
            Object.values(sfxToPlay).forEach(sfx => {
                if (sfx) {
                    sfxManager.current.playSound(sfx.key, sfx.channel, sfx.position);
                }
            });
        }

        if (effectIdsToRemove.size > 0) {
            dispatch({ type: 'REMOVE_EFFECTS', payload: Array.from(effectIdsToRemove) });
        }
    }, [worldCanvasHandle, vfxManager, sfxManager, dispatch]);

    const resolveTurn = useCallback(() => {
        const latestState = getState();
        if (latestState.isResolvingTurn || !workerRef.current) return;
    
        dispatch({ type: 'START_RESOLVING_TURN' });
        
        const serializableState = serializeGameStateForWorker({
            enclaveData: latestState.enclaveData,
            playerPendingOrders: latestState.playerPendingOrders,
            aiPendingOrders: latestState.aiPendingOrders,
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
    }, [dispatch, workerRef, getState]);

    useGameLoop(state, resolveTurn, processEffects);

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
        if (sfxManager.current) {
            const latestState = state; // Use state directly
            (Object.keys(latestState.volumes) as AudioChannel[]).forEach(channel => {
                const isMuted = latestState.isGloballyMuted || latestState.mutedChannels[channel];
                const volume = latestState.volumes[channel];
                sfxManager.current.setVolume(channel, isMuted ? 0 : volume);
            });
        }
    }, [state]); // Add state to dependency array    

    useEffect(() => {
        const cleanup = () => {
            aiActionTimeoutsRef.current.forEach(clearTimeout);
            aiActionTimeoutsRef.current = [];
        };

        if (state.gamePhase !== 'playing' || state.isPaused || state.currentTurn === 0) {
            cleanup();
            return;
        }

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

    const clearLatestEffect = useCallback(() => dispatch({ type: 'CLEAR_LATEST_EFFECT' }), []);
    const triggerEffect = useCallback((key: string) => dispatch({ type: 'TRIGGER_EFFECT', payload: key }), []);
    const setHoveredCellId = useCallback((id: number) => dispatch({ type: 'SET_HOVERED_CELL', payload: id }), []);
    const handleMapClick = useCallback((cellId: number | null, isCtrlPressed: boolean) => dispatch({ type: 'HANDLE_MAP_CLICK', payload: { cellId, isCtrlPressed } }), []);
    const handleEnclaveDblClick = useCallback((enclaveId: number | null) => dispatch({ type: 'HANDLE_DBL_CLICK', payload: enclaveId }), []);

    const focusOnEnclave = useCallback((id: number) => dispatch({ type: 'FOCUS_ON_ENCLAVE', payload: id }), []);
    const focusOnVector = useCallback((vector: Vector3) => dispatch({ type: 'FOCUS_ON_VECTOR', payload: vector }), []);
    const setInspectedArchetypeOwner = useCallback((owner: PlayerIdentifier | null) => dispatch({ type: 'SET_INSPECTED_ARCHETYPE_OWNER', payload: owner }), []);
    const setInspectedMapEntity = useCallback((entity: InspectedMapEntity | { type: 'world' } | null) => dispatch({ type: 'SET_INSPECTED_MAP_ENTITY', payload: entity }), []);
    const setWorldInspectorManuallyClosed = useCallback((isClosed: boolean) => dispatch({ type: 'SET_WORLD_INSPECTOR_MANUALLY_CLOSED', payload: isClosed }), []);
    const setActiveHighlight = useCallback((highlight: ActiveHighlight | null) => dispatch({ type: 'SET_ACTIVE_HIGHLIGHT', payload: highlight }), []);
    const toggleSettingsDrawer = useCallback(() => dispatch({ type: 'TOGGLE_SETTINGS_DRAWER' }), []);
    const toggleGlobalMute = useCallback(() => dispatch({ type: 'TOGGLE_GLOBAL_MUTE' }), []);
    const setVolume = useCallback((channel: AudioChannel, volume: number) => dispatch({ type: 'SET_VOLUME', payload: { channel, volume } }), []);
    const toggleMuteChannel = useCallback((channel: AudioChannel) => dispatch({ type: 'TOGGLE_MUTE_CHANNEL', payload: channel }), []);
    const setBloomEnabled = useCallback((enabled: boolean) => dispatch({ type: 'SET_BLOOM_ENABLED', payload: enabled }), []);
    const setBloomValue = useCallback((key: 'threshold' | 'strength' | 'radius', value: number) => dispatch({ type: 'SET_BLOOM_VALUE', payload: { key, value } }), []);
    const setMaterialValue = useCallback((type: keyof GameState['materialSettings'], key: keyof MaterialProperties, value: number) => dispatch({ type: 'SET_MATERIAL_VALUE', payload: { type, key, value } }), []);
    const setAmbientLightIntensity = useCallback((value: number) => dispatch({ type: 'SET_AMBIENT_LIGHT_INTENSITY', payload: value }), []);
    const setTonemappingStrength = useCallback((value: number) => dispatch({ type: 'SET_TONEMAPPING_STRENGTH', payload: value }), []);

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
        handleUserInteraction,
        setBloomEnabled,
        setBloomValue,
        setMaterialValue,
        setAmbientLightIntensity,
        setTonemappingStrength,
        getState,
    };
};