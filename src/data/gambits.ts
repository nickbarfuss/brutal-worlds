import { EffectProfile } from '@/types/game.ts';
import { ASSETS } from '@/data/assets.ts';

export const ARCHETYPE_PROFILES: { [key: string]: EffectProfile } = {
    // First Sword Gambits
    'celestial-annihilation': {
        key: 'celestial-annihilation',
        ui: {
            name: 'Celestial Annihilation',
            icon: 'flare',
            description: 'Call down a concentrated beam of orbital energy to obliterate a single target.',
            assets: {
                key: 'celestial-annihilation',
                image: ASSETS.gambit.celestialAnnihilation.image,
                sfx: {
                    impact: ASSETS.gambit.celestialAnnihilation.sfx.impact, 
                },
                vfx: {
                    impact: ASSETS.gambit.celestialAnnihilation.vfx.impact,  
                },
                dialog: {
                    impact: ASSETS.gambit.celestialAnnihilation.dialog.impact,
                }
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
                image: ASSETS.gambit.warFulcrum.image,
                sfx: {
                    impact: ASSETS.gambit.warFulcrum.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.warFulcrum.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.warFulcrum.dialog.impact,
                }
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
                image: ASSETS.gambit.shatterpointStrike.image,
                sfx: {
                    impact: ASSETS.gambit.shatterpointStrike.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.shatterpointStrike.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.shatterpointStrike.dialog.impact,
                }
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
                image: ASSETS.gambit.transDimensionalArmory.image,
                sfx: {
                    impact: ASSETS.gambit.transDimensionalArmory.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.transDimensionalArmory.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.transDimensionalArmory.dialog.impact,
                }
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

    // Pact Whisperer Gambits
    'soul-forging': {
        key: 'soul-forging',
        ui: {
            name: 'Soul Forging',
            icon: 'join_inner',
            description: 'Forge a psychic link between two friendly enclaves, allowing them to instantly share forces.',
            assets: {
                key: 'soul-forging',
                image: ASSETS.gambit.soulForging.image,
                sfx: {
                    impact: ASSETS.gambit.soulForging.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.soulForging.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.soulForging.dialog.impact,
                }
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
                image: ASSETS.gambit.voidUntethering.image,
                sfx: {
                    impact: ASSETS.gambit.voidUntethering.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.voidUntethering.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.voidUntethering.dialog.impact,
                }
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
                image: ASSETS.gambit.whispersFromTheVoid.image,
                sfx: {
                    impact: ASSETS.gambit.whispersFromTheVoid.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.whispersFromTheVoid.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.whispersFromTheVoid.dialog.impact,
                }
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
                image: ASSETS.gambit.dataShroud.image,
                sfx: {
                    impact: ASSETS.gambit.dataShroud.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.dataShroud.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.dataShroud.dialog.impact,
                }
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
    
    // Resonance Warden Gambits
    'orbital-nullification-beam': {
        key: 'orbital-nullification-beam',
        ui: {
            name: 'Orbital Nullification Beam',
            icon: 'settings_input_svideo',
            description: 'Fire a satellite weapon that creates a dead zone, preventing any enclave from holding its position.',
            assets: {
                key: 'orbital-nullification-beam',
                image: ASSETS.gambit.orbitalNullificationBeam.image,
                sfx: {
                    impact: ASSETS.gambit.orbitalNullificationBeam.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.orbitalNullificationBeam.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.orbitalNullificationBeam.dialog
                }
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
                image: ASSETS.gambit.worldEnderProtocol.image,
                sfx: {
                    impact: ASSETS.gambit.worldEnderProtocol.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.worldEnderProtocol.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.worldEnderProtocol.dialog.impact,
                }
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
                image: ASSETS.gambit.aegisProtocol.image,
                sfx: {
                    impact: ASSETS.gambit.aegisProtocol.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.aegisProtocol.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.aegisProtocol.dialog.impact,
                }
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
                image: ASSETS.gambit.forgeLinks.image,
                sfx: {
                    impact: ASSETS.gambit.forgeLinks.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.forgeLinks.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.forgeLinks.dialog.impact,
                }
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

    // Labyrinthine Ghost Gambits
    'ghost-in-the-system': {
        key: 'ghost-in-the-system',
        ui: {
            name: 'Ghost in the System',
            icon: 'bug_report',
            description: 'Insert a data-daemon into the enemy\'s command network, causing their next order to fail catastrophically.',
            assets: {
                key: 'ghost-in-the-system',
                image: ASSETS.gambit.ghostInTheSystem.image,
                 sfx: {
                    impact: ASSETS.gambit.ghostInTheSystem.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.ghostInTheSystem.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.ghostInTheSystem.dialog.impact,
                }
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
                image: ASSETS.gambit.voidCordon.image,
                 sfx: {
                    impact: ASSETS.gambit.voidCordon.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.voidCordon.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.voidCordon.dialog.impact,
                }
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
                image: ASSETS.gambit.labyrinth.image,
                 sfx: {
                    impact: ASSETS.gambit.labyrinth.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.labyrinth.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.labyrinth.dialog.impact,
                }
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
                image: ASSETS.gambit.quantumLoop.image,
                 sfx: {
                    impact: ASSETS.gambit.quantumLoop.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.quantumLoop.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.quantumLoop.dialog.impact,
                }
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

export const COMMON_PROFILES: { [key: string]: EffectProfile } = {
    'flesh-weavers-harvest': {
        key: 'flesh-weavers-harvest',
        ui: {
            name: "Flesh-Weaver's Harvest",
            icon: 'person_add',
            description: 'A dark ritual is performed on a neutral enclave, converting its raw biological mass into a brutal, new fighting force for your cause.',
            assets: {
                key: 'flesh-weavers-harvest',
                image: ASSETS.gambit.fleshWeaversHarvest.image,
                sfx: {
                    impact: ASSETS.gambit.fleshWeaversHarvest.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.fleshWeaversHarvest.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.fleshWeaversHarvest.dialog.impact,
                }
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
                image: ASSETS.gambit.offWorldMercenaries.image,
                 sfx: {
                    impact: ASSETS.gambit.offWorldMercenaries.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.offWorldMercenaries.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.offWorldMercenaries.dialog.impact,
                }
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
                image: ASSETS.gambit.orbitalBombardment.image,
                 sfx: {
                    impact: ASSETS.gambit.orbitalBombardment.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.orbitalBombardment.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.orbitalBombardment.dialog.impact,
                }
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
                image: ASSETS.gambit.scorchedEarth.image,
                sfx: {
                    impact: ASSETS.gambit.scorchedEarth.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.scorchedEarth.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.scorchedEarth.dialog.impact,
                }
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
                image: ASSETS.gambit.theCalling.image,
                sfx: {
                    impact: ASSETS.gambit.theCalling.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.theCalling.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.theCalling.dialog.impact,
                }
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
                image: ASSETS.gambit.theWitchingHour.image,
                sfx: {
                    impact: ASSETS.gambit.theWitchingHour.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.theWitchingHour.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.theWitchingHour.dialog.impact,
                }
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