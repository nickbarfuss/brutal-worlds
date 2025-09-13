import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerNewEffect } from './effectManager';
import { EffectProfile, TriggerContext, MapCell, Enclave, Expanse, Rift, Domain } from '@/types/game';
import * as THREE from 'three';
import { DISASTER_PROFILES } from '@/data/disasters';

describe('Entropy Wind Disaster Integration Tests', () => {
    const entropyWindProfile = DISASTER_PROFILES['entropy-wind'];

    // Mock data for TriggerContext
    const mockEnclave: Enclave = {
        id: 1,
        name: 'Test Enclave',
        center: new THREE.Vector3(10, 0, 0),
        cells: [0],
        ownerId: null,
        size: 100,
        type: 'enclave',
    };

    const mockMapCell: MapCell = {
        id: 0,
        center: new THREE.Vector3(0, 0, 0),
        enclaveId: mockEnclave.id,
        neighbors: [],
        type: 'area',
        domainId: null,
        isBoundary: false,
        isCapitol: false,
        isHomeworld: false,
        isRift: false,
        isVoid: false,
        ownerId: null,
        polygon: [],
        regionId: null,
        resource: null,
        size: 0,
    };

    const mockTriggerContext: TriggerContext = {
        enclaveData: { [mockEnclave.id]: mockEnclave },
        domainData: {},
        mapData: [mockMapCell],
        expanseData: {},
        riftData: {},
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should correctly trigger entropy-wind disaster and generate alert phase effects', () => {
        const result = triggerNewEffect(entropyWindProfile, mockTriggerContext);

        expect(result).toBeDefined();
        expect(result).toHaveProperty('newMarkers');
        expect(result).toHaveProperty('snackbarData');
        expect(result).toHaveProperty('effectsToPlay');

        // Assert newMarkers
        expect(result?.newMarkers).toHaveLength(1);
        const marker = result?.newMarkers[0];
        expect(marker?.profileKey).toBe('entropy-wind');
        expect(marker?.cellId).toBe(mockMapCell.id);
        expect(marker?.currentPhase).toBe('alert');

        // Assert snackbarData
        expect(result?.snackbarData.profile.key).toBe('entropy-wind');
        expect(result?.snackbarData.locationName).toBe(mockEnclave.name);

        // Assert effectsToPlay
        // Expect 3 effects: VFX, SFX, and Dialog SFX
        expect(result?.effectsToPlay).toHaveLength(3);

        const vfxEffect = result?.effectsToPlay.find(e => e.vfxKey);
        const sfxEffect = result?.effectsToPlay.find(e => e.sfx && e.sfx.channel === 'fx');
        const dialogEffect = result?.effectsToPlay.find(e => e.sfx && e.sfx.channel === 'dialog');

        expect(vfxEffect).toBeDefined();
        expect(vfxEffect?.vfxKey).toBe(entropyWindProfile.ui.assets.vfx?.alert);
        expect(vfxEffect?.position).toEqual(mockMapCell.center);

        expect(sfxEffect).toBeDefined();
        expect(sfxEffect?.sfx?.key).toBe(entropyWindProfile.ui.assets.sfx?.alert);
        expect(sfxEffect?.sfx?.channel).toBe('fx');
        expect(sfxEffect?.position).toEqual(mockMapCell.center);

        expect(dialogEffect).toBeDefined();
        // Dialog key should be one of the array elements
        const expectedDialogKeys = entropyWindProfile.ui.assets.dialog?.alert as string[];
        expect(expectedDialogKeys).toContain(dialogEffect?.sfx?.key);
        expect(dialogEffect?.sfx?.channel).toBe('dialog');
        expect(dialogEffect?.position).toEqual(mockMapCell.center);
    });
});
