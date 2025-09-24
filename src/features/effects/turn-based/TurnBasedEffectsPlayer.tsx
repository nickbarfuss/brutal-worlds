import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Frustum, Matrix4 } from 'three';
import * as THREE from 'three';

import { vfxManager } from '@/logic/effects';
import { sfxManager } from '@/logic/effects/SfxManager';
import { WorldCanvasHandle } from '@/features/world/WorldCanvas';
import { turnBasedEffects, Effect } from './turnBasedEffects';
import { ActiveEffect } from '../effects.types';

interface TurnBasedEffectsPlayerProps {
  worldCanvasHandle: React.RefObject<WorldCanvasHandle | null>;
}

const TurnBasedEffectsPlayer: React.FC<TurnBasedEffectsPlayerProps> = ({ worldCanvasHandle }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [effectQueue, setEffectQueue] = useState<Effect[]>([]);
  const [offScreenQueue, setOffScreenQueue] = useState<Effect[]>([]);
  const [activeVfx, setActiveVfx] = useState<ActiveEffect[]>([]);
  const activeVfxRef = useRef<ActiveEffect[]>([]); // Ref to hold the latest activeVfx
  const isProcessingRef = useRef(false);

  // Update the ref whenever activeVfx changes
  useEffect(() => {
    activeVfxRef.current = activeVfx;
  }, [activeVfx]);

  useEffect(() => {
    const handleQueueChange = (newQueue: Effect[]) => {
      setEffectQueue(newQueue);
    };
    turnBasedEffects.addListener(handleQueueChange);
    return () => turnBasedEffects.removeListener(handleQueueChange);
  }, []);

  const getCamera = useCallback((): Camera | null => {
    return worldCanvasHandle.current?.camera || null;
  }, [worldCanvasHandle]);

  const isPositionInFrustum = useCallback((position: THREE.Vector3): boolean => {
    const camera = getCamera();
    if (!camera) return false;
    const frustum = new Frustum();
    const projScreenMatrix = new Matrix4();
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);
    return frustum.containsPoint(position);
  }, [getCamera]);

  

  useEffect(() => {
    const camera = getCamera();
    if (!camera) return;

    setOffScreenQueue(prevOffScreenQueue => {
      const newlyVisible: Effect[] = [];
      const stillOffScreen: Effect[] = [];

      prevOffScreenQueue.forEach(effect => {
        if (isPositionInFrustum(effect.position)) {
          newlyVisible.push(effect);
        } else {
          stillOffScreen.push(effect);
        }
      });

      if (newlyVisible.length > 0) {
        turnBasedEffects.addEffects(newlyVisible);
      }

      if (stillOffScreen.length === prevOffScreenQueue.length &&
          stillOffScreen.every((effect, index) => effect === prevOffScreenQueue[index])) {
        return prevOffScreenQueue;
      }
      return stillOffScreen;
    });

  }, [worldCanvasHandle, getCamera, isPositionInFrustum]);

  useEffect(() => {
    if (effectQueue.length > 0 && !isProcessingRef.current) {
      isProcessingRef.current = true; // Mark as processing

      const effectToPlay = effectQueue[0]; // Get the first effect

      // Remove from global queue immediately to prevent re-addition by useGameEngine
      turnBasedEffects.removeEffects([effectToPlay]);

      if (!isPositionInFrustum(effectToPlay.position)) {
        setOffScreenQueue(prev => [...prev, effectToPlay]);
        // Remove from local queue as well
        setEffectQueue(prevQueue => prevQueue.slice(1));
        isProcessingRef.current = false; // Allow next effect to be processed immediately
        return;
      }

      if (effectToPlay.type === 'vfx') {
        const newEffect = vfxManager.playEffect(effectToPlay.key, effectToPlay.position, () => {
          setActiveVfx(prev => prev.filter(e => e.video !== newEffect?.video));
        });
        if (newEffect) {
          setActiveVfx(prev => [...prev, newEffect]);
        }
      } else {
        sfxManager.playSound(effectToPlay.key, 'fx', effectToPlay.position);
      }

      // After playing, remove from local queue and set a timeout for the next effect
      setTimeout(() => {
        setEffectQueue(prevQueue => prevQueue.slice(1)); // Remove the played effect from local state
        isProcessingRef.current = false; // Allow next effect to be processed
      }, 200); // Delay before processing the next effect
    }
  }, [effectQueue, isPositionInFrustum, getCamera]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '11';
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
          // Use the ref to get the latest activeVfx
          vfxManager.updateAndDraw(ctx, worldCanvasHandle.current.mapContainer, worldCanvasHandle.current.camera, activeVfxRef.current);
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
      // Cleanup for activeVfx should be handled by the playNextEffect callback
      // when setActiveVfx filters out the finished video. No need to pause here.
    };
  }, [worldCanvasHandle]); // Only depends on worldCanvasHandle

  return null;
};

export default TurnBasedEffectsPlayer;