import React, { useRef, useState, useLayoutEffect } from 'react';
import { ActiveGambit, GambitProfile } from '@/types/game';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';

interface GambitCardProps {
  gambit: {
    profile: GambitProfile;
    active: ActiveGambit;
    position: DOMRect;
  } | null;
}

const GambitCard: React.FC<GambitCardProps> = ({ gambit }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!gambit || !card) {
      setStyle({ visibility: 'hidden' });
      return;
    }

    // Use scrollHeight for true content height
    card.style.visibility = 'hidden';
    card.style.maxHeight = '';
    card.offsetHeight; // Force a reflow to ensure the next measurement is accurate
    const cardHeight = card.scrollHeight;
    card.style.visibility = '';

    const parentRect = gambit.position;
    const windowHeight = window.innerHeight;
    const horizontalMargin = 16; // 1rem
    const clampingMargin = 32;   // 2rem, consistent with WorldInspector

    const newStyle: React.CSSProperties = { visibility: 'visible' };

    // 1. Attempt to vertically center align with parent
    let top = parentRect.top + (parentRect.height / 2) - (cardHeight / 2);

    // 2. Clamp to viewport
    if (top < clampingMargin) top = clampingMargin;
    if (top + cardHeight > windowHeight - clampingMargin) top = windowHeight - cardHeight - clampingMargin;
    top = Math.max(clampingMargin, top);
    newStyle.top = `${top}px`;

    // 3. Set maxHeight only if content overflows
    const availableHeight = windowHeight - top - clampingMargin;
    if (cardHeight > availableHeight) {
        newStyle.maxHeight = `${availableHeight}px`;
    }
    
    // 4. Set horizontal position
    newStyle.left = `${parentRect.left - horizontalMargin}px`;
    newStyle.transform = 'translateX(-100%)';
    
    setStyle(newStyle);
  }, [gambit]);

  if (!gambit) {
    return null;
  }

  const { profile, active } = gambit;

  let statusLabel = '';
  let statusValue = '';

  switch (active.state) {
    case 'locked':
      statusLabel = 'Available';
      statusValue = `Turn ${profile.logic.availability}`;
      break;
    case 'available':
      statusLabel = 'Uses';
      // FIX: Add a fallback for profile.uses to prevent rendering 'undefined' and resolve a type error.
      statusValue = `${active.remainingUses} / ${profile.logic.uses || 1}`;
      break;
    case 'active':
      statusLabel = 'Duration';
      statusValue = `${active.remainingDuration} Turns Left`;
      break;
    case 'depleted':
      statusLabel = 'Status';
      statusValue = 'Depleted';
      break;
  }

  const details = [
    { label: 'Target', value: profile.logic.targeting?.targetType },
    { label: 'Restriction', value: profile.logic.restriction },
    { label: statusLabel, value: statusValue },
  ].filter(d => d.value !== 'None' && d.label !== '');

  return (
    <Card
      ref={cardRef}
      className="fixed w-96 bg-neutral-900 rounded-xl border border-neutral-700/50 shadow-xl pointer-events-none z-40 animate-fade-in-briefing flex flex-col"
      style={style}
    >
        <Card.Header 
            icon={profile.ui.icon}
            iconColorClass="text-[var(--color-accent-400)]"
            title={profile.ui.name}
        />
        <div className="flex-grow overflow-y-auto no-scrollbar">
          <Card.Section title="Description">
              <p className="text-base text-neutral-300">{profile.ui.description}</p>
          </Card.Section>
          <Card.Section title="Effect">
              <p className="text-base text-neutral-300">{profile.logic.impact.effect}</p>
          </Card.Section>
          {details.length > 0 && (
              <Card.Section title="Details">
                  <div className="flex flex-wrap gap-2">
                      {details.map(d => (
                          <Chip key={d.label} label={d.label} value={d.value} />
                      ))}
                  </div>
              </Card.Section>
          )}
        </div>
    </Card>
  );
};

export default GambitCard;