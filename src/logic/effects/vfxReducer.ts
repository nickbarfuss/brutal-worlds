import { GameState, EventQueueItem } from '@/types/game';
import { Action } from '@/logic';

export const handleFx = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'REMOVE_EVENTS_FROM_QUEUE': {
            const idsToRemove = new Set(action.payload);
            if (idsToRemove.size === 0) {
                return state;
            }
            return {
                ...state,
                events: state.events.filter((event: EventQueueItem) => !idsToRemove.has(event.id)),
            };
        }
        default:
            return state;
    }
};