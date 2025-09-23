import * as THREE from 'three';
import { ASSETS } from '@/data/assets';
import { flattenAssetUrls, VFXAsset } from '@/utils/assetUtils';
import { ActiveEffect } from '@/features/effects/effects.types';

export class VfxManager {
    private isInitialized: boolean = false;
    private preloadedVideos: Map<string, VFXAsset[]> = new Map();

    constructor() {}

    public async init(): Promise<void> {
        if (this.isInitialized) return;

        const vfxAssets = flattenAssetUrls<VFXAsset>(ASSETS, ['.webm', '.mp4']);
        const assetPromises: Promise<void>[] = [];

        vfxAssets.forEach((assets, key) => {
            assets.forEach(asset => {
                assetPromises.push(this.loadVideo(key, asset));
            });
        });

        try {
            await Promise.all(assetPromises);
            this.isInitialized = true;
        } catch (error) {
            console.error("Error initializing VFX Manager:", error);
            throw new Error("Failed to load one or more VFX assets.");
        }
    }

    private loadVideo(key: string, asset: VFXAsset): Promise<void> {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = asset.src;
            video.muted = true;
            video.loop = false;
            video.playsInline = true;
            video.preload = 'auto';
            video.load();

            const assetWithVideo = { ...asset, video };

            if (!this.preloadedVideos.has(key)) {
                this.preloadedVideos.set(key, []);
            }
            this.preloadedVideos.get(key)?.push(assetWithVideo);
            resolve();
        });
    }

    public reset(): void {
        // Now the players are responsible for stopping their own effects.
        // This method could be used to stop all videos if needed, but for now it's empty.
    }

    public playEffect(key: string, worldPosition: THREE.Vector3, onEnded: () => void): ActiveEffect | null {
        const videos = this.preloadedVideos.get(key);
        if (!videos || videos.length === 0) {
            console.warn(`No VFX found for key: ${key}`);
            return null;
        }

        const videoAsset = videos[Math.floor(Math.random() * videos.length)];
        const video = (videoAsset as any).video as HTMLVideoElement;
        
        const playVideo = () => {
            video.currentTime = 0;
            video.play().catch(e => {
                if (e.name !== 'AbortError') {
                    console.error(`Error playing VFX for ${key}:`, e);
                }
            });
            video.onended = onEnded;
        };

        if (video.readyState >= 3) { // HAVE_FUTURE_DATA
            playVideo();
        } else {
            video.addEventListener('canplaythrough', playVideo, { once: true });
        }

        return { 
            key, 
            video, 
            worldPosition, 
            width: videoAsset.width, 
            height: videoAsset.height,
            onEnded
        };
    }

    public isInitializedStatus(): boolean {
        return this.isInitialized;
    }

    public updateAndDraw(
        ctx: CanvasRenderingContext2D, 
        mapContainer: THREE.Object3D, 
        camera: THREE.PerspectiveCamera,
        effects: ActiveEffect[]
    ): void {
        if (!this.isInitialized) return;

        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = ctx.canvas.width / dpr;
        const canvasHeight = ctx.canvas.height / dpr;

        const drawEffect = (effect: ActiveEffect) => {
            if (effect.video.ended) {
                return;
            }

            const worldPos = effect.worldPosition.clone().applyMatrix4(mapContainer.matrixWorld);
            const viewVector = new THREE.Vector3().subVectors(camera.position, worldPos);
            const normal = worldPos.clone().normalize();

            if (viewVector.dot(normal) > 0) {
                const screenPos = worldPos.clone().project(camera);
                
                if (screenPos.z < 1) {
                    const x = (screenPos.x * 0.5 + 0.5) * canvasWidth;
                    const y = (-screenPos.y * 0.5 + 0.5) * canvasHeight;

                    ctx.drawImage(
                        effect.video,
                        x - effect.width / 2,
                        y - effect.height / 2,
                        effect.width,
                        effect.height
                    );
                }
            }
        };

        effects.forEach(drawEffect);
    }
}

export const vfxManager = new VfxManager();
