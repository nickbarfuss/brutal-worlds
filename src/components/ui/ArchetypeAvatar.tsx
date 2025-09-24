import React from 'react';
import { ARCHETYPES } from '@/data/archetypes';
import { ASSETS } from '@/data/assets';
import { PlayerIdentifier } from '@/types/game';
import { THEME } from '@/data/theme';
import { getAssetUrl, getNestedAsset } from '@/utils/assetUtils';
import { toCamelCase } from '@/utils/stringUtils';

interface ArchetypeAvatarProps {
  owner: PlayerIdentifier;
  archetypeKey: string | null;
  legacyKey: string | null;
}

const ArchetypeAvatar: React.FC<ArchetypeAvatarProps> = ({ owner, archetypeKey, legacyKey }) => {
  const isPlayer1 = owner === 'player-1';
  const archetype = archetypeKey ? ARCHETYPES[archetypeKey] : null;
  const legacy = archetype && legacyKey ? archetype.legacies[legacyKey] : null;

  // Dynamic class names based on player
  const playerTheme = isPlayer1 ? THEME.player1 : THEME.player2;
  const mainBgColorClass = `bg-${playerTheme}-800`;
  const mainBorderColorClass = `border-${playerTheme}-500`;
  const legacyBgColorClass = `bg-${playerTheme}-600`;
  const legacyIconColorClass = `text-${playerTheme}-200`;

  // Image URL
  const imageUrl =
    archetype && legacy
      ? getAssetUrl(
          getNestedAsset(
            ASSETS,
            `archetype.${toCamelCase(archetype.key)}.${toCamelCase(legacy.key)}.avatar`
          )
        )
      : null;
    
  return (
    <div className="relative w-[100px] h-[100px] flex-shrink-0">
      <div className={`w-full h-full rounded-full border-2 ${mainBorderColorClass} ${mainBgColorClass} flex items-center justify-center overflow-hidden shadow-lg`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={archetype ? `${archetype.name} avatar` : 'Player avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`material-symbols-outlined text-6xl text-${playerTheme}-400`}>
            {archetype?.icon}
          </span>
        )}
      </div>

      {archetype && (
        <div className={`absolute bottom-0 right-0 w-9 h-9 rounded-full ${legacyBgColorClass} grid place-items-center border-2 ${mainBorderColorClass}`}>
          <span className={`material-symbols-outlined text-xl ${legacyIconColorClass}`}>
            {archetype.icon}
          </span>
        </div>
      )}
    </div>
  );
};

export default ArchetypeAvatar;
