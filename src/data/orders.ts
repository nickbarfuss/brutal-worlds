import { OrderProfile } from '@/types/game.ts';

export const ORDER_PROFILES: { [key: string]: OrderProfile } = {
    'attack': {
        name: "Attack Order", icon: 'my_location',
        description: "Launch an offensive to conquer an adjacent hostile enclave.",
        effect: "Sends 35% of this enclave's forces to attack. Attacking forces receive a +1 combat bonus.",
        vfxKey: 'order-attack'
    },
    'assist': {
        name: "Assist Order", icon: 'enable',
        description: "Send forces to bolster an adjacent friendly enclave.",
        effect: "Transfers 25% of this enclave's forces to the target enclave.",
        vfxKey: 'order-assist'
    },
    'holding': {
        name: "Holding Order", icon: 'verified_user',
        description: "Fortify this enclave, generating new forces. This is the only way to increase forces.",
        effect: "This enclave will not attack or assist. Generates +2 forces at the end of the turn.",
        vfxKey: 'order-holding'
    }
};