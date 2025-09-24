import { LegacyProfile } from '@/features/legacies/legacies.types';

export interface ArchetypeProfile {
    key: string;
    name: string;
    icon: string;
    description: string;
    legacies: { [key: string]: LegacyProfile };
}
