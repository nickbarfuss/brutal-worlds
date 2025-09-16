import { Enclave, PendingOrders, Order, EffectQueueItem } from '@/types/game.ts';
import { GameConfig } from '@/types/game.ts';
import { getAssistMultiplierForEnclave } from '@/logic/birthrightManager.ts';
import { cloneEnclave } from '@/logic/cloneUtils.ts';

export const resolveAssists = (
    currentEnclavesMap: Map<number, Enclave>,
    processedOrders: PendingOrders,
    gameConfig: GameConfig,
    effectsToPlay: EffectQueueItem[],
): Map<number, Enclave> => {
    const { FORCE_SUPPLY_CAP } = gameConfig;
    const forceDeltas = new Map<number, number>();

    // --- PASS 1: Calculate all force deltas based on the initial, stable state ---
    Object.entries(processedOrders).forEach(([fromIdStr, orderUntyped]) => {
        if (!orderUntyped) return;
        const order = orderUntyped as Order;
        if (order.type !== 'assist') return;

        const fromId = parseInt(fromIdStr, 10);
        // Always read from the original, unmodified map for calculations.
        const origin = currentEnclavesMap.get(fromId);
        const destination = currentEnclavesMap.get(order.to);

        if (!origin || !destination) return;

        // Queue the VFX/SFX on the destination enclave
        effectsToPlay.push({
            id: `vfx-assist-${fromId}-${order.to}`,
            sfx: { key: 'order-assist-sfx', channel: 'fx', position: destination.center },
            vfx: ['order-assist-vfx'],
            position: destination.center,
        });

        const assistMultiplier = getAssistMultiplierForEnclave(origin);
        const safeForces = Number.isFinite(origin.forces) ? origin.forces : 0;
        const forceToSend = Math.ceil(safeForces * assistMultiplier);

        if (forceToSend > 0 && safeForces >= forceToSend) {
            // Store the deltas instead of applying them immediately.
            forceDeltas.set(fromId, (forceDeltas.get(fromId) || 0) - forceToSend);
            forceDeltas.set(order.to, (forceDeltas.get(order.to) || 0) + forceToSend);
        }
    });

    // If no transfers occurred, return the original map to avoid unnecessary cloning.
    if (forceDeltas.size === 0) {
        return currentEnclavesMap;
    }

    // --- PASS 2: Apply all calculated deltas using a copy-on-write strategy ---
    const newEnclavesMap = new Map<number, Enclave>(currentEnclavesMap);

    forceDeltas.forEach((delta, enclaveId) => {
        // Use the latest version from newEnclavesMap as the base, in case it was already cloned.
        const baseEnclave = newEnclavesMap.get(enclaveId)!;
        const newEnclave = cloneEnclave(baseEnclave);
        
        newEnclave.forces += delta;
        newEnclave.forces = Math.min(FORCE_SUPPLY_CAP, newEnclave.forces);
        
        newEnclavesMap.set(enclaveId, newEnclave);
    });

    return newEnclavesMap;
};
