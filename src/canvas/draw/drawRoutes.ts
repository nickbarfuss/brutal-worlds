import * as THREE from 'three'; // eslint-disable-line @typescript-eslint/no-unused-vars
// Fix: Import SemanticColorPalette directly from the types definition file.
import { Route, PendingOrders, Enclave, WorldProfile, SemanticColorPalette } from '@/types/game';
import { ICONS } from '@/data/icons';
import { getPaletteForOwner } from '@/canvas/draw/drawUtils';
import { THEME_THREE } from '@/data/theme';

const drawRouteMarker = (ctx: CanvasRenderingContext2D, type: string, pos: {x: number, y: number}, clockTime: number, palette: SemanticColorPalette | null) => {
    ctx.save();
    const style = { radius: 12, iconFont: "16px 'Material Symbols Outlined'" };
    let icon: string | null = null, bgColor: string | null = null, iconColor: string | null = null;
    
    if (type === 'contested-attack') {
        icon = 'warning';
        const pulseState = Math.floor(clockTime * 2.5) % 2;
        bgColor = pulseState === 0 ? THEME_THREE['player-1'].selected : THEME_THREE['player-2'].selected;
        iconColor = pulseState === 0 ? THEME_THREE['player-1'].light : THEME_THREE['player-2'].light;
    } else if (type === 'contested-assist') {
        icon = 'add_circle';
        bgColor = palette ? palette.selected : THEME_THREE['player-1'].selected;
        iconColor = palette ? palette.light : THEME_THREE['player-1'].light;
    } else if (type === 'disabled') {
        icon = ICONS.route.disabled;
        bgColor = '#27272a'; // neutral-800
        iconColor = '#f59e0b'; // amber-400 (semantic warning)
    } else if (type === 'destroyed') {
        icon = ICONS.route.destroyed;
        bgColor = '#27272a'; // neutral-800
        iconColor = '#ef4444'; // red-500 (semantic danger)
    }

    if (icon && bgColor && iconColor) {
       ctx.fillStyle = bgColor;
       ctx.beginPath();
       ctx.arc(pos.x, pos.y, style.radius, 0, Math.PI * 2);
       ctx.fill();

       ctx.font = style.iconFont;
       ctx.fillStyle = iconColor;
       ctx.textAlign = 'center';
       ctx.textBaseline = 'middle';
       ctx.fillText(icon, pos.x, pos.y);
    }
    
    ctx.restore();
};

interface DrawAllRoutesProps {
    routes: Route[];
    enclaveData: { [id: number]: Enclave };
    pendingOrders: PendingOrders;
    enclaveScreenPositions: { [id: number]: { x: number; y: number; visible: boolean } };
    selectedEnclaveId: number | null;
    hoveredCellId: number;
    mapData: any[]; // Simplified to avoid direct dependency on useGameEngine
    currentWorld: WorldProfile | null;
    clockTime: number;
}

export const drawAllRoutes = (ctx: CanvasRenderingContext2D, props: DrawAllRoutesProps) => {
    const { routes, enclaveData, pendingOrders, enclaveScreenPositions, selectedEnclaveId, hoveredCellId, mapData, currentWorld, clockTime } = props;

    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const localHoveredEnclaveId = mapData[hoveredCellId]?.enclaveId ?? -1;
    const isCommandMode = selectedEnclaveId !== null;

    routes.forEach(route => {
        const startPos = enclaveScreenPositions[route.from];
        const endPos = enclaveScreenPositions[route.to];
        if (!startPos || !endPos || !startPos.visible || !endPos.visible) return;

        const { x: x1, y: y1 } = startPos;
        const { x: x2, y: y2 } = endPos;
        const dx = x2 - x1, dy = y2 - y1, dist = Math.hypot(dx, dy);
        if (dist === 0) return;

        const midX = x1 + dx / 2, midY = y1 + dy / 2;
        const screenCenterX = canvas.width / dpr / 2, screenCenterY = canvas.height / dpr / 2;
        const vecX = midX - screenCenterX, vecY = midY - screenCenterY;
        const vecLen = Math.hypot(vecX, vecY) || 1;
        const controlX = midX + (vecX / vecLen) * dist * 0.8, controlY = midY + (vecY / vecLen) * dist * 0.8;

        // --- Refactored Logic ---
        // 1. Check for disabled/destroyed routes first. They have top priority.
        if (route.isDestroyed || route.disabledForTurns > 0) {
            const isConnectedToHovered = !isCommandMode && localHoveredEnclaveId !== -1 && (route.from === localHoveredEnclaveId || route.to === localHoveredEnclaveId);
            const isConnectedToSelected = selectedEnclaveId !== null && (route.from === selectedEnclaveId || route.to === selectedEnclaveId);
            const M = { x: (x1 + 2 * controlX + x2) / 4, y: (y1 + 2 * controlY + y2) / 4 };
            
            ctx.save();
            ctx.globalAlpha = 0.15; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1;
            ctx.setLineDash([]); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(controlX, controlY, x2, y2); ctx.stroke();
            if (!isConnectedToHovered && !isConnectedToSelected) ctx.globalAlpha = 0.5;
            if (currentWorld) drawRouteMarker(ctx, route.isDestroyed ? 'destroyed' : 'disabled', M, clockTime, null);
            ctx.restore();
            return; // Stop processing this route
        }

        // 2. Check for pending orders on active routes.
        const orderFwd = pendingOrders[route.from];
        const orderBwd = pendingOrders[route.to];
        const hasOrderFwd = orderFwd && orderFwd.to === route.to;
        const hasOrderBwd = orderBwd && orderBwd.to === route.from;

        if (hasOrderFwd && hasOrderBwd) {
            const P0 = { x: x1, y: y1 }, P1 = { x: controlX, y: controlY }, P2 = { x: x2, y: y2 };
            const M = { x: (P0.x + 2 * P1.x + P2.x) / 4, y: (P0.y + 2 * P1.y + P2.y) / 4 };
            const C0 = { x: (P0.x + P1.x) / 2, y: (P0.y + P1.y) / 2 }, C1 = { x: (P1.x + P2.x) / 2, y: (P1.y + P2.y) / 2 };
            const animOffset = (clockTime * 15) % 20;

            const owner1 = enclaveData[route.from]?.owner ?? null;
            const p1Palette = getPaletteForOwner(owner1, currentWorld);
            ctx.save();
            ctx.strokeStyle = p1Palette.target; ctx.lineWidth = 4; ctx.setLineDash([8, 12]);
            ctx.lineCap = 'round'; ctx.lineDashOffset = -animOffset;
            ctx.beginPath(); ctx.moveTo(P0.x, P0.y); ctx.quadraticCurveTo(C0.x, C0.y, M.x, M.y); ctx.stroke();
            ctx.restore();

            const owner2 = enclaveData[route.to]?.owner ?? null;
            const p2Palette = getPaletteForOwner(owner2, currentWorld);
            ctx.save();
            ctx.strokeStyle = p2Palette.target; ctx.lineWidth = 4; ctx.setLineDash([8, 12]);
            ctx.lineCap = 'round'; ctx.lineDashOffset = -animOffset;
            ctx.beginPath(); ctx.moveTo(P2.x, P2.y); ctx.quadraticCurveTo(C1.x, C1.y, M.x, M.y); ctx.stroke();
            ctx.restore();

            if (orderFwd.type === 'assist' && orderBwd.type === 'assist') {
                const owner = enclaveData[route.from]?.owner ?? null;
                const palette = getPaletteForOwner(owner, currentWorld);
                if (currentWorld) drawRouteMarker(ctx, `contested-assist`, M, clockTime, palette);
            } else {
                 if (currentWorld) drawRouteMarker(ctx, `contested-attack`, M, clockTime, null);
            }
            return;
        }

        let orderOnRoute = null;
        if (hasOrderFwd) orderOnRoute = { ...orderFwd, from: route.from, direction: 1 };
        else if (hasOrderBwd) orderOnRoute = { ...orderBwd, from: route.to, direction: -1 };

        if (orderOnRoute) {
            const owner = enclaveData[orderOnRoute.from]?.owner ?? null;
            const palette = getPaletteForOwner(owner, currentWorld);
            const style = { color: palette.target, lineWidth: 4, opacity: 1.0, dash: [8, 12], animationSpeed: 15, animationDirection: -orderOnRoute.direction };
            
            ctx.save();
            ctx.globalAlpha = style.opacity; ctx.strokeStyle = style.color; ctx.lineWidth = style.lineWidth;
            ctx.setLineDash(style.dash); ctx.lineCap = 'round';
            if (style.animationSpeed > 0) {
                const totalDashLength = style.dash.reduce((a, b) => a + b, 0);
                ctx.lineDashOffset = (style.animationDirection * clockTime * style.animationSpeed) % totalDashLength;
            }
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(controlX, controlY, x2, y2); ctx.stroke();
            ctx.restore();
            return;
        }

        // 3. Fallback to default/preview drawing for active, unordered routes.
        let style = { visible: false, color: '#ffffff', lineWidth: 1, opacity: 1.0, dash: [] as number[] };
        const isConnectedToSelected = selectedEnclaveId !== null && (route.from === selectedEnclaveId || route.to === selectedEnclaveId);
        const isConnectedToHovered = !isCommandMode && localHoveredEnclaveId !== -1 && (route.from === localHoveredEnclaveId || route.to === localHoveredEnclaveId);

        if (isConnectedToSelected) {
            const targetId = route.from === selectedEnclaveId ? route.to : route.from;
            const isHoveredTarget = targetId === localHoveredEnclaveId;
            style = isHoveredTarget 
                ? { ...style, visible: true, lineWidth: 2, opacity: 1.0, dash: [] }
                : { ...style, visible: true, lineWidth: 2, opacity: 0.6, dash: [] };
        } else if (isConnectedToHovered) {
            style = { ...style, visible: true, lineWidth: 1, opacity: 0.5, dash: [] };
        } else {
            style = { ...style, visible: true, lineWidth: 1, opacity: 0.15, dash: [] };
        }

        if (style.visible) {
            ctx.save();
            ctx.globalAlpha = style.opacity; ctx.strokeStyle = style.color; ctx.lineWidth = style.lineWidth;
            ctx.setLineDash(style.dash); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(controlX, controlY, x2, y2); ctx.stroke();
            ctx.restore();
        }
    });
};