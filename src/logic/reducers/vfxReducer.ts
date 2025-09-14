import { GameState } from '@/types/game';
import { Action } from '@/logic/reducers/index';



export const handleFx = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'PROCESS_EFFECT_QUEUE': {
            const { playedIds } = action.payload;
            if (playedIds.length === 0) return state;
            const playedIdSet = new Set(playedIds);
            return {
                ...state,
                effectQueue: state.effectQueue.filter(effect => !playedIdSet.has(effect.id)),
            };
        }

        case 'ADD_EFFECTS_TO_QUEUE': {
            const newEffects = action.payload;
            return {
                ...state,
                effectQueue: [...state.effectQueue, ...newEffects],
            };
        }

        case 'CLEAR_EFFECT_QUEUE': { // Re-add this case
            return {
                ...state,
                effectQueue: [],
            };
        }
            
        default:
            return state;
    }
};