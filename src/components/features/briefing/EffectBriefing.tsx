import React from 'react';
import { BriefingContent } from '@/types/game';
import Card from '@/components/ui/Card';
import { getAssetUrl } from '@/utils/assetUtils';

interface EffectBriefingProps {
    content: BriefingContent;
}

const EffectBriefing: React.FC<EffectBriefingProps> = ({ content }) => {
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
            {content.description && (
                <Card.Section title="Description">
                    <p className="text-base text-neutral-300">{content.description}</p>
                </Card.Section>
            )}
            {content.effect && (
                <Card.Section title="Effect">
                    <p className="text-base text-neutral-300">{content.effect}</p>
                </Card.Section>
            )}
        </>
    );
};

export default EffectBriefing;