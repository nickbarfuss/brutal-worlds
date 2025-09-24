import { Vector3 } from 'three';
import { ConquestEvent } from '@/types/game';

export interface Effect {
  key: string;
  position: Vector3;
  type: 'vfx' | 'sfx';
}

type EffectListener = (effect: Effect) => void;

class TurnBasedEffects {
  private listeners: EffectListener[] = [];

  public addListener(listener: EffectListener) {
    this.listeners.push(listener);
  }

  public removeListener(listener: EffectListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public play(key: string, position: Vector3, type: 'vfx' | 'sfx') {
    this.listeners.forEach(listener => listener({ key, position, type }));
  }

  public playForConquest(event: ConquestEvent, position: Vector3) {
    const ownerKey = event.conqueror === 'player-1' ? 'player' : 'opponent';
    this.play(`conquest-${ownerKey}-sfx`, position, 'sfx');
    this.play(`conquest-${ownerKey}-vfx`, position, 'vfx');
  }
}

export const turnBasedEffects = new TurnBasedEffects();
