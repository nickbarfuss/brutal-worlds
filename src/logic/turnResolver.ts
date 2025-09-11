/*
  This is a web worker script for resolving game turns in the background.
  It receives the game state, processes all game logic for a turn (disasters,
  orders, battles), and posts the new state back to the main thread.
*/

import { resolveHolding } from '@/logic/holdResolver';
import { resolveAssists } from '@/logic/assistResolver';
import { resolveAttacks } from '@/logic/attackResolver';
// FIX: GameConfig is not exported from types/game.ts. It is imported from data/config.ts.
import { Enclave, PendingOrders, EffectQueueItem, Player, ActiveDisasterMarker, Route, MapCell, ActiveEffect, DisasterProfile } from '@/types/game.ts';
import { GameConfig } from '@/types/game.ts';
import * as THREE from 'three';
import { DISASTER_PROFILES } from '@/data/disasters';
import { applyContinuousRules, applyInstantaneousRules } from '@/logic/effectProcessor';
import { cloneEnclave } from '@/logic/cloneUtils';
import * as defaultHandler from '@/logic/disasters/defaultHandler';
import * as entropyWindHandler from '@/logic/disasters/entropyWind';

const disasterHandlers: { [key: string]: any } = {
    default: defaultHandler,
    'entropy-wind': entropyWindHandler,
};

export const processDisasterEffects = (
    initialEnclavesMap: Map<number, Enclave>,
    initialRoutes: Route[],
    currentMarkers: ActiveDisasterMarker[],
    effectsToPlay: EffectQueueItem[],
    mapData: MapCell[],
) => {
    let workingEnclaves = new Map<number, Enclave>(initialEnclavesMap);
    let workingRoutes = JSON.parse(JSON.stringify(initialRoutes)); // Deep copy for mutation
    
    // --- STEP 1: APPLY CONTINUOUS EFFECTS ---
    const continuousUpdateMap = new Map<number, Enclave>();
    const allSideEffects: any[] = []; 

    for (const [id, enclave] of workingEnclaves.entries()) {
        if (!enclave.activeEffects || enclave.activeEffects.length === 0) continue;
        
        let modifiedEnclave = cloneEnclave(enclave);
        let modifiedRoutes = workingRoutes;

        for (let i = modifiedEnclave.activeEffects.length - 1; i >= 0; i--) {
            const effect = modifiedEnclave.activeEffects[i];
            const profile = DISASTER_PROFILES[effect.profileKey];
            if (!profile) continue;
            
            const handler = disasterHandlers[effect.profileKey] || disasterHandlers.default;
            if (handler && handler.handleContinuous) {
                // Reset hasImpactedThisTurn flag for the new turn
                if (effect.metadata && effect.metadata.hasImpactedThisTurn !== undefined) {
                    effect.metadata.hasImpactedThisTurn = false;
                }
                const result = handler.handleContinuous(effect, profile, modifiedEnclave, workingEnclaves, modifiedRoutes, mapData);
                modifiedEnclave = result.enclave;
                modifiedRoutes = result.newRoutes;
                if (result.removeEffect) {
                     modifiedEnclave.activeEffects.splice(i, 1);
                }
                if (result.sideEffects) {
                    allSideEffects.push(...result.sideEffects);
                }
            } else {
                const continuousResult = applyContinuousRules(effect.rules, modifiedEnclave, modifiedRoutes);
                modifiedEnclave = continuousResult.enclave;
                modifiedRoutes = continuousResult.routes;
            }
        }
        continuousUpdateMap.set(id, modifiedEnclave);
        workingRoutes = modifiedRoutes;
    }

    // Batch update the main map with results from the primary continuous loop
    for(const [id, enclave] of continuousUpdateMap.entries()) {
        workingEnclaves.set(id, enclave);
    }
    
    // Now, safely apply all queued side effects from handlers like Entropy Wind
    allSideEffects.forEach(sideEffect => {
        if (sideEffect.type === 'PLAY_VFX_SFX') {
            // Push the side effect directly to effectsToPlay for the main thread to handle VFX/SFX
            effectsToPlay.push({
                id: `vfx-sfx-${Date.now()}-${Math.random()}`, // Generate a unique ID
                vfxKey: sideEffect.vfxKey,
                sfx: sideEffect.sfx,
                position: sideEffect.position,
            });
        }
        // No longer need to handle APPLY_IMPACT_AND_EFFECT as impact rules are applied directly in entropyWind.ts
    });
    
    // --- STEP 2: PROCESS MARKERS AND PHASE TRANSITIONS ---
    const remainingDisasterMarkers: ActiveDisasterMarker[] = [];
    const effectsToAdd: { enclaveId: number, effect: ActiveEffect }[] = [];
    
    currentMarkers.forEach(marker => {
        marker.durationInPhase--;
        if (marker.durationInPhase <= 0) {
            const profile = DISASTER_PROFILES[marker.profileKey];
            if (!profile) return;
            
            const handler = disasterHandlers[marker.profileKey] || disasterHandlers.default;
            if (handler && handler.processMarker) {
                const result = handler.processMarker(marker, profile, workingEnclaves, workingRoutes, effectsToPlay, mapData);
                result.effectsToAdd?.forEach((e: { enclaveId: number, effect: ActiveEffect }) => effectsToAdd.push(e));
                workingRoutes = result.newRoutes || workingRoutes;
            }
        } else {
            remainingDisasterMarkers.push(marker);
        }
    });
    
    for (const enclave of workingEnclaves.values()) {
        const remainingEffects: ActiveEffect[] = [];
        for (const effect of enclave.activeEffects) {
            effect.duration--;
            if (effect.duration > 0) {
                remainingEffects.push(effect);
            } else {
                const profile = DISASTER_PROFILES[effect.profileKey];
                if (!profile) continue;
                
                const handler = disasterHandlers[effect.profileKey] || disasterHandlers.default;
                if (handler && handler.processEffect) {
                    const result = handler.processEffect(effect, profile, enclave, workingEnclaves, workingRoutes, effectsToPlay, mapData);
                    result.effectsToAdd?.forEach((e: { enclaveId: number, effect: ActiveEffect }) => effectsToAdd.push(e));
                    workingRoutes = result.newRoutes || workingRoutes;
                }
            }
        }
        enclave.activeEffects = remainingEffects;
    }
    
    effectsToAdd.forEach(({ enclaveId, effect }) => {
        const enclave = workingEnclaves.get(enclaveId);
        if (enclave) {
            const newEnclave = cloneEnclave(enclave);
            newEnclave.activeEffects.push(effect);
            workingEnclaves.set(enclaveId, newEnclave);
        }
    });
    
    return {
        newEnclaveStates: workingEnclaves,
        newRoutes: workingRoutes,
        remainingDisasterMarkers,
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

// --- Order Validation ---
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
        
        // FIX: This was a syntactically invalid 'else' block that caused multiple scope-related errors.
        // It has been removed.

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


// --- Main Turn Resolution Logic ---
export const resolveTurn = (
    initialEnclaveData: { [id: number]: Enclave },
    playerPendingOrders: PendingOrders,
    aiPendingOrders: PendingOrders,
    initialRoutes: Route[],
    mapData: MapCell[],
    currentTurn: number,
    gameSessionId: number,
    initialDisasterMarkers: ActiveDisasterMarker[],
    gameConfig: GameConfig,
    playerArchetypeKey: string | null,
    playerLegacyKey: string | null,
    opponentArchetypeKey: string | null,
    opponentLegacyKey: string | null,
) => {
    try {
        const effectsToPlay: EffectQueueItem[] = [];
        
        // Convert to Maps for safe, immutable operations
        const initialEnclavesMap = new Map<number, Enclave>(Object.entries(initialEnclaveData).map(([id, e]) => [parseInt(id), e]));

        // --- 1. Disaster Phase ---
        const { newEnclaveStates: enclavesAfterDisasters, newRoutes: routesAfterDisasters, remainingDisasterMarkers } = processDisasterEffects(
            initialEnclavesMap, initialRoutes, initialDisasterMarkers, effectsToPlay, mapData
        );

        // --- 2. Order Pruning ---
        const { validPlayerOrders, validAiOrders } = pruneInvalidOrders(
            enclavesAfterDisasters, routesAfterDisasters, playerPendingOrders, aiPendingOrders
        );
        const allValidOrders = { ...validPlayerOrders, ...validAiOrders };

        // --- 3. Order Resolution Pipeline ---
        const enclavesAfterHolding = resolveHolding(enclavesAfterDisasters, allValidOrders, routesAfterDisasters, gameConfig);
        const enclavesAfterAssists = resolveAssists(enclavesAfterHolding, allValidOrders, gameConfig);
        const { newEnclaveData: enclavesAfterAttacks, newPendingOrders: ordersAfterAttacks } = resolveAttacks(
            enclavesAfterAssists, allValidOrders, gameConfig, effectsToPlay, playerArchetypeKey, playerLegacyKey, opponentArchetypeKey, opponentLegacyKey,
        );
        
        let finalEnclavesMap = enclavesAfterAttacks;

        // --- 4. Game Over Check ---
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
            newRoutes: routesAfterDisasters,
            newCurrentTurn: currentTurn + 1,
            newDisasterMarkers: remainingDisasterMarkers,
            gameOverState,
            effectsToPlay,
            gameSessionId,
        };

    } catch (e) {
        if (e instanceof Error) {
            return { error: `Resolver Error: ${e.message} \n ${e.stack}` };
        }
        return { error: `An unknown error occurred in the turn resolver.` };
    }
};

// --- Web Worker Message Handler ---
self.onmessage = (e: MessageEvent) => {
    const state = JSON.parse(e.data);

    // Re-hydrate all Vector3 instances on entry
    Object.values(state.enclaveData).forEach((enclave: any) => {
        enclave.center = deserializeVector3(enclave.center);
    });
    state.mapData.forEach((cell: any) => {
        cell.center = deserializeVector3(cell.center);
    });
    state.activeDisasterMarkers.forEach((marker: any) => {
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
        state.activeDisasterMarkers,
        state.gameConfig,
        state.playerArchetypeKey,
        state.playerLegacyKey,
        state.opponentArchetypeKey,
        state.opponentLegacyKey,
    );
    
    self.postMessage(JSON.stringify(result));
};
