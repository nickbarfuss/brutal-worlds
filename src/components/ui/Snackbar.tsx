import React, { useState, useEffect } from 'react';

interface SnackbarProps {
  data: {
    icon: string;
    title: string;
    subtitle: string;
    iconColorClass?: string;
    iconColorHex?: string; // Add hex for more flexible theming
  } | null;
  duration?: number;
  onClose?: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ data, duration = 5, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [currentData, setCurrentData] = useState(data);

  useEffect(() => {
    if (data) {
      setCurrentData(data);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [data]);

  if (!currentData) return null;
  
  const animationStyle = {
    '--duration': `${duration}s`
  } as React.CSSProperties;

  const iconStyle = currentData.iconColorHex ? { color: currentData.iconColorHex } : {};
  const effectiveIconColorClass = currentData.iconColorHex ? '' : (currentData.iconColorClass || 'text-white');

  return (
    <div 
        onAnimationEnd={() => { if (!visible) setCurrentData(null) }}
        className={`w-96 bg-neutral-800 rounded-lg shadow-lg pointer-events-auto overflow-hidden ${visible ? 'animate-slide-in-up' : 'animate-slide-out-down'}`}>
      <div className="w-full h-1 bg-neutral-700">
        <div 
          className="h-full bg-neutral-600"
          style={{ animation: visible ? `shrink-width var(--duration) linear forwards` : 'none' }}
        ></div>
      </div>
      <div className="relative p-3 flex items-center space-x-3">
        <span 
          className={`material-symbols-outlined text-3xl flex-shrink-0 ${effectiveIconColorClass}`} 
          style={iconStyle}
        >
          {currentData.icon}
        </span>
        <div className="flex-grow min-w-0 text-left">
          <p className="font-semibold text-gray-200 text-lg">{currentData.title}</p>
          <p className="text-base text-neutral-500">{currentData.subtitle}</p>
        </div>
        {onClose && (
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-neutral-500 hover:text-white transition-colors p-1 rounded-full"
                aria-label="Close"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
        )}
      </div>
    </div>
  );
};

// Add a simple keyframe animation to the component's style scope for the progress bar
const styles = document.createElement('style');
styles.innerHTML = `
  @keyframes shrink-width {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(styles);


export default Snackbar;