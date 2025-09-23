import { GameState, Enclave, EventQueueItem } from '@/types/game';
import { Action } from '@/logic';
import { v4 as uuidv4 } from 'uuid';
import { EVENT_PROFILES } from '@/data/events';
import { triggerNewEvent as triggerEventLogic } from "@/logic/events";
import { SfxManager, vfxManager, VfxManager } from '@/logic/effects';
import { immediateEffects } from '@/features/effects/immediate/immediateEffects';

export const handleTurnLogic = (state: GameState, action: Action, _vfxManager?: VfxManager, sfxManager?: SfxManager): GameState => {
    switch (action.type) {
        case 'START_FIRST_TURN': {
            const disasterConfig = state.gameConfig.DISASTER_TESTING;
            const updates: Partial<GameState> & { events?: EventQueueItem[] } = {
                currentTurn: 1,
                isPaused: false,
            };

            if (disasterConfig?.enabled && disasterConfig.triggerOnTurn === 1) {
                const disasterProfile = EVENT_PROFILES[disasterConfig.disasterKey];
                if (!disasterProfile) {
                    console.error(`Disaster profile not found for key: ${disasterConfig.disasterKey}`);
                    return { ...state, ...updates };
                }
                const result = triggerEventLogic(disasterProfile, {
                    enclaveData: state.enclaveData,
                    domainData: state.domainData,
                    mapData: state.mapData,
                    expanseData: state.expanseData,
                    riftData: state.riftData,
                });

                if (result) {
                    if (result.newMarkers) updates.activeEventMarkers = [...state.activeEventMarkers, ...result.newMarkers];
                    if (result.snackbarData) updates.latestEvent = result.snackbarData;
                }
            }
            return { ...state, ...updates };
        }

        case 'START_RESOLVING_TURN': {
            return {
                ...state,
                isResolvingTurn: true,
            };
        }

        case 'APPLY_RESOLVED_TURN': {
            const { 
                newEnclaveData, 
                newPlayerPendingOrders, 
                newAiPendingOrders, 
                newRoutes, 
                newCurrentTurn, 
                newEffectMarkers, 
                gameOverState, 
                events,
                effectsToPlay, // From disasters
            } = action.payload;
            
            const allEvents = [...(effectsToPlay || [])].map(event => ({ ...event, id: event.id || uuidv4() }));

            Object.values(newEnclaveData).forEach((enclave: Enclave) => {
                if (enclave.activeEvents) {
                    enclave.activeEvents.forEach(event => {
                         const profile = EVENT_PROFILES[event.profileKey];
                         if (profile) {
                            if (event.phase === 'impact' && profile.logic.impact) {
                                event.rules = profile.logic.impact.rules;
                            } else if (event.phase === 'aftermath' && profile.logic.aftermath) {
                                event.rules = profile.logic.aftermath.rules;
                            }
                         }
                    });
                }
            });

            let mapDataChanged = false;
            const newMapData = state.mapData.map(cell => {
                if (cell.enclaveId === null) return cell;

                const newEnclaveState = newEnclaveData[cell.enclaveId];

                if (newEnclaveState) {
                    if (cell.owner !== newEnclaveState.owner) {
                        mapDataChanged = true;
                        return { ...cell, owner: newEnclaveState.owner };
                    }
                } else {
                    if (cell.owner !== null || cell.enclaveId !== null) {
                         mapDataChanged = true;
                         return { ...cell, owner: null, enclaveId: null };
                    }
                }
                
                return cell;
            });

            const intermediateState: GameState = {
                ...state,
                enclaveData: newEnclaveData,
                mapData: mapDataChanged ? newMapData : state.mapData,
                playerPendingOrders: newPlayerPendingOrders,
                aiPendingOrders: newAiPendingOrders,
                routes: newRoutes,
                currentTurn: newCurrentTurn,
                activeEventMarkers: newEffectMarkers,
                gamePhase: gameOverState !== 'none' ? 'gameOver' : state.gamePhase,
                gameOverState: gameOverState,
                isPaused: gameOverState !== 'none' ? true : state.isPaused,
                isResolvingTurn: false,
                events: [...state.events, ...allEvents],
                unprocessedTurnEvents: events,
            };

            const turnThatJustEnded = state.currentTurn;
            const world = state.currentWorld;
            const disasterConfig = state.gameConfig.DISASTER_TESTING;
            
            const wasTestDisasterTurn = disasterConfig?.enabled && turnThatJustEnded === disasterConfig.triggerOnTurn;

            if (!wasTestDisasterTurn && world && turnThatJustEnded > 0 && world.disasterChance > 0 && Math.random() < world.disasterChance) {
                if (world.possibleEvents && world.possibleEvents.length > 0) {
                    const disasterKey = world.possibleEvents[Math.floor(Math.random() * world.possibleEvents.length)];
                    const disasterProfile = EVENT_PROFILES[disasterKey];
                    if (!disasterProfile) {
                        console.error(`Disaster profile not found for key: ${disasterKey}`);
                    } else {
                        const disasterResult = triggerEventLogic(disasterProfile, {
                            enclaveData: intermediateState.enclaveData,
                            domainData: intermediateState.domainData,
                            mapData: intermediateState.mapData,
                            expanseData: intermediateState.expanseData,
                            riftData: intermediateState.riftData,
                        });

                        if (disasterResult) {
                            if (disasterResult.newMarkers) intermediateState.activeEventMarkers.push(...disasterResult.newMarkers);
                            if (disasterResult.snackbarData) intermediateState.latestEvent = disasterResult.snackbarData;
                        }
                    }
                }
            }

            return intermediateState;
        }

        case 'PLAYER_CANCEL_ORDERS': {
            const ordersToCancel: number[] = action.payload;
            const newPlayerOrders = { ...state.playerPendingOrders };
            let ordersWereCancelled = false;
            ordersToCancel.forEach(fromId => {
                if (newPlayerOrders[fromId]) {
                    delete newPlayerOrders[fromId];
                    ordersWereCancelled = true;
                }
            });
        
            if (ordersWereCancelled) {
                const sfxKey = `order-hold-sfx`;
                const eventsToQueue: EventQueueItem[] = [];
                const fromEnclave = state.enclaveData[ordersToCancel[0]]; 
                if (fromEnclave) {
                    eventsToQueue.push({
                        id: uuidv4(),
                        playMode: 'immediate',
                        sfx: { key: sfxKey, channel: 'fx', position: fromEnclave.center },
                        position: fromEnclave.center,
                    });
                }
                return {
                    ...state,
                    playerPendingOrders: newPlayerOrders,
                };
            }
            return state;
        }

        case 'AI_CANCEL_ORDER': {
            if (!sfxManager || !vfxManager) return state;
            const { fromId } = action.payload;
            const fromEnclave = state.enclaveData[fromId];
            if (!fromEnclave || !state.aiPendingOrders[fromId]) return state;

            const newAiOrders = { ...state.aiPendingOrders };
            delete newAiOrders[fromId];

            const sfxKey = `order-hold-sfx`;
            const vfxKey = 'order-hold-vfx';
            
            immediateEffects.play(sfxKey, fromEnclave.center, 'sfx');
            immediateEffects.play(vfxKey, fromEnclave.center, 'vfx');

            return {
                ...state,
                aiPendingOrders: newAiOrders,
            };
        }

        case 'AI_ISSUE_ORDER': {
            if (!sfxManager || !vfxManager) return state;
            const { fromId, order } = action.payload;
            const fromEnclave = state.enclaveData[fromId];
            const toEnclave = state.enclaveData[order.to];

            if (!fromEnclave || !toEnclave) return state;

            const orderType = order.type;

            const vfxKey = `order-${orderType}-vfx`;
            const sfxKey = `order-${orderType}-sfx`;

            return {
                ...state,
                aiPendingOrders: {
                    ...state.aiPendingOrders,
                    [fromId]: order,
                },
                events: [
                    ...state.events,
                    {
                        id: uuidv4(),
                        playMode: 'immediate',
                        sfx: { key: sfxKey, channel: 'fx', position: fromEnclave.center },
                        vfx: [vfxKey],
                        position: toEnclave.center,
                    },
                ],
            };
        }

        case 'AI_CLEAR_ORDERS': {
            return {
                ...state,
                aiPendingOrders: {},
            };
        }
            
        default:
            return state;
    }
};