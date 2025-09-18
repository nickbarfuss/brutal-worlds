import { Enclave } from '@/types/game.ts';

/**
 * Safely performs a deep-enough clone of a single enclave object.
 * This is crucial for the copy-on-write strategy in the turn resolvers,
 * as it correctly preserves THREE.Vector3 instances.
 * @param enclave - The original enclave object.
 * @returns A new, safely cloned enclave object.
 */
export const cloneEnclave = (enclave: Enclave): Enclave => {
    return {
        ...enclave,
        // Vector3 objects must be explicitly cloned to preserve their methods.
        center: enclave.center.clone(),
        // Shallow copy of the events array is sufficient as the objects within are not deeply nested.
        activeEvents: (enclave.activeEvents || []).map(event => ({ ...event })),
    };
};
