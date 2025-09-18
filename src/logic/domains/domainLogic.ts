import { Enclave, Owner, GameState } from '@/types/game.ts';

/**
 * Determines the owner of a domain based on the ownership of its constituent enclaves.
 * This function is the single source of truth for domain ownership.
 * @param domainId - The ID of the domain to check.
 * @param enclaveData - The current state of all enclaves.
 * @returns The owner ('player-1', 'player-2') if all enclaves in the domain belong to that owner, otherwise null (for contested, neutral, or empty domains).
 */
export const getDomainOwner = (domainId: number, enclaveData: GameState['enclaveData']): Owner => {
    // FIX: Explicitly type `e` as `Enclave` to resolve TypeScript's incorrect inference of `unknown`, which caused property access errors.
    const enclavesInDomain = Object.values(enclaveData).filter((e: Enclave) => e.domainId === domainId);
    if (enclavesInDomain.length === 0) {
        return null;
    }

    const firstOwner = enclavesInDomain[0].owner;
    // Check if all enclaves have the same owner as the first one.
    const allSameOwner = enclavesInDomain.every(e => e.owner === firstOwner);

    if (allSameOwner) {
        // If they all have the same owner, return that owner (this can be null for a fully neutral domain).
        return firstOwner;
    } else {
        // If there's a mix of owners, the domain is contested.
        return null;
    }
};
