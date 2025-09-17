import { GameState } from '@/types/game';
import { Action } from '@/logic/reducers/index';

export const handleFx = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'REMOVE_EFFECTS': {
            const idsToRemove = new Set(action.payload);
            if (idsToRemove.size === 0) {
                return state;
            }
            return {
                ...state,
                effects: state.effects.filter(effect => !idsToRemove.has(effect.id)),
            };
        }
        case 'CLEAR_IMMEDIATE_EFFECTS': {
            return { ...state, immediateEffects: [] };
        }
        case 'REMOVE_IMMEDIATE_EFFECTS': {
            const idsToRemove = new Set(action.payload);
            if (idsToRemove.size === 0) {
                return state;
            }
            return {
                ...state,
                immediateEffects: state.immediateEffects.filter(effect => !idsToRemove.has(effect.id)),
            };
        }
        default:
            return state;
    }
};