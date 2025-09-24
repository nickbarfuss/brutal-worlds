import React, { useEffect, useRef, useState } from 'react';
import { vfxManager, sfxManager } from '@/logic/effects';
import { WorldCanvasHandle } from '@/features/world/WorldCanvas';
import { immediateEffects, ImmediateEffect } from './immediateEffects';
import { ActiveEffect } from '../effects.types';

interface ImmediateEffectsPlayerProps {
    worldCanvasHandle: React.RefObject<WorldCanvasHandle | null>;
}

const ImmediateEffectsPlayer: React.FC<ImmediateEffectsPlayerProps> = ({ worldCanvasHandle }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [activeEffect, setActiveEffect] = useState<ActiveEffect | null>(null);
    const activeEffectRef = useRef<ActiveEffect | null>(null);

    useEffect(() => {
        activeEffectRef.current = activeEffect;
    }, [activeEffect]);

    useEffect(() => {
        const handlePlayEffect = (effect: ImmediateEffect) => {
            if (effect.type === 'vfx') {
                setActiveEffect(prevActiveEffect => {
                    if (prevActiveEffect) {
                        prevActiveEffect.video.pause();
                    }
                    const newEffect = vfxManager.playEffect(effect.key, effect.position, () => {
                        setActiveEffect(null);
                    });
                    return newEffect;
                });
            } else if (effect.type === 'sfx') {
                sfxManager.playSound(effect.key, 'fx', effect.position);
            }
        };

        immediateEffects.addListener(handlePlayEffect);
        return () => immediateEffects.removeListener(handlePlayEffect);
    }, []);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10';
        document.body.appendChild(canvas);
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
                    const effectsToDraw = activeEffectRef.current ? [activeEffectRef.current] : [];
                    vfxManager.updateAndDraw(ctx, worldCanvasHandle.current.mapContainer, worldCanvasHandle.current.camera, effectsToDraw);
                }
            }
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (canvasRef.current) {
                document.body.removeChild(canvasRef.current);
            }
            }
    }, [worldCanvasHandle]); // Only depends on worldCanvasHandle

    return null;
};

export default ImmediateEffectsPlayer;
