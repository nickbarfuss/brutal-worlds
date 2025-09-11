
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

    private isGloballyMuted = false;
    private hasUserInteracted = false;
    private isInitialized = false;

    private preloadPromise: Promise<void> | null = null;

    private channelVolumes: Record<AudioChannel, number> = {
        fx: 0.7, ambient: 0.20, music: 0.6, ui: 0.6, dialog: 0.8,
    };
    private mutedChannels: Record<AudioChannel, boolean> = {
        fx: false, ambient: false, music: false, ui: false, dialog: false,
    };

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
            (Object.keys(this.channelVolumes) as AudioChannel[]).forEach(channel => {
                const gainNode = this.audioContext!.createGain();
                gainNode.connect(this.masterGain!);
                this.channelGains.set(channel, gainNode);
                this.setVolume(channel, this.channelVolumes[channel]);
            });
            console.log("AudioContext created.");
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
            // Do not re-throw the error. Allow the promise to resolve, effectively skipping this sound.
        }
    }

    public getFullKey(key: string, channel: AudioChannel): string {
        const mappedKey = this.simpleKeyToFullKeyMap.get(key);
        if (mappedKey) return mappedKey;

        const keyParts = key.split('-');
        const categories = Object.keys(SFX_SOURCES);
        if (categories.includes(keyParts[0])) {
            return key;
        }
        return `${channel}-${key}`;
    }

    public async playSound(key: string, channel: AudioChannel = 'fx', position?: Vector3): Promise<void> {
        if (!this.hasUserInteracted || !this.audioContext) {
            return;
        }
        
        const fullKey = this.getFullKey(key, channel);
        const buffer = this.decodedBuffers.get(fullKey);
        if (!buffer) {
            console.warn(`Sound buffer not found for key: ${key} (resolved to ${fullKey})`);
            return;
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const channelGain = this.channelGains.get(channel);
        if (!channelGain) return;

        if (channel === 'fx' && position) {
            const panner = this.audioContext.createPanner();
    
            // Calibrated settings for planetary scale
            panner.panningModel = 'HRTF';
            panner.distanceModel = 'exponential';
            panner.refDistance = 24; // Distance for full volume (camera distance - sphere radius)
            panner.rolloffFactor = 2.5; // How quickly volume drops off
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
    }
    
    public playSpatialLoop(loopId: string, soundKey: string, channel: AudioChannel, position: Vector3): void {
        if (!this.hasUserInteracted || !this.audioContext) {
            return;
        }

        if (this.activeSpatialLoops.has(loopId)) {
            this.stopSpatialLoop(loopId);
        }

        const buffer = this.decodedBuffers.get(soundKey);
        if (!buffer) {
            console.warn(`Sound buffer not found for key: ${soundKey}`);
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

        // Position is set relative to the map container (local position)
        panner.positionX.value = position.x;
        panner.positionY.value = position.y;
        panner.positionZ.value = position.z;

        const channelGain = this.channelGains.get(channel);
        if (!channelGain) return;

        source.connect(panner);
        panner.connect(channelGain);
        source.start();

        this.activeSpatialLoops.set(loopId, { source, panner, position });
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
        
        await this.preloadPromise; // Ensure all sounds are loaded before creating context
        
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
        (Object.keys(this.channelVolumes) as AudioChannel[]).forEach(channel => {
            this.stopLoop(channel);
        });
        this.activeSpatialSounds.forEach(s => s.source.stop());
        this.activeSpatialSounds = [];
        this.activeSpatialLoops.forEach(l => l.source.stop());
        this.activeSpatialLoops.clear();
    }
    
    public setVolume(channel: AudioChannel, volume: number): void {
        this.channelVolumes[channel] = volume;
        if (this.channelGains.has(channel) && this.audioContext && !this.mutedChannels[channel]) {
            this.channelGains.get(channel)!.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
    
    public setMuted(channel: AudioChannel, isMuted: boolean): void {
        this.mutedChannels[channel] = isMuted;
        if (this.channelGains.has(channel) && this.audioContext) {
            const newVolume = isMuted ? 0 : this.channelVolumes[channel];
            this.channelGains.get(channel)!.gain.setValueAtTime(newVolume, this.audioContext.currentTime);
        }
    }
    
    public setGlobalMute(isMuted: boolean): void {
        this.isGloballyMuted = isMuted;
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

        // FIX: The original code modified camera.up in place, creating a feedback
        // loop with OrbitControls that caused erratic camera movement. This now
        // clones the vector before applying the quaternion, leaving the original
        // camera object's state untouched and resolving the glitch.
        const cameraUp = camera.up.clone().applyQuaternion(camera.quaternion);
        
        // Use setPosition and setOrientation for modern Web Audio API
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
            // Fallback for older browsers
            (listener as any).setPosition(cameraPosition.x, cameraPosition.y, cameraPosition.z);
            (listener as any).setOrientation(cameraDirection.x, cameraDirection.y, cameraDirection.z, cameraUp.x, cameraUp.y, cameraUp.z);
        }

        // Update positions of all active spatial sounds based on map container rotation
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
            
            // Update looping spatial sounds
            this.activeSpatialLoops.forEach(loop => {
                updatePannerPosition(loop.panner, loop.position, mapContainer.matrixWorld);
            });

            // FIX: Added a new loop to update one-shot spatial sounds. This was the source of the bug
            // where game sounds were not being correctly positioned in 3D space after the world rotated.
            // This ensures all playing 3D sounds are updated every frame.
            this.activeSpatialSounds.forEach(sound => {
                updatePannerPosition(sound.panner, sound.position, mapContainer.matrixWorld);
            });
        }
    }
}
