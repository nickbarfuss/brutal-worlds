
import React, { useState, useEffect } from 'react';
import ButtonBasic from '@/components/ui/ButtonBasic';
import { WORLD_LIBRARY } from '@/data/worlds';
import { getAssetUrl } from '@/utils/assetUtils';
import ProductInfo from '@/components/ProductInfo';
import { APP_TEXT } from '@/data/text';

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
                <ProductInfo className="" />
                <div className="mt-8 pointer-events-auto">
                    <ButtonBasic onClick={onBegin}>
                       {APP_TEXT.main.buttonStart}
                    </ButtonBasic>
                </div>
            </div>
        </div>
    );
};

export default MainScreen;
