import { Enclave, Player, TurnEvent, Rule, GameState, Route } from '@/types/game.ts';
import { GameConfig } from '@/types/game.ts';
import { getAppliedModifiers } from '@/logic/events';
import { getAttackBonusForEnclave } from '@/logic/birthrights';
import { cloneEnclave } from '@/logic/enclaves';
import { EVENTS } from '@/data/events.ts';

interface Attack {
    from: number;
    owner: Player;
    units: number; 
    force: number; 
    bonus: number;
    power: number;
    archetypeKey?: string;
}

export const resolveConquests = (
    attackers: Attack[],
    targetId: number,
    newEnclavesMap: Map<number, Enclave>,
    gameConfig: GameConfig,
    playerLegacyKey: string | null,
    opponentLegacyKey: string | null,
    routes: Route[],
): { newEnclavesMap: Map<number, Enclave>, events: TurnEvent[] } => {
    const originalTarget = newEnclavesMap.get(targetId);
    if (!originalTarget || attackers.length === 0) {
        return { newEnclavesMap, events: [] };
    }

    const target = cloneEnclave(originalTarget);
    const originalOwner = target.owner;
    const safeTargetForces = Number.isFinite(target.forces) ? target.forces : 0;
    const totalAttackPower = attackers.reduce((sum, a) => sum + a.power, 0);
    const events: TurnEvent[] = [];
    const { FORCE_SUPPLY_CAP } = gameConfig;

    if (totalAttackPower <= safeTargetForces) { // Defenders Win
        target.forces = safeTargetForces - totalAttackPower;
        newEnclavesMap.set(targetId, target);
        return { newEnclavesMap, events };
    }

    if (attackers.length === 1) { // Single Attacker Conquest
        const attacker = attackers[0];
        const survivingUnits = attacker.units - safeTargetForces;
        if (survivingUnits > 0) {
            target.owner = attacker.owner;
            target.archetypeKey = attacker.archetypeKey;
            target.forces = Math.min(FORCE_SUPPLY_CAP, Math.max(1, survivingUnits));
        } else {
            target.owner = null;
            target.archetypeKey = undefined;
            target.forces = 0;
        }
    } else { // Multi-Attacker Conquest
        const totalRealUnitsSent = attackers.reduce((sum, a) => sum + a.units, 0);
        const attackerSurvivors = attackers.map(a => ({ attacker: a, units: a.units }));
        
        if (totalRealUnitsSent > 0) {
            let remainingDamage = safeTargetForces;
            attackerSurvivors.sort((a,b) => b.units - a.units);
            
            attackerSurvivors.forEach(survivor => {
                const proportion = survivor.units / totalRealUnitsSent;
                const damageTaken = Math.round(safeTargetForces * proportion);
                survivor.units -= damageTaken;
                remainingDamage -= damageTaken;
            });
            
            if (remainingDamage !== 0 && attackerSurvivors.length > 0) {
                attackerSurvivors[0].units -= remainingDamage;
            }
        }

        const meleeSurvivors = attackerSurvivors.filter(s => s.units > 0);
        if (meleeSurvivors.length === 0) {
            target.owner = null; target.archetypeKey = undefined; target.forces = 0;
        } else {
             const powerByOwner = new Map<Player, { power: number; units: number; detachments: typeof meleeSurvivors }>();
            meleeSurvivors.forEach(survivor => {
                const owner = survivor.attacker.owner;
                const originEnclave = newEnclavesMap.get(survivor.attacker.from)!;
                const rules: Rule[] = originEnclave.activeEvents.flatMap(event => {
                    const profile = EVENTS[event.profileKey];
                    if (!profile) return [];
                    const phaseLogic = profile.logic[event.phase];
                    return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
                });
                const enclaveData = Object.fromEntries(newEnclavesMap.entries());
                const { combatModifier } = getAppliedModifiers(originEnclave, rules, { enclaveData, routes } as Partial<GameState> as GameState);
                const meleeForce = Math.floor(survivor.units * combatModifier);
                const meleeBonus = 1 + getAttackBonusForEnclave(originEnclave);
                const meleePower = meleeForce + meleeBonus;

                if (!powerByOwner.has(owner)) powerByOwner.set(owner, { power: 0, units: 0, detachments: [] });
                const ownerData = powerByOwner.get(owner)!;
                ownerData.power += meleePower;
                ownerData.units += survivor.units;
                ownerData.detachments.push(survivor);
            });

            if (powerByOwner.size === 1) {
                 const victorData = powerByOwner.values().next().value;
                 const victor = victorData.detachments[0].attacker;
                 target.owner = victor.owner;
                 target.archetypeKey = victor.archetypeKey;
                 target.forces = Math.min(FORCE_SUPPLY_CAP, Math.max(1, victorData.units));
            } else {
                const combatants = Array.from(powerByOwner.entries()).sort(([, a], [, b]) => b.power - a.power);
                const victorEntry = combatants[0];
                const losers = combatants.slice(1);

                if (victorEntry[1].power > losers.reduce((sum, [, data]) => sum + data.power, 0)) {
                    const victor = victorEntry[0];
                    const victorData = victorEntry[1];
                    const totalLoserUnits = losers.reduce((sum, [, data]) => sum + data.units, 0);
                    const finalVictorUnits = victorData.units - totalLoserUnits;
                    
                    if (finalVictorUnits > 0) {
                        target.owner = victor;
                        target.archetypeKey = victorData.detachments[0].attacker.archetypeKey;
                        target.forces = Math.min(FORCE_SUPPLY_CAP, Math.max(1, finalVictorUnits));
                    } else {
                        target.owner = null; target.archetypeKey = undefined; target.forces = 0;
                    }
                } else {
                    target.owner = null; target.archetypeKey = undefined; target.forces = 0;
                }
            }
        }
    }
    
    newEnclavesMap.set(targetId, target);

    if (originalOwner !== target.owner && target.owner) {
        const conqueringArchetypeKey = target.archetypeKey;
        const conqueringLegacyKey = target.owner === 'player-1' ? playerLegacyKey : opponentLegacyKey;

        if (conqueringArchetypeKey && conqueringLegacyKey) {
            events.push({
                type: 'conquest',
                enclaveId: target.id,
                conqueror: target.owner,
                archetypeKey: conqueringArchetypeKey,
                legacyKey: conqueringLegacyKey,
            });
        }
    }

    return { newEnclavesMap, events };
};
