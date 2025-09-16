
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Enclave, Domain, PendingOrders, InspectedEntity, Rift, Expanse, ActiveEffectMarker, Route, WorldProfile, Vector3, PlayerIdentifier } from '@/types/game';
import Card from '@/components/ui/Card';
import EnclaveInspector from '@/components/features/inspector/EnclaveInspector';
import WorldInspector from '@/components/features/inspector/WorldInspector';
import DomainInspector from '@/components/features/inspector/DomainInspector';
import RiftInspector from '@/components/features/inspector/RiftInspector';
import ExpanseInspector from '@/components/features/inspector/ExpanseInspector';
import { CONFIG as GameConfig } from '@/data/config';
import EffectInspector from '@/components/features/inspector/EffectInspector';
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
  activeEffectMarkers: ActiveEffectMarker[];
  gameConfig: typeof GameConfig;
  onFocusEnclave: (id: number) => void;
  onFocusVector: (vector: Vector3) => void;
  onShowBriefing: (type: 'order' | 'effect' | 'route' | 'domain' | 'effectProfile' | 'birthright' | 'effectMarker', contentKey: string) => void;
  onHideBriefing: () => void;
  onTriggerEffect: (key: string) => void;
  onClose: () => void;
  playerArchetypeKey: string | null;
  playerLegacyKey: string | null;
  opponentArchetypeKey: string | null;
  opponentLegacyKey: string | null;
}

const InspectorCard = React.memo(React.forwardRef<HTMLDivElement, InspectorCardProps>(({
  isVisible, isClosing, inspectedEntity, selectedEnclaveId, onTriggerEffect,
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
      const type = chip.dataset.briefingType as 'order' | 'effect' | 'route' | 'domain' | 'effectProfile' | 'birthright' | 'effectMarker';
      onShowBriefing(type, key);
    } else {
      onHideBriefing();
    }
  };

  const handlePointerLeave = () => {
    if (hoveredBriefingRef.current) {
        hoveredBriefingRef.current = null;
        onHideBriefing();
    }
  };

  const getContent = () => {
      if (!inspectedEntity) return null;

      const { type } = inspectedEntity;
      const { enclaveData, domainData, riftData, expanseData, currentWorld, activeEffectMarkers } = rest;
      
      const commonPointerProps = { onPointerMove: handlePointerMove, onPointerLeave: handlePointerLeave };

      if (type === 'world') {
          return currentWorld ? <WorldInspector world={currentWorld} domainData={domainData} enclaveData={enclaveData} riftData={riftData} expanseData={expanseData} onTriggerEffect={onTriggerEffect} onClose={onClose} onFocusVector={onFocusVector} {...commonPointerProps} /> : null;
      }
      if (type === 'archetype') {
          const owner = (inspectedEntity as { owner: PlayerIdentifier }).owner;
          const archetypeKey = owner === 'player-1' ? playerArchetypeKey : opponentArchetypeKey;
          const legacyKey = owner === 'player-1' ? playerLegacyKey : opponentLegacyKey;
          return <ArchetypeInspector owner={owner} archetypeKey={archetypeKey} legacyKey={legacyKey} onClose={onClose} />
      }
      if (type === 'enclave') {
          const enclave = enclaveData[inspectedEntity.id];
          return enclave ? <EnclaveInspector enclave={enclave} isSelected={isSelected} isConfirming={isConfirming} {...rest} {...commonPointerProps} /> : null;
      }
      if (type === 'domain') {
          const domain = domainData[inspectedEntity.id];
          return domain && currentWorld ? <DomainInspector domain={domain} enclaveData={enclaveData} world={currentWorld} {...commonPointerProps} /> : null;
      }
      if (type === 'rift') {
          const rift = riftData[inspectedEntity.id];
          return rift ? <RiftInspector entity={rift} enclaveData={enclaveData} activeEffectMarkers={rest.activeEffectMarkers} {...commonPointerProps} /> : null;
      }
      if (type === 'expanse') {
          const expanse = expanseData[inspectedEntity.id];
          return expanse ? <ExpanseInspector entity={expanse} enclaveData={enclaveData} activeEffectMarkers={rest.activeEffectMarkers} {...commonPointerProps} /> : null;
      }
      if (type === 'effect') {
          const marker = (activeEffectMarkers || []).find(m => m.id === (inspectedEntity as { id: string }).id);
          return marker ? <EffectInspector marker={marker} {...commonPointerProps} /> : null;
      }
      return null;
  };

  const content = getContent();
  
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
