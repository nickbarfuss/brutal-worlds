import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

import { VfxManager } from '@/logic/effects/VfxManager';
import { drawUICanvas } from '@/canvas/drawingUtils';
import { Enclave, ActiveHighlight, GameState, MapCell, Route, PendingOrders, ActiveEventMarker, WorldProfile, Vector3, Domain, Rift, Expanse, IntroPhase, GamePhase } from '@/types/game';
import { mainNebulaVertexShader, mainNebulaFragmentShader, wispyNebulaVertexShader, wispyNebulaFragmentShader, atmosphereVertexShader, atmosphereFragmentShader, sunVertexShader, sunFragmentShader } from '@/canvas/shaderUtils';
import { createStarfield } from '@/canvas/starfieldUtils';
// FIX: Import the SfxManager type to resolve the 'Cannot find name' error.
import { SfxManager } from '@/logic/effects/SfxManager';

declare const gsap: any;

const BLOOM_LAYER = 1;

interface ColorPalette {
    'player-1': { base: THREE.Color, hover: THREE.Color, selected: THREE.Color };
    'player-2': { base: THREE.Color, hover: THREE.Color, selected: THREE.Color };
    neutral: { base: THREE.Color, hover: THREE.Color, selected: THREE.Color };
}

interface MapRendererProps {
    mountRef: React.RefObject<HTMLDivElement>;
    controlsRef: React.RefObject<OrbitControls | null>;
    sceneElementsRef: React.RefObject<{
        hemisphereLight?: THREE.HemisphereLight;
        bloomPass?: UnrealBloomPass;
        landMaterial?: THREE.MeshStandardMaterial;
        voidMaterial?: THREE.MeshStandardMaterial;
        sunMaterial?: THREE.ShaderMaterial;
    } | null>;
    cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
    mapContainerRef: React.MutableRefObject<THREE.Object3D | null>;
    opacityControllerRef: React.MutableRefObject<{ world: number } | null>;
    vfxManager: VfxManager;
    sfxManager: SfxManager;
    materials: {
        landMaterial: THREE.MeshStandardMaterial;
        voidMaterial: THREE.MeshStandardMaterial;
    };
    cellMesh: THREE.Mesh | null;
    faceToCellId: number[];
    cellIdToVertices: Map<number, { start: number, count: number }>;
    enclaveIdToCellIds: Map<number, number[]>;
    worldSeed: number;
    gameSessionId: number;
    commandBorderMeshes: Line2[];
    commandBorderMaterials: LineMaterial[];
    commandFillMesh: THREE.Mesh | null;
    commandFillOpacity: number;
    commandBorderOpacity: number;
    highlightBorderMeshes: Line2[];
    highlightBorderMaterials: LineMaterial[];
    highlightFillMesh: THREE.Mesh | null;
    highlightFillOpacity: number;
    highlightBorderOpacity: number;
    colorPalette: ColorPalette;
    activeHighlight: ActiveHighlight | null;
    permanentBorderMeshes: Line2[];
    permanentBorderMaterials: LineMaterial[];
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

const handleHighlightMeshes = (
    mapContainer: THREE.Object3D,
    currentMeshes: any,
    dynamicProps: any,
    isUiVisible: boolean
) => {
    const {
        commandFillMesh: newCommandFill, commandBorderMeshes: newCommandBorders,
        highlightFillMesh: newHighlightFill, highlightBorderMeshes: newHighlightBorders,
        permanentBorderMeshes: newPermanentBorders,
    } = dynamicProps;

    if (newPermanentBorders !== currentMeshes.permanent) {
        if (currentMeshes.permanent) currentMeshes.permanent.forEach((m: THREE.Object3D) => mapContainer.remove(m));
        currentMeshes.permanent = newPermanentBorders;
        if (currentMeshes.permanent) currentMeshes.permanent.forEach((m: THREE.Object3D) => mapContainer.add(m));
    }
    if (currentMeshes.permanent) {
        currentMeshes.permanent.forEach((m: THREE.Object3D) => (m.visible = isUiVisible));
    }

    if (newCommandFill !== currentMeshes.commandFill) {
        if (currentMeshes.commandFill) mapContainer.remove(currentMeshes.commandFill);
        currentMeshes.commandFill = newCommandFill;
        if (currentMeshes.commandFill) mapContainer.add(currentMeshes.commandFill);
    }
    if (newCommandBorders !== currentMeshes.commandBorders) {
        if (currentMeshes.commandBorders) currentMeshes.commandBorders.forEach((m: THREE.Object3D) => mapContainer.remove(m));
        currentMeshes.commandBorders = newCommandBorders;
        if (currentMeshes.commandBorders) currentMeshes.commandBorders.forEach((m: THREE.Object3D) => mapContainer.add(m));
    }

    if (newHighlightFill !== currentMeshes.highlightFill) {
        if (currentMeshes.highlightFill) mapContainer.remove(currentMeshes.highlightFill);
        currentMeshes.highlightFill = newHighlightFill;
        if (currentMeshes.highlightFill) mapContainer.add(currentMeshes.highlightFill);
    }
    if (newHighlightBorders !== currentMeshes.highlightBorders) {
        if (currentMeshes.highlightBorders) currentMeshes.highlightBorders.forEach((m: THREE.Object3D) => mapContainer.remove(m));
        currentMeshes.highlightBorders = newHighlightBorders;
        if (currentMeshes.highlightBorders) currentMeshes.highlightBorders.forEach((m: THREE.Object3D) => mapContainer.add(m));
    }

};

export const useWorldRenderer = (props: MapRendererProps) => {
    const { mountRef, controlsRef, sceneElementsRef, cameraRef, mapContainerRef, opacityControllerRef } = props;

    const stateRef = useRef({
        props,
        pointerInteraction: { lastClickTime: 0, isPointerDown: false, pointerDownTime: 0, pointerDownPosition: new THREE.Vector2(), isDragging: false, },
        objectColorTransitions: new Map<number, any>(),
        lastTargetColors: new Map<number, THREE.Color>(),
        lastHoveredEnclaveId: null as number | null,
        lastSelectedEnclaveId: null as number | null,
        currentMeshes: {} as any,
        focusAnimationState: null as { inProgress: boolean } | null,
        uiFadeInStartTime: null as number | null,
    });
    
    stateRef.current.props = props;

    const opacityController = useMemo(() => ({ world: 0 }), []);
    useEffect(() => {
        opacityControllerRef.current = opacityController;
    }, [opacityController, opacityControllerRef]);

    useEffect(() => {
        const state = stateRef.current;
        
        const currentMount = mountRef.current; // Capture the current value here
        if (!currentMount || !props.currentWorld) return;

        state.objectColorTransitions.clear();
        state.lastTargetColors.clear();
        
        const { SPHERE_RADIUS } = props.currentWorld.config;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
        cameraRef.current = camera;
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0); // Transparent background for world
        mountRef.current.innerHTML = ''; // Clear any existing children
        mountRef.current.appendChild(renderer.domElement);
        
        const renderScene = new RenderPass(scene, camera);
        
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.35, 0.8, 0.1);
        
        const bloomComposer = new EffectComposer(renderer);
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);

        const finalPass = new ShaderPass(
          new THREE.ShaderMaterial({
            uniforms: {
              baseTexture: { value: null },
              bloomTexture: { value: bloomComposer.renderTarget2.texture }
            },
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
            fragmentShader: `
                uniform sampler2D baseTexture;
                uniform sampler2D bloomTexture;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
                }`
          }), 'baseTexture'
        );
        finalPass.needsSwap = true;

        const finalComposer = new EffectComposer(renderer);
        finalComposer.addPass(renderScene);
        finalComposer.addPass(finalPass);

        const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
        const materials: { [key: string]: THREE.Material | THREE.Material[] } = {};

        const bloomLayer = new THREE.Layers();
        bloomLayer.set(BLOOM_LAYER);

        const darkenNonBloomed = (obj: THREE.Object3D) => {
            if ((obj instanceof THREE.Mesh || obj instanceof THREE.Points) && !bloomLayer.test(obj.layers)) {
                materials[obj.uuid] = obj.material;
                obj.material = darkMaterial;
            }
        };
        
        const restoreMaterial = (obj: THREE.Object3D) => {
            if (materials[obj.uuid] && (obj instanceof THREE.Mesh || obj instanceof THREE.Points)) {
                obj.material = materials[obj.uuid] as THREE.Material;
                delete materials[obj.uuid];
            }
        };

        const uiCanvas = document.createElement('canvas');
        uiCanvas.style.cssText = 'position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; z-index: 10;';
        mountRef.current.appendChild(uiCanvas);
        const dpr = window.devicePixelRatio || 1;
        uiCanvas.width = window.innerWidth * dpr;
        uiCanvas.height = window.innerHeight * dpr;
        const uiContext = uiCanvas.getContext('2d');
        if (uiContext) uiContext.scale(dpr, dpr);
        
        const worldGroup = new THREE.Group();
        scene.add(worldGroup);

        const mapContainer = new THREE.Object3D();
        mapContainerRef.current = mapContainer;
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 20;
        controls.maxDistance = 50;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true; // Re-enable gentle auto-rotation
        controls.autoRotateSpeed = 0.25;
        controls.enabled = false; // Controls are enabled in the animate loop after the intro
        controlsRef.current = controls;
        
        if (props.initialCameraTarget) {
            const target = props.initialCameraTarget.clone().normalize();
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), target);
            const randomRoll = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(Math.random() * 45));
            mapContainer.quaternion.copy(quaternion.multiply(randomRoll));
        }

        camera.position.set(0, 0, 34);
        camera.lookAt(new THREE.Vector3(0,0,0));

        const hemisphereLight = new THREE.HemisphereLight(
            new THREE.Color(0x607080),
            new THREE.Color(props.currentWorld.atmosphereColor),
            props.ambientLightIntensity
        );
        
        const sunPosition = new THREE.Vector3(SPHERE_RADIUS * 20, SPHERE_RADIUS * 50, SPHERE_RADIUS * 100);
        const pointLight = new THREE.PointLight(new THREE.Color(props.currentWorld.sunColor), 5000, 0, 1.0);
        pointLight.position.copy(sunPosition);
        
        const sunScale = props.currentWorld.sunScale || 1.0;
        const sunGeom = new THREE.PlaneGeometry(SPHERE_RADIUS * 1.0, SPHERE_RADIUS * 1.0);
        const sunMat = new THREE.ShaderMaterial({
            uniforms: {
                sunColor: { value: new THREE.Color(props.currentWorld.sunColor) },
                u_time: { value: 0.0 },
                tonemapping: { value: 0.15 },
                uOpacity: { value: 0.0 },
            },
            vertexShader: sunVertexShader, fragmentShader: sunFragmentShader,
            blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
        });
        const sun = new THREE.Mesh(sunGeom, sunMat);
        sun.position.copy(sunPosition);
        sun.scale.set(sunScale, sunScale, 1.0);
        sun.layers.enable(BLOOM_LAYER);

        const atmosphereColor = new THREE.Color(props.currentWorld.atmosphereColor || '#ffffff');
        const innerGlow = new THREE.Mesh(
            new THREE.SphereGeometry(SPHERE_RADIUS * 1.005, 64, 64),
            new THREE.ShaderMaterial({
                uniforms: { glowColor: { value: atmosphereColor }, intensityMultiplier: { value: 1.5 }, falloffPower: { value: 1.0 }, uOpacity: { value: 0.0 } },
                vertexShader: atmosphereVertexShader, fragmentShader: atmosphereFragmentShader,
                blending: THREE.AdditiveBlending, side: THREE.FrontSide, transparent: true, depthWrite: false,
            })
        );
        innerGlow.name = 'atmosphere-inner';
        innerGlow.renderOrder = 0;
        innerGlow.layers.enable(BLOOM_LAYER);
        mapContainer.add(innerGlow);
        const outerGlow = new THREE.Mesh(
            new THREE.SphereGeometry(SPHERE_RADIUS * 1.015, 64, 64),
            new THREE.ShaderMaterial({
                uniforms: { glowColor: { value: atmosphereColor }, intensityMultiplier: { value: 2.0 }, falloffPower: { value: 1.8 }, uOpacity: { value: 0.0 } },
                vertexShader: atmosphereVertexShader, fragmentShader: atmosphereFragmentShader,
                blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true, depthWrite: false,
            })
        );
        outerGlow.name = 'atmosphere-outer';
        outerGlow.renderOrder = 0;
        outerGlow.layers.enable(BLOOM_LAYER);
        mapContainer.add(outerGlow);

        const starfield1 = createStarfield(20000, SPHERE_RADIUS * 40, 3.0);
        const starfield2 = createStarfield(20000, SPHERE_RADIUS * 80, 2.4);

        const nebulaGroup = new THREE.Group();
        const worldNebulaConfig = props.currentWorld.nebula;
        const mainNebulaMaterial = new THREE.ShaderMaterial({ uniforms: { color: { value: new THREE.Color(worldNebulaConfig.main.color) }, density: { value: worldNebulaConfig.main.density * 6.0 }, opacity: { value: 0.0 } }, vertexShader: mainNebulaVertexShader, fragmentShader: mainNebulaFragmentShader, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, });
        const wispyNebulaMaterial = new THREE.ShaderMaterial({ uniforms: { color: { value: new THREE.Color(worldNebulaConfig.wispy.color) }, density: { value: worldNebulaConfig.wispy.density * 6.0 }, falloff: { value: worldNebulaConfig.wispy.falloff }, opacity: { value: 0.0 } }, vertexShader: wispyNebulaVertexShader, fragmentShader: wispyNebulaFragmentShader, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, });
        for (let i = 0; i < 12; i++) {
            const mat = (Math.random() > 0.4 ? mainNebulaMaterial : wispyNebulaMaterial).clone();
            const baseOpacity = 0.4 + Math.random() * 0.6;
            mat.userData.baseOpacity = baseOpacity;
            const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
            plane.userData.baseOpacity = baseOpacity;
            plane.position.copy(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize().multiplyScalar(SPHERE_RADIUS * 180 * (1 + (Math.random() - 0.5) * 0.2)));
            const scale = (Math.random() * 10.0 + 5.0) * (SPHERE_RADIUS * 180) * 0.5;
            plane.scale.set(scale, scale, scale);
            plane.rotation.z = Math.random() * Math.PI * 2;
            nebulaGroup.add(plane);
        }
        
        const mapAndWorldGroup = new THREE.Group();
        mapAndWorldGroup.add(mapContainer, hemisphereLight, pointLight, sun, nebulaGroup, starfield1, starfield2);
        worldGroup.add(mapAndWorldGroup);
        
        if (sceneElementsRef && sceneElementsRef.current) {
            sceneElementsRef.current.hemisphereLight = hemisphereLight;
            sceneElementsRef.current.bloomPass = bloomPass;
            sceneElementsRef.current.sunMaterial = sunMat;
        }

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const clock = new THREE.Clock();
        
        const getCellIdFromEvent = (p: THREE.Vector2): number | null => {
            const { cellMesh, faceToCellId } = stateRef.current.props;
            if (!cellMesh) return null;
            raycaster.setFromCamera(p, camera);
            const intersects = raycaster.intersectObject(cellMesh);
            return (intersects.length > 0 && intersects[0].faceIndex !== undefined) ? faceToCellId[intersects[0].faceIndex] : null;
        };
        const onPointerDown = (event: PointerEvent) => {
            state.pointerInteraction.isPointerDown = true;
            state.pointerInteraction.isDragging = false;
            state.pointerInteraction.pointerDownTime = performance.now();
            state.pointerInteraction.pointerDownPosition.set(event.clientX, event.clientY);
        };
        const onPointerUp = (event: PointerEvent) => {
            const { handleMapClick, handleEnclaveDblClick, mapData, isIntroComplete } = stateRef.current.props;
            if (!state.pointerInteraction.isPointerDown || !isIntroComplete) return;

            state.pointerInteraction.isPointerDown = false;
            const pressDuration = performance.now() - state.pointerInteraction.pointerDownTime;
            if (!state.pointerInteraction.isDragging && pressDuration < 300) {
                const now = performance.now();
                const cellId = getCellIdFromEvent(pointer);
                if (now - state.pointerInteraction.lastClickTime < 300) {
                    if (cellId !== null) {
                        const enclaveId = mapData[cellId]?.enclaveId;
                        if (enclaveId !== null && enclaveId !== undefined) {
                            handleEnclaveDblClick(enclaveId);
                        }
                    }
                    state.pointerInteraction.lastClickTime = 0;
                } else {
                    handleMapClick(cellId, event.ctrlKey);
                    state.pointerInteraction.lastClickTime = now;
                }
            }
             // FIX: Reset dragging state on pointer up regardless of click action.
             // This was the source of the hover bug.
            state.pointerInteraction.isDragging = false;
        };
        const onPointerMove = (event: PointerEvent) => {
            if (mountRef.current) {
                const rect = mountRef.current.getBoundingClientRect();
                pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            }
            if (state.pointerInteraction.isPointerDown && !state.pointerInteraction.isDragging) {
                if (new THREE.Vector2(event.clientX, event.clientY).distanceTo(state.pointerInteraction.pointerDownPosition) > 5) {
                    state.pointerInteraction.isDragging = true;
                }
            }
        };
        const container = mountRef.current;
        container.addEventListener('pointerdown', onPointerDown);
        container.addEventListener('pointermove', onPointerMove);
        container.addEventListener('pointerup', onPointerUp);
        container.addEventListener('pointerleave', onPointerUp as (e: Event) => void);
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            bloomComposer.setSize(window.innerWidth, window.innerHeight);
            finalComposer.setSize(window.innerWidth, window.innerHeight);
            
            uiCanvas.width = window.innerWidth * dpr;
            uiCanvas.height = window.innerHeight * dpr;
            uiContext?.scale(dpr, dpr);
            
            const { commandBorderMaterials, highlightBorderMaterials, permanentBorderMaterials } = stateRef.current.props;
            const allLineMaterials: LineMaterial[] = [
                ...(commandBorderMaterials || []),
                ...(highlightBorderMaterials || []),
                ...(permanentBorderMaterials || []),
            ].filter(m => m);
            allLineMaterials.forEach(mat => {
                if (mat) mat.resolution.set(window.innerWidth, window.innerHeight);
            });
        };
        window.addEventListener('resize', handleResize);

        const getTargetColorForEnclave = (enclave: Enclave, props: MapRendererProps, localHoveredEnclaveId: number | null): THREE.Color => {
            const { colorPalette, selectedEnclaveId } = props;
            const palette = enclave.owner === 'player-1' ? colorPalette['player-1']
                          : enclave.owner === 'player-2' ? colorPalette['player-2']
                          : colorPalette.neutral;
            if (enclave.id === selectedEnclaveId) return palette.selected;
            if (enclave.id === localHoveredEnclaveId) return palette.hover;
            return palette.base;
        };

        const updateVertexColors = (time: number) => {
            const { cellMesh, enclaveIdToCellIds, cellIdToVertices, enclaveData, mapData, hoveredCellId, selectedEnclaveId } = state.props;
            if (!cellMesh?.geometry) return;
        
            const colors = cellMesh.geometry.attributes.color as THREE.BufferAttribute;
            if (!colors) return;
        
            const { objectColorTransitions, lastTargetColors } = state;
            let needsUpdate = false;
        
            const localHoveredEnclaveId = mapData[hoveredCellId]?.enclaveId ?? null;
        
            const enclavesToUpdate = new Set<number>();
            if (localHoveredEnclaveId !== state.lastHoveredEnclaveId) {
                if (localHoveredEnclaveId !== null) enclavesToUpdate.add(localHoveredEnclaveId);
                if (state.lastHoveredEnclaveId !== null) enclavesToUpdate.add(state.lastHoveredEnclaveId);
            }
            if (selectedEnclaveId !== state.lastSelectedEnclaveId) {
                if (selectedEnclaveId !== null) enclavesToUpdate.add(selectedEnclaveId);
                if (state.lastSelectedEnclaveId !== null) enclavesToUpdate.add(state.lastSelectedEnclaveId);
            }
        
            enclavesToUpdate.forEach(enclaveId => {
                const enclave = enclaveData[enclaveId];
                if (!enclave) return;
        
                const targetColor = getTargetColorForEnclave(enclave, state.props, localHoveredEnclaveId);
                const lastTargetColor = lastTargetColors.get(enclaveId);
        
                if (!lastTargetColor || !lastTargetColor.equals(targetColor)) {
                    const currentTransition = objectColorTransitions.get(enclaveId);
                    const fromColor = currentTransition ? 
                        new THREE.Color().lerpColors(currentTransition.from, currentTransition.to, (t => 1 - Math.pow(1 - t, 3))(Math.min((time - currentTransition.startTime) / currentTransition.duration, 1.0)))
                        : (lastTargetColor || targetColor.clone()); 
                    
                    let duration = 200;
                    const wasHovered = enclaveId === state.lastHoveredEnclaveId;
                    const isHovered = enclaveId === localHoveredEnclaveId;
                    
                    if (!wasHovered && isHovered) duration = 150; 
                    else if (wasHovered && !isHovered) duration = 400;
        
                    objectColorTransitions.set(enclaveId, {
                        from: fromColor.clone(), to: targetColor.clone(), startTime: time,
                        duration: duration, easing: (t: number) => 1 - Math.pow(1 - t, 3),
                    });
                    lastTargetColors.set(enclaveId, targetColor.clone());
                }
            });
        
            state.lastHoveredEnclaveId = localHoveredEnclaveId;
            state.lastSelectedEnclaveId = selectedEnclaveId;
        
            if (objectColorTransitions.size > 0) {
                needsUpdate = true;
                const transitionsToDelete: number[] = [];
        
                objectColorTransitions.forEach((transition, enclaveId) => {
                    const progress = Math.min((time - transition.startTime) / transition.duration, 1.0);
                    const easedProgress = transition.easing(progress);
                    const currentColor = new THREE.Color().lerpColors(transition.from, transition.to, easedProgress);
        
                    const cellIds = enclaveIdToCellIds.get(enclaveId);
                    if (cellIds) {
                        cellIds.forEach(cellId => {
                            const vertices = cellIdToVertices.get(cellId);
                            if (vertices) {
                                for (let i = 0; i < vertices.count; i++) {
                                    colors.setXYZ(vertices.start + i, currentColor.r, currentColor.g, currentColor.b);
                                }
                            }
                        });
                    }
                    if (progress >= 1.0) transitionsToDelete.push(enclaveId);
                });
        
                transitionsToDelete.forEach(id => objectColorTransitions.delete(id));
            }
            
            if (needsUpdate) colors.needsUpdate = true;
        };
        
        let animationFrameId: number;
        const animate = (time: number) => {
            animationFrameId = requestAnimationFrame(animate);
            const { props: currentProps } = stateRef.current;
            const { vfxManager, sfxManager, materials, activeHighlight, introPhase, isIntroComplete, ...highlightProps } = currentProps;
            const { isBloomEnabled, cameraFocusAnimation, focusOnEnclave } = currentProps;
            
            if (currentProps.cellMesh && currentProps.cellMesh !== state.currentMeshes.cell) {
                if (state.currentMeshes.cell) mapContainer.remove(state.currentMeshes.cell);
                state.currentMeshes.cell = currentProps.cellMesh;
                mapContainer.add(state.currentMeshes.cell);
            }
            
            handleHighlightMeshes(mapContainer, state.currentMeshes, highlightProps, isIntroComplete);

            const clockTime = clock.getElapsedTime();
            if (sunMat) sunMat.uniforms.u_time.value = clockTime;
            sun.lookAt(camera.position);
            nebulaGroup.children.forEach((plane, _i) => plane.lookAt(camera.position));

            if (!state.pointerInteraction.isDragging && isIntroComplete) {
                const cellId = getCellIdFromEvent(pointer);
                const currentHoverId = stateRef.current.props.hoveredCellId;
                if (cellId !== null && cellId !== currentHoverId) {
                    stateRef.current.props.setHoveredCellId(cellId);
                } else if (cellId === null && currentHoverId !== -1) {
                    stateRef.current.props.setHoveredCellId(-1);
                }
            }
            
            updateVertexColors(time);

            const worldOpacity = opacityController.world;
            if (materials.landMaterial) materials.landMaterial.opacity = worldOpacity;
            if (materials.voidMaterial) materials.voidMaterial.opacity = worldOpacity;
            if (sunMat) sunMat.uniforms.uOpacity.value = worldOpacity;
            if (innerGlow.material) (innerGlow.material as THREE.ShaderMaterial).uniforms.uOpacity.value = worldOpacity;
            if (outerGlow.material) (outerGlow.material as THREE.ShaderMaterial).uniforms.uOpacity.value = worldOpacity;
            if ((starfield1 as THREE.Points).material) ((starfield1 as THREE.Points).material as THREE.ShaderMaterial).uniforms.globalOpacity.value = worldOpacity;
            if ((starfield2 as THREE.Points).material) ((starfield2 as THREE.Points).material as THREE.ShaderMaterial).uniforms.globalOpacity.value = worldOpacity;
            nebulaGroup.children.forEach(plane => {
                if (plane instanceof THREE.Mesh && plane.material instanceof THREE.ShaderMaterial) {
                    if (plane.material.uniforms.opacity) {
                        plane.material.uniforms.opacity.value = worldOpacity * (plane.userData.baseOpacity || 1.0);
                    }
                }
            });

            mapAndWorldGroup.visible = introPhase !== 'pending' && introPhase !== 'entry';
            
            const canControlOrRotate = ['arrival', 'letterbox-out', 'title-out', 'ui-in', 'complete'].includes(introPhase);
            controls.enabled = canControlOrRotate;

            const wasAutoRotating = controls.autoRotate;
            if (cameraFocusAnimation && cameraFocusAnimation.active) {
                controls.autoRotate = false;
                if (!state.focusAnimationState) {
                    state.focusAnimationState = { inProgress: true };
                    controls.enabled = false;
            
                    const startVec = camera.position.clone();
                    const currentDistance = camera.position.length();
                    
                    // Apply the map container's rotation to the local target vector to get the world-space target.
                    const worldTarget = cameraFocusAnimation.target.clone().applyMatrix4(mapContainer.matrixWorld);
                    const endVec = worldTarget.normalize().multiplyScalar(currentDistance);
                    
                    const proxy = { t: 0 };
                    gsap.killTweensOf(proxy);
                    gsap.to(proxy, {
                        t: 1,
                        duration: 1,
                        ease: 'power2.out',
                        onUpdate: () => {
                            camera.position.copy(startVec).lerp(endVec, proxy.t).setLength(currentDistance);
                            camera.lookAt(0, 0, 0);
                        },
                        onComplete: () => {
                            state.focusAnimationState = null;
                            focusOnEnclave(-1);
                            controls.enabled = true;
                        }
                    });
                }
            } else if (wasAutoRotating === false && isIntroComplete) {
                controls.autoRotate = true;
            }
            
            if (controls.enabled) {
                controls.update();
            } else if (state.focusAnimationState) {
                camera.lookAt(0, 0, 0);
            }
            
            mapContainer.updateMatrixWorld(true);

            // FIX: Moved the spatial audio update to *after* all camera and world
            // matrix updates have been completed for the current frame.
            if (sfxManager && camera) {
                sfxManager.updateListener(camera, mapContainer);
            }

            renderer.setRenderTarget(null);
            renderer.clear();
            if (isBloomEnabled) {
                scene.traverse(darkenNonBloomed);
                bloomComposer.render();
                scene.traverse(restoreMaterial);
                finalComposer.render();
            } else {
                renderer.render(scene, camera);
            }

            if (uiContext) {
                if (introPhase === 'ui-in' && state.uiFadeInStartTime === null) {
                    state.uiFadeInStartTime = time;
                } else if (introPhase !== 'ui-in' && introPhase !== 'complete') {
                    state.uiFadeInStartTime = null; 
                }
                
                let uiAlpha = 0.0;
                if (introPhase === 'complete') {
                    uiAlpha = 1.0;
                } else if (state.uiFadeInStartTime !== null) {
                    const fadeInDuration = 1000;
                    const progress = Math.min((time - state.uiFadeInStartTime) / fadeInDuration, 1.0);
                    uiAlpha = (t => 1 - Math.pow(1 - t, 3))(progress);
                }
                
                
                drawUICanvas(uiContext, clockTime, currentProps as unknown as GameState, vfxManager, camera, mapContainer, activeHighlight, uiAlpha);
            }
        };

        animate(performance.now());

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('pointerdown', onPointerDown);
            container.removeEventListener('pointermove', onPointerMove);
            container.removeEventListener('pointerup', onPointerUp);
            container.removeEventListener('pointerleave', onPointerUp as (e: Event) => void);
            if (currentMount) currentMount.removeChild(renderer.domElement);
            if (uiCanvas.parentElement) uiCanvas.parentElement.removeChild(uiCanvas);
        };
    }, [props.gameSessionId, props.currentWorld, cameraRef, controlsRef, mapContainerRef, mountRef, props.ambientLightIntensity, props.initialCameraTarget, sceneElementsRef, opacityController]);
};