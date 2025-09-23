import { Vector3 } from 'three';

export interface ImmediateEffect {
  key: string;
  position: Vector3;
  type: 'vfx' | 'sfx';
}

type ImmediateEffectListener = (effect: ImmediateEffect) => void;

class ImmediateEffects {
  private listeners: ImmediateEffectListener[] = [];

  public addListener(listener: ImmediateEffectListener) {
    this.listeners.push(listener);
  }

  public removeListener(listener: ImmediateEffectListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  public play(key: string, position: Vector3, type: 'vfx' | 'sfx') {
    this.listeners.forEach(listener => listener({ key, position, type }));
  }
}

export const immediateEffects = new ImmediateEffects();
