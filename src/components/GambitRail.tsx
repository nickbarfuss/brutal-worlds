
/* ================================================================== */
/* NOTE FOR FUTURE REFACTORING: GAMBIT SYSTEM DISABLED                */
/* This component and the associated Gambit system are temporarily    */
/* disabled and commented out from GameScreen.tsx. Do not reintroduce */
/* this functionality until specifically instructed to do so.         */
/* ================================================================== */

import React, { useState, useCallback } from 'react';
import { ActiveGambit, GambitProfile } from '@/types/game';
import { GAMBITS } from '@/data/gambits';
import GambitCard from '@/components/GambitCard';
import ButtonGambit from '@/components/ui/ButtonGambit';

interface GambitRailProps {
  gambits: ActiveGambit[];
}

interface HoveredGambit {
  profile: GambitProfile;
  active: ActiveGambit;
  // FIX: Changed type to DOMRect to match the expected prop type in GambitCard.
  // This resolves a type incompatibility error.
  position: DOMRect;
}

const GambitRail: React.FC<GambitRailProps> = ({ gambits }) => {
  const [hoveredGambit, setHoveredGambit] = useState<HoveredGambit | null>(null);

  const handleMouseEnter = useCallback((event: React.MouseEvent<HTMLButtonElement>, activeGambit: ActiveGambit) => {
    const profile = GAMBITS[activeGambit.key];
    if (!profile) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredGambit({
      profile,
      active: activeGambit,
      // FIX: Pass the entire DOMRect object instead of a partial object.
      // This satisfies the prop type requirements of the GambitCard component.
      position: rect,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredGambit(null);
  }, []);

  if (gambits.length === 0) {
    return null;
  }

  const archetypeGambits = gambits.filter(g => GAMBITS[g.key]?.logic.category === 'Archetype');
  const commonGambits = gambits.filter(g => GAMBITS[g.key]?.logic.category === 'Common');

  return (
    <div className="h-full relative">
      <div className="h-full overflow-y-auto no-scrollbar pr-2">
        <div className="space-y-2">
          {archetypeGambits.map(gambit => (
            <ButtonGambit
              key={gambit.key}
              activeGambit={gambit}
              onMouseEnter={(e) => handleMouseEnter(e, gambit)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
          {archetypeGambits.length > 0 && commonGambits.length > 0 && (
             <div className="py-1 w-14"><hr className="border-neutral-800" /></div>
          )}
          {commonGambits.map(gambit => (
            <ButtonGambit
              key={gambit.key}
              activeGambit={gambit}
              onMouseEnter={(e) => handleMouseEnter(e, gambit)}
              onMouseLeave={handleMouseLeave}
            />
          ))}
        </div>
      </div>
      <GambitCard gambit={hoveredGambit} />
    </div>
  );
};

export default GambitRail;
