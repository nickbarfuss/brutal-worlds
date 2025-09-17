import React, { useEffect, useRef } from 'react';

import { VfxManager } from '@/logic/effects/VfxManager';
import { WorldCanvasHandle } from '@/features/world/WorldCanvas';

interface ImmediateVfxPlayerProps {
    vfxManager: VfxManager;
    worldCanvasHandle: React.RefObject<WorldCanvasHandle | null>;
}

const ImmediateVfxPlayer: React.FC<ImmediateVfxPlayerProps> = ({ vfxManager, worldCanvasHandle }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '10'; // Or an appropriate z-index
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
                    vfxManager.updateAndDraw(ctx, worldCanvasHandle.current.mapContainer, worldCanvasHandle.current.camera);
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
        };
    }, [vfxManager, worldCanvasHandle]);

    return null;
};

export default ImmediateVfxPlayer;
