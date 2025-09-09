import React, { useRef, useState, useLayoutEffect } from 'react';
import { BriefingContent, WorldProfile } from '@/types/game';
import Card from '@/components/ui/Card';
import OrderBriefing from '@/components/briefing/OrderBriefing';
import EffectBriefing from '@/components/briefing/EffectBriefing';
import RouteBriefing from '@/components/briefing/RouteBriefing';
import DomainBriefing from '@/components/briefing/DomainBriefing';
import DisasterBriefing from '@/components/briefing/DisasterBriefing';
import BirthrightBriefing from '@/components/briefing/BirthrightBriefing';

type BriefingType = 'order' | 'effect' | 'route' | 'domain' | 'disasterProfile' | 'birthright' | 'disasterMarker';

interface BriefingCardProps {
    briefing: {
        content: BriefingContent;
        targetRect: DOMRect;
        parentRect: DOMRect;
        type: BriefingType;
    } | null;
    world: WorldProfile | null;
}

const BriefingCard: React.FC<BriefingCardProps> = ({ briefing, world }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

    useLayoutEffect(() => {
        const card = cardRef.current;
        if (!briefing || !card) {
            setStyle({ visibility: 'hidden' });
            return;
        }

        // Use scrollHeight for true content height
        card.style.visibility = 'hidden';
        card.style.maxHeight = '';
        card.offsetHeight; // Force a reflow to ensure the next measurement is accurate
        const cardHeight = card.scrollHeight;
        card.style.visibility = '';

        const { targetRect, parentRect } = briefing;
        const windowHeight = window.innerHeight;
        const horizontalMargin = 16; // 1rem, standardized from 8px
        const clampingMargin = 32;   // 2rem, consistent with WorldInspector

        const newStyle: React.CSSProperties = { visibility: 'visible' };

        // 1. Attempt to vertically center align with target
        let top = targetRect.top + (targetRect.height / 2) - (cardHeight / 2);

        // 2. Clamp to viewport
        if (top < clampingMargin) top = clampingMargin;
        if (top + cardHeight > windowHeight - clampingMargin) top = windowHeight - cardHeight - clampingMargin;
        top = Math.max(clampingMargin, top);
        newStyle.top = `${top}px`;

        // 3. Set maxHeight only if content overflows
        const availableHeight = windowHeight - top - clampingMargin;
        if (cardHeight > availableHeight) {
            newStyle.maxHeight = `${availableHeight}px`;
        }
        
        // 4. Set horizontal position
        newStyle.left = `${parentRect.left - horizontalMargin}px`;
        newStyle.transform = 'translateX(-100%)';
        
        setStyle(newStyle);
    }, [briefing]);

    if (!briefing) {
        return null;
    }

    const { content, type } = briefing;

    const renderBriefingContent = () => {
        switch (type) {
            case 'order':
                return <OrderBriefing content={content} />;
            case 'effect':
            case 'disasterMarker':
                return <EffectBriefing content={content} />;
            case 'route':
                return <RouteBriefing content={content} />;
            case 'domain':
                return <DomainBriefing content={content} world={world} />;
            case 'disasterProfile':
                return <DisasterBriefing content={content} />;
            case 'birthright':
                return <BirthrightBriefing content={content} />;
            default:
                return null;
        }
    };

    return (
        <Card
            ref={cardRef}
            className="fixed w-96 bg-neutral-900 rounded-xl border border-neutral-700/50 shadow-xl pointer-events-none z-40 animate-fade-in-briefing flex flex-col"
            style={style}
        >
            <Card.Header
                icon={content.icon}
                iconColorClass={content.iconColorClass}
                iconColorHex={content.iconColorHex}
                title={content.title}
                subtitle={content.subtitle}
                baseValue={content.baseValue}
                bonusValue={content.bonusValue}
                valueType={content.valueType}
                owner={content.owner}
                worldPalette={content.worldPalette}
                ownerForces={content.ownerForces}
            />
            <div className="flex-grow overflow-y-auto no-scrollbar">
                {renderBriefingContent()}
            </div>
        </Card>
    );
};

export default BriefingCard;
