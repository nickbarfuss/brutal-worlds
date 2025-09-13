import { Enclave, Domain, MapCell, Expanse, ActiveEffectMarker, EffectProfile, Rift, EffectQueueItem, SfxPlayback } from '@/types/game.ts';
import { getRandomAssetKey } from '@/utils/assetUtils.ts';
import * as THREE from 'three';

interface TriggerContext {
    enclaveData: { [id: number]: Enclave };
    domainData: { [id: number]: Domain };
    mapData: MapCell[];
    expanseData: { [id: number]: Expanse };
    riftData: { [id: number]: Rift };
}

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

export const triggerNewEffect = (profile: EffectProfile, context: TriggerContext) => {

    const { enclaveData, mapData } = context;

    let siteCount = resolveNumericRange(profile.logic.siteCount);
    const originType = profile.logic.originCellType;

    let candidateCells: MapCell[];
    if (originType === 'Area') {
        candidateCells = mapData.filter(c => c.type === 'area');
    } else if (originType === 'Void') {
        candidateCells = mapData.filter(c => c.type === 'void');
    } else { // 'Area or Void'
        candidateCells = mapData;
    }

    if (candidateCells.length === 0) return null;

    const newMarkers: ActiveEffectMarker[] = [];
    const effectsToPlay: EffectQueueItem[] = [];
    let locationName = "an unknown region";

    const chosenCells: MapCell[] = [];
    const shuffledCandidates = [...candidateCells].sort(() => 0.5 - Math.random());
    for (let i = 0; i < Math.min(siteCount, shuffledCandidates.length); i++) {
        chosenCells.push(shuffledCandidates[i]);
    }
    
    if (chosenCells.length === 0) return null;

    chosenCells.forEach((cell, index) => {
        const alertPhase = profile.logic.alert;
        const radiusInCells = resolveNumericRange(typeof alertPhase.radius === 'function' ? alertPhase.radius() : alertPhase.radius);
        
        // FIX: Calculate affected enclaves and add them to marker metadata for downstream logic.
        const cellsInRadius = getCellsInRadius(cell.id, radiusInCells, mapData);
        const targetEnclaveIds = [...new Set(
            [...cellsInRadius]
                .map(id => mapData[id]?.enclaveId)
                .filter((id): id is number => id !== null)
        )];
        
        const newMarker: ActiveEffectMarker = {
            id: `eff-site-${profile.key}-${cell.id}-${Date.now()}`,
            profileKey: profile.key,
            cellId: cell.id,
            position: cell.center.clone(),
            currentPhase: 'alert',
            durationInPhase: resolveNumericRange(alertPhase.duration),
            radius: radiusInCells,
            movement: resolveNumericRange(alertPhase.movement),
            effects: [profile.key],
            metadata: { targetEnclaveIds }, // Store for later phases
        };
        newMarkers.push(newMarker);
        
        // For the snackbar, report the location of the first site created.
        if (index === 0) {
            if (cell.enclaveId !== null && enclaveData[cell.enclaveId]) {
                locationName = enclaveData[cell.enclaveId].name;
            } else {
                let closestDist = Infinity;
                Object.values(enclaveData).forEach(e => {
                    const dist = e.center.distanceToSquared(cell.center);
                    if (dist < closestDist) {
                        closestDist = dist;
                        locationName = e.name;
                    }
                });
            }
        }

        const selectedAlertSfxKey = getRandomAssetKey(profile.ui.assets.sfx?.alert);
        const selectedAlertVfxKey = getRandomAssetKey(profile.ui.assets.vfx?.alert);
        const selectedAlertDialogKey = getRandomAssetKey(profile.ui.assets.dialog?.alert);
        
        if (selectedAlertVfxKey) {
            effectsToPlay.push({
                id: `eff-${profile.key}-alert-vfx-${cell.id}-${Date.now()}`,
                vfxKey: selectedAlertVfxKey,
                position: cell.center,
            });
        }
        if (selectedAlertSfxKey) {
            effectsToPlay.push({
                id: `eff-${profile.key}-alert-sfx-${cell.id}-${Date.now()}`,
                sfx: { key: selectedAlertSfxKey, channel: 'fx', position: cell.center },
                position: cell.center,
            });
        }
        if (selectedAlertDialogKey) {
            effectsToPlay.push({
                id: `eff-${profile.key}-alert-dialog-${cell.id}-${Date.now()}`,
                sfx: { key: selectedAlertDialogKey, channel: 'dialog', position: cell.center },
                position: cell.center,
            });
        }
    });

    const snackbarData = { profile, locationName };

    return { newMarkers, snackbarData, effectsToPlay };
};
