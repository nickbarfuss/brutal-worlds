import * as THREE from 'three';
import { flattenAssetUrls, SFXAsset } from '@/utils/assetUtils';
import { AudioChannel, Vector3 } from '@/types/game';
import { ASSETS } from '@/data/assets';

interface ActiveSpatialSound {
    panner: PannerNode;
    position: Vector3;
    source: AudioBufferSourceNode;
}

interface ActiveSpatialLoop {
    source: AudioBufferSourceNode;
    panner: PannerNode;
    position: Vector3;
}

export class SfxManager {
    private audioContext: AudioContext | null = null;
    private decodedBuffers: Map<string, AudioBuffer> = new Map();
    private masterGain: GainNode | null = null;
    private channelGains: Map<AudioChannel, GainNode> = new Map();
    private activeLoops: Map<string, AudioBufferSourceNode> = new Map();
    private activeSpatialSounds: ActiveSpatialSound[] = [];
    private activeSpatialLoops: Map<string, ActiveSpatialLoop> = new Map();
    
    private musicTrackKeys: string[] = [];
    private ambientTrackKeys: string[] = [];
    private currentMusicKey: string | null = null;
    private currentAmbientKey: string | null = null;
    private camera: THREE.Camera | null = null;

    private hasUserInteracted = false;
    private isInitialized = false;

    private flattenedAudioAssets: Map<string, SFXAsset[]> = new Map();
    private lastPlayed: Map<string, number> = new Map();
    private readonly COOLDOWN_MS = 100;

    public async init(): Promise<void> {
        if (this.isInitialized) return Promise.resolve();
        
        this.flattenedAudioAssets = flattenAssetUrls<SFXAsset>(ASSETS, ['.mp3']);

        this.musicTrackKeys = Array.from(this.flattenedAudioAssets.keys()).filter(key => key.startsWith('music-'));
        this.ambientTrackKeys = Array.from(this.flattenedAudioAssets.keys()).filter(key => key.startsWith('ambient-'));
        
        const audioUrlsToPreload = Array.from(this.flattenedAudioAssets.values()).flat().map(asset => asset.src);
        
        await this.preloadSounds(audioUrlsToPreload);
        this.isInitialized = true;
    }

    private async createAudioContext(): Promise<void> {
        if (this.audioContext) return;
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            
            // Create gain nodes for each channel
            const defaultVolume = 0.7; // A sensible default
            (['fx', 'ambient', 'music', 'ui', 'dialog'] as AudioChannel[]).forEach(channel => {
                const gainNode = this.audioContext!.createGain();
                gainNode.gain.setValueAtTime(defaultVolume, this.audioContext!.currentTime);
                gainNode.connect(this.masterGain!);
                this.channelGains.set(channel, gainNode);
            });
            
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
            throw e;
        }
    }

    public isReady(): boolean {
        return this.isInitialized && this.hasUserInteracted;
    }

    public hasLoop(loopId: string): boolean {
        return this.activeLoops.has(loopId);
    }

    // Preload and decode audio files
    private async preloadSounds(urls: string[]): Promise<void> {
        const decodingContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const promises: Promise<void>[] = [];
        for (const url of urls) {
            // Use the full URL as the key for decodedBuffers
            promises.push(this.loadAndDecodeSound(url, url, decodingContext));
        }
        await Promise.all(promises);
        
        await decodingContext.close();
    }
    
    // Load and decode a single sound
    private async loadAndDecodeSound(key: string, url: string, context: AudioContext): Promise<void> {
        if (this.decodedBuffers.has(key)) return;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`[SfxManager] Failed to fetch sound "${key}": ${response.statusText}`);
                // TEMP FIX: Allow initialization to continue even if some assets are missing.
                // This should be removed once all assets are guaranteed to exist.
                return;
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            this.decodedBuffers.set(key, audioBuffer);
        } catch (error) {
            console.error(`Failed to load and decode sound "${key}":`, error);
        }
    }

    // Play a sound effect once
    public async playSound(key: string | string[], channel: AudioChannel = 'fx', position?: Vector3): Promise<void> {
        if (!this.hasUserInteracted || !this.audioContext) {
            return;
        }

        const soundKey = Array.isArray(key) ? key[Math.floor(Math.random() * key.length)] : key;

        const now = performance.now();
        if (now - (this.lastPlayed.get(soundKey) || 0) < this.COOLDOWN_MS) {
            console.log(`[SfxManager] Cooldown hit for key: ${soundKey}. Ignoring.`);
            return; // Cooldown active, ignore this play request
        }
        console.log(`[SfxManager] Playing sound for key: ${soundKey}`);
        this.lastPlayed.set(soundKey, now);

        const assets = this.flattenedAudioAssets.get(soundKey);
        if (!assets || assets.length === 0) {
            console.warn(`[SfxManager] Sound key not found in flattened assets or no URLs for key: ${soundKey}. Playback aborted.`);
            return;
        }

        const selectedUrl = assets[Math.floor(Math.random() * assets.length)].src;

        const buffer = this.decodedBuffers.get(selectedUrl);
        if (!buffer) {
            console.warn(`[SfxManager] Sound buffer not found for URL: ${selectedUrl} (from key: ${soundKey}). Playback aborted.`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const channelGain = this.channelGains.get(channel);
        if (!channelGain) {
            console.warn(`[SfxManager] Channel gain not found for channel: ${channel}. Playback aborted.`);
            return;
        }

        if (channel === 'fx' && position) {
            const panner = this.audioContext.createPanner();
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'exponential';
            panner.refDistance = 24;
            panner.rolloffFactor = 2.5;
            panner.coneInnerAngle = 360;
            panner.coneOuterAngle = 0;
            panner.coneOuterGain = 0;

            panner.positionX.value = position.x;
            panner.positionY.value = position.y;
            panner.positionZ.value = position.z;

            source.connect(panner);
            panner.connect(channelGain);

            this.activeSpatialSounds.push({ panner, position, source });
            source.onended = () => {
                this.activeSpatialSounds = this.activeSpatialSounds.filter(s => s.source !== source);
            };

        } else {
            source.connect(channelGain);
        }

        source.start();
    };    
    // Play a spatial looping sound
    public playSpatialLoop(loopId: string, soundKey: string, channel: AudioChannel, position: Vector3): void {
        
        if (!this.hasUserInteracted || !this.audioContext) {
            
            return;
        }

        if (this.activeSpatialLoops.has(loopId)) {
            
            this.stopSpatialLoop(loopId);
        }

        const assets = this.flattenedAudioAssets.get(soundKey);
        if (!assets || assets.length === 0) {
            console.warn(`[SfxManager] Sound key not found in flattened assets or no URLs for key: ${soundKey}. Playback aborted.`);
            return;
        }

        const selectedUrl = assets[Math.floor(Math.random() * assets.length)].src;

        const buffer = this.decodedBuffers.get(selectedUrl);
        if (!buffer) {
            console.warn(`[SfxManager] Sound buffer not found for URL: ${selectedUrl} (from key: ${soundKey}). Playback aborted.`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'exponential';
        panner.refDistance = 24;
        panner.rolloffFactor = 2.5;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;

        panner.positionX.value = position.x;
        panner.positionY.value = position.y;
        panner.positionZ.value = position.z;

        const channelGain = this.channelGains.get(channel);
        if (!channelGain) {
            console.warn(`[SfxManager] Channel gain not found for channel: ${channel}. Spatial loop playback aborted.`);
            return;
        }

        source.connect(panner);
        panner.connect(channelGain);
        source.start();

        this.activeSpatialLoops.set(loopId, { source, panner, position });
        
    }
    
    // Stop a spatial looping sound
    public stopSpatialLoop(loopId: string): void {
        const loop = this.activeSpatialLoops.get(loopId);
        if (loop) {
            loop.source.stop();
            loop.source.disconnect();
            loop.panner.disconnect();
            this.activeSpatialLoops.delete(loopId);
        }
    }
    
    // Get the duration of a sound in seconds
    public getSoundDuration(key: string, _channel: AudioChannel): number {
        const assets = this.flattenedAudioAssets.get(key);
        if (!assets || assets.length === 0) {
            console.warn(`[SfxManager] Sound key not found in flattened assets or no URLs for key: ${key}. Cannot get duration.`);
            return 0;
        }
        const selectedUrl = assets[0].src; // Assuming duration is the same for all variations
        const buffer = this.decodedBuffers.get(selectedUrl);
        return buffer ? buffer.duration : 0;
    }
    // Handle user interaction to unlock audio context
    public async handleUserInteraction(): Promise<void> {
        if (this.hasUserInteracted) return;
                
        if (!this.audioContext) {
            await this.createAudioContext();
        }
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        this.hasUserInteracted = true;
    }
    
    // Play a looping sound if not already playing
    public playLoopIfNotPlaying(key: string, channel: AudioChannel): void {
        if (!this.hasUserInteracted) return;

        if (!this.activeLoops.has(channel)) {
            this.playLoop(key, channel);
        }
    }

    public playRandomLoop(channel: AudioChannel): void {
        if (!this.hasUserInteracted) return;
    
        let trackKeys: string[];
        let currentKey: string | null;
        let setCurrentKey: (key: string | null) => void;
    
        if (channel === 'music') {
            trackKeys = this.musicTrackKeys;
            currentKey = this.currentMusicKey;
            setCurrentKey = (key) => { this.currentMusicKey = key; };
        } else if (channel === 'ambient') {
            trackKeys = this.ambientTrackKeys;
            currentKey = this.currentAmbientKey;
            setCurrentKey = (key) => { this.currentAmbientKey = key; };
        } else {
            console.warn(`[SfxManager] Random loop not supported for channel: ${channel}`);
            return;
        }
    
        let availableTracks = trackKeys;
        if (currentKey) {
            availableTracks = availableTracks.filter(key => key !== currentKey);
        }
    
        if (availableTracks.length === 0) {
            availableTracks = trackKeys;
        }
    
        if (availableTracks.length > 0) {
            const randomKey = availableTracks[Math.floor(Math.random() * availableTracks.length)];
            setCurrentKey(randomKey);
            this.playLoop(randomKey, channel);
        } else {
            console.warn(`[SfxManager] No tracks found to play on channel: ${channel}`);
        }
    }

   // Play a looping sound, replacing any existing loop on the same channel
    public playLoop(key: string, channel: AudioChannel): void {
        if (this.activeLoops.has(channel)) this.stopLoop(channel);

        const assets = this.flattenedAudioAssets.get(key);
        if (!assets || assets.length === 0) {
            console.warn(`[SfxManager] Sound key not found in flattened assets or no URLs for key: ${key}. Playback aborted.`);
            return;
        }

        const selectedUrl = assets[Math.floor(Math.random() * assets.length)].src;

        const buffer = this.decodedBuffers.get(selectedUrl);
        if (!buffer || !this.audioContext) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const channelGain = this.channelGains.get(channel);
        if (channelGain) {
            source.connect(channelGain);
            source.start();
            this.activeLoops.set(channel, source);
        }
    }    
    // Stop a looping sound on a specific channel
    public stopLoop(channel: AudioChannel): void {
        const loop = this.activeLoops.get(channel);
        if (loop) {
            loop.stop();
            loop.disconnect();
            this.activeLoops.delete(channel);
        }
    }

    // Stop all sounds and loops, clear active lists
    public reset(): void {
        (['fx', 'ambient', 'music', 'ui', 'dialog'] as AudioChannel[]).forEach(channel => {
            this.stopLoop(channel);
        });
        this.activeSpatialSounds.forEach(s => s.source.stop());
        this.activeSpatialSounds = [];
        this.activeSpatialLoops.forEach(l => l.source.stop());
        this.activeSpatialLoops.clear();
        this.currentMusicKey = null;
        this.currentAmbientKey = null;
    }
    
    // Set volume for a specific channel (0.0 to 1.0)
    public setVolume(channel: AudioChannel, volume: number): void {
        if (this.channelGains.has(channel) && this.audioContext) {
            this.channelGains.get(channel)!.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
    
    // Mute or unmute all sounds
    public setGlobalMute(isMuted: boolean): void {
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.setValueAtTime(isMuted ? 0 : 1, this.audioContext.currentTime);
        }
    }
    
    // spatial sound management 
    // Update listener position and orientation based on camera
    public updateListener(camera: THREE.Camera, mapContainer?: THREE.Object3D): void {
        this.camera = camera;
        if (!this.audioContext || !this.audioContext.listener) return;

        const listener = this.audioContext.listener;

        const cameraPosition = new THREE.Vector3();
        camera.getWorldPosition(cameraPosition);

        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);

        const cameraUp = camera.up.clone().applyQuaternion(camera.quaternion);
        
        if (listener.positionX) {
            listener.positionX.setValueAtTime(cameraPosition.x, this.audioContext.currentTime);
            listener.positionY.setValueAtTime(cameraPosition.y, this.audioContext.currentTime);
            listener.positionZ.setValueAtTime(cameraPosition.z, this.audioContext.currentTime);
            listener.forwardX.setValueAtTime(cameraDirection.x, this.audioContext.currentTime);
            listener.forwardY.setValueAtTime(cameraDirection.y, this.audioContext.currentTime);
            listener.forwardZ.setValueAtTime(cameraDirection.z, this.audioContext.currentTime);
            listener.upX.setValueAtTime(cameraUp.x, this.audioContext.currentTime);
            listener.upY.setValueAtTime(cameraUp.y, this.audioContext.currentTime);
            listener.upZ.setValueAtTime(cameraUp.z, this.audioContext.currentTime);
        } else {
            (listener as any).setPosition(cameraPosition.x, cameraPosition.y, cameraPosition.z);
            (listener as any).setOrientation(cameraDirection.x, cameraDirection.y, cameraDirection.z, cameraUp.x, cameraUp.y, cameraUp.z);
        }

        if (mapContainer) {
            const updatePannerPosition = (panner: PannerNode, localPosition: Vector3, worldMatrix: THREE.Matrix4) => {
                const worldPosition = localPosition.clone().applyMatrix4(worldMatrix);
                if (panner.positionX) {
                    panner.positionX.setValueAtTime(worldPosition.x, this.audioContext!.currentTime);
                    panner.positionY.setValueAtTime(worldPosition.y, this.audioContext!.currentTime);
                    panner.positionZ.setValueAtTime(worldPosition.z, this.audioContext!.currentTime);
                } else {
                    (panner as any).setPosition(worldPosition.x, worldPosition.y, worldPosition.z);
                }
            };
            
            this.activeSpatialLoops.forEach(loop => {
                updatePannerPosition(loop.panner, loop.position, mapContainer.matrixWorld);
            });

            this.activeSpatialSounds.forEach(sound => {
                updatePannerPosition(sound.panner, sound.position, mapContainer.matrixWorld);
            });
        }
    }
}