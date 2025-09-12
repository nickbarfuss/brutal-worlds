import { describe, it, expect, vi } from 'vitest';
import { triggerNewEffect } from './effectManager';
import { EffectProfile, TriggerContext, MapCell, Enclave, Expanse, Rift, Domain } from '@/types/game';
import * as THREE from 'three';

// Mock data for EffectProfile
const mockEffectProfile: EffectProfile = {
    key: 'test-effect',
    name: 'Test Effect',
    description: 'A test effect',
    type: 'disaster',
    logic: {
        siteCount: 1,
        originCellType: 'Area',
        alert: {
            duration: 1,
            radius: 0,
            movement: 0,
        },
        impact: {
            duration: 1,
            rules: [],
        },
        aftermath: {
            duration: 1,
            rules: [],
        },
    },
    ui: {
        assets: {
            sfxAlert: 'sfx-alert',
            vfxAlert: 'vfx-alert',
        },
    },
};

// Mock data for TriggerContext
const mockMapCell: MapCell = {
    id: 0,
    center: new THREE.Vector3(0, 0, 0),
    enclaveId: null,
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

const mockEnclave: Enclave = {
    id: 0,
    name: 'Test Enclave',
    center: new THREE.Vector3(0, 0, 0),
    cells: [],
    ownerId: null,
    size: 0,
    type: 'enclave',
};

const mockExpanse: Expanse = {
    id: 0,
    name: 'Test Expanse',
    cells: [],
    ownerId: null,
    size: 0,
    type: 'expanse',
};

const mockRift: Rift = {
    id: 0,
    name: 'Test Rift',
    cells: [],
    ownerId: null,
    size: 0,
    type: 'rift',
};

const mockDomain: Domain = {
    id: 0,
    name: 'Test Domain',
    cells: [],
    ownerId: null,
    size: 0,
    type: 'domain',
};

const mockTriggerContext: TriggerContext = {
    enclaveData: { 0: mockEnclave },
    domainData: { 0: mockDomain },
    mapData: [mockMapCell],
    expanseData: { 0: mockExpanse },
    riftData: { 0: mockRift },
};

describe('triggerNewEffect', () => {
    it('should return newMarkers, snackbarData, and effectsToPlay', () => {
        const result = triggerNewEffect(mockEffectProfile, mockTriggerContext);
        expect(result).toHaveProperty('newMarkers');
        expect(result).toHaveProperty('snackbarData');
        expect(result).toHaveProperty('effectsToPlay');
    });

    it('should return null if no candidate cells are found', () => {
        const emptyMapContext = { ...mockTriggerContext, mapData: [] };
        const result = triggerNewEffect(mockEffectProfile, emptyMapContext);
        expect(result).toBeNull();
    });

    it('should return null if chosenCells length is 0', () => {
        const noAreaMapCell: MapCell = { ...mockMapCell, type: 'void' };
        const noAreaMapContext = { ...mockTriggerContext, mapData: [noAreaMapCell] };
        const result = triggerNewEffect({ ...mockEffectProfile, logic: { ...mockEffectProfile.logic, originCellType: 'Area' } }, noAreaMapContext);
        expect(result).toBeNull();
    });
});
