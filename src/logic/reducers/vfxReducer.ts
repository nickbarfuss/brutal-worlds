import { GameState, Enclave } from '@/types/game';
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

        case 'PLAY_VFX':
            return { ...state, vfxToPlay: action.payload };

        case 'PLAY_SFX':
            return { ...state, sfxToPlay: action.payload };

        case 'CLEAR_VFX':
            return { ...state, vfxToPlay: null };

        case 'CLEAR_SFX':
            return { ...state, sfxToPlay: null };
            
        default:
            return state;
    }
};