import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createWarpStars } from '@/canvas/warpStars';

interface UseWarpStarsRendererProps {
  mountRef: React.RefObject<HTMLDivElement>;
  phase: 'idle' | 'spawning' | 'running' | 'ending';
}

export const useWarpStarsRenderer = ({ mountRef, phase }: UseWarpStarsRendererProps) => {
  const warpStarsRef = useRef<ReturnType<typeof createWarpStars> | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = 1;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true }); // Transparent background
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.innerHTML = ''; // Clear any existing children
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Warp Stars ---
    const warpStars = createWarpStars();
    scene.add(warpStars.lines);
    warpStarsRef.current = warpStars;

    // --- Animation Loop ---
    const animate = () => {
      if (warpStarsRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
        warpStarsRef.current.update();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // --- Event Listeners ---
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        if (mountRef.current.contains(rendererRef.current.domElement)) {
            mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (warpStarsRef.current) {
        warpStarsRef.current.lines.geometry.dispose();
        (warpStarsRef.current.lines.material as THREE.Material).dispose();
      }
    };
  }, []); // Empty dependency array: runs only once on mount

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
  }, [phase]); // Depends on phase: runs when phase changes
};