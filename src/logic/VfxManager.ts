import * as THREE from 'three';
import { VfxProfile, VFX_PROFILES } from '../data/vfx';
import { getAssetUrl } from '../utils/assetUtils';

interface ActiveEffect {
    key: string;
    video: HTMLVideoElement;
    worldPosition: THREE.Vector3;
    width: number;
    height: number;
}

export class VfxManager {
    private isInitialized: boolean = false;
    private preloadedVideos: { [key: string]: HTMLVideoElement } = {};
    private activeEffects: ActiveEffect[] = [];

    // Constructor can be used for dependency injection if needed
    constructor() {}

    public async init(profiles: { [key: string]: VfxProfile }): Promise<void> {
        if (this.isInitialized) return;

        const assetPromises: Promise<void>[] = [];
        
        for (const [key, profile] of Object.entries(profiles)) {
            // The cinematic videos are handled separately as <video> elements in GameScreen.tsx
            if (key !== 'warp-enter' && key !== 'warp-exit') {
                assetPromises.push(this.loadVideo(key, profile));
            }
        }

        try {
            await Promise.all(assetPromises);
            this.isInitialized = true;
            
        } catch (error) {
            console.error("Error initializing VFX Manager:", error);
            throw new Error("Failed to load one or more VFX assets.");
        }
    }

    private loadVideo(key: string, profile: VfxProfile): Promise<void> {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = getAssetUrl(profile.url);
            video.muted = true;
            video.loop = false;
            video.playsInline = true;
            video.preload = 'auto';
            let resolved = false;

            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    console.warn(`VFX video loading timed out for "${key}". Continuing without it.`);
                    cleanup();
                    resolve();
                }
            }, 8000); // 8-second timeout

            const onCanPlayThrough = () => {
                if (!resolved) {
                    resolved = true;
                    this.preloadedVideos[key] = video;
                    cleanup();
                    resolve();
                }
            };

            const onError = () => {
                if (!resolved) {
                    resolved = true;
                    console.error(`Failed to load VFX video for "${key}" from ${getAssetUrl(profile.url)}`);
                    cleanup();
                    resolve(); // Resolve even on error to not block the game
                }
            };

            const cleanup = () => {
                clearTimeout(timeout);
                video.removeEventListener('canplaythrough', onCanPlayThrough);
                video.removeEventListener('error', onError);
            };

            video.addEventListener('canplaythrough', onCanPlayThrough);
            video.addEventListener('error', onError);
            video.load();
        });
    }
    
    public reset(): void {
        // Stop any currently playing videos to prevent them from continuing in the background.
        this.activeEffects.forEach(effect => effect.video.pause());
        this.activeEffects = [];
    }

    public playEffect(key: string | string[], worldPosition: THREE.Vector3): void {
        let selectedKey: string;
        if (Array.isArray(key)) {
            selectedKey = key[Math.floor(Math.random() * key.length)];
        } else {
            selectedKey = key;
        }

        const preloadedVideo = this.preloadedVideos[selectedKey];
        if (!preloadedVideo) {
            console.warn(`VFX video "${selectedKey}" not found or not preloaded.`);
            return;
        }

        const video = preloadedVideo.cloneNode(true) as HTMLVideoElement;
        video.currentTime = 0;
        video.play().catch(e => console.error(`VFX play error for ${selectedKey}:`, e));
        
        const profile = VFX_PROFILES[selectedKey];
        const width = profile.width || 256;
        const height = profile.height || 256;
        
        this.activeEffects.push({
            key: selectedKey,
            video,
            worldPosition: worldPosition.clone(),
            width,
            height,
        });
    }

    public updateAndDraw(
        ctx: CanvasRenderingContext2D, 
        mapContainer: THREE.Object3D, 
        camera: THREE.PerspectiveCamera, 
        sphereRadius: number // No longer used, but kept for signature compatibility
    ): void {
        if (!this.isInitialized) return;

        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = ctx.canvas.width / dpr;
        const canvasHeight = ctx.canvas.height / dpr;

        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            
            // Remove the effect if the video has finished playing.
            if (effect.video.ended) {
                this.activeEffects.splice(i, 1);
                continue;
            }

            const worldPos = effect.worldPosition.clone().applyMatrix4(mapContainer.matrixWorld);
            
            // Culling: check if the surface normal is facing the camera.
            const viewVector = new THREE.Vector3().subVectors(camera.position, worldPos);
            const normal = worldPos.clone().normalize(); // Assumes sphere is at origin

            if (viewVector.dot(normal) > 0) { // If the point is on the visible hemisphere
                const screenPos = worldPos.clone().project(camera);
                
                // Check if the effect is within the screen bounds (in front of camera)
                if (screenPos.z < 1) {
                    const x = (screenPos.x * 0.5 + 0.5) * canvasWidth;
                    const y = (-screenPos.y * 0.5 + 0.5) * canvasHeight;

                    // Draw the current frame of the video onto the canvas.
                    ctx.drawImage(
                        effect.video,
                        x - effect.width / 2,
                        y - effect.height / 2,
                        effect.width,
                        effect.height
                    );
                }
            }
        }
    }
}