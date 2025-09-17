import { Enclave, PendingOrders, Route, OrderType, EffectQueueItem } from '@/types/game.ts';
import { getAssistMultiplierForEnclave } from '@/logic/birthrightManager.ts';
import { ORDER_PROFILES } from '@/data/orders.ts';
import { v4 as uuidv4 } from 'uuid';


export const handleSingleClick = (
    clickedEnclaveId: number | null,
    selectedEnclaveId: number | null,
    enclaveData: { [id: number]: Enclave },
    routes: Route[],
    playerPendingOrders: PendingOrders,
    isCtrlPressed: boolean
) => {
    const effectsToQueue: EffectQueueItem[] = [];

    // 1. Handle click on empty space (deselects everything)
    if (clickedEnclaveId === null) {
        const deselectedEnclave = selectedEnclaveId !== null ? enclaveData[selectedEnclaveId] : null;
        if (deselectedEnclave) {
            effectsToQueue.push({
                id: uuidv4(),
                playMode: 'immediate',
                sfx: { key: 'order-commandMode-sfx-exit', channel: 'fx', position: deselectedEnclave.center },
                position: deselectedEnclave.center,
            });
        }
        console.log('[OrderManager] Effects generated:', effectsToQueue.map(e => ({id: e.id, sfx: e.sfx?.key, vfx: e.vfx?.[0]})));
        return {
            newSelectedEnclaveId: null,
            newInspectedEnclaveId: null,
            isCardVisible: false,
            updatedOrders: playerPendingOrders,
            effectsToQueue, // Return effects to queue
        };
    }

    const clickedEnclave = enclaveData[clickedEnclaveId];
    if (!clickedEnclave) return { newSelectedEnclaveId: null, newInspectedEnclaveId: null, isCardVisible: false, updatedOrders: playerPendingOrders, vfxToPlay: null, sfxToPlay: null };

    // 2. HIGHEST PRIORITY: Handle Ctrl+Click to enter/switch command mode.
    if (isCtrlPressed && clickedEnclave.owner === 'player-1') {
        const newSelectedId = selectedEnclaveId === clickedEnclaveId ? null : clickedEnclaveId;
        const sfxKey = newSelectedId !== null
            ? `order-commandMode-sfx-enter`
            : 'order-commandMode-sfx-exit';
        effectsToQueue.push({
            id: uuidv4(),
                playMode: 'immediate',
            sfx: { key: sfxKey, channel: 'fx', position: clickedEnclave.center },
            position: clickedEnclave.center,
        });
        console.log('[OrderManager] Effects generated:', effectsToQueue.map(e => ({id: e.id, sfx: e.sfx?.key, vfx: e.vfx?.[0]})));
        return {
            newSelectedEnclaveId: newSelectedId,
            newInspectedEnclaveId: clickedEnclaveId,
            isCardVisible: true,
            updatedOrders: playerPendingOrders,
            effectsToQueue,
        };
    }

    // 3. Handle interactions when already in command mode.
    if (selectedEnclaveId !== null) {
        const originEnclave = enclaveData[selectedEnclaveId];
        if (!originEnclave) {
             const deselectedEnclave = selectedEnclaveId !== null ? enclaveData[selectedEnclaveId] : null;
             if (deselectedEnclave) {
                effectsToQueue.push({
                    id: uuidv4(),
                playMode: 'immediate',
                    sfx: { key: 'order-commandMode-sfx-exit', channel: 'fx', position: deselectedEnclave.center },
                    position: deselectedEnclave.center,
                });
            }
            console.log('[OrderManager] Effects generated:', effectsToQueue.map(e => ({id: e.id, sfx: e.sfx?.key, vfx: e.vfx?.[0]})));
            return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders, effectsToQueue };
        }
        
        // 3a. Self-click: Issue a "Hold" order by canceling the current one.
        if (clickedEnclaveId === selectedEnclaveId) {
            const newOrders = { ...playerPendingOrders };
            if (newOrders[selectedEnclaveId]) {
                delete newOrders[selectedEnclaveId];
                const profile = ORDER_PROFILES.hold; // Use 'hold'
                const vfxKey = `order-${profile.key}-vfx`;
                const sfxKey = `order-${profile.key}-sfx`;

                if (profile.assets.vfx || profile.assets.sfx) {
                    effectsToQueue.push({
                        id: uuidv4(),
                playMode: 'immediate',
                        vfx: profile.assets.vfx ? [vfxKey] : undefined,
                        sfx: profile.assets.sfx ? { key: sfxKey, channel: 'fx', position: clickedEnclave.center } : undefined,
                        position: clickedEnclave.center,
                    });
                }
                console.log('[OrderManager] Effects generated:', effectsToQueue.map(e => ({id: e.id, sfx: e.sfx?.key, vfx: e.vfx?.[0]})));
                return {
                    newSelectedEnclaveId: null, // Exit command mode
                    newInspectedEnclaveId: clickedEnclaveId,
                    isCardVisible: true,
                    updatedOrders: newOrders,
                    effectsToQueue,
                };
            }
        }

        // 3b. Click on a valid route target: Issue an Attack or Assist order.
        const route = routes.find(r => 
            ((r.from === selectedEnclaveId && r.to === clickedEnclaveId) || (r.to === selectedEnclaveId && r.from === clickedEnclaveId)) && 
            !r.isDestroyed && 
            r.disabledForTurns <= 0
        );

        if (route && clickedEnclave.id !== selectedEnclaveId) {
            const existingOrder = playerPendingOrders[selectedEnclaveId];
            // FIX: This logic was flawed. It should only proceed if there is NO existing order
            // or if the new order is different from the existing one. This prevents re-triggering effects.
            if (!existingOrder || existingOrder.to !== clickedEnclaveId || existingOrder.type !== (clickedEnclave.owner === originEnclave.owner ? 'assist' : 'attack')) {
                const orderType: OrderType = clickedEnclave.owner === originEnclave.owner ? 'assist' : 'attack';
                const safeForces = Number.isFinite(originEnclave.forces) ? originEnclave.forces : 0;
                let forceToSend = 0;

                if (orderType === 'assist') {
                    const assistMultiplier = getAssistMultiplierForEnclave(originEnclave);
                    forceToSend = Math.ceil(safeForces * assistMultiplier);
                } else { // Attack
                    forceToSend = Math.ceil(safeForces * 0.35);
                }

                if (safeForces - forceToSend > 0) { // Valid order condition
                    const profile = ORDER_PROFILES[orderType];
                    const vfxKey = `order-${profile.key}-vfx`;
                    const sfxKey = `order-${profile.key}-sfx`;
                    const updatedOrders = { ...playerPendingOrders, [selectedEnclaveId]: { to: clickedEnclaveId, type: orderType }};
                    
                    if (profile.assets.vfx) {
                        effectsToQueue.push({
                            id: uuidv4(),
                            playMode: 'immediate',
                            vfx: [vfxKey],
                            position: clickedEnclave.center, // VFX at target
                        });
                    }
                    if (profile.assets.sfx) {
                        effectsToQueue.push({
                            id: uuidv4(),
                            playMode: 'immediate',
                            sfx: { key: sfxKey, channel: 'fx', position: originEnclave.center }, // SFX at origin
                            position: originEnclave.center,
                        });
                    }
                    console.log('[OrderManager] Effects generated:', effectsToQueue.map(e => ({id: e.id, sfx: e.sfx?.key, vfx: e.vfx?.[0]})));
                    return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders, effectsToQueue };
                } else {
                    // Invalid order due to insufficient forces
                    console.log('[OrderManager] Effects generated:', effectsToQueue.map(e => ({id: e.id, sfx: e.sfx?.key, vfx: e.vfx?.[0]})));
                    return {
                        newSelectedEnclaveId: selectedEnclaveId,
                        newInspectedEnclaveId: clickedEnclaveId,
                        isCardVisible: true,
                        updatedOrders: playerPendingOrders,
                        effectsToQueue,
                    };
                }
            }
        }
        
        // 3c. Click on anything else (invalid target, etc.): Deselect.
        effectsToQueue.push({
            id: uuidv4(),
                playMode: 'immediate',
            sfx: { key: 'order-commandMode-sfx-exit', channel: 'fx', position: originEnclave.center },
            position: originEnclave.center,
        });
        console.log('[OrderManager] Effects generated:', effectsToQueue.map(e => ({id: e.id, sfx: e.sfx?.key, vfx: e.vfx?.[0]})));
        return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders, effectsToQueue };

    } else {
        // 4. Default action: Not in command mode, so just inspect.
        console.log('[OrderManager] Effects generated:', effectsToQueue.map(e => ({id: e.id, sfx: e.sfx?.key, vfx: e.vfx?.[0]})));
        return {
            newSelectedEnclaveId: null,
            newInspectedEnclaveId: clickedEnclaveId,
            isCardVisible: true,
            updatedOrders: playerPendingOrders,
            effectsToQueue,
        };
    }
};

export const handleDoubleClick = (
    enclaveId: number,
    enclaveData: { [id: number]: Enclave },
    playerPendingOrders: PendingOrders
) => {
    const effectsToQueue: EffectQueueItem[] = [];
    const clickedEnclave = enclaveData[enclaveId];
    if (!clickedEnclave) {
        // Should not happen, but as a safeguard.
        return {
            updatedOrders: playerPendingOrders,
            effectsToQueue,
            newSelectedEnclaveId: enclaveId,
        };
    }
    // A double click on a player-owned enclave always enters command mode.
    // The logic to cancel an order has been moved to a self-click in handleSingleClick.
    const sfxKey = `order-commandMode-sfx-enter`;
    effectsToQueue.push({
        id: uuidv4(),
                playMode: 'immediate',
        sfx: { key: sfxKey, channel: 'fx', position: clickedEnclave.center },
        position: clickedEnclave.center,
    });
    return {
        updatedOrders: playerPendingOrders,
        effectsToQueue,
        newSelectedEnclaveId: enclaveId,
    };
};