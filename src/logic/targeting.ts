import { ActiveEffectMarker, GameState, Enclave, Route } from '@/types/game';

export function getTargetEnclaves(
    target: 'occupyingEnclave' | 'affectedEnclaves' | 'targetEnclave' | 'adjacentEnclaves' | 'capitalEnclave' | 'randomNeutralEnclave',
    marker: ActiveEffectMarker,
    gameState: GameState
): Enclave[] {
    const { enclaveData, routes } = gameState;
    const enclaves = Object.values(enclaveData);

    switch (target) {
        case 'occupyingEnclave': {
            const cell = gameState.mapData[marker.cellId];
            if (cell && cell.enclaveId !== null) {
                const enclave = enclaveData[cell.enclaveId];
                if (enclave) return [enclave];
            }
            return [];
        }
        case 'affectedEnclaves':
            return marker.metadata?.targetEnclaveIds
                ?.map(id => enclaveData[id])
                .filter((e): e is Enclave => e !== undefined) || [];
        case 'targetEnclave':
             return marker.metadata?.targetEnclaveIds
                ?.map(id => enclaveData[id])
                .filter((e): e is Enclave => e !== undefined) || [];
        case 'adjacentEnclaves': {
            const adjacentEnclaveIds = new Set<number>();
            const targetEnclaves = marker.metadata?.targetEnclaveIds || [];
            for (const enclaveId of targetEnclaves) {
                routes.forEach(route => {
                    if (route.from === enclaveId) adjacentEnclaveIds.add(route.to);
                    if (route.to === enclaveId) adjacentEnclaveIds.add(route.from);
                });
            }
            return [...adjacentEnclaveIds].map(id => enclaveData[id]).filter((e): e is Enclave => e !== undefined);
        }
        case 'capitalEnclave': {
            const owner = marker.metadata?.owner;
            if (!owner) return [];
            const capital = enclaves.find(e => e.owner === owner && e.archetypeKey);
            return capital ? [capital] : [];
        }
        case 'randomNeutralEnclave': {
            const neutralEnclaves = enclaves.filter(e => e.owner === null);
            if (neutralEnclaves.length > 0) {
                return [neutralEnclaves[Math.floor(Math.random() * neutralEnclaves.length)]];
            }
            return [];
        }
        default:
            return [];
    }
}

export function getTargetRoutes(
    target: 'affectedEnclaves' | 'global' | 'targetRoute' | 'seaRoutes' | 'targetEnclave',
    marker: ActiveEffectMarker,
    gameState: GameState
): Route[] {
    const { routes } = gameState;
    switch (target) {
        case 'global':
            return routes;
        case 'seaRoutes':
            return routes.filter(r => r.type === 'sea');
        case 'targetRoute':
            // This would need more specific metadata in the marker
            return [];
        case 'affectedEnclaves':
        case 'targetEnclave': {
            const targetEnclaves = marker.metadata?.targetEnclaveIds || [];
            return routes.filter(r => targetEnclaves.includes(r.from) || targetEnclaves.includes(r.to));
        }
        default:
            return [];
    }
}
