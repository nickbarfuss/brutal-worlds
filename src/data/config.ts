export const GAME_CONFIG = {
    TURN_DURATION: 20,
    PLAYER_STARTING_ENCLAVES: 2,
    MULTIPLE_STARTING_TERRITORIES: true,
    FORCE_ADJACENT_START: true,
    FORCE_SUPPLY_CAP: 50,
    ATTACK_RATE: 0.35,
    CONQUEST_DIALOG_CHANCE: 0.5,
    QUICK_START: {
        enabled: true,
        player1Archetype: '', //first-sword
        player1Legacy: '', //annihilation-doctrine
        player2Archetype: '',
        player2Legacy: '',
        worldKey: 'skull-sands',
    },
    DISASTER_TESTING: {
        enabled: true,
        disasterKey: 'entropy-wind',
        triggerOnTurn: 2,
    },
    AUDIO_DEFAULTS: {
        volumes: { fx: 0.7, ambient: 0.5, music: 0.6, ui: 0.6, dialog: 0.8 },
        mutedChannels: { fx: false, ambient: true, music: true, ui: false, dialog: false },
    },
    VISUAL_DEFAULTS: {
        enableBloom: true,
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
    },
}