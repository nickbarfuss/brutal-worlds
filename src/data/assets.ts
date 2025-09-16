import { CONFIG } from '@/data/config';

export const ASSETS = {
  // UI general sounds
  ui: {
    common: {
      tap: [{ src: `${CONFIG.CDN.ui}/ui-tap-1.mp3` }],
      buttonGameStart: [{ src: `${CONFIG.CDN.ui}/button-game-start.mp3` }],
      buttonDialogComplete: [{ src: `${CONFIG.CDN.ui}/button-dialog-complete.mp3` }],
      buttonDialogNav: [{ src: `${CONFIG.CDN.ui}/button-dialog-nav.mp3` }],
    },
  },

  // disaster
  disaster: {
    entropyWind: {
      sfx: {
        alert: [{ src: `${CONFIG.CDN.sfx}/entropy-wind-alert.mp3` }],
        impact: [{ src: `${CONFIG.CDN.sfx}/entropy-wind-impact.mp3` }],
        aftermath: [{ src: `${CONFIG.CDN.sfx}/entropy-wind-aftermath.mp3` }],
      },
      vfx: {
        alert: [{ src: `${CONFIG.CDN.vfx}/entropy-wind-alert.webm`, width: 256, height: 256 }],
        impact: [{ src: `${CONFIG.CDN.vfx}/entropy-wind-impact.webm`, width: 256, height: 256 }],
        aftermath: [{ src: `${CONFIG.CDN.vfx}/entropy-wind-aftermath.webm`, width: 256, height: 256 }],
      },
      dialog: {
        alert: [  
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-entropy-wind-alert-1.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-entropy-wind-alert-2.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-entropy-wind-alert-3.mp3` },
        ],
      },
      image: `${CONFIG.CDN.disaster}/entropy-wind.jpg`,
    },
    ionTempest: {
      sfx: {
        alert: [{ src: `${CONFIG.CDN.sfx}/ion-tempest-alert.mp3` }],
        impact: [{ src: `${CONFIG.CDN.sfx}/ion-tempest-impact.mp3` }],
        aftermath: [{ src: `${CONFIG.CDN.sfx}/ion-tempest-aftermath.mp3` }],
      },
      vfx: {
        alert: [{ src: `${CONFIG.CDN.vfx}/ion-tempest-alert.webm`, width: 256, height: 256 }],
        impact: [{ src: `${CONFIG.CDN.vfx}/ion-tempest-impact.webm`, width: 256, height: 256 }],
        aftermath: [{ src: `${CONFIG.CDN.vfx}/ion-tempest-aftermath.webm`, width: 256, height: 256 }],
      },
      dialog: {
        alert: [
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-ion-tempest-alert-1.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-ion-tempest-alert-2.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-ion-tempest-alert-3.mp3` },
        ],
      },
      image: `${CONFIG.CDN.disaster}/ion-tempest.jpg`,
    },
    pyroclasm: {
      sfx: {
        alert: [{ src: `${CONFIG.CDN.sfx}/pyroclasm-alert.mp3` }],
        impact: [{ src: `${CONFIG.CDN.sfx}/pyroclasm-impact.mp3` }],
        aftermath: [{ src: `${CONFIG.CDN.sfx}/pyroclasm-aftermath.mp3` }],
      },
      vfx: {
        alert: [{ src: `${CONFIG.CDN.vfx}/pyroclasm-alert.webm`, width: 256, height: 256 }],
        impact: [{ src: `${CONFIG.CDN.vfx}/pyroclasm-impact.webm`, width: 256, height: 256 }],
        aftermath: [{ src: `${CONFIG.CDN.vfx}/pyroclasm-aftermath.webm`, width: 256, height: 256 }],
      },
      dialog: {
        alert: [
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-pyroclasm-alert-1.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-pyroclasm-alert-2.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-pyroclasm-alert-3.mp3` },
        ],
      },
      image: `${CONFIG.CDN.disaster}/pyroclasm.jpg`,
    },
    resonanceCascade: {
      sfx: {
        alert: [{ src: `${CONFIG.CDN.sfx}/resonance-cascade-alert.mp3` }],
        impact: [{ src: `${CONFIG.CDN.sfx}/resonance-cascade-impact.mp3` }],
        aftermath: [{ src: `${CONFIG.CDN.sfx}/resonance-cascade-aftermath.mp3` }],
      },
      vfx: {
        alert: [{ src: `${CONFIG.CDN.vfx}/resonance-cascade-alert.webm`, width: 256, height: 256 }],
        impact: [{ src: `${CONFIG.CDN.vfx}/resonance-cascade-impact.webm`, width: 256, height: 256 }],
        aftermath: [{ src: `${CONFIG.CDN.vfx}/resonance-cascade-aftermath.webm`, width: 256, height: 256 }],
      },
      dialog: {
        alert: [
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-resonance-cascade-alert-1.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-resonance-cascade-alert-2.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-resonance-cascade-alert-3.mp3` },
        ],
      },
      image: `${CONFIG.CDN.disaster}/resonance-cascade.jpg`,
    },
    skyfallShards: {
      sfx: {
        alert: [{ src: `${CONFIG.CDN.sfx}/skyfall-shards-alert.mp3` }],
        impact: [{ src: `${CONFIG.CDN.sfx}/skyfall-shards-impact.mp3` }],
        aftermath: [{ src: `${CONFIG.CDN.sfx}/skyfall-shards-aftermath.mp3` }],
      },
      vfx: {
        alert: [{ src: `${CONFIG.CDN.vfx}/skyfall-shards-alert.webm`, width: 256, height: 256 }],
        impact: [{ src: `${CONFIG.CDN.vfx}/skyfall-shards-impact.webm`, width: 256, height: 256 }],
        aftermath: [{ src: `${CONFIG.CDN.vfx}/skyfall-shards-aftermath.webm`, width: 256, height: 256 }],
      },
      dialog: {
        alert: [
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-skyfall-shards-alert-1.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-skyfall-shards-alert-2.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-skyfall-shards-alert-3.mp3` },
        ],
      },
      image: `${CONFIG.CDN.disaster}/skyfall-shards.jpg`,
    },
    voidSurge: {
      sfx: {
        alert: [{ src: `${CONFIG.CDN.sfx}/void-surge-alert.mp3` }],
        impact: [{ src: `${CONFIG.CDN.sfx}/void-surge-impact.mp3` }],
        aftermath: [{ src: `${CONFIG.CDN.sfx}/void-surge-aftermath.mp3` }],
      },
      vfx: {
        alert: [{ src: `${CONFIG.CDN.vfx}/void-surge-alert.webm`, width: 256, height: 256 }],
        impact: [{ src: `${CONFIG.CDN.vfx}/void-surge-impact.webm`, width: 256, height: 256 }],
        aftermath: [{ src: `${CONFIG.CDN.vfx}/void-surge-aftermath.webm`, width: 256, height: 256 }],
      },
      dialog: { 
        alert: [
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-void-surge-alert-1.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-void-surge-alert-2.mp3` },
          { src: `${CONFIG.CDN.dialog}/narrator-disaster-void-surge-alert-3.mp3` },
        ],
      },
      image: `${CONFIG.CDN.disaster}/void-surge.jpg`,
    },
  },

  // world
  world: {
    xylosPrime: {
      image: `${CONFIG.CDN.world}/xylos-prime.jpg`,
      dialog: {
        intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-xylos-prime.mp3` }],
      },
    },
    aetheriaTor: {
      image: `${CONFIG.CDN.world}/aetheria-tor.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-aetheria-tor.mp3` }] },
    },
    magentron: {
      image: `${CONFIG.CDN.world}/magnetron.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-magentron.mp3` }] },
    },
    warWorld: {
      image: `${CONFIG.CDN.world}/war-world.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-war-world.mp3` }] },
    },
    anvillar: {
      image: `${CONFIG.CDN.world}/anvillar.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-anvillar.mp3` }] },
    },
    skullSands: {
      image: `${CONFIG.CDN.world}/skull-sands.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-skull-sands.mp3` }] },
    },
    graveStar: {
      image: `${CONFIG.CDN.world}/grave-star.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-grave-star.mp3` }] },
    },
    bladesEdge: {
      image: `${CONFIG.CDN.world}/blades-edge.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-blades-edge.mp3` }] },
    },
    cygnusX1: {
      image: `${CONFIG.CDN.world}/cygnus-x1.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-cygnus-x1.mp3` }] },
    },
    magmaTor: {
      image: `${CONFIG.CDN.world}/magma-tor.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-magma-tor.mp3` }] },
    },
    shatterSpire: {
      image: `${CONFIG.CDN.world}/shatter-spire.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-shatter-spire.mp3` }] },
    },
    steelSpine: {
      image: `${CONFIG.CDN.world}/steel-spine.jpg`,
      dialog: { intro: [{ src: `${CONFIG.CDN.dialog}/narrator-world-intro-steel-spine.mp3` }] },
    },
  
  },

  // cinematic
  cinematic: {
    intro: {
      dialog: [
        { src: `${CONFIG.CDN.dialog}/narrator-world-intro-1.mp3` },
        { src: `${CONFIG.CDN.dialog}/narrator-world-intro-2.mp3` },
        { src: `${CONFIG.CDN.dialog}/narrator-world-intro-3.mp3` },
        { src: `${CONFIG.CDN.dialog}/narrator-world-intro-4.mp3` },
      ],
      sfx: [{ src: `${CONFIG.CDN.sfx}/warp-enter-1.mp3` }],
      vfx: [{ src: `${CONFIG.CDN.vfx}/warp-enter.webm`, width: 256, height: 256 }],
    },
    arrival: {  
      dialog: [
        { src: `${CONFIG.CDN.dialog}/narrator-arrival-1.mp3` },
        { src: `${CONFIG.CDN.dialog}/narrator-arrival-2.mp3` },
        { src: `${CONFIG.CDN.dialog}/narrator-arrival-3.mp3` },
        { src: `${CONFIG.CDN.dialog}/narrator-arrival-4.mp3` },
      ],
      sfx: [
        { src: `${CONFIG.CDN.sfx}/warp-exit-1.mp3` },
        { src: `${CONFIG.CDN.sfx}/warp-exit-2.mp3` },
        { src: `${CONFIG.CDN.sfx}/warp-exit-3.mp3` },
        { src: `${CONFIG.CDN.sfx}/warp-exit-4.mp3` },
      ],
      vfx: [{ src: `${CONFIG.CDN.vfx}/warp-exit.webm`, width: 256, height: 256 }],
    }, 
  },

  // order
  order: {
    commandMode: {
      sfx: {
        enter: [
          { src: `${CONFIG.CDN.sfx}/command-mode-enter-1.mp3` },
          { src: `${CONFIG.CDN.sfx}/command-mode-enter-2.mp3` }
        ],
        exit: [{ src: `${CONFIG.CDN.sfx}/command-mode-exit.mp3` }],
      },
    },
    assist: {
      sfx: [
        { src: `${CONFIG.CDN.sfx}/order-assist-1.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-assist-2.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-assist-3.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-assist-4.mp3` },
      ],
      vfx: [
        { src: `${CONFIG.CDN.vfx}/order-assist.webm`, width: 256, height: 256 }
      ],
    },
    attack: {
      sfx: [
        { src: `${CONFIG.CDN.sfx}/order-attack-1.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-attack-2.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-attack-3.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-attack-4.mp3` },
      ],
      vfx: [{ src: `${CONFIG.CDN.vfx}/order-attack.webm`, width: 256, height: 256 }],
    },
    hold: {
      sfx: [
        { src: `${CONFIG.CDN.sfx}/order-hold-1.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-hold-2.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-hold-3.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-hold-4.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-hold-5.mp3` },
        { src: `${CONFIG.CDN.sfx}/order-hold-6.mp3` },
      ],
      vfx: [{ src: `${CONFIG.CDN.vfx}/order-hold.webm`, width: 256, height: 256 }],
    },
  },

  // conquest
  conquest: {
    player: {
      sfx: [
        { src: `${CONFIG.CDN.sfx}/conquest-player-explosion-1.mp3` },
        { src: `${CONFIG.CDN.sfx}/conquest-player-explosion-2.mp3` },
        { src: `${CONFIG.CDN.sfx}/conquest-player-explosion-3.mp3` },
      ],
      vfx: [{ src: `${CONFIG.CDN.vfx}/conquest-player.webm`, width: 256, height: 256 }],
    },
    opponent: {
      sfx: [
        { src: `${CONFIG.CDN.sfx}/conquest-opponent-explosion-1.mp3` },
        { src: `${CONFIG.CDN.sfx}/conquest-opponent-explosion-2.mp3` },
      ],
      vfx: [{ src: `${CONFIG.CDN.vfx}/conquest-opponent.webm`, width: 256, height: 256 }],
    },
  },

  //birthright
  birthright: {
    kineticOnslaught: {
      image: `${CONFIG.CDN.birthright}/kinetic-onslaught.jpg`,
    },
    imperialDecree: {
      image: `${CONFIG.CDN.birthright}/placeholder.jpg`,
    },
    psychicWarfare: {
      image: `${CONFIG.CDN.birthright}/placeholder.jpg`,
    },
    memeticResonance: {
      image: `${CONFIG.CDN.birthright}/memetic-resonance.jpg`,
    },
    dissonantField: {
      image: `${CONFIG.CDN.birthright}/placeholder.jpg`,
    },
    genesisForge: {
      image: `${CONFIG.CDN.birthright}/genesis-forge.jpg`,
    },
    systemGlitch: {
      image: `${CONFIG.CDN.birthright}/placeholder.jpg`,
    },
    panopticonWeb: {
      image: `${CONFIG.CDN.birthright}/panopticon-web.jpg`,
    },
  },

  // gambit
  gambit: {
    celestialAnnihilation: {
      image: `${CONFIG.CDN.gambit}/celestial-annihilation.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    shatterpointStrike: {
      image: `${CONFIG.CDN.gambit}/shatterpoint-strike.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    transDimensionalArmory: {
      image: `${CONFIG.CDN.gambit}/trans-dimensional-armory.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },  
    },
    warFulcrum: {
      image: `${CONFIG.CDN.gambit}/war-fulcrum.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    dataShroud: {
      image: `${CONFIG.CDN.gambit}/data-shroud.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    soulForging: {
      image: `${CONFIG.CDN.gambit}/soul-forging.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    voidUntethering: {
      image: `${CONFIG.CDN.gambit}/void-untethering.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    whispersFromTheVoid: {
      image: `${CONFIG.CDN.gambit}/whispers-from-the-void.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    aegisProtocol: {
      image: `${CONFIG.CDN.gambit}/aegis-protocol.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    forgeGate: {
      image: `${CONFIG.CDN.gambit}/forge-gate.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    orbitalNullificationBeam: {
      image: `${CONFIG.CDN.gambit}/orbital-nullification-beam.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    worldEnderProtocol: {
      image: `${CONFIG.CDN.gambit}/world-ender-protocol.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    ghostInTheSystem: {
      image: `${CONFIG.CDN.gambit}/ghost-in-the-system.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    labyrinth: {
      image: `${CONFIG.CDN.gambit}/labyrinth.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    quantumLoop: {
      image: `${CONFIG.CDN.gambit}/placeholder.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    voidCordon: {
      image: `${CONFIG.CDN.gambit}/placeholder.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    fleshWeaversHarvest: {
      image: `${CONFIG.CDN.gambit}/placeholder.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    offWorldMercenaries: {
      image: `${CONFIG.CDN.gambit}/placeholder.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    orbitalBombardment: {
      image: `${CONFIG.CDN.gambit}/placeholder.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    scorchedEarth: {
      image: `${CONFIG.CDN.gambit}/placeholder.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    theCalling: {
      image: `${CONFIG.CDN.gambit}/the-calling.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
    theWitchingHour: {
      image: `${CONFIG.CDN.gambit}/placeholder.jpg`,
      sfx: { impact: [{ src: `${CONFIG.CDN.sfx}/placeholder.mp3` }] },
      vfx: { impact: [{ src: `${CONFIG.CDN.vfx}/placeholder.webm`, width: 256, height: 256 }] },
      dialog: { impact: [{ src: `${CONFIG.CDN.dialog}/placeholder.mp3` }] },
    },
  },

  // archetype
  archetype: {
    firstSword: {
      annihilationDoctrine: {
        dialog: {
          arrival: [
            { src: `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-arrival-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-arrival-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-arrival-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-arrival-4.mp3` },
          ],
          conquest: [
            { src: `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-4.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-annihilation-doctrine-conquest-5.mp3` },
          ],
        },
        movie: `${CONFIG.CDN.archetype}/first-sword-annihilation-doctrine.webm`,
        avatar: `${CONFIG.CDN.archetype}/first-sword-annihilation-doctrine.png`,
        ui: {
          select: [
            { src: `${CONFIG.CDN.sfx}/first-sword-1.mp3` },
            { src: `${CONFIG.CDN.sfx}/first-sword-2.mp3` },
            { src: `${CONFIG.CDN.sfx}/first-sword-3.mp3` },
            { src: `${CONFIG.CDN.sfx}/first-sword-4.mp3` },
          ],
        },
      },
      warlordsAscendancy: {
        dialog: {
          arrival: [
            { src: `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-arrival-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-arrival-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-arrival-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-arrival-4.mp3` },
          ],
          conquest: [
            { src: `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-4.mp3` },
            { src: `${CONFIG.CDN.dialog}/first-sword-warlords-ascendancy-conquest-5.mp3` },
          ],
        },
        movie: `${CONFIG.CDN.archetype}/first-sword-warlords-ascendancy.webm`,
        avatar: `${CONFIG.CDN.archetype}/first-sword-warlords-ascendancy.png`,
        ui: {
          select: [
            { src: `${CONFIG.CDN.sfx}/first-sword-1.mp3` },
            { src: `${CONFIG.CDN.sfx}/first-sword-2.mp3` },
            { src: `${CONFIG.CDN.sfx}/first-sword-3.mp3` },
            { src: `${CONFIG.CDN.sfx}/first-sword-4.mp3` },
          ],
        },
      },
    },
    pactWhisperer: {
      whisperingCovenant: {
        dialog: {
          arrival: [
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-arrival-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-arrival-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-arrival-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-arrival-4.mp3` },
          ],
          conquest: [
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-4.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-whispering-covenant-conquest-5.mp3` },
          ],
        },
        movie: `${CONFIG.CDN.archetype}/pact-whisperer-whispering-covenant.webm`,
        avatar: `${CONFIG.CDN.archetype}/pact-whisperer-whispering-covenant.png`,
        ui: {
          select: [
            { src: `${CONFIG.CDN.sfx}/pact-whisperer-1.mp3` },
            { src: `${CONFIG.CDN.sfx}/pact-whisperer-2.mp3` },
            { src: `${CONFIG.CDN.sfx}/pact-whisperer-3.mp3` },
            { src: `${CONFIG.CDN.sfx}/pact-whisperer-4.mp3` },
          ],
        },
      },
      voidswornCovenant: {
        dialog: {
          arrival: [
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-arrival-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-arrival-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-arrival-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-arrival-4.mp3` },
          ],
          conquest: [
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-4.mp3` },
            { src: `${CONFIG.CDN.dialog}/pact-whisperer-voidsworn-covenant-conquest-5.mp3` },
          ],
        },
        movie: `${CONFIG.CDN.archetype}/pact-whisperer-voidsworn-covenant.webm`,
        avatar: `${CONFIG.CDN.archetype}/pact-whisperer-voidsworn-covenant.png`,
        ui: {
          select: [
            { src: `${CONFIG.CDN.sfx}/pact-whisperer-1.mp3` },
            { src: `${CONFIG.CDN.sfx}/pact-whisperer-2.mp3` },
            { src: `${CONFIG.CDN.sfx}/pact-whisperer-3.mp3` },
            { src: `${CONFIG.CDN.sfx}/pact-whisperer-4.mp3` },
          ],
        },
      },
    },
    labyrinthineGhost: {
      voidWalker: {
        dialog: {
          arrival: [
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-arrival-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-arrival-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-arrival-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-arrival-4.mp3` },
          ],
          conquest: [
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-4.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-void-walker-conquest-5.mp3` },
          ],
        },
        movie: `${CONFIG.CDN.archetype}/labyrinthine-ghost-void-walker.webm`,
        avatar: `${CONFIG.CDN.archetype}/labyrinthine-ghost-void-walker.png`,
        ui: {
          select: [
            { src: `${CONFIG.CDN.sfx}/labyrinthine-ghost-1.mp3` },
            { src: `${CONFIG.CDN.sfx}/labyrinthine-ghost-2.mp3` },
            { src: `${CONFIG.CDN.sfx}/labyrinthine-ghost-3.mp3` },
            { src: `${CONFIG.CDN.sfx}/labyrinthine-ghost-4.mp3` },
          ],
        },
      },
      karthianOracle: {
        dialog: {
          arrival: [
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-arrival-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-arrival-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-arrival-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-arrival-4.mp3` },
          ],
          conquest: [
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-4.mp3` },
            { src: `${CONFIG.CDN.dialog}/labyrinthine-ghost-karthian-oracle-conquest-5.mp3` },
          ],
        },
        movie: `${CONFIG.CDN.archetype}/labyrinthine-ghost-karthian-oracle.webm`,
        avatar: `${CONFIG.CDN.archetype}/labyrinthine-ghost-karthian-oracle.png`,
        ui: {
          select: [
            { src: `${CONFIG.CDN.sfx}/labyrinthine-ghost-1.mp3` },
            { src: `${CONFIG.CDN.sfx}/labyrinthine-ghost-2.mp3` },
            { src: `${CONFIG.CDN.sfx}/labyrinthine-ghost-3.mp3` },
            { src: `${CONFIG.CDN.sfx}/labyrinthine-ghost-4.mp3` },
          ],
        },
      },
    },
    resonanceWarden: {
      shatterWaveMandate: {
        dialog: {
          arrival: [
            { src: `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-arrival-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-arrival-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-arrival-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-arrival-4.mp3` },
          ],
          conquest: [
            { src: `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-4.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-shatter-wave-mandate-conquest-5.mp3` },
          ],
        },
        movie: `${CONFIG.CDN.archetype}/resonance-warden-shatter-wave-mandate.webm`,
        avatar: `${CONFIG.CDN.archetype}/resonance-warden-shatter-wave-mandate.png`,
        ui: {
          select: [
            { src: `${CONFIG.CDN.sfx}/resonance-warden-1.mp3` },
            { src: `${CONFIG.CDN.sfx}/resonance-warden-2.mp3` },
            { src: `${CONFIG.CDN.sfx}/resonance-warden-3.mp3` },
            { src: `${CONFIG.CDN.sfx}/resonance-warden-4.mp3` },
            { src: `${CONFIG.CDN.sfx}/resonance-warden-5.mp3` },
          ],
        },
      },
      genesisForgeMandate: {
        dialog: {
          arrival: [
            { src: `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-arrival-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-arrival-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-arrival-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-arrival-4.mp3` },
          ],
          conquest: [
            { src: `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-1.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-2.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-3.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-4.mp3` },
            { src: `${CONFIG.CDN.dialog}/resonance-warden-genesis-forge-mandate-conquest-5.mp3` },
          ],
        },
        movie: `${CONFIG.CDN.archetype}/resonance-warden-genesis-forge-mandate.webm`,
        avatar: `${CONFIG.CDN.archetype}/resonance-warden-genesis-forge-mandate.png`,
        ui: {
          select: [
            { src: `${CONFIG.CDN.sfx}/resonance-warden-1.mp3` },
            { src: `${CONFIG.CDN.sfx}/resonance-warden-2.mp3` },
            { src: `${CONFIG.CDN.sfx}/resonance-warden-3.mp3` },
            { src: `${CONFIG.CDN.sfx}/resonance-warden-4.mp3` },
            { src: `${CONFIG.CDN.sfx}/resonance-warden-5.mp3` },
          ],
        },
      },
    },
  },

  // narrator
  narrator: {
    //coming soon...
  },

  // music
  music: {
    track: [
      { src: `${CONFIG.CDN.music}/ambient-remote-research.mp3` },
      { src: `${CONFIG.CDN.music}/spaceship-workstation-ambience.mp3` },
      { src: `${CONFIG.CDN.music}/lost-signals.mp3` },
      { src: `${CONFIG.CDN.music}/ambient-space-station.mp3` },
      { src: `${CONFIG.CDN.music}/klolomna-space-ambience.mp3` },
      { src: `${CONFIG.CDN.music}/desert-night-crossing.mp3` },
      { src: `${CONFIG.CDN.music}/desert-moon-outpost.mp3` },
      { src: `${CONFIG.CDN.music}/distant-planet-ambience.mp3` },
      { src: `${CONFIG.CDN.music}/ambient-meditation-soundscape.mp3` },
      { src: `${CONFIG.CDN.music}/documentary-science.mp3` },
    ],
  },

  // ambient
  ambient: {
    spaceControl: [{ src: `${CONFIG.CDN.ambient}/ambient-space-control.mp3` }],
    spaceFlight: [{ src: `${CONFIG.CDN.ambient}/ambient-space-flight.mp3` }],
    spaceWind: [{ src: `${CONFIG.CDN.ambient}/ambient-space-wind.mp3` }],
    spaceDrift: [{ src: `${CONFIG.CDN.ambient}/ambient-space-drift.mp3` }],
  },
};

export default ASSETS;