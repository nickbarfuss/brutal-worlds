
import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { WORLD_LIBRARY } from '@/data/worlds';
import { getAssetUrl } from '@/utils/assetUtils';

import { TEXT } from '@/data/text';

interface MainScreenProps {
  onBegin: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ onBegin }) => {
    const [backgroundUrl, setBackgroundUrl] = useState<string>('');

    useEffect(() => {
        const randomWorld = WORLD_LIBRARY[Math.floor(Math.random() * WORLD_LIBRARY.length)];
        if (randomWorld) {
            setBackgroundUrl(randomWorld.illustrationUrl);
        }
    }, []);
    
    return (
        <div className="w-full h-full bg-neutral-900 relative">
            {backgroundUrl && (
              <div
                  className="absolute inset-0 bg-cover bg-center animate-fade-in-slow"
                  style={{ backgroundImage: `url('${getAssetUrl(backgroundUrl)}')` }}
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col items-center pt-24">
                    <h1 
                        className="font-title text-9xl font-bold text-white uppercase tracking-wider"
                        style={{ textShadow: '4px 4px 16px rgba(0,0,0,0.4)', lineHeight: '1.0' }}
                    >
                        {TEXT.common.gameTitle}
                    </h1>
                </div>
                <div className="mt-8 pointer-events-auto">
                    <Button onClick={onBegin}>
                       {TEXT.main.buttonStart}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MainScreen;
