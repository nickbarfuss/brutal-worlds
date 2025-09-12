import { EffectProfile } from '@/types/game.ts';
import { DISASTER_PROFILES } from './disasters';
import { GAMBITS, COMMON_GAMBITS } from './gambits';

export const EFFECT_PROFILES: { [key: string]: EffectProfile } = {
    ...DISASTER_PROFILES,
    ...GAMBITS,
    ...COMMON_GAMBITS,
};
