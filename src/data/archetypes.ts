import { ArchetypeProfile } from '@/features/archetypes/archetypes.types';
import { ASSETS } from '@/data/assets';

export const ARCHETYPES: { [key: string]: ArchetypeProfile } = {
    firstSword: {
        key: 'firstSword',
        name: "First Sword",
        icon: "swords",
        description: "A master of direct conflict and relentless expansion. The First Sword believes that true power is won through overwhelming military might, seeking to conquer the world through decisive, head-on assaults.",
        legacies: {
            annihilationDoctrine: {
                key: 'annihilationDoctrine',
                name: 'Annihilation Doctrine',
                description: "This legacy embodies the core philosophy of the First Sword—total war. It is a commitment to the belief that overwhelming force is the cleanest, most efficient path to victory. Adherents of this doctrine do not believe in feints or subtlety; they are the storm that scours the world clean, and their conquests are swift, brutal, and absolute.",
                birthrightKey: 'kineticOnslaught',
                gambitKeys: ['celestialAnnihilation', 'warFulcrum'],
                movie: ASSETS.archetype.firstSword.annihilationDoctrine.movie,
                avatar: ASSETS.archetype.firstSword.annihilationDoctrine.avatar,
                focus: ["Aggression", "Domination", "Unstoppable Force"],
            },
            warlordsAscendancy: {
                key: 'warlordsAscendancy',
                name: "Warlord's Ascendancy",
                description: "This legacy is not about chaotic destruction, but about the establishment of an undeniable dynasty. It is the path of a true ruler who builds their throne on a foundation of unbreachable strength and strategic dominance. This Warlord proves their right to rule not just by conquering, but by creating a centralized seat of power so formidable that all others must bend the knee, not just in fear, but in acknowledgement of true authority.",
                birthrightKey: 'imperialDecree',
                gambitKeys: ['shatterpointStrike', 'transDimensionalArmory'],
                movie: ASSETS.archetype.firstSword.warlordsAscendancy.movie,
                avatar: ASSETS.archetype.firstSword.warlordsAscendancy.avatar,
                focus: ["Aggression", "Domination", "Unstoppable Force"],
            }
        }
    },
    pactWhisperer: {
        key: 'pactWhisperer',
        name: "Pact Whisperer",
        icon: "mindfulness",
        description: "A sovereign of the unseen war who wields influence as their primary weapon. They win not by breaking enclaves, but by bending them, turning enemies against each other and absorbing worlds through manipulation.",
        legacies: {
            voidswornCovenant: {
                key: 'voidswornCovenant',
                name: 'Voidsworn Covenant',
                description: "This legacy signifies a pact with darker, more powerful entities from the void. It trades subtlety for raw, psionic dominance. The Voidsworn do not just influence; they command. Their power is a psychic hammer, shattering the will of their enemies and binding their minds in servitude.",
                birthrightKey: 'psychicWarfare',
                gambitKeys: ['soulForging', 'voidUntethering'],
                movie: ASSETS.archetype.pactWhisperer.voidswornCovenant.movie,
                avatar: ASSETS.archetype.pactWhisperer.voidswornCovenant.avatar,
                focus: ["Influence", "Coercion", "Manipulation"],
            },
            whisperingCovenant: {
                key: 'whisperingCovenant',
                name: 'Whispering Covenant',
                description: "Represents a subtle, insidious approach. This legacy is the art of conquest through suggestion. Its power is patient, growing in the minds of its targets like a seed of doubt. It doesn't need to shout when a whisper will do, turning entire populations with carefully crafted memetic signals and promises of salvation.",
                birthrightKey: 'memeticResonance',
                gambitKeys: ['whispersFromTheVoid', 'dataShroud'],
                movie: ASSETS.archetype.pactWhisperer.whisperingCovenant.movie,
                avatar: ASSETS.archetype.pactWhisperer.whisperingCovenant.avatar,
                focus: ["Psychic", "Disruption", "Manipulation"],
            } 
        }
    },
    resonanceWarden: {
        key: 'resonanceWarden',
        name: "Resonance Warden",
        icon: "cadence",
        description: "A master of cosmic frequencies who attunes to a world's core energies. They shape reality through vibration, forging impossible structures from pure sound and unleashing seismic disruptions to win through superior infrastructure.",
        legacies: {
            shatterWaveMandate: {
                key: 'shatterWaveMandate',
                name: 'Shatter-Wave Mandate',
                description: "Embodies the destructive potential of resonance. This legacy weaponizes the planet's dissonance, turning cosmic frequencies into devastating seismic weapons. They are not builders, but shapers of destruction, capable of shattering enemy defenses, collapsing supply lines, and breaking armies with a single, perfectly tuned shockwave.",
                birthrightKey: 'dissonantField',
                gambitKeys: ['orbitalNullificationBeam', 'worldEnderProtocol'],
                movie: ASSETS.archetype.resonanceWarden.shatterWaveMandate.movie,
                avatar: ASSETS.archetype.resonanceWarden.shatterWaveMandate.avatar,
                focus: ["Attunement", "Fortification", "Conduction"],
            },
            genesisForgeMandate: {
                key: 'genesisForgeMandate',
                name: 'Genesis Forge Mandate',
                description: "Focuses on the constructive aspect of the Warden's power. This legacy is about creation, attuning to the planet's harmony to build an unstoppable industrial and defensive base. They are the architects of the new world, raising impenetrable fortress and logistical marvels from the very bedrock through sonic engineering.",
                birthrightKey: 'genesisForge',
                gambitKeys: ['aegisProtocol', 'forgeGate'],
                movie: ASSETS.archetype.resonanceWarden.genesisForgeMandate.movie,
                avatar: ASSETS.archetype.resonanceWarden.genesisForgeMandate.avatar,
                focus: ["Attunement", "Fortification", "Harmony"],
            }
        }
    },
    labyrinthineGhost: {
        key: 'labyrinthineGhost',
        name: "Labyrinthine Ghost",
        icon: "hub",
        description: "A master of shadows and secrets who thrives on disruption. The Labyrinthine Ghost dismantles empires from within, using intelligence, sabotage, and covert operations to ensure their enemies defeat themselves.",
        legacies: {
            voidWalker: {
                key: 'voidWalker',
                name: 'Void Walker',
                description: "This legacy is focused on active sabotage. It is the ghost that lives within the enemy's machine, breaking their logistical chains, corrupting their commands, and sowing chaos within their systems. It doesn't need to see everything when it can ensure that nothing the enemy does works as intended.",
                birthrightKey: 'systemGlitch',
                gambitKeys: ['ghostInTheSystem', 'voidCordon'],
                movie: ASSETS.archetype.labyrinthineGhost.voidWalker.movie,
                avatar: ASSETS.archetype.labyrinthineGhost.voidWalker.avatar,
                focus: ["Infiltration", "Sabotage", "Disruption"],
            },
            karthianOracle: {
                key: 'karthianOracle',
                name: 'Karthian Oracle',
                description: "This legacy emphasizes total information control. It operates on the principle that to see all is to control all. Through a silent, invisible web of ghost-agents and data-daemons, the Panopticon knows the enemy's plans before they do, turning their own strategy against them with chilling precision.",
                birthrightKey: 'panopticonWeb',
                gambitKeys: ['labyrinth', 'quantumLoop'],
                movie: ASSETS.archetype.labyrinthineGhost.karthianOracle.movie,
                avatar: ASSETS.archetype.labyrinthineGhost.karthianOracle.avatar,
                focus: ["Espionage", "Secrets", "Disruption"],
            }
        }
    }
};