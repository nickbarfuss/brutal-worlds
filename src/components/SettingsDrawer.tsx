import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AudioChannel, GameState, MaterialProperties } from '@/types/game';
import SliderCard from '@/components/ui/SliderCard';
import SwitchCard from '@/components/ui/SwitchCard';
import { SfxManager } from '@/logic/SfxManager';
import { WorldCanvasHandle } from '@/components/WorldCanvas';
import { TEXT } from '@/data/text';

interface SettingsDrawerProps {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  isGloballyMuted: boolean;
  onToggleGlobalMute: () => void;
  volumes: Record<AudioChannel, number>;
  onVolumeChange: (channel: AudioChannel, volume: number) => void;
  mutedChannels: Record<AudioChannel, boolean>;
  onToggleMute: (channel: AudioChannel) => void;
  isBloomEnabled: boolean;
  onToggleBloom: (enabled: boolean) => void;
  bloomSettings: {
    threshold: number;
    strength: number;
    radius: number;
  };
  onBloomSettingChange: (key: keyof SettingsDrawerProps['bloomSettings'], value: number) => void;
  materialSettings: GameState['materialSettings'];
  onMaterialSettingChange: (type: keyof GameState['materialSettings'], key: keyof MaterialProperties, value: number) => void;
  ambientLightIntensity: number;
  onAmbientLightIntensityChange: (value: number) => void;
  tonemappingStrength: number;
  onTonemappingStrengthChange: (value: number) => void;
  playVfxFromPreviousTurns: boolean;
  onSetPlayVfxFromPreviousTurns: (enabled: boolean) => void;
  stackVfx: boolean;
  onSetStackVfx: (enabled: boolean) => void;
  sfxManager: SfxManager | null;
  worldCanvasHandle: React.RefObject<WorldCanvasHandle | null>;
  camera: THREE.PerspectiveCamera | null;
}

const soundChannels: { key: AudioChannel; label: string; }[] = [
  { key: 'music', label: TEXT.settings.sound.channels.music },
  { key: 'ambient', label: TEXT.settings.sound.channels.ambient },
  { key: 'dialog', label: TEXT.settings.sound.channels.dialog },
  { key: 'fx', label: TEXT.settings.sound.channels.fx },
  { key: 'ui', label: TEXT.settings.sound.channels.ui },
];

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ 
    isOpen, isClosing, onClose, isGloballyMuted, onToggleGlobalMute,
    volumes, onVolumeChange,
    mutedChannels, onToggleMute, isBloomEnabled, onToggleBloom,
    bloomSettings, onBloomSettingChange, materialSettings, onMaterialSettingChange,
    ambientLightIntensity, onAmbientLightIntensityChange, tonemappingStrength, onTonemappingStrengthChange,
    playVfxFromPreviousTurns, onSetPlayVfxFromPreviousTurns, stackVfx, onSetStackVfx,
    sfxManager, worldCanvasHandle, camera,
}) => {
  const [fps, setFps] = useState(0);
  const [fov, setFov] = useState(0);
  const [distance, setDistance] = useState(0);

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameIdRef = useRef(0);

  useEffect(() => {
    if (!camera || !isOpen) return;

    const loop = (time: number) => {
      frameCountRef.current++;
      if (time - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = time;
      }
      
      setFov(camera?.fov || 0);
      setDistance(camera?.position.length() || 0);

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      frameCountRef.current = 0;
      lastTimeRef.current = performance.now();
    };
  }, [camera, isOpen]);

  if (!isOpen && !isClosing) return null;

  const animationClass = isClosing ? 'animate-slide-out-left' : 'animate-slide-in-left';

  const getSoundIcon = (channel: AudioChannel) => {
    if (mutedChannels[channel]) return 'volume_off';
    if (volumes[channel] === 0) return 'volume_mute';
    return 'volume_up';
  };

  return (
    <div
      onMouseEnter={() => worldCanvasHandle.current?.setControlsEnabled(false)}
      onMouseLeave={() => worldCanvasHandle.current?.setControlsEnabled(true)}
      className={`fixed top-0 left-0 h-full w-full max-w-[420px] bg-neutral-900 z-50 shadow-2xl border-r border-neutral-700/50 flex flex-col ${animationClass}`}>
      <div className="flex justify-between items-center p-4 border-b border-neutral-700 flex-shrink-0">
        <h2 className="text-2xl font-bold">{TEXT.settings.title}</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors duration-200 p-2 rounded-full">
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto no-scrollbar space-y-6">
        <div>
          <h3 className="font-medium text-base text-neutral-600 uppercase tracking-wider mb-3 px-1">{TEXT.settings.sound.title}</h3>
          <div className="space-y-2">
            <SwitchCard
                icon={isGloballyMuted ? 'volume_off' : 'volume_up'}
                label={TEXT.settings.sound.audioToggle}
                checked={!isGloballyMuted}
                onChange={onToggleGlobalMute}
            />
            {soundChannels.map(({ key, label }) => (
              <SliderCard
                key={key}
                icon={getSoundIcon(key)}
                label={label}
                onIconClick={() => !isGloballyMuted && onToggleMute(key)}
                sliderProps={{
                    min: 0,
                    max: 1,
                    step: 0.01,
                    value: volumes[key],
                    onChange: (value) => sfxManager?.setVolume(key, value),
                    onCommit: (value) => onVolumeChange(key, value),
                    disabled: isGloballyMuted || mutedChannels[key],
                }}
              />
            ))}
          </div>
        </div>
        
        <div>
            <h3 className="font-medium text-base text-neutral-600 uppercase tracking-wider mb-3 px-1">FX</h3>
            <div className="space-y-2">
                <SwitchCard
                    icon="replay"
                    label={TEXT.settings.fx.previousFXLabel}
                    description={TEXT.settings.fx.previouosFXDescription}
                    checked={playVfxFromPreviousTurns}
                    onChange={onSetPlayVfxFromPreviousTurns}
                />
                <SwitchCard
                    icon="layers"
                    label={TEXT.settings.fx.stackFXLabel}
                    description={TEXT.settings.fx.stackFXDescription}
                    checked={stackVfx}
                    onChange={onSetStackVfx}
                />
            </div>
        </div>

        <div>
          <h3 className="font-medium text-base text-neutral-600 uppercase tracking-wider mb-3 px-1">{TEXT.settings.camera.title} - {fps} FPS</h3>
          <div className="space-y-2">
            <SliderCard
                icon="settings_overscan"
                label={TEXT.settings.camera.FOVLabel}
                valueDisplay={fov.toFixed(0)}
                sliderProps={{
                    min: 30,
                    max: 60,
                    step: 1,
                    value: fov,
                    onChange: (value) => worldCanvasHandle.current?.setFov(value),
                }}
            />
            <SliderCard
                icon="social_distance"
                label={TEXT.settings.camera.distanceLabel}
                valueDisplay={distance.toFixed(0)}
                sliderProps={{
                    min: 20,
                    max: 50,
                    step: 1,
                    value: distance,
                    onChange: (value) => worldCanvasHandle.current?.setDistance(value),
                }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium text-base text-neutral-600 uppercase tracking-wider mb-3 px-1">{TEXT.settings.lighting.title}</h3>
          <div className="space-y-2">
             <SliderCard
                icon="light_mode"
                label={TEXT.settings.lighting.ambientLabel}
                valueDisplay={ambientLightIntensity.toFixed(2)}
                sliderProps={{ min: 0, max: 2, step: 0.01, value: ambientLightIntensity, onChange: (v) => worldCanvasHandle.current?.setAmbientLightIntensity(v), onCommit: onAmbientLightIntensityChange }}
            />
            <SwitchCard
                icon="flare"
                label={TEXT.settings.lighting.bloomToggle}
                checked={isBloomEnabled}
                onChange={onToggleBloom}
            />
            <SliderCard
                icon="filter_tilt_shift"
                label={TEXT.settings.lighting.bloom.thresholdLabel}
                valueDisplay={bloomSettings.threshold.toFixed(2)}
                sliderProps={{ min: 0, max: 1, step: 0.01, value: bloomSettings.threshold, onChange: (v) => worldCanvasHandle.current?.setBloomValue('threshold', v), onCommit: (v) => onBloomSettingChange('threshold', v), disabled: !isBloomEnabled }}
            />
            <SliderCard
                icon="flare"
                label={TEXT.settings.lighting.bloom.strengthLabel}
                valueDisplay={bloomSettings.strength.toFixed(2)}
                sliderProps={{ min: 0, max: 2, step: 0.01, value: bloomSettings.strength, onChange: (v) => worldCanvasHandle.current?.setBloomValue('strength', v), onCommit: (v) => onBloomSettingChange('strength', v), disabled: !isBloomEnabled }}
            />
            <SliderCard
                icon="blur_on"
                label={TEXT.settings.lighting.bloom.radiusLabel}
                valueDisplay={bloomSettings.radius.toFixed(2)}
                sliderProps={{ min: 0, max: 1, step: 0.01, value: bloomSettings.radius, onChange: (v) => worldCanvasHandle.current?.setBloomValue('radius', v), onCommit: (v) => onBloomSettingChange('radius', v), disabled: !isBloomEnabled }}
            />
            <SliderCard
                icon="tonality"
                label={TEXT.settings.lighting.bloom.tonemappingLabel}
                valueDisplay={(tonemappingStrength ?? 0).toFixed(2)}
                sliderProps={{ min: 0, max: 1, step: 0.01, value: tonemappingStrength, onChange: (v) => worldCanvasHandle.current?.setTonemappingStrength(v), onCommit: onTonemappingStrengthChange, disabled: !isBloomEnabled }}
            />
          </div>
        </div>

        <div>
          <h3 className="font-medium text-base text-neutral-600 uppercase tracking-wider mb-3 px-1">{TEXT.settings.materials.title}</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-neutral-400 mb-2 px-1">{TEXT.settings.materials.categories.player}</h4>
              <div className="space-y-2">
                <SliderCard
                  icon="texture"
                  label={TEXT.settings.materials.metalnessLabel}
                  valueDisplay={materialSettings.player.metalness.toFixed(2)}
                  sliderProps={{ min: 0, max: 1, step: 0.01, value: materialSettings.player.metalness, onChange: (v) => worldCanvasHandle.current?.setMaterialValue('player', 'metalness', v), onCommit: (v) => onMaterialSettingChange('player', 'metalness', v) }}
                />
                <SliderCard
                  icon="brightness_6"
                  label={TEXT.settings.materials.roughnessLabel}
                  valueDisplay={materialSettings.player.roughness.toFixed(2)}
                  sliderProps={{ min: 0, max: 1, step: 0.01, value: materialSettings.player.roughness, onChange: (v) => worldCanvasHandle.current?.setMaterialValue('player', 'roughness', v), onCommit: (v) => onMaterialSettingChange('player', 'roughness', v) }}
                />
                <SliderCard
                  icon="highlight"
                  label={TEXT.settings.materials.emissiveLabel}
                  valueDisplay={(materialSettings.player.emissiveIntensity ?? 0).toFixed(2)}
                  sliderProps={{ min: 0, max: 1, step: 0.01, value: materialSettings.player.emissiveIntensity ?? 0, onChange: (v) => worldCanvasHandle.current?.setMaterialValue('player', 'emissiveIntensity', v), onCommit: (v) => onMaterialSettingChange('player', 'emissiveIntensity', v) }}
                />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-400 mb-2 px-1">{TEXT.settings.materials.categories.neutral}</h4>
              <div className="space-y-2">
                <SliderCard
                  icon="texture"
                  label={TEXT.settings.materials.metalnessLabel}
                  valueDisplay={materialSettings.neutral.metalness.toFixed(2)}
                  sliderProps={{ min: 0, max: 1, step: 0.01, value: materialSettings.neutral.metalness, onChange: (v) => worldCanvasHandle.current?.setMaterialValue('neutral', 'metalness', v), onCommit: (v) => onMaterialSettingChange('neutral', 'metalness', v) }}
                />
                <SliderCard
                  icon="brightness_6"
                  label={TEXT.settings.materials.roughnessLabel}
                  valueDisplay={materialSettings.neutral.roughness.toFixed(2)}
                  sliderProps={{ min: 0, max: 1, step: 0.01, value: materialSettings.neutral.roughness, onChange: (v) => worldCanvasHandle.current?.setMaterialValue('neutral', 'roughness', v), onCommit: (v) => onMaterialSettingChange('neutral', 'roughness', v) }}
                />
                <SliderCard
                  icon="highlight"
                  label={TEXT.settings.materials.emissiveLabel}
                  valueDisplay={(materialSettings.neutral.emissiveIntensity ?? 0).toFixed(2)}
                  sliderProps={{ min: 0, max: 1, step: 0.01, value: materialSettings.neutral.emissiveIntensity ?? 0, onChange: (v) => worldCanvasHandle.current?.setMaterialValue('neutral', 'emissiveIntensity', v), onCommit: (v) => onMaterialSettingChange('neutral', 'emissiveIntensity', v) }}
                />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-neutral-400 mb-2 px-1">{TEXT.settings.materials.categories.void}</h4>
              <div className="space-y-2">
                <SliderCard
                  icon="texture"
                  label={TEXT.settings.materials.metalnessLabel}
                  valueDisplay={materialSettings.void.metalness.toFixed(2)}
                  sliderProps={{ min: 0, max: 1, step: 0.01, value: materialSettings.void.metalness, onChange: (v) => worldCanvasHandle.current?.setMaterialValue('void', 'metalness', v), onCommit: (v) => onMaterialSettingChange('void', 'metalness', v) }}
                />
                <SliderCard
                  icon="brightness_6"
                  label={TEXT.settings.materials.roughnessLabel}
                  valueDisplay={materialSettings.void.roughness.toFixed(2)}
                  sliderProps={{ min: 0, max: 1, step: 0.01, value: materialSettings.void.roughness, onChange: (v) => worldCanvasHandle.current?.setMaterialValue('void', 'roughness', v), onCommit: (v) => onMaterialSettingChange('void', 'roughness', v) }}
                />
                 <SliderCard
                  icon="highlight"
                  label={TEXT.settings.materials.emissiveLabel}
                  valueDisplay={(materialSettings.void.emissiveIntensity ?? 0).toFixed(2)}
                  sliderProps={{ min: 0, max: 1, step: 0.01, value: materialSettings.void.emissiveIntensity ?? 0, onChange: (v) => worldCanvasHandle.current?.setMaterialValue('void', 'emissiveIntensity', v), onCommit: (v) => onMaterialSettingChange('void', 'emissiveIntensity', v) }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsDrawer;