export const GAME_CONFIG = {
    TURN_DURATION: 20,
    PLAYER_STARTING_ENCLAVES: 2,
    MULTIPLE_STARTING_TERRITORIES: true,
    FORCE_ADJACENT_START: true,
    FORCE_SUPPLY_CAP: 50,
    CONQUEST_DIALOG_CHANCE: 0.5,
    QUICK_START: {
        enabled: true,
        player1Archetype: 'first-sword',
        player1Legacy: 'annihilation-doctrine',
        player2Archetype: '',
        player2Legacy: '',
        worldKey: 'skull-sands',
    },
    ENABLE_BLOOM_EFFECT: true,
    DISASTER_TESTING: {
        enabled: true,
        disasterKey: 'entropy-wind',
        triggerOnTurn: 5,
    },
};