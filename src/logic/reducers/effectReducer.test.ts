import { vi } from 'vitest';
import { handleEffects } from './effectReducer';
import { initialState } from './index';
import { GameState, EffectProfile, ActiveEffectMarker } from '@/types/game';
import { EFFECT_PROFILES } from '@/data/effects';

// Mock Three.js Vector3
const mockVector3 = vi.fn(() => ({ x: 0, y: 0, z: 0, clone: vi.fn(() => ({ x: 0, y: 0, z: 0 })) }));
vi.stubGlobal('THREE', { Vector3: mockVector3 });

// Mock the effectManager to control `triggerNewEffect`'s return value
vi.mock('@/logic/effectManager', () => ({
  triggerNewEffect: vi.fn(),
}));

import { triggerNewEffect } from '@/logic/effectManager';

describe('effectReducer', () => {
  let state: GameState;

  beforeEach(() => {
    state = {
      ...initialState,
      enclaveData: {
        1: { id: 1, name: 'Enclave 1', center: new THREE.Vector3(), owner: 'player-1', forces: 10, domainId: 1, mainCellId: 1, archetypeKey: 'test', activeEffects: [], imageUrl: '' },
      },
      mapData: [
        { id: 1, type: 'area', center: new THREE.Vector3(), neighbors: [], enclaveId: 1 },
      ],
      currentWorld: {
        key: 'test-world', name: 'Test World', description: '', imageUrl: '', neutralColorPalette: { base: '', hover: '', target: '', selected: '', light: '', dark: '', disabled: '', icon: '', text: '' },
        bloom: { threshold: 0, strength: 0, radius: 0 }, tonemappingStrength: 0, config: { SPHERE_RADIUS: 100 }
      },
    };
    (triggerNewEffect as vi.Mock).mockClear();
  });

  it('should initialize activeEffectMarkers as an empty array', () => {
    expect(state.activeEffectMarkers).toEqual([]);
  });

  it('should add new effect markers when TRIGGER_EFFECT is dispatched', () => {
    const mockNewMarker: ActiveEffectMarker = {
      id: 'marker-1',
      profileKey: 'entropy-wind',
      cellId: 1,
      position: new THREE.Vector3(),
      currentPhase: 'alert',
      durationInPhase: 3,
      radius: 2,
      movement: 1,
      effects: ['entropy-wind'],
      metadata: { targetEnclaveIds: [1] },
    };

    (triggerNewEffect as vi.Mock).mockReturnValue({
      newMarkers: [mockNewMarker],
      snackbarData: null,
      effectsToPlay: [],
    });

    const action = { type: 'TRIGGER_EFFECT', payload: 'entropy-wind' };
    const newState = handleEffects(state, action);

    expect(newState.activeEffectMarkers).toEqual([mockNewMarker]);
    expect(triggerNewEffect).toHaveBeenCalledWith(
      EFFECT_PROFILES['entropy-wind'],
      expect.any(Object)
    );
  });

  it('should append new effect markers to existing ones', () => {
    const existingMarker: ActiveEffectMarker = {
      id: 'existing-marker',
      profileKey: 'test-effect',
      cellId: 2,
      position: new THREE.Vector3(),
      currentPhase: 'alert',
      durationInPhase: 2,
      radius: 1,
      movement: 0,
      effects: ['test-effect'],
      metadata: {},
    };
    state.activeEffectMarkers = [existingMarker];

    const mockNewMarker: ActiveEffectMarker = {
      id: 'marker-2',
      profileKey: 'entropy-wind',
      cellId: 1,
      position: new THREE.Vector3(),
      currentPhase: 'alert',
      durationInPhase: 3,
      radius: 2,
      movement: 1,
      effects: ['entropy-wind'],
      metadata: { targetEnclaveIds: [1] },
    };

    (triggerNewEffect as vi.Mock).mockReturnValue({
      newMarkers: [mockNewMarker],
      snackbarData: null,
      effectsToPlay: [],
    });

    const action = { type: 'TRIGGER_EFFECT', payload: 'entropy-wind' };
    const newState = handleEffects(state, action);

    expect(newState.activeEffectMarkers).toEqual([existingMarker, mockNewMarker]);
  });

  it('should return state unchanged if triggerNewEffect returns null', () => {
    (triggerNewEffect as vi.Mock).mockReturnValue(null);

    const action = { type: 'TRIGGER_EFFECT', payload: 'entropy-wind' };
    const newState = handleEffects(state, action);

    expect(newState).toBe(state); // Should be reference equal if no changes
    expect(newState.activeEffectMarkers).toEqual([]);
  });

  it('should handle TRIGGER_EFFECT with no new markers', () => {
    (triggerNewEffect as vi.Mock).mockReturnValue({
      newMarkers: [],
      snackbarData: null,
      effectsToPlay: [],
    });

    const action = { type: 'TRIGGER_EFFECT', payload: 'entropy-wind' };
    const newState = handleEffects(state, action);

    expect(newState.activeEffectMarkers).toEqual([]);
  });

  it('should clear latestEffect when CLEAR_LATEST_EFFECT is dispatched', () => {
    state.latestEffect = { profile: EFFECT_PROFILES['entropy-wind'], locationName: 'Test Location' };
    const action = { type: 'CLEAR_LATEST_EFFECT' };
    const newState = handleEffects(state, action);
    expect(newState.latestEffect).toBeNull();
  });

  it('should return state unchanged for unknown action types', () => {
    const unknownAction = { type: 'UNKNOWN_ACTION' } as any;
    const newState = handleEffects(state, unknownAction);
    expect(newState).toBe(state);
  });
});
