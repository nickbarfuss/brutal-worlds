
import React from 'react';
import { Rift, ActiveEffectMarker, Enclave } from '@/types/game';
import { EFFECT_PROFILES } from '@/data/effects';
import Card from '@/components/ui/Card';
import ChipCard from '@/components/ui/ChipCard';
import { getIconForEntityType } from '@/utils/entityUtils';

interface RiftInspectorProps {
    entity: Rift;
    activeEffectMarkers: ActiveEffectMarker[];
    enclaveData: { [id: number]: Enclave };
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const RiftInspector: React.FC<RiftInspectorProps> = ({ entity, activeEffectMarkers, enclaveData, onPointerMove, onPointerLeave }) => {
    const activeMarker = activeEffectMarkers.find(marker => marker.position.equals(entity.center));
      
    const nearbyEnclaves = Object.values(enclaveData).filter(e => e.center.distanceTo(entity.center) < 15);
    // Add enclaveId to each effect for constructing the briefing key
    const aftermathEffects = nearbyEnclaves.flatMap(e => e.activeEffects ? e.activeEffects.map(eff => ({...eff, enclaveId: e.id})) : []).filter(eff => eff.phase === 'aftermath');
    const uniqueAftermathKeys = [...new Set(aftermathEffects.map(eff => eff.profileKey))];

    const hasEffects = !!activeMarker || uniqueAftermathKeys.length > 0;

    return (
        <>
          <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex-shrink-0">
               <Card.Header
                  icon={getIconForEntityType('rift')}
                  iconColorClass="text-neutral-500"
                  title={entity.name}
                  subtitle={'Rift'}
              />
          </div>
          
          <div className="flex-grow overflow-y-auto no-scrollbar" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
              <Card.Section title="Description" hasContent={!!entity.description}>
                  <p className="text-neutral-300 text-base">{entity.description}</p>
              </Card.Section>
              <Card.Section title="Effects" hasContent={hasEffects}>
                 {activeMarker && (() => {
                    const profile = EFFECT_PROFILES[activeMarker.profileKey];
                    if (!profile) return null;
                    // FIX: Find the first target enclave from metadata for briefing key
                    const firstTargetEnclaveId = activeMarker.metadata && activeMarker.metadata.targetEnclaveIds && activeMarker.metadata.targetEnclaveIds.length > 0 ? activeMarker.metadata.targetEnclaveIds[0] : null;
                    const briefingProps = firstTargetEnclaveId !== null
                        ? { type: 'effect' as const, key: `effect-${firstTargetEnclaveId}-${activeMarker.id}` }
                        : { type: 'effectProfile' as const, key: activeMarker.profileKey };
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
                      const effect = aftermathEffects.find(e => e.profileKey === key);
                      const profile = EFFECT_PROFILES[key];
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

export default RiftInspector;