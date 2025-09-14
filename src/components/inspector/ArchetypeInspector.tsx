import React from 'react';
import { ARCHETYPES } from '@/data/archetypes';
import { BIRTHRIGHTS } from '@/data/birthrights';
import { ARCHETYPE_PROFILES } from '@/data/gambits';
import ChipCard from '@/components/ui/ChipCard';
import Card from '@/components/ui/Card';
import { PlayerIdentifier } from '@/types/game';
import { THEME_CONFIG } from '@/data/theme';
import { getAssetUrl } from '@/utils/assetUtils';

interface ArchetypeInspectorProps {
  owner: PlayerIdentifier;
  archetypeKey: string | null;
  legacyIndex: number | null;
  onClose: () => void;
}

const ArchetypeInspector: React.FC<ArchetypeInspectorProps> = ({ owner, archetypeKey, legacyIndex, onClose }) => {
  const isPlayer1 = owner === 'player-1';
  const archetype = archetypeKey ? ARCHETYPES[archetypeKey] : null;
  const legacy = archetype && legacyIndex !== null ? archetype.legacies[legacyIndex] : null;
  const birthright = legacy ? BIRTHRIGHTS[legacy.birthrightKey] : null;

  const playerTheme = isPlayer1 ? THEME_CONFIG.player1 : THEME_CONFIG.player2;
  const iconColorClass = `text-${playerTheme}-400`;
  const subtitleColorClass = `text-${playerTheme}-300`;
  const text = isPlayer1 ? 'Player 1' : 'Player 2';

  if (!archetype || !legacy || !birthright) {
    return (
        <div className="flex-grow overflow-y-auto no-scrollbar">
            <Card.Header title={text} subtitle="Archetype not selected." onClose={onClose} />
        </div>
    );
  }

  const legacyVideo = legacy.videoUrl;

  return (
    <>
      <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex-shrink-0">
          <Card.Header 
            icon={archetype.icon}
            iconColorClass={iconColorClass}
            title={archetype.name}
            subtitle={legacy.name}
            subtitleColorClass={subtitleColorClass}
            onClose={onClose}
          />
      </div>
      <div className="flex-grow overflow-y-auto no-scrollbar">
        {legacyVideo && (
          <div className="w-full aspect-video bg-black flex-shrink-0">
              <video
                  key={getAssetUrl(legacyVideo)}
                  src={getAssetUrl(legacyVideo)} 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover" 
                  aria-hidden="true"
              />
          </div>
        )}
        <Card.Section title="Legacy">
          <p className="text-base text-neutral-300">{legacy.description}</p>
        </Card.Section>
        <Card.Section title="Birthright">
          <ChipCard
            icon={birthright.icon}
            iconColorClass={iconColorClass}
            title={birthright.name}
            subtitle={birthright.rules}
          />
        </Card.Section>
        <Card.Section title="Gambits">
          <div className="space-y-2">
            {legacy.gambitKeys.map(key => {
              const gambit = ARCHETYPE_PROFILES[key];
              if (!gambit) return null;
              return (
                <ChipCard
                  key={key}
                  icon={gambit.icon}
                  iconColorClass={iconColorClass}
                  title={gambit.name}
                  subtitle={gambit.description}
                />
              );
            })}
          </div>
        </Card.Section>
      </div>
    </>
  );
};

export default ArchetypeInspector;