import React, { useState, useCallback, useRef, useEffect } from 'react';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({ min, max, step, value, onChange, onCommit, className, disabled = false }) => {
  const [internalValue, setInternalValue] = useState(value);
  const isDraggingRef = useRef(false);

  // When the external value changes (and we are not dragging), update the internal value.
  useEffect(() => {
    if (!isDraggingRef.current) {
      setInternalValue(value);
    }
  }, [value]);

  // Use a ref for props to avoid stale closures in event listeners.
  const propsRef = useRef({ min, max, step, onChange, onCommit, disabled, value });
  useEffect(() => {
    propsRef.current = { min, max, step, onChange, onCommit, disabled, value };
  }, [min, max, step, onChange, onCommit, disabled, value]);
  
  // Use a ref to store the latest value for the commit callback.
  const valueOnCommitRef = useRef(value);
  useEffect(() => {
    valueOnCommitRef.current = internalValue;
  }, [internalValue]);

  const getPercentage = useCallback(() => {
    if (max === min) return 0;
    return ((internalValue - min) / (max - min)) * 100;
  }, [internalValue, min, max]);

  const handleInteraction = useCallback((clientX: number) => {
    const { min, max, step, onChange, disabled } = propsRef.current;
    if (!trackRef.current || disabled) return;

    const rect = trackRef.current.getBoundingClientRect();
    const pos = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, pos / rect.width));
    const rawValue = min + percentage * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    setInternalValue(clampedValue);
    onChange(clampedValue);
  }, []);

  const handlePointerMove = useCallback((moveEvent: PointerEvent) => {
    handleInteraction(moveEvent.clientX);
  }, [handleInteraction]);

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    
    const { onCommit } = propsRef.current;
    if (onCommit) {
        onCommit(valueOnCommitRef.current);
    }
  }, [handlePointerMove]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (propsRef.current.disabled) return;
    
    e.preventDefault();
    isDraggingRef.current = true;
    handleInteraction(e.clientX);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [handleInteraction, handlePointerMove, handlePointerUp]);

  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const disabledClasses = disabled ? 'opacity-50' : 'group';
  
  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      className={`relative w-full h-5 flex items-center ${disabledClasses} ${className}`}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-disabled={disabled}
      style={{ touchAction: 'none' }}
    >
      <div className="relative w-full h-1 bg-neutral-700 rounded-full">
        <div
          className={`absolute h-full rounded-full ${disabled ? 'bg-neutral-600' : 'bg-[var(--color-accent-600)]'}`}
          style={{ width: `${getPercentage()}%` }}
        />
      </div>
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full transition-transform duration-100 ${disabled ? 'bg-neutral-500' : 'bg-[var(--color-accent-500)] group-hover:scale-110'}`}
        style={{ left: `${getPercentage()}%`, transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};

export default Slider;
