import { Vector3 } from 'three';
import { ConquestEvent } from '@/types/game';

export interface Effect {
  key: string;
  position: Vector3;
  type: 'vfx' | 'sfx';
}

type EffectQueueListener = (effects: Effect[]) => void;

class TurnBasedEffectsQueue {
  private queue: Effect[] = [];
  private listeners: EffectQueueListener[] = [];

  public addListener(listener: EffectQueueListener) {
    this.listeners.push(listener);
  }

  public removeListener(listener: EffectQueueListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.queue]));
  }

  public addEffectsForConquest(event: ConquestEvent, position: Vector3) {
    const ownerKey = event.conqueror === 'player-1' ? 'player' : 'opponent';
    this.queue.push({ key: `conquest-${ownerKey}-sfx`, position, type: 'sfx' });
    this.queue.push({ key: `conquest-${ownerKey}-vfx`, position, type: 'vfx' });
    this.notifyListeners();
  }

  public addEffects(effects: Effect[]) {
    this.queue.push(...effects);
    this.notifyListeners();
  }

  public getQueue() {
    return [...this.queue];
  }

  public clear() {
    this.queue = [];
    this.notifyListeners();
  }

  public removeEffects(effectsToRemove: Effect[]) {
    this.queue = this.queue.filter(effect => !effectsToRemove.includes(effect));
    this.notifyListeners();
  }
}

export const turnBasedEffects = new TurnBasedEffectsQueue();
