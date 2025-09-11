import { Vector3 } from 'three';
import { GAME_CONFIG } from '@/data/config.ts';

export type GameConfig = typeof GAME_CONFIG;

export type { Vector3 };

// Static Profiles & Configurations
export interface WorldConfig {
  seed: number;
  SPHERE_RADIUS: number;
  NUM_POINTS: number;
  LAND_COVERAGE_MIN: number;
  LAND_COVERAGE_MAX: number;
  ISLAND_DOMAINS_MIN: number;
  ISLAND_DOMAINS_MAX: number;
  ENCLAVE_SIZE_MIN: number;
  ENCLAVE_SIZE_MAX: number;
  RIFT_THRESHOLD: number;
  EXPANSE_MAX_SIZE: number;
  EXPANSE_COUNT_MIN: number;
  EXPANSE_COUNT_MAX: number;
  DOMAIN_TOUCH_CHANCE: number;
  PENINSULA_CHANCE: number;
}
export interface NebulaConfig {
  color: string;
  density: number;
  falloff: number;
}
export interface ColorScale {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string; 950: string;
}
export interface SemanticColorPalette {
  base: string;
  hover: string;
  target: string;
  selected: string;
  light: string;
  dark: string;
  disabled: string;
  icon: string;
  text: string;
}
export interface WorldColorTheme {
  scale: ColorScale,
  three: SemanticColorPalette;
}
export interface WorldProfile {
  key: string;
  name: string;
  description: string;
  illustrationUrl: string;
  icon: string;
  config: WorldConfig;
  nebula: {
    main: NebulaConfig;
    wispy: NebulaConfig;
  };
  sunColor: string;
  sunScale: number;
  worldColor: string;
  atmosphereColor: string;
  worldColorTheme: WorldColorTheme;
  neutralColorPalette: SemanticColorPalette;
  names: {
    domains: {
      name: string;
      strength: number;
      enclaves: { name: string }[];
    }[];
    rifts: string[];
    expanses: string[];
  };
  possibleDisasters: string[];
  disasterChance: number;
  bloom?: {
    threshold: number;
    strength: number;
    radius: number;
  };
  tonemappingStrength?: number;
}
export interface OrderProfile {
    name: string;
    icon: string;
    description: string;
    effect: string;
    vfxKey?: string;
}
export interface SfxPlayback {
  key: string;
  channel: AudioChannel;
  position?: Vector3;
}

export type DisasterRule = 
    | { type: 'forceDamage', target: 'occupyingEnclave' | 'affectedEnclaves', damageType: 'percentage' | 'flat', value: number | [number, number] }
    | { type: 'routeDisable', target: 'affectedEnclaves', duration: number, chance?: number }
    | { type: 'routeDestroy', target: 'affectedEnclaves', chance: number }
    | { type: 'statModifier', target: 'affectedEnclaves', stat: 'production' | 'combat', reduction: number }
    | { type: 'dissipateOnNoMoveTarget' }
    | { type: 'applyAftermathOnChance', target: 'affectedEnclaves', chance: number };

export interface DisasterPhase {
    name: string;
    description: string;
    duration: number | [number, number];
    radius: number | [number, number] | (() => number);
    movement: number | [number, number];
    rules: DisasterRule[];
}

export interface DisasterProfile {
  ui: {
    name: string;
    icon: string;
    description: string;
    assets: {
        key: string;
        image: string;
        sfxAlert: string;
        sfxImpact: string;
        sfxAftermath: string;
        vfxAlert: string;
        vfxImpact: string;
        vfxAftermath: string;
    };
  };
  logic: {
    originCellType: 'Area' | 'Void' | 'Area or Void';
    siteCount: number | [number, number];
    alert: DisasterPhase;
    impact: DisasterPhase;
    aftermath?: DisasterPhase;
  };
}

export interface LegacyProfile {
    key: string;
    name: string;
    description: string;
    birthrightKey: string;
    gambitKeys: [string, string];
    videoUrl: string;
}

export interface ArchetypeProfile {
    key: string;
    name: string;
    focus: string[];
    icon: string;
    description: string;
    legacies: [LegacyProfile, LegacyProfile];
}

export interface BirthrightProfile {
    key: string;
    name: string;
    icon: string;
    description: string;
    rules: string;
}

export interface GambitProfile {
    key: string;
    name: string;
    icon: string;
    description: string;
    target: string;
    scope: string;
    category: 'Archetype' | 'Common';
    restriction: string;
    availabilityTurn: number;
    playstyle: 'Offensive' | 'Defensive' | 'Utility';
    effect: string;
    duration: string;
    uses?: number;
}
export interface VfxProfile {
    url: string;
    width?: number;
    height?: number;
}
export interface SfxProfile {
    url: string;
}
export type SfxCategoryName = 'ui' | 'sfx' | 'dialog' | 'ambient' | 'music';



// Core Types
export type PlayerIdentifier = 'player-1' | 'player-2';
export type Player = PlayerIdentifier;
export type Owner = PlayerIdentifier | null;
export type AudioChannel = 'fx' | 'ambient' | 'music' | 'ui' | 'dialog';

// UI & Interaction Types
export type HighlightType = 'domains' | 'enclaves' | 'expanses' | 'rifts';
export type IntroPhase = 'pending' | 'entry' | 'exit' | 'arrival' | 'letterbox-out' | 'title-out' | 'ui-in' | 'complete';

export interface ActiveHighlight {
  type: HighlightType;
  owners: Set<Owner>;
}

export interface ScreenPosition {
  x: number;
  y: number;
  visible: boolean;
}

export type GamePhase = 'loading' | 'mainMenu' | 'archetypeSelection' | 'playing' | 'gameOver';
export type GameOverState = 'none' | 'victory' | 'defeat';

export type MapEntityType = 'enclave' | 'rift' | 'expanse' | 'domain' | 'disaster';
export type InspectedMapEntity = { type: MapEntityType; id: number | string };

export type InspectedEntity = 
    | InspectedMapEntity
    | { type: 'world' }
    | { type: 'archetype'; owner: PlayerIdentifier };

// Map & World Entity Types (Stateful parts)
export interface MapCell {
  id: number;
  polygon: any; 
  center: Vector3;
  neighbors: number[];
  type: 'void' | 'area';
  domainId: number | null;
  voidId: number | null;
  voidType: 'rift' | 'expanse' | null;
  enclaveId: number | null;
  owner: Owner;
  baseMaterialIndex: number;
  geometryGroupIndex: number;
}

export interface Enclave {
  id: number;
  name: string;
  owner: Owner;
  forces: number;
  center: Vector3;
  domainId: number;
  mainCellId: number;
  activeEffects: ActiveEffect[];
  archetypeKey?: string;
  imageUrl: string;
  vfxToPlayThisTurn?: { key: string; center: Vector3 }[];
  sfxToPlayThisTurn?: SfxPlayback[];
}

export interface Domain {
  id: number;
  name: string;
  isIsland: boolean;
  center: Vector3;
  strength: number;
}

export interface Rift {
  id: number;
  name: string;
  center: Vector3;
  description: string;
}

export interface Expanse {
  id: number;
  name: string;
  center: Vector3;
  description: string;
}

export interface Route {
  from: number;
  to: number;
  type: 'land' | 'sea';
  disabledForTurns: number;
  isDestroyed: boolean;
}

// Orders & Commands
export type OrderType = 'attack' | 'assist' | 'holding';

export interface Order {
  to: number;
  type: OrderType;
}

export interface PendingOrders {
  [fromId: number]: Order;
}

// Disasters & Effects (Stateful parts)
export interface ActiveEffect {
  id: string;
  profileKey: string;
  duration: number;
  maxDuration: number;
  phase: 'alert' | 'impact' | 'aftermath';
  rules: DisasterRule[];
  metadata?: any;
}

export interface ActiveDisasterMarker {
  id: string;
  profileKey: string;
  cellId: number;
  position: Vector3;
  currentPhase: 'alert' | 'impact' | 'aftermath';
  durationInPhase: number;
  radius: number;
  movement: number;
  disasters: string[];
  metadata?: {
    targetEnclaveIds?: number[];
    [key: string]: any;
  };
}

// VFX (Stateful)
export interface ActiveVfx {
  key: string;
  video: HTMLVideoElement;
  worldPosition: Vector3;
  width: number;
  height: number;
}

// Gambits (Stateful)
export type GambitState = 'locked' | 'available' | 'active' | 'depleted';
export interface ActiveGambit {
    key: string;
    state: GambitState;
    remainingUses: number;
    remainingDuration?: number;
}

export interface EffectQueueItem {
    id: string;
    vfxKey?: string;
    sfx?: SfxPlayback;
    position: Vector3;
}

// Briefing
export interface BriefingContent {
    icon: string;
    iconColorClass?: string;
    iconColorHex?: string;
    title: string;
    subtitle?: string;
    description?: string;
    disasterDescription?: string;
    effect?: string;
    imageUrl?: string;
    alertPhase?: { name: string; effect: string; duration: string };
    impactPhase?: { name: string; effect: string; duration: string };
    aftermathPhase?: { name: string; effect: string; duration: string };
    birthright?: { name: string; icon: string; effect: string; };
    baseValue?: string | number;
    bonusValue?: string | number;
    valueType?: 'force' | 'duration' | 'text';
    owner?: Owner;
    worldPalette?: SemanticColorPalette;
    enclaves?: { id: number; name: string; forces: number; owner: Owner }[];
    isContested?: boolean;
    ownerForces?: { owner: Owner; forces: number }[];
    enclavesByOwner?: { [key: string]: { id: number; name: string; forces: number; owner: Owner }[] };
}

export interface MaterialProperties {
    metalness: number;
    roughness: number;
    emissiveIntensity?: number;
}

export interface GameState {
    mapData: MapCell[];
    enclaveData: { [id: number]: Enclave };
    domainData: { [id: number]: Domain };
    riftData: { [id: number]: Rift };
    expanseData: { [id: number]: Expanse };
    routes: Route[];
    planetName: string;
    isInitialized: boolean;
    error: string | null;
    currentTurn: number;
    playerPendingOrders: PendingOrders;
    aiPendingOrders: PendingOrders;
    latestDisaster: { profile: DisasterProfile; locationName: string } | null;
    activeDisasterMarkers: ActiveDisasterMarker[];
    loadingMessage: string;
    currentWorld: WorldProfile | null;
    gameConfig: GameConfig;
    gamePhase: GamePhase;
    gameSessionId: number;
    playerArchetypeKey: string | null;
    playerLegacyKey: string | null;
    playerLegacyIndex: number | null;
    opponentArchetypeKey: string | null;
    opponentLegacyKey: string | null;
    opponentLegacyIndex: number | null;
    playerHasHadFirstConquestDialog: boolean;
    opponentHasHadFirstConquestDialog: boolean;
    playerConquestsThisTurn: number;
    opponentConquestsThisTurn: number;
    playerGambits: ActiveGambit[];
    opponentGambits: ActiveGambit[];
    hoveredCellId: number;
    selectedEnclaveId: number | null;
    isIntroComplete: boolean;
    cameraFocusAnimation: { active: boolean; target: Vector3 } | null;
    hoveredEntity: {
        name: string;
        type: 'enclave' | 'domain' | 'rift' | 'expanse';
        owner: Owner;
    } | null;
    isPaused: boolean;
    initialCameraTarget: Vector3 | null;
    vfxToPlay: { key: string; center: Vector3 } | null;
    sfxToPlay: SfxPlayback | null;
    activeHighlight: ActiveHighlight | null;
    effectQueue: EffectQueueItem[];
    isSettingsOpen: boolean;
    isResolvingTurn: boolean;
    gameOverState: GameOverState;
    isGloballyMuted: boolean;
    volumes: Record<AudioChannel, number>;
    mutedChannels: Record<AudioChannel, boolean>;
    isBloomEnabled: boolean;
    bloomSettings: {
        threshold: number;
        strength: number;
        radius: number;
    };
    materialSettings: {
        player: MaterialProperties;
        neutral: MaterialProperties;
        void: MaterialProperties;
    };
    ambientLightIntensity: number;
    tonemappingStrength: number;
    playVfxFromPreviousTurns: boolean;
    stackVfx: boolean;

    // New state for concurrent inspectors
    inspectedArchetypeOwner: PlayerIdentifier | null;
    inspectedMapEntity: InspectedMapEntity | { type: 'world' } | null;
    worldInspectorManuallyClosed: boolean;
}

export interface ConquestEvent {
    enclaveId: number;
    conqueror: Player;
    archetypeKey: string;
    legacyKey: string;
}