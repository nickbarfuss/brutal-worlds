import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Enclave, Domain, Rift, Expanse, Route } from '@/logic/world/world.types';
import { PendingOrders } from '@/logic/orders/orders.types';
import { ActiveEventMarker } from '@/logic/events/events.types';
import { WorldProfile } from '@/types/world';
import { InspectedEntity, BriefingType } from '@/types/game'; // Keep these for now
import { Vector3 } from 'three'; // Import directly from three
import Card from '@/components/ui/Card';
import EnclaveInspector from '@/components/features/inspector/EnclaveInspector';
import WorldInspector from '@/components/features/inspector/WorldInspector';
import DomainInspector from '@/components/features/inspector/DomainInspector';
import RiftInspector from '@/components/features/inspector/RiftInspector';
import ExpanseInspector from '@/components/features/inspector/ExpanseInspector';
import { CONFIG as GameConfig } from '@/data/config';
import EventInspector from '@/components/features/inspector/EventInspector';
import ArchetypeInspector from '@/components/features/inspector/ArchetypeInspector';

// GSAP is loaded globally via script tag in index.html
declare const gsap: any;

interface InspectorCardProps {
  isVisible: boolean;
  isClosing: boolean;
  inspectedEntity: InspectedEntity | null;
  selectedEnclaveId: number | null;
  enclaveData: { [id: number]: Enclave };
  domainData: { [id: number]: Domain };
  riftData: { [id: number]: Rift };
  expanseData: { [id: number]: Expanse };
  pendingOrders: PendingOrders;
  routes: Route[];
  currentWorld: WorldProfile | null;
  activeEventMarkers: ActiveEventMarker[];
  gameConfig: typeof GameConfig;
  onFocusEnclave: (id: number) => void;
  onFocusVector: (vector: Vector3) => void;
  onShowBriefing: (type: BriefingType, contentKey: string) => void;
  onHideBriefing: () => void;
  onTriggerEvent: (key: string) => void;
  onClose: () => void;
  playerArchetypeKey: string | null;
  playerLegacyKey: string | null;
  opponentArchetypeKey: string | null;
  opponentLegacyKey: string | null;
}

const InspectorCard = React.memo(React.forwardRef<HTMLDivElement, InspectorCardProps>(({
  isVisible, isClosing, inspectedEntity, selectedEnclaveId, onTriggerEvent,
  onShowBriefing, onHideBriefing, onClose, onFocusVector, 
  playerArchetypeKey, playerLegacyKey, opponentArchetypeKey, opponentLegacyKey,
  ...rest
}, ref) => {
  const hoveredBriefingRef = useRef<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const wasSelectedRef = useRef(false);
  const cardIdRef = useRef<string | null>(null);
  const isVisibleRef = useRef(isVisible);

  const isSelected = inspectedEntity?.type === 'enclave' && selectedEnclaveId === inspectedEntity.id;

  useLayoutEffect(() => {
    const element = (ref as React.RefObject<HTMLDivElement>)?.current;
    if (!element || typeof gsap === 'undefined') return;

    if (isVisible && !isVisibleRef.current) {
        // Animate in when it becomes visible
        gsap.fromTo(element, 
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.2, ease: 'power1.out' }
        );
    }
    
    if (isClosing) {
        // Animate out when closing starts
        gsap.to(element, {
            opacity: 0,
            y: 8,
            duration: 0.2,
            ease: 'power1.in'
        });
    }

    isVisibleRef.current = isVisible;
  }, [isVisible, isClosing, ref]);

  useEffect(() => {
    const getCardIdentifier = (entity: InspectedEntity | null) => {
        if (!entity) return null;
        if (entity.type === 'world') return 'world';
        if (entity.type === 'archetype') return `archetype-${entity.owner}`;
        return 'id' in entity ? `${entity.type}-${entity.id}` : null;
    }
    const cardIdentifier = getCardIdentifier(inspectedEntity);

    if (cardIdRef.current !== cardIdentifier) {
        wasSelectedRef.current = isSelected;
        cardIdRef.current = cardIdentifier;
        setIsConfirming(false);
        return;
    }
    
    if (wasSelectedRef.current && !isSelected) {
      setIsConfirming(true);
      const timer = setTimeout(() => setIsConfirming(false), 600);
      return () => clearTimeout(timer);
    }

    wasSelectedRef.current = isSelected;
  }, [isSelected, inspectedEntity]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const chip = (e.target as HTMLElement).closest('[data-briefing-key]') as HTMLElement | null;
    const key = chip?.dataset.briefingKey ?? null;

    if (key === hoveredBriefingRef.current) return;
    hoveredBriefingRef.current = key;

    if (chip && key) {
      const type = chip.dataset.briefingType as BriefingType;
      onShowBriefing(type, key);
    } else {
      onHideBriefing();
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') {
      hoveredBriefingRef.current = null;
      onHideBriefing();
    }
  };

  const renderContent = () => {
    if (!inspectedEntity || !rest.currentWorld) return null;

    switch (inspectedEntity.type) {
      case 'enclave': {
        const enclave = rest.enclaveData[inspectedEntity.id as number];
        if (!enclave) return null;
        return (
          <EnclaveInspector
            enclave={enclave}
            enclaveData={rest.enclaveData}
            domainData={rest.domainData}
            pendingOrders={rest.pendingOrders}
            routes={rest.routes}
            currentWorld={rest.currentWorld}
            activeEventMarkers={rest.activeEventMarkers}
            isSelected={enclave.id === selectedEnclaveId}
            isConfirming={isConfirming}
            onFocusEnclave={rest.onFocusEnclave}
            gameConfig={rest.gameConfig}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          />
        );
      }
      case 'world':
        return (
          <WorldInspector
            world={rest.currentWorld}
            domainData={rest.domainData}
            enclaveData={rest.enclaveData}
            riftData={rest.riftData}
            expanseData={rest.expanseData}
            onTriggerEvent={onTriggerEvent}
            onFocusVector={onFocusVector}
            onClose={onClose}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          />
        );
      case 'domain': {
        const domain = rest.domainData[inspectedEntity.id as number];
        if (!domain) return null;
        return (
          <DomainInspector 
            domain={domain} 
            enclaveData={rest.enclaveData} 
            world={rest.currentWorld}
            onPointerMove={handlePointerMove} 
            onPointerLeave={handlePointerLeave} 
          />
        );
      }
      case 'rift': {
        const rift = rest.riftData[inspectedEntity.id as number];
        if (!rift) return null;
        return <RiftInspector entity={rift} activeEventMarkers={rest.activeEventMarkers} enclaveData={rest.enclaveData} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} />;
      }
      case 'expanse': {
        const expanse = rest.expanseData[inspectedEntity.id as number];
        if (!expanse) return null;
        return <ExpanseInspector entity={expanse} activeEventMarkers={rest.activeEventMarkers} enclaveData={rest.enclaveData} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} />;
      }
      case 'event': {
        const marker = rest.activeEventMarkers.find(m => m.id === inspectedEntity.id);
        if (!marker) return null;
        return <EventInspector marker={marker} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave} />;
      }
      case 'archetype': {
        const { owner } = inspectedEntity;
        const archetypeKey = owner === 'player-1' ? playerArchetypeKey : opponentArchetypeKey;
        const legacyKey = owner === 'player-1' ? playerLegacyKey : opponentLegacyKey;
        if (!archetypeKey || !legacyKey) return null;
        return (
          <ArchetypeInspector
            owner={owner}
            archetypeKey={archetypeKey}
            legacyKey={legacyKey}
            onClose={onClose}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          />
        );
      }
      default:
        return null;
    }
  };

  const content = renderContent();
  
  const isArchetypeInspector = inspectedEntity?.type === 'archetype';
  const positionClass = isArchetypeInspector ? 'top-8 left-8' : 'top-8 right-8';
  const maxHeightClass = isArchetypeInspector ? 'max-h-[calc(100vh-14rem)]' : 'max-h-[calc(100vh-4rem)]';

  return (
    <div className={`fixed ${positionClass} z-30 w-96 pointer-events-none ${!content || (!isVisible && !isClosing) ? 'opacity-0' : ''}`}>
      {content && (
        <Card 
          ref={ref}
          className={`bg-neutral-900 border border-neutral-700/50 rounded-xl w-full flex flex-col shadow-lg overflow-hidden ${maxHeightClass} ${!isVisible && !isClosing ? 'pointer-events-none' : 'pointer-events-auto'}`}
        >
          {content}
        </Card>
      )}
    </div>
  );
}));

InspectorCard.displayName = 'InspectorCard';
export default InspectorCard;
