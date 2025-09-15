import { BirthrightProfile } from '@/types/game.ts';
import { ASSETS } from '@/data/assets';

export const BIRTHRIGHTS: { [key: string]: BirthrightProfile } = {
    // First Sword
    kineticOnslaught: {
        key: 'kineticOnslaught',
        name: "Kinetic Onslaught",
        icon: "waves",
        description: "By mastering the physics of force projection, these forces strike with a relentless rhythm, conserving energy to maintain a constant, overwhelming offensive.",
        rules: "When issuing an \"Attack\" order, the originating enclave sends 1/4 of its forces, instead of the standard 1/3.",
        image: ASSETS.birthright.kineticOnslaught.image,
    },
    imperialDecree: {
        name: "Imperial Decree",
        key: 'imperialDecree',
        icon: "verified_user",
        description: "The Warlord's decree echoes from the capital, a declaration of divine right to rule. This imperial mandate inspires unwavering loyalty and draws warriors to the throne, strengthening the heart of the empire with each passing moment.",
        rules: "Your starting capital enclave permanently gains +2 forces at the end of every turn, even when attacking or assisting.",
        image: ASSETS.birthright.imperialDecree.image,
    },
    // Pact Whisperer
    memeticResonance: {
        key: 'memeticResonance',
        name: "Memetic Resonance",
        icon: "monitor_heart",
        description: "A powerful cultural signal projects from controlled enclaves, subtly influencing the development of neutral enclaves and weakening its population centers.",
        rules: "Neutral enclaves adjacent to any friendly-controlled enclave lose 1 force at the end of each turn.",
        image: ASSETS.birthright.memeticResonance.image,
    },
    psychicWarfare: {
        key: 'psychicWarfare',
        name: "Psychic Warfare",
        icon: "psychology",
        description: "The Whisperer projects a constant psionic signal that agitates the unaligned. Neutral populations near the enemy arm themselves out of paranoia and fear, making them unexpectedly resilient to conquest.",
        rules: "At the end of the turn Neutral enclaves adjacent to any opponent enclaves gain 1 force.",
        image: ASSETS.birthright.psychicWarfare.image,
    },
    // Resonance Warden
    dissonantField: {
        key: 'dissonantField',
        name: "Dissonant field",
        icon: "surround_sound",
        description: "The Warden projects a low-frequency dissonant field around fortified positions. This disruptive hum interferes with enemy targeting systems and scrambles command frequencies, nullifying the tactical advantages of a coordinated assault.",
        rules: "Attacks against any of your holding enclaves do not get the normal +1 combat bonus.",
        image: ASSETS.birthright.dissonantField.image,
    },
    genesisForge: {
        key: 'genesisForge',
        name: "Genesis Forge",
        icon: "build_circle",
        description: "The Warden attunes a holding enclave to the world's core harmony. This resonant frequency acts as a sonic forge, accelerating force production and solidifying defenses through pure vibration.",
        rules: "Enclaves with a \"Hold\" order generate +3 forces per turn, instead of the standard +2.",
        image: ASSETS.birthright.genesisForge.image,
    },
    // Labyrinthine Ghost
    systemGlitch: {
        key: 'systemGlitch',
        name: "System Glitch",
        icon: "network_check",
        description: "The Ghost seeds the global network with data-daemons that randomly disrupt enemy logistics, causing unexpected delays and communication breakdowns.",
        rules: "At the start of each turn, there is a 50% chance that a random enemy route becomes disabled for a turn.",
        image: ASSETS.birthright.systemGlitch.image,
    },
    panopticonWeb: {
        key: 'panopticonWeb',
        name: "Panopticon Web",
        icon: "visibility",
        description: "An invisible web of data streams and ghost-agents blankets the globe. Each turn, an agent penetrates the enemy's security net, feeding you a vital piece of their strategic disposition.",
        rules: "At the start of each turn, the force count of one random, non-adjacent enemy enclave is revealed to the player.",
        image: ASSETS.birthright.panopticonWeb.image,
    },
};
