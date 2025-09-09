import { ArchetypeProfile } from '@/types/game.ts';

export const ARCHETYPES: { [key: string]: ArchetypeProfile } = {
    'first-sword': {
        key: 'first-sword',
        name: "First Sword",
        focus: ["Aggression", "Domination", "Unstoppable Force"],
        icon: "swords",
        description: "A master of direct conflict and relentless expansion. The First Sword believes that true power is won through overwhelming military might, seeking to conquer the world through decisive, head-on assaults.",
        legacies: [
            {
                key: 'annihilation-doctrine',
                name: 'Annihilation Doctrine',
                description: "This legacy embodies the core philosophy of the First Sword—total war. It is a commitment to the belief that overwhelming force is the cleanest, most efficient path to victory. Adherents of this doctrine do not believe in feints or subtlety; they are the storm that scours the world clean, and their conquests are swift, brutal, and absolute.",
                birthrightKey: 'kinetic-onslaught',
                gambitKeys: ['celestial-annihilation', 'war-fulcrum'],
                videoUrl: 'https://storage.googleapis.com/brutal-worlds/archetype/first-sword-annihilation-doctrine.webm',
            },
            {
                key: 'warlords-ascendancy',
                name: "Warlord's Ascendancy",
                description: "This legacy is not about chaotic destruction, but about the establishment of an undeniable dynasty. It is the path of a true ruler who builds their throne on a foundation of unbreachable strength and strategic dominance. This Warlord proves their right to rule not just by conquering, but by creating a centralized seat of power so formidable that all others must bend the knee, not just in fear, but in acknowledgement of true authority.",
                birthrightKey: 'imperial-decree',
                gambitKeys: ['shatterpoint-strike', 'trans-dimensional-armory'],
                videoUrl: 'https://storage.googleapis.com/brutal-worlds/archetype/first-sword-warlords-ascendancy.webm',
            }
        ]
    },
    'pact-whisperer': {
        key: 'pact-whisperer',
        name: "Pact Whisperer",
        focus: ["Influence", "Coercion", "Manipulation"],
        icon: "mindfulness",
        description: "A sovereign of the unseen war who wields influence as their primary weapon. They win not by breaking enclaves, but by bending them, turning enemies against each other and absorbing worlds through manipulation.",
        legacies: [
              {
                key: 'voidsworn-covenant',
                name: 'Voidsworn Covenant',
                description: "This legacy signifies a pact with darker, more powerful entities from the void. It trades subtlety for raw, psionic dominance. The Voidsworn do not just influence; they command. Their power is a psychic hammer, shattering the will of their enemies and binding their minds in servitude.",
                birthrightKey: 'psychic-warfare',
                gambitKeys: ['soul-forging', 'void-untethering'],
                videoUrl: 'https://storage.googleapis.com/brutal-worlds/archetype/pact-whisperer-voidsworn-covenant.webm',
            },
            {
                key: 'whispering-covenant',
                name: 'Whispering Covenant',
                description: "Represents a subtle, insidious approach. This legacy is the art of conquest through suggestion. Its power is patient, growing in the minds of its targets like a seed of doubt. It doesn't need to shout when a whisper will do, turning entire populations with carefully crafted memetic signals and promises of salvation.",
                birthrightKey: 'memetic-resonance',
                gambitKeys: ['whispers-from-the-void', 'data-shroud'],
                videoUrl: 'https://storage.googleapis.com/brutal-worlds/archetype/pact-whisperer-whispering-covenant.webm',
            } 
        ]
    },
    'resonance-warden': {
        key: 'resonance-warden',
        name: "Resonance Warden",
        focus: ["Attunement", "Fortification", "Conduction"],
        icon: "cadence",
        description: "A master of cosmic frequencies who attunes to a world's core energies. They shape reality through vibration, forging impossible structures from pure sound and unleashing seismic disruptions to win through superior infrastructure.",
        legacies: [
            {
                key: 'shatter-wave-mandate',
                name: 'Shatter-Wave Mandate',
                description: "Embodies the destructive potential of resonance. This legacy weaponizes the planet's dissonance, turning cosmic frequencies into devastating seismic weapons. They are not builders, but shapers of destruction, capable of shattering enemy defenses, collapsing supply lines, and breaking armies with a single, perfectly tuned shockwave.",
                birthrightKey: 'dissonant-field',
                gambitKeys: ['orbital-nullification-beam', 'world-ender-protocol'],
                videoUrl: 'https://storage.googleapis.com/brutal-worlds/archetype/resonance-warden-shatter-wave-mandate.webm',
            },
            {
                key: 'genesis-forge-mandate',
                name: 'Genesis Forge Mandate',
                description: "Focuses on the constructive aspect of the Warden's power. This legacy is about creation, attuning to the planet's harmony to build an unstoppable industrial and defensive base. They are the architects of the new world, raising impenetrable fortress and logistical marvels from the very bedrock through sonic engineering.",
                birthrightKey: 'genesis-forge',
                gambitKeys: ['aegis-protocol', 'forge-links'],
                videoUrl: 'https://storage.googleapis.com/brutal-worlds/archetype/resonance-warden-genesis-forge-mandate.webm',
            }
        ]
    },
    'labyrinthine-ghost': {
        key: 'labyrinthine-ghost',
        name: "Labyrinthine Ghost",
        focus: ["Espionage", "Secrets", "Disruption"],
        icon: "hub",
        description: "A master of shadows and secrets who thrives on disruption. The Labyrinthine Ghost dismantles empires from within, using intelligence, sabotage, and covert operations to ensure their enemies defeat themselves.",
        legacies: [
            {
                key: 'void-walker',
                name: 'Void Walker',
                description: "This legacy is focused on active sabotage. It is the ghost that lives within the enemy's machine, breaking their logistical chains, corrupting their commands, and sowing chaos within their systems. It doesn't need to see everything when it can ensure that nothing the enemy does works as intended.",
                birthrightKey: 'system-glitch',
                gambitKeys: ['ghost-in-the-system', 'void-cordon'],
                videoUrl: 'https://storage.googleapis.com/brutal-worlds/archetype/labyrinthine-ghost-void-walker.webm',
            },
            {
                key: 'karthian-oracle',
                name: 'Karthian Oracle',
                description: "This legacy emphasizes total information control. It operates on the principle that to see all is to control all. Through a silent, invisible web of ghost-agents and data-daemons, the Panopticon knows the enemy's plans before they do, turning their own strategy against them with chilling precision.",
                birthrightKey: 'panopticon-web',
                gambitKeys: ['labyrinth', 'quantum-loop'],
                videoUrl: 'https://storage.googleapis.com/brutal-worlds/archetype/labyrinthine-ghost-karthian-oracle.webm',
            }
        ]
    }
};