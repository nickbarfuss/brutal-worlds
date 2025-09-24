import { EventProfile } from '@/types/game.ts';
import { DISASTERS } from './disasters';
import { GAMBITS } from './gambits';

export const EVENTS: { [key: string]: EventProfile } = {
    ...DISASTERS,
    ...GAMBITS,
};
