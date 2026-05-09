import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { vfxManager, sfxManager } from '@/logic/effects';
import { WorldCanvasHandle } from '@/features/world/WorldCanvas';
import { turnBasedEffects, Effect } from '@/features/effects/turn-based/turnBasedEffects';
import { ActiveEffect } from '@/features/effects/effects.types';

interface TurnBasedEffectsPlayerProps {
    worldCanvasHandle: React.RefObject<WorldCanvasHandle | null>;
    parentRef: React.RefObject<HTMLDivElement>;
}

const TurnBasedEffectsPlayer: React.FC<TurnBasedEffectsPlayerProps> = ({ worldCanvasHandle, parentRef }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
    const activeEffectsRef = useRef<ActiveEffect[]>([]);
    const queuedEffectsRef = useRef<Effect[]>([]);

    useEffect(() => {
        activeEffectsRef.current = activeEffects;
    }, [activeEffects]);

    const playEffectImmediate = useCallback((effect: Effect) => {
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
    }, []);

    useEffect(() => {
        const handlePlayEffect = (effect: Effect) => {
            const mapContainer = worldCanvasHandle.current?.mapContainer;
            const camera = worldCanvasHandle.current?.camera;
            
            let isVisible = false;
            if (mapContainer && camera) {
                const worldPos = effect.position.clone().applyMatrix4(mapContainer.matrixWorld);
                const viewVector = new THREE.Vector3().subVectors(camera.position, worldPos);
                const normal = worldPos.clone().normalize();
                isVisible = viewVector.dot(normal) > 0;
            }

            if (isVisible) {
                playEffectImmediate(effect);
            } else {
                queuedEffectsRef.current.push(effect);
            }
        };

        turnBasedEffects.addListener(handlePlayEffect);
        return () => turnBasedEffects.removeListener(handlePlayEffect);
    }, [worldCanvasHandle, playEffectImmediate]);

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
            const mapContainer = worldCanvasHandle.current?.mapContainer;
            const camera = worldCanvasHandle.current?.camera;

            // Check queued effects for visibility
            if (mapContainer && camera && queuedEffectsRef.current.length > 0) {
                const remainingQueue: Effect[] = [];
                for (const effect of queuedEffectsRef.current) {
                    const worldPos = effect.position.clone().applyMatrix4(mapContainer.matrixWorld);
                    const viewVector = new THREE.Vector3().subVectors(camera.position, worldPos);
                    const normal = worldPos.clone().normalize();
                    const isVisible = viewVector.dot(normal) > 0;

                    if (isVisible) {
                        playEffectImmediate(effect);
                    } else {
                        remainingQueue.push(effect);
                    }
                }
                queuedEffectsRef.current = remainingQueue;
            }

            if (canvasRef.current && camera && mapContainer) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    const dpr = window.devicePixelRatio || 1;
                    const rect = canvasRef.current.getBoundingClientRect();
                    canvasRef.current.width = rect.width * dpr;
                    canvasRef.current.height = rect.height * dpr;
                    ctx.scale(dpr, dpr);
                    
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    vfxManager.updateAndDraw(ctx, mapContainer, camera, activeEffectsRef.current);
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
    }, [worldCanvasHandle, parentRef, playEffectImmediate]);

    return null;
};

export default TurnBasedEffectsPlayer;