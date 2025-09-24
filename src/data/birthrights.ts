import { BirthrightProfile } from '@/features/birthrights/birthrights.types';
import { ASSETS } from '@/data/assets';


export const BIRTHRIGHTS: { [key: string]: BirthrightProfile } = {
   // First Sword
   kineticOnslaught: {
       key: 'kineticOnslaught',
       name: "Kinetic Onslaught",
       icon: "motion_blur",
       description: "By mastering the physics of force projection, these forces strike with a relentless rhythm, conserving energy to maintain a constant, overwhelming offensive.",
       rules: `+1 combat bonus on all "Attack" orders.`,
       image: ASSETS.birthright.kineticOnslaught.image,
   },
   imperialDecree: {
       name: "Imperial Decree",
       key: 'imperialDecree',
       icon: "verified_user",
       description: "The Warlord's decree echoes from the capital, a declaration of divine right to rule. This imperial mandate inspires unwavering loyalty and draws warriors to the throne, strengthening the heart of the empire with each passing moment.",
       rules: "Starting enclaves gain +1 force each turn when attacking or assisting.",
       image: ASSETS.birthright.imperialDecree.image,
   },
   // Pact Whisperer
   memeticResonance: {
       key: 'memeticResonance',
       name: "Memetic Resonance",
       icon: "monitor_heart",
       description: "A powerful cultural signal projects from controlled enclaves, subtly influencing the development of neutral enclaves and weakening its population centers.",
       rules: "Neutral enclaves adjacent to any friendly enclaves lose 1 force each turn.",
       image: ASSETS.birthright.memeticResonance.image,
   },
   psychicWarfare: {
       key: 'psychicWarfare',
       name: "Psychic Warfare",
       icon: "psychology",
       description: "The Whisperer projects a constant psionic signal that agitates the unaligned. Neutral populations near the enemy arm themselves out of paranoia and fear, making them unexpectedly resilient to conquest.",
       rules: "Neutral enclaves adjacent to any opponent enclaves gain 1 force each turn.",
       image: ASSETS.birthright.psychicWarfare.image,
   },
   // Resonance Warden
   dissonantField: {
       key: 'dissonantField',
       name: "Dissonant field",
       icon: "surround_sound",
       description: "The Warden projects a low-frequency dissonant field around fortified positions. This disruptive hum interferes with enemy targeting systems and scrambles command frequencies, nullifying the tactical advantages of a coordinated assault.",
       rules: "Attacks agains holding enclaves do not receive the standard +1 combat bonus.",
       image: ASSETS.birthright.dissonantField.image,
   },
   genesisForge: {
       key: 'genesisForge',
       name: "Genesis Forge",
       icon: "build_circle",
       description: "The Warden attunes a holding enclave to the world's core harmony. This resonant frequency acts as a sonic forge, accelerating force production and solidifying defenses through pure vibration.",
       rules: "Holding enclaves generate additional +1 force each turn.",
       image: ASSETS.birthright.genesisForge.image,
   },
   // Labyrinthine Ghost
   systemGlitch: {
       key: 'systemGlitch',
       name: "System Glitch",
       icon: "network_check",
       description: "The Ghost seeds the global network with data-daemons that randomly disrupt enemy logistics, causing unexpected delays and communication breakdowns.",
       rules: "50% chance each turn to disable a random enemy route.",
       image: ASSETS.birthright.systemGlitch.image,
   },
   panopticonWeb: {
       key: 'panopticonWeb',
       name: "Panopticon Web",
       icon: "visibility",
       description: "An invisible web of data streams and ghost-agents blankets the globe. Each turn, an agent penetrates the enemy's security net, feeding you a vital piece of their strategic disposition.",
       rules: "Enemy encalves adjacent to two or more of your enclaves lose 1 force each turn.",
       image: ASSETS.birthright.panopticonWeb.image,
   },
};