import { GameState, Enclave, EffectQueueItem, TurnEvent, ConquestEvent } from '@/types/game';
import { Action } from '@/logic/reducers/index';
import { v4 as uuidv4 } from 'uuid';
import { EFFECT_PROFILES } from '@/data/effects';
import { triggerNewEffect as triggerEffectLogic } from "@/logic/effectManager";

const mapEventsToEffects = (events: TurnEvent[], state: GameState, newEnclaveData: { [id: number]: Enclave }): EffectQueueItem[] => {
    const effects: EffectQueueItem[] = [];
    let playerHasHadFirstConquestDialog = state.playerHasHadFirstConquestDialog;
    let opponentHasHadFirstConquestDialog = state.opponentHasHadFirstConquestDialog;

    const conquestEvents = events.filter(e => e.type === 'conquest') as ConquestEvent[];
    const playerConquests = conquestEvents.filter(e => e.conqueror === 'player-1');
    const opponentConquests = conquestEvents.filter(e => e.conqueror === 'player-2');

    // First Conquest Dialog Logic
    if (playerConquests.length > 0 && !playerHasHadFirstConquestDialog) {
        const event = playerConquests[0];
        const sfxKey = `archetype-${event.archetypeKey}-${event.legacyKey}-dialog-conquest`;
        effects.push({
            id: uuidv4(),
            sfx: { key: sfxKey, channel: 'dialog' },
            position: newEnclaveData[event.enclaveId].center,
        });
    }
    if (opponentConquests.length > 0 && !opponentHasHadFirstConquestDialog) {
        const event = opponentConquests[0];
        const sfxKey = `archetype-${event.archetypeKey}-${event.legacyKey}-dialog-conquest`;
        effects.push({
            id: uuidv4(),
            sfx: { key: sfxKey, channel: 'dialog' },
            position: newEnclaveData[event.enclaveId].center,
        });
    }

    // Subsequent Random Conquest Dialog Logic
    const nonFirstConquests = conquestEvents.filter(event => {
        if (event.conqueror === 'player-1') return playerHasHadFirstConquestDialog;
        if (event.conqueror === 'player-2') return opponentHasHadFirstConquestDialog;
        return true;
    });

    if (nonFirstConquests.length > 0 && Math.random() < state.gameConfig.CONQUEST_DIALOG_CHANCE) {
        const randomConquest = nonFirstConquests[Math.floor(Math.random() * nonFirstConquests.length)];
        const sfxKey = `archetype-${randomConquest.archetypeKey}-${randomConquest.legacyKey}-dialog-conquest`;
        effects.push({
            id: uuidv4(),
            sfx: { key: sfxKey, channel: 'dialog' },
            position: newEnclaveData[randomConquest.enclaveId].center,
        });
    }

    events.forEach(event => {
        switch (event.type) {
            case 'conquest': {
                const enclave = newEnclaveData[event.enclaveId];
                if (enclave) {
                    const ownerKey = event.conqueror === 'player-1' ? 'player' : 'opponent';
                    const sfxKey = `conquest-${ownerKey}-sfx`;
                    const vfxKey = `conquest-${ownerKey}-vfx`;
                    effects.push({
                        id: uuidv4(),
                        sfx: { key: sfxKey, channel: 'fx', position: enclave.center },
                        vfx: [vfxKey],
                        position: enclave.center,
                    });
                }
                break;
            }
        }
    });

    return effects;
};

export const handleTurnLogic = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'START_FIRST_TURN': {
            const disasterConfig = state.gameConfig.DISASTER_TESTING;
            const updates: Partial<GameState> & { effectQueue?: EffectQueueItem[] } = {
                currentTurn: 1,
                isPaused: false,
            };

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
                events,
                effectsToPlay, // From disasters
            } = action.payload;
            
            const turnEffects = mapEventsToEffects(events, state, newEnclaveData);
            const allEffects = [...turnEffects, ...(effectsToPlay || [])].map(effect => ({ ...effect, id: effect.id || uuidv4() }));

            const conquestEvents = events.filter((e: TurnEvent) => e.type === 'conquest');
            const playerConquestsThisTurn = conquestEvents.filter((e: any) => e.conqueror === 'player-1').length;
            const opponentConquestsThisTurn = conquestEvents.filter((e: any) => e.conqueror === 'player-2').length;
            const playerHasHadFirstConquestDialog = state.playerHasHadFirstConquestDialog || playerConquestsThisTurn > 0;
            const opponentHasHadFirstConquestDialog = state.opponentHasHadFirstConquestDialog || opponentConquestsThisTurn > 0;

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
                pendingEffects: allEffects,
                effectQueue: [], // Clear the old queue
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
                if (world.possibleEffects && world.possibleEffects.length > 0) {
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
                const sfxKey = `order-hold-sfx`;
                const effectsToQueue: EffectQueueItem[] = [];
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

            const sfxKey = `order-hold-sfx`;
            const vfxKey = 'order-hold-vfx';
            effectsToQueue.push({
                id: uuidv4(),
                sfx: { key: sfxKey, channel: 'fx', position: fromEnclave.center },
                vfx: [vfxKey],
                position: fromEnclave.center,
            });

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

            const vfxKey = `order-${orderType}-vfx`;
            const sfxKey = `order-${orderType}-sfx`;

            effectsToQueue.push({
                id: uuidv4(),
                vfx: [vfxKey],
                position: toEnclave.center, // VFX at target
            });

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