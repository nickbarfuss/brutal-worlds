import { Enclave, Route, DisasterRule } from '@/types/game.ts';
import { getRandomAssetKey } from '@/utils/assetUtils.ts';

/**
 * Calculates the combined production and combat modifiers for an enclave from all active effects.
 * This is the single source of truth for how disaster aftermaths affect an enclave's performance.
 * @param enclave - The enclave to check.
 * @returns An object with the final production and combat modifiers.
 */
export const getAppliedModifiers = (enclave: Enclave): { productionModifier: number; combatModifier: number } => {
    let productionModifier = 1.0;
    let combatModifier = 1.0;

    if (enclave.activeEffects) {
        enclave.activeEffects.forEach(effect => {
            // FIX: The rules property is now an array of DisasterRule.
            const rules: DisasterRule[] = Array.isArray(effect.rules) ? effect.rules : [];
            rules.forEach(rule => {
                if (rule.type === 'statModifier') {
                    // FIX: Check for stat type and apply reduction. Replaces old 'forceDisruption' logic.
                    if (rule.stat === 'production') {
                        productionModifier -= rule.reduction;
                    } else if (rule.stat === 'combat') {
                        combatModifier -= rule.reduction;
                    }
                }
            });
        });
    }

    // Modifiers cannot go below 0
    return {
        productionModifier: Math.max(0, productionModifier),
        combatModifier: Math.max(0, combatModifier),
    };
};

const resolveNumericRange = (value: number | [number, number]): number => {
    if (Array.isArray(value)) {
        // Return a random integer within the range (inclusive)
        return Math.floor(Math.random() * (value[1] - value[0] + 1)) + value[0];
    }
    return value;
};


/**
 * Applies instantaneous effects, like the initial blast of a disaster impact.
 * This is for one-time applications when an effect is first applied or transitions phase.
 * @param rules - The effect rules to apply.
 * @param enclave - The target enclave.
 * @param routes - All game routes, for potential modification.
 * @param duration - The duration of the effect that is being applied, for rules that depend on it.
 * @returns An object with the modified enclave and routes.
 */
export function applyInstantaneousRules(
    rules: DisasterRule[], // FIX: Expect an array of rules
    enclave: Enclave,
    routes: Route[],
    duration?: number
): { enclave: Enclave; routes: Route[] } {
    let newEnclave = { ...enclave };
    let newRoutes = [...routes];

    if (!rules) {
        return { enclave: newEnclave, routes: newRoutes };
    }

    // FIX: Iterate over the array of rules.
    for (const rule of rules) {
        if (rule.type === 'forceDamage') {
            let forces = Number.isFinite(newEnclave.forces) ? newEnclave.forces : 0;
            const damageValue = resolveNumericRange(rule.value);

            if (rule.damageType === 'percentage') {
                forces *= (1 - damageValue);
            } else { // 'flat'
                forces -= damageValue;
            }
            
            newEnclave.forces = Math.max(0, Math.floor(forces));
        } else if (rule.type === 'routeDisable') {
            newRoutes
                .filter(r => (r.from === newEnclave.id || r.to === newEnclave.id) && !r.isDestroyed)
                .forEach(r => {
                    if (rule.chance === undefined || Math.random() < rule.chance) {
                        // FIX: Add 1 to account for the end-of-turn tick-down.
                        r.disabledForTurns = rule.duration + 1;
                    }
                });
        } else if (rule.type === 'routeDestroy') {
            newRoutes
                .filter(r => (r.from === newEnclave.id || r.to === newEnclave.id))
                .forEach(r => {
                    if (Math.random() < rule.chance) r.isDestroyed = true;
                });
        }
    }

    return { enclave: newEnclave, routes: newRoutes };
}

/**
 * Applies effects that happen every turn while an effect is active (e.g., damage over time).
 * @param rules - The effect rules to apply.
 * @param enclave - The target enclave.
 * @param routes - All game routes, for potential modification.
 * @returns An object with the modified enclave and routes.
 */
export function applyContinuousRules(
    rules: DisasterRule[], // FIX: Expect an array of rules
    enclave: Enclave,
    routes: Route[]
): { enclave: Enclave; routes: Route[] } {
    let newEnclave = { ...enclave };
    let newRoutes = [...routes];

    if (!rules) {
        return { enclave: newEnclave, routes: newRoutes };
    }

    // FIX: Iterate over the array of rules.
    for (const rule of rules) {
        if (rule.type === 'forceDamage') {
            let currentForces = Number.isFinite(newEnclave.forces) ? newEnclave.forces : 0;
            
            if (currentForces > 0) {
                const damageValue = resolveNumericRange(rule.value);
                if (rule.damageType === 'flat') {
                    currentForces -= damageValue;
                } else if (rule.damageType === 'percentage') {
                     currentForces *= (1 - damageValue);
                }
            }
            
            newEnclave.forces = Math.max(0, Math.floor(currentForces));
        } else if (rule.type === 'routeDisable' && rule.chance !== undefined) {
             const connectedRoutes = newRoutes.filter(
                r => (r.from === newEnclave.id || r.to === newEnclave.id) && !r.isDestroyed && r.disabledForTurns <= 0
            );
            if (connectedRoutes.length > 0 && Math.random() < rule.chance) {
                const routeToDisable = connectedRoutes[Math.floor(Math.random() * connectedRoutes.length)];
                // Disable for 2 turns to ensure it lasts one full turn after the end-of-turn tickdown
                routeToDisable.disabledForTurns = rule.duration + 1; 
            }
        }
    }


    return { enclave: newEnclave, routes: newRoutes };
}

/**
 * Processes a single active effect marker, advancing its phase or resolving it.
 * @param marker The active effect marker to process.
 * @param mapData All map cells.
 * @param enclaveData All enclave data.
 * @param domainData All domain data.
 * @param effectProfiles All effect profiles.
 * @returns An object containing updated markers, enclaves, routes, and any new effects to play.
 */
export function processEffectMarker(
    marker: ActiveEffectMarker,
    mapData: MapCell[],
    enclaveData: { [id: number]: Enclave },
    domainData: { [id: number]: Domain },
    effectProfiles: { [key: string]: EffectProfile },
    routes: Route[],
): {
    updatedMarker: ActiveEffectMarker | null;
    updatedEnclaves: { [id: number]: Enclave };
    updatedRoutes: Route[];
    effectsToPlay: EffectQueueItem[];
} {
    let updatedMarker: ActiveEffectMarker | null = { ...marker };
    let updatedEnclaves: { [id: number]: Enclave } = {};
    let updatedRoutes: Route[] = [...routes];
    const effectsToPlay: EffectQueueItem[] = [];

    const profile = effectProfiles[marker.profileKey];
    if (!profile) {
        console.warn(`Effect profile not found for key: ${marker.profileKey}`);
        return { updatedMarker: null, updatedEnclaves, updatedRoutes, effectsToPlay };
    }

    updatedMarker.durationInPhase--;

    // Apply continuous rules if in a phase that has them
    if (profile.logic[updatedMarker.currentPhase]?.continuousRules) {
        const targetEnclaveIds = updatedMarker.metadata.targetEnclaveIds || [];
        targetEnclaveIds.forEach((enclaveId: number) => {
            const enclave = enclaveData[enclaveId];
            if (enclave) {
                const { enclave: newEnclave, routes: newRoutes } = applyContinuousRules(
                    profile.logic[updatedMarker.currentPhase].continuousRules,
                    enclave,
                    updatedRoutes
                );
                updatedEnclaves[enclaveId] = newEnclave;
                updatedRoutes = newRoutes;
            }
        });
    }

    if (updatedMarker.durationInPhase <= 0) {
        // Transition to next phase or resolve
        const nextPhaseKey = profile.logic[updatedMarker.currentPhase]?.nextPhase;

        if (nextPhaseKey) {
            const nextPhase = profile.logic[nextPhaseKey];
            if (!nextPhase) {
                console.warn(`Next phase '${nextPhaseKey}' not found for effect: ${marker.profileKey}`);
                return { updatedMarker: null, updatedEnclaves, updatedRoutes, effectsToPlay };
            }

            updatedMarker.currentPhase = nextPhaseKey;
            updatedMarker.durationInPhase = resolveNumericRange(nextPhase.duration);

            // Apply instantaneous rules for the new phase
            if (nextPhase.instantaneousRules) {
                const targetEnclaveIds = updatedMarker.metadata.targetEnclaveIds || [];
                targetEnclaveIds.forEach((enclaveId: number) => {
                    const enclave = enclaveData[enclaveId];
                    if (enclave) {
                        const { enclave: newEnclave, routes: newRoutes } = applyInstantaneousRules(
                            nextPhase.instantaneousRules,
                            enclave,
                            updatedRoutes,
                            updatedMarker?.durationInPhase
                        );
                        updatedEnclaves[enclaveId] = newEnclave;
                        updatedRoutes = newRoutes;
                    }
                });
            }

            // Play SFX/VFX for the new phase
            const phaseSfxKey = getRandomAssetKey(profile.ui.assets.sfx?.[nextPhaseKey]);
            const phaseVfxKey = getRandomAssetKey(profile.ui.assets.vfx?.[nextPhaseKey]);
            const phaseDialogKey = getRandomAssetKey(profile.ui.assets.dialog?.[nextPhaseKey]);

            if (phaseVfxKey) {
                effectsToPlay.push({
                    id: `eff-${profile.key}-${nextPhaseKey}-${marker.cellId}-${Date.now()}`,
                    vfxKey: phaseVfxKey,
                    sfx: phaseSfxKey ? { key: phaseSfxKey, channel: 'fx', position: marker.position } : undefined,
                    position: marker.position,
                });
            } else if (phaseSfxKey) { // Play SFX even if there's no VFX
                effectsToPlay.push({
                    id: `eff-${profile.key}-${nextPhaseKey}-sfx-${marker.cellId}-${Date.now()}`,
                    sfx: { key: phaseSfxKey, channel: 'fx', position: marker.position },
                    position: marker.position,
                });
            }

            if (phaseDialogKey) {
                effectsToPlay.push({
                    id: `eff-${profile.key}-${nextPhaseKey}-dialog-${marker.cellId}-${Date.now()}`,
                    sfx: { key: phaseDialogKey, channel: 'dialog', position: marker.position },
                    position: marker.position,
                });
            }

        } else {
            // No next phase, effect resolves
            updatedMarker = null;
        }
    }

    return { updatedMarker, updatedEnclaves, updatedRoutes, effectsToPlay };
}

export function getEffectSfxPlayback(effect: EffectQueueItem): SfxPlayback | undefined {
    if (effect.sfx) {
        return {
            key: effect.sfx.key,
            channel: effect.sfx.channel,
            position: effect.sfx.position,
            loop: effect.sfx.loop || false,
            volume: effect.sfx.volume || 1,
        };
    }
    return undefined;
}