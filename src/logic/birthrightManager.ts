import { Enclave, Route } from '@/types/game.ts';

// DEACTIVATED: These functions are stubs. The birthright system is disabled pending a refactor.

/**
 * Calculates the additional combat bonus for an attacking enclave based on its Birthright.
 * @param enclave - The attacking enclave.
 * @returns The numerical combat bonus. Currently stubbed to 0.
 */
export const getAttackBonusForEnclave = (enclave: Enclave): number => {
    return 0;
};

/**
 * Gets the force multiplier for an assist order based on the origin enclave's Birthright.
 * @param enclave - The enclave issuing the assist order.
 * @returns The force multiplier. Returns the standard 0.25 assist value.
 */
export const getAssistMultiplierForEnclave = (enclave: Enclave): number => {
    return 0.25; // Standard assist
};

/**
 * Applies Birthright effects related to the 'Holding' order that do not grant forces.
 * @param newEnclaveStates - The current state of all enclaves.
 * @returns The updated enclave states. Currently a no-op.
 */
export const applyHoldingBirthrightEffects = (
    newEnclaveStates: { [id: number]: Enclave },
    holdingEnclaveIds: number[],
    routes: Route[]
): { [id: number]: Enclave } => {
    return newEnclaveStates;
};

/**
 * Gets the bonus reinforcements for a holding enclave based on its Birthright.
 * @param enclave - The holding enclave.
 * @returns The numerical bonus to reinforcements. Currently stubbed to 0.
 */
export const getHoldingBonusForEnclave = (enclave: Enclave): number => {
    return 0;
};
