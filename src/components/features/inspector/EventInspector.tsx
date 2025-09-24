import React from 'react';
import { ActiveEventMarker } from '@/logic/events/events.types';
import { EVENTS } from '@/data/events';
import Card from '@/components/ui/Card';
import ChipCard from '@/components/ui/ChipCard';
import { ICONS } from '@/data/icons';

interface EventInspectorProps {
    marker: ActiveEventMarker;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const EventInspector: React.FC<EventInspectorProps> = ({ marker, onPointerMove, onPointerLeave }) => {
    // For overlapping events, we show info for the first one in the list.
    const primaryProfile = EVENTS[marker.profileKey];
    if (!primaryProfile) return null;

    const phaseProfile = primaryProfile.logic[marker.currentPhase];
    if (!phaseProfile) return null;

    const isCrisis = marker.events.length > 1;
    const icon = isCrisis ? ICONS.disaster : primaryProfile.ui.icon;
    
    // For briefing cards, show phase-specific info for a single event.
    const briefingProps = { type: 'eventMarker' as const, key: marker.id };

    return (
        <>
          <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex-shrink-0">
               <Card.Header
                  icon={icon}
                  iconColorClass="text-amber-400"
                  title="Event Zone"
              />
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
              <Card.Section title={isCrisis ? "Active Events" : "Active Phase"}>
                 {isCrisis ? (
                    marker.events.map(key => {
                        const profile = EVENTS[key];
                        if (!profile) return null;
                        const currentPhase = profile.logic[marker.currentPhase];
                        return (
                            <ChipCard
                                key={key}
                                icon={profile.ui.icon}
                                iconColorClass="text-amber-400"
                                title={currentPhase.name}
                                subtitle={profile.ui.name}
                                baseValue={marker.durationInPhase}
                                valueType="duration"
                                briefingProps={{ type: 'eventProfile', key: key }}
                            />
                        );
                    })
                 ) : (
                    <ChipCard
                        key={marker.id}
                        icon={primaryProfile.ui.icon}
                        iconColorClass="text-amber-400"
                        baseValue={marker.durationInPhase}
                        valueType="duration"
                        briefingProps={briefingProps}
                        title={phaseProfile.name}
                        subtitle={primaryProfile.ui.name}
                    />
                 )}
              </Card.Section>
          </div>
        </>
    );
};

export default EventInspector;
