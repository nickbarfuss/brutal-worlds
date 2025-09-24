import React, { useEffect, useRef, useState } from 'react';
import { vfxManager, sfxManager } from '@/logic/effects';
import { WorldCanvasHandle } from '@/features/world/WorldCanvas';
import { turnBasedEffects, Effect } from './turnBasedEffects';
import { ActiveEffect } from '../effects.types';

interface TurnBasedEffectsPlayerProps {
    worldCanvasHandle: React.RefObject<WorldCanvasHandle | null>;
    parentRef: React.RefObject<HTMLDivElement>;
}

const TurnBasedEffectsPlayer: React.FC<TurnBasedEffectsPlayerProps> = ({ worldCanvasHandle, parentRef }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
    const activeEffectsRef = useRef<ActiveEffect[]>([]);

    useEffect(() => {
        activeEffectsRef.current = activeEffects;
    }, [activeEffects]);

    useEffect(() => {
        const handlePlayEffect = (effect: Effect) => {
            if (effect.type === 'vfx') {
                const newEffect = vfxManager.playEffect(effect.key, effect.position, () => {
                    setActiveEffects(prev => prev.filter(e => e.video !== newEffect?.video));
                });
                if (newEffect) {
                    setActiveEffects(prev => [...prev, newEffect]);
                }
            } else if (effect.type === 'sfx') {
                sfxManager.playSound(effect.key, 'fx', effect.position);
            }
        };

        turnBasedEffects.addListener(handlePlayEffect);
        return () => turnBasedEffects.removeListener(handlePlayEffect);
    }, []);

    useEffect(() => {
        const parentRefCurrent = parentRef.current;
        if (!parentRefCurrent) return;

        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1'; // Set a lower z-index to appear below markers
        parentRef.current.appendChild(canvas);
        canvasRef.current = canvas;

        let animationFrameId: number;

        const render = () => {
            if (canvasRef.current && worldCanvasHandle.current?.camera && worldCanvasHandle.current?.mapContainer) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    const dpr = window.devicePixelRatio || 1;
                    const rect = canvasRef.current.getBoundingClientRect();
                    canvasRef.current.width = rect.width * dpr;
                    canvasRef.current.height = rect.height * dpr;
                    ctx.scale(dpr, dpr);
                    
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    vfxManager.updateAndDraw(ctx, worldCanvasHandle.current.mapContainer, worldCanvasHandle.current.camera, activeEffectsRef.current);
                }
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (canvasRef.current && parentRefCurrent) {
                parentRefCurrent.removeChild(canvasRef.current);
            }
        };
    }, [worldCanvasHandle, parentRef]);

    return null;
};

export default TurnBasedEffectsPlayer;