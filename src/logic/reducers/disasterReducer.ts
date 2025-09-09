import { GameState } from '@/types/game';
import { Action } from '@/logic/reducers/index';
import { triggerNewDisaster as triggerDisasterLogic } from '@/logic/disasterManager';

export const handleDisasters = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'TRIGGER_DISASTER': {
            const result = triggerDisasterLogic(action.payload, {
                enclaveData: state.enclaveData,
                domainData: state.domainData,
                mapData: state.mapData,
                expanseData: state.expanseData,
                riftData: state.riftData,
            });

            if (!result) return state;

            const updates: Partial<GameState> = {};

            if (result.snackbarData) {
                updates.latestDisaster = result.snackbarData;
            }
    
            if (result.newMarkers) {
                updates.activeDisasterMarkers = [...state.activeDisasterMarkers, ...result.newMarkers];
            }
            
            if (result.effectsToPlay) {
                updates.effectQueue = [...state.effectQueue, ...result.effectsToPlay];
            }
    
            return Object.keys(updates).length > 0 ? { ...state, ...updates } : state;
        }

        case 'CLEAR_LATEST_DISASTER':
            return { ...state, latestDisaster: null };

        default:
            return state;
    }
};
