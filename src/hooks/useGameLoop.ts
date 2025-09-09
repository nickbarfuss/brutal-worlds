

import { useEffect, useRef } from 'react';
import { GamePhase, WorldProfile } from '@/types/game';
import { GAME_CONFIG } from '@/data/config';

export const useGameLoop = (
    isPaused: boolean,
    gamePhase: GamePhase,
    isResolvingTurn: boolean,
    currentWorld: WorldProfile | null,
    currentTurn: number,
    resolveTurn: () => void,
    isIntroComplete: boolean
) => {
    const turnStartTimeRef = useRef<number | null>(null);
    const pauseStartRef = useRef<number | null>(null);

    useEffect(() => {
        let animationFrameId: number;
        const loop = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(loop);
            
            // If a turn is resolving, the timer is effectively paused. This prevents
            // the timer from restarting if the component re-renders while waiting for the worker.
            if (isResolvingTurn) {
                // Keep the ref consistent; if we're resolving, the timer isn't running.
                turnStartTimeRef.current = null; 
                return;
            }

            // The loop should only run if the game is in the 'playing' phase and not on the preparatory Turn 0.
            if (gamePhase !== 'playing' || currentTurn === 0 || !isIntroComplete) {
                // If we're not in the active game phase, ensure the timer is reset for the next time we enter it.
                turnStartTimeRef.current = null;
                pauseStartRef.current = null;
                return;
            }

            if (isPaused) {
                // If the game is paused, we record when the pause started so we can account for the duration later.
                if (!pauseStartRef.current) {
                    pauseStartRef.current = timestamp;
                }
                return;
            }

            // --- Game is running ---

            // If turnStartTimeRef is not set, this is the first frame of the turn.
            // Initialize it with the current timestamp.
            if (!turnStartTimeRef.current) {
                turnStartTimeRef.current = timestamp;
            }

            // If we were just unpaused, adjust the turn start time to account for the paused duration.
            if (pauseStartRef.current) {
                const pauseDuration = timestamp - pauseStartRef.current;
                turnStartTimeRef.current += pauseDuration;
                pauseStartRef.current = null; // Clear the pause start time
            }

            const elapsed = timestamp - turnStartTimeRef.current;
            if (elapsed >= GAME_CONFIG.TURN_DURATION * 1000) {
                // Reset for the next turn by setting to null. This will cause it to be re-initialized on the next frame after the turn resolves.
                turnStartTimeRef.current = null;
                resolveTurn();
            }
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused, gamePhase, isResolvingTurn, currentTurn, currentWorld, resolveTurn, isIntroComplete]);

    return { turnStartTimeRef, pauseStartRef };
};