import { OrderProfile } from '@/types/game.ts';
import { ASSETS } from '@/data/assets.ts';

export const ORDERS: { [key: string]: OrderProfile } = {
    attack: {
        key: 'attack',
        ui: {
            name: "Attack Order",
            icon: 'my_location',
            description: "Launch an offensive to conquer an adjacent hostile enclave.",
            effect: "Sends 35% of this enclave's forces to attack. Attacking forces receive a +1 combat bonus.",
            assets: {
                key: 'attack',
                image: '/public/order/attack.jpg',
                sfx: ASSETS.order.attack.sfx,
                vfx: ASSETS.order.attack.vfx,
            },
        },
        logic: {
            impact: {
                name: "Attack",
                description: "Attack an adjacent hostile enclave.",
                effect: "Sends 35% of this enclave's forces to attack. Attacking forces receive a +1 combat bonus.",
                duration: 1,
                radius: 0,
                rules: [],
            },
        },
    },
    assist: {
        key: 'assist',
        ui: {
            name: "Assist Order",
            icon: 'enable',
            description: "Send forces to bolster an adjacent friendly enclave.",
            effect: "Transfers 25% of this enclave's forces to the target enclave.",
            assets: {
                key: 'assist',
                image: '/public/order/assist.jpg',
                sfx: ASSETS.order.assist.sfx,
                vfx: ASSETS.order.assist.vfx,
            },
        },
        logic: {
            impact: {
                name: "Assist",
                description: "Send forces to bolster an adjacent friendly enclave.",
                effect: "Transfers 25% of this enclave's forces to the target enclave.",
                duration: 1,
                radius: 0,
                rules: [],
            },
        },
    },
    hold: {
        key: 'hold',
        ui: {
            name: "Holding Order",
            icon: 'verified_user',
            description: "Fortify this enclave, generating new forces. This is the only way to increase forces.",
            effect: "This enclave will not attack or assist. Generates +2 forces at the end of the turn.",
            assets: {
                key: 'hold',
                image: '/public/order/hold.jpg',
                sfx: ASSETS.order.hold.sfx,
                vfx: ASSETS.order.hold.vfx,
            },
        },
        logic: {
            impact: {
                name: "Hold",
                description: "Fortify this enclave, generating new forces.",
                effect: "This enclave will not attack or assist. Generates +2 forces at the end of the turn.",
                duration: 1,
                radius: 0,
                rules: [],
            },
        },
    }
};