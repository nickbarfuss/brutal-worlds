
import React from 'react';
import { Expanse, ActiveDisasterMarker, Enclave } from '@/types/game';
import { DISASTER_PROFILES } from '@/data/disasters';
import Card from '@/components/ui/Card';
import ChipCard from '@/components/ui/ChipCard';
import { getIconForEntityType } from '@/utils/entityUtils';

interface ExpanseInspectorProps {
    entity: Expanse;
    activeDisasterMarkers: ActiveDisasterMarker[];
    enclaveData: { [id: number]: Enclave };
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const ExpanseInspector: React.FC<ExpanseInspectorProps> = ({ entity, activeDisasterMarkers, enclaveData, onPointerMove, onPointerLeave }) => {
    const activeMarker = activeDisasterMarkers.find(marker => marker.position.equals(entity.center));
      
    const nearbyEnclaves = Object.values(enclaveData).filter(e => e.center.distanceTo(entity.center) < 15);
    // Add enclaveId to each effect for constructing the briefing key
    const aftermathEffects = nearbyEnclaves.flatMap(e => e.activeEffects.map(eff => ({...eff, enclaveId: e.id}))).filter(eff => eff.phase === 'aftermath');
    const uniqueAftermathKeys = [...new Set(aftermathEffects.map(eff => eff.profileKey))];

    const hasEffects = !!activeMarker || uniqueAftermathKeys.length > 0;

    return (
        <>
          <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex-shrink-0">
               <Card.Header
                  icon={getIconForEntityType('expanse')}
                  iconColorClass="text-neutral-500"
                  title={entity.name}
                  subtitle={'Expanse'}
              />
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
              <Card.Section title="Description" hasContent={!!entity.description}>
                  <p className="text-neutral-300 text-base">{entity.description}</p>
              </Card.Section>
              <Card.Section title="Effects" hasContent={hasEffects}>
                 {activeMarker && (() => {
                    const profile = DISASTER_PROFILES[activeMarker.profileKey];
                    if (!profile) return null;
                    // FIX: Find the first target enclave from metadata for briefing key
                    const firstTargetEnclaveId = activeMarker.metadata && activeMarker.metadata.targetEnclaveIds && activeMarker.metadata.targetEnclaveIds.length > 0 ? activeMarker.metadata.targetEnclaveIds[0] : null;
                    const briefingProps = firstTargetEnclaveId !== null
                        ? { type: 'effect' as const, key: `effect-${firstTargetEnclaveId}-${activeMarker.id}` }
                        : { type: 'disasterProfile' as const, key: activeMarker.profileKey };
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
                          title={profile.logic.alert.name}
                          subtitle={profile.ui.name}
                      />
                    );
                 })()}
                 {uniqueAftermathKeys.map(key => {
                      const effect = aftermathEffects.find(e => e.profileKey === key);
                      const profile = DISASTER_PROFILES[key];
                      if (!effect || !profile || !profile.logic.aftermath) return null;
  
                      return (
                          <ChipCard
                              key={`aftermath-${key}`}
                              // FIX: Property 'icon' does not exist on type 'ActiveEffect'. Get it from the profile.
                              icon={profile.ui.icon}
                              iconColorClass="text-amber-400"
                              baseValue={effect.duration}
                              valueType="duration"
                              briefingProps={{ type: 'effect', key: `effect-${effect.enclaveId}-${effect.id}` }}
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