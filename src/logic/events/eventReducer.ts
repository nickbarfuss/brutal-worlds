import { GameState } from '@/types/game';
import { Action } from '@/logic';
import { triggerNewEvent as triggerEventLogic } from "@/logic/events/eventManager";
import { EVENTS } from '@/data/events';

export const handleEvents = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'TRIGGER_EVENT': {
            const profile = EVENTS[action.payload as string];
            if (!profile) {
                console.error(`Event profile not found for key: ${action.payload}`);
                return state;
            }
            const result = triggerEventLogic(profile, {
                enclaveData: state.enclaveData,
                domainData: state.domainData,
                mapData: state.mapData,
                expanseData: state.expanseData,
                riftData: state.riftData,
            });

            if (!result) return state;

            const updates: Partial<GameState> = {};

            if (result.snackbarData) {
                updates.latestEvent = result.snackbarData;
            }
    
            if (result.newMarkers) {
                updates.activeEventMarkers = [...state.activeEventMarkers, ...result.newMarkers];
            }
            
            if (result.eventsToPlay) {
                updates.events = [...state.events, ...result.eventsToPlay];
            }
    
            return Object.keys(updates).length > 0 ? { ...state, ...updates } : state;
        }

        case 'CLEAR_LATEST_EVENT':
            return { ...state, latestEvent: null };

        default:
            return state;
    }
};