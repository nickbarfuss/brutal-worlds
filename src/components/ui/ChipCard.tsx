import React, { useMemo } from 'react';
import { Owner, SemanticColorPalette, BriefingType } from '@/types/game';
import { PLAYER_THREE_COLORS } from '@/data/theme';
import ValueDisplay from '@/components/ui/ValueDisplay';

// Common props for ChipCard
interface CommonChipCardProps {
  icon: string;
  subtitle?: string;
  baseValue?: string | number;
  bonusValue?: string | number;
  valueType?: 'force' | 'duration' | 'text';
  owner?: Owner;
  worldPalette?: SemanticColorPalette;
  iconColorClass?: string;
  iconBgColorClass?: string;
  iconColorHex?: string;
  briefingProps?: {
    type: BriefingType;
    key: string;
  };
  align?: 'center' | 'start';
  ownerForces?: { owner: Owner; forces: number }[];
}

// Props when ChipCard is interactive (a button)
interface InteractiveChipCardProps extends CommonChipCardProps, Omit<React.ComponentPropsWithoutRef<'button'>, 'title'> {
  onClick: () => void; // onClick is required for interactive
  title: string;
}

// Props when ChipCard is not interactive (a div)
interface NonInteractiveChipCardProps extends CommonChipCardProps, Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  onClick?: never; // onClick should not be present for non-interactive
  title: string;
}

// Union type for ChipCardProps
type ChipCardProps = InteractiveChipCardProps | NonInteractiveChipCardProps;

// FIX: Changed component definition from `React.FC` to a plain function with typed props.
// This is a common fix for subtle type inference issues where props can be unintentionally widened.
const ChipCard = ({ 
  icon, title, subtitle, baseValue, bonusValue, valueType = 'text',
  owner, worldPalette, iconColorClass, iconBgColorClass,
  iconColorHex, briefingProps, onClick, align = 'start',
  ownerForces
}: ChipCardProps) => {
  const briefingDataAttributes = briefingProps
    ? {
        'data-briefing-type': briefingProps.type,
        'data-briefing-key': briefingProps.key,
      }
    : {};

  const effectiveAlign = !subtitle ? 'center' : align;
  const alignmentClass = effectiveAlign === 'center' ? 'items-center' : 'items-start';
  const isInteractive = briefingProps || onClick; // Determine interactivity

  // Use React.ComponentPropsWithoutRef for the actual element props
  const Component = isInteractive ? 'button' : 'div';
  const componentProps = isInteractive ? { onClick } : {}; // Pass onClick only if interactive

  const interactiveClasses = isInteractive ? 'hover:bg-neutral-700/50 transition-colors duration-150' : '';
  
  const palette = useMemo(() => {
    if (owner === 'player-1') return PLAYER_THREE_COLORS['player-1'];
    if (owner === 'player-2') return PLAYER_THREE_COLORS['player-2'];
    if (worldPalette) return worldPalette;
    return null;
  }, [owner, worldPalette]);

  let finalIconColorClass = iconColorClass;
  let finalIconColorHex = iconColorHex;

  // If no override color is provided, determine color from the semantic palette.
  if (!finalIconColorClass && !finalIconColorHex) {
      if (palette) {
          finalIconColorHex = palette.icon;
      } else {
          finalIconColorClass = 'text-neutral-400';
      }
  }

  const iconStyle = finalIconColorHex ? { color: finalIconColorHex } : {};
  const effectiveIconColorClass = finalIconColorHex ? '' : finalIconColorClass;

  return (
    <Component
      className={`bg-neutral-800 rounded-lg p-3 flex w-full text-left ${alignmentClass} space-x-3 ${interactiveClasses}`}
      {...componentProps} // Spread component-specific props
      {...briefingDataAttributes}
      title={title} // Pass title here
    >
      <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${iconBgColorClass || 'bg-transparent'}`}>
        <span className={`material-symbols-outlined text-2xl ${effectiveIconColorClass}`} style={iconStyle}>{icon}</span>
      </div>
      <div className="flex-grow min-w-0">
        <p className="font-semibold text-gray-200 text-lg" title={title}>{title}</p>
        {subtitle && <p className="text-base text-neutral-500" title={subtitle}>{subtitle}</p>}
      </div>
      <ValueDisplay
        baseValue={baseValue}
        bonusValue={bonusValue}
        valueType={valueType}
        owner={owner}
        worldPalette={worldPalette}
        size="small"
        ownerForces={ownerForces}
      />
    </Component>
  );
};

export default ChipCard;