import { EffectUI } from '@/features/effects/effects.types';
import { EffectLogic } from '@/logic/effects/effects.types';
import { Rule } from '@/types/rules';
import { Vector3 } from 'three';

export interface EventProfile {
    key: string;
    ui: EffectUI;
    logic: EffectLogic;
}

// Disasters & Events (Stateful parts)
export interface ActiveEvent {
  id: string;
  profileKey: string;
  duration: number;
  maxDuration: number;
  phase: 'alert' | 'impact' | 'aftermath';
  rules: Rule[];
  metadata?: any;
}

export interface ActiveEventMarker {
  id: string;
  profileKey: string;
  cellId: number;
  position: Vector3;
  currentPhase: 'alert' | 'impact' | 'aftermath';
  durationInPhase: number;
  radius: number;
  movement: number;
  events: string[];
  metadata?: {
    targetEnclaveIds?: number[];
    [key: string]: any;
  };
}
