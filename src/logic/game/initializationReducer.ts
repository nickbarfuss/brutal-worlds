import { GameState } from '@/types/game';
import { Action } from '@/logic';

export const handleInitialization = (state: GameState, action: Action): GameState => {
    if (action.type === 'SET_INITIALIZATION_STATE') {
        const { isInitialized, message, error } = action.payload;

        // If the incoming action is setting a new error, we must display it.
        if (error) {
            // FIX: Correct property name from 'message' to 'loadingMessage' to align with the GameState type.
            return { ...state, isInitialized, loadingMessage: message, error };
        }

        // If the incoming action is attempting to clear an error (error is null),
        // but an error state already exists, we should preserve the existing error.
        // This prevents a race condition where a successful asset loader clears an
        // error from a failed worker initialization, making the error flash and disappear.
        if (state.error) {
            // Update other state but keep the existing error message.
            // FIX: Correct property name from 'message' to 'loadingMessage' to align with the GameState type.
            return { ...state, isInitialized, loadingMessage: message };
        }

        // If there's no new error and no existing error, proceed as normal.
        // FIX: Correct property name from 'message' to 'loadingMessage' to align with the GameState type.
        return { ...state, isInitialized, loadingMessage: message, error: null };
    }
    return state;
};
