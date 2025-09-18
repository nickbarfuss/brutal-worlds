import { Enclave, Route, ActiveDisasterMarker, EventQueueItem, ActiveEvent, MapCell, GameState } from '@/types/game';
import { DISASTERS } from '@/data/disasters';
import { applyContinuousEffects, applyInstantaneousRules } from '@/logic/events/eventProcessor';
import { cloneEnclave } from '@/logic/cloneUtils';
import * as defaultHandler from '@/logic/disasters/defaultHandler';
import * as entropyWindHandler from '@/logic/disasters/entropyWind';

const disasterHandlers: { [key: string]: any } = {
    default: defaultHandler,
    entropyWind: entropyWindHandler,
};

export const processDisasterEffects = (
    initialEnclavesMap: Map<number, Enclave>,
    initialRoutes: Route[],
    currentMarkers: ActiveDisasterMarker[],
    effectsToPlay: EventQueueItem[],
    mapData: MapCell[],
) => {
    let workingEnclaves = new Map<number, Enclave>(initialEnclavesMap);
    let workingRoutes = JSON.parse(JSON.stringify(initialRoutes)); // Deep copy for mutation
    
    // --- STEP 1: APPLY CONTINUOUS EFFECTS ---
    const continuousUpdateMap = new Map<number, Enclave>();
    const allSideEffects: any[] = []; 

    for (const [id, enclave] of workingEnclaves.entries()) {
        if (!enclave.activeEvents || enclave.activeEvents.length === 0) continue;
        
        let modifiedEnclave = cloneEnclave(enclave);
        let modifiedRoutes = workingRoutes;

        for (let i = modifiedEnclave.activeEvents.length - 1; i >= 0; i--) {
            const event = modifiedEnclave.activeEvents[i];
            const profile = DISASTERS[event.profileKey];
            if (!profile) continue;
            
            const handler = disasterHandlers[event.profileKey] || disasterHandlers.default;
            if (handler && handler.handleContinuous) {
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
        if (sideEffect.type === 'APPLY_IMPACT_AND_EFFECT') {
            let targetEnclave = workingEnclaves.get(sideEffect.targetEnclaveId);
            if (targetEnclave) {
                const clonedTarget = cloneEnclave(targetEnclave);
                const impactResult = applyInstantaneousRules(sideEffect.impactRules, clonedTarget, workingRoutes);
                
                const newEnclaveState = impactResult.enclave;
                workingRoutes = impactResult.routes;

                newEnclaveState.activeEvents.push(sideEffect.newEvent);
                workingEnclaves.set(sideEffect.targetEnclaveId, newEnclaveState);
                if (sideEffect.eventToPlay) {
                    effectsToPlay.push(sideEffect.eventToPlay);
                }
            }
        }
    });
    
    // --- STEP 2: PROCESS MARKERS AND PHASE TRANSITIONS ---
    const remainingDisasterMarkers: ActiveDisasterMarker[] = [];
    const eventsToAdd: { enclaveId: number, event: ActiveEvent }[] = [];
    
    currentMarkers.forEach(marker => {
        marker.durationInPhase--;
        if (marker.durationInPhase <= 0) {
            const profile = DISASTERS[marker.profileKey];
            if (!profile) return;
            
            const handler = disasterHandlers[marker.profileKey] || disasterHandlers.default;
            if (handler && handler.processMarker) {
                const result = handler.processMarker(marker, profile, workingEnclaves, workingRoutes, effectsToPlay, mapData);
                result.eventsToAdd?.forEach((e: { enclaveId: number, event: ActiveEvent }) => eventsToAdd.push(e));
                workingRoutes = result.newRoutes || workingRoutes;
            }
        } else {
            remainingDisasterMarkers.push(marker);
        }
    });
    
    for (const enclave of workingEnclaves.values()) {
        const remainingEvents: ActiveEvent[] = [];
        for (const event of enclave.activeEvents) {
            event.duration--;
            if (event.duration > 0) {
                remainingEvents.push(event);
            } else {
                const profile = DISASTERS[event.profileKey];
                if (!profile) continue;
                
                const handler = disasterHandlers[event.profileKey] || disasterHandlers.default;
                if (handler && handler.processEffect) {
                    const result = handler.processEffect(event, profile, enclave, workingEnclaves, workingRoutes, effectsToPlay, mapData);
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
        remainingDisasterMarkers,
    };
};
