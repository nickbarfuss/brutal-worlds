import * as THREE from 'three';
import { ActiveHighlight, GameState } from '@/types/game';
import { VfxManager } from '@/logic/VfxManager';
import { getScreenPosition } from '@/canvas/draw/drawUtils';
import { drawAllEnclaves, drawSelectionPulse } from '@/canvas/draw/drawEnclaves';
import { drawAllRoutes } from '@/canvas/draw/drawRoutes';
import { drawAllDisasterMarkers } from '@/canvas/draw/drawDisasters';
import { drawHighlightLabels } from '@/canvas/draw/drawHighlights';

export const drawUICanvas = (
    ctx: CanvasRenderingContext2D, 
    clockTime: number, 
    gameState: GameState,
    vfxManager: VfxManager,
    camera: THREE.PerspectiveCamera,
    mapContainer: THREE.Object3D,
    activeHighlight: ActiveHighlight | null,
    globalAlpha: number
) => {
    // FIX: The `gameState` object passed here is from renderer props and not a true GameState object.
    // It has a combined `pendingOrders` property. Cast to `any` to access it and prevent a type error.
    const { enclaveData, routes, selectedEnclaveId, mapData, hoveredCellId, currentWorld, activeDisasterMarkers } = gameState;
    const pendingOrders = (gameState as any).pendingOrders;

    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    if (globalAlpha <= 0 || !currentWorld) return;

    ctx.save();
    ctx.globalAlpha = globalAlpha;

    const sphereRadius = currentWorld.config.SPHERE_RADIUS;
    vfxManager.updateAndDraw(ctx, mapContainer, camera, sphereRadius);
    
    const enclaveScreenPositions: { [id: number]: { x: number; y: number; visible: boolean } } = {};
    Object.values(enclaveData).forEach(enclave => {
        enclaveScreenPositions[enclave.id] = getScreenPosition(enclave.center, mapContainer, camera, canvas);
    });

    const disasterMarkerScreenPositions: { [id: number]: { x: number; y: number; visible: boolean } } = {};
    activeDisasterMarkers.forEach((marker, i) => {
        disasterMarkerScreenPositions[i] = getScreenPosition(marker.position, mapContainer, camera, canvas);
    });

    drawAllRoutes(ctx, { routes, enclaveData, pendingOrders, enclaveScreenPositions, selectedEnclaveId, hoveredCellId, mapData, currentWorld, clockTime });

    drawHighlightLabels(ctx, { activeHighlight, gameState, mapContainer, camera, canvas });
    
    drawAllDisasterMarkers(ctx, { activeDisasterMarkers, disasterMarkerScreenPositions, clockTime, enclaveData });
    
    // Draw selection pulse behind the selected enclave marker
    if (selectedEnclaveId !== null) {
        const pos = enclaveScreenPositions[selectedEnclaveId];
        if (pos && pos.visible) {
            drawSelectionPulse(ctx, pos, clockTime);
        }
    }
    
    drawAllEnclaves(ctx, { enclaveData, enclaveScreenPositions, selectedEnclaveId, hoveredCellId, mapData, currentWorld, routes, activeHighlight, clockTime, activeDisasterMarkers });

    ctx.restore();
};