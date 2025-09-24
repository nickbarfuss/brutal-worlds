import { useCallback, useRef, useEffect, useReducer } from 'react';
import {
    Enclave, PendingOrders, GamePhase, GameState, ActiveHighlight, AudioChannel, MaterialProperties, Order, PlayerIdentifier, InspectedMapEntity, Vector3, ConquestEvent
} from '@/types/game';
import { sfxManager, vfxManager } from '@/logic/effects';
import { turnBasedEffects } from '@/features/effects/turn-based/turnBasedEffects';
import { immediateEffects } from '@/features/effects/immediate/immediateEffects';
import { useGameInitializer } from '@/hooks/useGameInitializer';
import { useGameLoop } from '@/hooks/useGameLoop';
import { reducer, initialState, Action } from '@/logic';
import { deserializeResolvedTurn, serializeGameStateForWorker } from '@/utils/threeUtils';
import { calculateAIOrderChanges } from '@/logic/ai';
import { getAssistMultiplierForEnclave } from '@/logic/birthrights';
import { useConnection } from '@/hooks/useConnection';
import { selectConquestDialog } from '@/logic/dialog';


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

export const useGameEngine = () => {
    const { setOnline } = useConnection();
    const [state, dispatch] = useReducer(
        (state: GameState, action: Action) => reducer(state, action, vfxManager, sfxManager),
        initialState
    );
    const workerRef = useRef<Worker | null>(null);
    const aiActionTimeoutsRef = useRef<number[]>([]);
    const gameSessionIdRef = useRef<number>(state.gameSessionId);
    gameSessionIdRef.current = state.gameSessionId;

    const gamePhaseRef = useRef<GamePhase>(state.gamePhase);
    gamePhaseRef.current = state.gamePhase;

    const getState = useCallback(() => state, [state]);

    useEffect(() => {
        if (state.unprocessedTurnEvents) {
            const conquestEvents = state.unprocessedTurnEvents.filter(e => e.type === 'conquest') as ConquestEvent[];
            
            // Clear queues and add new effects
            turnBasedEffects.clear();
            conquestEvents.forEach(event => {
                const enclave = state.enclaveData[event.enclaveId];
                if (enclave) {
                    turnBasedEffects.addEffectsForConquest(event, enclave.center);
                }
            });

            // Handle dialog
            const dialogToPlay = selectConquestDialog(conquestEvents, state);
            if (dialogToPlay) {
                sfxManager.playSound(dialogToPlay.dialogKey, 'dialog', dialogToPlay.position);
                dispatch({ type: 'UPDATE_CONQUEST_DIALOG_STATE', payload: dialogToPlay.conqueror });
            }

            // Clear the processed events
            dispatch({ type: 'CLEAR_UNPROCESSED_TURN_EVENTS' });
        }
    }, [state, dispatch]);

    const resolveTurn = useCallback(() => {
        const latestState = getState();
        console.log('[DEBUG][useGameEngine] resolveTurn called. isResolvingTurn:', latestState.isResolvingTurn, 'workerRef.current:', !!workerRef.current, 'gamePhase:', latestState.gamePhase);
        if (latestState.isResolvingTurn || !workerRef.current || latestState.gamePhase !== 'playing') {
            console.log('[DEBUG][useGameEngine] resolveTurn: Skipping due to conditions.');
            return;
        }
        
        const serializableState = serializeGameStateForWorker({
            enclaveData: latestState.enclaveData,
            playerPendingOrders: latestState.playerPendingOrders,
            aiPendingOrders: latestState.aiPendingOrders,
            routes: latestState.routes,
            mapData: latestState.mapData,
            currentTurn: latestState.currentTurn,
            gameSessionId: latestState.gameSessionId,
            activeEventMarkers: latestState.activeEventMarkers,
            gameConfig: latestState.gameConfig,
            playerArchetypeKey: latestState.playerArchetypeKey,
            playerLegacyKey: latestState.playerLegacyKey,
            opponentArchetypeKey: latestState.opponentArchetypeKey,
            opponentLegacyKey: latestState.opponentLegacyKey,
        });

        workerRef.current.postMessage(JSON.stringify(serializableState));
    }, [dispatch, workerRef, getState]);

    const onFrame = useCallback(() => {
        const { events, isPaused, isResolvingTurn } = getState();
        if (isPaused || isResolvingTurn || events.length === 0) {
            return;
        }
    
        const eventsToPlay = events.filter(event => event.playMode === 'immediate');
    
        if (eventsToPlay.length > 0) {
            eventsToPlay.forEach(event => {
                if (event.sfx) {
                    immediateEffects.play(event.sfx.key, event.sfx.position, 'sfx');
                }
                if (event.vfx && event.position) {
                    event.vfx.forEach(vfxKey => {
                        immediateEffects.play(vfxKey, event.position as Vector3, 'vfx');
                    });
                }
            });
            dispatch({ type: 'REMOVE_EVENTS_FROM_QUEUE', payload: eventsToPlay.map(e => e.id) });
        }
    }, [getState, dispatch]);

    useGameLoop(state, resolveTurn, onFrame);

    const setInitializationState = useCallback((isInitialized, message, error) => {
        dispatch({ type: 'SET_INITIALIZATION_STATE', payload: { isInitialized, message, error } });
    }, []);

    const setGamePhase = useCallback((phase: GamePhase) => {
        console.log('[DEBUG][useGameEngine] setGamePhase called with phase:', phase);
        dispatch({ type: 'SET_GAME_PHASE', payload: phase });
    }, []);
    const startGame = useCallback((playerArchetypeKey: string, worldKey: string, playerLegacyKey: string, opponentArchetypeKey?: string, opponentLegacyKey?: string) => {
        console.log('[DEBUG][useGameEngine] startGame called with payload:', { playerArchetypeKey, worldKey, playerLegacyKey, opponentArchetypeKey, opponentLegacyKey });
        vfxManager.reset();
        dispatch({ type: 'START_GAME', payload: { playerArchetypeKey, worldKey, playerLegacyKey, opponentArchetypeKey, opponentLegacyKey } });
    }, []);

    const completeIntro = useCallback(() => dispatch({ type: 'COMPLETE_INTRO' }), []);

    const resetGame = useCallback(() => {
        sfxManager.reset();
        dispatch({ type: 'RESET_GAME' });
    }, []);
    const togglePause = useCallback(() => dispatch({ type: 'TOGGLE_PAUSE' }), []);
    const goToMainMenu = useCallback(() => {
        sfxManager.reset();
        dispatch({ type: 'GO_TO_MAIN_MENU' });
    }, []);

    const handleUserInteraction = useCallback(async () => {
        await sfxManager.handleUserInteraction();
        if (sfxManager) {
            const latestState = state; // Use state directly
            (Object.keys(latestState.volumes) as AudioChannel[]).forEach(channel => {
                const isMuted = latestState.isGloballyMuted || latestState.mutedChannels[channel];
                const volume = latestState.volumes[channel];
                sfxManager.setVolume(channel, isMuted ? 0 : volume);
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
            const worker = new Worker(new URL('../logic/game/turnResolver.ts', import.meta.url), {
                type: 'module'
            });
            workerRef.current = worker;

            const handleMessage = (e: MessageEvent) => {
                console.log('[DEBUG][useGameEngine] Worker message received:', e.data);
                try {
                    const result = JSON.parse(e.data);

                    if (result.error) {
                        console.error('[DEBUG][useGameEngine] Worker Error:', result.error);
                        console.error('[DEBUG][useGameEngine] Worker Error:', result.error);
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
        if (state.latestEvent) {
            const timerId = setTimeout(() => {
                dispatch({ type: 'CLEAR_LATEST_EVENT' });
            }, 5100);

            return () => clearTimeout(timerId);
        }
    }, [state.latestEvent, dispatch]);
    
    useGameInitializer(startGame, setGamePhase, setInitializationState);
    
    useEffect(() => {
        if (sfxManager) {
            (Object.keys(state.volumes) as AudioChannel[]).forEach(channel => {
                const isMuted = state.isGloballyMuted || state.mutedChannels[channel];
                const volume = state.volumes[channel];
                sfxManager.setVolume(channel, isMuted ? 0 : volume);
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
        const sfx = sfxManager;
        if (state.gamePhase === 'playing' && state.currentTurn >= 1 && !state.isPaused) {
            if (sfx.isReady() && !sfx.hasLoop('ambient')) {
                sfx.playRandomLoop('ambient');
            }
        } else {
            sfx.stopLoop('ambient');
        }
    }, [state.gamePhase, state.currentTurn, state.isPaused]);
    
    useEffect(() => {
        const musicManager = sfxManager;
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

    const clearLatestEvent = useCallback(() => dispatch({ type: 'CLEAR_LATEST_EVENT' }), []);
    const triggerEvent = useCallback((key: string) => dispatch({ type: 'TRIGGER_EVENT', payload: key }), []);
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
        vfxManager,
        sfxManager,
        setGamePhase,
        startGame,
        completeIntro,
        resetGame,
        openArchetypeSelection: () => setGamePhase('archetypeSelection'),
        closeArchetypeSelection: () => setGamePhase('mainMenu'),
        goToMainMenu,
        togglePause,
        clearLatestEvent,
        triggerEvent,
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