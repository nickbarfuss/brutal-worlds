import gsap from 'gsap';
import { SemanticColorPalette } from '@/types/game';

interface EnclaveAnimationState {
    currentRadius: number;
    currentColor: string;
    currentDisplayedForces: number;
    currentFontSize: number;
    gsapTimeline: gsap.core.Timeline | null;
    lastKnownForces: number;
}

const enclaveAnimationStates = new Map<number, EnclaveAnimationState>();

export const initEnclaveAnimation = (enclaveId: number, initialForces: number, initialColor: string) => {
    if (!enclaveAnimationStates.has(enclaveId)) {
        enclaveAnimationStates.set(enclaveId, {
            currentRadius: 14,
            currentColor: initialColor,
            currentDisplayedForces: initialForces,
            currentFontSize: 14,
            gsapTimeline: null,
            lastKnownForces: initialForces,
        });
    }
};

export const animateEnclaveForces = (
    enclaveId: number,
    newForces: number,
    palette: SemanticColorPalette,
    requestRedraw: () => void // Callback to request canvas redraw
) => {
    const state = enclaveAnimationStates.get(enclaveId);
    if (!state) {
        console.warn(`Animation state not initialized for enclave ${enclaveId}`);
        return;
    }

    if (state.lastKnownForces === newForces) {
        // No change, no animation needed
        return;
    }

    // Kill any existing timeline for this enclave to prevent conflicts
    if (state.gsapTimeline) {
        state.gsapTimeline.kill();
    }

    const oldForces = state.lastKnownForces;
    state.lastKnownForces = newForces; // Update last known forces immediately

    state.gsapTimeline = gsap.timeline({
        onUpdate: requestRedraw, // Request redraw on each animation frame
        onComplete: () => {
            state.gsapTimeline = null; // Clear timeline reference on completion
        }
    });

    // 1. Scale up and brighten color
    state.gsapTimeline.to(state, {
        currentRadius: 14 * 1.5,
        currentFontSize: 14 * 1.5,
        currentColor: palette.hover, // Brighter color
        duration: 0.3,
        ease: "back.inOut"
    });

    // 2. Count up/down the number
    state.gsapTimeline.to(state, {
        currentDisplayedForces: newForces,
        duration: 2,
        ease: "power4.out",
        roundProps: "currentDisplayedForces", // Ensure integer display
    }, "<"); // Start simultaneously with the previous tween

    // 3. Scale back down and revert color
    state.gsapTimeline.to(state, {
        currentRadius: 14,
        currentFontSize: 14,
        currentColor: palette.base, // Original color
        duration: 0.3,
        ease: "back.inOut"
    }, ">-0.3"); // Start 0.25s before the number counting finishes

    // If the animation is very short (e.g., 0 to 1), ensure it still looks good
    if (Math.abs(newForces - oldForces) < 2) {
        state.gsapTimeline.duration(0.5); // Shorten total duration for small changes
    }
};

export const getAnimatedEnclaveProperties = (enclaveId: number) => {
    const state = enclaveAnimationStates.get(enclaveId);
    if (!state) {
        // Fallback if state not initialized (shouldn't happen if init is called)
        return { currentRadius: 14, currentColor: '#737373', currentDisplayedForces: 0, currentFontSize: 14 };
    }
    return {
        currentRadius: state.currentRadius,
        currentColor: state.currentColor,
        currentDisplayedForces: Math.round(state.currentDisplayedForces), // Always return rounded for display
        currentFontSize: state.currentFontSize
    };
};
