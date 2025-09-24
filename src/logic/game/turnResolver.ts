/*
  This is a web worker script for resolving game turns in the background.
  It receives the game state, processes all game logic for a turn (disasters,
  orders, battles), and posts the new state back to the main thread.
*/

import { Enclave, PendingOrders, EventQueueItem, ActiveEventMarker, Route, MapCell, ActiveEvent, EventProfile, GameConfig, GameState, TurnEvent } from '@/types/game.ts';
import { resolveHolding, resolveAssists, resolveAttacks } from '@/logic/orders';
import * as THREE from 'three';
import { EVENTS } from '@/data/events';
import { applyContinuousEffects } from '@/logic/events';
import { cloneEnclave } from '@/logic/enclaves';
import * as defaultHandler from '@/logic/disasters/defaultHandler';
import * as entropyWindHandler from '@/logic/disasters/entropyWind';
import { getRandomAssetKey } from '@/utils/assetUtils';


const resolveNumericRange = (value: number | [number, number]): number => {
    if (Array.isArray(value)) {
        // Return a random integer within the range (inclusive)
        return Math.floor(Math.random() * (value[1] - value[0] + 1)) + value[0];
    }
    return value;
};

const eventHandlers: { [key: string]: any } = {
    default: defaultHandler,
    'entropy-wind': entropyWindHandler,
};

export const queueEventAssets = (
    profile: EventProfile,
    phase: 'alert' | 'impact' | 'aftermath',
    position: THREE.Vector3,
    eventsToPlay: EventQueueItem[]
) => {
    const sfxAssets = profile.ui.assets.sfx?.[phase];
    const vfxAssets = profile.ui.assets.vfx?.[phase];
    const dialogAssets = profile.ui.assets.dialog?.[phase];

    // Construct the base key, converting profile key from kebab-case to camelCase for asset matching
    // e.g., 'entropy-wind' -> 'entropyWind'
    const camelCaseKey = profile.key.replace(/-./g, x => x.toUpperCase()[1]);

    const sfxKey = sfxAssets ? `disaster-${camelCaseKey}-sfx-${phase}` : undefined;
    const vfxKey = vfxAssets ? `disaster-${camelCaseKey}-vfx-${phase}` : undefined;
    const selectedAlertDialogKey = dialogAssets ? getRandomAssetKey(dialogAssets.map(asset => asset.src)) : undefined;

    if (vfxKey || sfxKey) {
        eventsToPlay.push({
            id: `evt-${profile.key}-${phase}-vfx-sfx-${position.x}-${position.y}-${position.z}-${Date.now()}`,
            playMode: 'pending',
            vfx: vfxKey ? [vfxKey] : undefined,
            sfx: sfxKey ? { key: sfxKey, channel: 'fx', position: position } : undefined,
            position: position,
        });
    }

    if (selectedAlertDialogKey) {
        eventsToPlay.push({
            id: `evt-${profile.key}-${phase}-dialog-${position.x}-${position.y}-${position.z}-${Date.now()}`,
            playMode: 'pending',
            sfx: { key: selectedAlertDialogKey, channel: 'dialog', position: position },
            position: position,
        });
    }
};

export const processEventMarkers = (
    initialEnclavesMap: Map<number, Enclave>,
    initialRoutes: Route[],
    currentMarkers: ActiveEventMarker[],
    eventsToPlay: EventQueueItem[],
    mapData: MapCell[],
) => {
    let workingEnclaves = new Map<number, Enclave>(initialEnclavesMap);
    let workingRoutes = JSON.parse(JSON.stringify(initialRoutes)); // Deep copy for mutation
    
    // STEP 1: APPLY CONTINUOUS EFFECTS
    const continuousUpdateMap = new Map<number, Enclave>();
    const allSideEffects: any[] = []; 

    for (const [id, enclave] of workingEnclaves.entries()) {
        if (!enclave.activeEvents || enclave.activeEvents.length === 0) continue;
        
        let modifiedEnclave = cloneEnclave(enclave);
        let modifiedRoutes = workingRoutes;

        for (let i = modifiedEnclave.activeEvents.length - 1; i >= 0; i--) {
            const event = modifiedEnclave.activeEvents[i];
            const profile = EVENTS[event.profileKey];
            if (!profile) continue;
            
            const handler = eventHandlers[event.profileKey] || eventHandlers.default;
            if (handler && handler.handleContinuous) {
                // Reset hasImpactedThisTurn flag for the new turn
                if (event.metadata && event.metadata.hasImpactedThisTurn !== undefined) {
                    event.metadata.hasImpactedThisTurn = false;
                }
                const result = handler.handleContinuous(event, profile, modifiedEnclave, workingEnclaves, modifiedRoutes, mapData);
                modifiedEnclave = result.enclave;
                modifiedRoutes = result.newRoutes;
                if (result.removeEvent) {
                     modifiedEnclave.activeEvents.splice(i, 1);
                }
                if (result.sideEffects) {
                    allSideEffects.push(...result.sideEffects);
                }
            } else {
                const continuousResult = applyContinuousEffects(modifiedEnclave, event.rules, {} as GameState);
                modifiedEnclave = { ...modifiedEnclave, forces: modifiedEnclave.forces * continuousResult.combatModifier };
                // Note: routes are not modified by applyContinuousEffects
            }
        }
        continuousUpdateMap.set(id, modifiedEnclave);
    }

    // Batch update the main map with results from the primary continuous loop
    for(const [id, enclave] of continuousUpdateMap.entries()) {
        workingEnclaves.set(id, enclave);
    }
    
    // Now, safely apply all queued side effects from handlers like Entropy Wind
    allSideEffects.forEach(sideEffect => {
        if (sideEffect.type === 'PLAY_VFX_SFX') {
            // Push the side effect directly to eventsToPlay for the main thread to handle VFX/SFX
            eventsToPlay.push({
                id: `vfx-sfx-${Date.now()}-${Math.random()}`,
                playMode: 'pending',
                vfx: sideEffect.vfxKey ? [sideEffect.vfxKey] : undefined,
                sfx: sideEffect.sfx,
                position: sideEffect.position,
            });
        }
        // No longer need to handle APPLY_IMPACT_AND_EFFECT as impact rules are applied directly in entropyWind.ts
    });
    
    // STEP 2: PROCESS MARKERS AND PHASE TRANSITIONS
    const remainingEventMarkers: ActiveEventMarker[] = [];
    const eventsToAdd: { enclaveId: number, event: ActiveEvent }[] = [];
    
    currentMarkers.forEach(marker => {
        marker.durationInPhase--;
        if (marker.durationInPhase <= 0) {
            const profile = EVENTS[marker.profileKey];
            if (!profile) return;

            let nextPhase: 'impact' | 'aftermath' | undefined;
            let nextPhaseLogic: EventProfile['logic']['impact'] | EventProfile['logic']['aftermath'] | undefined;

            if (marker.currentPhase === 'alert' && profile.logic.impact) {
                nextPhase = 'impact';
                nextPhaseLogic = profile.logic.impact;
            } else if (marker.currentPhase === 'impact' && profile.logic.aftermath) {
                nextPhase = 'aftermath';
                nextPhaseLogic = profile.logic.aftermath;
            }

            if (nextPhase && nextPhaseLogic) {
                marker.currentPhase = nextPhase;
                const resolvedDuration = nextPhaseLogic.duration === 'Permanent' ? 9999 : nextPhaseLogic.duration;
                marker.durationInPhase = resolveNumericRange(resolvedDuration);
                // Re-queue assets for the new phase
                queueEventAssets(profile, nextPhase, marker.position, eventsToPlay);
                remainingEventMarkers.push(marker); // Keep marker if it transitions to next phase
            } else {
                // Event is complete, or no next phase
                const handler = eventHandlers[marker.profileKey] || eventHandlers.default;
                if (handler && handler.processMarker) {
                    const result = handler.processMarker(marker, profile, workingEnclaves, workingRoutes, eventsToPlay, mapData);
                    result.eventsToAdd?.forEach((e: { enclaveId: number, event: ActiveEvent }) => eventsToAdd.push(e));
                    workingRoutes = result.newRoutes || workingRoutes;
                }
            }
        } else {
            remainingEventMarkers.push(marker);
        }
    });
    
    for (const enclave of workingEnclaves.values()) {
        const remainingEvents: ActiveEvent[] = [];
        for (const event of enclave.activeEvents) {
            event.duration--;
            if (event.duration > 0) {
                remainingEvents.push(event);
            } else {
                const profile = EVENTS[event.profileKey];
                if (!profile) continue;
                
                const handler = eventHandlers[event.profileKey] || eventHandlers.default;
                if (handler && handler.processEvent) {
                    const result = handler.processEvent(event, profile, enclave, workingEnclaves, workingRoutes, eventsToPlay, mapData);
                    result.eventsToAdd?.forEach((e: { enclaveId: number, event: ActiveEvent }) => eventsToAdd.push(e));
                    workingRoutes = result.newRoutes || workingRoutes;
                }
            }
        }
        enclave.activeEvents = remainingEvents;
    }
    
    eventsToAdd.forEach(({ enclaveId, event }) => {
        const enclave = workingEnclaves.get(enclaveId);
        if (enclave) {
            const newEnclave = cloneEnclave(enclave);
            newEnclave.activeEvents.push(event);
            workingEnclaves.set(enclaveId, newEnclave);
        }
    });
    
    return {
        newEnclaveStates: workingEnclaves,
        newRoutes: workingRoutes,
        remainingEventMarkers,
    };
};

// A lightweight representation of THREE.Vector3 for data transfer
interface PlainVector3 {
    x: number;
    y: number;
    z: number;
}

// Re-hydrates a plain object into a THREE.Vector3 instance
export const deserializeVector3 = (o: PlainVector3): THREE.Vector3 => {
    if (o && typeof o.x === 'number' && typeof o.y === 'number' && typeof o.z === 'number') {
        return new THREE.Vector3(o.x, o.y, o.z);
    }
    console.warn("Attempted to deserialize a non-Vector3-like object, using fallback.", o);
    return new THREE.Vector3(0, 0, 0);
};

// Order Validation
export const pruneInvalidOrders = (
    enclaveMap: Map<number, Enclave>,
    routes: Route[],
    playerOrders: PendingOrders,
    aiOrders: PendingOrders
): { validPlayerOrders: PendingOrders; validAiOrders: PendingOrders } => {
    const allOrders = { ...playerOrders, ...aiOrders };
    const validPlayerOrders: PendingOrders = {};
    const validAiOrders: PendingOrders = {};

    for (const fromIdStr in allOrders) {
        const fromId = parseInt(fromIdStr, 10);
        const order = allOrders[fromIdStr];
        const toEnclave = enclaveMap.get(order.to);
        const fromEnclave = enclaveMap.get(fromId);

        let isInvalid = false;
        if (!fromEnclave || !toEnclave || fromEnclave.forces <= 0) {
            isInvalid = true;
        } else if (fromEnclave.owner !== toEnclave.owner && order.type === 'assist') {
            isInvalid = true;
        } else if (fromEnclave.owner === toEnclave.owner && order.type === 'attack') {
            isInvalid = true;
        } else {
            const routeExists = routes.find(r =>
                ((r.from === fromId && r.to === order.to) || (r.to === fromId && r.from === order.to)) &&
                !r.isDestroyed && r.disabledForTurns <= 0
            );
            if (!routeExists) {
                isInvalid = true;
            }
        }
        
        if (!isInvalid) {
            if (playerOrders[fromId]) {
                validPlayerOrders[fromId] = order;
            } else {
                validAiOrders[fromId] = order;
            }
        }
    }

    // FIX: A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.
    return { validPlayerOrders, validAiOrders };
};


// Main Turn Resolution Logic
export const resolveTurn = (
    initialEnclaveData: { [id: number]: Enclave },
    playerPendingOrders: PendingOrders,
    aiPendingOrders: PendingOrders,
    initialRoutes: Route[],
    mapData: MapCell[],
    currentTurn: number,
    gameSessionId: number,
    initialEventMarkers: ActiveEventMarker[],
    gameConfig: GameConfig,
    playerArchetypeKey: string | null,
    playerLegacyKey: string | null,
    opponentArchetypeKey: string | null,
    opponentLegacyKey: string | null,
) => {
    try {
        const allTurnEvents: TurnEvent[] = [];
        const effectsToPlay: EventQueueItem[] = []; // For disaster effects for now
        
        // Convert to Maps for safe, immutable operations
        const initialEnclavesMap = new Map<number, Enclave>(Object.entries(initialEnclaveData).map(([id, e]) => [parseInt(id), e]));

        // Effect Marker Processing Phase
        const { newEnclaveStates: enclavesAfterEffects, newRoutes: routesAfterEffects, remainingEventMarkers } = processEventMarkers(
            initialEnclavesMap, initialRoutes, initialEventMarkers, effectsToPlay, mapData
        );

        // Order Pruning
        const { validPlayerOrders, validAiOrders } = pruneInvalidOrders(
            enclavesAfterEffects, routesAfterEffects, playerPendingOrders, aiPendingOrders
        );
        const allValidOrders = { ...validPlayerOrders, ...validAiOrders };

        // Order Resolution Pipeline
        const { newEnclaveData: enclavesAfterHolding, events: holdEvents } = resolveHolding(enclavesAfterEffects, allValidOrders, routesAfterEffects, gameConfig);
        allTurnEvents.push(...holdEvents);

        const { newEnclaveData: enclavesAfterAssists, events: assistEvents } = resolveAssists(enclavesAfterHolding, allValidOrders, gameConfig);
        allTurnEvents.push(...assistEvents);

        const { newEnclaveData: enclavesAfterAttacks, events: attackEvents } = resolveAttacks(
            enclavesAfterAssists, allValidOrders, gameConfig, playerArchetypeKey, playerLegacyKey, opponentArchetypeKey, opponentLegacyKey, routesAfterEffects,
        );
        allTurnEvents.push(...attackEvents);
        
        let finalEnclavesMap = enclavesAfterAttacks;

        // Game Over Check
        const finalEnclaves = Array.from(finalEnclavesMap.values());
        const playerEnclaveCount = finalEnclaves.filter(e => e.owner === 'player-1').length;
        const opponentEnclaveCount = finalEnclaves.filter(e => e.owner === 'player-2').length;
        let gameOverState: 'none' | 'victory' | 'defeat' = 'none';
        if (playerEnclaveCount === 0 && opponentEnclaveCount > 0) gameOverState = 'defeat';
        else if (opponentEnclaveCount === 0 && playerEnclaveCount > 0) gameOverState = 'victory';
        
        // Convert Map back to object for serialization
        const newEnclaveData = Object.fromEntries(finalEnclavesMap.entries());

        return {
            newEnclaveData,
            newPlayerPendingOrders: validPlayerOrders, // Orders can be invalidated
            newAiPendingOrders: validAiOrders,
            newRoutes: routesAfterEffects,
            newCurrentTurn: currentTurn + 1,
            newEventMarkers: remainingEventMarkers,
            gameOverState,
            events: allTurnEvents,
            effectsToPlay, // Still needed for disasters
            gameSessionId,
        };

    } catch (e) {
        if (e instanceof Error) {
            return { error: `Resolver Error: ${e.message} 
 ${e.stack}` };
        }
        return { error: `An unknown error occurred in the turn resolver.` };
    }
};

// Web Worker Message Handler
self.onmessage = (e: MessageEvent) => {
    try {
        const state = JSON.parse(e.data);

        // Re-hydrate all Vector3 instances on entry
        Object.values(state.enclaveData).forEach((enclave: any) => {
            enclave.center = deserializeVector3(enclave.center);
        });
        state.mapData.forEach((cell: any) => {
            cell.center = deserializeVector3(cell.center);
        });
        (state.activeEventMarkers || []).forEach((marker: any) => {
            marker.position = deserializeVector3(marker.position);
        });

        const result = resolveTurn(
            state.enclaveData,
            state.playerPendingOrders,
            state.aiPendingOrders,
            state.routes,
            state.mapData,
            state.currentTurn,
            state.gameSessionId,
            state.activeEventMarkers,
            state.gameConfig,
            state.playerArchetypeKey,
            state.playerLegacyKey,
            state.opponentArchetypeKey,
            state.opponentLegacyKey,
        );
        
        
        self.postMessage(JSON.stringify(result));
    } catch (error) {
        
        if (error instanceof Error) {
            self.postMessage(JSON.stringify({ error: `A fatal error occurred in the turn resolver: ${error.message}\n${error.stack}` }));
        } else {
            self.postMessage(JSON.stringify({ error: 'An unknown fatal error occurred in the turn resolver.' }));
        }
    }
};