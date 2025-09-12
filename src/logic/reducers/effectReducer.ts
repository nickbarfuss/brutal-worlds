import { GameState } from '@/types/game';
import { Action } from '@/logic/reducers/index';
import { triggerNewEffect as triggerEffectLogic } from "@/logic/effectManager";
import { EFFECT_PROFILES } from '@/data/effects';

export const handleEffects = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'TRIGGER_EFFECT': {
            const profile = EFFECT_PROFILES[action.payload as string];
            if (!profile) {
                console.error(`Effect profile not found for key: ${action.payload}`);
                return state;
            }
            const result = triggerEffectLogic(profile, {
                enclaveData: state.enclaveData,
                domainData: state.domainData,
                mapData: state.mapData,
                expanseData: state.expanseData,
                riftData: state.riftData,
            });

            if (!result) return state;

            const updates: Partial<GameState> = {};

            if (result.snackbarData) {
                updates.latestEffect = result.snackbarData;
            }
    
            if (result.newMarkers) {
                updates.activeEffectMarkers = [...state.activeEffectMarkers, ...result.newMarkers];
            }
            
            if (result.effectsToPlay) {
                updates.effectQueue = [...state.effectQueue, ...result.effectsToPlay];
            }
    
            return Object.keys(updates).length > 0 ? { ...state, ...updates } : state;
        }

        case 'CLEAR_LATEST_EFFECT':
            return { ...state, latestEffect: null };

        default:
            return state;
    }
};