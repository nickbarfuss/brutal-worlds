import { Player } from '@/types/core';
import { EffectAssets, EffectUI } from '@/features/effects/effects.types';
import { EffectLogic } from '@/logic/effects/effects.types';

// Orders & Commands
export type OrderType = 'attack' | 'assist' | 'hold';

export interface Order {
  to: number;
  type: OrderType;
}

export interface PendingOrders {
  [fromId: number]: Order;
}

export interface AttackEvent {
    type: 'attack';
    fromEnclaveId: number;
    toEnclaveId: number;
    owner: Player;
}

export interface HoldEvent {
    type: 'hold';
    enclaveId: number;
}

export interface AssistEvent {
    type: 'assist';
    fromEnclaveId: number;
    toEnclaveId: number;
}

export interface OrderProfile {
    key: string;
    ui: {
        name: string;
        icon: string;
        description: string;
        effect: string;
        assets: EffectAssets;
    };
    logic: EffectLogic;
}
