import { EventProfile } from '@/types/game.ts';
import { DISASTERS } from './disasters';
import { GAMBITS } from './gambits';

export const EVENT_PROFILES: { [key: string]: EventProfile } = {
    ...DISASTERS,
    ...GAMBITS,
};
