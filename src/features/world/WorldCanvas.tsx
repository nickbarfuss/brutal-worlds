import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { PLAYER_THREE_COLORS } from '@/data/theme';
import { useCommandZone } from '@/hooks/useCommandZone';
import { useWorldGeometry } from '@/hooks/useWorldGeometry';
import { useWorldRenderer } from '@/hooks/useWorldRenderer';
import { SfxManager, VfxManager } from '@/logic/effects';
import { Action } from '@/logic';
import {
  ActiveEventMarker,
  ActiveHighlight,
  Domain,
  Enclave,
  Expanse,
  GamePhase,
  GameState,
  IntroPhase,
  MapCell,
  PendingOrders,
  Rift,
  Route,
  SemanticColorPalette,
  Vector3,
  WorldProfile,
} from '@/types/game';
import { turnBasedEffectsProcessor } from '@/logic/effects/turnBasedEffects';

export interface WorldCanvasHandle {
  setAmbientLightIntensity: (value: number) => void;
  setBloomValue: (key: 'threshold' | 'strength' | 'radius', value: number) => void;
  setMaterialValue: (
    type: 'player' | 'neutral' | 'void',
    key: 'metalness' | 'roughness' | 'emissiveIntensity',
    value: number,
  ) => void;
  setTonemappingStrength: (value: number) => void;
  setControlsEnabled: (enabled: boolean) => void;
  setFov: (value: number) => void;
  setDistance: (value: number) => void;
  camera: THREE.PerspectiveCamera | null;
  mapContainer: THREE.Object3D | null;
  opacityController: { world: number } | null;
}

interface WorldCanvasProps {
  dispatch: React.Dispatch<Action>;
  sfxManager: SfxManager;
  turnBasedEffectsProcessor: typeof turnBasedEffectsProcessor;
  vfxManager: VfxManager;
  convertLatLonToVector3: (lat: number, lon: number) => THREE.Vector3;
  highlightBorderMeshes: Line2[];
  highlightBorderMaterials: LineMaterial[];
  activeHighlight: ActiveHighlight | null;
  highlightBorderOpacity: number;
  permanentBorderMeshes: Line2[];
  permanentBorderMaterials: LineMaterial[];
  gameSessionId: number;
  mapData: MapCell[];
  domainData: { [id: number]: Domain };
  riftData: { [id: number]: Rift };
  expanseData: { [id: number]: Expanse };
  enclaveData: { [id: number]: Enclave };
  routes: Route[];
  pendingOrders: PendingOrders;
  selectedEnclaveId: number | null;
  hoveredCellId: number;
  currentWorld: WorldProfile | null;
  activeEffectMarkers: ActiveEventMarker[];
  cameraFocusAnimation: { active: boolean; target: Vector3 } | null;
  initialCameraTarget: Vector3 | null;
  isBloomEnabled: boolean;
  bloomSettings: GameState['bloomSettings'];
  materialSettings: GameState['materialSettings'];
  ambientLightIntensity: number;
  tonemappingStrength: number;
  handleMapClick: (cellId: number | null, isCtrlPressed: boolean) => void;
  handleEnclaveDblClick: (enclaveId: number | null) => void;
  setHoveredCellId: (id: number) => void;
  focusOnEnclave: (id: number) => void;
  gamePhase: GamePhase;
  isIntroComplete: boolean;
  introPhase: IntroPhase;
}

const WorldCanvas = React.memo(
  forwardRef<WorldCanvasHandle, WorldCanvasProps>((props, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const { convertLatLonToVector3 } = props;

    const controlsRef = useRef<OrbitControls | null>(null);
    const sceneElementsRef = useRef<{
        hemisphereLight?: THREE.HemisphereLight;
        bloomPass?: UnrealBloomPass;
        landMaterial?: THREE.MeshStandardMaterial;
        voidMaterial?: THREE.MeshStandardMaterial;
        sunMaterial?: THREE.ShaderMaterial;
    }>({});
    
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const mapContainerRef = useRef<THREE.Object3D | null>(null);
    const opacityControllerRef = useRef<{ world: number } | null>(null);


    useImperativeHandle(ref, () => ({
        setAmbientLightIntensity: (value) => {
            if (sceneElementsRef.current?.hemisphereLight) {
                sceneElementsRef.current.hemisphereLight.intensity = value;
            }
        },
        setBloomValue: (key, value) => {
            if (sceneElementsRef.current?.bloomPass) {
                sceneElementsRef.current.bloomPass[key] = value;
            }
        },
        setMaterialValue: (type, key, value) => {
            const landMatUniforms = (sceneElementsRef.current?.landMaterial as any)?.uniforms;
            if (type === 'player' && landMatUniforms) {
                if (key === 'metalness') landMatUniforms.uPlayer1Metalness.value = landMatUniforms.uPlayer2Metalness.value = value;
                if (key === 'roughness') landMatUniforms.uPlayer1Roughness.value = landMatUniforms.uPlayer2Roughness.value = value;
                if (key === 'emissiveIntensity') landMatUniforms.uPlayer1EmissiveIntensity.value = landMatUniforms.uPlayer2EmissiveIntensity.value = value;
            } else if (type === 'neutral' && landMatUniforms) {
                if (key === 'metalness') landMatUniforms.uNeutralMetalness.value = value;
                if (key === 'roughness') landMatUniforms.uNeutralRoughness.value = value;
                if (key === 'emissiveIntensity') landMatUniforms.uNeutralEmissiveIntensity.value = value;
            } else if (type === 'void' && sceneElementsRef.current?.voidMaterial) {
                const voidMat = sceneElementsRef.current.voidMaterial;
                if (key === 'metalness') voidMat.metalness = value;
                if (key === 'roughness') voidMat.roughness = value;
                if (key === 'emissiveIntensity') voidMat.emissiveIntensity = value;
            }
        },
        setTonemappingStrength: (value) => {
             if (sceneElementsRef.current?.sunMaterial?.uniforms.tonemapping) {
                sceneElementsRef.current.sunMaterial.uniforms.tonemapping.value = value;
            }
        },
        setControlsEnabled: (enabled) => {
            if (controlsRef.current) {
                controlsRef.current.enabled = enabled;
            }
        },
        setFov: (value) => {
            if (cameraRef.current) {
                cameraRef.current.fov = value;
                cameraRef.current.updateProjectionMatrix();
            }
        },
        setDistance: (value) => {
            if (cameraRef.current) {
                cameraRef.current.position.setLength(Math.max(0.1, value));
            }
        },
        get camera() { return cameraRef.current; },
        get mapContainer() { return mapContainerRef.current; },
        get opacityController() { return opacityControllerRef.current; },
    }));


    const landMaterial = useMemo(() => {
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0,
        });

        material.onBeforeCompile = shader => {
            shader.uniforms.uPlayer1Metalness = { value: 0.0 };
            shader.uniforms.uPlayer1Roughness = { value: 1.0 };
            shader.uniforms.uPlayer1EmissiveIntensity = { value: 1.0 };
            shader.uniforms.uPlayer2Metalness = { value: 0.0 };
            shader.uniforms.uPlayer2Roughness = { value: 1.0 };
            shader.uniforms.uPlayer2EmissiveIntensity = { value: 1.0 };
            shader.uniforms.uNeutralMetalness = { value: 0.0 };
            shader.uniforms.uNeutralRoughness = { value: 1.0 };
            shader.uniforms.uNeutralEmissiveIntensity = { value: 0.3 };
            
            (material as any).uniforms = shader.uniforms;
            sceneElementsRef.current.landMaterial = material;

            shader.vertexShader = `
                attribute float aOwnerType;
                varying float vOwnerType;
            ` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                 vOwnerType = aOwnerType;`
            );
            
            shader.fragmentShader = `
                varying float vOwnerType;
                uniform float uPlayer1Metalness;
                uniform float uPlayer1Roughness;
                uniform float uPlayer1EmissiveIntensity;
                uniform float uPlayer2Metalness;
                uniform float uPlayer2Roughness;
                uniform float uPlayer2EmissiveIntensity;
                uniform float uNeutralMetalness;
                uniform float uNeutralRoughness;
                uniform float uNeutralEmissiveIntensity;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <color_fragment>`,
                `#include <color_fragment>
                 diffuseColor.rgb *= vColor;`
            );
            
            shader.fragmentShader = shader.fragmentShader.replace(
                `#include <metalnessmap_fragment>`,
                `#include <metalnessmap_fragment>
                 float ownerMetalness = uNeutralMetalness;
                 float ownerRoughness = uNeutralRoughness;
                 if (vOwnerType > 0.5 && vOwnerType < 1.5) { // Player 1
                     ownerMetalness = uPlayer1Metalness;
                     ownerRoughness = uPlayer1Roughness;
                 } else if (vOwnerType > 1.5 && vOwnerType < 2.5) { // Player 2
                     ownerMetalness = uPlayer2Metalness;
                     ownerRoughness = uPlayer2Roughness;
                 }
                 metalnessFactor = ownerMetalness;
                 roughnessFactor = ownerRoughness;
                `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                'vec3 totalEmissiveRadiance = emissive;',
                `
                 float ownerEmissive = uNeutralEmissiveIntensity;
                 if (vOwnerType > 0.5 && vOwnerType < 1.5) { // Player 1
                     ownerEmissive = uPlayer1EmissiveIntensity;
                 } else if (vOwnerType > 1.5 && vOwnerType < 2.5) { // Player 2
                     ownerEmissive = uPlayer2EmissiveIntensity;
                 }
                 vec3 totalEmissiveRadiance = emissive + vColor * ownerEmissive;
                `
            );
        };
        return material;
    }, []);
    
    const voidMaterial = useMemo(() => {
        const material = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0,
        });
        sceneElementsRef.current.voidMaterial = material;
        return material;
    }, []);

    const materials = useMemo(() => ({ landMaterial, voidMaterial }), [landMaterial, voidMaterial]);
    
    const { colorPalette, baseMaterials } = useMemo(() => {
        const currentWorld = props.currentWorld;
        const p1Palette: SemanticColorPalette = PLAYER_THREE_COLORS['player-1'];
        const p2Palette: SemanticColorPalette = PLAYER_THREE_COLORS['player-2'];
        const neutralPalette: SemanticColorPalette | undefined = currentWorld?.neutralColorPalette;

        const palette = {
            'player-1': {
                base: new THREE.Color(p1Palette.base),
                hover: new THREE.Color(p1Palette.hover),
                selected: new THREE.Color(p1Palette.selected),
            },
            'player-2': {
                base: new THREE.Color(p2Palette.base),
                hover: new THREE.Color(p2Palette.hover),
                selected: new THREE.Color(p2Palette.selected),
            },
            neutral: {
                base: new THREE.Color(neutralPalette?.base || '#262626'),
                hover: new THREE.Color(neutralPalette?.hover || '#373737'),
                selected: new THREE.Color(neutralPalette?.selected || '#525252'),
            },
        };

        const bases = {
            'player-1': palette['player-1'].base,
            'player-2': palette['player-2'].base,
            neutral: palette.neutral.base,
        };

        return { colorPalette: palette, baseMaterials: bases };
    }, [props.currentWorld]);


    const ownershipSignature = useMemo(() => 
        props.mapData.map(cell => `${cell.id}:${cell.owner}`).join(','), 
        [props.mapData]
    );

    const { cellMesh, faceToCellId, cellIdToVertices, enclaveIdToCellIds, worldSeed } = useWorldGeometry({
        mapData: props.mapData,
        ownershipSignature,
        currentWorld: props.currentWorld,
        landMaterial,
        voidMaterial,
        baseMaterials,
        convertLatLonToVector3,
    });

    const { commandBorderMeshes, commandBorderMaterials, commandFillMesh } = useCommandZone({
        selectedEnclaveId: props.selectedEnclaveId,
        enclaveData: props.enclaveData,
        mapData: props.mapData,
        routes: props.routes,
        aiPendingOrders: props.pendingOrders, // Pass aiPendingOrders
        convertLatLonToVector3,
    });

    useWorldRenderer({
        ...props,
        mountRef,
        controlsRef,
        sceneElementsRef,
        cameraRef,
        mapContainerRef,
        opacityControllerRef,
        materials,
        cellMesh,
        faceToCellId,
        cellIdToVertices,
        enclaveIdToCellIds,
        worldSeed,
        commandBorderMeshes,
        commandBorderMaterials,
        commandFillMesh,
        commandFillOpacity: 0.2,
        commandBorderOpacity: 0.8,
        highlightFillMesh: null,
        highlightFillOpacity: 0,
        colorPalette,
        activeEffectMarkers: props.activeEffectMarkers,
    });

    return <div ref={mountRef} data-testid="world-canvas" className="w-full h-full" />;
}));

WorldCanvas.displayName = 'WorldCanvas';
export default WorldCanvas;