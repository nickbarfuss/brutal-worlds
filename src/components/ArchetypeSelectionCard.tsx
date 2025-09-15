import React, { useRef, useEffect, useState } from 'react';
import { ArchetypeProfile, LegacyProfile } from '@/types/game';
import Avatar from '@/components/ui/Avatar';
import ChipCard from '@/components/ui/ChipCard';
import { BIRTHRIGHTS } from '@/data/birthrights';
import { GAMBITS } from '@/data/gambits';
import Chip from '@/components/ui/Chip';
import { getAssetUrl } from '@/utils/assetUtils';
import Card from '@/components/ui/Card';

interface ArchetypeSelectionCardProps {
  archetype: ArchetypeProfile;
  legacy: LegacyProfile;
  isSelected: boolean;
  onClick: () => void;
}

const ArchetypeSelectionCard: React.FC<ArchetypeSelectionCardProps> = ({ archetype, legacy, isSelected, onClick }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const birthright = BIRTHRIGHTS[legacy.birthrightKey];
  
  useEffect(() => {
    if (videoRef.current) {
      if (isSelected) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isSelected, legacy]);

  const handleMouseEnter = async () => {
    if (!isSelected && videoRef.current) {
      try {
        await videoRef.current.play();
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        // Play() can be interrupted by pause(), which is normal and can be ignored.
      }
    }
  };

  const handleMouseLeave = () => {
    if (!isSelected && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const mediaClasses = `absolute inset-0 w-full h-full object-cover transition-opacity duration-[250ms] ease-out filter ${isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'} ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`;
  const borderAndShadowClasses = isSelected 
    ? 'border-[var(--color-accent-500)] shadow-lg shadow-color-[var(--color-accent-500)]/20 w-[60rem]' 
    : 'border-neutral-700/50 hover:border-[var(--color-accent-500)]/50 hover:shadow-lg hover:shadow-color-[var(--color-accent-500)]/10 w-[28rem]';

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      className={`relative group flex h-full flex-shrink-0 bg-neutral-900 rounded-xl border-2 shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${borderAndShadowClasses}`}
    >
      <div className="relative w-[28rem] h-full flex-shrink-0 overflow-hidden">
          {legacy.movie && (
            <video
              ref={videoRef}
              key={legacy.movie}
              loop
              muted
              playsInline
              className={mediaClasses}
              aria-hidden="true"
              onLoadedData={() => setIsVideoLoaded(true)}
            >
              <source src={getAssetUrl(legacy.movie)} type="video/webm" />
            </video>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
           <div className="relative w-full h-full p-6 flex flex-col justify-end items-center text-center pb-10">
              <Avatar
                icon={archetype.icon}
                sizeClass="w-14 h-14"
                iconSizeClass="text-3xl"
                bgColorClass="bg-[var(--color-accent-800)]"
                iconColorClass="text-[var(--color-accent-400)]"
                className="mb-4"
              />
              <div className="mb-4">
                  <h3 className="text-4xl font-bold text-white font-title leading-tight">{archetype.name}</h3>
                  <p className="text-lg font-medium text-[var(--color-accent-300)] leading-tight">{legacy.name}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {legacy.focus.map(f => (
                  <Chip
                    key={f}
                    value={f}
                    bgColorClass="bg-[var(--color-accent-800)]"
                    valueColorClass="text-[var(--color-accent-300)] font-medium"
                  />
                ))}
              </div>
          </div>
      </div>
      
      <div 
        className="w-[32rem] flex-shrink-0 bg-neutral-900/95 backdrop-blur-sm overflow-y-auto no-scrollbar text-left flex flex-col"
        onWheel={(e) => e.stopPropagation()}
      >
          <Card.Section title="Legacy">
            <p className="text-base text-neutral-300">{legacy.description}</p>
          </Card.Section>

          {birthright && (
            <Card.Section title="Birthright">
                <ChipCard 
                    icon={birthright.icon}
                    iconColorClass="text-[var(--color-accent-400)]"
                    title={birthright.name}
                    subtitle={birthright.rules}
                />
            </Card.Section>
          )}

          <Card.Section title="Gambits">
              <div className="space-y-2">
                {legacy.gambitKeys.map(gambitKey => {
                    const gambit = GAMBITS[gambitKey];
                    if (!gambit) return null;
                    return (
                        <ChipCard 
                            key={gambitKey}
                            icon={gambit.ui.icon}
                            iconColorClass="text-[var(--color-accent-400)]"
                            title={gambit.ui.name}
                            subtitle={gambit.ui.description}
                        />
                    );
                })}
              </div>
          </Card.Section>
      </div>

    </div>
  );
};

export default ArchetypeSelectionCard;