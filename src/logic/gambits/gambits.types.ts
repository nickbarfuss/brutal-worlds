import { EffectLogic } from '@/logic/effects/effects.types';
import { EventProfile } from '@/logic/events/events.types';

export interface GambitLogic extends EffectLogic {
    uses?: number;
    restriction?: string;
    archetypeKey?: string;
    legacyKey?: string;
}

export interface GambitProfile extends EventProfile {
    logic: GambitLogic; // Override logic to be GambitLogic
}

// Gambits (Stateful)
export type GambitState = 'locked' | 'available' | 'active' | 'depleted';
export interface ActiveGambit {
    key: string;
    state: GambitState;
    remainingUses: number;
    remainingDuration?: number;
}