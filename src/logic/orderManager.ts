import { Enclave, PendingOrders, Route, OrderType } from '@/types/game.ts';
import { getAssistMultiplierForEnclave } from '@/logic/birthrightManager.ts';
import { ORDER_PROFILES } from '@/data/orders.ts';
import { VfxManager } from './VfxManager';
import { SfxManager } from './SfxManager';


export const handleSingleClick = (
    clickedEnclaveId: number | null,
    selectedEnclaveId: number | null,
    enclaveData: { [id: number]: Enclave },
    routes: Route[],
    playerPendingOrders: PendingOrders,
    isCtrlPressed: boolean,
    vfxManager: VfxManager,
    sfxManager: SfxManager
) => {

    // 1. Handle click on empty space (deselects everything)
    if (clickedEnclaveId === null) {
        const deselectedEnclave = selectedEnclaveId !== null ? enclaveData[selectedEnclaveId] : null;
        if (deselectedEnclave) {
            sfxManager.playSound('order-commandMode-sfx-exit', 'fx', deselectedEnclave.center);
        }
        return {
            newSelectedEnclaveId: null,
            newInspectedEnclaveId: null,
            isCardVisible: false,
            updatedOrders: playerPendingOrders,
        };
    }

    const clickedEnclave = enclaveData[clickedEnclaveId];
    if (!clickedEnclave) return { newSelectedEnclaveId: null, newInspectedEnclaveId: null, isCardVisible: false, updatedOrders: playerPendingOrders };

    // 2. HIGHEST PRIORITY: Handle Ctrl+Click to enter/switch command mode.
    if (isCtrlPressed && clickedEnclave.owner === 'player-1') {
        const newSelectedId = selectedEnclaveId === clickedEnclaveId ? null : clickedEnclaveId;
        const sfxKey = newSelectedId !== null
            ? `order-commandMode-sfx-enter`
            : 'order-commandMode-sfx-exit';
        sfxManager.playSound(sfxKey, 'fx', clickedEnclave.center);
        return {
            newSelectedEnclaveId: newSelectedId,
            newInspectedEnclaveId: clickedEnclaveId,
            isCardVisible: true,
            updatedOrders: playerPendingOrders,
        };
    }

    // 3. Handle interactions when already in command mode.
    if (selectedEnclaveId !== null) {
        const originEnclave = enclaveData[selectedEnclaveId];
        if (!originEnclave) {
             const deselectedEnclave = selectedEnclaveId !== null ? enclaveData[selectedEnclaveId] : null;
             if (deselectedEnclave) {
                sfxManager.playSound('order-commandMode-sfx-exit', 'fx', deselectedEnclave.center);
            }
            return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders };
        }
        
        // 3a. Self-click: Issue a "Hold" order by canceling the current one.
        if (clickedEnclaveId === selectedEnclaveId) {
            const newOrders = { ...playerPendingOrders };
            if (newOrders[selectedEnclaveId]) {
                delete newOrders[selectedEnclaveId];
                const profile = ORDER_PROFILES.hold; // Use 'hold'
                const vfxKey = `order-${profile.key}-vfx`;
                const sfxKey = `order-${profile.key}-sfx`;

                if (profile.assets.vfx) {
                    vfxManager.playImmediateEffect(vfxKey, clickedEnclave.center);
                }
                if (profile.assets.sfx) {
                    sfxManager.playSound(sfxKey, 'fx', clickedEnclave.center);
                }
                return {
                    newSelectedEnclaveId: null, // Exit command mode
                    newInspectedEnclaveId: clickedEnclaveId,
                    isCardVisible: true,
                    updatedOrders: newOrders,
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
                        vfxManager.playImmediateEffect(vfxKey, clickedEnclave.center);
                    }
                    if (profile.assets.sfx) {
                        sfxManager.playSound(sfxKey, 'fx', originEnclave.center);
                    }
                    return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders };
                } else {
                    // Invalid order due to insufficient forces
                    return {
                        newSelectedEnclaveId: selectedEnclaveId,
                        newInspectedEnclaveId: clickedEnclaveId,
                        isCardVisible: true,
                        updatedOrders: playerPendingOrders,
                    };
                }
            }
        }
        
        // 3c. Click on anything else (invalid target, etc.): Deselect.
        sfxManager.playSound('order-commandMode-sfx-exit', 'fx', originEnclave.center);
        return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders };

    } else {
        // 4. Default action: Not in command mode, so just inspect.
        return {
            newSelectedEnclaveId: null,
            newInspectedEnclaveId: clickedEnclaveId,
            isCardVisible: true,
            updatedOrders: playerPendingOrders,
        };
    }
};

export const handleDoubleClick = (
    enclaveId: number,
    enclaveData: { [id: number]: Enclave },
    playerPendingOrders: PendingOrders,
    sfxManager: SfxManager
) => {
    const clickedEnclave = enclaveData[enclaveId];
    if (!clickedEnclave) {
        // Should not happen, but as a safeguard.
        return {
            updatedOrders: playerPendingOrders,
            newSelectedEnclaveId: enclaveId,
        };
    }
    // A double click on a player-owned enclave always enters command mode.
    // The logic to cancel an order has been moved to a self-click in handleSingleClick.
    const sfxKey = `order-commandMode-sfx-enter`;
    sfxManager.playSound(sfxKey, 'fx', clickedEnclave.center);
    return {
        updatedOrders: playerPendingOrders,
        newSelectedEnclaveId: enclaveId,
    };
};