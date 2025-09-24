
import { ColorScale, SemanticColorPalette } from "./theme";

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
  possibleDisasters?: string[];
  possibleEvents?: string[];
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
