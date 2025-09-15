import { GambitProfile } from '@/types/game.ts';
import { ASSETS } from '@/data/assets.ts';

export const GAMBITS: Record<string, GambitProfile> = {
    // First Sword Gambits
    celestialAnnihilation: {
        key: 'celestialAnnihilation',
        ui: {
            name: 'Celestial Annihilation',
            icon: 'flare',
            description: 'Call down a concentrated beam of orbital energy to obliterate a single target.',
            assets: {
                key: 'celestialAnnihilation',
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
            },
        },
        logic: {
            archetypeKey: 'firstSword',
            legacyKey: 'annihilationDoctrine',
            availability: 5,
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Orbital Strike',
                description: "A concentrated beam of energy lances down from orbit, vaporizing defenses.",
                effect: "Reduces the target enclave's forces by 60%.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'forceDamage', payload: { target: 'targetEnclave', damageType: 'percentage', value: 0.60 } }
                ]
            }
        }
    },
    warFulcrum: {
        key: 'warFulcrum',
        ui: {
            name: 'War Fulcrum',
            icon: 'settings_ethernet',
            description: 'Designate a single enclave as a nexus of war, supercharging its offensive capabilities for a limited time.',
            assets: {
                key: 'warFulcrum',
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
            archetypeKey: 'firstSword',
            legacyKey: 'annihilationDoctrine',
            availability: 3,
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Inspiring Presence',
                description: "The presence of the War Fulcrum inspires nearby troops, driving them to fight with unmatched zeal.",
                effect: "Permanently increases the attack order force bonus of the target enclave by 1.",
                duration: 'Permanent',
                radius: 0,
                rules: [
                    { type: 'statModifier', payload: { target: 'targetEnclave', stat: 'attack_order_force_bonus', value: 1, duration: 'permanent' } }
                ]
            },
        }
    },
    shatterpointStrike: {
        key: 'shatterpointStrike',
        ui: {
            name: 'Shatterpoint Strike',
            icon: 'bolt',
            description: `Exploit a critical weakness in an enemy enclave's defenses, causing cascading failures.`,
            assets: {
                key: 'shatterpointStrike',
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
            archetypeKey: 'firstSword',
            legacyKey: 'warlordsAscendancy',
            availability: 4,
            targeting: {
                targetType: 'Friendly Enclave with an active Attack order.',
                siteCount: 1,
            },
            impact: {
                name: 'Overcharged Attack',
                description: "The enclave's attack is supercharged, focusing all available power into a single, devastating blow.",
                effect: "Doubles the attack power of the target enclave for this turn.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'statModifier', payload: { target: 'targetEnclave', stat: 'attack_order_multiplier', value: 2 } }
                ]
            }
        }
    },
    transDimensionalArmory: {
        key: 'transDimensionalArmory',
        ui: {
            name: 'Trans-Dimensional Armory',
            icon: 'widgets',
            description: 'Open a temporary rift to an alternate reality where your forces are better equipped, bolstering all friendly enclaves.',
            assets: {
                key: 'transDimensionalArmory',
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
            archetypeKey: 'firstSword',
            legacyKey: 'warlordsAscendancy',
            availability: 6,
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Weapon Enhancement',
                description: "Weapons are augmented with otherworldly technology, granting them a permanent edge in battle.",
                effect: "Permanently increases the combat bonus of the target enclave by 1.",
                duration: 'Permanent',
                radius: 0,
                rules: [
                    { type: 'statModifier', payload: { target: 'targetEnclave', stat: 'combat_bonus', value: 1, duration: 'permanent' } }
                ]
            }
        }
    },

    // Pact Whisperer Gambits
    soulForging: {
        key: 'soulForging',
        ui: {
            name: 'Soul Forging',
            icon: 'join_inner',
            description: 'Forge a psychic link between two friendly enclaves, allowing them to instantly share forces.',
            assets: {
                key: 'soulForging',
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
            archetypeKey: 'pactWhisperer',
            legacyKey: 'voidswornCovenant',
            availability: 4,
            targeting: {
                targetType: 'Two Enclaves',
                siteCount: 1,
            },
            impact: {
                name: 'Psychic Conversion',
                description: "Enemy wills are shattered and reforged, turning foes into loyal soldiers for your cause.",
                effect: "Reduces the target enemy enclave's forces by 15 and adds 15 forces to your capital.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'forceDamage', payload: { target: 'targetEnclave', damageType: 'flat', value: 15 } },
                    { type: 'gainForces', payload: { target: 'capitalEnclave', value: 15 } }
                ]
            },
        }
    },
    voidUntethering: {
        key: 'voidUntethering',
        ui: {
            name: 'Void Untethering',
            icon: 'hub',
            description: `Temporarily sever an enemy enclave's connection to reality, cutting it off from all support.`,
            assets: {
                key: 'voidUntethering',
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
            },
        },
        logic: {
            archetypeKey: 'pactWhisperer',
            legacyKey: 'voidswornCovenant',
            availability: 5,
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Void Isolation',
                description: "Psionic tendrils reach across the void, severing all connections and isolating the opponent's empire.",
                effect: "Disables all routes on the map for 3 turns.",
                duration: 3,
                radius: 'Global',
                rules: [
                    { type: 'routeDisable', payload: { target: 'global', duration: 3 } }
                ]
            },
        }
    },
    whispersFromTheVoid: {
        key: 'whispersFromTheVoid',
        ui: {
            name: 'Whispers from the Void',
            icon: 'hearing',
            description: 'Broadcast a memetic plague that turns a neutral enclave against your opponent.',
            assets: {
                key: 'whispersFromTheVoid',
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
            },
        },
        logic: {
            archetypeKey: 'pactWhisperer',
            legacyKey: 'whisperingCovenant',
            availability: 3,
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Psionic Disruption',
                description: "Maddening whispers echo in the minds of the enemy leadership, sowing chaos and disrupting production.",
                effect: "Reduces the target enclave's production by 50% for 4 turns.",
                duration: 4,
                radius: 0,
                rules: [
                    { type: 'statModifier', payload: { target: 'targetEnclave', stat: 'production', value: 0.50 } }
                ]
            },
        }
    },
    dataShroud: {
        key: 'dataShroud',
        ui: {
            name: 'Data Shroud',
            icon: 'visibility_off',
            description: 'Create a shroud of psychic static around your enclaves, hiding your force counts from your opponent.',
            assets: {
                key: 'dataShroud',
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
            archetypeKey: 'pactWhisperer',
            legacyKey: 'whisperingCovenant',
            availability: 2,
            targeting: {
                targetType: 'All Enclaves',
                siteCount: 1,
            },
            impact: {
                name: 'Information Blackout',
                description: "A cloak of static and ghost signals descends, masking all force movements from enemy sensors.",
                effect: "Hides your force counts from the opponent for 3 turns.",
                duration: 3,
                radius: 'Global',
                rules: [
                    { type: 'hideForceCounts', payload: { target: 'opponent', duration: 3 } }
                ]
            },
        }
    },
    
    // Resonance Warden Gambits
    orbitalNullificationBeam: {
        key: 'orbitalNullificationBeam',
        ui: {
            name: 'Orbital Nullification Beam',
            icon: 'settings_input_svideo',
            description: 'Fire a satellite weapon that creates a dead zone, preventing any enclave from holding its position.',
            assets: {
                key: 'orbitalNullificationBeam',
                image: ASSETS.gambit.orbitalNullificationBeam.image,
                sfx: {
                    impact: ASSETS.gambit.orbitalNullificationBeam.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.orbitalNullificationBeam.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.orbitalNullificationBeam.dialog.impact
                }
            }
        },
        logic: {
            archetypeKey: 'resonanceWarden',
            legacyKey: 'shatterWaveMandate',
            availability: 5,
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Gambit Cancel',
                description: "A precise energy beam from orbit targets and unravels the opponent's complex strategic maneuvers.",
                effect: "Cancels an active Gambit order on the target enclave.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'cancelOrder', payload: { target: 'targetEnclave', orderType: 'Gambit' } }
                ]
            },
        }
    },
    worldEnderProtocol: {
        key: 'worldEnderProtocol',
        ui: {
            name: 'World-Ender Protocol',
            icon: 'public_off',
            description: 'Initiate a resonance cascade that permanently destroys a route, reshaping the battlefield.',
            assets: {
                key: 'worldEnderProtocol',
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
            archetypeKey: 'resonanceWarden',
            legacyKey: 'shatterWaveMandate',
            availability: 8,
            targeting: {
                targetType: 'Single Route',
                siteCount: 1,
            },
            impact: {
                name: 'Self-Destruct',
                description: "The enclave's core goes critical, unleashing a self-destructive blast of apocalyptic power.",
                effect: "Destroys all forces at the target enclave and reduces forces in all adjacent enclaves by 50%.",
                duration: 1,
                radius: 1,
                rules: [
                    { type: 'setForces', payload: { target: 'targetEnclave', value: 0 } },
                    { type: 'forceDamage', payload: { target: 'adjacentEnclaves', damageType: 'percentage', value: 0.50 } }
                ]
            },
        }
    },
    aegisProtocol: {
        key: 'aegisProtocol',
        ui: {
            name: 'Aegis Protocol',
            icon: 'security',
            description: 'Erect an impenetrable resonant shield around a single enclave, making it immune to all harm.',
            assets: {
                key: 'aegisProtocol',
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
            archetypeKey: 'resonanceWarden',
            legacyKey: 'genesisForgeMandate',
            availability: 6,
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Total Lockdown',
                description: "Towering energy shields erupt around the enclave, creating an impenetrable fortress.",
                effect: "Makes the target enclave immune to attacks for 2 turns.",
                duration: 2,
                radius: 0,
                rules: [
                    { type: 'statModifier', payload: { target: 'targetEnclave', stat: 'cannot_be_attacked', value: true, duration: 2 } }
                ]
            }
        }
    },
    forgeGate: {
        key: 'forgeGate',
        ui: {
            name: 'Forge Gate',
            icon: 'link',
            description: 'Create a temporary, unbreakable supply line between all your enclaves, allowing for perfect reinforcement.',
            assets: {
                key: 'forgeGate',
                image: ASSETS.gambit.forgeGate.image,
                sfx: {
                    impact: ASSETS.gambit.forgeGate.sfx.impact,
                },
                vfx: {
                    impact: ASSETS.gambit.forgeGate.vfx.impact,
                },
                dialog: {
                    impact: ASSETS.gambit.forgeGate.dialog.impact,
                }
            }
        },
        logic: {
            archetypeKey: 'resonanceWarden',
            legacyKey: 'genesisForgeMandate',
            availability: 7,
            targeting: {
                targetType: 'All Enclaves',
                siteCount: 1,
            },
            impact: {
                name: 'Route Construction',
                description: "Automated construction drones forge new, permanent pathways between allied territories.",
                effect: "Creates 2 new routes from the target enclave to the nearest unconnected friendly enclaves.",
                duration: 'Permanent',
                radius: 0,
                rules: [
                    { type: 'createRoutes', payload: { target: 'targetEnclave', count: 2, connectionType: 'nearestUnconnectedFriendly' } }
                ]
            }
        }
    },

    // Labyrinthine Ghost Gambits
    ghostInTheSystem: {
        key: 'ghostInTheSystem',
        ui: {
            name: 'Ghost in the System',
            icon: 'bug_report',
            description: `Insert a data-daemon into the enemy's command network, causing their next order to fail catastrophically.`,
            assets: {
                key: 'ghostInTheSystem',
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
            archetypeKey: 'labyrinthineGhost',
            legacyKey: 'voidWalker',
            availability: 4,
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Order Intercept',
                description: "A ghost signal intercepts and corrupts an incoming enemy command, neutralizing the threat before it materializes.",
                effect: "Cancels an incoming Attack or Assist order targeting the enclave.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'cancelOrder', payload: { target: 'incomingOrder', orderType: 'Attack' } },
                    { type: 'cancelOrder', payload: { target: 'incomingOrder', orderType: 'Assist' } }
                ]
            }
        }
    },
    voidCordon: {
        key: 'voidCordon',
        ui: {
            name: 'Void Cordon',
            icon: 'block',
            description: 'Erect a temporary quarantine around an enemy enclave, preventing any forces from entering or leaving.',
            assets: {
                key: 'voidCordon',
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
            archetypeKey: 'labyrinthineGhost',
            legacyKey: 'voidWalker',
            availability: 6,
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Sea Route Disruption',
                description: "A barrier of null-energy extends across the void, cutting off all sea-based travel and supply lines.",
                effect: "Disables all sea routes for 2 turns.",
                duration: 2,
                radius: 'Global',
                rules: [
                    { type: 'routeDisable', payload: { target: 'seaRoutes', duration: 2 } }
                ]
            }
        }
    },
    labyrinth: {
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
            archetypeKey: 'labyrinthineGhost',
            legacyKey: 'karthianOracle',
            availability: 5,
            targeting: {
                targetType: 'Single Order',
                siteCount: 1,
            },
            impact: {
                name: 'Route Scramble',
                description: "Reality warps and shifts, twisting a vital supply route into an impassable maze of dead ends.",
                effect: "Disables the target route for 2 turns.",
                duration: 2,
                radius: 0,
                rules: [
                    { type: 'routeDisable', payload: { target: 'targetRoute', duration: 2 } }
                ]
            }
        }
    },
    quantumLoop: {
        key: 'quantumLoop',
        ui: {
            name: 'Quantum Loop',
            icon: 'sync',
            description: 'Trap an enemy enclave in a time-distorting quantum loop, forcing it to repeat its last action.',
            assets: {
                key: 'quantumLoop',
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
            archetypeKey: 'labyrinthineGhost',
            legacyKey: 'karthianOracle',
            availability: 7,
            targeting: {
                targetType: 'Single Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Locked Order',
                description: "The enemy's attack is trapped in a repeating time loop, forcing them to commit to the assault.",
                effect: "Locks the attacking enclave's order for 3 turns, preventing it from being changed.",
                duration: 3,
                radius: 0,
                rules: [
                    { type: 'lockOrder', payload: { target: 'attackingEnclave', duration: 3 } }
                ]
            }
        }
    },
    fleshWeaversHarvest: {
        key: 'fleshWeaversHarvest',
        ui: {
            name: "Flesh-Weaver's Harvest",
            icon: 'person_add',
            description: 'A dark ritual is performed on a neutral enclave, converting its raw biological mass into a brutal, new fighting force for your cause.',
            assets: {
                key: 'fleshWeaversHarvest',
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
            availability: 5,
            targeting: {
                targetType: 'Neutral Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Force Conversion',
                description: "The enclave's population is twisted and reshaped into a new fighting force, loyal only to their creator.",
                effect: "Converts a neutral enclave to your control with 20 forces.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'convertEnclave', payload: { target: 'targetEnclave', toOwner: 'friendly', forces: 20 } }
                ]
            }
    }
    },
    offWorldMercenaries: {
        key: 'offWorldMercenaries',
        ui: {
            name: 'Off-World Mercenaries',
            icon: 'rocket',
            description: 'The Archetype contacts nearby star-systems, leveraging their massive wealth to secure a temporary, powerful infusion of veteran off-world forces.',
            assets: {
                key: 'offWorldMercenaries',
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
            availability: 11,
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Mercenary Arrival',
                description: "Drop-pods scream through the atmosphere, delivering a hardened company of veteran soldiers to the battlefield.",
                effect: "Adds 50 forces to the target friendly enclave.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'gainForces', payload: { target: 'targetEnclave', value: 50 } }
                ]
            }
        }
    },
    orbitalBombardment: {
        key: 'orbitalBombardment',
        ui: {
            name: 'Orbital Bombardment',
            icon: 'scatter_plot',
            description: `A catastrophic failure in an orbiting weapon platform sends a hail of metallic shrapnel screaming towards the planet's surface, striking random enclaves with devastating force.`,
            assets: {
                key: 'orbitalBombardment',
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
            availability: 8,
            targeting: {
                targetType: 'Self',
                siteCount: 5,
            },
            impact: {
                name: 'Shrapnel Strike',
                description: "A random volley of kinetic strikes rains down from a decaying satellite, blasting multiple sites indiscriminately.",
                effect: "Reduces forces by 50% at 5 random enclaves.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'forceDamage', payload: { target: 'affectedEnclaves', damageType: 'percentage', value: 0.50 } }
                ]
            }
        }
    },
    scorchedEarth: {
        key: 'scorchedEarth',
        ui: {
            name: 'Scorched Earth',
            icon: 'bomb',
            description: 'In a final act of defiance, all remaining forces are detonated, destroying the territory to prevent the opponent from capturing it. All routes to and from it are fused and destroyed, preventing any further use of the territory.',
            assets: {
                key: 'scorchedEarth',
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
            availability: 5,
            targeting: {
                targetType: 'Friendly Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Final Act',
                description: "The enclave's core goes critical, unleashing a self-destructive blast of apocalyptic power.",
                effect: "Destroys all forces, converts the enclave to neutral, and destroys all connected routes.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'setForces', payload: { target: 'targetEnclave', value: 0 } },
                    { type: 'convertEnclave', payload: { target: 'targetEnclave', toOwner: 'neutral' } },
                    { type: 'routeDestroy', payload: { target: 'targetEnclave' } }
                ]
            }
        }
    },
    theCalling: {
        key: 'theCalling',
        ui: {
            name: 'The Calling',
            icon: 'podcasts',
            description: 'A powerful psionic hymn is broadcast, calling a random neutral enclave to your cause as if by ancient prophecy.',
            assets: {
                key: 'theCalling',
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
            availability: 4,
            targeting: {
                targetType: 'Self',
                siteCount: 1,
            },
            impact: {
                name: 'Psionic Call',
                description: "An irresistible psionic call radiates outwards, drawing a neutral territory and its people to your banner.",
                effect: "Converts a random neutral enclave to your control with 5 forces.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'convertEnclave', payload: { target: 'randomNeutralEnclave', toOwner: 'friendly', forces: 5 } }
                ]
            }
        }
    },
    theWitchingHour: {
        key: 'theWitchingHour',
        ui: {
            name: 'The Witching Hour',
            icon: 'magic_button',
            description: `Ancient magicks, long dormant in the world's core, are called upon to manifest a disaster of your choosing. The chaotic forces of nature are brought to bear against a single target.`,
            assets: {
                key: 'theWitchingHour',
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
            availability: 8,
            targeting: {
                targetType: 'Enemy Enclave',
                siteCount: 1,
            },
            impact: {
                name: 'Summon Disaster',
                description: "Arcane energies are channeled, tearing open a rift to summon a chaotic, destructive force upon your foe.",
                effect: "Summons a random disaster at the target enemy enclave.",
                duration: 1,
                radius: 0,
                rules: [
                    { type: 'summonDisaster', payload: { target: 'targetEnclave', disasterKey: 'any' } }
                ]
            }
        }
    }
};