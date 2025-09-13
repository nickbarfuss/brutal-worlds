import { EffectProfile } from '@/types/game.ts';
import { getAssetUrl } from '@/utils/assetUtils';

export const DISASTER_PROFILES: { [key: string]: EffectProfile } = { // want to renamme DISASTER_PROFILES to COMMON
    'entropy-wind': {
        key: 'entropy-wind',
        ui: {
            name: "Entropy Wind",
            icon: 'tornado',
            description: "A howling gale of pure chaos moves across the land, unmaking everything in its path.",
            assets: {
                key: 'entropy-wind',
                image: getAssetUrl('disaster', 'entropy-wind', 'jpg'),
                sfx: {
                    alert: getAssetUrl('sfx', 'entropy-wind-alert', 'mp3'),
                    impact: getAssetUrl('sfx', 'entropy-wind-impact', 'mp3'),
                    aftermath: getAssetUrl('sfx', 'entropy-wind-aftermath', 'mp3'),
                },
                vfx: {
                    alert: getAssetUrl('vfx', 'entropy-wind-alert', 'webm'),
                    impact: getAssetUrl('vfx', 'entropy-wind-impact', 'webm'),
                    aftermath: getAssetUrl('vfx', 'entropy-wind-aftermath', 'webm'),
                },
                dialog: {
                    alert: [
                        getAssetUrl('dialog', 'narrator-disaster-entropy-wind-alert-1', 'mp3'),
                        getAssetUrl('dialog', 'narrator-disaster-entropy-wind-alert-2', 'mp3'),
                        getAssetUrl('dialog', 'narrator-disaster-entropy-wind-alert-3', 'mp3'),
                    ],
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
                rules: [{ type: 'forceDamage', target: 'occupyingEnclave', damageType: 'percentage', value: 0.5 }],
            },
            aftermath: {
                name: "Lingering Chaos",
                description: "The storm continues its path of destruction, weakening everything it touches.",
                effect: "Affected enclaves lose 25% of their forces. The effect dissipates if it cannot move.",
                duration: [2, 4],
                radius: 1,
                movement: [1, 5],
                rules: [
                    { type: 'forceDamage', target: 'affectedEnclaves', damageType: 'percentage', value: 0.25 },
                    { type: 'dissipateOnNoMoveTarget' }
                ],
            }
        }
    },
    'ion-tempest': {
        key: 'ion-tempest',
        ui: {
            name: "Ion Tempest",
            icon: 'cyclone',
            description: "A storm of charged particles sweeps across the world, disrupting supply lines.",
            assets: {
                key: 'ion-tempest',
                image: 'https://storage.googleapis.com/brutal-worlds/disaster/ion-tempest.jpg',
                sfx: {
                        alert: 'ion-tempest-alert',
                        impact: 'ion-tempest-impact',
                        aftermath: 'ion-tempest-aftermath',
                    },
                vfx: {
                    alert: 'disaster-ion-tempest-alert',
                    impact: 'ion-tempest-impact',
                    aftermath: 'ion-tempest-aftermath',
                },
                dialog: {
                    alert: [
                        'narrator-disaster-pyroclasm-alert-1',
                        'narrator-disaster-pyroclasm-alert-2',
                        'narrator-disaster-pyroclasm-alert-3',
                    ],
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
                rules: [{ type: 'routeDisable', target: 'affectedEnclaves', duration: 2 }],
            },
            aftermath: {
                name: "System Malfunctions",
                description: "The lingering storm causes widespread system failures and disrupts offensive capabilities.",
                effect: "Affected enclaves have their combat effectiveness permanently reduced by 25%. Routes have a 25% chance of being disabled for 1 turn.",
                duration: [2, 3],
                radius: [2, 10],
                movement: 0,
                rules: [
                    { type: 'statModifier', target: 'affectedEnclaves', stat: 'combat', value: 0.25, duration: 'permanent' },
                    { type: 'routeDisable', target: 'affectedEnclaves', duration: 1, chance: 0.25 }
                ],
            }
        }
    },
    'pyroclasm': {
        key: 'pyroclasm',
        ui: {
            name: "Pyroclasm",
            icon: 'volcano',
            description: "A superheated cloud of ash and rock erupts, incinerating everything in its path.",
            assets: {
                key: 'pyroclasm',
                image: 'https://storage.googleapis.com/brutal-worlds/disaster/pyroclasm.jpg',
                sfx: {
                    alert: 'pyroclasm-alert',
                    impact: 'pyroclasm-impact',
                    aftermath: 'pyroclasm-aftermath',
                },
                vfx: {
                    alert: 'pyroclasm-alert',
                    impact: 'pyroclasm-impact',
                    aftermath: 'pyroclasm-aftermath',
                },
                dialog: {
                    alert: [
                        'narrator-disaster-pyroclasm-alert-1',
                        'narrator-disaster-pyroclasm-alert-2',
                        'narrator-disaster-pyroclasm-alert-3',
                    ],
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
                    { type: 'forceDamage', target: 'affectedEnclaves', damageType: 'percentage', value: 0.33 },
                    { type: 'routeDestroy', target: 'affectedEnclaves', chance: 0.50 }
                ],
            },
            aftermath: {
                name: "Ashfall",
                description: "A thick shroud of ash settles over a wide area, choking all production.",
                effect: "Affected enclaves have their production permanently reduced by 75%.",
                duration: [3, 4],
                radius: [6, 10],
                movement: 0,
                rules: [{ type: 'statModifier', target: 'affectedEnclaves', stat: 'production', value: 0.75, duration: 'permanent' }],
            }
        }
    },
    'resonance-cascade': {
        key: 'resonance-cascade',
        ui: {
            name: "Resonance Cascade",
            icon: 'earthquake',
            description: "The planetary core resonates violently, causing the ground to liquefy and shatter.",
            assets: {
                key: 'resonance-cascade',
                image: 'https://storage.googleapis.com/brutal-worlds/disaster/resonance-cascade.jpg',
                sfx: {
                    alert: 'resonance-cascade-alert',
                    impact: 'resonance-cascade-impact',
                    aftermath: 'resonance-cascade-aftermath',
                },
                vfx: {
                    alert: 'resonance-cascade-alert',
                    impact: 'resonance-cascade-impact',
                    aftermath: 'resonance-cascade-aftermath',
                },
                dialog: {
                    alert: [
                        'narrator-disaster-resonance-cascade-alert-1',
                        'narrator-disaster-resonance-cascade-alert-2',
                        'narrator-disaster-resonance-cascade-alert-3',
                    ],
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
                rules: [{ type: 'forceDamage', target: 'affectedEnclaves', damageType: 'percentage', value: 0.25 }],
            },
            aftermath: {
                name: "Seismic Instability",
                description: "The area is left unstable, crippling production and combat effectiveness.",
                effect: "Affected enclaves have their production and combat effectiveness permanently reduced by 50%.",
                duration: [3, 4],
                radius: 0, // This will be set to match the impact radius dynamically
                movement: 0,
                rules: [
                    { type: 'statModifier', target: 'affectedEnclaves', stat: 'production', value: 0.5, duration: 'permanent' },
                    { type: 'statModifier', target: 'affectedEnclaves', stat: 'combat', value: 0.5, duration: 'permanent' }
                ],
            }
        }
    },
    'skyfall-shards': {
        key: 'skyfall-shards',
        ui: {
            name: "Skyfall Shards",
            icon: 'motion_blur',
            description: "Crystalline fragments rain down from orbit, impacting multiple locations at once.",
            assets: {
                key: 'skyfall-shards',
                image: 'https://storage.googleapis.com/brutal-worlds/disaster/skyfall-shards.jpg',
                sfx: {
                    alert: 'skyfall-shards-alert',
                    impact: 'skyfall-shards-impact',
                    aftermath: 'skyfall-shards-aftermath',
                },
                vfx: {
                    alert: 'skyfall-shards-alert',
                    impact: 'skyfall-shards-impact',
                    aftermath: 'skyfall-shards-aftermath',
                },
                dialog: {
                    alert: [
                        'narrator-disaster-skyfall-shards-alert-1',
                        'narrator-disaster-skyfall-shards-alert-2',
                        'narrator-disaster-skyfall-shards-alert-3',
                    ],
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
                rules: [{ type: 'forceDamage', payload: { target: 'occupyingEnclave', damageType: 'flat', value: [5, 20] } }],
            },
            aftermath: {
                name: "Radiation Sickness",
                description: "Lingering radiation causes forces to slowly deteriorate.",
                effect: "Affected enclaves have a 50% chance of losing 1 force per turn.",
                duration: [2, 3],
                radius: 1, // per site
                movement: 0,
                rules: [
                    { type: 'applyAftermathOnChance', target: 'affectedEnclaves', chance: 0.50 },
                    { type: 'forceDamage', target: 'affectedEnclaves', damageType: 'flat', value: 1 }
                ],
            }
        }
    },
    'void-surge': {
        key: 'void-surge',
        ui: {
            name: "Void Surge",
            icon: 'tsunami',
            description: "A tear in reality unleashes a scouring wave of void energy.",
            assets: {
                key: 'void-surge',
                image: 'https://storage.googleapis.com/brutal-worlds/disaster/void-surge.jpg',
                sfx: {
                    alert: 'void-surge-alert',
                    impact: 'void-surge-impact',
                    aftermath: 'void-surge-aftermath',
                },
                vfx: {
                    alert: 'void-surge-alert',
                    impact: 'void-surge-impact',
                    aftermath: 'void-surge-aftermath',
                },
                dialog: {
                    alert: [
                        'narrator-disaster-void-surge-dialog-alert-1',
                        'narrator-disaster-void-surge-dialog-alert-2',
                        'narrator-disaster-void-surge-dialog-alert-3',
                    ],
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
                rules: [{ type: 'forceDamage', target: 'affectedEnclaves', damageType: 'percentage', value: 0.5 }],
            },
            aftermath: {
                name: "Void Contamination",
                description: "The area is left dangerously contaminated, cutting it off from the outside world.",
                effect: "Routes connected to affected enclaves are disabled for the duration of the effect.",
                duration: [2, 3],
                radius: 3,
                movement: 0,
                rules: [{ type: 'routeDisable', target: 'affectedEnclaves', duration: 99 }], // Duration is handled by effect lifetime
            }
        }
    }
};