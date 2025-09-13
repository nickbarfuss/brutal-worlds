import * as THREE from 'three';
import { SFX_SOURCES } from '@/data/sfx';
import { getAssetUrl } from '@/utils/assetUtils';
import { AudioChannel, SfxCategoryName, Vector3 } from '@/types/game';

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
    private simpleKeyToFullKeyMap: Map<string, string> = new Map();
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

    private preloadPromise: Promise<void> | null = null;

    public init(): Promise<void> {
        if (this.isInitialized) return Promise.resolve();
        
        this.preloadPromise = (async () => {
            this.musicTrackKeys = Object.keys(SFX_SOURCES.music);
            this.ambientTrackKeys = Object.keys(SFX_SOURCES.ambient);
    
            await this.preloadAllSounds();
            this.isInitialized = true;
            
        })();
        
        return this.preloadPromise;
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

    private async preloadAllSounds(): Promise<void> {
        const decodingContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const promises: Promise<void>[] = [];
        for (const category in SFX_SOURCES) {
            for (const key in SFX_SOURCES[category as SfxCategoryName]) {
                const fullKey = `${category}-${key}`;
                this.simpleKeyToFullKeyMap.set(key, fullKey);
                const profile = SFX_SOURCES[category as SfxCategoryName][key];
                promises.push(this.loadAndDecodeSound(fullKey, getAssetUrl(profile.url), decodingContext));
            }
        }
        await Promise.all(promises);
        
        await decodingContext.close();
    }
    
    private async loadAndDecodeSound(key: string, url: string, context: AudioContext): Promise<void> {
        if (this.decodedBuffers.has(key)) return;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch sound "${key}"`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            this.decodedBuffers.set(key, audioBuffer);
        } catch (error) {
            console.error(`Failed to load and decode sound "${key}":`, error);
        }
    }

    public getFullKey(key: string | string[], channel: AudioChannel): string {
        const actualKey = Array.isArray(key) ? key[0] : key; // Take the first key if it's an array for mapping purposes
        const mappedKey = this.simpleKeyToFullKeyMap.get(actualKey);
        if (mappedKey) return mappedKey;

        const keyParts = actualKey.split('-');
        const categories = Object.keys(SFX_SOURCES);
        if (categories.includes(keyParts[0])) {
            return actualKey;
        }
        return `${channel}-${actualKey}`;
    }

    public async playSound(key: string | string[], channel: AudioChannel = 'fx', position?: Vector3): Promise<void> {
        console.log(`[SfxManager] Attempting to play sound: ${key}, channel: ${channel}, position: ${position ? JSON.stringify(position) : 'none'}`);
        if (!this.hasUserInteracted || !this.audioContext) {
            console.log(`[SfxManager] Play sound aborted: User not interacted or audio context not available.`);
            return;
        }
        
        let selectedKey: string;
        if (Array.isArray(key)) {
            selectedKey = key[Math.floor(Math.random() * key.length)];
        } else {
            selectedKey = key;
        }

        const fullKey = this.getFullKey(selectedKey, channel);
        const buffer = this.decodedBuffers.get(fullKey);
        if (!buffer) {
            console.warn(`[SfxManager] Sound buffer not found for key: ${selectedKey} (resolved to ${fullKey}). Playback aborted.`);
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
                console.log(`[SfxManager] Spatial sound ended for key: ${selectedKey}`);
            };

        } else {
            source.connect(channelGain);
        }
        
        source.start();
        console.log(`[SfxManager] Successfully started playback for: ${fullKey}`);
    };
    
    public playSpatialLoop(loopId: string, soundKey: string, channel: AudioChannel, position: Vector3): void {
        console.log(`[SfxManager] Attempting to play spatial loop: ${loopId}, soundKey: ${soundKey}, channel: ${channel}, position: ${JSON.stringify(position)}`);
        if (!this.hasUserInteracted || !this.audioContext) {
            console.log(`[SfxManager] Play spatial loop aborted: User not interacted or audio context not available.`);
            return;
        }

        if (this.activeSpatialLoops.has(loopId)) {
            console.log(`[SfxManager] Spatial loop with ID ${loopId} already active, stopping existing loop.`);
            this.stopSpatialLoop(loopId);
        }

        const buffer = this.decodedBuffers.get(soundKey);
        if (!buffer) {
            console.warn(`[SfxManager] Sound buffer not found for spatial loop key: ${soundKey}. Playback aborted.`);
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
        console.log(`[SfxManager] Successfully started spatial loop: ${loopId} for sound: ${soundKey}`);
    }

    public stopSpatialLoop(loopId: string): void {
        const loop = this.activeSpatialLoops.get(loopId);
        if (loop) {
            loop.source.stop();
            loop.source.disconnect();
            loop.panner.disconnect();
            this.activeSpatialLoops.delete(loopId);
        }
    }
    
    public getSoundDuration(key: string, channel: AudioChannel): number {
        const fullKey = this.getFullKey(key, channel);
        const buffer = this.decodedBuffers.get(fullKey);
        return buffer ? buffer.duration : 0;
    }

    public async handleUserInteraction(): Promise<void> {
        if (this.hasUserInteracted) return;
        
        await this.preloadPromise;
        
        if (!this.audioContext) {
            await this.createAudioContext();
        }
        
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        this.hasUserInteracted = true;
    }
    
    public playLoopIfNotPlaying(channel: AudioChannel): void {
        if (!this.hasUserInteracted) return;

        if (channel === 'music' && !this.activeLoops.has('music')) {
            this.currentMusicKey = this.musicTrackKeys[Math.floor(Math.random() * this.musicTrackKeys.length)];
            this.playLoop(this.currentMusicKey, 'music');
        } else if (channel === 'ambient' && !this.activeLoops.has('ambient')) {
            this.currentAmbientKey = this.ambientTrackKeys[Math.floor(Math.random() * this.ambientTrackKeys.length)];
            this.playLoop(this.currentAmbientKey, 'ambient');
        }
    }

    public playLoop(key: string, channel: AudioChannel): void {
        if (this.activeLoops.has(channel)) this.stopLoop(channel);

        const fullKey = this.getFullKey(key, channel);
        const buffer = this.decodedBuffers.get(fullKey);
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
    
    public stopLoop(channel: AudioChannel): void {
        const loop = this.activeLoops.get(channel);
        if (loop) {
            loop.stop();
            loop.disconnect();
            this.activeLoops.delete(channel);
        }
    }

    public reset(): void {
        (['fx', 'ambient', 'music', 'ui', 'dialog'] as AudioChannel[]).forEach(channel => {
            this.stopLoop(channel);
        });
        this.activeSpatialSounds.forEach(s => s.source.stop());
        this.activeSpatialSounds = [];
        this.activeSpatialLoops.forEach(l => l.source.stop());
        this.activeSpatialLoops.clear();
    }
    
    public setVolume(channel: AudioChannel, volume: number): void {
        if (this.channelGains.has(channel) && this.audioContext) {
            this.channelGains.get(channel)!.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
    
    public setGlobalMute(isMuted: boolean): void {
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.setValueAtTime(isMuted ? 0 : 1, this.audioContext.currentTime);
        }
    }
    
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