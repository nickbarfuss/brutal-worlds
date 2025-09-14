import { Enclave, WorldProfile, ActiveHighlight, ActiveEffectMarker } from '@/types/game';
import { getPaletteForOwner } from '@/canvas/draw/drawUtils';
import { getIconForEntityType } from '@/utils/entityUtils';
import { EFFECT_PROFILES } from '@/data/effects';

const canvasStyles = {
    enclaveMarker: { radius: 14 },
    disasterIcon: { radius: 12, iconFont: "16px 'Material Symbols Outlined'" },
    dynamicChip: { paddingOuterX: 4, paddingOuterY: 4, paddingInner: 6 },
    worldLabel: {
        iconSize: 16,
        iconFont: "16px 'Material Symbols Outlined'",
        textFont: "12px 'Open Sans'",
    }
};

export const drawSelectionPulse = (ctx: CanvasRenderingContext2D, pos: { x: number, y: number }, clockTime: number) => {
    const pulseDuration = 1.0;
    const timeInPulse = (clockTime * 0.4) % pulseDuration; // Halved the speed from 0.8
    const progress = timeInPulse / pulseDuration;
    
    ctx.save();
    for (let i = 0; i < 2; i++) {
        const rippleProgress = (progress + i * 0.5) % 1;
        const radius = rippleProgress * 30;
        const opacity = (1 - rippleProgress) * 0.7;

        if (opacity > 0) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(238, 242, 255, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    ctx.restore();
};

const drawEnclaveChip = (
    ctx: CanvasRenderingContext2D,
    enclave: Enclave,
    pos: { x: number; y: number },
    clockTime: number,
    worldProfile: WorldProfile | null,
    showLabel: boolean,
    effectsOnMainCell: ActiveEffectMarker[]
) => {
    const effects = enclave.activeEffects || [];
    
    const chipStyle = canvasStyles.dynamicChip;
    const disasterIconStyle = canvasStyles.disasterIcon;
    const enclaveMarkerStyle = canvasStyles.enclaveMarker;
    const labelStyle = canvasStyles.worldLabel;

    let disastersWidth = 0;
    if (effectsOnMainCell.length > 0) {
        ctx.font = "700 10px 'Open Sans'"; // Set font for measurement
        effectsOnMainCell.forEach(marker => {
            const durationText = String(marker.durationInPhase);
            const textWidth = ctx.measureText(durationText).width;
            const disasterChipWidth = disasterIconStyle.radius + 4 + textWidth + 6; // icon radius + padding + text + padding
            disastersWidth += disasterChipWidth + chipStyle.paddingInner;
        });
        disastersWidth -= chipStyle.paddingInner;
    }
    
    const effectsWidth = effects.length > 0 ? (effects.length * (disasterIconStyle.radius * 2 + chipStyle.paddingInner)) - chipStyle.paddingInner : 0;
    const rightPartSeparator = effects.length > 0 && effectsOnMainCell.length > 0 ? chipStyle.paddingInner : 0;
    const rightPartWidth = effectsWidth + rightPartSeparator + disastersWidth;
    
    let leftPartWidth = 0;
    if (showLabel) {
        ctx.font = labelStyle.textFont;
        const labelTextWidth = ctx.measureText(enclave.name).width;
        leftPartWidth = chipStyle.paddingInner + labelStyle.iconSize + chipStyle.paddingInner + labelTextWidth + chipStyle.paddingInner + 8;
    }

    const totalContentWidth = leftPartWidth + (enclaveMarkerStyle.radius * 2) + (rightPartWidth > 0 ? chipStyle.paddingInner : 0) + rightPartWidth;
    const chipWidth = totalContentWidth + (chipStyle.paddingOuterX * 2);
    const chipHeight = enclaveMarkerStyle.radius * 2 + (chipStyle.paddingOuterY * 2);

    const chipX = pos.x - (enclaveMarkerStyle.radius + leftPartWidth + chipStyle.paddingOuterX);
    const chipY = pos.y - enclaveMarkerStyle.radius - chipStyle.paddingOuterY;

    const palette = getPaletteForOwner(enclave.owner, worldProfile);
    const chipBgColor = palette.dark;
    const markerColor = palette.base;
    const forceTextColor = palette.light;
    const labelIconColor = palette.icon;
    const labelTextColor = palette.text;

    ctx.save();
    ctx.fillStyle = chipBgColor;
    ctx.beginPath();
    (ctx as any).roundRect(chipX, chipY, chipWidth, chipHeight, chipHeight / 2);
    ctx.fill();

    let currentX = chipX + chipStyle.paddingOuterX;
    if (showLabel) {
        currentX += chipStyle.paddingInner;
        ctx.font = labelStyle.iconFont; ctx.fillStyle = labelIconColor;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(getIconForEntityType('enclave'), currentX + labelStyle.iconSize / 2, pos.y);
        currentX += labelStyle.iconSize + chipStyle.paddingInner;
        ctx.font = labelStyle.textFont; ctx.fillStyle = labelTextColor;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(enclave.name, currentX, pos.y);
    }

    ctx.fillStyle = markerColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, enclaveMarkerStyle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "700 14px 'Open Sans'"; ctx.fillStyle = forceTextColor;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    
    const safeForces = Number.isFinite(enclave.forces) ? Math.round(enclave.forces) : 0;
    ctx.fillText(String(safeForces), pos.x, pos.y + 1);

    let currentXForRightChips = pos.x + enclaveMarkerStyle.radius + chipStyle.paddingInner;

    effects.forEach(effect => {
        const profile = EFFECT_PROFILES[effect.profileKey];
        if (!profile) return;
        if (effect.phase === 'alert') {
            const pulse = (Math.sin(clockTime * Math.PI * 4) + 1) / 2;
            ctx.globalAlpha = 0.5 + pulse * 0.5;
        }
        ctx.font = disasterIconStyle.iconFont; ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(profile.ui.icon, currentXForRightChips + disasterIconStyle.radius, pos.y);
        ctx.globalAlpha = 1.0;
        currentXForRightChips += (disasterIconStyle.radius * 2) + chipStyle.paddingInner;
    });

    effectsOnMainCell.forEach(marker => {
        const profile = EFFECT_PROFILES[marker.profileKey];
        if (!profile) return;
        
        const isCrisis = marker.effects.length > 1;
        const icon = isCrisis ? getIconForEntityType('disaster') : profile.ui.icon;
        const durationText = String(marker.durationInPhase);

        ctx.font = "700 10px 'Open Sans'";
        const textWidth = ctx.measureText(durationText).width;

        const disasterChipHeight = disasterIconStyle.radius * 2;
        const disasterChipWidth = disasterIconStyle.radius + 4 + textWidth + 6;
        const disasterChipX = currentXForRightChips;
        const disasterChipY = pos.y - disasterIconStyle.radius;

        ctx.fillStyle = '#b45309'; // amber-700
        ctx.beginPath();
        (ctx as any).roundRect(disasterChipX, disasterChipY, disasterChipWidth, disasterChipHeight, disasterChipHeight / 2);
        ctx.fill();

        const iconX = disasterChipX + disasterIconStyle.radius;
        ctx.font = disasterIconStyle.iconFont;
        ctx.fillStyle = '#fef3c7'; // amber-100
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, iconX, pos.y + 1);

        const textX = iconX + disasterIconStyle.radius + 2;
        ctx.font = "700 10px 'Open Sans'";
        ctx.textAlign = 'left';
        ctx.fillText(durationText, textX, pos.y + 1);

        currentXForRightChips += disasterChipWidth + chipStyle.paddingInner;
    });

    ctx.restore();
};

const drawEnclaveMarker = (
    ctx: CanvasRenderingContext2D,
    enclave: Enclave,
    pos: { x: number; y: number },
    isHovered: boolean,
    isCommandMode: boolean,
    worldProfile: WorldProfile | null,
    routes: any[], // Simplified type
    selectedEnclaveId: number | null
) => {
    const palette = getPaletteForOwner(enclave.owner, worldProfile);
    const ownerColor = palette.base;
    const forceTextColor = palette.light;

    let markerColor = ownerColor;
    if (isCommandMode) {
        const isConnected = routes.some(r => (r.from === selectedEnclaveId && r.to === enclave.id) || (r.to === selectedEnclaveId && r.from === enclave.id));
        if (enclave.id !== selectedEnclaveId && !isConnected) { /* Do nothing */ }
    } else if (isHovered) {
        markerColor = palette.hover;
    }

    ctx.fillStyle = markerColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "700 14px 'Open Sans'";
    ctx.fillStyle = forceTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // FIX: Sanitize the force count before drawing it to prevent a NaN value
    // from being passed to `fillText`, which could crash the canvas renderer.
    const safeForces = Number.isFinite(enclave.forces) ? Math.round(enclave.forces) : 0;
    ctx.fillText(String(safeForces), pos.x, pos.y + 1);
};

interface DrawAllEnclavesProps {
    enclaveData: { [id: number]: Enclave };
    enclaveScreenPositions: { [id: number]: { x: number; y: number; visible: boolean } };
    selectedEnclaveId: number | null;
    hoveredCellId: number;
    mapData: any[]; // Simplified type
    currentWorld: WorldProfile | null;
    routes: any[]; // Simplified type
    activeHighlight: ActiveHighlight | null;
    clockTime: number;
    activeEffectMarkers: ActiveEffectMarker[];
}

export const drawAllEnclaves = (ctx: CanvasRenderingContext2D, props: DrawAllEnclavesProps) => {
    const { enclaveData, enclaveScreenPositions, selectedEnclaveId, hoveredCellId, mapData, currentWorld, routes, activeHighlight, clockTime, activeEffectMarkers } = props;
    
    const effectMarkersByCellId = new Map<number, ActiveEffectMarker[]>();
    (activeEffectMarkers || []).forEach(marker => {
        if (!effectMarkersByCellId.has(marker.cellId)) {
            effectMarkersByCellId.set(marker.cellId, []);
        }
        effectMarkersByCellId.get(marker.cellId)!.push(marker);
    });

    Object.values(enclaveData).forEach(enclave => {
        const pos = enclaveScreenPositions[enclave.id];
        if (!pos || !pos.visible) return;

        const shouldDrawLabel = activeHighlight?.type === 'enclaves' && activeHighlight.owners.has(enclave.owner);
        const effectsOnMainCell = effectMarkersByCellId.get(enclave.mainCellId) || [];
        const hasEffectsOnMainCell = effectsOnMainCell.length > 0;
        
        if (enclave.activeEffects.length > 0 || shouldDrawLabel || hasEffectsOnMainCell) {
            drawEnclaveChip(ctx, enclave, pos, clockTime, currentWorld, shouldDrawLabel, effectsOnMainCell);
        } else {
             const localHoveredEnclaveId = mapData[hoveredCellId]?.enclaveId ?? -1;
             const isHovered = enclave.id === localHoveredEnclaveId;
             const isCommandMode = selectedEnclaveId !== null;
             drawEnclaveMarker(ctx, enclave, pos, isHovered, isCommandMode, currentWorld, routes, selectedEnclaveId);
        }
    });
};