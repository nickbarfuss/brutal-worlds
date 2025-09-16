import { useEffect, useRef } from 'react';
import { GamePhase, WorldProfile } from '@/types/game';
import { CONFIG } from '@/data/config';

export const useGameLoop = (
    isPaused: boolean,
    gamePhase: GamePhase,
    isResolvingTurn: boolean,
    currentWorld: WorldProfile | null,
    currentTurn: number,
    resolveTurn: () => void,
    isIntroComplete: boolean,
    onFrame?: () => void
) => {
    const turnStartTimeRef = useRef<number | null>(null);
    const pauseStartRef = useRef<number | null>(null);

    useEffect(() => {
        let animationFrameId: number;
        const loop = (timestamp: number) => {
            animationFrameId = requestAnimationFrame(loop);

            onFrame?.();
            
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
    }, [isPaused, gamePhase, isResolvingTurn, currentTurn, currentWorld, resolveTurn, isIntroComplete, onFrame]);

    return { turnStartTimeRef, pauseStartRef };
};