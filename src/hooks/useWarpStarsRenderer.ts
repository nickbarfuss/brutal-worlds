
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createWarpStars } from '@/canvas/warpStars';

interface UseWarpStarsRendererProps {
  mountRef: React.RefObject<HTMLDivElement>;
  phase: 'idle' | 'spawning' | 'running' | 'ending';
}

export const useWarpStarsRenderer = ({ mountRef, phase }: UseWarpStarsRendererProps) => {
  const warpStarsRef = useRef<ReturnType<typeof createWarpStars> | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Transparent background
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // --- Warp Stars ---
    const warpStars = createWarpStars();
    scene.add(warpStars.lines);
    warpStarsRef.current = warpStars;

    // --- Animation Loop ---
    let animationFrameId: number;
    const animate = () => {
      warpStars.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // --- Event Listeners ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        // Check if renderer.domElement is a child before removing
        if (mountRef.current.contains(renderer.domElement)) {
            mountRef.current.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
      warpStars.lines.geometry.dispose();
      (warpStars.lines.material as THREE.Material).dispose();
    };
  }, [mountRef]);

  // --- Phase Control ---
  useEffect(() => {
    const stars = warpStarsRef.current;
    if (!stars) return;

    if (phase === 'spawning') {
      stars.start();
    } else if (phase === 'ending') {
      stars.stop();
    } else if (phase === 'idle') {
      stars.reset();
    }
  }, [phase]);
};
