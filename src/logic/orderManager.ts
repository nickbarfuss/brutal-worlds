import { Enclave, PendingOrders, Route, OrderType, Order } from '@/types/game.ts';
import { getAssistMultiplierForEnclave } from '@/data/birthrightManager.ts';
import { ORDER_PROFILES } from '@/data/orders.ts';

export const handleSingleClick = (
    clickedEnclaveId: number | null,
    selectedEnclaveId: number | null,
    enclaveData: { [id: number]: Enclave },
    routes: Route[],
    playerPendingOrders: PendingOrders,
    isCtrlPressed: boolean
) => {
    // 1. Handle click on empty space (deselects everything)
    if (clickedEnclaveId === null) {
        const deselectedEnclave = selectedEnclaveId !== null ? enclaveData[selectedEnclaveId] : null;
        const sfxToPlay = deselectedEnclave ? { key: 'sfx-command-mode-exit', channel: 'fx' as const, position: deselectedEnclave.center } : null;
        return {
            newSelectedEnclaveId: null,
            newInspectedEnclaveId: null,
            isCardVisible: false,
            updatedOrders: playerPendingOrders,
            vfxToPlay: null,
            sfxToPlay,
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
        return {
            newSelectedEnclaveId: newSelectedId,
            newInspectedEnclaveId: clickedEnclaveId,
            isCardVisible: true,
            updatedOrders: playerPendingOrders,
            vfxToPlay: null,
            // FIX: Added position to ensure command mode sounds are spatialized.
            sfxToPlay: { key: sfxKey, channel: 'fx' as const, position: clickedEnclave.center },
        };
    }

    // 3. Handle interactions when already in command mode.
    if (selectedEnclaveId !== null) {
        const originEnclave = enclaveData[selectedEnclaveId];
        if (!originEnclave) {
             const deselectedEnclave = selectedEnclaveId !== null ? enclaveData[selectedEnclaveId] : null;
             const sfxToPlay = deselectedEnclave ? { key: 'sfx-command-mode-exit', channel: 'fx' as const, position: deselectedEnclave.center } : null;
            return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders, vfxToPlay: null, sfxToPlay };
        }
        
        // 3a. Self-click: Issue a "Hold" order by canceling the current one.
        if (clickedEnclaveId === selectedEnclaveId) {
            const newOrders = { ...playerPendingOrders };
            if (newOrders[selectedEnclaveId]) {
                delete newOrders[selectedEnclaveId];
                const vfxKey = ORDER_PROFILES.holding.vfxKey;
                const sfxKey = `sfx-order-hold-${Math.floor(Math.random() * 6) + 1}`;
                return {
                    newSelectedEnclaveId: null, // Exit command mode
                    newInspectedEnclaveId: clickedEnclaveId,
                    isCardVisible: true,
                    updatedOrders: newOrders,
                    vfxToPlay: vfxKey ? { key: vfxKey, center: clickedEnclave.center } : null,
                    sfxToPlay: { key: sfxKey, channel: 'fx' as const, position: clickedEnclave.center },
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
                    const vfxKey = ORDER_PROFILES[orderType].vfxKey;
                    const sfxKey = `sfx-order-${orderType}-${Math.floor(Math.random() * 4) + 1}`;
                    const updatedOrders = { ...playerPendingOrders, [selectedEnclaveId]: { to: clickedEnclaveId, type: orderType }};
                    return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders, vfxToPlay: vfxKey ? { key: vfxKey, center: clickedEnclave.center } : null, sfxToPlay: { key: sfxKey, channel: 'fx' as const, position: originEnclave.center } };
                }
            }
        }
        
        // 3c. Click on anything else (invalid target, self while holding, etc.): Deselect and inspect the new target.
        return { newSelectedEnclaveId: null, newInspectedEnclaveId: clickedEnclaveId, isCardVisible: true, updatedOrders: playerPendingOrders, vfxToPlay: null, sfxToPlay: { key: 'game-command-mode-exit', channel: 'fx' as const, position: originEnclave.center } };

    } else {
        // 4. Default action: Not in command mode, so just inspect the clicked entity.
        return {
            newSelectedEnclaveId: null,
            newInspectedEnclaveId: clickedEnclaveId,
            isCardVisible: true,
            updatedOrders: playerPendingOrders,
            vfxToPlay: null,
            sfxToPlay: null,
        };
    }
};

export const handleDoubleClick = (
    enclaveId: number,
    enclaveData: { [id: number]: Enclave },
    playerPendingOrders: PendingOrders
) => {
    const clickedEnclave = enclaveData[enclaveId];
    if (!clickedEnclave) {
        // Should not happen, but as a safeguard.
        return {
            updatedOrders: playerPendingOrders,
            vfxToPlay: null,
            sfxToPlay: null,
            newSelectedEnclaveId: enclaveId,
        };
    }
    // A double click on a player-owned enclave always enters command mode.
    // The logic to cancel an order has been moved to a self-click in handleSingleClick.
    const sfxKey = `sfx-command-mode-enter-${Math.floor(Math.random() * 2) + 1}`;
    return {
        updatedOrders: playerPendingOrders,
        vfxToPlay: null,
        // FIX: Added position to ensure command mode sound is spatialized.
        sfxToPlay: { key: sfxKey, channel: 'fx' as const, position: clickedEnclave.center },
        newSelectedEnclaveId: enclaveId,
    };
};