


import { Enclave, Route, DisasterRule } from '@/types/game.ts';

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
