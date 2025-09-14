import { Enclave, ActiveEffect, DisasterProfile, Route, DisasterRule, MapCell } from '@/types/game';
import { applyContinuousRules, applyInstantaneousRules } from '@/logic/effectProcessor';
export { processMarker, processEffect } from '@/logic/disasters/defaultHandler';
import { queueEffectAssets } from '@/logic/turnResolver';

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

        // Initialize movesRemaining if not already set
        if (effect.metadata.movesRemaining === undefined) {
            effect.metadata.movesRemaining = resolveNumericRange(profile.logic.aftermath.movement);
        }

        // Apply impact at current location if not already impacted this turn
        // The `hasImpactedThisTurn` flag should be reset by the game engine at the start of each turn.
        if (!effect.metadata.hasImpactedThisTurn) {
            queueEffectAssets(profile, 'impact', currentCell.center, sideEffects);

            // Apply impact rules to the current enclave if it exists
            if (currentCell.enclaveId !== null) {
                const currentEnclave = workingEnclaves.get(currentCell.enclaveId);
                if (currentEnclave) {
                    const impactRules = profile.logic.impact.rules;
                    const impactResult = applyInstantaneousRules(impactRules, currentEnclave, modifiedRoutes);
                    modifiedEnclave = impactResult.enclave;
                    modifiedRoutes = impactResult.routes;
                }
            }
            effect.metadata.hasImpactedThisTurn = true; // Mark as impacted for this turn
        }

        // Movement logic
        if (effect.metadata.movesRemaining > 0) {
            const connectedAreaCellIds = currentCell.neighbors.filter(id => {
                const cell = mapData[id];
                return cell && cell.type === 'area';
            });

            if (connectedAreaCellIds.length > 0) {
                const targetCellId = connectedAreaCellIds[Math.floor(Math.random() * connectedAreaCellIds.length)];
                effect.metadata.cellId = targetCellId; // Update cellId for next turn
                effect.metadata.movesRemaining--;
            } else {
                // No valid move target, dissipate if rule exists
                if (dissipateRule) {
                    removeEffect = true;
                } else if (damageRule) {
                    const damageResult = applyInstantaneousRules([damageRule], enclave, modifiedRoutes);
                    modifiedEnclave = damageResult.enclave;
                    modifiedRoutes = damageResult.routes;
                }
            }
        } else {
            // No moves remaining, remove effect
            removeEffect = true;
        }
    } else {
        const continuousResult = applyContinuousRules(effect.rules, enclave, modifiedRoutes);
        modifiedEnclave = continuousResult.enclave;
        modifiedRoutes = continuousResult.routes;
    }

    return { enclave: modifiedEnclave, newRoutes: modifiedRoutes, removeEffect, sideEffects };
};