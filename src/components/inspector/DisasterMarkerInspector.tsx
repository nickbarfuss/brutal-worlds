import React from 'react';
import { ActiveDisasterMarker } from '@/types/game';
import { DISASTER_PROFILES } from '@/data/disasters';
import Card from '@/components/ui/Card';
import ChipCard from '@/components/ui/ChipCard';
import { getIconForEntityType } from '@/utils/entityUtils';

interface DisasterInspectorProps {
    marker: ActiveDisasterMarker;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const DisasterInspector: React.FC<DisasterInspectorProps> = ({ marker, onPointerMove, onPointerLeave }) => {
    // For overlapping disasters, we show info for the first one in the list.
    const primaryProfile = DISASTER_PROFILES[marker.profileKey];
    if (!primaryProfile) return null;

    const phaseProfile = primaryProfile.logic[marker.currentPhase];
    if (!phaseProfile) return null;

    const isCrisis = marker.disasters.length > 1;
    const icon = isCrisis ? getIconForEntityType('disaster') : primaryProfile.ui.icon;
    
    // For briefing cards, show phase-specific info for a single disaster.
    const briefingProps = { type: 'disasterMarker' as const, key: marker.id };

    return (
        <>
          <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex-shrink-0">
               <Card.Header
                  icon={icon}
                  iconColorClass="text-amber-400"
                  title="Disaster Site"
              />
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
              <Card.Section title={isCrisis ? "Active Disasters" : "Active Phase"}>
                 {isCrisis ? (
                    marker.disasters.map(key => {
                        const profile = DISASTER_PROFILES[key];
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
                                briefingProps={{ type: 'disasterProfile', key: key }}
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

export default DisasterInspector;
