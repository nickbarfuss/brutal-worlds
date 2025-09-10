import React, { useRef } from 'react';
import { useWarpStarsRenderer } from '@/hooks/useWarpStarsRenderer';

interface WarpStarsCanvasProps {
  phase: 'idle' | 'spawning' | 'running' | 'ending';
  className?: string;
}

const WarpStarsCanvas: React.FC<WarpStarsCanvasProps> = ({ phase, className }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  useWarpStarsRenderer({ mountRef, phase });
  return <div ref={mountRef} data-testid="warp-stars-canvas" className={`w-full h-full pointer-events-none ${className || ''}`} />;
};

export default WarpStarsCanvas;