import React from 'react';
import ArchetypeAvatar from '@/components/ui/ArchetypeAvatar';
import { PlayerIdentifier } from '@/types/core';

interface PlayerDisplayProps {
  owner: PlayerIdentifier;
  archetypeKey: string | null;
  legacyKey: string | null;
  onClick: () => void;
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ owner, archetypeKey, legacyKey, onClick }) => {
  return (
    <button 
      className="relative group pointer-events-auto transform transition-transform duration-200 hover:scale-110"
      onClick={onClick}
      aria-label={`View ${owner === 'player-1' ? 'Player 1' : 'Opponent'} details`}
    >
      <ArchetypeAvatar owner={owner} archetypeKey={archetypeKey} legacyKey={legacyKey} />
    </button>
  );
};

export default PlayerDisplay;