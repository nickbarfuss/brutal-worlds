import React from 'react';
import { Owner, SemanticColorPalette } from '@/types/game';
import { PLAYER_THREE_COLORS } from '@/data/theme';

interface ValueDisplayProps {
  baseValue?: string | number;
  bonusValue?: string | number;
  valueType?: 'force' | 'duration' | 'text';
  owner?: Owner;
  worldPalette?: SemanticColorPalette;
  size?: 'small' | 'large';
  ownerForces?: { owner: Owner; forces: number }[];
}

const ValueDisplay: React.FC<ValueDisplayProps> = ({ baseValue, bonusValue, valueType = 'text', owner, worldPalette, size = 'small', ownerForces }) => {
  if (baseValue === undefined && !ownerForces) return null;

  const valueContainerClasses = "flex items-center flex-shrink-0 self-center";

  const getPaletteForOwner = React.useCallback((o: Owner) => {
    if (o === 'player-1') return PLAYER_THREE_COLORS['player-1'];
    if (o === 'player-2') return PLAYER_THREE_COLORS['player-2'];
    if (worldPalette) return worldPalette;
    return null;
  }, [worldPalette]);

  const forceSizeClass = size === 'small' ? 'w-7 h-7' : 'w-9 h-9';
  const forceTextClass = size === 'small' ? 'font-medium text-sm' : 'font-semibold text-base';
  const durationTextClass = size === 'small' ? 'text-lg' : 'text-xl';
  const durationIconClass = size === 'small' ? 'text-base' : 'text-xl';

  if (valueType === 'force') {
    const uniqueOwnersWithForces = ownerForces 
        ? [...new Map(ownerForces.map(item => [item.owner, item])).values()]
            // FIX: Explicitly type sort parameters to resolve incorrect type inference.
            .sort((a: { owner: Owner; forces: number }, b: { owner: Owner; forces: number }) => b.forces - a.forces) // Sort for consistent display order
        : (owner !== undefined ? [{ owner, forces: Number(baseValue) }] : []);

    const isContested = uniqueOwnersWithForces.length > 1;

    // A. Contested Domain: Render a segmented, colored pill.
    if (isContested && worldPalette) {
        const pillHeightClass = size === 'small' ? 'h-7' : 'h-9';
        const textClass = size === 'small' ? 'text-xs px-2' : 'text-sm px-2.5';
        const visibleOwners = uniqueOwnersWithForces.filter(o => o.forces > 0);

        return (
            <div className={`flex items-stretch ${pillHeightClass} rounded-full overflow-hidden`}>
                {visibleOwners.map(({ owner, forces }) => {
                    const palette = getPaletteForOwner(owner);
                    if (!palette) return null;
                    return (
                        <div
                            key={owner || 'neutral'}
                            className="flex items-center justify-center"
                            style={{ backgroundColor: palette.base }}
                        >
                            <span
                                className={`${textClass} font-semibold`}
                                style={{ color: palette.light }}
                            >
                                {forces}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }
    
    // B. Single Owner or Default: Render a circle or a pill with a bonus.
    const singleOwner = uniqueOwnersWithForces.length === 1 ? uniqueOwnersWithForces[0].owner : owner;
    const finalPalette = getPaletteForOwner(singleOwner);
    const finalBaseValue = baseValue !== undefined ? baseValue : (uniqueOwnersWithForces.length > 0 ? uniqueOwnersWithForces[0].forces : undefined);
    
    const numericBonusValue = bonusValue !== undefined ? Number(bonusValue) : 0;
    
    if (numericBonusValue > 0 && finalPalette) {
        const pillHeightClass = size === 'small' ? 'h-7' : 'h-9';
        const baseTextClass = size === 'small' ? 'text-sm px-2.5' : 'text-base px-3';
        const bonusTextClass = size === 'small' ? 'text-xs px-2' : 'text-sm px-2.5';

        const baseBgColor = finalPalette.base;
        const baseTextColor = finalPalette.light;
        const bonusBgColor = finalPalette.dark;
        const bonusTextColor = finalPalette.text;
        
        return (
            <div className={`flex items-stretch ${pillHeightClass} rounded-full overflow-hidden ${valueContainerClasses}`}>
                <div className="flex items-center justify-center" style={{ backgroundColor: baseBgColor }}>
                    <span className={`${forceTextClass} ${baseTextClass}`} style={{ color: baseTextColor }}>{finalBaseValue}</span>
                </div>
                <div className="flex items-center justify-center" style={{ backgroundColor: bonusBgColor }}>
                    <span className={`font-semibold ${bonusTextClass}`} style={{ color: bonusTextColor }}>+{numericBonusValue}</span>
                </div>
            </div>
        );
    }

    // Default: Render a single circle
    const valueBgColor = finalPalette?.base || '#27272a'; // neutral-800
    const valueTextColor = finalPalette?.light || '#ffffff';
    
    return (
      <div 
        className={`${valueContainerClasses} justify-center rounded-full ${forceSizeClass}`} 
        style={{ backgroundColor: valueBgColor }}
      >
        <span className={forceTextClass} style={{ color: valueTextColor }}>{finalBaseValue}</span>
      </div>
    );
  }
  
  if (valueType === 'duration') {
    return (
      <div className={`${valueContainerClasses} gap-1.5`}>
        <span className={`font-semibold text-neutral-300 ${durationTextClass}`}>{baseValue}</span>
        <span className={`material-symbols-outlined text-neutral-500 ${durationIconClass}`}>hourglass_empty</span>
      </div>
    );
  }

  // Default or 'text'
  return <span className={`font-normal text-neutral-400 text-lg ${valueContainerClasses}`}>{baseValue}</span>;
};

export default ValueDisplay;