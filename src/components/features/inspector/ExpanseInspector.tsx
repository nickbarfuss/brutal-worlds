import React from 'react';
import { Expanse, Enclave } from '@/logic/world/world.types';
import { ActiveEventMarker } from '@/logic/events/events.types';
import { EVENTS } from '@/data/events';
import Card from '@/components/ui/Card';
import ChipCard from '@/components/ui/ChipCard';
import { ICONS } from '@/data/icons';

interface ExpanseInspectorProps {
    entity: Expanse;
    activeEventMarkers: ActiveEventMarker[];
    enclaveData: { [id: number]: Enclave };
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const ExpanseInspector: React.FC<ExpanseInspectorProps> = ({ entity, activeEventMarkers, enclaveData, onPointerMove, onPointerLeave }) => {
    const activeMarker = activeEventMarkers.find(marker => marker.position.equals(entity.center));
      
    const nearbyEnclaves = Object.values(enclaveData).filter(e => e.center.distanceTo(entity.center) < 15);
    // Add enclaveId to each event for constructing the briefing key
    const aftermathEvents = nearbyEnclaves.flatMap(e => e.activeEvents ? e.activeEvents.map(eff => ({...eff, enclaveId: e.id})) : []).filter(eff => eff.phase === 'aftermath');
    const uniqueAftermathKeys = [...new Set(aftermathEvents.map(eff => eff.profileKey))];

    const hasEvents = !!activeMarker || uniqueAftermathKeys.length > 0;

    return (
        <>
          <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex-shrink-0">
               <Card.Header
                  icon={ICONS.entity.expanse}
                  iconColorClass="text-neutral-500"
                  title={entity.name}
                  subtitle={'Expanse'}
              />
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
              <Card.Section title="Description" hasContent={!!entity.description}>
                  <p className="text-neutral-300 text-base">{entity.description}</p>
              </Card.Section>
              <Card.Section title="Events" hasContent={hasEvents}>
                 {activeMarker && (() => {
                    const profile = EVENTS[activeMarker.profileKey];
                    if (!profile) return null;
                    // FIX: Find the first target enclave from metadata for briefing key
                    const firstTargetEnclaveId = activeMarker.metadata && activeMarker.metadata.targetEnclaveIds && activeMarker.metadata.targetEnclaveIds.length > 0 ? activeMarker.metadata.targetEnclaveIds[0] : null;
                    const briefingProps = firstTargetEnclaveId !== null
                        ? { type: 'event' as const, key: `event-${firstTargetEnclaveId}-${activeMarker.id}` }
                        : { type: 'eventProfile' as const, key: activeMarker.profileKey };
                    return (
                      <ChipCard
                          key={activeMarker.id}
                          // FIX: Get icon from profile, not marker
                          icon={profile.ui.icon}
                          iconColorClass="text-amber-400"
                          // FIX: Use durationInPhase instead of duration
                          baseValue={activeMarker.durationInPhase}
                          valueType="duration"
                          briefingProps={briefingProps}
                          title={profile.logic.impact.name}
                          subtitle={profile.ui.name}
                      />
                    );
                 })()}
                 {uniqueAftermathKeys.map(key => {
                      const event = aftermathEvents.find(e => e.profileKey === key);
                      const profile = EVENTS[key];
                      if (!event || !profile || !profile.logic.aftermath) return null;
  
                      return (
                          <ChipCard
                              key={`aftermath-${key}`}
                              // FIX: Property 'icon' does not exist on type 'ActiveEvent'. Get it from the profile.
                              icon={profile.ui.icon}
                              iconColorClass="text-amber-400"
                              baseValue={event.duration}
                              valueType="duration"
                              briefingProps={{ type: 'event', key: `event-${event.enclaveId}-${event.id}` }}
                              title={profile.logic.aftermath.name}
                              subtitle={profile.ui.name}
                          />
                      );
                 })}
              </Card.Section>
          </div>
        </>
    );
};

export default ExpanseInspector;