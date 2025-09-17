import {
    ActiveEffectMarker,
    Enclave,
    GameState,
    Rule,
    EffectProfile,
    SfxPlayback,
    Vector3,
    Route,
} from '../types/game.ts';
import { getTargetEnclaves, getTargetRoutes } from './targeting.ts';
import { resolveNumericRange } from '../utils/math.ts';

export function applyInstantaneousRules(
    rules: Rule[],
    enclave: Enclave,
    routes: Route[],
    duration?: number
): { enclave: Enclave; routes: Route[] } {
    const newEnclave = { ...enclave };
    let newRoutes = [...routes];

    for (const rule of rules) {
        // Simplified logic for demonstration
        if (rule.type === 'forceDamage') {
            const damage =
                rule.payload.damageType === 'percentage'
                    ? Math.floor(newEnclave.forces * (rule.payload.value as number))
                    : (rule.payload.value as number);
            newEnclave.forces = Math.max(0, newEnclave.forces - damage);
        } else if (rule.type === 'routeDisable') {
            // This is a simplified placeholder. A real implementation
            // would need to properly target and modify routes.
            newRoutes = newRoutes.map(r => ({ ...r, disabledForTurns: duration || 1 }));
        }
    }

    return { enclave: newEnclave, routes: newRoutes };
}

export function applyContinuousEffects(
    enclave: Enclave,
    rules: Rule[],
    _gameState: GameState
): { productionModifier: number; combatModifier: number } {
    let productionModifier = 1;
    let combatModifier = 1;

    for (const rule of rules) {
        if (rule.type === 'statModifier') {
            if (rule.payload.stat === 'production') {
                productionModifier -= rule.payload.value as number;
            } else if (rule.payload.stat === 'combat') {
                combatModifier -= rule.payload.value as number;
            }
        }
    }

    return { productionModifier, combatModifier };
}

export function applyOneTimeEffects(
    marker: ActiveEffectMarker,
    rules: Rule[],
    gameState: GameState
) {
    for (const rule of rules) {
        if (rule.type === 'forceDamage') {
            const targetEnclaves = getTargetEnclaves(rule.payload.target, marker, gameState);
            for (const enclave of targetEnclaves) {
                const damageValue = resolveNumericRange(rule.payload.value);
                if (rule.payload.damageType === 'percentage') {
                    enclave.forces = Math.max(
                        0,
                        enclave.forces - Math.floor(enclave.forces * damageValue)
                    );
                } else {
                    enclave.forces = Math.max(0, enclave.forces - damageValue);
                }
            }
        } else if (rule.type === 'routeDisable') {
            const targetRoutes = getTargetRoutes(rule.payload.target, marker, gameState);
            for (const r of targetRoutes) {
                if (
                    rule.payload.chance === undefined ||
                    Math.random() < rule.payload.chance
                ) {
                    // Add 1 to duration because we decrement at the start of the turn
                    r.disabledForTurns = rule.payload.duration + 1;
                }
            }
        } else if (rule.type === 'routeDestroy') {
            const targetRoutes = getTargetRoutes(rule.payload.target, marker, gameState);
            for (const r of targetRoutes) {
                if (
                    rule.payload.chance === undefined ||
                    Math.random() < rule.payload.chance
                ) {
                    r.isDestroyed = true;
                }
            }
        }
    }
}

export function applyAftermathEffects(
    marker: ActiveEffectMarker,
    rules: Rule[],
    gameState: GameState
) {
    for (const rule of rules) {
        if (rule.type === 'forceDamage') {
            const targetEnclaves = getTargetEnclaves(rule.payload.target, marker, gameState);
            for (const enclave of targetEnclaves) {
                const damageValue = resolveNumericRange(rule.payload.value);
                if (rule.payload.damageType === 'flat') {
                    enclave.forces = Math.max(0, enclave.forces - damageValue);
                } else if (rule.payload.damageType === 'percentage') {
                    enclave.forces = Math.max(
                        0,
                        enclave.forces - Math.floor(enclave.forces * damageValue)
                    );
                }
            }
        } else if (rule.type === 'routeDisable' && rule.payload.chance !== undefined) {
            const targetEnclaves = getTargetEnclaves('affectedEnclaves', marker, gameState);
            for (const enclave of targetEnclaves) {
                const connectedRoutes = gameState.routes.filter(
                    r => (r.from === enclave.id || r.to === enclave.id) && !r.isDestroyed
                );
                if (connectedRoutes.length > 0 && Math.random() < rule.payload.chance) {
                    const routeToDisable =
                        connectedRoutes[Math.floor(Math.random() * connectedRoutes.length)];
                    // Add 1 to duration because we decrement at the start of the turn
                    routeToDisable.disabledForTurns = rule.payload.duration + 1;
                }
            }
        }
    }
}

export function processEffectMarker(
    marker: ActiveEffectMarker,
    gameState: GameState,
    effectProfiles: { [key: string]: EffectProfile }
): {
    updatedMarker: ActiveEffectMarker | null;
    vfxToPlay: { key: string; center: Vector3 }[];
    sfxToPlay: SfxPlayback[];
} {
    const updatedMarker: ActiveEffectMarker = { ...marker };
    const vfxToPlay: { key: string; center: Vector3 }[] = [];
    const sfxToPlay: SfxPlayback[] = [];

    const profile = effectProfiles[marker.profileKey];
    if (!profile) {
        console.warn(`Effect profile not found for key: ${marker.profileKey}`);
        return { updatedMarker: null, vfxToPlay, sfxToPlay };
    }

    updatedMarker.durationInPhase--;

    // Continuous effects are not applied here in this version.
    // They would be applied during turn resolution if needed.

    if (updatedMarker.durationInPhase <= 0) {
        const currentPhaseKey = updatedMarker.currentPhase;
        const nextPhaseKey =
            currentPhaseKey === 'alert'
                ? 'impact'
                : currentPhaseKey === 'impact'
                ? 'aftermath'
                : null;

        if (nextPhaseKey && profile.logic[nextPhaseKey]) {
            updatedMarker.currentPhase = nextPhaseKey;
            const nextPhaseProfile = profile.logic[nextPhaseKey]!;
            updatedMarker.durationInPhase = resolveNumericRange(
                nextPhaseProfile.duration as [number, number]
            );
            updatedMarker.radius =
                typeof nextPhaseProfile.radius === 'function'
                    ? nextPhaseProfile.radius()
                    : resolveNumericRange(nextPhaseProfile.radius as [number, number]);
            updatedMarker.movement = resolveNumericRange(nextPhaseProfile.movement as [number, number] | undefined);

            if (nextPhaseProfile.rules) {
                applyOneTimeEffects(updatedMarker, nextPhaseProfile.rules, gameState);
            }

            const vfx = getEffectVfx(profile, nextPhaseKey);
            if (vfx) {
                vfxToPlay.push({ key: vfx, center: updatedMarker.position });
            }
            const sfx = getEffectSfx(profile, nextPhaseKey);
            if (sfx) {
                sfxToPlay.push({
                    key: sfx,
                    channel: 'fx',
                    position: updatedMarker.position,
                });
            }
        } else {
            return { updatedMarker: null, vfxToPlay, sfxToPlay };
        }
    }

    return { updatedMarker, vfxToPlay, sfxToPlay };
}

function getEffectSfx(
    profile: EffectProfile,
    phase: 'alert' | 'impact' | 'aftermath'
): string | undefined {
    const sfxAssets = profile.ui.assets.sfx?.[phase];
    if (sfxAssets && sfxAssets.length > 0) {
        return sfxAssets[Math.floor(Math.random() * sfxAssets.length)].src;
    }
    return undefined;
}

function getEffectVfx(
    profile: EffectProfile,
    phase: 'alert' | 'impact' | 'aftermath'
): string | undefined {
    const vfxAssets = profile.ui.assets.vfx?.[phase];
    if (vfxAssets && vfxAssets.length > 0) {
        return vfxAssets[Math.floor(Math.random() * vfxAssets.length)].src;
    }
    return undefined;
}

export { applyContinuousEffects as getAppliedModifiers };