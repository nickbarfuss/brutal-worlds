import * as THREE from 'three';
import { Enclave, MapCell, ActiveEffectMarker, EffectQueueItem } from '@/types/game.ts';

interface PlainVector3 {
    x: number;
    y: number;
    z: number;
}

export const deserializeVector3 = (o: PlainVector3): THREE.Vector3 => {
    if (o && isFinite(o.x) && isFinite(o.y) && isFinite(o.z)) {
        return new THREE.Vector3(o.x, o.y, o.z);
    }
    console.warn("Attempted to deserialize a non-Vector3-like object, using fallback.", o);
    return new THREE.Vector3(0, 0, 0);
};


export const serializeVector3 = (v: THREE.Vector3): PlainVector3 => {
    if (v instanceof THREE.Vector3) {
        return { x: v.x, y: v.y, z: v.z };
    }
    console.warn("Attempted to serialize a non-Vector3 object, using fallback.", v);
    return { x: 0, y: 0, z: 0 };
};

export const serializeGameStateForWorker = (payload: any) => {
    return {
        playerPendingOrders: payload.playerPendingOrders,
        aiPendingOrders: payload.aiPendingOrders,
        routes: payload.routes,
        currentTurn: payload.currentTurn,
        gameSessionId: payload.gameSessionId,
        gameConfig: payload.gameConfig,
        mapData: (payload.mapData || []).map((cell: MapCell) => ({ ...cell, center: serializeVector3(cell.center) })),

        enclaveData: Object.fromEntries(
            Object.entries(payload.enclaveData as { [id: number]: Enclave }).map(([id, enclave]) => {
                const sanitizedEnclave = {
                    id: enclave.id,
                    name: enclave.name,
                    owner: enclave.owner,
                    forces: enclave.forces,
                    center: serializeVector3(enclave.center),
                    domainId: enclave.domainId,
                    mainCellId: enclave.mainCellId,
                    activeEffects: (enclave.activeEffects || []).map(effect => ({
                        id: effect.id,
                        profileKey: effect.profileKey,
                        duration: effect.duration,
                        maxDuration: effect.maxDuration,
                        phase: effect.phase,
                        metadata: effect.metadata,
                        rules: effect.rules,
                    })),
                    archetypeKey: enclave.archetypeKey,
                    imageUrl: enclave.imageUrl,
                };
                return [id, sanitizedEnclave];
            })
        ),
        
        activeEffectMarkers: (payload.activeEffectMarkers || []).map((marker: ActiveEffectMarker) => ({
            id: marker.id,
            profileKey: marker.profileKey,
            position: serializeVector3(marker.position),
            cellId: marker.cellId,
            currentPhase: marker.currentPhase,
            durationInPhase: marker.durationInPhase,
            radius: marker.radius,
            movement: marker.movement,
            effects: marker.effects,
            metadata: marker.metadata,
        })),

        // Pass through player/opponent archetype and legacy info
        playerArchetypeKey: payload.playerArchetypeKey,
        playerLegacyKey: payload.playerLegacyKey,
        opponentArchetypeKey: payload.opponentArchetypeKey,
        opponentLegacyKey: payload.opponentLegacyKey,
        playerHasHadFirstConquest: payload.playerHasHadFirstConquest,
        aiHasHadFirstConquest: payload.aiHasHadFirstConquest,
    };
};

export const serializeResolvedTurn = (result: any) => {
    return {
        newPlayerPendingOrders: result.newPlayerPendingOrders,
        newAiPendingOrders: result.newAiPendingOrders,
        newRoutes: result.newRoutes,
        newCurrentTurn: result.newCurrentTurn,
        gameOverState: result.gameOverState,
        gameSessionId: result.gameSessionId,
        playerConquests: result.playerConquests,
        aiConquests: result.aiConquests,

        newEnclaveData: Object.fromEntries(
            Object.entries(result.newEnclaveData as { [id: number]: Enclave }).map(([id, enclave]) => {
                const sanitizedEnclave = {
                    id: enclave.id,
                    name: enclave.name,
                    owner: enclave.owner,
                    forces: enclave.forces,
                    center: serializeVector3(enclave.center),
                    domainId: enclave.domainId,
                    mainCellId: enclave.mainCellId,
                    activeEffects: (enclave.activeEffects || []).map(effect => ({
                        id: effect.id,
                        profileKey: effect.profileKey,
                        duration: effect.duration,
                        maxDuration: effect.maxDuration,
                        phase: effect.phase,
                        metadata: effect.metadata,
                        rules: effect.rules,
                    })),
                    archetypeKey: enclave.archetypeKey,
                    imageUrl: enclave.imageUrl,
                };
                return [id, sanitizedEnclave];
            })
        ),
        
        newEffectMarkers: (result.newEffectMarkers || []).map((marker: ActiveEffectMarker) => ({
            id: marker.id,
            profileKey: marker.profileKey,
            position: serializeVector3(marker.position),
            cellId: marker.cellId,
            currentPhase: marker.currentPhase,
            durationInPhase: marker.durationInPhase,
            radius: marker.radius,
            movement: marker.movement,
            effects: marker.effects,
            metadata: marker.metadata,
        })),

        effectsToPlay: (result.effectsToPlay || []).map((effect: EffectQueueItem) => {
            const serializedSfx = effect.sfx ? {
                ...effect.sfx,
                position: effect.sfx.position ? serializeVector3(effect.sfx.position) : undefined,
            } : undefined;

            return {
                id: effect.id,
                vfx: effect.vfx,
                sfx: serializedSfx,
                position: serializeVector3(effect.position),
            };
        }),
    };
};

export const deserializeResolvedTurn = (result: any) => {
    if (result.newEnclaveData) {
        Object.values(result.newEnclaveData as { [id: number]: Enclave }).forEach(enclave => {
            enclave.center = deserializeVector3(enclave.center as unknown as PlainVector3);
        });
    }

    if (result.newEffectMarkers) {
        result.newEffectMarkers.forEach((marker: ActiveEffectMarker) => {
            marker.position = deserializeVector3(marker.position as unknown as PlainVector3);
        });
    }

    if (result.effectsToPlay) {
        result.effectsToPlay.forEach((effect: EffectQueueItem) => {
            effect.position = deserializeVector3(effect.position as unknown as PlainVector3);
            if (effect.sfx?.position) {
                effect.sfx.position = deserializeVector3(effect.sfx.position as unknown as PlainVector3);
            }
        });
    }
    return result;
};