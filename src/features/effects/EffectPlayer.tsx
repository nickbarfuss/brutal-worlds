import React, { useEffect } from 'react';
import * as THREE from 'three';
import { EffectQueueItem } from '@/types/game';
import { VfxManager } from '@/logic/VfxManager';
import { SfxManager } from '@/logic/SfxManager';

interface EffectPlayerProps {
    effects: EffectQueueItem[];
    vfxManager: VfxManager;
    sfxManager: SfxManager;
    onEffectsPlayed: (effectIds: string[]) => void;
}

export const EffectPlayer: React.FC<EffectPlayerProps> = ({ effects, vfxManager, sfxManager, onEffectsPlayed }) => {
    useEffect(() => {
        if (effects.length > 0) {
            const effectIds = effects.map(e => e.id);

            effects.forEach(effect => {
                if (effect.vfx && effect.position) {
                    const vfxItems = Array.isArray(effect.vfx) ? effect.vfx : [effect.vfx];
                    vfxItems.forEach(v => {
                        const key = typeof v === 'string' ? v : v.key;
                        if (key) {
                            vfxManager.playEffect(key, effect.position as THREE.Vector3);
                        }
                    });
                }
                if (effect.sfx) {
                    sfxManager.playSound(effect.sfx.key, effect.sfx.channel, effect.sfx.position);
                }
            });

            onEffectsPlayed(effectIds);
        }
    }, [effects, vfxManager, sfxManager, onEffectsPlayed]);

    return null;
};
