export interface ForceDamageRule {
    type: 'forceDamage';
    payload: {
        target: 'occupyingEnclave' | 'affectedEnclaves' | 'targetEnclave' | 'adjacentEnclaves';
        damageType: 'percentage' | 'flat';
        value: number | [number, number];
    };
}

export interface RouteDisableRule {
    type: 'routeDisable';
    payload: {
        target: 'affectedEnclaves' | 'global' | 'targetRoute' | 'seaRoutes';
        duration: number;
        chance?: number;
    };
}

export interface RouteDestroyRule {
    type: 'routeDestroy';
    payload: {
        target: 'affectedEnclaves' | 'targetEnclave';
        chance?: number;
    };
}

export interface StatModifierRule {
    type: 'statModifier';
    payload: {
        target: 'affectedEnclaves' | 'targetEnclave';
        stat: 'production' | 'combat' | 'attack_order_multiplier' | 'combat_bonus' | 'attack_order_force_bonus' | 'cannot_be_attacked';
        value: number | boolean;
        duration?: number | 'permanent';
    };
}

export interface DissipateOnNoMoveTargetRule {
    type: 'dissipateOnNoMoveTarget';
}

export interface ApplyAftermathOnChanceRule {
    type: 'applyAftermathOnChance';
    payload: {
        target: 'affectedEnclaves';
        chance: number;
        effectRules: Rule[]; // Rules to apply if chance passes
    };
}

export interface HideForceCountsRule {
    type: 'hideForceCounts';
    payload: {
        target: 'opponent';
        duration: number;
    };
}

export interface GainForcesRule {
    type: 'gainForces';
    payload: {
        target: 'capitalEnclave' | 'targetEnclave';
        value: number;
    };
}

export interface CancelOrderRule {
    type: 'cancelOrder';
    payload: {
        target: 'targetEnclave' | 'incomingOrder';
        orderType: 'Gambit' | 'Attack' | 'Assist';
    };
}

export interface CreateRoutesRule {
    type: 'createRoutes';
    payload: {
        target: 'targetEnclave';
        count: number;
        connectionType: 'nearestUnconnectedFriendly';
    };
}

export interface SetForcesRule {
    type: 'setForces';
    payload: {
        target: 'targetEnclave';
        value: number;
    };
}

export interface ConvertEnclaveRule {
    type: 'convertEnclave';
    payload: {
        target: 'targetEnclave' | 'randomNeutralEnclave';
        toOwner: 'friendly' | 'neutral';
        forces?: number;
    };
}

export interface SummonDisasterRule {
    type: 'summonDisaster';
    payload: {
        target: 'targetEnclave';
        disasterKey: 'any';
    };
}

export interface LockOrderRule {
    type: 'lockOrder';
    payload: {
        target: 'attackingEnclave';
        duration: number;
    };
}

export type Rule =
    | ForceDamageRule
    | RouteDisableRule
    | RouteDestroyRule
    | StatModifierRule
    | DissipateOnNoMoveTargetRule
    | ApplyAftermathOnChanceRule
    | HideForceCountsRule
    | GainForcesRule
    | CancelOrderRule
    | CreateRoutesRule
    | SetForcesRule
    | ConvertEnclaveRule
    | SummonDisasterRule
    | LockOrderRule;
