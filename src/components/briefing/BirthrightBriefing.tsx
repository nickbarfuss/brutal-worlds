import React from 'react';
import { BriefingContent } from '@/types/game';
import Card from '@/components/ui/Card';

interface BirthrightBriefingProps {
    content: BriefingContent;
}

const BirthrightBriefing: React.FC<BirthrightBriefingProps> = ({ content }) => {
    return (
        <>
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

export default BirthrightBriefing;