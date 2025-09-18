import { Enclave, ActiveDisasterMarker, ActiveEvent, DisasterProfile, Route, EventQueueItem, MapCell } from '@/types/game';
import { applyInstantaneousRules } from '@/logic/events';
import { queueEventAssets } from '@/logic/game';

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
    effectsToPlay: EventQueueItem[],
    mapData: MapCell[]
) => {
    const effectsToAdd: { enclaveId: number, effect: ActiveEvent }[] = [];
    let newRoutes = workingRoutes;
    const impactPhase = profile.logic.impact;

    if (impactPhase) {
        const resolvedRadius = typeof impactPhase.radius === 'function' ? impactPhase.radius() : impactPhase.radius;
        const radiusInCells = resolvedRadius === 'Global' ? 9999 : resolveNumericRange(resolvedRadius);
        const cellsInRadius = getCellsInRadius(marker.cellId, radiusInCells, mapData);
        const targetEnclaveIds = [...new Set([...cellsInRadius].map(id => {
            const cell = mapData[id];
            return cell ? cell.enclaveId : null;
        }).filter((id): id is number => id !== null))];
        
        targetEnclaveIds.forEach(enclaveId => {
            let enclave = workingEnclaves.get(enclaveId);
            if (enclave) {
                const resolvedDuration = impactPhase.duration === 'Permanent' ? 9999 : impactPhase.duration;
                const impactDuration = resolveNumericRange(resolvedDuration);
                const impactResult = applyInstantaneousRules(impactPhase.rules, enclave, newRoutes);
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
                
                queueEventAssets(profile, 'impact', enclave.center, effectsToPlay);
            }
        });
    }

    return { effectsToAdd, newRoutes };
};

export const processEffect = (
    effect: ActiveEvent,
    profile: DisasterProfile,
    enclave: Enclave,
    workingEnclaves: Map<number, Enclave>,
    workingRoutes: Route[],
    effectsToPlay: EventQueueItem[],
    mapData: MapCell[]
) => {
    const effectsToAdd: { enclaveId: number, effect: ActiveEvent }[] = [];
    
    if (effect.phase === 'impact' && profile.logic.aftermath) {
        const aftermath = profile.logic.aftermath;
        
        const applyRule = aftermath.rules.find(r => r.type === 'applyAftermathOnChance');
        if (applyRule && applyRule.type === 'applyAftermathOnChance' && Math.random() >= applyRule.payload.chance) {
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
            const resolvedAftermathDuration = aftermath.duration === 'Permanent' ? 9999 : aftermath.duration;
            const duration = resolveNumericRange(resolvedAftermathDuration);
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
                 queueEventAssets(profile, 'aftermath', targetEnclave.center, effectsToPlay);
            }
        });
    }
    
    return { effectsToAdd };
};