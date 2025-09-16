import React, { useState } from 'react';
import { WorldProfile } from '@/types/game';
import Avatar from '@/components/ui/Avatar';
import ChipCard from '@/components/ui/ChipCard';
import { DISASTERS } from '@/data/disasters';
import { ICONS } from '@/data/icons';
import { getAssetUrl } from '@/utils/assetUtils';
import Card from '@/components/ui/Card';

interface WorldSelectionCardProps {
  world: WorldProfile;
  isSelected: boolean;
  onClick: () => void;
}

const WorldSelectionCard: React.FC<WorldSelectionCardProps> = ({ world, isSelected, onClick }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    
    const borderAndShadowClasses = isSelected 
        ? 'border-[var(--color-accent-500)] shadow-lg shadow-color-[var(--color-accent-500)]/20 w-[60rem]' 
        : 'border-neutral-700/50 hover:border-[var(--color-accent-500)]/50 hover:shadow-lg hover:shadow-color-[var(--color-accent-500)]/10 w-[28rem]';

    const domainCount = world.names.domains.length;
    const enclaveCount = world.names.domains.reduce((acc, domain) => acc + domain.enclaves.length, 0);
    const expanseCount = world.names.expanses.length;
    const riftCount = world.names.rifts.length;
    
    const StatChip = ({ icon, value }: { icon: string; value: number | string }) => (
      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-800)]">
        <span className="material-symbols-outlined mr-1.5 text-[var(--color-accent-400)] text-base leading-none">{icon}</span>
        <span className="text-[var(--color-accent-300)] font-medium">{value}</span>
      </div>
    );

    const imageClasses = `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover transition-opacity duration-[250ms] ease-out filter ${isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'} ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`;

    return (
        <div
            onClick={onClick}
            role="button"
            className={`relative group flex h-full flex-shrink-0 bg-neutral-900 rounded-xl border-2 shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${borderAndShadowClasses}`}
        >
            {/* --- LEFT PANEL (Visible by default) --- */}
            <div className="relative w-[28rem] h-full flex-shrink-0 overflow-hidden">
                <img 
                    src={getAssetUrl(world.illustrationUrl)}
                    alt={`Illustration of ${world.name}`}
                    className={imageClasses}
                    onLoad={() => setIsImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative w-full h-full p-6 flex flex-col justify-end items-center text-center pb-10">
                     <Avatar
                        icon={world.icon}
                        sizeClass="w-14 h-14"
                        iconSizeClass="text-3xl"
                        bgColorClass="bg-[var(--color-accent-800)]"
                        iconColorClass="text-[var(--color-accent-400)]"
                        className="mb-4"
                    />
                    <h3 className="text-4xl font-bold text-white mb-2 font-title">{world.name}</h3>
                    <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                        {domainCount > 0 && <StatChip icon={ICONS.entity.domain} value={domainCount} />}
                        {enclaveCount > 0 && <StatChip icon={ICONS.entity.enclave} value={enclaveCount} />}
                        {expanseCount > 0 && <StatChip icon={ICONS.entity.expanse} value={expanseCount} />}
                        {riftCount > 0 && <StatChip icon={ICONS.entity.rift} value={riftCount} />}
                    </div>
                </div>
            </div>
            
            {/* --- RIGHT PANEL (Revealed on select) --- */}
            <div 
                className="w-[32rem] flex-shrink-0 bg-neutral-900/95 backdrop-blur-sm overflow-y-auto no-scrollbar text-left flex flex-col"
                onWheel={(e) => e.stopPropagation()}
            >
                <Card.Section title="Description">
                    <p className="text-base text-gray-300">{world.description}</p>
                </Card.Section>

                {world.possibleDisasters.length > 0 && (
                    <Card.Section title="Possible Disasters">
                        <div className="space-y-2">
                            {world.possibleDisasters.map(disasterKey => {
                                const disaster = DISASTERS[disasterKey];
                                if (!disaster) return null;
                                return (
                                    <ChipCard 
                                        key={disasterKey}
                                        icon={disaster.ui.icon}
                                        iconColorClass="text-amber-400"
                                        title={disaster.ui.name}
                                        subtitle={disaster.ui.description.split('.')[0] + '.'}
                                    />
                                );
                            })}
                        </div>
                    </Card.Section>
                )}
                 {world.names.domains.map(domain => (
                    <Card.Section key={domain.name} title={domain.name}>
                        <div className="space-y-2">
                            {domain.enclaves.map(enclave => (
                                <ChipCard
                                    key={enclave.name}
                                    icon={ICONS.entity.enclave}
                                    title={enclave.name}
                                    baseValue={5}
                                    valueType="force"
                                    owner={null}
                                    worldPalette={world.neutralColorPalette}
                                />
                            ))}
                        </div>
                    </Card.Section>
                ))}
                {world.names.expanses.length > 0 && (
                     <Card.Section title="Expanses">
                        <div className="space-y-2">
                            {world.names.expanses.map(expanseName => (
                                <ChipCard
                                    key={expanseName}
                                    icon={ICONS.entity.expanse}
                                    title={expanseName}
                                    worldPalette={world.neutralColorPalette}
                                />
                            ))}
                        </div>
                    </Card.Section>
                )}
                {world.names.rifts.length > 0 && (
                     <Card.Section title="Rifts">
                        <div className="space-y-2">
                            {world.names.rifts.map(riftName => (
                                <ChipCard
                                    key={riftName}
                                    icon={ICONS.entity.rift}
                                    title={riftName}
                                    worldPalette={world.neutralColorPalette}
                                />
                            ))}
                        </div>
                    </Card.Section>
                )}
            </div>
        </div>
    );
};

export default WorldSelectionCard;