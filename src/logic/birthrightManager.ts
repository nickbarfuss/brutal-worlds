import { Enclave, Route } from '@/types/game.ts';

// =================================================================================================
// NOTE: SYSTEM DEACTIVATED PENDING REFACTOR
// =================================================================================================
// The new birthright system introduces more complex, non-numerical effects (e.g., revealing
// units, disabling routes) that do not fit into the existing resolver structure.
//
// These functions are temporarily deactivated to prevent conflicts between the old game
// logic and the new UI/data structures. The turn resolver will now use default game
// rules until this manager can be refactored to handle the new, more varied birthright effects.
// =================================================================================================


/**
 * Calculates the additional combat bonus for an attacking enclave based on its Birthright.
 * @param enclave - The attacking enclave.
 * @returns The numerical combat bonus (e.g., 1 for First Sword).
 */
export const getAttackBonusForEnclave = (_enclave: Enclave): number => {
    // if (enclave.archetypeKey === 'firstSword') {
    //     return 1; // Kinetic Onslaught bonus
    // }
    return 0;
};

/**
 * Gets the force multiplier for an assist order based on the origin enclave's Birthright.
 * @param enclave - The enclave issuing the assist order.
 * @returns The force multiplier (e.g., 0.50 for Labyrinthine Ghost, 0.25 otherwise).
 */
export const getAssistMultiplierForEnclave = (_enclave: Enclave): number => {
    // if (enclave.archetypeKey === 'labyrinthineGhost') {
    //     return 0.50; // Panopticon Web bonus
    // }
    return 0.25; // Standard assist
};

/**
 * Applies Birthright effects related to the 'Holding' order that do not grant forces.
 * This is primarily for effects on neighboring enclaves, like Memetic Resonance.
 * @param newEnclaveStates - The current state of all enclaves.
 * @param holdingEnclaveIds - A list of IDs for enclaves that are holding this turn.
 * @param routes - The list of all routes.
 * @returns The updated enclave states.
 */
/**
 * Applies Birthright effects related to the 'Hold' order that do not grant forces.
 * This function is currently a placeholder for future logic.
 * @param holdEnclaveIds - A list of IDs for enclaves that are holding this turn.
 * @param _enclaveData - The map of all enclaves.
 */
export const applyHoldBirthrightEffects = (
    _holdEnclaveIds: number[],
    _enclaveData: { [id: number]: Enclave }
) => {
    // Example of future logic:
    // const holdingPactWhispererIds = holdEnclaveIds.filter(id => {
    //     const enclave = _enclaveData[id];
    //     return enclave && enclave.archetypeKey === 'pactWhisperer';
    // });

    // if (holdingPactWhispererIds.length > 0) {
    //     // Apply some effect based on the number of holding Pact Whisperers
    //     holdingPactWhispererIds.forEach(enclaveId => {
    //         // ... logic to apply effect
    //     });
    // }

    // This function currently does not modify state, but it could in the future.
    return {
        // Return any state changes here, e.g., updated enclaves or new effects.
    };
};

    // // --- BIRTHRIGHT: Memetic Resonance (Pact Whisperer) ---
    // const holdingPactWhispererIds = holdingEnclaveIds.filter(id => {
    //     const enclave = newEnclaveStates[id];
    //     return enclave.archetypeKey === 'pactWhisperer';
    // });

    // if (holdingPactWhispererIds.length > 0) {
    //     // Use a Set to ensure we only affect each neutral enclave once, even if it's adjacent to multiple Pact Whisperers.
    //     const neutralsToAffect = new Set<number>();
        
    //     holdingPactWhispererIds.forEach(enclaveId => {
    //         routes.forEach(r => {
    //             if ((r.from === enclaveId || r.to === enclaveId) && !r.isDestroyed) {
    //                 // FIX: Corrected a typo from 'from' to 'r.from', which caused a ReferenceError.
    //                 const neighborId = r.from === enclaveId ? r.to : r.from;
    //                 const neighbor = newEnclaveStates[neighborId];
    //                 if (neighbor && neighbor.owner === null) {
    //                     neutralsToAffect.add(neighborId);
    //                 }
    //             }
    //         });
    //     });
        
    //     neutralsToAffect.forEach(neutralId => {
    //         const neutral = newEnclaveStates[neutralId];
    //         // FIX: Add a defensive check to ensure the enclave exists before modifying it.
    //         // This prevents a TypeError if a route points to a non-existent neighbor,
    //         // which could crash the web worker and cause an 'Uncaught' error.
    //         if (neutral) {
    //             // FIX: Sanitize the neutral enclave's force count before calculation.
    //             const safeForces = Number.isFinite(neutral.forces) ? neutral.forces : 0;
    //             neutral.forces = Math.max(0, safeForces - 1);
    //         }
    //     });
    // }

    //return newEnclaveStates;
//};

/**
 * Gets the bonus reinforcements for a holding enclave based on its Birthright.
 * @param enclave - The holding enclave.
 * @returns The numerical bonus to reinforcements (e.g., 1 for Genesis Forge).
 */
export const getHoldBonusForEnclave = (_enclave: Enclave): number => {
    // if (enclave.archetypeKey === 'resonanceWarden') {
    //     return 1; // Genesis Forge bonus
    // }
    return 0;
};