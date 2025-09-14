import { Enclave, Route, ActiveDisasterMarker, EffectQueueItem, ActiveEffect, MapCell } from '@/types/game';
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
        if (sideEffect.type === 'APPLY_IMPACT_AND_EFFECT') {
            let targetEnclave = workingEnclaves.get(sideEffect.targetEnclaveId);
            if (targetEnclave) {
                const clonedTarget = cloneEnclave(targetEnclave);
                const impactResult = applyInstantaneousRules(sideEffect.impactRules, clonedTarget, workingRoutes, sideEffect.impactDuration);
                
                const newEnclaveState = impactResult.enclave;
                workingRoutes = impactResult.routes;

                newEnclaveState.activeEffects.push(sideEffect.newEffect);
                workingEnclaves.set(sideEffect.targetEnclaveId, newEnclaveState);
                if (sideEffect.effectToPlay) {
                    effectsToPlay.push(sideEffect.effectToPlay);
                }
            }
        }
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
