import { ActiveEventMarker } from '@/logic/events/events.types';
import { Enclave } from '@/logic/world/world.types';
import { EVENTS } from '@/data/events';
import { ICONS } from '@/data/icons';

const canvasStyles = {
    eventIcon: { radius: 12, iconFont: "16px 'Material Symbols Outlined'" },
    baseMarker: { radius: 14 },
};

const drawEventMarker = (ctx: CanvasRenderingContext2D, marker: ActiveEventMarker, pos: { x: number; y: number }, clockTime: number) => {
    const style = canvasStyles.baseMarker;
    const iconStyle = canvasStyles.eventIcon;
    
    const isCrisis = marker.events.length > 1;
    let icon = ICONS.disaster; // Default crisis icon

    if (!isCrisis) {
        const profile = EVENTS[marker.profileKey];
        if (profile) {
            icon = profile.ui.icon;
        }
    }

    ctx.save();
    
    // Pulsing outer glow for alert
    const pulseDuration = 1.0;
    const timeInPulse = (clockTime * 0.8) % pulseDuration;
    const progress = timeInPulse / pulseDuration;
    const pulseRadius = style.radius + progress * 10;
    const pulseOpacity = (1 - progress) * 0.5;

    if (pulseOpacity > 0) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 158, 11, ${pulseOpacity})`; // amber-500
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Base marker
    ctx.fillStyle = '#b45309'; // amber-700
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, style.radius, 0, Math.PI * 2);
    ctx.fill();

    // Icon
    ctx.font = iconStyle.iconFont;
    ctx.fillStyle = '#fef3c7'; // amber-100
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, pos.x, pos.y + 1);
    
    ctx.restore();
};

interface DrawAllEventMarkersProps {
    activeEventMarkers: ActiveEventMarker[];
    eventMarkerScreenPositions: { [id: number]: { x: number; y: number; visible: boolean } };
    clockTime: number;
    enclaveData: { [id: number]: Enclave };
}

export const drawAllEventMarkers = (ctx: CanvasRenderingContext2D, props: DrawAllEventMarkersProps) => {
    const { activeEventMarkers, eventMarkerScreenPositions, clockTime, enclaveData } = props;
    
    const mainCellIdSet = new Set(Object.values(enclaveData).map(e => e.mainCellId));

    (activeEventMarkers || []).forEach((marker, i) => {
        // If a disaster site is on an enclave's main marker cell, do not draw it separately.
        // It will be attached as a chip to the enclave marker instead.
        if (mainCellIdSet.has(marker.cellId)) {
            return;
        }

        const pos = eventMarkerScreenPositions[i];
        if (pos && pos.visible) {
            drawEventMarker(ctx, marker, pos, clockTime);
        }
    });
};