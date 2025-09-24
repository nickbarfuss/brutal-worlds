import { SfxAsset, VfxAsset } from '@/features/effects/effects.types';

export interface OrderProfile {
    key: string;
    name: string;
    icon: string;
    description: string;
    effect: string;
    assets: {
        sfx?: SfxAsset[];
        vfx?: VfxAsset[];
    };
}
