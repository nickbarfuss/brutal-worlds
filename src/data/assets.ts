import { CONFIG } from '@/data/config';

export const ASSETS = {
  // UI general sounds
  ui: {
    common: {
      tap: [`${CONFIG.CDN.ui}/ui-tap-1.mp3`],
      buttonGameStart: [`${CONFIG.CDN.ui}/button-game-start.mp3`],
      buttonDialogComplete: [`${CONFIG.CDN.ui}/button-dialog-complete.mp3`],
      buttonDialogNav: [`${CONFIG.CDN.ui}/button-dialog-nav.mp3`],
    },
  },

  // disaster
  disaster: {
    entropyWind: {
      sfx: {
        alert: [`${CONFIG.CDN.sfx}/entropy-wind-alert.mp3`],
        impact: [`${CONFIG.CDN.sfx}/entropy-wind-impact.mp3`],
        aftermath: [`${CONFIG.CDN.sfx}/entropy-wind-aftermath.mp3`],
      },
      vfx: {
        alert: { url: `${CONFIG.CDN.vfx}/entropy-wind-alert.webm`, width: 256, height: 256 },
        impact: { url: `${CONFIG.CDN.vfx}/entropy-wind-impact.webm`, width: 256, height: 256 },
        aftermath: { url: `${CONFIG.CDN.vfx}/entropy-wind-aftermath.webm`, width: 256, height: 256 },
      },
      dialog: [
        `${CONFIG.CDN.dialog}/narrator-disaster-entropy-wind-alert-1.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-entropy-wind-alert-2.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-entropy-wind-alert-3.mp3`,
      ],
    },
    ionTempest: {
      sfx: {
        alert: [`${CONFIG.CDN.sfx}/ion-tempest-alert.mp3`],
        impact: [`${CONFIG.CDN.sfx}/ion-tempest-impact.mp3`],
        aftermath: [`${CONFIG.CDN.sfx}/ion-tempest-aftermath.mp3`],
      },
      vfx: {
        alert: { url: `${CONFIG.CDN.vfx}/ion-tempest-alert.webm`, width: 256, height: 256 },
        impact: { url: `${CONFIG.CDN.vfx}/ion-tempest-impact.webm`, width: 256, height: 256 },
        aftermath: { url: `${CONFIG.CDN.vfx}/ion-tempest-aftermath.webm`, width: 256, height: 256 },
      },
      dialog: [
        `${CONFIG.CDN.dialog}/narrator-disaster-ion-tempest-alert-1.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-ion-tempest-alert-2.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-ion-tempest-alert-3.mp3`,
      ],
    },
    pyroclasm: {
      sfx: {
        alert: [`${CONFIG.CDN.sfx}/pyroclasm-alert.mp3`],
        impact: [`${CONFIG.CDN.sfx}/pyroclasm-impact.mp3`],
        aftermath: [`${CONFIG.CDN.sfx}/pyroclasm-aftermath.mp3`],
      },
      vfx: {
        alert: { url: `${CONFIG.CDN.vfx}/pyroclasm-alert.webm`, width: 256, height: 256 },
        impact: { url: `${CONFIG.CDN.vfx}/pyroclasm-impact.webm`, width: 256, height: 256 },
        aftermath: { url: `${CONFIG.CDN.vfx}/pyroclasm-aftermath.webm`, width: 256, height: 256 },
      },
      dialog: [
        `${CONFIG.CDN.dialog}/narrator-disaster-pyroclasm-alert-1.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-pyroclasm-alert-2.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-pyroclasm-alert-3.mp3`,
      ],
    },
    resonanceCascade: {
      sfx: {
        alert: [`${CONFIG.CDN.sfx}/resonance-cascade-alert.mp3`],
        impact: [`${CONFIG.CDN.sfx}/resonance-cascade-impact.mp3`],
        aftermath: [`${CONFIG.CDN.sfx}/resonance-cascade-aftermath.mp3`],
      },
      vfx: {
        alert: { url: `${CONFIG.CDN.vfx}/resonance-cascade-alert.webm`, width: 256, height: 256 },
        impact: { url: `${CONFIG.CDN.vfx}/resonance-cascade-impact.webm`, width: 256, height: 256 },
        aftermath: { url: `${CONFIG.CDN.vfx}/resonance-cascade-aftermath.webm`, width: 256, height: 256 },
      },
      dialog: [
        `${CONFIG.CDN.dialog}/narrator-disaster-resonance-cascade-alert-1.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-resonance-cascade-alert-2.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-resonance-cascade-alert-3.mp3`,
      ],
    },
    skyfallShards: {
      sfx: {
        alert: [`${CONFIG.CDN.sfx}/skyfall-shards-alert.mp3`],
        impact: [`${CONFIG.CDN.sfx}/skyfall-shards-impact.mp3`],
        aftermath: [`${CONFIG.CDN.sfx}/skyfall-shards-aftermath.mp3`],
      },
      vfx: {
        alert: { url: `${CONFIG.CDN.vfx}/skyfall-shards-alert.webm`, width: 256, height: 256 },
        impact: { url: `${CONFIG.CDN.vfx}/skyfall-shards-impact.webm`, width: 256, height: 256 },
        aftermath: { url: `${CONFIG.CDN.vfx}/skyfall-shards-aftermath.webm`, width: 256, height: 256 },
      },
      dialog: [
        `${CONFIG.CDN.dialog}/narrator-disaster-skyfall-shards-alert-1.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-skyfall-shards-alert-2.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-skyfall-shards-alert-3.mp3`,
      ],
    },
    voidSurge: {
      sfx: {
        alert: [`${CONFIG.CDN.sfx}/void-surge-alert.mp3`],
        impact: [`${CONFIG.CDN.sfx}/void-surge-impact.mp3`],
        aftermath: [`${CONFIG.CDN.sfx}/void-surge-aftermath.mp3`],
      },
      vfx: {
        alert: { url: `${CONFIG.CDN.vfx}/void-surge-alert.webm`, width: 256, height: 256 },
        impact: { url: `${CONFIG.CDN.vfx}/void-surge-impact.webm`, width: 256, height: 256 },
        aftermath: { url: `${CONFIG.CDN.vfx}/void-surge-aftermath.webm`, width: 256, height: 256 },
      },
      dialog: [
        `${CONFIG.CDN.dialog}/narrator-disaster-void-surge-alert-1.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-void-surge-alert-2.mp3`,
        `${CONFIG.CDN.dialog}/narrator-disaster-void-surge-alert-3.mp3`,
      ],
    },
  },

  // cinematic
  cinematic: {
    warpEngage: {
      sfx: [`${CONFIG.CDN.sfx}/warp-engage-1.mp3`],
    },
    warpExit: {
      sfx: [
        `${CONFIG.CDN.sfx}/warp-exit-1.mp3`,
        `${CONFIG.CDN.sfx}/warp-exit-2.mp3`,
        `${CONFIG.CDN.sfx}/warp-exit-3.mp3`,
        `${CONFIG.CDN.sfx}/warp-exit-4.mp3`,
      ],
      vfx: { url: `${CONFIG.CDN.vfx}/warp-exit.webm` },
    },
    warpEnter: {
      vfx: { url: `${CONFIG.CDN.vfx}/warp-enter.webm` },
    },
  },

  // order
  order: {
    commandMode: {
      sfx: {
        enter: [`${CONFIG.CDN.sfx}/command-mode-enter-1.mp3`, `${CONFIG.CDN.sfx}/command-mode-enter-2.mp3`],
        exit: [`${CONFIG.CDN.sfx}/command-mode-exit.mp3`],
      },
    },
    assist: {
      sfx: [
        `${CONFIG.CDN.sfx}/order-assist-1.mp3`,
        `${CONFIG.CDN.sfx}/order-assist-2.mp3`,
        `${CONFIG.CDN.sfx}/order-assist-3.mp3`,
        `${CONFIG.CDN.sfx}/order-assist-4.mp3`,
      ],
      vfx: { url: `${CONFIG.CDN.vfx}/order-assist.webm`, width: 256, height: 256 },
    },
    attack: {
      sfx: [
        `${CONFIG.CDN.sfx}/order-attack-1.mp3`,
        `${CONFIG.CDN.sfx}/order-attack-2.mp3`,
        `${CONFIG.CDN.sfx}/order-attack-3.mp3`,
        `${CONFIG.CDN.sfx}/order-attack-4.mp3`,
      ],
      vfx: { url: `${CONFIG.CDN.vfx}/order-attack.webm`, width: 256, height: 256 },
    },
    hold: {
      sfx: [
        `${CONFIG.CDN.sfx}/order-hold-1.mp3`,
        `${CONFIG.CDN.sfx}/order-hold-2.mp3`,
        `${CONFIG.CDN.sfx}/order-hold-3.mp3`,
        `${CONFIG.CDN.sfx}/order-hold-4.mp3`,
        `${CONFIG.CDN.sfx}/order-hold-5.mp3`,
        `${CONFIG.CDN.sfx}/order-hold-6.mp3`,
      ],
      vfx: { url: `${CONFIG.CDN.vfx}/order-hold.webm`, width: 256, height: 256 },
    },
  },

  // conquest
  conquest: {
    player: {
      sfx: [
        `${CONFIG.CDN.sfx}/conquest-player-explosion-1.mp3`,
        `${CONFIG.CDN.sfx}/conquest-player-explosion-2.mp3`,
        `${CONFIG.CDN.sfx}/conquest-player-explosion-3.mp3`,
      ],
      vfx: { url: `${CONFIG.CDN.vfx}/conquest-player.webm`, width: 256, height: 256 },
    },
    opponent: {
      sfx: [
        `${CONFIG.CDN.sfx}/conquest-opponent-explosion-1.mp3`,
        `${CONFIG.CDN.sfx}/conquest-opponent-explosion-2.mp3`,
      ],
      vfx: { url: `${CONFIG.CDN.vfx}/conquest-opponent.webm`, width: 256, height: 256 },
    },
  },

  // archetype
  archetype: {
    firstSword: {
      annihilationDoctrine: {
        dialog: {
          arrival: [
            `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-arrival-1.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-arrival-2.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-arrival-3.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-arrival-4.mp3`,
          ],
          conquest: [
            `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-1.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-2.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-3.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-4.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-5.mp3`,
          ],
        },
        movie: `${CONFIG.CDN.archetype}/first-sword-annihilation-doctrine.webm`,
        avatar: `${CONFIG.CDN.archetype}/first-sword-annihilation-doctrine.png`,
        ui: {
          select: [
            `${CONFIG.CDN.sfx}/first-sword-1.mp3`,
            `${CONFIG.CDN.sfx}/first-sword-2.mp3`,
            `${CONFIG.CDN.sfx}/first-sword-3.mp3`,
            `${CONFIG.CDN.sfx}/first-sword-4.mp3`,
          ],
        },
      },
      warlordsAscendancy: {
        dialog: {
          arrival: [
            `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-arrival-1.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-arrival-2.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-arrival-3.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-arrival-4.mp3`,
          ],
          conquest: [
            `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-1.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-2.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-3.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-4.mp3`,
            `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-5.mp3`,
          ],
        },
        movie: `${CONFIG.CDN.archetype}/first-sword-warlords-ascendancy.webm`,
        avatar: `${CONFIG.CDN.archetype}/first-sword-warlords-ascendancy.png`,
        ui: {
          select: [
            `${CONFIG.CDN.sfx}/first-sword-1.mp3`,
            `${CONFIG.CDN.sfx}/first-sword-2.mp3`,
            `${CONFIG.CDN.sfx}/first-sword-3.mp3`,
            `${CONFIG.CDN.sfx}/first-sword-4.mp3`,
          ],
        },
      },
    },
    pactWhisperer: {
      whisperingCovenant: {
        dialog: {
          arrival: [
            `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-arrival-1.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-arrival-2.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-arrival-3.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-arrival-4.mp3`,
          ],
          conquest: [
            `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-1.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-2.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-3.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-4.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-5.mp3`,
          ],
        },
        movie: `${CONFIG.CDN.archetype}/pact-whisperer-whispering-covenant.webm`,
        avatar: `${CONFIG.CDN.archetype}/pact-whisperer-whispering-covenant.png`,
        ui: {
          select: [
            `${CONFIG.CDN.sfx}/pact-whisperer-1.mp3`,
            `${CONFIG.CDN.sfx}/pact-whisperer-2.mp3`,
            `${CONFIG.CDN.sfx}/pact-whisperer-3.mp3`,
            `${CONFIG.CDN.sfx}/pact-whisperer-4.mp3`,
          ],
        },
      },
      voidswornCovenant: {
        dialog: {
          arrival: [
            `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-arrival-1.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-arrival-2.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-arrival-3.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-arrival-4.mp3`,
          ],
          conquest: [
            `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-1.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-2.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-3.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-4.mp3`,
            `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-5.mp3`,
          ],
        },
        movie: `${CONFIG.CDN.archetype}/pact-whisperer-voidsworn-covenant.webm`,
        avatar: `${CONFIG.CDN.archetype}/pact-whisperer-voidsworn-covenant.png`,
        ui: {
          select: [
            `${CONFIG.CDN.sfx}/pact-whisperer-1.mp3`,
            `${CONFIG.CDN.sfx}/pact-whisperer-2.mp3`,
            `${CONFIG.CDN.sfx}/pact-whisperer-3.mp3`,
            `${CONFIG.CDN.sfx}/pact-whisperer-4.mp3`,
          ],
        },
      },
    },
    labyrinthineGhost: {
      voidWalker: {
        dialog: {
          arrival: [
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-arrival-1.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-arrival-2.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-arrival-3.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-arrival-4.mp3`,
          ],
          conquest: [
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-1.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-2.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-3.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-4.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-5.mp3`,
          ],
        },
        movie: `${CONFIG.CDN.archetype}/labyrinthine-ghost-void-walker.webm`,
        avatar: `${CONFIG.CDN.archetype}/labyrinthine-ghost-void-walker.png`,
        ui: {
          select: [
            `${CONFIG.CDN.sfx}/labyrinthine-ghost-1.mp3`,
            `${CONFIG.CDN.sfx}/labyrinthine-ghost-2.mp3`,
            `${CONFIG.CDN.sfx}/labyrinthine-ghost-3.mp3`,
            `${CONFIG.CDN.sfx}/labyrinthine-ghost-4.mp3`,
          ],
        },
      },
      karthianOracle: {
        dialog: {
          arrival: [
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-arrival-1.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-arrival-2.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-arrival-3.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-arrival-4.mp3`,
          ],
          conquest: [
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-1.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-2.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-3.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-4.mp3`,
            `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-5.mp3`,
          ],
        },
        movie: `${CONFIG.CDN.archetype}/labyrinthine-ghost-karthian-oracle.webm`,
        avatar: `${CONFIG.CDN.archetype}/labyrinthine-ghost-karthian-oracle.png`,
        ui: {
          select: [
            `${CONFIG.CDN.sfx}/labyrinthine-ghost-1.mp3`,
            `${CONFIG.CDN.sfx}/labyrinthine-ghost-2.mp3`,
            `${CONFIG.CDN.sfx}/labyrinthine-ghost-3.mp3`,
            `${CONFIG.CDN.sfx}/labyrinthine-ghost-4.mp3`,
          ],
        },
      },
    },
    resonanceWarden: {
      shatterWaveMandate: {
        dialog: {
          arrival: [
            `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-arrival-1.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-arrival-2.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-arrival-3.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-arrival-4.mp3`,
          ],
          conquest: [
            `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-1.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-2.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-3.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-4.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-5.mp3`,
          ],
        },
        movie: `${CONFIG.CDN.archetype}/resonance-warden-shatter-wave-mandate.webm`,
        avatar: `${CONFIG.CDN.archetype}/resonance-warden-shatter-wave-mandate.png`,
        ui: {
          select: [
            `${CONFIG.CDN.sfx}/resonance-warden-1.mp3`,
            `${CONFIG.CDN.sfx}/resonance-warden-2.mp3`,
            `${CONFIG.CDN.sfx}/resonance-warden-3.mp3`,
            `${CONFIG.CDN.sfx}/resonance-warden-4.mp3`,
            `${CONFIG.CDN.sfx}/resonance-warden-5.mp3`,
          ],
        },
      },
      genesisForgeMandate: {
        dialog: {
          arrival: [
            `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-arrival-1.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-arrival-2.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-arrival-3.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-arrival-4.mp3`,
          ],
          conquest: [
            `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-1.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-2.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-3.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-4.mp3`,
            `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-5.mp3`,
          ],
        },
        movie: `${CONFIG.CDN.archetype}/resonance-warden-genesis-forge-mandate.webm`,
        avatar: `${CONFIG.CDN.archetype}/resonance-warden-genesis-forge-mandate.png`,
        ui: {
          select: [
            `${CONFIG.CDN.sfx}/resonance-warden-1.mp3`,
            `${CONFIG.CDN.sfx}/resonance-warden-2.mp3`,
            `${CONFIG.CDN.sfx}/resonance-warden-3.mp3`,
            `${CONFIG.CDN.sfx}/resonance-warden-4.mp3`,
            `${CONFIG.CDN.sfx}/resonance-warden-5.mp3`,
          ],
        },
      },
    },
  },

  // narrator
  narrator: {
    intro: [
      `${CONFIG.CDN.dialog}/narrator-world-intro-1.mp3`,
      `${CONFIG.CDN.dialog}/narrator-world-intro-2.mp3`,
      `${CONFIG.CDN.dialog}/narrator-world-intro-3.mp3`,
      `${CONFIG.CDN.dialog}/narrator-world-intro-4.mp3`,
    ],
    world: {
      xylosPrime: [`${CONFIG.CDN.dialog}/narrator-world-intro-xylos-prime.mp3`],
      aetheriaTor: [`${CONFIG.CDN.dialog}/narrator-world-intro-aetheria-tor.mp3`],
      magentron: [`${CONFIG.CDN.dialog}/narrator-world-intro-magentron.mp3`],
      warWorld: [`${CONFIG.CDN.dialog}/narrator-world-intro-war-world.mp3`],
      anvillar: [`${CONFIG.CDN.dialog}/narrator-world-intro-anvillar.mp3`],
      skullSands: [`${CONFIG.CDN.dialog}/narrator-world-intro-skull-sands.mp3`],
      graveStar: [`${CONFIG.CDN.dialog}/narrator-world-intro-grave-star.mp3`],
      bladesEdge: [`${CONFIG.CDN.dialog}/narrator-world-intro-blades-edge.mp3`],
      cygnusX1: [`${CONFIG.CDN.dialog}/narrator-world-intro-cygnus-x-1.mp3`],
      magmaTor: [`${CONFIG.CDN.dialog}/narrator-world-intro-magma-tor.mp3`],
      shatterSpire: [`${CONFIG.CDN.dialog}/narrator-world-intro-shatter-spire.mp3`],
      steelSpine: [`${CONFIG.CDN.dialog}/narrator-world-intro-steel-spine.mp3`],
    },
    arrival: [
      `${CONFIG.CDN.dialog}/narrator-arrival-1.mp3`,
      `${CONFIG.CDN.dialog}/narrator-arrival-2.mp3`,
      `${CONFIG.CDN.dialog}/narrator-arrival-3.mp3`,
      `${CONFIG.CDN.dialog}/narrator-arrival-4.mp3`,
    ],
  },

  // music
  music: {
    track: [
      `${CONFIG.CDN.music}/ambient-remote-research.mp3`,
      `${CONFIG.CDN.music}/spaceship-workstation-ambience.mp3`,
      `${CONFIG.CDN.music}/lost-signals.mp3`,
      `${CONFIG.CDN.music}/ambient-space-station.mp3`,
      `${CONFIG.CDN.music}/klolomna-space-ambience.mp3`,
      `${CONFIG.CDN.music}/desert-night-crossing.mp3`,
      `${CONFIG.CDN.music}/desert-moon-outpost.mp3`,
      `${CONFIG.CDN.music}/distant-planet-ambience.mp3`,
      `${CONFIG.CDN.music}/ambient-meditation-soundscape.mp3`,
      `${CONFIG.CDN.music}/documentary-science.mp3`,
    ],
  },

  // ambient
  ambient: {
    spaceControl: [`${CONFIG.CDN.ambient}/ambient-space-control.mp3`],
    spaceFlight: [`${CONFIG.CDN.ambient}/ambient-space-flight.mp3`],
    spaceWind: [`${CONFIG.CDN.ambient}/ambient-space-wind.mp3`],
    spaceDrift: [`${CONFIG.CDN.ambient}/ambient-space-drift.mp3`],
  },
};

