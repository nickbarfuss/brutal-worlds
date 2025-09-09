import React from 'react';
import ValueDisplay from '@/components/ui/ValueDisplay';
import { Owner, WorldProfile } from '@/types/game';

interface CardHeaderProps {
  icon?: string;
  iconColorClass?: string;
  iconColorHex?: string;
  title: string;
  subtitle?: string;
  subtitleColorClass?: string;
  baseValue?: string | number;
  bonusValue?: string | number;
  // FIX: Added 'text' to the allowed types to match the underlying ValueDisplay component.
  valueType?: 'force' | 'duration' | 'text';
  owner?: Owner;
  worldPalette?: WorldProfile['neutralColorPalette'];
  ownerForces?: { owner: Owner; forces: number }[];
  onClose?: () => void;
}

const CardHeader: React.FC<CardHeaderProps> = ({ 
    icon, iconColorClass, iconColorHex, title, subtitle, subtitleColorClass,
    baseValue, bonusValue, valueType, owner, worldPalette, ownerForces,
    onClose
}) => {
    const iconStyle = iconColorHex ? { color: iconColorHex } : {};
    const finalIconColorClass = iconColorHex ? '' : iconColorClass;
    const finalSubtitleColorClass = subtitleColorClass || 'text-neutral-500';

    return (
      <div className="p-4 flex items-start relative">
        {icon && <span className={`material-symbols-outlined mr-3 text-3xl ${finalIconColorClass}`} style={iconStyle}>{icon}</span>}
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-gray-200 leading-tight">{title}</h3>
          {subtitle && <p className={`text-lg leading-tight -mt-0.5 ${finalSubtitleColorClass}`}>{subtitle}</p>}
        </div>
        {(baseValue !== undefined || ownerForces) && valueType && (
          <div className="ml-4">
            <ValueDisplay
                baseValue={baseValue}
                bonusValue={bonusValue}
                valueType={valueType}
                owner={owner}
                worldPalette={worldPalette}
                size="large"
                ownerForces={ownerForces}
            />
          </div>
        )}
        {onClose && (
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors p-1 rounded-full"
                aria-label="Close"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
        )}
      </div>
    );
};

interface CardSectionProps {
  title?: string;
  children: React.ReactNode;
  hasContent?: boolean; // Default to true
}

const CardSection: React.FC<CardSectionProps> = ({ title, children, hasContent = true }) => {
  if (!hasContent) return null;
  return (
    <>
      <hr className="border-neutral-700" />
      <div className="p-4">
        {title && <h4 className="font-medium text-base text-neutral-600 uppercase tracking-wider mb-2">{title}</h4>}
        <div className="space-y-2">{children}</div>
      </div>
    </>
  );
};

interface CardFooterProps {
    children: React.ReactNode;
}
  
const CardFooter: React.FC<CardFooterProps> = ({ children }) => (
    <div className="flex-shrink-0 mt-auto p-4 bg-neutral-900/80 backdrop-blur-sm border-t border-neutral-700">
        {children}
    </div>
);

interface CardComponentProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const CardRoot = React.forwardRef<HTMLDivElement, CardComponentProps>(
  ({ children, className, style, onPointerMove, onPointerLeave }, ref) => (
    <div ref={ref} className={className} style={style} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {children}
    </div>
  )
);
CardRoot.displayName = 'Card';

// FIX: Refactor to use Object.assign for creating a compound component,
// which provides better type inference for JSX.
const Card = Object.assign(CardRoot, {
    Header: CardHeader,
    Section: CardSection,
    Footer: CardFooter,
});

export default Card;