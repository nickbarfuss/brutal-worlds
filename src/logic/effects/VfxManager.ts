import * as THREE from 'three';
import { ASSETS } from '@/data/assets';
import { flattenAssetUrls, VFXAsset } from '@/utils/assetUtils';

interface ActiveEffect {
    key: string;
    video: HTMLVideoElement;
    worldPosition: THREE.Vector3;
    width: number;
    height: number;
}

export class VfxManager {
    private isInitialized: boolean = false;
    private preloadedVideos: Map<string, VFXAsset[]> = new Map();
    private activeImmediateEffect: ActiveEffect | null = null;
    private activeTurnBasedEffects: ActiveEffect[] = [];

    constructor() {}

    public async init(): Promise<void> {
        if (this.isInitialized) return;

        const vfxAssets = flattenAssetUrls<VFXAsset>(ASSETS, ['.webm', '.mp4']);
        //console.log('[VfxManager.init] vfxAssets map from flattenAssetUrls:', vfxAssets);
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

            //console.log(`[VfxManager.loadVideo] Setting preloaded video for key: '${key}'`);
            if (!this.preloadedVideos.has(key)) {
                this.preloadedVideos.set(key, []);
            }
            this.preloadedVideos.get(key)?.push(assetWithVideo);
            resolve();
        });
    }

    public reset(): void {
        if (this.activeImmediateEffect) {
            this.activeImmediateEffect.video.pause();
            this.activeImmediateEffect.video.currentTime = 0;
            this.activeImmediateEffect = null;
        }
        this.activeTurnBasedEffects.forEach(effect => {
            effect.video.pause();
            effect.video.currentTime = 0;
        });
        this.activeTurnBasedEffects = [];
    }

    public playImmediateEffect(key: string, worldPosition: THREE.Vector3): void {
        if (this.activeImmediateEffect) {
            this.activeImmediateEffect.video.pause();
            this.activeImmediateEffect.video.currentTime = 0;
        }

        const videos = this.preloadedVideos.get(key);
        if (!videos || videos.length === 0) {
            console.warn(`No VFX found for key: ${key}`);
            //console.log('[VfxManager] Available keys in preloadedVideos:', Array.from(this.preloadedVideos.keys()));
            return;
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

            this.activeImmediateEffect = { key, video, worldPosition, width: videoAsset.width, height: videoAsset.height };

            video.onended = () => {
                if (this.activeImmediateEffect && this.activeImmediateEffect.video === video) {
                    this.activeImmediateEffect = null;
                }
            };
        };

        if (video.readyState >= 3) { // HAVE_FUTURE_DATA
            playVideo();
        } else {
            video.addEventListener('canplaythrough', playVideo, { once: true });
        }
    }

    public playTurnBasedEffect(key: string, worldPosition: THREE.Vector3): void {
        const videos = this.preloadedVideos.get(key);
        if (!videos || videos.length === 0) {
            console.warn(`No VFX found for key: ${key}`);
            //('[VfxManager] Available keys in preloadedVideos:', Array.from(this.preloadedVideos.keys()));
            return;
        }

        const videoAsset = videos[Math.floor(Math.random() * videos.length)];
        const video = (videoAsset as any).video as HTMLVideoElement;

        const playVideo = () => {
            video.currentTime = 0;
            video.play().catch(e => console.error(`Error playing turn-based VFX for ${key}:`, e));

            const effect: ActiveEffect = { key, video, worldPosition, width: videoAsset.width, height: videoAsset.height };
            this.activeTurnBasedEffects.push(effect);

            video.onended = () => {
                this.activeTurnBasedEffects = this.activeTurnBasedEffects.filter(e => e.video !== video);
            };
        };

        if (video.readyState >= 3) { // HAVE_FUTURE_DATA
            playVideo();
        } else {
            video.addEventListener('canplaythrough', playVideo, { once: true });
        }
    }

    public isInitializedStatus(): boolean {
        return this.isInitialized;
    }

    public updateAndDraw(
        ctx: CanvasRenderingContext2D, 
        mapContainer: THREE.Object3D, 
        camera: THREE.PerspectiveCamera, 
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

        // Draw immediate effect
        if (this.activeImmediateEffect) {
            if (this.activeImmediateEffect.video.ended) {
                this.activeImmediateEffect = null;
            } else {
                drawEffect(this.activeImmediateEffect);
            }
        }

        // Draw and cleanup turn-based effects
        this.activeTurnBasedEffects = this.activeTurnBasedEffects.filter(effect => !effect.video.ended);
        this.activeTurnBasedEffects.forEach(drawEffect);
    }
}

export const vfxManager = new VfxManager();
