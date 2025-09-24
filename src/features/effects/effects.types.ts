import { Vector3 } from 'three';

export interface SfxAsset {
    src: string;
}

export interface VfxAsset {
    src: string;
    width?: number;
    height?: number;
}

export interface EffectAssets {
    key: string;
    image: string;
    sfx?: SfxAsset[] | {
        alert?: SfxAsset[];
        impact?: SfxAsset[];
        aftermath?: SfxAsset[];
        [key: string]: SfxAsset[] | undefined;
    };
    vfx?: VfxAsset[] | {
        alert?: VfxAsset[];
        impact?: VfxAsset[];
        aftermath?: VfxAsset[];
        [key: string]: VfxAsset[] | undefined;
    };
    dialog?: {
        alert?: SfxAsset[];
        impact?: SfxAsset[];
        aftermath?: SfxAsset[];
        [key:string]: SfxAsset[] | undefined;
    };
}

export interface EffectUI {
    name: string;
    icon: string;
    description: string;
    assets: EffectAssets;
}

export type VfxProfile = string;
export interface SfxProfile {
    url: string;
}
export type SfxCategoryName = 'ui' | 'sfx' | 'dialog' | 'ambient' | 'music';

export interface ActiveEffect {
    id: string;
    key: string;
    type: string;
    video?: HTMLVideoElement;
    worldPosition?: Vector3;
    width?: number;
    height?: number;
    onEnded?: () => void;
}