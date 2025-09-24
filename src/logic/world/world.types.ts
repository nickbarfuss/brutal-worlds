import { Vector3 } from 'three';
import { Owner } from '@/types/core';
import { ActiveEvent } from '@/logic/events/events.types';
import { SfxPlayback } from '@/logic/effects/effects.types';

// Map & World Entity Types (Stateful parts)
export interface MapCell {
  id: number;
  polygon: any;
  center: Vector3;
  neighbors: number[];
  type: 'void' | 'area';
  domainId: number | null;
  voidId: number | null;
  voidType: 'rift' | 'expanse' | null;
  enclaveId: number | null;
  owner: Owner;
  baseMaterialIndex: number;
  geometryGroupIndex: number;
}

export interface Enclave {
  id: number;
  name: string;
  owner: Owner;
  forces: number;
  center: Vector3;
  domainId: number;
  mainCellId: number;
  activeEvents: ActiveEvent[];
  archetypeKey?: string;
  imageUrl: string;
  vfxToPlayThisTurn?: { key: string; center: Vector3 }[];
  sfxToPlayThisTurn?: SfxPlayback[];
  position: Vector3; // Added to match usage in attackResolver
  loyalty?: number; // Added to match usage in attackResolver
}

export interface Domain {
  id: number;
  name: string;
  isIsland: boolean;
  center: Vector3;
  strength: number;
}

export interface Rift {
  id: number;
  name: string;
  center: Vector3;
  description: string;
}

export interface Expanse {
  id: number;
  name: string;
  center: Vector3;
  description: string;
}

export interface Route {
  from: number;
  to: number;
  type: 'land' | 'sea';
  disabledForTurns: number;
  isDestroyed: boolean;
}
