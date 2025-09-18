import { GameState } from '@/types/game';
import { Action } from '@/logic/reducers/index';

export const handleFx = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'REMOVE_EVENTS': {
            if (action.type !== 'REMOVE_EVENTS') return state;
            const idsToRemove = new Set(action.payload);
            if (idsToRemove.size === 0) {
                return state;
            }
            return {
                ...state,
                events: state.events.filter(event => !idsToRemove.has(event.id)),
            };
        }
        default:
            return state;
    }
};