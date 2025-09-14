import { GameState, Enclave, Order, EffectQueueItem } from '@/types/game';
import { Action } from '@/logic/reducers/index';
import { v4 as uuidv4 } from 'uuid';
import { EFFECT_PROFILES } from '@/data/effects';
import { ORDER_PROFILES } from '@/data/orders';
import { triggerNewEffect as triggerEffectLogic } from "@/logic/effectManager";

export const handleTurnLogic = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'START_FIRST_TURN': {
            const disasterConfig = state.gameConfig.DISASTER_TESTING;
            const updates: Partial<GameState> & { effectQueue?: EffectQueueItem[] } = {
                currentTurn: 1,
                isPaused: false,
            };

            // This logic specifically handles the test case for a disaster on Turn 1.
            if (disasterConfig?.enabled && disasterConfig.triggerOnTurn === 1) {
                const disasterProfile = EFFECT_PROFILES[disasterConfig.disasterKey];
                if (!disasterProfile) {
                    console.error(`Disaster profile not found for key: ${disasterConfig.disasterKey}`);
                    return { ...state, ...updates };
                }
                const result = triggerEffectLogic(disasterProfile, {
                    enclaveData: state.enclaveData,
                    domainData: state.domainData,
                    mapData: state.mapData,
                    expanseData: state.expanseData,
                    riftData: state.riftData,
                });

                if (result) {
                    if (result.newMarkers) updates.activeEffectMarkers = [...state.activeEffectMarkers, ...result.newMarkers];
                    if (result.snackbarData) updates.latestEffect = result.snackbarData;
                }
            }
            return { ...state, ...updates };
        }

        case 'START_RESOLVING_TURN': {
            return {
                ...state,
                isResolvingTurn: true,
                playerConquestsThisTurn: 0,
                opponentConquestsThisTurn: 0,
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
                effectsToPlay, 
                playerConquestsThisTurn, 
                opponentConquestsThisTurn,
                playerHasHadFirstConquestDialog,
                opponentHasHadFirstConquestDialog,
            } = action.payload;
            
            Object.values(newEnclaveData).forEach((enclave: Enclave) => {
                if (enclave.activeEffects) {
                    enclave.activeEffects.forEach(effect => {
                         const profile = EFFECT_PROFILES[effect.profileKey];
                         if (profile) {
                            if (effect.phase === 'impact' && profile.logic.impact) {
                                effect.rules = profile.logic.impact.rules;
                            } else if (effect.phase === 'aftermath' && profile.logic.aftermath) {
                                effect.rules = profile.logic.aftermath.rules;
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
            
            let finalEffectsToPlay = effectsToPlay;
            if (!state.stackVfx && effectsToPlay.length > 0) {
                const seenPositions = new Set<string>();
                const uniqueEffects: EffectQueueItem[] = [];
                for (let i = effectsToPlay.length - 1; i >= 0; i--) {
                    const effect = effectsToPlay[i];
                    const posKey = `${effect.position.x.toFixed(3)},${effect.position.y.toFixed(3)},${effect.position.z.toFixed(3)}`;
                    if (!seenPositions.has(posKey)) {
                        seenPositions.add(posKey);
                        uniqueEffects.unshift(effect);
                    }
                }
                finalEffectsToPlay = uniqueEffects;
            }

            const intermediateState: GameState = {
                ...state,
                enclaveData: newEnclaveData,
                mapData: mapDataChanged ? newMapData : state.mapData,
                playerPendingOrders: newPlayerPendingOrders,
                aiPendingOrders: newAiPendingOrders,
                routes: newRoutes,
                currentTurn: newCurrentTurn,
                activeEffectMarkers: newEffectMarkers,
                gamePhase: gameOverState !== 'none' ? 'gameOver' : state.gamePhase,
                gameOverState: gameOverState,
                isPaused: gameOverState !== 'none' ? true : state.isPaused,
                isResolvingTurn: false,
                effectQueue: [...state.effectQueue, ...finalEffectsToPlay],
                playerConquestsThisTurn,
                opponentConquestsThisTurn,
                playerHasHadFirstConquestDialog,
                opponentHasHadFirstConquestDialog,
            };

            const turnThatJustEnded = state.currentTurn;
            const world = state.currentWorld;
            const disasterConfig = state.gameConfig.DISASTER_TESTING;
            
            const wasTestDisasterTurn = disasterConfig?.enabled && turnThatJustEnded === disasterConfig.triggerOnTurn;

            if (!wasTestDisasterTurn && world && turnThatJustEnded > 0 && world.disasterChance > 0 && Math.random() < world.disasterChance) {
                if (world.possibleEffects.length > 0) {
                    const disasterKey = world.possibleEffects[Math.floor(Math.random() * world.possibleEffects.length)];
                    const disasterProfile = EFFECT_PROFILES[disasterKey];
                    if (!disasterProfile) {
                        console.error(`Disaster profile not found for key: ${disasterKey}`);
                    } else {
                        const disasterResult = triggerEffectLogic(disasterProfile, {
                            enclaveData: intermediateState.enclaveData,
                            domainData: intermediateState.domainData,
                            mapData: intermediateState.mapData,
                            expanseData: intermediateState.expanseData,
                            riftData: intermediateState.riftData,
                        });

                        if (disasterResult) {
                            if (disasterResult.newMarkers) intermediateState.activeEffectMarkers.push(...disasterResult.newMarkers);
                            if (disasterResult.snackbarData) intermediateState.latestEffect = disasterResult.snackbarData;
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
                const sfxKey = `sfx-order-hold-${Math.floor(Math.random() * 6) + 1}`;
                // Changed to add to effectQueue
                const effectsToQueue: EffectQueueItem[] = [];
                // Assuming the first cancelled order's enclave is representative for position
                const fromEnclave = state.enclaveData[ordersToCancel[0]]; 
                if (fromEnclave) {
                    effectsToQueue.push({
                        id: uuidv4(),
                        sfx: { key: sfxKey, channel: 'fx', position: fromEnclave.center },
                        position: fromEnclave.center,
                    });
                }
                return {
                    ...state,
                    playerPendingOrders: newPlayerOrders,
                    effectQueue: [...state.effectQueue, ...effectsToQueue],
                };
            }
            return state;
        }

        
        
        case 'AI_CANCEL_ORDER': {
            const { fromId } = action.payload;
            const fromEnclave = state.enclaveData[fromId];
            if (!fromEnclave || !state.aiPendingOrders[fromId]) return state;

            const newAiOrders = { ...state.aiPendingOrders };
            delete newAiOrders[fromId];

            const effectsToQueue: EffectQueueItem[] = [];

            const sfxKey = `sfx-order-hold-${Math.floor(Math.random() * 6) + 1}`;
            effectsToQueue.push({
                id: uuidv4(),
                sfx: { key: sfxKey, channel: 'fx', position: fromEnclave.center },
                position: fromEnclave.center,
            });

            const vfx = ORDER_PROFILES.holding.assets.vfx;
            if (vfx) {
                effectsToQueue.push({
                    id: uuidv4(),
                    vfx: vfx,
                    position: fromEnclave.center,
                });
            }

            return {
                ...state,
                aiPendingOrders: newAiOrders,
                effectQueue: [...state.effectQueue, ...effectsToQueue],
            };
        }

        case 'AI_ISSUE_ORDER': {
            const { fromId, order } = action.payload;
            const fromEnclave = state.enclaveData[fromId];
            const toEnclave = state.enclaveData[order.to];

            if (!fromEnclave || !toEnclave) return state;

            const effectsToQueue: EffectQueueItem[] = [];
            const orderType = order.type;

            const vfx = ORDER_PROFILES[orderType]?.assets.vfx;
            const sfxKey = `sfx-order-${orderType}-${Math.floor(Math.random() * 4) + 1}`;

            if (vfx) {
                effectsToQueue.push({
                    id: uuidv4(),
                    vfx: vfx,
                    position: toEnclave.center, // VFX at target
                });
            }

            effectsToQueue.push({
                id: uuidv4(),
                sfx: { key: sfxKey, channel: 'fx', position: fromEnclave.center }, // SFX at origin
                position: fromEnclave.center,
            });

            return {
                ...state,
                aiPendingOrders: {
                    ...state.aiPendingOrders,
                    [fromId]: order,
                },
                effectQueue: [...state.effectQueue, ...effectsToQueue],
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