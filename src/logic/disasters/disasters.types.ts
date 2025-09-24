import { EventProfile, ActiveEventMarker } from '@/logic/events/events.types';
import { Rule } from '@/types/rules';

export interface DisasterProfile extends EventProfile {}
export type DisasterRule = Rule;

export interface ActiveDisasterMarker extends ActiveEventMarker {
  disasterKey: string;
}