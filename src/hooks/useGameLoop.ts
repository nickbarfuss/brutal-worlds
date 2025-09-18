import { useEffect, useRef } from 'react';
import { GameState } from '@/types/game';
import { CONFIG } from '@/data/config';

export const useGameLoop = (
    gameState: GameState,
    resolveTurn: () => void,
    onFrame?: (timestamp: number) => void
) => {
    const { isPaused, gamePhase, isResolvingTurn, currentTurn, isIntroComplete } = gameState;
    const turnStartTimeRef = useRef<number | null>(null);
    const pauseStartRef = useRef<number | null>(null);

    useEffect(() => {
        let animationFrameId: number;
        const loop = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(loop);

            if (onFrame) {
                onFrame(timestamp);
            }
            
            if (isResolvingTurn) {
                turnStartTimeRef.current = null; 
                return;
            }

            if (gamePhase !== 'playing' || currentTurn === 0 || !isIntroComplete) {
                turnStartTimeRef.current = null;
                pauseStartRef.current = null;
                return;
            }

            if (!isResolvingTurn && turnStartTimeRef.current === null) {
                turnStartTimeRef.current = timestamp;
            }

            if (isPaused) {
                if (!pauseStartRef.current) {
                    pauseStartRef.current = timestamp;
                }
                return;
            }

            if (!turnStartTimeRef.current) {
                turnStartTimeRef.current = timestamp;
            }

            if (pauseStartRef.current) {
                const pauseDuration = timestamp - pauseStartRef.current;
                turnStartTimeRef.current += pauseDuration;
                pauseStartRef.current = null;
            }

            const elapsed = timestamp - turnStartTimeRef.current;
            if (elapsed >= CONFIG.TURN_DURATION * 1000) {
                resolveTurn();
            }
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, resolveTurn, onFrame, isPaused, gamePhase, isResolvingTurn, currentTurn, isIntroComplete]);

    return { turnStartTimeRef, pauseStartRef };
};