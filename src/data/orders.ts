import { OrderProfile } from '@/types/game.ts';
import { ASSETS } from '@/data/assets.ts';

export const ORDERS: { [key: string]: OrderProfile } = {
    attack: {
        key: 'attack',
        name: "Attack Order",
        icon: 'my_location',
        description: "Launch an offensive to conquer an adjacent hostile enclave.",
        effect: "Sends 35% of this enclave's forces to attack. Attacking forces receive a +1 combat bonus.",
        assets: {
            sfx: ASSETS.order.attack.sfx,
            vfx: ASSETS.order.attack.vfx,
        },
    },
    assist: {
        key: 'assist',
        name: "Assist Order",
        icon: 'enable',
        description: "Send forces to bolster an adjacent friendly enclave.",
        effect: "Transfers 25% of this enclave's forces to the target enclave.",
        assets: {
            sfx: ASSETS.order.assist.sfx,
            vfx: ASSETS.order.assist.vfx,
        },
    },
    hold: {
        key: 'hold',
        name: "Holding Order",
        icon: 'verified_user',
        description: "Fortify this enclave, generating new forces. This is the only way to increase forces.",
        effect: "This enclave will not attack or assist. Generates +2 forces at the end of the turn.",
        assets: {
            sfx: ASSETS.order.hold.sfx,
            vfx: ASSETS.order.hold.vfx,
        },
    }
};