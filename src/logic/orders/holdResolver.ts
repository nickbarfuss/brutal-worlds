import { Enclave, PendingOrders, Route, Rule, GameState, TurnEvent } from '@/types/game.ts';
import { GameConfig } from '@/types/game.ts';
import { getAppliedModifiers } from '@/logic/events';
import { getHoldBonusForEnclave } from '@/logic/birthrights';
import { cloneEnclave } from '@/logic/enclaves';
import { EVENTS } from '@/data/events.ts';

export const resolveHolding = (
    currentEnclavesMap: Map<number, Enclave>,
    processedOrders: PendingOrders,
    currentRoutes: Route[],
    gameConfig: GameConfig,
): { newEnclaveData: Map<number, Enclave>, events: TurnEvent[] } => {
    const { FORCE_SUPPLY_CAP } = gameConfig;
    const reinforcementDeltas = new Map<number, number>();
    const events: TurnEvent[] = [];

    // --- PASS 1: Determine which enclaves are holding and calculate their reinforcements ---
    for (const enclave of currentEnclavesMap.values()) {
        if ((enclave.owner === 'player-1' || enclave.owner === 'player-2') && !processedOrders[enclave.id]) {
            events.push({ type: 'hold', enclaveId: enclave.id });

            let reinforcements = 2; // Standard holding value
            reinforcements += getHoldBonusForEnclave(enclave);

            const rules: Rule[] = enclave.activeEvents.flatMap(event => {
                const profile = EVENTS[event.profileKey];
                if (!profile) return [];
                const phaseLogic = profile.logic[event.phase];
                return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
            });
            const enclaveData = Object.fromEntries(currentEnclavesMap.entries());
            const { productionModifier } = getAppliedModifiers(enclave, rules, { enclaveData, routes: currentRoutes } as Partial<GameState> as GameState);
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
        return { newEnclaveData: currentEnclavesMap, events };
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

    return { newEnclaveData: newEnclavesMap, events };
};
