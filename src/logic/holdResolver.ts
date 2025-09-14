import { Enclave, PendingOrders, Route } from '@/types/game.ts';
import { GameConfig } from '@/types/game.ts';
import { getAppliedModifiers } from '@/logic/effectProcessor.ts';
import { getHoldingBonusForEnclave } from '@/logic/birthrightManager.ts';
import { cloneEnclave } from '@/logic/cloneUtils.ts';

export const resolveHolding = (
    currentEnclavesMap: Map<number, Enclave>,
    processedOrders: PendingOrders,
    currentRoutes: Route[],
    gameConfig: GameConfig
): Map<number, Enclave> => {
    const { FORCE_SUPPLY_CAP } = gameConfig;
    const reinforcementDeltas = new Map<number, number>();

    // --- PASS 1: Determine which enclaves are holding and calculate their reinforcements ---
    for (const enclave of currentEnclavesMap.values()) {
        if ((enclave.owner === 'player-1' || enclave.owner === 'player-2') && !processedOrders[enclave.id]) {
            let reinforcements = 2; // Standard holding value
            reinforcements += getHoldingBonusForEnclave(enclave);

            const { productionModifier } = getAppliedModifiers(enclave);
            const finalReinforcements = Math.floor(reinforcements * productionModifier);
            
            if (finalReinforcements > 0) {
                reinforcementDeltas.set(enclave.id, finalReinforcements);
            }
        }
    }
    
    // --- (Future) Birthright Effects Pass ---
    // This section is currently disabled but would follow the same pattern.
    // const birthrightDeltas = applyHoldingBirthrightEffects(...);
    // birthrightDeltas.forEach((delta, id) => reinforcementDeltas.set(id, (reinforcementDeltas.get(id) || 0) + delta));

    if (reinforcementDeltas.size === 0) {
        return currentEnclavesMap;
    }

    // --- PASS 2: Apply all reinforcements using a copy-on-write strategy ---
    const newEnclavesMap = new Map<number, Enclave>(currentEnclavesMap);
    for (const [id, reinforcements] of reinforcementDeltas.entries()) {
        const originalEnclave = newEnclavesMap.get(id)!;
        const newEnclave = cloneEnclave(originalEnclave);
        const safeForces = Number.isFinite(newEnclave.forces) ? newEnclave.forces : 0;
        newEnclave.forces = Math.min(FORCE_SUPPLY_CAP, safeForces + reinforcements);
        newEnclavesMap.set(id, newEnclave);
    }

    return newEnclavesMap;
};
