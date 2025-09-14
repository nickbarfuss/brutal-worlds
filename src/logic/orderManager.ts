import { Enclave, PendingOrders, Route, OrderType, Order, EffectQueueItem } from '@/types/game.ts';
import { getAssistMultiplierForEnclave } from '@/logic/birthrightManager.ts';
import { ORDER_PROFILES } from '@/data/orders.ts';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three'; // Assuming THREE is needed for Vector3

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
                sfx: { key: 'sfx-command-mode-exit', channel: 'fx', position: deselectedEnclave.center },
                position: deselectedEnclave.center,
            });
        }
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

    // 2. HIGHEST PRIORITY: Handle Ctrl+Click to enter/switch command mode. This fixes the bug where
    // issuing an order could take precedence over switching selection.
    if (isCtrlPressed && clickedEnclave.owner === 'player-1') {
        const newSelectedId = selectedEnclaveId === clickedEnclaveId ? null : clickedEnclaveId;
        const sfxKey = newSelectedId !== null 
            ? `sfx-command-mode-enter-${Math.floor(Math.random() * 2) + 1}` 
            : 'sfx-command-mode-exit';
        effectsToQueue.push({
            id: uuidv4(),
            sfx: { key: sfxKey, channel: 'fx', position: clickedEnclave.center },
            position: clickedEnclave.center,
        });
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
                    sfx: { key: 'sfx-command-mode-exit', channel: 'fx', position: deselectedEnclave.center },
                    position: deselectedEnclave.center,
                });
            }
            return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders, effectsToQueue };
        }
        
        // 3a. Self-click: Issue a "Hold" order by canceling the current one.
        if (clickedEnclaveId === selectedEnclaveId) {
            const newOrders = { ...playerPendingOrders };
            if (newOrders[selectedEnclaveId]) {
                delete newOrders[selectedEnclaveId];
                const vfx = ORDER_PROFILES.holding.assets.vfx;
                const sfxKey = `sfx-order-hold-${Math.floor(Math.random() * 6) + 1}`;
                if (vfx) {
                    effectsToQueue.push({
                        id: uuidv4(),
                        vfx: vfx,
                        position: clickedEnclave.center,
                    });
                }
                effectsToQueue.push({
                    id: uuidv4(),
                    sfx: { key: sfxKey, channel: 'fx', position: clickedEnclave.center },
                    position: clickedEnclave.center,
                });
                return {
                    newSelectedEnclaveId: null, // Exit command mode
                    newInspectedEnclaveId: clickedEnclaveId,
                    isCardVisible: true,
                    updatedOrders: newOrders,
                    effectsToQueue,
                };
            }
            // If already holding, fall through to deselect/inspect.
        }

        // 3b. Click on a valid route target: Issue an Attack or Assist order.
        const route = routes.find(r => 
            ((r.from === selectedEnclaveId && r.to === clickedEnclaveId) || (r.to === selectedEnclaveId && r.from === clickedEnclaveId)) && 
            !r.isDestroyed && 
            r.disabledForTurns <= 0
        );

        if (route && clickedEnclave.id !== selectedEnclaveId) {
            const existingOrder = playerPendingOrders[selectedEnclaveId];
            if (!existingOrder || existingOrder.to !== clickedEnclaveId) {
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
                    const vfx = ORDER_PROFILES[orderType].assets.vfx;
                    const sfxKey = `sfx-order-${orderType}-${Math.floor(Math.random() * 4) + 1}`;
                    const updatedOrders = { ...playerPendingOrders, [selectedEnclaveId]: { to: clickedEnclaveId, type: orderType }};
                    if (vfx) {
                        effectsToQueue.push({
                            id: uuidv4(),
                            vfx: vfx,
                            position: clickedEnclave.center,
                        });
                    }
                    effectsToQueue.push({
                        id: uuidv4(),
                        sfx: { key: sfxKey, channel: 'fx', position: originEnclave.center },
                        position: originEnclave.center,
                    });
                    return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders, effectsToQueue };
                } else {
                    // Invalid order due to insufficient forces: Stay in command mode, no SFX/VFX as requested
                    return {
                        newSelectedEnclaveId: selectedEnclaveId, // Stay in command mode
                        newInspectedEnclaveId: clickedEnclaveId,
                        isCardVisible: true,
                        updatedOrders: playerPendingOrders, // Do not update orders
                        effectsToQueue, // No new effects
                    };
                }
            }
        }
        
        // 3c. Click on anything else (invalid target, self while holding, etc.): Deselect and inspect the new target.
        effectsToQueue.push({
            id: uuidv4(),
            sfx: { key: 'sfx-command-mode-exit', channel: 'fx', position: originEnclave.center },
            position: originEnclave.center,
        });
        return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders, effectsToQueue };

    } else {
        // 4. Default action: Not in command mode, so just inspect the clicked entity.
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
    const sfxKey = `sfx-command-mode-enter-${Math.floor(Math.random() * 2) + 1}`;
    effectsToQueue.push({
        id: uuidv4(),
        sfx: { key: sfxKey, channel: 'fx', position: clickedEnclave.center },
        position: clickedEnclave.center,
    });
    return {
        updatedOrders: playerPendingOrders,
        effectsToQueue,
        newSelectedEnclaveId: enclaveId,
    };
};