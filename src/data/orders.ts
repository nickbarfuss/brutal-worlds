import { OrderProfile } from '@/types/game.ts';
import { ASSETS } from '@/data/assets.ts';

export const ORDER_PROFILES: { [key: string]: OrderProfile } = {
    'attack': {
        name: "Attack Order", icon: 'my_location',
        description: "Launch an offensive to conquer an adjacent hostile enclave.",
        effect: "Sends 35% of this enclave's forces to attack. Attacking forces receive a +1 combat bonus.",
        assets: {
            sfx: [ 
                ASSETS.order.attack.sfx[0],
                ASSETS.order.attack.sfx[1],
                ASSETS.order.attack.sfx[2],
                ASSETS.order.attack.sfx[3], 
            ],
            vfx: [
                ASSETS.order.attack.vfx[0], 
            ],
        },
    },
    'assist': {
        name: "Assist Order", icon: 'enable',
        description: "Send forces to bolster an adjacent friendly enclave.",
        effect: "Transfers 25% of this enclave's forces to the target enclave.",
        assets: {
            sfx: [ 
                ASSETS.order.assist.sfx[0],
                ASSETS.order.assist.sfx[1],
                ASSETS.order.assist.sfx[2],
                ASSETS.order.assist.sfx[3], 
            ],
            vfx: [
                ASSETS.order.assist.vfx[0], 
            ],
        },
    },
    'holding': {
        name: "Holding Order", icon: 'verified_user',
        description: "Fortify this enclave, generating new forces. This is the only way to increase forces.",
        effect: "This enclave will not attack or assist. Generates +2 forces at the end of the turn.",
        assets: {
            sfx: [ 
                ASSETS.order.hold.sfx[0],
                ASSETS.order.hold.sfx[1],
                ASSETS.order.hold.sfx[2],
                ASSETS.order.hold.sfx[3], 
                ASSETS.order.hold.sfx[4],
                ASSETS.order.hold.sfx[5],
            ],
            vfx: [
                ASSETS.order.hold.vfx[0], 
            ],
        },
    }
};