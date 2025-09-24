
import React from 'react';
import { Owner } from '@/types/core';
import { Enclave, Domain, Rift, Expanse } from '@/logic/world/world.types';
import { WorldProfile } from '@/types/world';
import { HighlightType, ActiveHighlight } from '@/types/game'; // Keep these for now
import { ICONS } from '@/data/icons';
import { getDomainOwner } from '@/logic/domains';
import { THEME_THREE } from '@/data/theme';
import ChipGroup from '@/components/ui/ChipGroup';

interface LegendDisplayProps {
  enclaveData: { [id: number]: Enclave };
  domainData: { [id: number]: Domain };
  riftData: { [id: number]: Rift };
  expanseData: { [id: number]: Expanse };
  currentWorld: WorldProfile | null;
  activeHighlight: ActiveHighlight | null;
  onHighlightChange: (highlight: ActiveHighlight | null) => void;
}

const LegendDisplay: React.FC<LegendDisplayProps> = ({
  enclaveData, domainData, riftData, expanseData,
  currentWorld, activeHighlight, onHighlightChange
}) => {

  const handleLabelClick = (type: HighlightType) => {
    const allOwnersForType: Owner[] = [];
    if (type === 'domains' || type === 'enclaves') {
      allOwnersForType.push('player-1', 'player-2', null);
    } else {
      allOwnersForType.push(null); // Rifts/Expanses are always neutral
    }

    if (activeHighlight?.type === type && activeHighlight.owners.size === allOwnersForType.length) {
      onHighlightChange(null);
    } else {
      onHighlightChange({ type, owners: new Set(allOwnersForType) });
    }
  };

  const handleSegmentClick = (type: HighlightType, owner: Owner) => {
    if (activeHighlight?.type !== type) {
      onHighlightChange({ type, owners: new Set([owner]) });
      return;
    }
    
    const newOwners = new Set(activeHighlight.owners);
    if (newOwners.has(owner)) {
      newOwners.delete(owner);
    } else {
      newOwners.add(owner);
    }

    if (newOwners.size === 0) {
      onHighlightChange(null);
    } else {
      onHighlightChange({ type, owners: newOwners });
    }
  };
  
  const enclaves = Object.values(enclaveData);
  const domains = Object.values(domainData);

  const counts: {
      [key in HighlightType]: { [key in 'player-1' | 'player-2' | 'null']: number }
  } = {
      domains: { 'player-1': 0, 'player-2': 0, 'null': 0 },
      enclaves: { 'player-1': 0, 'player-2': 0, 'null': 0 },
      expanses: { 'player-1': 0, 'player-2': 0, 'null': Object.keys(expanseData).length },
      rifts: { 'player-1': 0, 'player-2': 0, 'null': Object.keys(riftData).length },
  };

  enclaves.forEach(e => counts.enclaves[String(e.owner) as 'player-1' | 'player-2' | 'null']++);
  domains.forEach(d => {
    const owner = getDomainOwner(d.id, enclaveData);
    counts.domains[String(owner) as 'player-1' | 'player-2' | 'null']++;
  });
  
  const palette = currentWorld?.neutralColorPalette;
  if (!palette) return null;
  
  const ownerColors = {
      'player-1': THEME_THREE['player-1'].selected,
      'player-2': THEME_THREE['player-2'].selected,
      'null': palette.selected,
  };

  const chipData = [
            { type: 'domains' as HighlightType, label: 'Domains', segments: [ { id: 'player-1' as Owner, icon: ICONS.entity.domain, color: ownerColors['player-1'], count: counts.domains['player-1'] }, { id: 'player-2' as Owner, icon: ICONS.entity.domain, color: ownerColors['player-2'], count: counts.domains['player-2'] }, { id: null as Owner, icon: ICONS.entity.domain, color: ownerColors.null, count: counts.domains.null } ] },
      { type: 'enclaves' as HighlightType, label: 'Enclaves', segments: [ { id: 'player-1' as Owner, icon: ICONS.entity.enclave, color: ownerColors['player-1'], count: counts.enclaves['player-1'] }, { id: 'player-2' as Owner, icon: ICONS.entity.enclave, color: ownerColors['player-2'], count: counts.enclaves['player-2'] }, { id: null as Owner, icon: ICONS.entity.enclave, color: ownerColors.null, count: counts.enclaves.null } ] },
      { type: 'expanses' as HighlightType, label: 'Expanses', segments: [{ id: null as Owner, icon: ICONS.entity.expanse, color: ownerColors.null, count: counts.expanses.null, }] },
      { type: 'rifts' as HighlightType, label: 'Rifts', segments: [{ id: null as Owner, icon: ICONS.entity.rift, color: ownerColors.null, count: counts.rifts.null, }] }
  ];

  return (
    <div className={`flex flex-row flex-wrap items-center justify-center gap-2 pointer-events-auto`}>
      {chipData.map(({ type, label, segments }) => (
          <ChipGroup
              key={type}
              type={type}
              label={label}
              segments={segments}
              activeOwners={activeHighlight?.type === type ? activeHighlight.owners : new Set()}
              onLabelClick={handleLabelClick}
              onSegmentClick={handleSegmentClick}
          />
      ))}
    </div>
  );
};

export default LegendDisplay;
