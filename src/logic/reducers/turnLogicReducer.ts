import { GameState, Enclave, Order, EffectQueueItem } from '@/types/game';
import { Action } from '@/logic/reducers/index';
import { DISASTER_PROFILES } from '@/data/disasters';
import { ORDER_PROFILES } from '@/data/orders';
import { triggerNewDisaster as triggerDisasterLogic } from '@/logic/disasterManager';

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
                const result = triggerDisasterLogic(disasterConfig.disasterKey, {
                    enclaveData: state.enclaveData,
                    domainData: state.domainData,
                    mapData: state.mapData,
                    expanseData: state.expanseData,
                    riftData: state.riftData,
                });

                if (result) {
                    if (result.newMarkers) updates.activeDisasterMarkers = [...state.activeDisasterMarkers, ...result.newMarkers];
                    if (result.snackbarData) updates.latestDisaster = result.snackbarData;
                    if (result.effectsToPlay) updates.effectQueue = [...state.effectQueue, ...result.effectsToPlay];
                }
            }
            return { ...state, ...updates };
        }

        case 'START_RESOLVING_TURN': {
            return { ...state, isResolvingTurn: true };
        }

        case 'APPLY_RESOLVED_TURN': {
            const { newEnclaveData, newPlayerPendingOrders, newAiPendingOrders, newRoutes, newCurrentTurn, newDisasterMarkers, gameOverState, effectsToPlay } = action.payload;
            
            // Re-hydrate the 'rules' for active effects on the main thread.
            // This is part of the compatibility layer for the old resolvers.
            Object.values(newEnclaveData).forEach((enclave: Enclave) => {
                if (enclave.activeEffects) {
                    enclave.activeEffects.forEach(effect => {
                         const profile = DISASTER_PROFILES[effect.profileKey];
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

            // Reconstruct mapData from the authoritative new enclave data.
            // This is a critical step to prevent state desynchronization.
            let mapDataChanged = false;
            const newMapData = state.mapData.map(cell => {
                if (cell.enclaveId === null) return cell;

                const newEnclaveState = newEnclaveData[cell.enclaveId];

                if (newEnclaveState) {
                    // The enclave exists. Update the cell's owner if it has changed.
                    if (cell.owner !== newEnclaveState.owner) {
                        mapDataChanged = true;
                        return { ...cell, owner: newEnclaveState.owner };
                    }
                } else {
                    // The enclave ID points to nothing, meaning the enclave was destroyed/removed.
                    // Neutralize the cell completely to prevent state inconsistencies.
                    if (cell.owner !== null || cell.enclaveId !== null) {
                         mapDataChanged = true;
                         return { ...cell, owner: null, enclaveId: null };
                    }
                }
                
                return cell;
            });
            
            let finalEffectsToPlay = effectsToPlay;
            // NEW LOGIC FOR STACKING VFX
            if (!state.stackVfx && effectsToPlay.length > 0) {
                const seenPositions = new Set<string>();
                const uniqueEffects: EffectQueueItem[] = [];
                // Iterate backwards to keep the *last* effect for a given position
                for (let i = effectsToPlay.length - 1; i >= 0; i--) {
                    const effect = effectsToPlay[i];
                    // Vector3 needs to be stringified to be used as a key
                    const posKey = `${effect.position.x.toFixed(3)},${effect.position.y.toFixed(3)},${effect.position.z.toFixed(3)}`;
                    if (!seenPositions.has(posKey)) {
                        seenPositions.add(posKey);
                        uniqueEffects.unshift(effect); // Add to the beginning to maintain original relative order
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
                activeDisasterMarkers: newDisasterMarkers,
                gamePhase: gameOverState !== 'none' ? 'gameOver' : state.gamePhase,
                gameOverState: gameOverState,
                isPaused: gameOverState !== 'none' ? true : state.isPaused,
                isResolvingTurn: false,
                effectQueue: [...state.effectQueue, ...finalEffectsToPlay],
            };

            // --- Normal Disaster Triggering Logic (Post-Resolution) ---
            const turnThatJustEnded = state.currentTurn;
            const world = state.currentWorld;
            const disasterConfig = state.gameConfig.DISASTER_TESTING;
            
            // Don't trigger a random disaster if the test disaster was just triggered this turn.
            const wasTestDisasterTurn = disasterConfig?.enabled && turnThatJustEnded === disasterConfig.triggerOnTurn;

            if (!wasTestDisasterTurn && world && turnThatJustEnded > 0 && world.disasterChance > 0 && Math.random() < world.disasterChance) {
                if (world.possibleDisasters.length > 0) {
                    const disasterKey = world.possibleDisasters[Math.floor(Math.random() * world.possibleDisasters.length)];
                    const disasterResult = triggerDisasterLogic(disasterKey, {
                        enclaveData: intermediateState.enclaveData,
                        domainData: intermediateState.domainData,
                        mapData: intermediateState.mapData,
                        expanseData: intermediateState.expanseData,
                        riftData: intermediateState.riftData,
                    });

                    if (disasterResult) {
                        if (disasterResult.newMarkers) intermediateState.activeDisasterMarkers.push(...disasterResult.newMarkers);
                        if (disasterResult.snackbarData) intermediateState.latestDisaster = disasterResult.snackbarData;
                        if (disasterResult.effectsToPlay) intermediateState.effectQueue.push(...disasterResult.effectsToPlay);
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
                return {
                    ...state,
                    playerPendingOrders: newPlayerOrders,
                    sfxToPlay: { key: sfxKey, channel: 'ui' },
                };
            }
            return state; // No change if the order was already gone
        }

        case 'AI_ISSUE_ORDER': {
            const { fromId, order } = action.payload as { fromId: number, order: Order };
            const fromEnclave = state.enclaveData[fromId];
            const toEnclave = state.enclaveData[order.to];
            if (!fromEnclave || !toEnclave) return state;

            const newAiOrders = { ...state.aiPendingOrders, [fromId]: order };
            const sfxKey = `sfx-order-${order.type}-${Math.floor(Math.random() * 4) + 1}`;
            
            // Get the VFX key from the order profile
            const vfxKey = ORDER_PROFILES[order.type].vfxKey;
            
            return {
                ...state,
                aiPendingOrders: newAiOrders,
                // Sound plays from the origin enclave
                sfxToPlay: { key: sfxKey, channel: 'fx', position: fromEnclave.center },
                // VFX plays on the target enclave
                vfxToPlay: vfxKey ? { key: vfxKey, center: toEnclave.center } : null,
            };
        }
        
        case 'AI_CANCEL_ORDER': {
            const { fromId } = action.payload;
            const fromEnclave = state.enclaveData[fromId];
            if (!fromEnclave || !state.aiPendingOrders[fromId]) return state;

            const newAiOrders = { ...state.aiPendingOrders };
            delete newAiOrders[fromId];

            const sfxKey = `sfx-order-hold-${Math.floor(Math.random() * 6) + 1}`;

            // Get the VFX key for a "holding" order
            const vfxKey = ORDER_PROFILES.holding.vfxKey;

            return {
                ...state,
                aiPendingOrders: newAiOrders,
                // Sound and VFX play from the origin enclave for "hold"
                sfxToPlay: { key: sfxKey, channel: 'fx', position: fromEnclave.center },
                vfxToPlay: vfxKey ? { key: vfxKey, center: fromEnclave.center } : null,
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
