import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGameEngine } from '@/hooks/useGameEngine';
import WorldCanvas, { WorldCanvasHandle } from '@/components/WorldCanvas';
import PlayerDisplay from '@/components/PlayerDisplay';
import InspectorCard from '@/components/inspector/InspectorCard';
import Snackbar from '@/components/ui/Snackbar';
import BriefingCard from '@/components/briefing/BriefingCard';
import GameOverDialog from '@/components/GameOverDialog';

import { ORDER_PROFILES } from '@/data/orders';
import { ASSETS } from '@/data/assets';
import { EFFECT_PROFILES } from '@/data/effects';
import { ARCHETYPES } from '@/data/archetypes';
import { BIRTHRIGHTS } from '@/data/birthrights';
import { getIconForRouteStatus, getIconForEntityType, getDomainOwner } from '@/utils/entityUtils';
import TurnDisplay from '@/components/TurnDisplay';
import WorldDisplay from '@/components/WorldDisplay';
import { PLAYER_THREE_COLORS, THEME_CONFIG } from '@/data/theme';
import { useWorldHighlights } from '@/hooks/useWorldHighlights';
import { BriefingContent, BriefingState, GameOverState, OrderType, Owner, WorldProfile, Enclave, Domain, IntroPhase, Vector3, EffectQueueItem, PlayerIdentifier, InspectedMapEntity, BriefingType } from '@/types/game'; // eslint-disable-line @typescript-eslint/no-unused-vars
import Backdrop from '@/components/ui/Backdrop';
import LegendDisplay from '@/components/LegendDisplay';
import VignetteOverlay from '@/components/VignetteOverlay';
import { getAppliedModifiers } from '@/logic/effectProcessor';
import { getAttackBonusForEnclave, getAssistMultiplierForEnclave, getHoldBonusForEnclave } from '@/logic/birthrightManager';
import CustomCursor from '@/components/ui/CustomCursor';
import SettingsDrawer from '@/components/SettingsDrawer';
import SurrenderConfirmDialog from '@/components/SurrenderConfirmDialog';
import { getAssetUrl } from '@/utils/assetUtils';
import { toCamelCase } from '@/utils/stringUtils';
import WarpStarsCanvas from '@/components/WarpStarsCanvas';

import ErrorBoundary from '@/components/ErrorBoundary'; // Added ErrorBoundary import

declare const gsap: any;

interface GameScreenProps {
    engine: ReturnType<typeof useGameEngine>;
}

const MemoizedSettingsDrawer = React.memo(SettingsDrawer);

const GameScreen: React.FC<GameScreenProps> = ({ engine }) => {
    const [briefing, setBriefing] = useState<BriefingState | null>(null);
    const [briefingTarget, setBriefingTarget] = useState<{ type: BriefingType, key: string } | null>(null);
    const [isClosingGameOver, setIsClosingGameOver] = useState(false);
    const [isClosingArchetypeInspector, setIsClosingArchetypeInspector] = useState(false);
    const [isClosingMapInspector, setIsClosingMapInspector] = useState(false);
    const [isClosingSettings, setIsClosingSettings] = useState(false);
    const [isSurrenderConfirmOpen, setIsSurrenderConfirmOpen] = useState(false);
    const [isClosingSurrender, setIsClosingSurrender] = useState(false);
    const [introPhase, setIntroPhase] = useState<IntroPhase>('pending');
    const [warpPhase, setWarpPhase] = useState<'idle' | 'spawning' | 'running' | 'ending'>('idle');
    const [debugCamera, setDebugCamera] = useState<THREE.PerspectiveCamera | null>(null);
    const [titleAnimationClass, setTitleAnimationClass] = useState('');
    const wasPausedBeforeSurrender = useRef(false);
    const archetypeInspectorRef = useRef<HTMLDivElement>(null);
    const mapInspectorRef = useRef<HTMLDivElement>(null);
    const worldCanvasRef = useRef<WorldCanvasHandle>(null);
    const videoEnterRef = useRef<HTMLVideoElement>(null);
    const videoExitRef = useRef<HTMLVideoElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);
    
    const newGameTimeoutRef = useRef<number | null>(null);
    const surrenderTimeoutRef = useRef<number | null>(null);
    const closeArchetypeInspectorTimeoutRef = useRef<number | null>(null);
    const closeMapInspectorTimeoutRef = useRef<number | null>(null);
    const closeSettingsTimeoutRef = useRef<number | null>(null);
    const closeSurrenderTimeoutRef = useRef<number | null>(null);

    const effectTestKey = engine.gameConfig.DISASTER_TESTING?.enabled 
        ? engine.gameConfig.DISASTER_TESTING.disasterKey 
        : null;
    const effectTestProfile = effectTestKey ? EFFECT_PROFILES[effectTestKey] : null;

    useEffect(() => {
        return () => {
            if (newGameTimeoutRef.current) clearTimeout(newGameTimeoutRef.current);
            if (surrenderTimeoutRef.current) clearTimeout(surrenderTimeoutRef.current);
            if (closeArchetypeInspectorTimeoutRef.current) clearTimeout(closeArchetypeInspectorTimeoutRef.current);
            if (closeMapInspectorTimeoutRef.current) clearTimeout(closeMapInspectorTimeoutRef.current);
            if (closeSettingsTimeoutRef.current) clearTimeout(closeSettingsTimeoutRef.current);
            if (closeSurrenderTimeoutRef.current) clearTimeout(closeSurrenderTimeoutRef.current);
        };
    }, []);
    
    const { 
        gamePhase, isIntroComplete, completeIntro, sfxManager, currentWorld, 
        gameSessionId, playerArchetypeKey, playerLegacyKey, dispatch 
    } = engine;

    useEffect(() => {
        if (gamePhase !== 'playing' || isIntroComplete || typeof gsap === 'undefined' || !currentWorld) {
            return;
        }
    
        let readyCheckInterval: number | undefined;
        let tl: any;

        const playBeginDialog = () => {
            const genericKey = 'cinematic-arrival-dialog';
            let legacyKey: string | undefined;
            if (playerArchetypeKey && playerLegacyKey) {
                legacyKey = `archetype-${playerArchetypeKey}-${playerLegacyKey}-dialog-arrival`;
            }

            let selectedKey: string | undefined;
            const randomChance = Math.random();

            if (randomChance <= 0.75 && legacyKey && sfxManager.getSoundDuration(legacyKey, 'dialog') > 0) {
                selectedKey = legacyKey;
            } else {
                selectedKey = genericKey;
            }

            if (selectedKey) {
                sfxManager.playSound(selectedKey, 'dialog');
            }
        };
    
        const startTimeline = () => {
            const handle = worldCanvasRef.current;
            if (!handle || !handle.camera || !handle.mapContainer || !handle.opacityController) return;
            
            setDebugCamera(handle.camera);
            const { camera, mapContainer, opacityController } = handle;
            
            const videoEnter = videoEnterRef.current;
            const videoExit = videoExitRef.current;

            if (!videoEnter || !videoExit || !isFinite(videoEnter.duration) || !isFinite(videoExit.duration) || !titleRef.current) {
                return;
            }

            const playWorldSounds = () => {
                if (!currentWorld) return;

                sfxManager.playSound('cinematic-intro-sfx', 'fx');
                
                const randomDialogKey = 'cinematic-intro-dialog';
                sfxManager.playSound(randomDialogKey, 'dialog');

                const dialogDuration = sfxManager.getSoundDuration(randomDialogKey, 'dialog');
                const worldIntroDialogKey = `world-${toCamelCase(currentWorld.key)}-dialog-intro`;

                if (dialogDuration > 0) {
                    setTimeout(() => {
                        sfxManager.playSound(worldIntroDialogKey, 'dialog');
                    }, dialogDuration * 1000);
                } else {
                    sfxManager.playSound(worldIntroDialogKey, 'dialog');
                }
            };

            const endQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), engine.initialCameraTarget.clone().normalize());
    
            tl = gsap.timeline({
                onComplete: () => {
                    completeIntro();
                    setIntroPhase('complete');
                    setWarpPhase('idle');
                }
            });

            const enterDuration = videoEnter.duration;
            const exitDuration = videoExit.duration;
        
            tl
                .call(() => {
                    setIntroPhase('entry');
                    videoEnter.currentTime = 0;
                    videoEnter.play();
                    sfxManager.playSound('cinematic-intro-sfx', 'fx');
                })
                .call(playWorldSounds, [], "+=1.0")
                .to({}, { duration: enterDuration / 2 - 1.0 })
                .call(() => {
                    setWarpPhase('spawning');
                })
                .to({}, { duration: enterDuration / 2 })
                .call(() => {
                    setTitleAnimationClass('animate-cinematic-title-in');
                })
                .to(camera.position, { z: 2000, duration: 0 }, "<")
                .to(camera, { fov: 120, duration: 0, onUpdate: () => camera.updateProjectionMatrix() }, "<")
                .to({}, { duration: 3.2 })
                .call(() => {
                    setIntroPhase('exit');
                    videoExit.currentTime = 0;
                    videoExit.play();
                    sfxManager.playSound('cinematic-arrival-sfx', 'fx');
                    setWarpPhase('ending');
                })
                .to({}, { 
                    duration: exitDuration,
                })
                .to(opacityController, { world: 1.0, duration: 0.5 }, "<0.4")
                .to(camera.position, { z: 34, duration: 1.6, ease: 'power1.out' }, "<")
                .to(camera, { fov: 45, duration: 1.6, ease: 'power1.out', onUpdate: () => camera.updateProjectionMatrix() }, "<")
                .to(mapContainer.quaternion, { x: endQuat.x, y: endQuat.y, z: endQuat.z, w: endQuat.w, duration: 2.2, ease: 'power1.inOut' }, "<")
                .call(() => {
                    setIntroPhase('arrival');
                })
                .to({}, { duration: 1 })
                .call(() => { setIntroPhase('letterbox-out'); })
                .to({}, { duration: 1 })
                .call(playBeginDialog)
                .to({}, { duration: 1 })
                .call(() => {
                    setIntroPhase('title-out');
                    setTitleAnimationClass('animate-cinematic-title-out');
                })
                .to({}, { duration: 1 })
                .call(() => { setIntroPhase('ui-in'); })
                .to({}, { duration: 1 });
        };
    
        readyCheckInterval = window.setInterval(() => {
            if (
                worldCanvasRef.current?.camera && 
                videoEnterRef.current?.readyState === 4 && 
                videoExitRef.current?.readyState === 4 &&
                titleRef.current
            ) {
                clearInterval(readyCheckInterval);
                readyCheckInterval = undefined;
                startTimeline();
            }
        }, 100);
    
        return () => {
            if (readyCheckInterval) clearInterval(readyCheckInterval);
            if (tl) tl.kill();
        };
    }, [gamePhase, isIntroComplete, gameSessionId, sfxManager, currentWorld, completeIntro, engine.initialCameraTarget, playerArchetypeKey, playerLegacyKey]);
    
    
    useEffect(() => {
        if (gamePhase !== 'playing') {
            setIntroPhase('pending');
        }
    }, [gamePhase]);

    useEffect(() => {
        const showCustomCursor = engine.isResolvingTurn;
        if (showCustomCursor) {
            document.body.classList.add('hide-cursor');
        } else {
            document.body.classList.remove('hide-cursor');
        }
        return () => document.body.classList.remove('hide-cursor');
    }, [engine.isResolvingTurn]);

    const { activeHighlight, convertLatLonToVector3, highlightBorderMeshes, highlightBorderMaterials, highlightBorderOpacity, permanentBorderMeshes, permanentBorderMaterials } = useWorldHighlights({
        mapData: engine.mapData,
        enclaveData: engine.enclaveData,
        domainData: engine.domainData,
        riftData: engine.riftData,
        expanseData: engine.expanseData,
        currentWorld: engine.currentWorld,
        activeHighlight: engine.activeHighlight,
        isIntroComplete: engine.isIntroComplete,
    });

    const showBriefing = useCallback((type: BriefingType, contentKey: string) => {
        setBriefingTarget({ type, key: contentKey });
    }, []);

    const hideBriefing = useCallback(() => {
        setBriefingTarget(null);
    }, []);

    const getPaletteForOwner = (owner: Owner, worldProfile: WorldProfile | null) => {
        if (owner === 'player-1') return PLAYER_THREE_COLORS['player-1'];
        if (owner === 'player-2') return PLAYER_THREE_COLORS['player-2'];
        if (worldProfile) return worldProfile.neutralColorPalette;
        return {
            base: '#737373', hover: '#a3a3a3', target: '#d4d4d4', selected: '#d4d4d4',
            light: '#fafafa', dark: '#262626', disabled: '#404040', icon: '#d4d4d4', text: '#d4d4d4'
        };
    };

    const getBriefingContent = useCallback((type: BriefingType, contentKey: string): BriefingContent | null => {
        if (type === 'order') {
            const parts = contentKey.split('-');
            const orderType = parts[1] as OrderType | 'hold';
            const fromId = parseInt(parts[2], 10);
            const toId = parts.length > 3 ? parseInt(parts[3], 10) : null;
            
            const fromEnclave = engine.enclaveData[fromId];
            if (!fromEnclave) return null;
    
            const safeForces = Number.isFinite(fromEnclave.forces) ? fromEnclave.forces : 0;
            
            const fromArchetype = fromEnclave.archetypeKey ? ARCHETYPES[fromEnclave.archetypeKey] : null;
            const palette = getPaletteForOwner(fromEnclave.owner, engine.currentWorld);
    
            if (orderType === 'attack' || orderType === 'assist') {
                if (toId === null) return null;
                const toEnclave = engine.enclaveData[toId];
                if (!toEnclave) return null;
    
                const profile = ORDER_PROFILES[orderType];
                const content: BriefingContent = {
                    icon: profile.icon,
                    iconColorHex: palette.icon,
                    title: orderType === 'attack' ? 'Attacking' : 'Assisting',
                    subtitle: toEnclave.name,
                    description: profile.description,
                    effect: profile.effect,
                    owner: fromEnclave.owner,
                    worldPalette: engine.currentWorld?.neutralColorPalette,
                    valueType: 'force',
                };
                
                if (orderType === 'attack') {
                    const rules = fromEnclave.activeEffects.flatMap(effect => {
                        const profile = EFFECT_PROFILES[effect.profileKey];
                        if (!profile) return [];
                        const phaseLogic = profile.logic[effect.phase];
                        return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
                    });
                    const { combatModifier } = getAppliedModifiers(fromEnclave, rules, engine);
                    const baseForces = Math.ceil(safeForces * 0.35);
                    content.baseValue = Math.floor(baseForces * combatModifier);
                    content.bonusValue = 1 + getAttackBonusForEnclave(fromEnclave);
                    
                    if (fromArchetype && fromEnclave.archetypeKey === 'firstSword') {
                        let legacyKey: string | null = null;
                        if (fromEnclave.owner === 'player-1') {
                            legacyKey = engine.playerLegacyKey;
                        } else if (fromEnclave.owner === 'player-2') {
                            legacyKey = engine.opponentLegacyKey;
                        }
                
                        if (legacyKey) {
                            const legacy = fromArchetype.legacies[legacyKey];
                            const birthright = BIRTHRIGHTS[legacy.birthrightKey];
                            content.birthright = {
                                name: birthright.name,
                                icon: birthright.icon,
                                effect: birthright.rules,
                            };
                        }
                    }
                } else { // assist
                    const assistMultiplier = getAssistMultiplierForEnclave(fromEnclave);
                    content.baseValue = Math.ceil(safeForces * assistMultiplier);
                    content.bonusValue = 0;

                    if (fromArchetype && fromEnclave.archetypeKey === 'labyrinthineGhost') {
                        let legacyKey: string | null = null;
                        if (fromEnclave.owner === 'player-1') {
                            legacyKey = engine.playerLegacyKey;
                        }
                        else if (fromEnclave.owner === 'player-2') {
                            legacyKey = engine.opponentLegacyKey;
                        }
                
                        if (legacyKey) {
                            const legacy = fromArchetype.legacies[legacyKey];
                            const birthright = BIRTHRIGHTS[legacy.birthrightKey];
                            content.birthright = {
                                name: birthright.name,
                                icon: birthright.icon,
                                effect: birthright.rules,
                            };
                        }
                    }
                }
                return content;
    
            } else if (orderType === 'hold') {
                const profile = ORDER_PROFILES.hold;
                const content: BriefingContent = {
                    icon: profile.icon,
                    iconColorHex: palette.icon,
                    title: 'Holding',
                    subtitle: fromEnclave.name,
                    description: profile.description,
                    effect: profile.effect,
                    owner: fromEnclave.owner,
                    worldPalette: engine.currentWorld?.neutralColorPalette,
                    valueType: 'force',
                };
    
                if (fromEnclave.owner) {
                    const rules = fromEnclave.activeEffects.flatMap(effect => {
                        const profile = EFFECT_PROFILES[effect.profileKey];
                        if (!profile) return [];
                        const phaseLogic = profile.logic[effect.phase];
                        return (phaseLogic && 'rules' in phaseLogic) ? phaseLogic.rules : [];
                    });
                    const { productionModifier } = getAppliedModifiers(fromEnclave, rules, engine);
                    const baseReinforcements = 2;
                    const bonusReinforcements = getHoldBonusForEnclave(fromEnclave);
                    const totalReinforcements = baseReinforcements + bonusReinforcements;
                    content.baseValue = Math.floor(totalReinforcements * productionModifier);
                    content.bonusValue = 0; // Bonus is part of base value
                }
    
                if (fromArchetype && (fromEnclave.archetypeKey === 'resonanceWarden' || fromEnclave.archetypeKey === 'pactWhisperer')) {
                    let legacyKey: string | null = null;
                    if (fromEnclave.owner === 'player-1') {
                        legacyKey = engine.playerLegacyKey;
                    } else if (fromEnclave.owner === 'player-2') {
                        legacyKey = engine.opponentLegacyKey;
                    }
            
                    if (legacyKey) {
                        const legacy = fromArchetype.legacies[legacyKey];
                        const birthright = BIRTHRIGHTS[legacy.birthrightKey];
                        content.birthright = {
                            name: birthright.name,
                            icon: birthright.icon,
                            effect: birthright.rules,
                        };
                    }
                }
                return content;
            }
            return null;
        }
        if (type === 'effect') {
            const parts = contentKey.split('-');
            const enclaveId = parseInt(parts[1], 10);
            const effectOrMarkerId = parts.slice(2).join('-');
            
            const enclave = engine.enclaveData[enclaveId];
            if (!enclave) return null;
    
            const effect = enclave.activeEffects.find(e => e.id === effectOrMarkerId);
            const marker = engine.activeEffectMarkers.find(m => m.id === effectOrMarkerId && m.metadata?.targetEnclaveIds?.includes(enclaveId));
    
            if (effect) {
                 const profile = EFFECT_PROFILES[effect.profileKey];
                 if (!profile) return null;
                 
                 const phaseKey = effect.phase;
                 const phaseProfile = profile.logic[phaseKey as keyof typeof profile.logic];
                 if (!phaseProfile) return null;
                 
                 return {
                     icon: profile.ui.icon,
                     iconColorClass: 'text-amber-400',
                     title: (phaseProfile as any).name,
                     subtitle: profile.ui.name,
                     description: (phaseProfile as any).description,
                     baseValue: effect.duration,
                     valueType: 'duration',
                     imageUrl: profile.ui.assets.image ? getAssetUrl(profile.ui.assets.image) : undefined,
                 };
            } else if (marker) {
                const profile = EFFECT_PROFILES[marker.profileKey];
                if (!profile) return null;
                const alertProfile = profile.logic.alert;
                return {
                    icon: profile.ui.icon,
                    iconColorClass: 'text-amber-400',
                    title: alertProfile.name,
                    subtitle: profile.ui.name,
                    description: alertProfile.description,
                    baseValue: marker.durationInPhase,
                    valueType: 'duration',
                    imageUrl: profile.ui.assets.image ? getAssetUrl(profile.ui.assets.image) : undefined,
                }
            }
            return null;
        }
        if (type === 'effectMarker') {
            const markerId = contentKey;
            const marker = engine.activeEffectMarkers.find(m => m.id === markerId);
            if (!marker) return null;
    
            const profile = EFFECT_PROFILES[marker.profileKey];
            if (!profile) return null;
    
            const phaseKey = marker.currentPhase;
            const phaseProfile = profile.logic[phaseKey as keyof typeof profile.logic];
            if (!phaseProfile) return null;
    
            return {
                icon: profile.ui.icon,
                iconColorClass: 'text-amber-400',
                title: (phaseProfile as any).name,
                subtitle: profile.ui.name,
                description: (phaseProfile as any).description,
                baseValue: marker.durationInPhase,
                valueType: 'duration',
                imageUrl: profile.ui.assets.image ? getAssetUrl(profile.ui.assets.image) : undefined,
            };
        }
        if (type === 'effectProfile') {
            const profile = EFFECT_PROFILES[contentKey];
            if (!profile) return null;
        
            return {
                icon: profile.ui.icon,
                iconColorClass: 'text-amber-400',
                title: profile.ui.name,
                description: profile.ui.description,
                imageUrl: profile.ui.assets.image ? getAssetUrl(profile.ui.assets.image) : undefined,
            };
        }
        if (type === 'birthright') {
            let birthrightKey = contentKey;
            let owner: Owner = null;
        
            // Special handling for Memetic Resonance, which includes the source owner in its key
            if (contentKey.startsWith('memeticResonance-')) {
                const parts = contentKey.split('-');
                birthrightKey = parts[0]; // Reconstruct 'memeticResonance'
                owner = parts[1] as Owner; // 'player-1' or 'player-2'
            }
        
            const profile = BIRTHRIGHTS[birthrightKey];
            if (!profile) return null;
        
            const palette = getPaletteForOwner(owner, engine.currentWorld);
        
            return {
                icon: profile.icon,
                iconColorHex: palette.icon,
                title: profile.name,
                description: profile.description,
                effect: profile.rules,
            };
        }
        if (type === 'route') {
            const [, fromIdStr, toIdStr] = contentKey.split('-');
            const fromId = parseInt(fromIdStr, 10);
            const toId = parseInt(toIdStr, 10);
            const route = engine.routes.find(r => (r.from === fromId && r.to === toId) || (r.to === fromId && r.from === toId));
            if (!route) return null;

            const inspectingEnclave = engine.enclaveData[fromId];
            if (!inspectingEnclave) return null;

            const otherEnclave = engine.enclaveData[toId];
            if (!otherEnclave) return null;

            const isDestroyed = route.isDestroyed;
            const subtitle = isDestroyed ? 'Destroyed' : 'Disabled';
            const icon = getIconForRouteStatus(isDestroyed ? 'destroyed' : 'disabled');
            const iconColorClass = isDestroyed ? `text-${THEME_CONFIG.danger}-500` : `text-${THEME_CONFIG.warning}-400`;

            return {
                icon: icon,
                iconColorClass: iconColorClass,
                title: otherEnclave.name,
                subtitle: subtitle,
                description: isDestroyed
                    ? 'This route has been permanently destroyed and cannot be used.'
                    : `This route is temporarily disabled and will be usable again in ${route.disabledForTurns} turn(s).`,
                baseValue: !isDestroyed && route.disabledForTurns > 0 ? route.disabledForTurns : undefined,
                valueType: 'duration'
            };
        }
        if (type === 'domain' && engine.currentWorld) {
            const domainEntry = Object.entries(engine.domainData).find(([, d]: [string, Domain]) => d.name === contentKey);
            if (!domainEntry) return null;
            const [domainId, domain] = domainEntry;
            
            const enclavesInDomain = (Object.values(engine.enclaveData) as Enclave[]).filter(e => e.domainId === parseInt(domainId, 10));
            const totalForces = enclavesInDomain.reduce((acc, e: Enclave) => acc + (Number.isFinite(e.forces) ? e.forces : 0), 0);
    
            const enclavesByOwner: BriefingContent['enclavesByOwner'] = {};
            enclavesInDomain.forEach((e: Enclave) => {
                const ownerKey = String(e.owner);
                if (!enclavesByOwner[ownerKey]) enclavesByOwner[ownerKey] = [];
                enclavesByOwner[ownerKey].push({ id: e.id, name: e.name, forces: Number.isFinite(e.forces) ? e.forces : 0, owner: e.owner });
            });
    
            const ownerForces: BriefingContent['ownerForces'] = Object.entries(enclavesByOwner).map(([ownerKey, enclaves]) => ({
                owner: ownerKey === 'null' ? null : ownerKey as Owner,
                forces: enclaves.reduce((acc, e) => acc + e.forces, 0)
            }));
    
            const domainOwner = getDomainOwner(parseInt(domainId, 10), engine.enclaveData);
            const isContested = new Set(enclavesInDomain.map(e => e.owner)).size > 1;

            let subtitle: string;
            if (isContested) {
                subtitle = 'Contested Domain';
            } else if (domainOwner === null) {
                subtitle = 'Neutral Domain';
            } else {
                subtitle = 'Controlled Domain';
            }
    
            return {
                icon: getIconForEntityType('domain'),
                iconColorHex: engine.currentWorld.neutralColorPalette.icon,
                title: domain.name,
                subtitle: subtitle,
                enclaves: enclavesInDomain.map((e: Enclave) => ({ id: e.id, name: e.name, forces: Number.isFinite(e.forces) ? e.forces : 0, owner: e.owner })),
                baseValue: totalForces,
                valueType: 'force',
                owner: domainOwner,
                worldPalette: engine.currentWorld.neutralColorPalette,
                ownerForces: ownerForces,
                isContested: isContested,
                enclavesByOwner: enclavesByOwner
            };
        }
        return null;
    }, [engine]);

    useEffect(() => {
        const parentEl = engine.inspectedArchetypeOwner ? archetypeInspectorRef.current : mapInspectorRef.current;
        const target = parentEl?.querySelector(`[data-briefing-key="${briefingTarget?.key}"]`);
        
        if (target && parentEl && briefingTarget) {
            const content = getBriefingContent(briefingTarget.type, briefingTarget.key);
            if (content) {
                setBriefing({
                    content,
                    targetRect: target.getBoundingClientRect(),
                    parentRect: parentEl.getBoundingClientRect(),
                    type: briefingTarget.type
                });
            }
        } else {
            setBriefing(null);
        }
    }, [briefingTarget, getBriefingContent, engine.inspectedArchetypeOwner, engine.inspectedMapEntity, engine]);

    const handleNewGame = () => {
        setIsClosingGameOver(true);
        if (newGameTimeoutRef.current) clearTimeout(newGameTimeoutRef.current);
        newGameTimeoutRef.current = window.setTimeout(() => {
            engine.resetGame();
            setIsClosingGameOver(false);
        }, 300);
    };
    
    const handleSurrender = () => {
        if (!engine.isPaused) {
            wasPausedBeforeSurrender.current = false;
            engine.togglePause();
        } else {
            wasPausedBeforeSurrender.current = true;
        }
        setIsSurrenderConfirmOpen(true);
    };

    const handleConfirmSurrender = () => {
        setIsClosingSurrender(true);
        if (surrenderTimeoutRef.current) clearTimeout(surrenderTimeoutRef.current);
        surrenderTimeoutRef.current = window.setTimeout(() => {
            engine.goToMainMenu();
            setIsSurrenderConfirmOpen(false);
            setIsClosingSurrender(false);
        }, 300);
    };
    
    const handleCancelSurrender = () => {
        setIsClosingSurrender(true);
        if (closeSurrenderTimeoutRef.current) clearTimeout(closeSurrenderTimeoutRef.current);
        closeSurrenderTimeoutRef.current = window.setTimeout(() => {
            if (!wasPausedBeforeSurrender.current) {
                engine.togglePause();
            }
            setIsSurrenderConfirmOpen(false);
            setIsClosingSurrender(false);
        }, 300);
    };

    const handleCloseArchetypeInspector = () => {
        setIsClosingArchetypeInspector(true);
        if (closeArchetypeInspectorTimeoutRef.current) clearTimeout(closeArchetypeInspectorTimeoutRef.current);
        closeArchetypeInspectorTimeoutRef.current = window.setTimeout(() => {
            engine.setInspectedArchetypeOwner(null);
            setIsClosingArchetypeInspector(false);
        }, 200);
    };
    
    const handleCloseMapInspector = () => {
        if (engine.inspectedMapEntity?.type === 'world') {
            engine.setWorldInspectorManuallyClosed(true);
        }
        setIsClosingMapInspector(true);
        if (closeMapInspectorTimeoutRef.current) clearTimeout(closeMapInspectorTimeoutRef.current);
        closeMapInspectorTimeoutRef.current = window.setTimeout(() => {
            engine.setInspectedMapEntity(null);
            setIsClosingMapInspector(false);
        }, 200);
    };

    const handleToggleSettings = useCallback(() => {
        if (engine.isSettingsOpen) {
            setIsClosingSettings(true);
            if (closeSettingsTimeoutRef.current) clearTimeout(closeSettingsTimeoutRef.current);
            closeSettingsTimeoutRef.current = window.setTimeout(() => {
                engine.toggleSettingsDrawer();
                setIsClosingSettings(false);
            }, 200);
        } else {
            engine.toggleSettingsDrawer();
        }
    }, [engine]);
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    
            const key = event.key.toLowerCase();
    
            if (key === 'm') {
                engine.toggleGlobalMute();
                return;
            }
    
            if (key === 'p') {
                if (engine.gamePhase === 'playing' && engine.isIntroComplete && !engine.isResolvingTurn && !isSurrenderConfirmOpen && !engine.isSettingsOpen) {
                    engine.togglePause();
                }
                return;
            }
    
            if (event.key === 'Escape') {
                if (isSurrenderConfirmOpen || engine.gameOverState !== 'none') return;

                // 1. Exit command mode (highest priority)
                if (engine.selectedEnclaveId !== null) {
                    engine.handleMapClick(null, false);
                    return;
                }

                // 2. Open/close settings drawer
                handleToggleSettings();
                return;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        handleToggleSettings, isSurrenderConfirmOpen, engine.gameOverState, engine.isSettingsOpen,
        engine.selectedEnclaveId, engine.handleMapClick, engine.toggleGlobalMute, engine.togglePause,
        engine.gamePhase, engine.isIntroComplete, engine.isResolvingTurn, 
        engine.inspectedArchetypeOwner, engine.inspectedMapEntity, engine
    ]);
    
    const enclaves: Enclave[] = Object.values(engine.enclaveData);
    const totalEnclaves = enclaves.length;
    const playerEnclaves = enclaves.filter(e => e.owner === 'player-1').length;
    const opponentEnclaves = enclaves.filter(e => e.owner === 'player-2').length;
    

    const playerPercentage = totalEnclaves > 0 ? playerEnclaves / totalEnclaves : 0;
    const opponentPercentage = totalEnclaves > 0 ? opponentEnclaves / totalEnclaves : 0;
    const neutralPercentage = 1 - playerPercentage - opponentPercentage;
    
    const uiAnimationClass = ['ui-in', 'complete'].includes(introPhase) ? 'animate-ui-fade-in' : 'opacity-0 pointer-events-none';
    
    const showGameOverDialog = engine.gameOverState !== 'none' || isClosingGameOver;
    
    const cursorClass = useMemo(() => {
        if (engine.isResolvingTurn) return '';

        if (engine.selectedEnclaveId !== null) {
            const originEnclave = engine.enclaveData[engine.selectedEnclaveId];
            if (!originEnclave) return '';

            const hoveredCell = engine.mapData[engine.hoveredCellId];
            const hoveredEnclave = (hoveredCell && hoveredCell.enclaveId !== null)
                ? engine.enclaveData[hoveredCell.enclaveId]
                : null;
            
            if (hoveredEnclave) {
                if (hoveredEnclave.id === engine.selectedEnclaveId) {
                    return 'cursor-order-hold';
                }

                if (hoveredEnclave.id !== engine.selectedEnclaveId) {
                    const existingOrder = engine.playerPendingOrders[engine.selectedEnclaveId];
                    if (existingOrder && existingOrder.to === hoveredEnclave.id) {
                        return 'cursor-order-invalid';
                    }
    
                    const route = engine.routes.find(r =>
                        ((r.from === engine.selectedEnclaveId && r.to === hoveredEnclave.id) ||
                         (r.to === engine.selectedEnclaveId && r.from === hoveredEnclave.id)) &&
                        !r.isDestroyed && r.disabledForTurns <= 0
                    );

                    if (route) {
                        return hoveredEnclave.owner === originEnclave.owner ? 'cursor-order-assist' : 'cursor-order-attack';
                    }
                }
            }
        }
        return '';
    }, [engine.isResolvingTurn, engine.selectedEnclaveId, engine.hoveredCellId, engine.enclaveData, engine.mapData, engine.routes, engine.playerPendingOrders]);
    
    const showLetterbox = introPhase === 'entry' || introPhase === 'exit' || introPhase === 'arrival';
    const letterboxAnimation = introPhase === 'entry' ? 'animate-letterbox-in' : introPhase === 'arrival' ? 'animate-letterbox-out' : '';

    const handleWorldIconClick = () => {
        engine.setWorldInspectorManuallyClosed(false);
        engine.setInspectedMapEntity({ type: 'world' });
    };

    return (
        <div className={`w-full h-full bg-black relative overflow-hidden ${cursorClass}`}>
            {engine.isResolvingTurn && <CustomCursor />}
            
            <video ref={videoEnterRef} src={getAssetUrl(ASSETS.cinematic.intro.vfx[0])} muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" style={{ display: introPhase === 'entry' ? 'block' : 'none' }} />
            <video ref={videoExitRef} src={getAssetUrl(ASSETS.cinematic.arrival.vfx[0])} muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" style={{ display: introPhase === 'exit' ? 'block' : 'none' }} />
            <WarpStarsCanvas phase={warpPhase} className="absolute inset-0 z-0" />
            
            {engine.currentWorld && (
                <WorldCanvas
                    ref={worldCanvasRef}
                    sfxManager={sfxManager}
                    effectQueue={engine.effectQueue}
                    vfxManager={engine.vfxManager}
                    convertLatLonToVector3={convertLatLonToVector3}
                    highlightBorderMeshes={highlightBorderMeshes}
                    highlightBorderMaterials={highlightBorderMaterials}
                    activeHighlight={activeHighlight}
                    highlightBorderOpacity={highlightBorderOpacity}
                    permanentBorderMeshes={permanentBorderMeshes}
                    permanentBorderMaterials={permanentBorderMaterials}
                    gameSessionId={engine.gameSessionId}
                    mapData={engine.mapData}
                    domainData={engine.domainData}
                    riftData={engine.riftData}
                    expanseData={engine.expanseData}
                    enclaveData={engine.enclaveData}
                    routes={engine.routes}
                    pendingOrders={{...engine.playerPendingOrders, ...engine.aiPendingOrders}}
                    selectedEnclaveId={engine.selectedEnclaveId}
                    hoveredCellId={engine.hoveredCellId}
                    currentWorld={engine.currentWorld}
                    activeEffectMarkers={engine.activeEffectMarkers}
                    cameraFocusAnimation={engine.cameraFocusAnimation}
                    initialCameraTarget={engine.initialCameraTarget}
                    isBloomEnabled={engine.isBloomEnabled}
                    bloomSettings={engine.bloomSettings}
                    materialSettings={engine.materialSettings}
                    ambientLightIntensity={engine.ambientLightIntensity}
                    tonemappingStrength={engine.tonemappingStrength}
                    handleMapClick={engine.handleMapClick}
                    handleEnclaveDblClick={engine.handleEnclaveDblClick}
                    setHoveredCellId={engine.setHoveredCellId}
                    focusOnEnclave={engine.focusOnEnclave}
                    dispatch={dispatch}
                    gamePhase={gamePhase}
                    isIntroComplete={isIntroComplete}
                    introPhase={introPhase}
                />
            )}
            
            <div className="absolute inset-0 z-20 pointer-events-none">
                <VignetteOverlay />
            </div>

             {showLetterbox && (
                <>
                    <div className={`fixed top-0 left-0 w-full h-[15vh] bg-black z-30 ${letterboxAnimation}`}></div>
                    <div className={`fixed bottom-0 left-0 w-full h-[15vh] bg-black z-30 ${letterboxAnimation}`}></div>
                </>
            )}
            
            <div ref={titleRef} className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none opacity-0 ${titleAnimationClass}`}>
                <h1 className="font-title text-8xl text-white tracking-widest">{currentWorld?.name}</h1>
            </div>
            
            <div className={`absolute top-0 left-0 right-0 p-8 flex justify-between items-start pointer-events-none z-20 ${uiAnimationClass}`}>
                <div className="flex flex-col gap-4 pointer-events-auto">
                    <PlayerDisplay owner="player-1" archetypeKey={engine.playerArchetypeKey} legacyKey={engine.playerLegacyKey} onClick={() => engine.setInspectedArchetypeOwner('player-1')} />
                    <PlayerDisplay owner="player-2" archetypeKey={engine.opponentArchetypeKey} legacyKey={engine.opponentLegacyKey} onClick={() => engine.setInspectedArchetypeOwner('player-2')} />
                </div>

                <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-auto">
                    {engine.currentWorld && (
                        <LegendDisplay
                            enclaveData={engine.enclaveData}
                            domainData={engine.domainData}
                            riftData={engine.riftData}
                            expanseData={engine.expanseData}
                            currentWorld={engine.currentWorld}
                            activeHighlight={engine.activeHighlight}
                            onHighlightChange={engine.setActiveHighlight}
                        />
                    )}
                </div>

                <div className="w-16 h-16 flex justify-end pointer-events-auto">
                    {engine.isIntroComplete && (
                        <button
                            onClick={handleWorldIconClick}
                            className="w-16 h-16 rounded-full grid place-items-center flex-shrink-0 bg-neutral-800 hover:bg-neutral-700 transition-colors"
                            aria-label="Toggle World Inspector"
                        >
                            <span className="material-symbols-outlined">public</span>
                        </button>
                    )}
                </div>
            </div>
            
            <div className={`absolute bottom-0 left-0 right-0 p-8 flex justify-start items-end pointer-events-none z-20 ${uiAnimationClass}`}>
                <div className="flex items-end gap-4 pointer-events-auto">
                    {engine.currentWorld && (
                        <TurnDisplay
                            playerPercentage={playerPercentage}
                            opponentPercentage={opponentPercentage}
                            neutralPercentage={neutralPercentage}
                            playerColor={PLAYER_THREE_COLORS['player-1'].selected}
                            opponentColor={PLAYER_THREE_COLORS['player-2'].selected}
                            neutralColor={engine.currentWorld.neutralColorPalette.selected}
                            timerColor={engine.currentWorld.neutralColorPalette.selected}
                            currentTurn={engine.currentTurn}
                            turnDuration={engine.gameConfig.TURN_DURATION}
                            isPaused={engine.isPaused}
                            isGameOver={engine.gameOverState !== 'none'}
                            isResolvingTurn={engine.isResolvingTurn}
                            togglePause={engine.togglePause}
                        />
                    )}
                     {engine.currentWorld && <WorldDisplay planetName={engine.currentWorld.name} hoveredEntity={engine.hoveredEntity} onSurrender={handleSurrender} onToggleSettings={handleToggleSettings} isIntroComplete={isIntroComplete} />}
                </div>
            </div>
            
            <InspectorCard
                ref={archetypeInspectorRef}
                isVisible={!!engine.inspectedArchetypeOwner && engine.isIntroComplete}
                isClosing={isClosingArchetypeInspector}
                inspectedEntity={engine.inspectedArchetypeOwner ? { type: 'archetype', owner: engine.inspectedArchetypeOwner } : null}
                onClose={handleCloseArchetypeInspector}
                selectedEnclaveId={engine.selectedEnclaveId}
                enclaveData={engine.enclaveData}
                domainData={engine.domainData}
                riftData={engine.riftData}
                expanseData={engine.expanseData}
                pendingOrders={{...engine.playerPendingOrders, ...engine.aiPendingOrders}}
                routes={engine.routes}
                currentWorld={engine.currentWorld}
                activeEffectMarkers={engine.activeEffectMarkers}
                gameConfig={engine.gameConfig}
                onFocusEnclave={engine.focusOnEnclave}
                onFocusVector={engine.focusOnVector}
                onShowBriefing={showBriefing}
                onHideBriefing={hideBriefing}
                onTriggerEffect={engine.triggerEffect}
                playerArchetypeKey={engine.playerArchetypeKey}
                playerLegacyKey={engine.playerLegacyKey}
                opponentArchetypeKey={engine.opponentArchetypeKey}
                opponentLegacyKey={engine.opponentLegacyKey}
            />
            
            <InspectorCard
                ref={mapInspectorRef}
                isVisible={!!engine.inspectedMapEntity && engine.isIntroComplete}
                isClosing={isClosingMapInspector}
                inspectedEntity={engine.inspectedMapEntity}
                onClose={handleCloseMapInspector}
                selectedEnclaveId={engine.selectedEnclaveId}
                enclaveData={engine.enclaveData}
                domainData={engine.domainData}
                riftData={engine.riftData}
                expanseData={engine.expanseData}
                pendingOrders={{...engine.playerPendingOrders, ...engine.aiPendingOrders}}
                routes={engine.routes}
                currentWorld={engine.currentWorld}
                activeEffectMarkers={engine.activeEffectMarkers}
                gameConfig={engine.gameConfig}
                onFocusEnclave={engine.focusOnEnclave}
                onFocusVector={engine.focusOnVector}
                onShowBriefing={showBriefing}
                onHideBriefing={hideBriefing}
                onTriggerEffect={engine.triggerEffect}
                playerArchetypeKey={engine.playerArchetypeKey}
                playerLegacyKey={engine.playerLegacyKey}
                opponentArchetypeKey={engine.opponentArchetypeKey}
                opponentLegacyKey={engine.opponentLegacyKey}
            />

            <BriefingCard briefing={briefing} world={engine.currentWorld} />
            
            <div className="absolute top-1/2 -translate-y-1/2 left-8 z-20 pointer-events-auto">
                {/* Gambit system is disabled for now.
                <GambitRail gambits={engine.playerGambits} /> */}
            </div>

            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <Snackbar data={engine.latestEffect ? { icon: engine.latestEffect.profile.ui.icon, title: engine.latestEffect.profile.ui.name, subtitle: `Detected in ${engine.latestEffect.locationName}`, iconColorClass: 'text-amber-400' } : null} onClose={engine.clearLatestEffect} />
            </div>

            {effectTestProfile && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <button
                        onClick={() => effectTestKey && engine.triggerEffect(effectTestKey)}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                    >
                        <span className="material-symbols-outlined">{effectTestProfile.ui.icon}</span>
                        Test: {effectTestProfile.ui.name}
                    </button>
                </div>
            )}
            
            {(engine.isSettingsOpen || isClosingSettings) && debugCamera && (
                <ErrorBoundary>
                    <MemoizedSettingsDrawer
                        isOpen={engine.isSettingsOpen}
                        isClosing={isClosingSettings}
                        onClose={handleToggleSettings}
                        isGloballyMuted={engine.isGloballyMuted}
                        onToggleGlobalMute={engine.toggleGlobalMute}
                        volumes={engine.volumes}
                        onVolumeChange={engine.setVolume}
                        mutedChannels={engine.mutedChannels}
                        onToggleMute={engine.toggleMuteChannel}
                        isBloomEnabled={engine.isBloomEnabled}
                        onToggleBloom={engine.setBloomEnabled}
                        bloomSettings={engine.bloomSettings}
                        onBloomSettingChange={engine.setBloomValue}
                        materialSettings={engine.materialSettings}
                        onMaterialSettingChange={engine.setMaterialValue}
                        ambientLightIntensity={engine.ambientLightIntensity}
                        onAmbientLightIntensityChange={engine.setAmbientLightIntensity}
                        onTonemappingStrengthChange={engine.setTonemappingStrength}
                        tonemappingStrength={engine.tonemappingStrength}
                        playVfxFromPreviousTurns={engine.playVfxFromPreviousTurns}
                        onSetPlayVfxFromPreviousTurns={engine.setPlayVfxFromPreviousTurns}
                        stackVfx={engine.stackVfx}
                        onSetStackVfx={engine.setStackVfx}
                        sfxManager={sfxManager}
                        worldCanvasHandle={worldCanvasRef}
                        // FIX: Pass the 'debugCamera' state variable instead of the undefined 'camera' variable.
                        camera={debugCamera}
                    />
                </ErrorBoundary>
            )}
            
            {showGameOverDialog && (
                <>
                    <Backdrop isClosing={isClosingGameOver} />
                    <GameOverDialog
                        gameOverState={engine.gameOverState}
                        onNewGame={handleNewGame}
                        isClosing={isClosingGameOver}
                    />
                </>
            )}

            {(isSurrenderConfirmOpen || isClosingSurrender) && currentWorld && (
                 <>
                    <Backdrop isClosing={isClosingSurrender} />
                    <SurrenderConfirmDialog
                        onConfirm={handleConfirmSurrender}
                        onCancel={handleCancelSurrender}
                        isClosing={isClosingSurrender}
                        planetName={currentWorld.name}
                    />
                 </>
            )}
        </div>
    );
};

export default GameScreen;