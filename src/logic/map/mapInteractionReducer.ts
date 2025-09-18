import { GameState } from '@/types/game';
import { Action } from '@/logic';
import { handleSingleClick, handleDoubleClick } from '@/logic/orders';
import { VfxManager, SfxManager } from '@/logic/effects';

const setHoveredCell = (state: GameState, payload: number): GameState => {
    const id = payload;
    if (state.hoveredCellId === id) return state;
    
    let newHoveredEntity: { name: string; type: 'enclave' | 'domain' | 'rift' | 'expanse', owner: any } | null = null;
    if (id !== -1 && state.mapData.length > id) {
        const cell = state.mapData[id];
        if (cell) {
            if (cell.enclaveId !== null && state.enclaveData[cell.enclaveId]) {
                const enclave = state.enclaveData[cell.enclaveId];
                newHoveredEntity = { name: enclave.name, type: 'enclave', owner: enclave.owner };
            } else if (cell.domainId !== null && state.domainData[cell.domainId]) {
                newHoveredEntity = { name: state.domainData[cell.domainId].name, type: 'domain', owner: null };
            } else if (cell.voidId !== null) {
                if (cell.voidType === 'rift' && state.riftData[cell.voidId]) {
                    newHoveredEntity = { name: state.riftData[cell.voidId].name, type: 'rift', owner: null };
                } else if (cell.voidType === 'expanse' && state.expanseData[cell.voidId]) {
                    newHoveredEntity = { name: state.expanseData[cell.voidId].name, type: 'expanse', owner: null };
                }
            }
        }
    }
    return { ...state, hoveredCellId: id, hoveredEntity: newHoveredEntity };
};

const clickMap = (state: GameState, payload: { cellId: number | null, isCtrlPressed: boolean }, vfxManager: VfxManager, sfxManager: SfxManager): GameState => {
    const { cellId, isCtrlPressed } = payload;
    
    if (cellId === null || cellId === -1) {
        handleSingleClick(null, state.selectedEnclaveId, state.enclaveData, state.routes, state.playerPendingOrders, false, vfxManager, sfxManager);
        const newInspectedEntity = state.worldInspectorManuallyClosed ? null : { type: 'world' as const };
        return { ...state, selectedEnclaveId: null, inspectedMapEntity: newInspectedEntity };
    }
    
    const cell = state.mapData[cellId];
    if (!cell) return state;

    // --- NEW: Check for a nearby disaster marker first, regardless of cell type ---
    const clickedPos = cell.center;
    if (Array.isArray(state.activeEventMarkers)) {
        for (const marker of state.activeEventMarkers) {
            // Using a slightly larger radius for easier clicking
            if (marker.position.distanceTo(clickedPos) < 3.0) {
                return {
                    ...state,
                    selectedEnclaveId: null,
                    inspectedMapEntity: { type: 'event', id: marker.id },
                };
            }
        }
    }

    // --- If no marker was clicked, proceed with the original logic ---
    if (cell.enclaveId !== null) {
        const result = handleSingleClick(
            cell.enclaveId, state.selectedEnclaveId, state.enclaveData, state.routes, state.playerPendingOrders, isCtrlPressed, vfxManager, sfxManager
        );
        return {
            ...state,
            playerPendingOrders: result.updatedOrders,
            selectedEnclaveId: result.newSelectedEnclaveId,
            inspectedMapEntity: result.newInspectedEnclaveId !== null ? { type: 'enclave', id: result.newInspectedEnclaveId } : state.inspectedMapEntity,
        };
    } else if (cell.domainId !== null && state.domainData[cell.domainId]) {
        handleSingleClick(null, state.selectedEnclaveId, state.enclaveData, state.routes, state.playerPendingOrders, false, vfxManager, sfxManager);
        return {
            ...state,
            selectedEnclaveId: null,
            inspectedMapEntity: { type: 'domain', id: cell.domainId },
        };
    } else if (cell.voidId !== null) {
        // The disaster marker check has been moved up. Now just inspect the void feature.
        if (cell.voidType) {
            handleSingleClick(null, state.selectedEnclaveId, state.enclaveData, state.routes, state.playerPendingOrders, false, vfxManager, sfxManager);
            return {
                ...state,
                selectedEnclaveId: null,
                inspectedMapEntity: { type: cell.voidType, id: cell.voidId },
            };
        }
    }
    
    handleSingleClick(null, state.selectedEnclaveId, state.enclaveData, state.routes, state.playerPendingOrders, false, vfxManager, sfxManager);
    return { ...state, selectedEnclaveId: null, inspectedMapEntity: null };
};

const dblClickMap = (state: GameState, payload: number | null, sfxManager: SfxManager): GameState => {
    const enclaveId = payload;
    if (enclaveId === null) return state;

    const clickedEnclave = state.enclaveData[enclaveId];
    if (!clickedEnclave) return state;

    if (clickedEnclave.owner === 'player-1') {
        const result = handleDoubleClick(enclaveId, state.enclaveData, state.playerPendingOrders, sfxManager);
        return {
            ...state,
            playerPendingOrders: result.updatedOrders,
            selectedEnclaveId: result.newSelectedEnclaveId,
            inspectedMapEntity: { type: 'enclave', id: enclaveId },
        };
    }
    
    return {
        ...state,
        selectedEnclaveId: null,
        inspectedMapEntity: { type: 'enclave', id: enclaveId },
    };
};

const focusOnEnclave = (state: GameState, payload: number): GameState => {
    if (payload === -1) {
        return { ...state, cameraFocusAnimation: null };
    }
    const targetEnclave = state.enclaveData[payload];
    if (!targetEnclave) return state;
    return { ...state, cameraFocusAnimation: { active: true, target: targetEnclave.center.clone() } };
};

export const handleMapInteraction = (state: GameState, action: Action, vfxManager: VfxManager, sfxManager: SfxManager): GameState => {
    switch (action.type) {
        case 'SET_HOVERED_CELL': return setHoveredCell(state, action.payload);
        case 'HANDLE_MAP_CLICK': return clickMap(state, action.payload, vfxManager, sfxManager);
        case 'HANDLE_DBL_CLICK': return dblClickMap(state, action.payload, sfxManager);
        case 'FOCUS_ON_ENCLAVE': return focusOnEnclave(state, action.payload);
        case 'FOCUS_ON_VECTOR':
            return { ...state, cameraFocusAnimation: { active: true, target: action.payload.clone() } };
        case 'SET_INSPECTED_MAP_ENTITY': 
            return { ...state, inspectedMapEntity: action.payload };
        default: return state;
    }
};