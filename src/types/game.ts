import { Vector3 } from 'three';
import { CONFIG } from '@/data/config.ts';

export type GameConfig = typeof CONFIG;

import { Rule } from './rules';
import { EffectUI, EffectAssets, SfxAsset, VfxAsset, ActiveEffect } from '@/features/effects/effects.types';
import { EffectLogic, SfxPlayback } from '@/logic/effects/effects.types';
import { EventProfile } from '@/logic/events/events.types';
import { PendingOrders, AttackEvent, HoldEvent, AssistEvent, Order, OrderType, OrderProfile } from '@/logic/orders/orders.types';
import { ConquestEvent } from '@/logic/conquests/conquests.types';
import { ActiveEvent, ActiveEventMarker } from '@/logic/events/events.types';
import { ActiveGambit, GambitProfile } from '@/logic/gambits/gambits.types';
import { MapCell, Enclave, Domain, Rift, Expanse, Route } from '@/logic/world/world.types';
import { PlayerIdentifier, Player, Owner, AudioChannel } from './core';
import { WorldProfile, WorldColorTheme } from './world';
import { SemanticColorPalette, ColorScale } from './theme';
import { DisasterProfile, ActiveDisasterMarker, DisasterRule } from '@/logic/disasters/disasters.types';

export type {
  Vector3,
  Rule,
  EffectUI,
  EffectAssets,
  SfxAsset,
  VfxAsset,
  ActiveEffect,
  EffectLogic,
  EventProfile,
  PendingOrders,
  AttackEvent,
  HoldEvent,
  AssistEvent,
  ConquestEvent,
  ActiveEvent,
  ActiveEventMarker,
  ActiveGambit,
  SfxPlayback,
  MapCell,
  Enclave,
  Domain,
  Rift,
  Expanse,
  Route,
  PlayerIdentifier,
  Player,
  Owner,
  AudioChannel,
  WorldProfile,
  SemanticColorPalette,
  Order,
  OrderType,
  ColorScale,
  DisasterProfile,
  ActiveDisasterMarker,
  DisasterRule,
  GambitProfile,
  WorldColorTheme,
  OrderProfile,
};


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

export type MapEntityType = 'enclave' | 'rift' | 'expanse' | 'domain' | 'event';
export type InspectedMapEntity = { type: MapEntityType; id: number | string };

export type InspectedEntity = 
    | InspectedMapEntity
    | { type: 'world' }
    | { type: 'archetype'; owner: PlayerIdentifier };

export interface EventQueueItem {
    id:string;
    playMode: 'immediate' | 'pending';
    position: Vector3;
    sfx?: SfxPlayback;
    vfx?: { key: string }[] | string[];
}

// Briefing
export type BriefingType = 'order' | 'event' | 'route' | 'domain' | 'eventProfile' | 'birthright' | 'eventMarker' | 'disasterProfile' | 'disasterMarker';

export interface BriefingState {
    content: BriefingContent;
    targetRect: DOMRect;
    parentRect: DOMRect;
    type: BriefingType;
}

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
    latestEvent: { profile: EventProfile; locationName: string } | null;
    activeEventMarkers: ActiveEventMarker[];
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
    conquestDialogState: {
      [playerId: string]: {
        hasHadFirstConquestDialog: boolean;
      };
    };
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
    events: EventQueueItem[];
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

    inspectedArchetypeOwner: PlayerIdentifier | null;
    inspectedMapEntity: InspectedMapEntity | { type: 'world' } | null;
    worldInspectorManuallyClosed: boolean;
    unprocessedTurnEvents: TurnEvent[] | null;
}

export type TurnEvent = ConquestEvent | AttackEvent | HoldEvent | AssistEvent;
