import React from 'react';
import { Enclave, Domain, PendingOrders, WorldProfile, ActiveEventMarker, Route, Owner, Order } from '@/types/game';
import { ORDER_PROFILES } from '@/data/orders';
import { PLAYER_THREE_COLORS, THEME_CONFIG } from '@/data/theme';
import { EVENT_PROFILES } from '@/data/events';
import { BIRTHRIGHTS } from '@/data/birthrights';
import { ARCHETYPES } from '@/data/archetypes';
import Card from '@/components/ui/Card';
import ChipCard from '@/components/ui/ChipCard';
import { ICONS } from '@/data/icons';
import { getAppliedModifiers } from '@/logic/events/eventProcessor';
import { getAttackBonusForEnclave, getAssistMultiplierForEnclave, getHoldBonusForEnclave } from '@/logic/birthrights';
import { calculateEnclaveTurnPreview, TurnPreview } from '@/logic/game/previewManager'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { getAssetUrl } from '@/utils/assetUtils';
import { CONFIG as GameConfig } from '@/data/config';

interface EnclaveInspectorProps {
    enclave: Enclave;
    enclaveData: { [id: number]: Enclave };
    domainData: { [id: number]: Domain };
    pendingOrders: PendingOrders;
    routes: Route[];
    currentWorld: WorldProfile | null;
    activeEventMarkers: ActiveEventMarker[];
    isSelected: boolean;
    isConfirming: boolean;
    gameConfig: typeof GameConfig;
    onFocusEnclave: (id: number) => void;
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const getPaletteForOwner = (owner: Owner, worldProfile: WorldProfile | null) => {
    if (owner === 'player-1') return PLAYER_THREE_COLORS['player-1'];
    if (owner === 'player-2') return PLAYER_THREE_COLORS['player-2'];
    if (worldProfile) return worldProfile.neutralColorPalette;
    // Fallback default
    return {
        base: '#737373', hover: '#a3a3a3', target: '#d4d4d4', selected: '#d4d4d4',
        light: '#fafafa', dark: '#262626', disabled: '#404040', icon: '#d4d4d4', text: '#d4d4d4'
    };
};

const EnclaveInspector: React.FC<EnclaveInspectorProps> = ({
    enclave, enclaveData, domainData, pendingOrders, routes, currentWorld, activeEventMarkers,
    isSelected, isConfirming, onFocusEnclave, gameConfig,
    onPointerMove, onPointerLeave
}) => {
    
    const palette = getPaletteForOwner(enclave.owner, currentWorld);
    const gameState = { enclaveData, domainData, routes, currentWorld, activeEventMarkers, pendingOrders, gameConfig };

    const outgoingOrder = pendingOrders[enclave.id];
    const incomingOrders = (Object.entries(pendingOrders) as [string, Order][]).filter(([, order]) => order.to === enclave.id);
    
    // FIX: Check marker metadata for targetEnclaveIds.
    const eventMarkers = (activeEventMarkers || []).filter(m => m.metadata && m.metadata.targetEnclaveIds && m.metadata.targetEnclaveIds.includes(enclave.id));
    const affectedRoutes = routes.filter(r => 
        (r.from === enclave.id || r.to === enclave.id) && 
        (r.isDestroyed || r.disabledForTurns > 0)
    );

    let outgoingOrderValues: { base: number, bonus: number } = { base: 0, bonus: 0 };
    const safeCurrentForces = Number.isFinite(enclave.forces) ? enclave.forces : 0;

    if (outgoingOrder) {
        const rules = enclave.activeEvents.flatMap(event => {
            const profile = EVENT_PROFILES[event.profileKey];
            if (!profile) return [];
            const phaseLogic = profile.logic[event.phase];
            return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
        });
        const { combatModifier } = getAppliedModifiers(enclave, rules, gameState as any);
        if (outgoingOrder.type === 'attack') {
            const baseForces = Math.ceil(safeCurrentForces * 0.35);
            outgoingOrderValues.base = Math.floor(baseForces * combatModifier);
            outgoingOrderValues.bonus = 1 + getAttackBonusForEnclave(enclave);
        } else if (outgoingOrder.type === 'assist') {
            const assistMultiplier = getAssistMultiplierForEnclave(enclave);
            outgoingOrderValues.base = Math.ceil(safeCurrentForces * assistMultiplier);
        }
    } else { // Holding
        if (enclave.owner) {
            const rules = enclave.activeEvents.flatMap(event => {
                const profile = EVENT_PROFILES[event.profileKey];
                if (!profile) return [];
                const phaseLogic = profile.logic[event.phase];
                return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
            });
            const { productionModifier } = getAppliedModifiers(enclave, rules, gameState as any);
            const reinforcements = 2 + getHoldBonusForEnclave(enclave);
            outgoingOrderValues.base = Math.floor(reinforcements * productionModifier);
            outgoingOrderValues.bonus = 0; // Bonus is now part of the base value.
        }
    }
    
    const incomingOrderSubtitles: { [key: string]: string } = {
      attack: 'Attacking',
      assist: 'Assisting',
    };

    const outgoingOrderTarget = outgoingOrder ? enclaveData[outgoingOrder.to] : null;

    const memeticResonanceSource = React.useMemo(() => {
        if (enclave.owner !== null) return null;
        const neighborIds = new Set<number>();
        routes.forEach(route => {
            if (route.from === enclave.id) neighborIds.add(route.to);
            if (route.to === enclave.id) neighborIds.add(route.from);
        });
        for (const neighborId of neighborIds) {
            const neighbor = enclaveData[neighborId];
            if (neighbor && neighbor.archetypeKey === 'pactWhisperer' && !pendingOrders[neighbor.id]) {
                return neighbor;
            }
        }
        return null;
    }, [enclave.id, enclave.owner, routes, enclaveData, pendingOrders]);
    
    const allEvents = React.useMemo(() => {
        const events: { id: string; category: string; component: React.ReactElement }[] = [];
        
        eventMarkers.forEach(marker => {
            const profile = EVENT_PROFILES[marker.profileKey];
            if (!profile) return;
            events.push({
                id: marker.id, category: 'Disaster',
                // FIX: Get icon from profile, use durationInPhase from marker.
                component: <ChipCard key={marker.id} icon={profile.ui.icon} iconColorClass="text-amber-400" baseValue={marker.durationInPhase} valueType="duration" briefingProps={{ type: 'event', key: `event-${enclave.id}-${marker.id}` }} title={profile.logic.alert.name} subtitle={profile.ui.name} />
            });
        });
    
        enclave.activeEvents.forEach(event => {
            const profile = EVENT_PROFILES[event.profileKey];
            if (!profile) return;
            const phaseName = event.phase === 'alert' ? profile.logic.alert.name : (event.phase === 'impact' ? profile.logic.impact.name : (event.phase === 'aftermath' ? profile.logic.aftermath.name : ''));
            events.push({
                id: event.id, category: 'Disaster',
                // FIX: Property 'icon' does not exist on type 'ActiveEvent'. Get it from the profile.
                component: <ChipCard key={event.id} icon={profile.ui.icon} iconColorClass="text-amber-400" baseValue={event.duration > 0 ? event.duration : undefined} valueType="duration" briefingProps={{ type: 'event', key: `event-${enclave.id}-${event.id}` }} title={phaseName} subtitle={profile.ui.name} />
            });
        });
    
        if (memeticResonanceSource) {
            const birthright = BIRTHRIGHTS['memeticResonance'];
            const ownerTheme = memeticResonanceSource.owner === 'player-1' ? THEME_CONFIG.player1 : THEME_CONFIG.player2;
            events.push({
                id: 'memeticResonance', category: 'Birthright',
                component: <ChipCard key="memeticResonance" icon={birthright.icon} iconColorClass={`text-${ownerTheme}-400`} title={birthright.name} subtitle="Forces being drained" briefingProps={{ type: 'birthright', key: `memeticResonance-${memeticResonanceSource.owner}` }} />
            });
        }
    
        return events;
    }, [enclave.id, enclave.activeEvents, eventMarkers, memeticResonanceSource]);
    
    const eventsByCategory = React.useMemo(() => allEvents.reduce((acc, event) => {
        (acc[event.category] = acc[event.category] || []).push(event.component);
        return acc;
    }, {} as Record<string, React.ReactElement[]>), [allEvents]);
    
    const eventCategories = Object.keys(eventsByCategory);

    const turnPreview = React.useMemo(() => {
        if (!currentWorld) return null;
        return calculateEnclaveTurnPreview(enclave, enclaveData, pendingOrders, gameConfig, activeEventMarkers, routes);
    }, [enclave, enclaveData, pendingOrders, gameConfig, currentWorld, activeEventMarkers, routes]);

    const renderFooter = () => {
        if (!turnPreview || turnPreview.status === 'unchanged') {
            return null;
        }
    
        let icon = 'help';
        let message = '';
        let iconColorClass = 'text-neutral-400';
        
        const conquerorArchetype = turnPreview.conqueror && turnPreview.conqueror.archetypeKey ? ARCHETYPES[turnPreview.conqueror.archetypeKey] : null;
        
        switch (turnPreview.status) {
            case 'conquered':
                if (turnPreview.newForces >= turnPreview.originalForces) {
                    icon = 'workspace_premium';
                    iconColorClass = 'text-red-400';
                    message = `A crushing victory for the ${conquerorArchetype ? conquerorArchetype.name : 'Unknown'}`;
                } else {
                    icon = 'license';
                    iconColorClass = 'text-red-400';
                    message = `A pyrrhic victory for the ${conquerorArchetype ? conquerorArchetype.name : 'Unknown'}`;
                }
                break;
            case 'neutralized':
                icon = 'skull';
                iconColorClass = 'text-red-400';
                message = turnPreview.neutralizedByAttack ? `Mutual Annihilation` : `Neutralizing`;
                break;
            case 'strengthened':
            case 'substantiallyStrengthened':
                icon = turnPreview.status === 'strengthened' ? 'keyboard_arrow_up' : 'keyboard_double_arrow_up';
                iconColorClass = 'text-green-400';
                message = turnPreview.status === 'strengthened' ? 'Strengthening' : 'Substantially strengthening';
                break;
            case 'weakened':
                icon = 'keyboard_arrow_down';
                iconColorClass = 'text-amber-400';
                message = `Weakening`;
                break;
            case 'substantiallyWeakened':
                icon = 'keyboard_double_arrow_down';
                iconColorClass = 'text-amber-400';
                message = `Substantially Weakening`;
                break;
        }
    
        return (
            <Card.Footer>
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <span className={`material-symbols-outlined flex-shrink-0 ${iconColorClass}`}>{icon}</span>
                    <p className="truncate" title={message}>{message}</p>
                </div>
            </Card.Footer>
        );
    };

    return (
        <>
            <div className="sticky top-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex-shrink-0">
                {enclave.owner === 'player-1' && (
                  <div className="w-full h-2 bg-neutral-800 overflow-hidden relative">
                    {isConfirming ? (<div className="h-full bg-[var(--color-accent-400)] animate-confirm-order"></div>)
                    : isSelected ? (<div className="h-full w-1/2 bg-[var(--color-accent-400)] absolute top-0 left-0 animate-indeterminate"></div>)
                    : null}
                  </div>
                )}
                <div role="button" onClick={() => onFocusEnclave(enclave.id)}>
                    <Card.Header 
                        icon={ICONS.entity.enclave}
                        iconColorHex={palette.icon}
                        title={enclave.name}
                        subtitle={domainData[enclave.domainId] ? domainData[enclave.domainId].name : 'Unknown Domain'}
                        baseValue={Math.round(safeCurrentForces)}
                        valueType='force'
                        owner={enclave.owner}
                        worldPalette={currentWorld ? currentWorld.neutralColorPalette : undefined}
                    />
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto no-scrollbar" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
                <div className="w-full aspect-video">
                    <img 
                        src={getAssetUrl(enclave.imageUrl)}
                        className="w-full h-full object-cover"
                        alt={`Illustration of ${enclave.name}`}
                    />
                </div>

                {enclave.owner !== null ? (
                    <Card.Section title="Orders" hasContent={true}>
                        {outgoingOrder ? (
                            <ChipCard
                                icon={ORDER_PROFILES[outgoingOrder.type].icon}
                                iconColorHex={palette.icon}
                                baseValue={outgoingOrderValues.base}
                                bonusValue={outgoingOrderValues.bonus}
                                valueType="force"
                                owner={enclave.owner}
                                worldPalette={currentWorld ? currentWorld.neutralColorPalette : undefined}
                                briefingProps={{ type: 'order', key: `order-${outgoingOrder.type}-${enclave.id}-${outgoingOrder.to}` }}
                                title={outgoingOrder.type === 'attack' ? 'Attacking' : 'Assisting'}
                                subtitle={outgoingOrderTarget ? outgoingOrderTarget.name : 'Unknown'}
                            />
                        ) : (
                            <ChipCard
                                icon={ORDER_PROFILES.hold.icon}
                                iconColorHex={palette.icon}
                                baseValue={outgoingOrderValues.base}
                                bonusValue={outgoingOrderValues.bonus}
                                valueType="force"
                                owner={enclave.owner}
                                worldPalette={currentWorld ? currentWorld.neutralColorPalette : undefined}
                                briefingProps={{ type: 'order', key: `order-hold-${enclave.id}` }}
                                title="Holding"
                                subtitle={enclave.name}
                            />
                        )}
                    </Card.Section>
                ) : (
                    <Card.Section title="Description">
                        <p className="text-base text-neutral-300">The unconquered natives of this region are unable to issue orders.</p>
                    </Card.Section>
                )}

                <Card.Section title="Incoming" hasContent={incomingOrders.length > 0}>
                   {incomingOrders.map(([fromId, order]) => {
                      const currentFromEnclave = enclaveData[parseInt(fromId, 10)]; // Renamed variable
                      if (!currentFromEnclave) return null; // Use renamed variable
                      
                      const rules = currentFromEnclave.activeEvents.flatMap(event => {
                        const profile = EVENT_PROFILES[event.profileKey];
                        if (!profile) return [];
                        const phaseLogic = profile.logic[event.phase];
                        return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
                      });
                      const { combatModifier } = getAppliedModifiers(currentFromEnclave, rules, gameState as any);
                      const safeForces = Number.isFinite(currentFromEnclave.forces) ? currentFromEnclave.forces : 0; // Use renamed variable

                      let incomingValues = { base: 0, bonus: 0 };
                      if (order.type === 'attack') {
                          const baseForces = Math.ceil(safeForces * 0.35);
                          incomingValues.base = Math.floor(baseForces * combatModifier);
                          incomingValues.bonus = 1 + getAttackBonusForEnclave(currentFromEnclave); // Use renamed variable
                      } else if (order.type === 'assist') {
                          const assistMultiplier = getAssistMultiplierForEnclave(currentFromEnclave); // Use renamed variable
                          incomingValues.base = Math.ceil(safeForces * assistMultiplier);
                      }
    
                      return (
                         <ChipCard
                            key={fromId}
                            icon={ORDER_PROFILES[order.type].icon}
                            baseValue={incomingValues.base}
                            bonusValue={incomingValues.bonus}
                            valueType="force"
                            owner={currentFromEnclave.owner} // Use renamed variable
                            worldPalette={currentWorld ? currentWorld.neutralColorPalette : undefined}
                            briefingProps={{ type: 'order', key: `order-${order.type}-${fromId}-${enclave.id}` }}
                            title={incomingOrderSubtitles[order.type]}
                            subtitle={currentFromEnclave.name} // Use renamed variable
                        />
                      );
                   })}
                </Card.Section>
                <Card.Section title="Events" hasContent={allEvents.length > 0}>
                    {eventCategories.length > 1 ? (
                        <div className="space-y-4">
                            {eventCategories.map(category => (
                                <div key={category}>
                                    <h4 className="font-semibold text-neutral-400 mb-2 px-1">{category} Events</h4>
                                    <div className="space-y-2">
                                        {eventsByCategory[category]}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {allEvents.map(event => event.component)}
                        </div>
                    )}
                </Card.Section>
                <Card.Section title="Routes" hasContent={affectedRoutes.length > 0}>
                    {affectedRoutes.map(route => {
                        const otherEnclaveId = route.from === enclave.id ? route.to : route.from;
                        const otherEnclave = enclaveData[otherEnclaveId];
                        if (!otherEnclave) return null;
    
                        const isDestroyed = route.isDestroyed;
                        const subtitle = isDestroyed ? 'Destroyed' : 'Disabled';
                        const statusType = isDestroyed ? 'destroyed' : 'disabled';
                        
                        const iconColorClass = isDestroyed ? `text-${THEME_CONFIG.danger}-500` : `text-${THEME_CONFIG.warning}-400`;
                        
                        return (
                            <ChipCard
                                key={`${route.from}-${route.to}`}
                                icon={ICONS.route[statusType]}
                                iconColorClass={iconColorClass}
                                title={otherEnclave.name}
                                subtitle={subtitle}
                                baseValue={!isDestroyed && route.disabledForTurns > 0 ? route.disabledForTurns : undefined}
                                valueType="duration"
                                briefingProps={{ type: 'route', key: `route-${enclave.id}-${otherEnclaveId}` }}
                            />
                        );
                    })}
                </Card.Section>
            </div>
            {renderFooter()}
        </>
    );
};

export default EnclaveInspector;