import { Enclave, PendingOrders, Player, Order, TurnEvent, Rule, GameState, Route } from '@/types/game.ts';
import { GameConfig } from '@/types/game.ts';
import { getAppliedModifiers } from '@/logic/events';
import { getAttackBonusForEnclave } from '@/logic/birthrights';
import { cloneEnclave } from '@/logic/enclaves';
import { EVENT_PROFILES } from '@/data/events.ts';
import { resolveConquests } from '@/logic/conquests';

interface Attack {
    from: number;
    owner: Player;
    units: number; 
    force: number; 
    bonus: number;
    power: number;
    archetypeKey?: string;
}

export const resolveAttacks = (
    currentEnclavesMap: Map<number, Enclave>,
    processedOrders: PendingOrders,
    gameConfig: GameConfig,
    playerArchetypeKey: string | null,
    playerLegacyKey: string | null,
    opponentArchetypeKey: string | null,
    opponentLegacyKey: string | null,
    routes: Route[],
): { newEnclaveData: Map<number, Enclave>, newPendingOrders: PendingOrders, events: TurnEvent[] } => {
    let newEnclavesMap = new Map<number, Enclave>(currentEnclavesMap);
    const newPendingOrders = { ...processedOrders };
    const events: TurnEvent[] = [];

    const attackOrders = new Map<number, Attack[]>();
    const forcesLeaving: { [fromId: number]: number } = {};

    // 1. Calculate forces leaving and group attacks by target.
    Object.entries(newPendingOrders).forEach(([fromIdStr, orderUntyped]) => {
        if (!orderUntyped) return;
        const order = orderUntyped as Order;
        if (order.type !== 'attack') return;

        const fromId = parseInt(fromIdStr, 10);
        const origin = newEnclavesMap.get(fromId);
        const target = newEnclavesMap.get(order.to);

        if (!origin || !origin.owner || !target) return;

        events.push({ 
            type: 'attack', 
            fromEnclaveId: fromId, 
            toEnclaveId: order.to, 
            owner: origin.owner 
        });

        const safeForces = Number.isFinite(origin.forces) ? origin.forces : 0;
        const unitsLeaving = Math.ceil(safeForces * gameConfig.ATTACK_RATE);

        if (unitsLeaving > 0 && safeForces >= unitsLeaving) {
            forcesLeaving[fromId] = unitsLeaving;
            const rules: Rule[] = origin.activeEvents.flatMap(event => {
                const profile = EVENT_PROFILES[event.profileKey];
                if (!profile) return [];
                const phaseLogic = profile.logic[event.phase];
                return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
            });
            const enclaveData = Object.fromEntries(newEnclavesMap.entries());
            const { combatModifier } = getAppliedModifiers(origin, rules, { enclaveData, routes } as Partial<GameState> as GameState);
            const effectiveForce = Math.floor(unitsLeaving * combatModifier);
            const bonus = 1 + getAttackBonusForEnclave(origin);
            
            if (!attackOrders.has(order.to)) attackOrders.set(order.to, []);
            attackOrders.get(order.to)!.push({ 
                from: fromId, owner: origin.owner as Player, units: unitsLeaving,
                force: effectiveForce, bonus: bonus, power: effectiveForce + bonus,
                archetypeKey: origin.archetypeKey,
            });
        }
    });

    // 2. Subtract leaving forces (copy-on-write).
    for (const fromIdStr in forcesLeaving) {
        const fromId = parseInt(fromIdStr, 10);
        const origin = newEnclavesMap.get(fromId)!;
        const newOrigin = cloneEnclave(origin);
        newOrigin.forces -= forcesLeaving[fromId];
        newEnclavesMap.set(fromId, newOrigin);
    }
    
    // 3. Resolve battles for each target.
    attackOrders.forEach((attackers, targetId) => {
        const conquestResult = resolveConquests(
            attackers,
            targetId,
            newEnclavesMap,
            gameConfig,
            playerLegacyKey,
            opponentLegacyKey,
            routes
        );
        newEnclavesMap = conquestResult.newEnclavesMap;
        events.push(...conquestResult.events);
    });

    return { newEnclaveData: newEnclavesMap, newPendingOrders, events };
};