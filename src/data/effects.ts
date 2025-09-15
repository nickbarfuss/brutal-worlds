import { EffectProfile } from '@/types/game.ts';
import { DISASTERS } from './disasters';
import { GAMBITS } from './gambits';

export const EFFECT_PROFILES: { [key: string]: EffectProfile } = {
    ...DISASTERS,
    ...GAMBITS,
};
