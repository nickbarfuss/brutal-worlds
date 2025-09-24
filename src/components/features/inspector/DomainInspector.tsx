import React from 'react';
import { Domain, Enclave } from '@/logic/world/world.types';
import { WorldProfile } from '@/types/world';
import { Owner } from '@/types/core';
import Card from '@/components/ui/Card';
import ChipCard from '@/components/ui/ChipCard';
import { ICONS } from '@/data/icons';
import { getDomainOwner } from '@/logic/domains';
import { THEME_THREE } from '@/data/theme';

interface DomainInspectorProps {
    domain: Domain;
    enclaveData: { [id: number]: Enclave };
    world: WorldProfile;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const DomainInspector: React.FC<DomainInspectorProps> = ({ domain, enclaveData, world, onPointerMove, onPointerLeave }) => {
    const enclavesInDomain = Object.values(enclaveData).filter(e => e.domainId === domain.id).sort((a,b) => a.name.localeCompare(b.name));
    const owner = getDomainOwner(domain.id, enclaveData);
    const isContested = new Set(enclavesInDomain.map(e => e.owner)).size > 1;

    let subtitle = 'Controlled Domain';
    if (isContested) subtitle = 'Contested Domain';
    else if (owner === null) subtitle = 'Neutral Domain';

    const totalForces = enclavesInDomain.reduce((sum, e) => sum + e.forces, 0);

    const enclavesByOwner: { [key: string]: Enclave[] } = {};
    const ownerForces: { owner: Owner; forces: number }[] = [];

    if (isContested) {
        const owners: Owner[] = ['player-1', 'player-2', null];
        owners.forEach(o => {
            const enclaves = enclavesInDomain.filter(e => e.owner === o);
            if (enclaves.length > 0) {
                enclavesByOwner[String(o)] = enclaves;
                ownerForces.push({ owner: o, forces: enclaves.reduce((sum, e) => sum + e.forces, 0) });
            }
        });
    }
    
    const palette = owner === 'player-1' ? THEME_THREE['player-1'] 
                  : owner === 'player-2' ? THEME_THREE['player-2'] 
                  : world.neutralColorPalette;

    return (
        <>
            <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex-shrink-0">
                <Card.Header 
                    icon={ICONS.entity.domain}
                    iconColorHex={palette.icon}
                    title={domain.name}
                    subtitle={subtitle}
                    baseValue={totalForces}
                    valueType='force'
                    owner={owner}
                    worldPalette={world.neutralColorPalette}
                    ownerForces={ownerForces}
                />
            </div>
            <div className="flex-grow overflow-y-auto no-scrollbar" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
                 <Card.Section title="Enclaves">
                     <div className="space-y-2">
                        {enclavesInDomain.map(enclave => (
                            <ChipCard
                                key={enclave.id}
                                icon={ICONS.entity.enclave}
                                title={enclave.name}
                                baseValue={enclave.forces}
                                valueType="force"
                                owner={enclave.owner}
                                worldPalette={world.neutralColorPalette}
                            />
                        ))}
                     </div>
                </Card.Section>
            </div>
        </>
    );
};

export default DomainInspector;