import { Enclave, Route, PendingOrders, Order, GameState, Rule } from '@/types/game.ts';
import { getAssistMultiplierForEnclave, getAttackBonusForEnclave } from '@/logic/birthrightManager.ts';
import { getAppliedModifiers } from '@/logic/effectProcessor.ts';
import { EFFECT_PROFILES } from '@/data/effects.ts';

const findWeakestEnclave = (candidates: Enclave[]): Enclave | null => {
    if (candidates.length === 0) return null;
    const sortedCandidates = [...candidates].sort((a, b) => {
        const forcesA = Number.isFinite(a.forces) ? a.forces : 0;
        const forcesB = Number.isFinite(b.forces) ? b.forces : 0;
        if (forcesA !== forcesB) return forcesA - forcesB;
        return a.id - b.id;
    });
    return sortedCandidates[0];
};

const findBestMoveForEnclave = (
    origin: Enclave,
    enclaveData: { [id: number]: Enclave },
    routes: Route[],
    adjacencyList: Map<number, number[]>
): Order | null => {
    const safeOriginForces = Number.isFinite(origin.forces) ? origin.forces : 0;
    if (safeOriginForces <= 0) return null;

    const potentialAttackTargets: Enclave[] = [];
    const potentialAssistTargets: Enclave[] = [];
    const neighbors = adjacencyList.get(origin.id) || [];

    for (const adjacentId of neighbors) {
        const adjacentEnclave = enclaveData[adjacentId];
        if (adjacentEnclave) {
            if (adjacentEnclave.owner !== 'player-2') {
                potentialAttackTargets.push(adjacentEnclave);
            } else if (adjacentEnclave.id !== origin.id) {
                potentialAssistTargets.push(adjacentEnclave);
            }
        }
    }

    const weakestAttackTarget = findWeakestEnclave(potentialAttackTargets);
    const weakestAlly = findWeakestEnclave(potentialAssistTargets);

    if (weakestAttackTarget && safeOriginForces > 2) {
        const rules: Rule[] = origin.activeEffects.flatMap(effect => {
            const profile = EFFECT_PROFILES[effect.profileKey];
            if (!profile) return [];
            const phaseLogic = profile.logic[effect.phase];
            return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
        });
        const { combatModifier } = getAppliedModifiers(origin, rules, { enclaveData, routes } as Partial<GameState> as GameState);
        const forceToSend = Math.ceil(safeOriginForces * 0.35);
        const effectiveForce = Math.floor(forceToSend * combatModifier);
        const totalDamage = effectiveForce + 1 + getAttackBonusForEnclave(origin);
        const safeTargetForces = Number.isFinite(weakestAttackTarget.forces) ? weakestAttackTarget.forces : Infinity;

        if (totalDamage >= safeTargetForces) {
            return { to: weakestAttackTarget.id, type: 'attack' };
        }
    }

    const DANGER_THRESHOLD = 5;
    const MIN_ASSIST_FORCE = 5;
    const safeAllyForces = weakestAlly && Number.isFinite(weakestAlly.forces) ? weakestAlly.forces : Infinity;

    if (weakestAlly && safeAllyForces < DANGER_THRESHOLD && safeOriginForces >= MIN_ASSIST_FORCE) {
        const assistMultiplier = getAssistMultiplierForEnclave(origin);
        const forceToSend = Math.ceil(safeOriginForces * assistMultiplier);
        if (safeOriginForces - forceToSend > 2) {
            return { to: weakestAlly.id, type: 'assist' };
        }
    }

    return null; // Represents a "Hold" decision
};

export const calculateAIOrderChanges = (
  enclaveData: { [id: number]: Enclave },
  routes: Route[],
  currentAiOrders: PendingOrders
): { newOrders: PendingOrders, ordersToCancel: number[] } => {
    const newOrders: PendingOrders = {};
    const ordersToCancel: number[] = [];
    const opponentEnclaves = Object.values(enclaveData).filter(e => e.owner === 'player-2');

    const adjacencyList = new Map<number, number[]>();
    routes.forEach(route => {
        if (route.isDestroyed || route.disabledForTurns > 0) return;
        if (!adjacencyList.has(route.from)) adjacencyList.set(route.from, []);
        if (!adjacencyList.has(route.to)) adjacencyList.set(route.to, []);
        adjacencyList.get(route.from)!.push(route.to);
        adjacencyList.get(route.to)!.push(route.from);
    });

    opponentEnclaves.forEach(origin => {
        const existingOrder = currentAiOrders[origin.id];
        const bestMove = findBestMoveForEnclave(origin, enclaveData, routes, adjacencyList);

        if (existingOrder) {
            if (bestMove) {
                if (bestMove.to !== existingOrder.to || bestMove.type !== existingOrder.type) {
                    newOrders[origin.id] = bestMove; // Change order
                }
            } else {
                ordersToCancel.push(origin.id); // Cancel order
            }
        } else {
            if (bestMove) {
                newOrders[origin.id] = bestMove; // Issue new order
            }
        }
    });

    return { newOrders, ordersToCancel };
};