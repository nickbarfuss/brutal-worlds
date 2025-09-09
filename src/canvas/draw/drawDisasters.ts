import { ActiveDisasterMarker, Enclave } from '@/types/game';
import { DISASTER_PROFILES } from '@/data/disasters';
import { getIconForEntityType } from '@/utils/entityUtils';

const canvasStyles = {
    disasterIcon: { radius: 12, iconFont: "16px 'Material Symbols Outlined'" },
    baseMarker: { radius: 14 },
};

const drawDisasterMarker = (ctx: CanvasRenderingContext2D, marker: ActiveDisasterMarker, pos: { x: number; y: number }, clockTime: number) => {
    const style = canvasStyles.baseMarker;
    const iconStyle = canvasStyles.disasterIcon;
    
    const isCrisis = marker.disasters.length > 1;
    let icon = getIconForEntityType('disaster'); // Default crisis icon

    if (!isCrisis) {
        const profile = DISASTER_PROFILES[marker.profileKey];
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

interface DrawAllDisastersProps {
    activeDisasterMarkers: ActiveDisasterMarker[];
    disasterMarkerScreenPositions: { [id: number]: { x: number; y: number; visible: boolean } };
    clockTime: number;
    enclaveData: { [id: number]: Enclave };
}

export const drawAllDisasterMarkers = (ctx: CanvasRenderingContext2D, props: DrawAllDisastersProps) => {
    const { activeDisasterMarkers, disasterMarkerScreenPositions, clockTime, enclaveData } = props;
    
    const mainCellIdSet = new Set(Object.values(enclaveData).map(e => e.mainCellId));

    activeDisasterMarkers.forEach((marker, i) => {
        // If a disaster site is on an enclave's main marker cell, do not draw it separately.
        // It will be attached as a chip to the enclave marker instead.
        if (mainCellIdSet.has(marker.cellId)) {
            return;
        }

        const pos = disasterMarkerScreenPositions[i];
        if (pos && pos.visible) {
            drawDisasterMarker(ctx, marker, pos, clockTime);
        }
    });
};