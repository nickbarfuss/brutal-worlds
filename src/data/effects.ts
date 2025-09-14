import { EffectProfile } from '@/types/game.ts';
import { DISASTER_PROFILES } from './disasters';
import { ARCHETYPE_PROFILES, COMMON_PROFILES } from './gambits';

export const EFFECT_PROFILES: { [key: string]: EffectProfile } = {
    ...DISASTER_PROFILES,
    ...ARCHETYPE_PROFILES,
    ...COMMON_PROFILES,
};
