import React from 'react';
import { BriefingContent } from '@/types/game';
import Card from '@/components/ui/Card';
import ChipCard from '@/components/ui/ChipCard';
import { getAssetUrl } from '@/utils/assetUtils';

interface DisasterBriefingProps {
    content: BriefingContent;
}

const DisasterBriefing: React.FC<DisasterBriefingProps> = ({ content }) => {
    return (
        <>
            {content.imageUrl && (
                <div className="w-full aspect-video flex-shrink-0">
                    <img 
                        src={getAssetUrl(content.imageUrl)}
                        className="w-full h-full object-cover"
                        alt={`Illustration of ${content.title}`}
                    />
                </div>
            )}
            {content.disasterDescription && (
                <Card.Section title="Description">
                    <p className="text-base text-neutral-300">{content.disasterDescription}</p>
                </Card.Section>
            )}
            {content.alertPhase && (
                <Card.Section title="Alert Phase">
                    <ChipCard icon="looks_one" iconColorClass="text-amber-400" title={content.alertPhase.name} subtitle={content.alertPhase.effect} baseValue={content.alertPhase.duration} valueType="duration" />
                </Card.Section>
            )}
            {content.impactPhase && (
                <Card.Section title="Impact Phase">
                    <ChipCard icon="looks_two" iconColorClass="text-amber-400" title={content.impactPhase.name} subtitle={content.impactPhase.effect} baseValue={content.impactPhase.duration} valueType="duration" />
                </Card.Section>
            )}
            {content.aftermathPhase && (
                <Card.Section title="Aftermath Phase">
                    <ChipCard icon="looks_3" iconColorClass="text-amber-400" title={content.aftermathPhase.name} subtitle={content.aftermathPhase.effect} baseValue={content.aftermathPhase.duration} valueType="duration" />
                </Card.Section>
            )}
        </>
    );
};

export default DisasterBriefing;