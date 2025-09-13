import React, { useEffect } from 'react';
import * as THREE from 'three';
import { VfxManager } from '@/logic/VfxManager';
import { SfxManager } from '@/logic/SfxManager';
import { VFX_PROFILES } from '@/data/vfx';
import { DISASTER_PROFILES } from '@/data/disasters';
import { WORLD_LIBRARY } from '@/data/worlds';
import { ARCHETYPES } from '@/data/archetypes';
import { GamePhase, Enclave, Route, MapCell, PendingOrders } from '@/types/game';
import { CONFIG } from '@/data/config';
// import { resolveTurn } from '@/logic/turnResolver'; // This was causing an error
import { generateNewWorld } from '@/hooks/useWorldGenerator';
import { getAssetUrl } from '@/utils/assetUtils';

const preloadFonts = async (): Promise<void> => {
    if (!document.fonts) {
        console.warn('Font loading API not supported, skipping font preloading.');
        return;
    }
    try {
        await Promise.all([
            document.fonts.load('1em "Open Sans"'),
            document.fonts.load('1em "Material Symbols Outlined"'),
            document.fonts.load('1em "New Rocker"'),
        ]);
    } catch (error) {
        console.warn("Could not preload one or more fonts. The app will continue but may not look correct.", error);
    }
};

const preloadVideos = (urls: string[]): Promise<void[]> => {
    const promises = urls.map(url => new Promise<void>((resolve, reject) => {
        const video = document.createElement('video');
        video.src = getAssetUrl(url);
        video.oncanplaythrough = () => resolve();
        video.onerror = () => reject(`Failed to load video: ${url}`);
        video.load();
    }));
    return Promise.all(promises);
};

const preloadImages = (urls: string[]): Promise<void[]> => {
    const promises = urls.map(url => new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = getAssetUrl(url);
        img.onload = () => resolve();
        img.onerror = () => {
            // Don't reject the whole batch, just warn and resolve.
            console.warn(`Failed to preload image: ${url}`);
            resolve();
        };
    }));
    return Promise.all(promises);
};


export const useGameInitializer = (
    vfxManager: React.RefObject<VfxManager>,
    sfxManager: React.RefObject<SfxManager>,
    startGame: (playerArchetypeKey: string, worldKey: string, skinIndex: number, opponentArchetypeKey?: string) => void,
    setGamePhase: (phase: GamePhase) => void,
    setInitializationState: (isInitialized: boolean, message: string, error: string | null) => void
) => {
    useEffect(() => {
        const initialize = async () => {
            try {
                const onProgress = (message: string) => {
                    setInitializationState(false, message, null);
                };

                onProgress('Loading typography...');
                await preloadFonts();

                onProgress('Loading cinematics...');
                await preloadVideos([
                    VFX_PROFILES['warp-enter'].url,
                    VFX_PROFILES['warp-exit'].url,
                ]);

                onProgress('Preloading imagery...');
                const availableImageNumbers = [
                    ...Array.from({ length: 20 }, (_, i) => i + 1), // 1-20
                    22, 23, 25, 26, 27, 28, 30, 31, 120
                ];
                const enclaveImageUrls = availableImageNumbers.map(num => 
                    `https://storage.googleapis.com/brutal-worlds/enclave/enclave-${String(num).padStart(3, '0')}.jpg`
                );
                const worldImageUrls = WORLD_LIBRARY.map(w => w.illustrationUrl);
                const allImageUrls = new Set([...enclaveImageUrls, ...worldImageUrls]);
                await preloadImages(Array.from(allImageUrls));
                
                onProgress('Preloading visual effects...');
                await vfxManager.current?.init(VFX_PROFILES);

                onProgress('Preloading sound effects...');
                await sfxManager.current?.init();
                
                onProgress('Ready for command');
                setGamePhase('mainMenu');
                setInitializationState(true, '', null);
                
            } catch (err) {
                console.error("Failed to initialize game engine:", err);
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setInitializationState(false, '', `Initialization Failed: ${errorMessage}`);
            }
        };
        initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // This effect should run only once.
};
