import { Enclave, PendingOrders, Route, OrderType, EventQueueItem } from '@/types/game.ts';
import { getAssistMultiplierForEnclave } from '@/logic/birthrights';
import { ORDERS } from '@/data/orders.ts';
import { v4 as uuidv4 } from 'uuid';

interface ClickResult {
    newSelectedEnclaveId: number | null;
    newInspectedEnclaveId: number | null;
    isCardVisible: boolean;
    updatedOrders: PendingOrders;
    events: EventQueueItem[];
}

export const handleSingleClick = (
    clickedEnclaveId: number | null,
    selectedEnclaveId: number | null,
    enclaveData: { [id: number]: Enclave },
    routes: Route[],
    playerPendingOrders: PendingOrders,
    isCtrlPressed: boolean,
): ClickResult => {
    const events: EventQueueItem[] = [];

    // 1. Handle click on empty space (deselects everything)
    if (clickedEnclaveId === null) {
        const deselectedEnclave = selectedEnclaveId !== null ? enclaveData[selectedEnclaveId] : null;
        if (deselectedEnclave) {
            events.push({
                id: uuidv4(),
                playMode: 'immediate',
                position: deselectedEnclave.center,
                sfx: { key: 'order-commandMode-sfx-exit', channel: 'fx', position: deselectedEnclave.center },
            });
        }
        return {
            newSelectedEnclaveId: null,
            newInspectedEnclaveId: null,
            isCardVisible: false,
            updatedOrders: playerPendingOrders,
            events,
        };
    }

    const clickedEnclave = enclaveData[clickedEnclaveId];
    if (!clickedEnclave) return { newSelectedEnclaveId: null, newInspectedEnclaveId: null, isCardVisible: false, updatedOrders: playerPendingOrders, events };

    // 2. HIGHEST PRIORITY: Handle Ctrl+Click to enter/switch command mode.
    if (isCtrlPressed && clickedEnclave.owner === 'player-1') {
        const newSelectedId = selectedEnclaveId === clickedEnclaveId ? null : clickedEnclaveId;
        const sfxKey = newSelectedId !== null
            ? `order-commandMode-sfx-enter`
            : 'order-commandMode-sfx-exit';
        events.push({
            id: uuidv4(),
            playMode: 'immediate',
            position: clickedEnclave.center,
            sfx: { key: sfxKey, channel: 'fx', position: clickedEnclave.center },
        });
        return {
            newSelectedEnclaveId: newSelectedId,
            newInspectedEnclaveId: clickedEnclaveId,
            isCardVisible: true,
            updatedOrders: playerPendingOrders,
            events,
        };
    }

    // 3. Handle interactions when already in command mode.
    if (selectedEnclaveId !== null) {
        const originEnclave = enclaveData[selectedEnclaveId];
        if (!originEnclave) {
             const deselectedEnclave = selectedEnclaveId !== null ? enclaveData[selectedEnclaveId] : null;
             if (deselectedEnclave) {
                events.push({
                    id: uuidv4(),
                    playMode: 'immediate',
                    position: deselectedEnclave.center,
                    sfx: { key: 'order-commandMode-sfx-exit', channel: 'fx', position: deselectedEnclave.center },
                });
            }
            return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders, events };
        }
        
        // 3a. Self-click: Issue a "Hold" order by canceling the current one.
        if (clickedEnclaveId === selectedEnclaveId) {
            const newOrders = { ...playerPendingOrders };
            if (newOrders[selectedEnclaveId]) {
                delete newOrders[selectedEnclaveId];
                const profile = ORDERS.hold; // Use 'hold'
                const vfxKey = `order-${profile.key}-vfx`;
                const sfxKey = `order-${profile.key}-sfx`;

                if (profile.assets.vfx) {
                    events.push({
                        id: uuidv4(),
                        playMode: 'immediate',
                        vfx: [vfxKey],
                        position: clickedEnclave.center,
                    });
                }
                if (profile.assets.sfx) {
                    events.push({
                        id: uuidv4(),
                        playMode: 'immediate',
                        position: clickedEnclave.center,
                        sfx: { key: sfxKey, channel: 'fx', position: clickedEnclave.center },
                    });
                }
                return {
                    newSelectedEnclaveId: null, // Exit command mode
                    newInspectedEnclaveId: clickedEnclaveId,
                    isCardVisible: true,
                    updatedOrders: newOrders,
                    events,
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
                    const profile = ORDERS[orderType];
                    const vfxKey = `order-${profile.key}-vfx`;
                    const sfxKey = `order-${profile.key}-sfx`;
                    const updatedOrders = { ...playerPendingOrders, [selectedEnclaveId]: { to: clickedEnclaveId, type: orderType }};
                    
                    if (profile.assets.vfx) {
                        events.push({
                            id: uuidv4(),
                            playMode: 'immediate',
                            vfx: [vfxKey],
                            position: clickedEnclave.center,
                        });
                    }
                    if (profile.assets.sfx) {
                         events.push({
                            id: uuidv4(),
                            playMode: 'immediate',
                            position: originEnclave.center,
                            sfx: { key: sfxKey, channel: 'fx', position: originEnclave.center },
                        });
                    }
                    return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders, events };
                } else {
                    // Invalid order due to insufficient forces
                    return {
                        newSelectedEnclaveId: selectedEnclaveId,
                        newInspectedEnclaveId: clickedEnclaveId,
                        isCardVisible: true,
                        updatedOrders: playerPendingOrders,
                        events,
                    };
                }
            }
        }
        
        // 3c. Click on anything else (invalid target, etc.): Deselect.
        events.push({
            id: uuidv4(),
            playMode: 'immediate',
            position: originEnclave.center,
            sfx: { key: 'order-commandMode-sfx-exit', channel: 'fx', position: originEnclave.center },
        });
        return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders, events };

    } else {
        // 4. Default action: Not in command mode, so just inspect.
        return {
            newSelectedEnclaveId: null,
            newInspectedEnclaveId: clickedEnclaveId,
            isCardVisible: true,
            updatedOrders: playerPendingOrders,
            events,
        };
    }
};

interface DoubleClickResult {
    updatedOrders: PendingOrders;
    newSelectedEnclaveId: number;
    events: EventQueueItem[];
}

export const handleDoubleClick = (
    enclaveId: number,
    enclaveData: { [id: number]: Enclave },
    playerPendingOrders: PendingOrders,
): DoubleClickResult => {
    const clickedEnclave = enclaveData[enclaveId];
    const events: EventQueueItem[] = [];
    if (!clickedEnclave) {
        // Should not happen, but as a safeguard.
        return {
            updatedOrders: playerPendingOrders,
            newSelectedEnclaveId: enclaveId,
            events,
        };
    }
    // A double click on a player-owned enclave always enters command mode.
    const sfxKey = `order-commandMode-sfx-enter`;
    events.push({
        id: uuidv4(),
        playMode: 'immediate',
        position: clickedEnclave.center,
        sfx: { key: sfxKey, channel: 'fx', position: clickedEnclave.center },
    });
    return {
        updatedOrders: playerPendingOrders,
        newSelectedEnclaveId: enclaveId,
        events,
    };
};