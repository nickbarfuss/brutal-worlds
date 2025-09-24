import { Rule } from '@/types/rules';
import { Vector3 } from 'three';
import { AudioChannel } from '@/types/core';

export interface EffectTargeting {
    targetType: string; // e.g., 'Friendly Enclave', 'Self', 'Enemy Enclave', 'Route'
    siteCount: number;
}

export interface EffectPhase {
    name: string;
    description: string;
    effect?: string;
    duration: number | [number, number] | 'Permanent';
    radius: number | [number, number] | (() => number) | 'Global';
    movement?: number | [number, number];
    rules: Rule[];
}

export interface EffectLogic {
    category?: 'Archetype' | 'Common';
    playstyle?: 'Offensive' | 'Defensive' | 'Utility';
    targeting?: EffectTargeting;

    originCellType?: 'Area' | 'Void' | 'Area or Void';
    siteCount?: number | [number, number];

    availability?: number;

    alert?: EffectPhase;
    impact: EffectPhase;
    aftermath?: EffectPhase;
}

// VFX (Stateful)
export interface ActiveVfx {
  key: string;
  video: HTMLVideoElement;
  worldPosition: Vector3;
  width: number;
  height: number;
}

export interface SfxPlayback {
  key: string;
  channel: AudioChannel;
  position?: Vector3;
}
