import React, { useEffect, useRef } from 'react';
import RadialChart from '@/components/ui/RadialChart';
import RadialMeter from '@/components/ui/RadialMeter';

// GSAP is loaded globally from index.html
declare const gsap: any;

interface TurnDisplayProps {
  playerPercentage: number;
  opponentPercentage: number;
  neutralPercentage: number;
  playerColor: string;
  opponentColor: string;
  neutralColor: string;
  timerColor: string;
  currentTurn: number;
  turnDuration: number;
  isPaused: boolean;
  isGameOver: boolean;
  isResolvingTurn: boolean; // New prop
  togglePause: () => void;
}

const TurnDisplay: React.FC<TurnDisplayProps> = ({
  playerPercentage,
  opponentPercentage,
  neutralPercentage,
  playerColor,
  opponentColor,
  neutralColor,
  timerColor,
  currentTurn,
  turnDuration,
  isPaused,
  isGameOver,
  isResolvingTurn,
  togglePause,
}) => {
  const size = 96;
  const dominationStrokeWidth = 8;
  const timerStrokeWidth = 4;
  const gap = 6;
  const timerSize = size;
  const chartSize = size - (timerStrokeWidth * 2) - (gap * 2);
  const containerRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<any>(null); // To hold the GSAP timeline
  
  const isTurnZero = currentTurn === 0;

  useEffect(() => {
    if (typeof gsap === 'undefined' || !containerRef.current) return;

    // --- Animation Cleanup ---
    // Kill any timeline from the previous turn to prevent conflicting animations.
    if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
    }
    
    // --- New Turn Reset ---
    // At the start of a new turn, smoothly animate the scale back to 1.
    // This prevents a "snap" and allows the final pulse of the previous turn to resolve gracefully.
    gsap.to(containerRef.current, { scale: 1, duration: 0.4, ease: "power1.inOut" });

    // --- Countdown Animation Setup ---
    // Don't create a new countdown timeline if the game isn't in an active state.
    if (isPaused || isGameOver || isTurnZero || isResolvingTurn) {
        return;
    }

    // Create a new GSAP timeline for the end-of-turn pulses.
    const tl = gsap.timeline();
    timelineRef.current = tl;

    // Schedule the pulses at the correct time using the timeline's position parameter.
    tl.to(containerRef.current, {
        scale: 1.1,
        duration: 0.5, // Refined duration
        ease: "back.out(4)"
    }, turnDuration - 3);

    tl.to(containerRef.current, {
        scale: 1.15,
        duration: 0.5, // Refined duration
        ease: "back.out(4)"
    }, turnDuration - 2);
    
    tl.to(containerRef.current, {
        scale: 1.2,
        duration: 1, // Refined duration
        ease: "back.out(4)"
    }, turnDuration - 1);
    
  }, [currentTurn, isPaused, isGameOver, turnDuration, isTurnZero, isResolvingTurn]);


  const chartSegments = [
    { percentage: playerPercentage, color: playerColor },
    { percentage: opponentPercentage, color: opponentColor },
    { percentage: neutralPercentage, color: neutralColor },
  ];

  return (
    <button 
        ref={containerRef}
        onClick={togglePause} 
        disabled={isGameOver || isTurnZero || isResolvingTurn} 
        className={`relative group focus:outline-none flex-shrink-0`} 
        style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 grid place-items-center">
        <RadialChart
          size={chartSize}
          strokeWidth={dominationStrokeWidth}
          segments={chartSegments}
          gap={gap}
        />
      </div>
      <div className={`absolute inset-0 transition-opacity duration-300 ${isTurnZero || isResolvingTurn ? 'opacity-0' : 'opacity-100'}`}>
         <RadialMeter
            size={timerSize}
            strokeWidth={timerStrokeWidth}
            color={timerColor}
            trackColor={'#27272a'}
            duration={turnDuration}
            isPaused={isPaused}
            isGameOver={isGameOver}
            currentTurn={currentTurn}
         />
      </div>
     
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        {/* Turn Number / Pause Icon Container */}
        <div className={`col-start-1 row-start-1 grid place-items-center transition-opacity duration-200 ${!isTurnZero && !isResolvingTurn ? 'opacity-100' : 'opacity-0'}`}>
          {/* Turn Number */}
          <span className={`font-bold text-white text-3xl leading-none transition-opacity duration-300 ${isPaused ? 'opacity-0' : 'group-hover:opacity-0 opacity-100'}`}>
              {currentTurn > 0 ? currentTurn : 1}
          </span>
          {/* Pause/Play Icon */}
          <span className={`material-symbols-outlined text-white text-5xl absolute transition-opacity duration-300 ${isPaused ? 'opacity-100' : 'group-hover:opacity-100 opacity-0'}`}>
            {isPaused ? 'play_arrow' : 'pause'}
          </span>
        </div>
        {/* Hourglass for Turn 0 */}
        <div className={`col-start-1 row-start-1 flex items-center justify-center transition-opacity duration-200 ${isTurnZero ? 'opacity-100' : 'opacity-0'}`}>
          <span className="material-symbols-outlined text-white text-5xl animate-hourglass-tick">
            hourglass_empty
          </span>
        </div>
        {/* Spinner for Resolving Turn */}
        <div className={`col-start-1 row-start-1 flex items-center justify-center transition-opacity duration-200 ${isResolvingTurn ? 'opacity-100' : 'opacity-0'}`}>
            <div className="h-10 w-10 border-4 border-neutral-700 border-t-neutral-100 rounded-full animate-rotate-continuously"></div>
        </div>
      </div>
    </button>
  );
};

export default TurnDisplay;