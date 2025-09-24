import { Enclave, PendingOrders, GameState, Player, Rule, ActiveEventMarker, Route } from '@/types/game';
import { getAppliedModifiers } from '@/logic/events';
import { getAttackBonusForEnclave, getAssistMultiplierForEnclave, getHoldBonusForEnclave } from '@/logic/birthrights';
import { DISASTERS } from '@/data/disasters';
import { EVENTS } from '@/data/events';

export interface TurnPreview {
    status: 'conquered' | 'neutralized' | 'strengthened' | 'substantiallyStrengthened' | 'weakened' | 'substantiallyWeakened' | 'unchanged';
    newForces: number;
    originalForces: number;
    newOwner?: Enclave['owner'];
    conqueror?: Enclave;
    neutralizedByAttack?: boolean;
}

const resolveNumericRange = (value: number | [number, number]): number => {
    if (Array.isArray(value)) {
        return Math.floor(Math.random() * (value[1] - value[0] + 1)) + value[0];
    }
    return value;
};


export const calculateEnclaveTurnPreview = (
    enclave: Enclave,
    enclaveData: { [id: string]: Enclave },
    pendingOrders: PendingOrders,
    gameConfig: GameState['gameConfig'],
    activeEventMarkers: ActiveEventMarker[] = [],
    routes: Route[],
): TurnPreview => {
    
    let predictedForces = Number.isFinite(enclave.forces) ? enclave.forces : 0;
    
    // Simulate instantaneous damage from disaster alerts
    const alertEvents = (enclave.activeEvents || []).filter(e => e.phase === 'alert');
    alertEvents.forEach(event => {
        const profile = DISASTERS[event.profileKey];
        // FIX: Iterate over rules array
        if (profile && profile.logic.impact) {
            profile.logic.impact.rules.forEach(rule => {
                if (rule.type === 'forceDamage') {
                    const damageValue = resolveNumericRange(rule.payload.value);
                    if (rule.payload.damageType === 'percentage') {
                        predictedForces *= (1 - damageValue);
                    } else if (rule.payload.damageType === 'flat') {
                        predictedForces -= damageValue;
                    }
                }
            });
        }
    });

    // FIX: Get target enclaves for markers based on metadata, not a direct property.
    const markers = activeEventMarkers.filter(m => m.metadata && m.metadata.targetEnclaveIds && m.metadata.targetEnclaveIds.includes(enclave.id));
    markers.forEach(marker => {
        const profile = DISASTERS[marker.profileKey];
        // FIX: Iterate over rules array
        if (profile && profile.logic.impact) {
            profile.logic.impact.rules.forEach(rule => {
                if (rule.type === 'forceDamage') {
                    const damageValue = resolveNumericRange(rule.payload.value);
                    if (rule.payload.damageType === 'percentage') {
                        predictedForces *= (1 - damageValue);
                    } else if (rule.payload.damageType === 'flat') {
                        predictedForces -= damageValue;
                    }
                }
            });
        }
    });

    const originalForces = Number.isFinite(enclave.forces) ? enclave.forces : 0;
    const outgoingOrder = pendingOrders[enclave.id];
    
    // Simulate forces leaving from this enclave
    if (outgoingOrder) {
        if (outgoingOrder.type === 'attack') {
            predictedForces -= Math.ceil(originalForces * 0.35);
        } else if (outgoingOrder.type === 'assist') {
            const assistMultiplier = getAssistMultiplierForEnclave(enclave);
            predictedForces -= Math.ceil(originalForces * assistMultiplier);
        }
    }
    
    // Simulate holding reinforcements
    if (enclave.owner && !outgoingOrder) {
        const rules: Rule[] = enclave.activeEvents.flatMap(event => {
            const profile = EVENTS[event.profileKey];
            if (!profile) return [];
            const phaseLogic = profile.logic[event.phase];
            return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
        });
        const { productionModifier } = getAppliedModifiers(enclave, rules, { enclaveData, routes } as Partial<GameState> as GameState);
        let reinforcements = 2 + getHoldBonusForEnclave(enclave);
        predictedForces += Math.floor(reinforcements * productionModifier);
    }

    // Simulate incoming assists
    for (const fromIdStr in pendingOrders) {
        const order = pendingOrders[parseInt(fromIdStr, 10)];
        if (order.to === enclave.id && order.type === 'assist') {
            const originEnclave = enclaveData[parseInt(fromIdStr, 10)];
            if (originEnclave) {
                 const originForces = Number.isFinite(originEnclave.forces) ? originEnclave.forces : 0;
                 const assistMultiplier = getAssistMultiplierForEnclave(originEnclave);
                 predictedForces += Math.ceil(originForces * assistMultiplier);
            }
        }
    }

    // --- Battle Simulation ---
    const defenderStrength = predictedForces;
    let totalAttackPower = 0;
    const incomingAttackers: { attacker: Enclave, power: number, units: number }[] = [];

    for (const fromIdStr in pendingOrders) {
        const order = pendingOrders[parseInt(fromIdStr, 10)];
        if (order.to === enclave.id && order.type === 'attack') {
            const originEnclave = enclaveData[parseInt(fromIdStr, 10)];
            if (originEnclave) {
                const rules: Rule[] = originEnclave.activeEvents.flatMap(event => {
                    const profile = EVENTS[event.profileKey];
                    if (!profile) return [];
                    const phaseLogic = profile.logic[event.phase];
                    return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
                });
                const { combatModifier } = getAppliedModifiers(originEnclave, rules, { enclaveData, routes } as Partial<GameState> as GameState);
                const originForces = Number.isFinite(originEnclave.forces) ? originEnclave.forces : 0;
                const baseUnitsSent = Math.ceil(originForces * 0.35);
                const effectiveForce = Math.floor(baseUnitsSent * combatModifier);
                const bonus = 1 + getAttackBonusForEnclave(originEnclave);
                const power = effectiveForce + bonus;
                totalAttackPower += power;
                incomingAttackers.push({ attacker: originEnclave, power: power, units: baseUnitsSent });
            }
        }
    }

    let finalForces: number;
    let finalOwner = enclave.owner;
    let finalStatus: TurnPreview['status'] = 'unchanged';
    let conqueror: Enclave | undefined = undefined;
    let neutralizedByAttack = false;

    if (totalAttackPower > 0) {
        if (totalAttackPower <= defenderStrength) { // Defender Wins
            finalForces = defenderStrength - totalAttackPower;
            if (finalForces <= originalForces / 2) finalStatus = 'substantiallyWeakened';
            else finalStatus = 'weakened';
        } else { // Attackers Win
            if (incomingAttackers.length === 1) { // Single Attacker
                const survivingUnits = incomingAttackers[0].units - defenderStrength;
                if (survivingUnits > 0) {
                    finalStatus = 'conquered';
                    finalForces = Math.max(1, survivingUnits);
                    finalOwner = incomingAttackers[0].attacker.owner;
                    conqueror = incomingAttackers[0].attacker;
                } else {
                    finalStatus = 'neutralized';
                    neutralizedByAttack = true;
                    finalForces = 0;
                    finalOwner = null;
                }
            } else { // Multi-Attacker (Total War Melee Preview)
                // Phase 1: Distribute Casualties
                const totalRealUnitsSent = incomingAttackers.reduce((sum, a) => sum + a.units, 0);
                const attackerSurvivors = incomingAttackers.map(a => ({ attacker: a.attacker, units: a.units }));

                if (totalRealUnitsSent > 0) {
                    let remainingDamage = defenderStrength;
                    attackerSurvivors.sort((a,b) => b.units - a.units);
                    attackerSurvivors.forEach(survivor => {
                        const proportion = survivor.units / totalRealUnitsSent;
                        const damageTaken = Math.round(defenderStrength * proportion);
                        survivor.units -= damageTaken;
                        remainingDamage -= damageTaken;
                    });
                     if (remainingDamage !== 0 && attackerSurvivors.length > 0) {
                        attackerSurvivors[0].units -= remainingDamage;
                    }
                }
                
                // Phase 2: Melee
                const meleeSurvivors = attackerSurvivors.filter(s => s.units > 0);
                if (meleeSurvivors.length === 0) {
                    finalStatus = 'neutralized'; neutralizedByAttack = true; finalForces = 0; finalOwner = null;
                } else {
                    const powerByOwner = new Map<Player, { power: number; units: number; detachments: typeof meleeSurvivors }>();
                    meleeSurvivors.forEach(survivor => {
                        const owner = survivor.attacker.owner as Player;
                        const rules: Rule[] = survivor.attacker.activeEvents.flatMap(event => {
                            const profile = EVENTS[event.profileKey];
                            if (!profile) return [];
                            const phaseLogic = profile.logic[event.phase];
                            return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
                        });
                        const { combatModifier } = getAppliedModifiers(survivor.attacker, rules, { enclaveData, routes } as Partial<GameState> as GameState);
                        const meleeForce = Math.floor(survivor.units * combatModifier);
                        const meleeBonus = 1 + getAttackBonusForEnclave(survivor.attacker);
                        const meleePower = meleeForce + meleeBonus;

                        if (!powerByOwner.has(owner)) powerByOwner.set(owner, { power: 0, units: 0, detachments: [] });
                        const ownerData = powerByOwner.get(owner)!;
                        ownerData.power += meleePower;
                        ownerData.units += survivor.units;
                        ownerData.detachments.push(survivor);
                    });

                    if (powerByOwner.size === 1) {
                         const victorData = powerByOwner.values().next().value;
                         finalStatus = 'conquered'; finalOwner = victorData.detachments[0].attacker.owner;
                         conqueror = victorData.detachments[0].attacker;
                         finalForces = Math.max(1, victorData.units);
                    } else {
                        const combatants = Array.from(powerByOwner.entries()).sort(([, a], [, b]) => b.power - a.power);
                        const victorEntry = combatants[0];
                        const losers = combatants.slice(1);
                        
                        if (victorEntry[1].power > losers.reduce((sum, [, data]) => sum + data.power, 0)) {
                            const victorData = victorEntry[1];
                            const totalLoserUnits = losers.reduce((sum, [, data]) => sum + data.units, 0);
                            const finalVictorUnits = victorData.units - totalLoserUnits;
                            
                            if (finalVictorUnits > 0) {
                                finalStatus = 'conquered'; finalOwner = victorEntry[0];
                                conqueror = victorData.detachments[0].attacker;
                                finalForces = Math.max(1, finalVictorUnits);
                            } else {
                                finalStatus = 'neutralized'; neutralizedByAttack = true; finalForces = 0; finalOwner = null;
                            }
                        } else {
                            finalStatus = 'neutralized'; neutralizedByAttack = true; finalForces = 0; finalOwner = null;
                        }
                    }
                }
            }
        }
    } else { // No incoming attacks
        finalForces = predictedForces;
        if (finalForces <= 0 && originalForces > 0) {
            finalStatus = 'neutralized';
            neutralizedByAttack = false;
        } else if (finalForces > originalForces) {
            if (originalForces > 0 && finalForces >= originalForces * 2) {
                finalStatus = 'substantiallyStrengthened';
            } else {
                finalStatus = 'strengthened';
            }
        } else if (finalForces < originalForces) {
            if (finalForces <= originalForces / 2) {
                finalStatus = 'substantiallyWeakened';
            } else {
                finalStatus = 'weakened';
            }
        }
    }
    
    finalForces = Math.round(Math.min(gameConfig.FORCE_SUPPLY_CAP, Math.max(0, finalForces)));
    if (finalStatus === 'conquered' && finalForces < 1) finalForces = 1;

    return {
        status: finalStatus, newForces: finalForces, originalForces: originalForces,
        newOwner: finalOwner, conqueror: conqueror, neutralizedByAttack,
    };
};