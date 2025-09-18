import { ConquestEvent } from '@/types/game';
import { Camera, Frustum, Matrix4, Vector3 } from 'three';
import { vfxManager } from '@/logic/effects/VfxManager';
import { sfxManager } from '@/logic/effects/SfxManager';

interface Effect {
  key: string;
  position: Vector3;
  type: 'vfx' | 'sfx';
}

class TurnBasedEffectsProcessor {
  private effectQueue: Effect[] = [];
  private offScreenQueue: Effect[] = [];
  private camera: Camera | null = null;
  private isProcessing = false;

  public setCamera(camera: Camera) {
    this.camera = camera;
  }

  public addEffectsForConquest(event: ConquestEvent, position: Vector3) {
    console.log(`[TurnBasedEffects] Adding effects for conquest by ${event.conqueror} at`, position);
    const ownerKey = event.conqueror === 'player-1' ? 'player' : 'opponent';
    this.effectQueue.push({ key: `conquest-${ownerKey}-sfx`, position, type: 'sfx' });
    this.effectQueue.push({ key: `conquest-${ownerKey}-vfx`, position, type: 'vfx' });
  }

  public processQueues() {
    if (!this.camera) {
        // console.warn('[TurnBasedEffects] No camera set, cannot process queues.');
        return;
    }
    this.processOffScreenQueue();
    if (this.isProcessing || this.effectQueue.length === 0) {
      return;
    }
    console.log(`[TurnBasedEffects] Starting to process queue with ${this.effectQueue.length} effects.`);
    this.isProcessing = true;
    this.playNextEffect();
  }

  private processOffScreenQueue() {
    if (!this.camera) return;

    const stillOffScreen: Effect[] = [];
    const newlyVisible: Effect[] = [];

    for (const effect of this.offScreenQueue) {
      if (this.isPositionInFrustum(effect.position)) {
        newlyVisible.push(effect);
      } else {
        stillOffScreen.push(effect);
      }
    }

    if (newlyVisible.length > 0) {
        console.log(`[TurnBasedEffects] ${newlyVisible.length} effects became visible and were added to the main queue.`);
        this.effectQueue.push(...newlyVisible);
    }

    this.offScreenQueue = stillOffScreen;
  }

  private playNextEffect() {
    if (this.effectQueue.length === 0) {
      console.log('[TurnBasedEffects] Effect queue finished.');
      this.isProcessing = false;
      return;
    }

    const effect = this.effectQueue.shift()!;
    console.log('[TurnBasedEffects] Playing next effect:', effect);

    if (this.camera && !this.isPositionInFrustum(effect.position)) {
      console.log(`[TurnBasedEffects] Effect ${effect.key} is off-screen. Queueing for later.`, effect.position);
      this.offScreenQueue.push(effect);
      // Continue processing without delay
      this.playNextEffect();
      return;
    }

    console.log(`[TurnBasedEffects] Effect ${effect.key} is on-screen. Playing now.`);
    if (effect.type === 'vfx') {
      vfxManager.playTurnBasedEffect(effect.key, effect.position);
    } else {
      sfxManager.playSound(effect.key, 'fx', effect.position);
    }

    setTimeout(() => this.playNextEffect(), 200);
  }

  private isPositionInFrustum(position: Vector3): boolean {
    if (!this.camera) return false;
    const frustum = new Frustum();
    const projScreenMatrix = new Matrix4();
    projScreenMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(projScreenMatrix);
    const inFrustum = frustum.containsPoint(position);
    console.log(`[TurnBasedEffects] Position ${position.x.toFixed(2)},${position.y.toFixed(2)},${position.z.toFixed(2)} in frustum: ${inFrustum}`);
    return inFrustum;
  }

  public clearQueues() {
    console.log('[TurnBasedEffects] Clearing all effect queues.');
    this.effectQueue = [];
    this.offScreenQueue = [];
    this.isProcessing = false;
  }
}

export const turnBasedEffectsProcessor = new TurnBasedEffectsProcessor();