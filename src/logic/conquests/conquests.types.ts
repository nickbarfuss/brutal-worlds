import { Player } from '@/types/core';

export interface ConquestEvent {
    type: 'conquest';
    enclaveId: number;
    conqueror: Player;
    archetypeKey: string;
    legacyKey: string;
}
