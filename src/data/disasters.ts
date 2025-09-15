import { DisasterProfile } from '@/types/game.ts';
import { ASSETS } from '@/data/assets.ts';

export const DISASTERS: Record<string, DisasterProfile> = {
    entropyWind: {
        key: 'entropyWind',
        ui: {
            name: "Entropy Wind",
            icon: 'tornado',
            description: "A howling gale of pure chaos moves across the land, unmaking everything in its path.",
            assets: {
                key: 'entropyWind',
                image: ASSETS.disaster.entropyWind.image,
                sfx: {
                    alert: ASSETS.disaster.entropyWind.sfx.alert,
                    impact: ASSETS.disaster.entropyWind.sfx.impact,
                    aftermath: ASSETS.disaster.entropyWind.sfx.aftermath,
                },
                vfx: {
                    alert: ASSETS.disaster.entropyWind.vfx.alert,
                    impact: ASSETS.disaster.entropyWind.vfx.impact,
                    aftermath: ASSETS.disaster.entropyWind.vfx.aftermath,
                },
                dialog: {
                    alert: ASSETS.disaster.entropyWind.dialog.alert,
                }
            },
        },
        logic: {
            originCellType: 'Area',
            siteCount: 1,
            alert: {
                name: "Chaotic Drafts",
                description: "Unstable air currents signal a tear in reality is forming.",
                effect: "No effect.",
                duration: 1,
                radius: 1,
                movement: 0,
                rules: [],
            },
            impact: {
                name: "Entropy Lash",
                description: "The chaotic storm lashes out, unmaking matter at its epicenter.",
                effect: "The occupying enclave loses 50% of its forces.",
                duration: 1,
                radius: 1,
                movement: [1, 5],
                rules: [
                    { type: 'forceDamage', payload: { target: 'occupyingEnclave', damageType: 'percentage', value: 0.5 } },
                ],
            },
            aftermath: {
                name: "Lingering Chaos",
                description: "The storm continues its path of destruction, weakening everything it touches.",
                effect: "Affected enclaves lose 25% of their forces. The effect dissipates if it cannot move.",
                duration: [2, 4],
                radius: 1,
                movement: [1, 5],
                rules: [
                    { type: 'forceDamage', payload: { target: 'affectedEnclaves', damageType: 'percentage', value: 0.25 } },
                    { type: 'dissipateOnNoMoveTarget' }
                ],
            }
        }
    },
    ionTempest: {
        key: 'ionTempest',
        ui: {
            name: "Ion Tempest",
            icon: 'cyclone',
            description: "A storm of charged particles sweeps across the world, disrupting supply lines.",
            assets: {
                key: 'ionTempest',
                image: ASSETS.disaster.ionTempest.image,
                sfx: {
                    alert: ASSETS.disaster.ionTempest.sfx.alert,
                    impact: ASSETS.disaster.ionTempest.sfx.impact,
                    aftermath: ASSETS.disaster.ionTempest.sfx.aftermath,
                },
                vfx: {
                    alert: ASSETS.disaster.ionTempest.vfx.alert,
                    impact: ASSETS.disaster.ionTempest.vfx.impact,
                    aftermath: ASSETS.disaster.ionTempest.vfx.aftermath,
                },
                dialog: {
                    alert: ASSETS.disaster.ionTempest.dialog.alert,
                }
            }
        },
        logic: {
            originCellType: 'Area',
            siteCount: 1,
            alert: {
                name: "Static Buildup",
                description: "The atmosphere crackles with energy, signaling a massive electromagnetic storm is forming.",
                effect: "No effect.",
                duration: 1,
                radius: [2, 10],
                movement: 0,
                rules: [],
            },
            impact: {
                name: "EMP Burst",
                description: "An electromagnetic pulse disables critical infrastructure in the area.",
                effect: "Routes connected to affected enclaves are disabled for 2 turns.",
                duration: 1,
                radius: [2, 10],
                movement: 0,
                rules: [
                    { type: 'routeDisable', payload: { target: 'affectedEnclaves', duration: 2 } },
                ],
            },
            aftermath: {
                name: "System Malfunctions",
                description: "The lingering storm causes widespread system failures and disrupts offensive capabilities.",
                effect: "Affected enclaves have their combat effectiveness permanently reduced by 25%. Routes have a 25% chance of being disabled for 1 turn.",
                duration: [2, 3],
                radius: [2, 10],
                movement: 0,
                rules: [
                    { type: 'statModifier', payload: { target: 'affectedEnclaves', stat: 'combat', value: 0.25, duration: 'permanent' } },
                    { type: 'routeDisable', payload: { target: 'affectedEnclaves', duration: 1, chance: 0.25 } }
                ],
            }
        }
    },
    pyroclasm: {
        key: 'pyroclasm',
        ui: {
            name: "Pyroclasm",
            icon: 'volcano',
            description: "A superheated cloud of ash and rock erupts, incinerating everything in its path.",
            assets: {
                key: 'pyroclasm',
                image: ASSETS.disaster.pyroclasm.image,
                sfx: {
                    alert: ASSETS.disaster.pyroclasm.sfx.alert,
                    impact: ASSETS.disaster.pyroclasm.sfx.impact,
                    aftermath: ASSETS.disaster.pyroclasm.sfx.aftermath,
                },
                vfx: {
                    alert: ASSETS.disaster.pyroclasm.vfx.alert,
                    impact: ASSETS.disaster.pyroclasm.vfx.impact,
                    aftermath: ASSETS.disaster.pyroclasm.vfx.aftermath,
                },
                dialog: {
                    alert: ASSETS.disaster.pyroclasm.dialog.alert,
                }
            }
        },
        logic: {
            originCellType: 'Area',
            siteCount: 1,
            alert: {
                name: "Volcanic Activity",
                description: "The ground trembles, signaling a cataclysmic eruption is imminent.",
                effect: "No effect.",
                duration: 1,
                radius: [6, 10],
                movement: 0,
                rules: [],
            },
            impact: {
                name: "Incineration Wave",
                description: "A superheated wave of ash and rock incinerates the immediate blast radius.",
                effect: "Affected enclaves lose 33% of their forces. Connected routes have a 50% chance of being destroyed.",
                duration: 1,
                radius: [3, 5],
                movement: 0,
                rules: [
                    { type: 'forceDamage', payload: { target: 'affectedEnclaves', damageType: 'percentage', value: 0.3 } },
                    { type: 'routeDestroy', payload: { target: 'affectedEnclaves', chance: 0.50 } },
                ],
            },
            aftermath: {
                name: "Ashfall",
                description: "A thick shroud of ash settles over a wide area, choking all production.",
                effect: "Affected enclaves have their production permanently reduced by 75%.",
                duration: [3, 4],
                radius: [6, 10],
                movement: 0,
                rules: [
                    { type: 'statModifier', payload: { target: 'affectedEnclaves', stat: 'production', value: 0.75, duration: 'permanent' } }
                ],
            }
        }
    },
    resonanceCascade: {
        key: 'resonanceCascade',
        ui: {
            name: "Resonance Cascade",
            icon: 'earthquake',
            description: "The planetary core resonates violently, causing the ground to liquefy and shatter.",
            assets: {
                key: 'resonanceCascade',
                image: ASSETS.disaster.resonanceCascade.image,
                sfx: {
                    alert: ASSETS.disaster.resonanceCascade.sfx.alert,
                    impact: ASSETS.disaster.resonanceCascade.sfx.impact,
                    aftermath: ASSETS.disaster.resonanceCascade.sfx.aftermath,
                },
                vfx: {
                    alert: ASSETS.disaster.resonanceCascade.vfx.alert,
                    impact: ASSETS.disaster.resonanceCascade.vfx.impact,
                    aftermath: ASSETS.disaster.resonanceCascade.vfx.aftermath,
                },
                dialog: {
                    alert: ASSETS.disaster.resonanceCascade.dialog.alert,
                }
            }
        },
        logic: {
            originCellType: 'Area',
            siteCount: 1,
            alert: {
                name: "Seismic Tremors",
                description: "The ground begins to shake as the planetary core resonates with violent energy.",
                effect: "No effect.",
                duration: 1,
                radius: 1,
                movement: 0,
                rules: [],
            },
            impact: {
                name: "Initial Shock",
                description: "The ground violently shatters, releasing a devastating shockwave.",
                effect: "Affected enclaves loses 25% of their forces.",
                duration: 1,
                radius: () => {
                    const r = Math.random();
                    if (r < 0.6) return 3;
                    if (r < 0.9) return 6;
                    return 9;
                },
                movement: 0,
                rules: [
                    { type: 'forceDamage', payload: { target: 'affectedEnclaves', damageType: 'percentage', value: 0.25 } },
                ],
            },
            aftermath: {
                name: "Seismic Instability",
                description: "The area is left unstable, crippling production and combat effectiveness.",
                effect: "Affected enclaves have their production and combat effectiveness permanently reduced by 50%.",
                duration: [3, 4],
                radius: 0, // This will be set to match the impact radius dynamically
                movement: 0,
                rules: [
                    { type: 'statModifier', payload: { target: 'affectedEnclaves', stat: 'production', value: 0.5, duration: 'permanent' } },
                    { type: 'statModifier', payload: { target: 'affectedEnclaves', stat: 'combat', value: 0.5, duration: 'permanent' } }
                ],
            }
        }
    },
    skyfallShards: {
        key: 'skyfallShards',
        ui: {
            name: "Skyfall Shards",
            icon: 'motion_blur',
            description: "Crystalline fragments rain down from orbit, impacting multiple locations at once.",
            assets: {
                key: 'skyfallShards',
                image: ASSETS.disaster.skyfallShards.image,
                sfx: {
                    alert: ASSETS.disaster.skyfallShards.sfx.alert,
                    impact: ASSETS.disaster.skyfallShards.sfx.impact,
                    aftermath: ASSETS.disaster.skyfallShards.sfx.aftermath,
                },
                vfx: {
                    alert: ASSETS.disaster.skyfallShards.vfx.alert,
                    impact: ASSETS.disaster.skyfallShards.vfx.impact,
                    aftermath: ASSETS.disaster.skyfallShards.vfx.aftermath,
                },
                dialog: {
                    alert: ASSETS.disaster.skyfallShards.dialog.alert,
                }
            }
        },
        logic: {
            originCellType: 'Area or Void',
            siteCount: [2, 4],
            alert: {
                name: "Orbital Debris Warning",
                description: "Debris signatures are detected, signaling imminent kinetic strikes on multiple locations.",
                effect: "No effect.",
                duration: 1,
                radius: 1, // per site
                movement: 0,
                rules: [],
            },
            impact: {
                name: "Shard Impact",
                description: "Shards of orbital debris bombard the surface.",
                effect: "The occupying enclave loses 5-20 forces.",
                duration: 1,
                radius: 1, // per site
                movement: 0,
                rules: [
                    { type: 'forceDamage', payload: { target: 'occupyingEnclave', damageType: 'flat', value: [5, 20] } },
                ],
            },
            aftermath: {
                name: "Radiation Sickness",
                description: "Lingering radiation causes forces to slowly deteriorate.",
                effect: "Affected enclaves have a 50% chance of losing 1 force per turn.",
                duration: [2, 3],
                radius: 1, // per site
                movement: 0,
                rules: [
                    { type: 'applyAftermathOnChance', payload: { target: 'affectedEnclaves', chance: 0.50, effectRules: [{ type: 'forceDamage', payload: { target: 'affectedEnclaves', damageType: 'flat', value: 1 } }] } },
                ],
            }
        }
    },
    voidSurge: {
        key: 'voidSurge',
        ui: {
            name: "Void Surge",
            icon: 'tsunami',
            description: "A tear in reality unleashes a scouring wave of void energy.",
            assets: {
                key: 'voidSurge',
                image: ASSETS.disaster.voidSurge.image,
                sfx: {
                    alert: ASSETS.disaster.voidSurge.sfx.alert,
                    impact: ASSETS.disaster.voidSurge.sfx.impact,
                    aftermath: ASSETS.disaster.voidSurge.sfx.aftermath,
                },
                vfx: {
                    alert: ASSETS.disaster.voidSurge.vfx.alert,
                    impact: ASSETS.disaster.voidSurge.vfx.impact,
                    aftermath: ASSETS.disaster.voidSurge.vfx.aftermath,
                },
                dialog: {
                    alert: ASSETS.disaster.voidSurge.dialog.alert,
                }
            }
        },
        logic: {
            originCellType: 'Void',
            siteCount: 1,
            alert: {
                name: "Rift Instability",
                description: "The fabric of the void begins to thin, heralding an imminent tear in reality.",
                effect: "No effect.",
                duration: 1,
                radius: 3,
                movement: 0,
                rules: [],
            },
            impact: {
                name: "Void Lash",
                description: "A wave of raw void energy scours the area, eroding all it touches.",
                effect: "Affected enclaves lose 50% of their forces.",
                duration: 1,
                radius: 3,
                movement: 0,
                rules: [
                    { type: 'forceDamage', payload: { target: 'affectedEnclaves', damageType: 'percentage', value: 0.5 } },
                ],
            },
            aftermath: {
                name: "Void Contamination",
                description: "The area is left dangerously contaminated, cutting it off from the outside world.",
                effect: "Routes connected to affected enclaves are disabled for the duration of the effect.",
                duration: [2, 3],
                radius: 3,
                movement: 0,
                rules: [
                    { type: 'routeDisable', payload: { target: 'affectedEnclaves', duration: 99 } },
                ], // Duration is handled by effect lifetime
            }
        }
    }
};