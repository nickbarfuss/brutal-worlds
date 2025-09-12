import { Enclave, ActiveDisasterMarker, ActiveEffect, DisasterProfile, Route, EffectQueueItem, SfxPlayback, MapCell } from '@/types/game';
import { applyInstantaneousRules } from '@/logic/effectProcessor';
import { queueEffectAssets } from '@/logic/turnResolver';

const resolveNumericRange = (value: number | [number, number]): number => {
    if (Array.isArray(value)) {
        return Math.floor(Math.random() * (value[1] - value[0] + 1)) + value[0];
    }
    return value;
};

// Helper to find all cells within a certain graph distance (radius) from a starting cell.
const getCellsInRadius = (startCellId: number, radius: number, mapData: MapCell[]): Set<number> => {
    const cellsInRadius = new Set<number>([startCellId]);
    if (radius <= 0) return cellsInRadius;

    const queue: { id: number, depth: number }[] = [{ id: startCellId, depth: 0 }];
    const visited = new Set<number>([startCellId]);

    while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        if (depth >= radius) continue;

        const currentCell = mapData[id];
        if (currentCell) {
            for (const neighborId of currentCell.neighbors) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    cellsInRadius.add(neighborId);
                    queue.push({ id: neighborId, depth: depth + 1 });
                }
            }
        }
    }
    return cellsInRadius;
};

export const processMarker = (
    marker: ActiveDisasterMarker,
    profile: DisasterProfile,
    workingEnclaves: Map<number, Enclave>,
    workingRoutes: Route[],
    effectsToPlay: EffectQueueItem[],
    mapData: MapCell[]
) => {
    const effectsToAdd: { enclaveId: number, effect: ActiveEffect }[] = [];
    let newRoutes = workingRoutes;
    const impactPhase = profile.logic.impact;

    if (impactPhase) {
        const radiusInCells = resolveNumericRange(typeof impactPhase.radius === 'function' ? impactPhase.radius() : impactPhase.radius);
        const cellsInRadius = getCellsInRadius(marker.cellId, radiusInCells, mapData);
        const targetEnclaveIds = [...new Set([...cellsInRadius].map(id => {
            const cell = mapData[id];
            return cell ? cell.enclaveId : null;
        }).filter((id): id is number => id !== null))];
        
        targetEnclaveIds.forEach(enclaveId => {
            let enclave = workingEnclaves.get(enclaveId);
            if (enclave) {
                const impactDuration = resolveNumericRange(impactPhase.duration);
                const impactResult = applyInstantaneousRules(impactPhase.rules, enclave, newRoutes, impactDuration);
                workingEnclaves.set(enclaveId, impactResult.enclave);
                newRoutes = impactResult.routes;
                
                effectsToAdd.push({
                    enclaveId,
                    effect: {
                        id: `eff-${marker.profileKey}-${enclaveId}-impact-${Date.now()}`,
                        profileKey: marker.profileKey,
                        duration: impactDuration,
                        maxDuration: impactDuration,
                        phase: 'impact',
                        rules: impactPhase.rules,
                        metadata: { ...marker.metadata, impactRadius: radiusInCells },
                    }
                });
                
                queueEffectAssets(profile, 'impact', enclave.center, effectsToPlay);
            }
        });
    }

    return { effectsToAdd, newRoutes };
};

export const processEffect = (
    effect: ActiveEffect,
    profile: DisasterProfile,
    enclave: Enclave,
    workingEnclaves: Map<number, Enclave>,
    workingRoutes: Route[],
    effectsToPlay: EffectQueueItem[],
    mapData: MapCell[]
) => {
    const effectsToAdd: { enclaveId: number, effect: ActiveEffect }[] = [];
    
    if (effect.phase === 'impact' && profile.logic.aftermath) {
        const aftermath = profile.logic.aftermath;
        
        const applyRule = aftermath.rules.find(r => r.type === 'applyAftermathOnChance');
        if (applyRule && applyRule.type === 'applyAftermathOnChance' && Math.random() >= applyRule.chance) {
            return { effectsToAdd }; // This enclave resisted the aftermath.
        }

        let radius = (effect.metadata && effect.metadata.impactRadius) ? effect.metadata.impactRadius : 0;
        if (typeof aftermath.radius === 'number' || Array.isArray(aftermath.radius)) {
            radius = resolveNumericRange(aftermath.radius);
        }
        
        const startCellId = effect.metadata && effect.metadata.cellId ? effect.metadata.cellId : enclave.mainCellId;
        const cellsInRadius = getCellsInRadius(startCellId, radius, mapData);

        const targetEnclaveIds = [...new Set([...cellsInRadius].map(id => {
            const cell = mapData[id];
            return cell ? cell.enclaveId : null;
        }).filter((id): id is number => id !== null))];

        targetEnclaveIds.forEach(enclaveId => {
            const duration = resolveNumericRange(aftermath.duration);
            effectsToAdd.push({
                enclaveId: enclaveId,
                effect: {
                    id: `eff-${effect.profileKey}-${enclaveId}-aftermath-${Date.now()}`,
                    profileKey: effect.profileKey,
                    duration, maxDuration: duration, phase: 'aftermath',
                    rules: aftermath.rules, metadata: effect.metadata,
                }
            });

            const targetEnclave = workingEnclaves.get(enclaveId);
            if (targetEnclave) {
                 queueEffectAssets(profile, 'aftermath', targetEnclave.center, effectsToPlay);
            }
        });
    }
    
    return { effectsToAdd };
};