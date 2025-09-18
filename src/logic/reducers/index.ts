import { GameState, GamePhase, ActiveHighlight, AudioChannel, MaterialProperties, Order, Vector3, PlayerIdentifier, InspectedMapEntity } from '@/types/game';
import { CONFIG } from '@/data/config';
import { handleInitialization } from '@/logic/reducers/initializationReducer';
import { handleGameFlow } from '@/logic/reducers/gameFlowReducer';
import { handleMapInteraction } from '@/logic/reducers/mapInteractionReducer';
import { handleTurnLogic } from '@/logic/reducers/turnLogicReducer';
import { handleEvents } from '@/logic/reducers/eventReducer';
import { handleFx } from '@/logic/reducers/vfxReducer';
import { handleUi } from '@/logic/reducers/uiReducer'; 
import { VfxManager } from '@/logic/effects';
import { SfxManager } from '@/logic/effects';

export type Action =
    | { type: 'SET_INITIALIZATION_STATE'; payload: { isInitialized: boolean; message: string; error: string | null } }
    | { type: 'SET_GAME_PHASE'; payload: GamePhase }
    // FIX: Changed payload property from 'playerArchetypeSkinIndex' to 'playerLegacyIndex' to match state shape.
    | { type: 'START_GAME'; payload: { playerArchetypeKey: string; worldKey: string; playerLegacyKey: string; opponentArchetypeKey?: string; opponentLegacyKey?: string; } }
    | { type: 'COMPLETE_INTRO' }
    | { type: 'RESET_GAME' }
    | { type: 'TOGGLE_PAUSE' }
    | { type: 'SET_HOVERED_CELL'; payload: number }
    | { type: 'HANDLE_MAP_CLICK'; payload: { cellId: number | null, isCtrlPressed: boolean } }
    | { type: 'HANDLE_DBL_CLICK'; payload: number | null }
    | { type: 'FOCUS_ON_ENCLAVE'; payload: number }
    | { type: 'FOCUS_ON_VECTOR'; payload: Vector3 }
    | { type: 'SET_INSPECTED_ARCHETYPE_OWNER'; payload: PlayerIdentifier | null }
    | { type: 'SET_INSPECTED_MAP_ENTITY'; payload: InspectedMapEntity | { type: 'world' } | null }
    | { type: 'SET_WORLD_INSPECTOR_MANUALLY_CLOSED'; payload: boolean }
    | { type: 'START_RESOLVING_TURN' }
    | { type: 'APPLY_RESOLVED_TURN'; payload: any }
    | { type: 'START_FIRST_TURN' }
    | { type: 'PLAYER_CANCEL_ORDERS'; payload: number[] }
    | { type: 'AI_ISSUE_ORDER'; payload: { fromId: number; order: Order } }
    | { type: 'AI_CANCEL_ORDER'; payload: { fromId: number } }
    | { type: 'AI_CLEAR_ORDERS' }
    | { type: 'TRIGGER_EVENT'; payload: string }
    | { type: 'CLEAR_LATEST_EVENT' }
    | { type: 'REMOVE_EVENTS'; payload: string[] }
    | { type: 'GO_TO_MAIN_MENU' }
    | { type: 'SET_ACTIVE_HIGHLIGHT'; payload: ActiveHighlight | null }
    | { type: 'TOGGLE_SETTINGS_DRAWER' }
    | { type: 'TOGGLE_GLOBAL_MUTE' }
    | { type: 'SET_VOLUME'; payload: { channel: AudioChannel; volume: number } }
    | { type: 'TOGGLE_MUTE_CHANNEL'; payload: AudioChannel }
    | { type: 'SET_BLOOM_ENABLED'; payload: boolean }
    | { type: 'SET_BLOOM_VALUE'; payload: { key: 'threshold' | 'strength' | 'radius'; value: number } }
    | { type: 'SET_MATERIAL_VALUE'; payload: { type: keyof GameState['materialSettings'], key: keyof MaterialProperties, value: number } }
    | { type: 'SET_AMBIENT_LIGHT_INTENSITY'; payload: number }
    | { type: 'SET_TONEMAPPING_STRENGTH'; payload: number };

export const initialState: GameState = {
    mapData: [], enclaveData: {}, domainData: {}, riftData: {}, expanseData: {}, routes: [],
    planetName: '', isInitialized: false, error: null, currentTurn: 0, 
    playerPendingOrders: {}, aiPendingOrders: {},
    latestEvent: null, activeEventMarkers: [],
    loadingMessage: 'Initializing', currentWorld: null, gameConfig: CONFIG, gamePhase: 'loading',
    gameSessionId: 0,
    playerArchetypeKey: null, playerLegacyKey: null, playerLegacyIndex: null, opponentArchetypeKey: null, opponentLegacyKey: null, opponentLegacyIndex: null, 
    playerHasHadFirstConquestDialog: false,
    opponentHasHadFirstConquestDialog: false,
    playerConquestsThisTurn: 0,
    opponentConquestsThisTurn: 0,
    playerGambits: [], opponentGambits: [],
    hoveredCellId: -1, selectedEnclaveId: null, 
    inspectedArchetypeOwner: null, inspectedMapEntity: null,
    worldInspectorManuallyClosed: false,
    isIntroComplete: false, cameraFocusAnimation: null, hoveredEntity: null,
    isPaused: true, initialCameraTarget: null, activeHighlight: null,
    events: [],
    isSettingsOpen: false,
    isResolvingTurn: false,
    gameOverState: 'none',
    isGloballyMuted: false,
    volumes: CONFIG.AUDIO_DEFAULTS.volumes,
    mutedChannels: CONFIG.AUDIO_DEFAULTS.mutedChannels,
    isBloomEnabled: CONFIG.VISUAL_DEFAULTS.enableBloom,
    bloomSettings: CONFIG.VISUAL_DEFAULTS.bloomSettings,
    materialSettings: CONFIG.VISUAL_DEFAULTS.materialSettings,
    ambientLightIntensity: CONFIG.VISUAL_DEFAULTS.ambientLightIntensity,
    tonemappingStrength: CONFIG.VISUAL_DEFAULTS.tonemappingStrength,
};

export const reducer = (state: GameState, action: Action, vfxManager: VfxManager, sfxManager: SfxManager): GameState => {
    switch (action.type) {
        // Initialization
        case 'SET_INITIALIZATION_STATE':
            return handleInitialization(state, action);

        // Game Flow
        case 'SET_GAME_PHASE':
        case 'TOGGLE_PAUSE':
        case 'GO_TO_MAIN_MENU':
        case 'START_GAME':
        case 'RESET_GAME':
        case 'COMPLETE_INTRO':
            return handleGameFlow(state, action, initialState);

        // Map Interaction
        case 'SET_HOVERED_CELL':
        case 'HANDLE_MAP_CLICK':
        case 'HANDLE_DBL_CLICK':
        case 'FOCUS_ON_ENCLAVE':
        case 'FOCUS_ON_VECTOR':
        case 'SET_INSPECTED_ARCHETYPE_OWNER':
        case 'SET_INSPECTED_MAP_ENTITY':
        case 'SET_WORLD_INSPECTOR_MANUALLY_CLOSED':
            return handleMapInteraction(state, action, vfxManager, sfxManager);

        // Turn Logic
        case 'START_RESOLVING_TURN':
        case 'APPLY_RESOLVED_TURN':
        case 'START_FIRST_TURN':
        case 'PLAYER_CANCEL_ORDERS':
        case 'AI_ISSUE_ORDER':
        case 'AI_CANCEL_ORDER':
        case 'AI_CLEAR_ORDERS':
            return handleTurnLogic(state, action, vfxManager, sfxManager);

        // Events
        case 'TRIGGER_EVENT':
        case 'CLEAR_LATEST_EVENT':
            return handleEvents(state, action);

        // VFX/SFX
        case 'REMOVE_EVENTS':
            return handleFx(state, action);

        // UI
        case 'SET_ACTIVE_HIGHLIGHT':
        case 'TOGGLE_SETTINGS_DRAWER':
        case 'TOGGLE_GLOBAL_MUTE':
        case 'SET_VOLUME':
        case 'TOGGLE_MUTE_CHANNEL':
        case 'SET_BLOOM_ENABLED':
        case 'SET_BLOOM_VALUE':
        case 'SET_MATERIAL_VALUE':
        case 'SET_AMBIENT_LIGHT_INTENSITY':
        case 'SET_TONEMAPPING_STRENGTH':
        
            return handleUi(state, action);

        default:
            return state;
    }
};