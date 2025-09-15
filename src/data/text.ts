export const TEXT = {
  common: {
    gameTitle: "Brutal Worlds",
  },
  main: {
    buttonStart: "Begin",
  },
  settings: {
    title: "Settings",
    sound: {
      title: "Sound",
      audioToggle: "Audio",
      channels: {
        music: "Music",
        ambient: "Ambient",
        dialog: "Dialog",
        fx: "FX",
        ui: "Interface",
      }  
    },
    fx: {
      title: "FX",
      previousFXLabel: "Previous turn FX",
      previouosFXDescription: "Show FX from previous turns",
      stackFXLabel: "Stack FX",
      stackFXDescription: "Stack multiple FX together",
    },
    camera: {
      title: "Camera",
      FOVLabel: "Field of View",
      FOVDescription: "Adjust the camera's field of view",
      distanceLabel: "Camera Distance",
      distanceDescription: "Adjust the distance of the camera from the player",
    },
    lighting: {
      title: "Lighting",
      ambientLabel: "Ambient",
      bloomToggle: "Bloom",
      bloom: {
        thresholdLabel: "Threshold",
        strengthLabel: "Strength",
        radiusLabel: "Radius",
        tonemappingLabel: "Tone Mapping",
      },
    },
    materials: { 
      title: "Materials",
      categories: {
        player: "Player",
        neutral: "Neutral",
        void: "Void",
      },
      metalnessLabel: "Metalness",
      roughnessLabel: "Roughness",
      emissiveLabel: "Emissive",
    },
  },
};

export type AppTextType = typeof TEXT;
