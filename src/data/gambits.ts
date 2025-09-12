import { EffectProfile } from '@/types/game.ts';

export const GAMBITS: { [key: string]: EffectProfile } = { // want to rename GAMBITS to ARCHETYPE
    // --- First Sword Gambits ---
    'celestial-annihilation': {
        key: 'celestial-annihilation',
        ui: {
            name: 'Celestial Annihilation',
            icon: 'flare',
            description: 'Call down a concentrated beam of orbital energy to obliterate a single target.',
            assets: {
                key: 'celestial-annihilation',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/first-sword-celestial-annihilation.jpg',
                sfxImpact: 'celestial-annihilation-impact',
                vfxImpact: 'celestial-annihilation-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'First Sword',
            legacy: 'Annihilation Doctrine',
            availability: 5,
            playstyle: 'Offensive',
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Orbital Strike',
                    description: "A concentrated beam of energy lances down from orbit, vaporizing defenses.",
                    effect: "Reduces the target enclave's forces by 60%.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'forceDamage', target: 'targetEnclave', damageType: 'percentage', value: 0.60 }
                    ]
                }
            }
        }
    },
    'war-fulcrum': {
        key: 'war-fulcrum',
        ui: {
            name: 'War Fulcrum',
            icon: 'settings_ethernet',
            description: 'Designate a single enclave as a nexus of war, supercharging its offensive capabilities for a limited time.',
            assets: {
                key: 'war-fulcrum',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/first-sword-war-fulcrum.jpg',
                sfxImpact: 'war-fulcrum-impact',
                vfxImpact: 'war-fulcrum-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'First Sword',
            legacy: 'Annihilation Doctrine',
            availability: 3,
            playstyle: 'Offensive',
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Inspiring Presence',
                    description: "The presence of the War Fulcrum inspires nearby troops, driving them to fight with unmatched zeal.",
                    effect: "Permanently increases the attack order force bonus of the target enclave by 1.",
                    duration: 'Permanent',
                    radius: 0,
                    rules: [
                        { type: 'statModifier', target: 'targetEnclave', stat: 'attack_order_force_bonus', value: 1, duration: 'permanent' }
                    ]
                }
            }
        }
    },
    'shatterpoint-strike': {
        key: 'shatterpoint-strike',
        ui: {
            name: 'Shatterpoint Strike',
            icon: 'bolt',
            description: 'Exploit a critical weakness in an enemy enclave\'s defenses, causing cascading failures.',
            assets: {
                key: 'shatterpoint-strike',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/first-sword-shatterpoint-strike.jpg',
                sfxImpact: 'shatterpoint-strike-impact',
                vfxImpact: 'shatterpoint-strike-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'First Sword',
            legacy: 'Warlord\'s Ascendancy',
            availability: 4,
            playstyle: 'Offensive',
            targeting: {
                targetType: 'Friendly Enclave with an active Attack order.',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Overcharged Attack',
                    description: "The enclave's attack is supercharged, focusing all available power into a single, devastating blow.",
                    effect: "Doubles the attack power of the target enclave for this turn.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'statModifier', target: 'targetEnclave', stat: 'attack_order_multiplier', value: 2 }
                    ]
                }
            }
        }
    },
    'trans-dimensional-armory': {
        key: 'trans-dimensional-armory',
        ui: {
            name: 'Trans-Dimensional Armory',
            icon: 'widgets',
            description: 'Open a temporary rift to an alternate reality where your forces are better equipped, bolstering all friendly enclaves.',
            assets: {
                key: 'trans-dimensional-armory',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/first-sword-trans-dimensional-armory.jpg',
                sfxImpact: 'trans-dimensional-armory-impact',
                vfxImpact: 'trans-dimensional-armory-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'First Sword',
            legacy: 'Warlord\'s Ascendancy',
            availability: 6,
            playstyle: 'Utility',
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Weapon Enhancement',
                    description: "Weapons are augmented with otherworldly technology, granting them a permanent edge in battle.",
                    effect: "Permanently increases the combat bonus of the target enclave by 1.",
                    duration: 'Permanent',
                    radius: 0,
                    rules: [
                        { type: 'statModifier', target: 'targetEnclave', stat: 'combat_bonus', value: 1, duration: 'permanent' }
                    ]
                }
            }
        }
    },

    // --- Pact Whisperer Gambits ---
    'soul-forging': {
        key: 'soul-forging',
        ui: {
            name: 'Soul Forging',
            icon: 'join_inner',
            description: 'Forge a psychic link between two friendly enclaves, allowing them to instantly share forces.',
            assets: {
                key: 'soul-forging',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/pact-whisperer-soul-forging.jpg',
                sfxImpact: 'soul-forging-impact',
                vfxImpact: 'soul-forging-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Pact Whisperer',
            legacy: 'Voidsworn Covenant',
            availability: 4,
            playstyle: 'Utility',
            targeting: {
                targetType: 'Two Enclaves',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Psychic Conversion',
                    description: "Enemy wills are shattered and reforged, turning foes into loyal soldiers for your cause.",
                    effect: "Reduces the target enemy enclave's forces by 15 and adds 15 forces to your capital.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'forceDamage', target: 'targetEnclave', damageType: 'flat', value: 15 },
                        { type: 'gainForces', target: 'capitalEnclave', value: 15 }
                    ]
                }
            }
        }
    },
    'void-untethering': {
        key: 'void-untethering',
        ui: {
            name: 'Void Untethering',
            icon: 'hub',
            description: 'Temporarily sever an enemy enclave\'s connection to reality, cutting it off from all support.',
            assets: {
                key: 'void-untethering',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/pact-whisperer-void-untethering.jpg',
                sfxImpact: 'void-untethering-impact',
                vfxImpact: 'void-untethering-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Pact Whisperer',
            legacy: 'Voidsworn Covenant',
            availability: 5,
            playstyle: 'Utility',
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Void Isolation',
                    description: "Psionic tendrils reach across the void, severing all connections and isolating the opponent's empire.",
                    effect: "Disables all routes on the map for 3 turns.",
                    duration: 3,
                    radius: 'Global',
                    rules: [
                        { type: 'disableRoutes', target: 'global', duration: 3 }
                    ]
                }
            }
        }
    },
    'whispers-from-the-void': {
        key: 'whispers-from-the-void',
        ui: {
            name: 'Whispers from the Void',
            icon: 'hearing',
            description: 'Broadcast a memetic plague that turns a neutral enclave against your opponent.',
            assets: {
                key: 'whispers-from-the-void',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/pact-whisperer-whispers-from-the-void.jpg',
                sfxImpact: 'whispers-from-the-void-impact',
                vfxImpact: 'whispers-from-the-void-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Pact Whisperer',
            legacy: 'Whispering Covenant',
            availability: 3,
            playstyle: 'Offensive',
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Psionic Disruption',
                    description: "Maddening whispers echo in the minds of the enemy leadership, sowing chaos and disrupting production.",
                    effect: "Reduces the target enclave's production by 50% for 4 turns.",
                    duration: 4,
                    radius: 0,
                    rules: [
                        { type: 'statModifier', target: 'targetEnclave', stat: 'production', value: 0.50 }
                    ]
                }
            }
        }
    },
    'data-shroud': {
        key: 'data-shroud',
        ui: {
            name: 'Data Shroud',
            icon: 'visibility_off',
            description: 'Create a shroud of psychic static around your enclaves, hiding your force counts from your opponent.',
            assets: {
                key: 'data-shroud',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/pact-whisperer-data-shroud.jpg',
                sfxImpact: 'data-shroud-impact',
                vfxImpact: 'data-shroud-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Pact Whisperer',
            legacy: 'Whispering Covenant',
            availability: 2,
            playstyle: 'Defensive',
            targeting: {
                targetType: 'All Enclaves',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Information Blackout',
                    description: "A cloak of static and ghost signals descends, masking all force movements from enemy sensors.",
                    effect: "Hides your force counts from the opponent for 3 turns.",
                    duration: 3,
                    radius: 'Global',
                    rules: [
                        { type: 'hideForceCounts', target: 'opponent', duration: 3 }
                    ]
                }
            }
        }
    },
    
    // --- Resonance Warden Gambits ---
    'orbital-nullification-beam': {
        key: 'orbital-nullification-beam',
        ui: {
            name: 'Orbital Nullification Beam',
            icon: 'settings_input_svideo',
            description: 'Fire a satellite weapon that creates a dead zone, preventing any enclave from holding its position.',
            assets: {
                key: 'orbital-nullification-beam',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/resonance-warden-orbital-nullification-beam.jpg',
                sfxImpact: 'orbital-nullification-beam-impact',
                vfxImpact: 'orbital-nullification-beam-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Resonance-Warden',
            legacy: 'Shatter-Wave Mandate',
            availability: 5,
            playstyle: 'Utility',
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Gambit Cancel',
                    description: "A precise energy beam from orbit targets and unravels the opponent's complex strategic maneuvers.",
                    effect: "Cancels an active Gambit order on the target enclave.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'cancelOrder', target: 'targetEnclave', orderType: 'Gambit' }
                    ]
                }
            }
        }
    },
    'world-ender-protocol': {
        key: 'world-ender-protocol',
        ui: {
            name: 'World-Ender Protocol',
            icon: 'public_off',
            description: 'Initiate a resonance cascade that permanently destroys a route, reshaping the battlefield.',
            assets: {
                key: 'world-ender-protocol',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/resonance-warden-world-ender-protocol.jpg',
                sfxImpact: 'world-ender-protocol-impact',
                vfxImpact: 'world-ender-protocol-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Resonance-Warden',
            legacy: 'Shatter-Wave Mandate',
            availability: 8,
            playstyle: 'Utility',
            targeting: {
                targetType: 'Single Route',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Self-Destruct',
                    description: "The enclave's core goes critical, unleashing a self-destructive blast of apocalyptic power.",
                    effect: "Destroys all forces at the target enclave and reduces forces in all adjacent enclaves by 50%.",
                    duration: 1,
                    radius: 1,
                    rules: [
                        { type: 'setForces', target: 'targetEnclave', value: 0 },
                        { type: 'forceDamage', target: 'adjacentEnclaves', damageType: 'percentage', value: 0.50 }
                    ]
                }
            }
        }
    },
    'aegis-protocol': {
        key: 'aegis-protocol',
        ui: {
            name: 'Aegis Protocol',
            icon: 'security',
            description: 'Erect an impenetrable resonant shield around a single enclave, making it immune to all harm.',
            assets: {
                key: 'aegis-protocol',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/resonance-warden-aegis-protocol.jpg',
                sfxImpact: 'aegis-protocol-impact',
                vfxImpact: 'aegis-protocol-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Resonance-Warden',
            legacy: 'Genesis Forge Mandate',
            availability: 6,
            playstyle: 'Defensive',
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Total Lockdown',
                    description: "Towering energy shields erupt around the enclave, creating an impenetrable fortress.",
                    effect: "Makes the target enclave immune to attacks for 2 turns.",
                    duration: 2,
                    radius: 0,
                    rules: [
                        { type: 'statModifier', target: 'targetEnclave', stat: 'cannot_be_attacked', value: true, duration: 2 }
                    ]
                }
            }
        }
    },
    'forge-links': {
        key: 'forge-links',
        ui: {
            name: 'Forge Links',
            icon: 'link',
            description: 'Create a temporary, unbreakable supply line between all your enclaves, allowing for perfect reinforcement.',
            assets: {
                key: 'forge-links',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/resonance-warden-forge-links.jpg',
                sfxImpact: 'forge-links-impact',
                vfxImpact: 'forge-links-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Resonance-Warden',
            legacy: 'Genesis Forge Mandate',
            availability: 7,
            playstyle: 'Utility',
            targeting: {
                targetType: 'All Enclaves',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Route Construction',
                    description: "Automated construction drones forge new, permanent pathways between allied territories.",
                    effect: "Creates 2 new routes from the target enclave to the nearest unconnected friendly enclaves.",
                    duration: 'Permanent',
                    radius: 0,
                    rules: [
                        { type: 'createRoutes', target: 'targetEnclave', count: 2, connectionType: 'nearestUnconnectedFriendly' }
                    ]
                }
            }
        }
    },

    // --- Labyrinthine Ghost Gambits ---
    'ghost-in-the-system': {
        key: 'ghost-in-the-system',
        ui: {
            name: 'Ghost in the System',
            icon: 'bug_report',
            description: 'Insert a data-daemon into the enemy\'s command network, causing their next order to fail catastrophically.',
            assets: {
                key: 'ghost-in-the-system',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/labyrinthine-ghost-ghost-in-the-system.jpg',
                sfxImpact: 'ghost-in-the-system-impact',
                vfxImpact: 'ghost-in-the-system-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Labyrinthine Ghost',
            legacy: 'Void Walker',
            availability: 4,
            playstyle: 'Utility',
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Order Intercept',
                    description: "A ghost signal intercepts and corrupts an incoming enemy command, neutralizing the threat before it materializes.",
                    effect: "Cancels an incoming Attack or Assist order targeting the enclave.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'cancelOrder', target: 'incomingOrder', orderType: 'Attack' },
                        { type: 'cancelOrder', target: 'incomingOrder', orderType: 'Assist' }
                    ]
                }
            }
        }
    },
    'void-cordon': {
        key: 'void-cordon',
        ui: {
            name: 'Void Cordon',
            icon: 'block',
            description: 'Erect a temporary quarantine around an enemy enclave, preventing any forces from entering or leaving.',
            assets: {
                key: 'void-cordon',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/labyrinthine-ghost-void-cordon.jpg',
                sfxImpact: 'void-cordon-impact',
                vfxImpact: 'void-cordon-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Labyrinthine Ghost',
            legacy: 'Void Walker',
            availability: 6,
            playstyle: 'Defensive',
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Sea Route Disruption',
                    description: "A barrier of null-energy extends across the void, cutting off all sea-based travel and supply lines.",
                    effect: "Disables all sea routes for 2 turns.",
                    duration: 2,
                    radius: 'Global',
                    rules: [
                        { type: 'disableRoutes', target: 'seaRoutes', duration: 2 }
                    ]
                }
            }
        }
    },
    'labyrinth': {
        key: 'labyrinth',
        ui: {
            name: 'Labyrinth',
            icon: 'crossword',
            description: 'Feed false intelligence to the enemy, causing one of their attack orders to be redirected to an adjacent, random target.',
            assets: {
                key: 'labyrinth',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/labyrinthine-ghost-labyrinth.jpg',
                sfxImpact: 'labyrinth-impact',
                vfxImpact: 'labyrinth-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Labyrinthine Ghost',
            legacy: 'Karthian Oracle',
            availability: 5,
            playstyle: 'Utility',
            targeting: {
                targetType: 'Single Order',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Route Scramble',
                    description: "Reality warps and shifts, twisting a vital supply route into an impassable maze of dead ends.",
                    effect: "Disables the target route for 2 turns.",
                    duration: 2,
                    radius: 0,
                    rules: [
                        { type: 'disableRoutes', payload: { target: 'targetRoute', duration: 2 } }
                    ]
                }
            }
        }
    },
    'quantum-loop': {
        key: 'quantum-loop',
        ui: {
            name: 'Quantum Loop',
            icon: 'sync',
            description: 'Trap an enemy enclave in a time-distorting quantum loop, forcing it to repeat its last action.',
            assets: {
                key: 'quantum-loop',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/labyrinthine-ghost-quantum-loop.jpg',
                sfxImpact: 'quantum-loop-impact',
                vfxImpact: 'quantum-loop-impact',
            }
        },
        logic: {
            category: 'Archetype',
            archetype: 'Labyrinthine Ghost',
            legacy: 'Karthian Oracle',
            availability: 7,
            playstyle: 'Utility',
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Locked Order',
                    description: "The enemy's attack is trapped in a repeating time loop, forcing them to commit to the assault.",
                    effect: "Locks the attacking enclave's order for 3 turns, preventing it from being changed.",
                    duration: 3,
                    radius: 0,
                    rules: [
                        { type: 'lockOrder', target: 'attackingEnclave', duration: 3 }
                    ]
                }
            }
        }
    },
};

export const COMMON_GAMBITS: { [key: string]: EffectProfile } = { // want to rename COMMON_GAMBITS to COMMON
    'flesh-weavers-harvest': {
        key: 'flesh-weavers-harvest',
        ui: {
            name: "Flesh-Weaver's Harvest",
            icon: 'person_add',
            description: 'A dark ritual is performed on a neutral enclave, converting its raw biological mass into a brutal, new fighting force for your cause.',
            assets: {
                key: 'flesh-weavers-harvest',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/common-flesh-weavers-harvest.jpg',
                sfxImpact: 'flesh-weavers-harvest-impact',
                vfxImpact: 'flesh-weavers-harvest-impact',
            }
        },
        logic: {
            category: 'Common',
            availability: 5,
            playstyle: 'Offensive',
            targeting: {
                targetType: 'Neutral Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Force Conversion',
                    description: "The enclave's population is twisted and reshaped into a new fighting force, loyal only to their creator.",
                    effect: "Converts a neutral enclave to your control with 20 forces.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'convertEnclave', target: 'targetEnclave', toOwner: 'friendly', forces: 20 }
                    ]
                }
            }
        }
    },
    'off-world-mercenaries': {
        key: 'off-world-mercenaries',
        ui: {
            name: 'Off-World Mercenaries',
            icon: 'rocket',
            description: 'The Archetype contacts nearby star-systems, leveraging their massive wealth to secure a temporary, powerful infusion of veteran off-world forces.',
            assets: {
                key: 'off-world-mercenaries',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/common-off-world-mercenaries.jpg',
                sfxImpact: 'off-world-mercenaries-impact',
                vfxImpact: 'off-world-mercenaries-impact',
            }
        },
        logic: {
            category: 'Common',
            availability: 11,
            playstyle: 'Defensive',
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Mercenary Arrival',
                    description: "Drop-pods scream through the atmosphere, delivering a hardened company of veteran soldiers to the battlefield.",
                    effect: "Adds 50 forces to the target friendly enclave.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'gainForces', target: 'targetEnclave', value: 50 }
                    ]
                }
            }
        }
    },
    'orbital-bombardment': {
        key: 'orbital-bombardment',
        ui: {
            name: 'Orbital Bombardment',
            icon: 'scatter_plot',
            description: 'A catastrophic failure in an orbiting weapon platform sends a hail of metallic shrapnel screaming towards the planet\'s surface, striking random enclaves with devastating force.',
            assets: {
                key: 'orbital-bombardment',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/common-orbital-bombardment.jpg',
                sfxImpact: 'orbital-bombardment-impact',
                vfxImpact: 'orbital-bombardment-impact',
            }
        },
        logic: {
            category: 'Common',
            availability: 8,
            playstyle: 'Offensive',
            targeting: {
                targetType: 'Self',
                siteCount: 5,
            },
            phases: {
                impact: {
                    name: 'Shrapnel Strike',
                    description: "A random volley of kinetic strikes rains down from a decaying satellite, blasting multiple sites indiscriminately.",
                    effect: "Reduces forces by 50% at 5 random enclaves.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'forceDamage', target: 'affectedEnclaves', damageType: 'percentage', value: 0.50 }
                    ]
                }
            }
        }
    },
    'scorched-earth': {
        key: 'scorched-earth',
        ui: {
            name: 'Scorched Earth',
            icon: 'bomb',
            description: 'In a final act of defiance, all remaining forces are detonated, destroying the territory to prevent the opponent from capturing it. All routes to and from it are fused and destroyed, preventing any further use of the territory.',
            assets: {
                key: 'scorched-earth',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/common-scorched-earth.jpg',
                sfxImpact: 'scorched-earth-impact',
                vfxImpact: 'scorched-earth-impact',
            }
        },
        logic: {
            category: 'Common',
            availability: 5,
            playstyle: 'Defensive',
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Final Act',
                    description: "The enclave's core goes critical, unleashing a self-destructive blast of apocalyptic power.",
                    effect: "Destroys all forces, converts the enclave to neutral, and destroys all connected routes.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'setForces', target: 'targetEnclave', value: 0 },
                        { type: 'convertEnclave', target: 'targetEnclave', toOwner: 'neutral' },
                        { type: 'destroyRoutes', target: 'targetEnclave' }
                    ]
                }
            }
        }
    },
    'the-calling': {
        key: 'the-calling',
        ui: {
            name: 'The Calling',
            icon: 'podcasts',
            description: 'A powerful psionic hymn is broadcast, calling a random neutral enclave to your cause as if by ancient prophecy.',
            assets: {
                key: 'the-calling',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/common-the-calling.jpg',
                sfxImpact: 'the-calling-impact',
                vfxImpact: 'the-calling-impact',
            }
        },
        logic: {
            category: 'Common',
            availability: 4,
            playstyle: 'Utility',
            targeting: {
                targetType: 'Self',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Psionic Call',
                    description: "An irresistible psionic call radiates outwards, drawing a neutral territory and its people to your banner.",
                    effect: "Converts a random neutral enclave to your control with 5 forces.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'convertEnclave', target: 'randomNeutralEnclave', toOwner: 'friendly', forces: 5 }
                    ]
                }
            }
        }
    },
    'the-witching-hour': {
        key: 'the-witching-hour',
        ui: {
            name: 'The Witching Hour',
            icon: 'magic_button',
            description: 'Ancient magicks, long dormant in the world\'s core, are called upon to manifest a disaster of your choosing. The chaotic forces of nature are brought to bear against a single target.',
            assets: {
                key: 'the-witching-hour',
                image: 'https://storage.googleapis.com/brutal-worlds/gambit/common-the-witching-hour.jpg',
                sfxImpact: 'the-witching-hour-impact',
                vfxImpact: 'the-witching-hour-impact',
            }
        },
        logic: {
            category: 'Common',
            availability: 8,
            playstyle: 'Offensive',
            targeting: {
                targetType: 'Enemy Enclave',
                siteCount: 1,
            },
            phases: {
                impact: {
                    name: 'Summon Disaster',
                    description: "Arcane energies are channeled, tearing open a rift to summon a chaotic, destructive force upon your foe.",
                    effect: "Summons a random disaster at the target enemy enclave.",
                    duration: 1,
                    radius: 0,
                    rules: [
                        { type: 'summonDisaster', target: 'targetEnclave', disasterKey: 'any' }
                    ]
                }
            }
        }
    }
};