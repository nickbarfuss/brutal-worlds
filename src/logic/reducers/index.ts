import { GameState, GamePhase, InspectedEntity, ActiveHighlight, AudioChannel, MaterialProperties, Order, Vector3, PlayerIdentifier, InspectedMapEntity } from '@/types/game';
import { GAME_CONFIG } from '@/data/config';
import { handleInitialization } from '@/logic/reducers/initializationReducer';
import { handleGameFlow } from '@/logic/reducers/gameFlowReducer';
import { handleMapInteraction } from '@/logic/reducers/mapInteractionReducer';
import { handleTurnLogic } from '@/logic/reducers/turnLogicReducer';
import { handleDisasters } from '@/logic/reducers/disasterReducer';
import { handleFx } from '@/logic/reducers/vfxReducer';
import { handleUi } from '@/logic/reducers/uiReducer';

export type Action =
    | { type: 'SET_INITIALIZATION_STATE'; payload: { isInitialized: boolean; message: string; error: string | null } }
    | { type: 'SET_GAME_PHASE'; payload: GamePhase }
    // FIX: Changed payload property from 'playerArchetypeSkinIndex' to 'playerLegacyIndex' to match state shape.
    | { type: 'START_GAME'; payload: { playerArchetypeKey: string; worldKey: string; playerLegacyIndex: number; opponentArchetypeKey?: string; opponentLegacyIndex?: number; } }
    | { type: 'COMPLETE_INTRO' }
    | { type: 'RESET_GAME' }
    | { type: 'TOGGLE_PAUSE' }
    | { type: 'SET_HOVERED_CELL'; payload: number }
    | { type: 'HANDLE_MAP_CLICK'; payload: { cellId: number | null, isCtrlPressed: boolean } }
    | { type: 'HANDLE_DBL_CLICK'; payload: number | null }
    | { type: 'FOCUS_ON_ENCLAVE'; payload: number }
    | { type: 'FOCUS_ON_VECTOR'; payload: Vector3 }
    | { type: 'SET_INSPECTED_ARCHETYPE_OWNER', payload: PlayerIdentifier | null }
    | { type: 'SET_INSPECTED_MAP_ENTITY', payload: InspectedMapEntity | { type: 'world' } | null }
    | { type: 'SET_WORLD_INSPECTOR_MANUALLY_CLOSED', payload: boolean }
    | { type: 'START_RESOLVING_TURN' }
    | { type: 'APPLY_RESOLVED_TURN'; payload: any }
    | { type: 'START_FIRST_TURN' }
    | { type: 'PLAYER_CANCEL_ORDERS', payload: number[] }
    | { type: 'AI_ISSUE_ORDER'; payload: { fromId: number; order: Order } }
    | { type: 'AI_CANCEL_ORDER'; payload: { fromId: number } }
    | { type: 'AI_CLEAR_ORDERS' }
    | { type: 'TRIGGER_DISASTER'; payload: string }
    | { type: 'CLEAR_LATEST_DISASTER' }
    | { type: 'PROCESS_EFFECT_QUEUE'; payload: { playedIds: string[] } }
    | { type: 'PLAY_VFX'; payload: { key: string; center: Vector3 } }
    | { type: 'PLAY_SFX'; payload: { key: string; channel: AudioChannel; position?: Vector3 } }
    | { type: 'CLEAR_VFX' }
    | { type: 'CLEAR_SFX' }
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
    | { type: 'SET_TONEMAPPING_STRENGTH'; payload: number }
    | { type: 'SET_PLAY_VFX_FROM_PREVIOUS_TURNS'; payload: boolean }
    | { type: 'SET_STACK_VFX'; payload: boolean };

export const initialState: GameState = {
    mapData: [], enclaveData: {}, domainData: {}, riftData: {}, expanseData: {}, routes: [],
    planetName: '', isInitialized: false, error: null, currentTurn: 0, 
    playerPendingOrders: {}, aiPendingOrders: {},
    latestDisaster: null, activeDisasterMarkers: [],
    loadingMessage: 'Initializing', currentWorld: null, gameConfig: GAME_CONFIG, gamePhase: 'loading',
    gameSessionId: 0,
    // FIX: Corrected property names and added missing properties to align with GameState type definition.
    playerArchetypeKey: null, playerLegacyKey: null, playerLegacyIndex: null, opponentArchetypeKey: null, opponentLegacyKey: null, opponentLegacyIndex: null, 
    playerGambits: [], opponentGambits: [],
    hoveredCellId: -1, selectedEnclaveId: null, 
    inspectedArchetypeOwner: null, inspectedMapEntity: null,
    worldInspectorManuallyClosed: false,
    isIntroComplete: false, cameraFocusAnimation: null, hoveredEntity: null,
    isPaused: true, initialCameraTarget: null, vfxToPlay: null, sfxToPlay: null, activeHighlight: null,
    effectQueue: [],
    isSettingsOpen: false,
    isResolvingTurn: false,
    gameOverState: 'none',
    isGloballyMuted: false,
    volumes: { fx: 0.7, ambient: 0.2, music: 0.6, ui: 0.6, dialog: 0.8 },
    mutedChannels: { fx: false, ambient: true, music: true, ui: false, dialog: false },
    isBloomEnabled: GAME_CONFIG.ENABLE_BLOOM_EFFECT,
    bloomSettings: { threshold: 0.5, strength: 0.5, radius: 1.0 },
    materialSettings: {
        player: { metalness: 0.0, roughness: 1.0, emissiveIntensity: 1.0 },
        neutral: { metalness: 0.0, roughness: 1.0, emissiveIntensity: 0.3 },
        void: { metalness: 0.0, roughness: 0.5, emissiveIntensity: 0.2 },
    },
    ambientLightIntensity: 1.0,
    tonemappingStrength: 1.0,
    playVfxFromPreviousTurns: true,
    stackVfx: false,
};

export const reducer = (state: GameState, action: Action): GameState => {
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
        case 'SET_INSPECTED_MAP_ENTITY':
            return handleMapInteraction(state, action);
            
        // Turn Logic
        case 'START_FIRST_TURN':
        case 'START_RESOLVING_TURN':
        case 'APPLY_RESOLVED_TURN':
        case 'PLAYER_CANCEL_ORDERS':
        case 'AI_ISSUE_ORDER':
        case 'AI_CANCEL_ORDER':
        case 'AI_CLEAR_ORDERS':
            return handleTurnLogic(state, action);

        // Disasters
        case 'TRIGGER_DISASTER':
        case 'CLEAR_LATEST_DISASTER':
            return handleDisasters(state, action);

        // VFX/SFX
        case 'PROCESS_EFFECT_QUEUE':
        case 'PLAY_VFX':
        case 'PLAY_SFX':
        case 'CLEAR_VFX':
        case 'CLEAR_SFX':
            return handleFx(state, action);

        // UI
        case 'SET_INSPECTED_ARCHETYPE_OWNER':
        case 'SET_WORLD_INSPECTOR_MANUALLY_CLOSED':
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
        case 'SET_PLAY_VFX_FROM_PREVIOUS_TURNS':
        case 'SET_STACK_VFX':
            return handleUi(state, action);

        default:
            return state;
    }
};