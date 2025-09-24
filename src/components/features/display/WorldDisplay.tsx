
import React from 'react';
import { Owner } from '@/types/game';
import { ICONS } from '@/data/icons';
import { THEME_THREE } from '@/data/theme';

interface WorldDisplayProps {
  planetName: string;
  hoveredEntity: {
    name: string;
    type: 'enclave' | 'domain' | 'rift' | 'expanse';
    owner: Owner;
  } | null;
  onSurrender: () => void;
  onToggleSettings: () => void;
  isIntroComplete: boolean;
}

const WorldDisplay: React.FC<WorldDisplayProps> = ({
  planetName, hoveredEntity,
  onSurrender, onToggleSettings, isIntroComplete
}) => {
  
  const getHoverStyles = (owner: Owner) => {
    if (owner === 'player-1') return { textColorHex: THEME_THREE['player-1'].text, fontWeight: 'font-semibold' };
    if (owner === 'player-2') return { textColorHex: THEME_THREE['player-2'].text, fontWeight: 'font-semibold' };
    return { textColorHex: '#9ca3af', fontWeight: 'font-normal' }; // neutral-400
  };

  const renderHoveredEntity = () => {
    if (hoveredEntity) {
      const { textColorHex, fontWeight } = getHoverStyles(hoveredEntity.owner);
      const style = { color: textColorHex };

      return (
        <div className="flex items-center justify-start gap-2 transition-opacity duration-200">
          <span className={`material-symbols-outlined`} style={style}>{ICONS.entity[hoveredEntity.type as keyof typeof ICONS.entity]}</span>
          <p className={`text-xl ${fontWeight}`} style={style}>{hoveredEntity.name}</p>
        </div>
      );
    }
    return null;
  };
  
  const renderActionButtons = () => {
    return (
        <div className="flex items-center justify-start gap-2 text-sm">
            <button
              onClick={onToggleSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-neutral-300 bg-neutral-800 rounded-full transition-colors hover:bg-neutral-700"
              aria-label="Open Settings"
            >
              <span className="material-symbols-outlined text-base">settings</span>
            </button>
            <button
              onClick={onSurrender}
              className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-red-400 bg-neutral-800 rounded-full transition-colors hover:bg-red-900/50 hover:text-red-300"
              aria-label="Surrender Game"
            >
              <span className="material-symbols-outlined text-base">flag</span>
              Surrender
            </button>
        </div>
    );
  };
  
  return (
    <div className={`text-left w-auto max-w-md ${isIntroComplete ? '' : 'pointer-events-none'}`}>
      <h1 className="text-6xl font-bold text-white font-title">
          {planetName}
      </h1>

      <div className="min-h-[2.25rem] flex items-center justify-start mt-2">
        {hoveredEntity ? renderHoveredEntity() : renderActionButtons()}
      </div>
    </div>
  );
};

export default WorldDisplay;
