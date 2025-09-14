import { Vector3 } from 'three';
import { CONFIG } from '@/data/config.ts';

export type GameConfig = typeof CONFIG;

export interface ForceDamageRule {
    type: 'forceDamage';
    payload: {
        target: 'occupyingEnclave' | 'affectedEnclaves' | 'targetEnclave' | 'adjacentEnclaves';
        damageType: 'percentage' | 'flat';
        value: number | [number, number];
    };
}

export interface RouteDisableRule {
    type: 'routeDisable';
    payload: {
        target: 'affectedEnclaves' | 'global' | 'targetRoute' | 'seaRoutes';
        duration: number;
        chance?: number;
    };
}

export interface RouteDestroyRule {
    type: 'routeDestroy';
    payload: {
        target: 'affectedEnclaves' | 'targetEnclave';
        chance?: number;
    };
}

export interface StatModifierRule {
    type: 'statModifier';
    payload: {
        target: 'affectedEnclaves' | 'targetEnclave';
        stat: 'production' | 'combat' | 'attack_order_multiplier' | 'combat_bonus' | 'attack_order_force_bonus' | 'cannot_be_attacked';
        value: number | boolean;
        duration?: number | 'permanent';
    };
}

export interface DissipateOnNoMoveTargetRule {
    type: 'dissipateOnNoMoveTarget';
}

export interface ApplyAftermathOnChanceRule {
    type: 'applyAftermathOnChance';
    payload: {
        target: 'affectedEnclaves';
        chance: number;
    };
}

export interface HideForceCountsRule {
    type: 'hideForceCounts';
    payload: {
        target: 'opponent';
        duration: number;
    };
}

export interface GainForcesRule {
    type: 'gainForces';
    payload: {
        target: 'capitalEnclave' | 'targetEnclave';
        value: number;
    };
}

export interface CancelOrderRule {
    type: 'cancelOrder';
    payload: {
        target: 'targetEnclave' | 'incomingOrder';
        orderType: 'Gambit' | 'Attack' | 'Assist';
    };
}

export interface CreateRoutesRule {
    type: 'createRoutes';
    payload: {
        target: 'targetEnclave';
        count: number;
        connectionType: 'nearestUnconnectedFriendly';
    };
}

export interface SetForcesRule {
    type: 'setForces';
    payload: {
        target: 'targetEnclave';
        value: number;
    };
}

export interface ConvertEnclaveRule {
    type: 'convertEnclave';
    payload: {
        target: 'targetEnclave' | 'randomNeutralEnclave';
        toOwner: 'friendly' | 'neutral';
        forces?: number;
    };
}

export interface SummonDisasterRule {
    type: 'summonDisaster';
    payload: {
        target: 'targetEnclave';
        disasterKey: 'any';
    };
}

export interface LockOrderRule {
    type: 'lockOrder';
    payload: {
        target: 'attackingEnclave';
        duration: number;
    };
}

export type Rule =
    | ForceDamageRule
    | RouteDisableRule
    | RouteDestroyRule
    | StatModifierRule
    | DissipateOnNoMoveTargetRule
    | ApplyAftermathOnChanceRule
    | HideForceCountsRule
    | GainForcesRule
    | CancelOrderRule
    | CreateRoutesRule
    | SetForcesRule
    | ConvertEnclaveRule
    | SummonDisasterRule
    | LockOrderRule;

export interface EffectAssets {
    key: string;
    image: string;
    sfx?: {
        alert?: string;
        impact?: string;
        aftermath?: string;
        [key: string]: string | undefined;
    };
    vfx?: {
        alert?: string;
        impact?: string;
        aftermath?: string;
        [key: string]: string | undefined;
    };
    dialog?: {
        alert?: string;
        impact?: string;
        aftermath?: string;
        [key: string]: string | undefined;
    };
}

export interface EffectUI {
    name: string;
    icon: string;
    description: string;
    assets: EffectAssets;
}

export interface EffectTargeting {
    targetType: string; // e.g., 'Friendly Enclave', 'Self', 'Enemy Enclave', 'Route'
    siteCount: number;
}

export interface EffectPhase {
    name: string;
    description: string;
    effect?: string;
    duration: number | [number, number] | 'Permanent';
    radius: number | [number, number] | (() => number) | 'Global';
    movement?: number | [number, number];
    rules: Rule[];
}

export interface EffectLogic {
    category?: 'Archetype' | 'Common';
    playstyle?: 'Offensive' | 'Defensive' | 'Utility';
    targeting?: EffectTargeting;

    originCellType?: 'Area' | 'Void' | 'Area or Void';
    siteCount?: number | [number, number];

    archetype?: string;
    legacy?: string;
    availability?: number;

    alert?: EffectPhase;
    impact: EffectPhase;
    aftermath?: EffectPhase;
}

export interface EffectProfile {
    key: string;
    ui: EffectUI;
    logic: EffectLogic;
}


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
  possibleEffects: string[];
  disasterChance: number;
  bloom?: {
    threshold: number;
    strength: number;
    radius: number;
  };
  tonemappingStrength?: number;
}

export interface StarfieldLayerConfig {
  count: number;
  radiusMultiplier: number;
  baseSize: number;
}

export interface StarfieldConfig {
  milkyWayDensityRatio: number;
  layer1: StarfieldLayerConfig;
  layer2: StarfieldLayerConfig;
}


export interface OrderProfile {
    name: string;
    icon: string;
    description: string;
    effect: string;
    assets: {
        sfx?: string[];
        vfx?: string[];
    };
}
export interface SfxPlayback {
  key: string;
  channel: AudioChannel;
  position?: Vector3;
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

export type MapEntityType = 'enclave' | 'rift' | 'expanse' | 'domain' | 'effect';
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
  rules: Rule[];
  metadata?: any;
}

export interface ActiveEffectMarker {
  id: string;
  profileKey: string;
  cellId: number;
  position: Vector3;
  currentPhase: 'alert' | 'impact' | 'aftermath';
  durationInPhase: number;
  radius: number;
  movement: number;
  effects: string[];
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
    vfx?: (string | { key: string })[];
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
    latestEffect: { profile: EffectProfile; locationName: string } | null;
    activeEffectMarkers: ActiveEffectMarker[];
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