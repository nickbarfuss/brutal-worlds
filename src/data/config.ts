export const GAME_CONFIG = {
    TURN_DURATION: 20,
    PLAYER_STARTING_ENCLAVES: 2,
    MULTIPLE_STARTING_TERRITORIES: true,
    FORCE_ADJACENT_START: true,
    FORCE_SUPPLY_CAP: 50,
    QUICK_START: {
        enabled: true,
        player1Archetype: 'first-sword',
        player2Archetype: '',
        worldKey: 'skull-sands',
    },
    ENABLE_BLOOM_EFFECT: true,
    DISASTER_TESTING: {
        enabled: true,
        disasterKey: 'entropy-wind',
        triggerOnTurn: 1,
    },
};

export interface GameConfig {
    TURN_DURATION: number;
    PLAYER_STARTING_ENCLAVES: number;
    MULTIPLE_STARTING_TERRITORIES: boolean;
    FORCE_ADJACENT_START: boolean;
    FORCE_SUPPLY_CAP: number;
    QUICK_START: {
        enabled: boolean;
        player1Archetype?: string;
        player2Archetype?: string;
        worldKey?: string;
    };
    ENABLE_BLOOM_EFFECT: boolean;
    DISASTER_TESTING?: {
        enabled: boolean;
        disasterKey: string;
        triggerOnTurn: number;
    };
}