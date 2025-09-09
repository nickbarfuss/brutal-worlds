import { Enclave, ActiveEffect, DisasterProfile, Route, EffectQueueItem, DisasterRule, MapCell } from '@/types/game';
import { applyContinuousRules, applyInstantaneousRules } from '@/logic/effectProcessor';
export { processMarker, processEffect } from '@/logic/disasters/defaultHandler';

const resolveNumericRange = (value: number | [number, number]): number => {
    if (Array.isArray(value)) {
        return Math.floor(Math.random() * (value[1] - value[0] + 1)) + value[0];
    }
    return value;
};

export const handleContinuous = (
    effect: ActiveEffect,
    profile: DisasterProfile,
    enclave: Enclave,
    workingEnclaves: Map<number, Enclave>,
    workingRoutes: Route[],
    mapData: MapCell[],
) => {
    let removeEffect = false;
    let modifiedEnclave = enclave;
    let modifiedRoutes = workingRoutes;
    const sideEffects: any[] = [];

    if (effect.phase === 'aftermath') {
        const rules: DisasterRule[] = effect.rules || [];
        const damageRule = rules.find(r => r.type === 'forceDamage') as Extract<DisasterRule, { type: 'forceDamage' }> | undefined;
        const dissipateRule = rules.find(r => r.type === 'dissipateOnNoMoveTarget');

        const currentCellId = effect.metadata && effect.metadata.cellId;
        if (currentCellId === undefined) {
             removeEffect = true;
             return { enclave: modifiedEnclave, newRoutes: modifiedRoutes, removeEffect, sideEffects };
        }
        
        const currentCell = mapData[currentCellId];
        // FIX: Add a defensive check to ensure the current cell exists before proceeding.
        if (!currentCell) {
            removeEffect = true;
            return { enclave: modifiedEnclave, newRoutes: modifiedRoutes, removeEffect, sideEffects };
        }

        const connectedAreaCellIds = currentCell.neighbors.filter(id => {
            const cell = mapData[id];
            return cell && cell.type === 'area';
        });

        if (connectedAreaCellIds.length > 0) {
            const targetCellId = connectedAreaCellIds[Math.floor(Math.random() * connectedAreaCellIds.length)];
            const targetCell = mapData[targetCellId];
            
            if (targetCell.enclaveId !== null) {
                const targetEnclave = workingEnclaves.get(targetCell.enclaveId);
                if (targetEnclave) {
                    const aftermathDuration = resolveNumericRange((profile.logic.aftermath && profile.logic.aftermath.duration) || 0);
                    sideEffects.push({
                        type: 'APPLY_IMPACT_AND_EFFECT',
                        targetEnclaveId: targetCell.enclaveId,
                        impactRules: profile.logic.impact.rules,
                        impactDuration: resolveNumericRange(profile.logic.impact.duration),
                        newEffect: {
                            ...effect,
                            id: `eff-${effect.profileKey}-${targetCell.enclaveId}-aftermath-${Date.now()}`,
                            duration: aftermathDuration,
                            maxDuration: aftermathDuration,
                            metadata: { ...effect.metadata, cellId: targetCellId },
                        },
                        effectToPlay: {
                            id: `eff-impact-${effect.profileKey}-${targetCell.enclaveId}-${Date.now()}`,
                            vfxKey: profile.ui.assets.vfxImpact,
                            sfx: { key: profile.ui.assets.sfxImpact, channel: 'fx' as const, position: targetCell.center },
                            position: targetCell.center,
                        }
                    });
                }
            }
            
            removeEffect = true;
        } else {
            if (dissipateRule) {
                removeEffect = true;
            } else if (damageRule) {
                const damageResult = applyInstantaneousRules([damageRule], enclave, modifiedRoutes);
                modifiedEnclave = damageResult.enclave;
                modifiedRoutes = damageResult.routes;
            }
        }
    } else {
        const continuousResult = applyContinuousRules(effect.rules, enclave, modifiedRoutes);
        modifiedEnclave = continuousResult.enclave;
        modifiedRoutes = continuousResult.routes;
    }

    return { enclave: modifiedEnclave, newRoutes: modifiedRoutes, removeEffect, sideEffects };
};