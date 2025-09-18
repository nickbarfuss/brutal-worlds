import { useEffect } from 'react';
import { sfxManager, vfxManager } from '@/logic/effects';
import { GamePhase } from '@/types/game';
import { getAssetUrl, extractAssetUrls } from '@/utils/assetUtils';
import { ASSETS } from '@/data/assets';

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
    const promises = urls.map(url => new Promise<void>((resolve, _reject) => {
        const video = document.createElement('video');
        video.src = getAssetUrl(url);
        video.oncanplaythrough = () => resolve();
        //video.onerror = () => reject(`Failed to preload video: ${url}`);
        video.onerror = () => {
            console.warn(`Failed to preload video: ${url}`);
            // TODO: Once all video assets are guaranteed to exist, change this to `reject()`
            // to ensure that missing assets cause a hard failure during initialization.
            resolve(); // Resolve even on error to prevent Promise.all from failing
        };
        video.load();
    }));
    return Promise.all(promises);
};

const preloadImages = (urls: string[]): Promise<void[]> => {
    const promises = urls.map(url => new Promise<void>((resolve, _reject) => {
        const img = new Image();
        img.src = getAssetUrl(url);
        img.onload = () => resolve();
        //img.onerror = () => reject(`Failed to preload image: ${url}`);
        img.onerror = () => {
            console.warn(`Failed to preload image: ${url}`);
            // TODO: Once all image assets are guaranteed to exist, change this to `reject()`
            // to ensure that missing assets cause a hard failure during initialization.
            resolve();
        };
    }));
    return Promise.all(promises);
};

const preloadAudio = (urls: string[]): Promise<void[]> => {
    const promises = urls.map(url => new Promise<void>((resolve) => {
        const audio = new Audio();
        audio.src = getAssetUrl(url);
        audio.oncanplaythrough = () => resolve();
        //audio.onerror = () => reject(`Failed to preload audio: ${url}`);
        audio.onerror = () => {
            console.warn(`Failed to preload audio: ${url}`);
            // TODO: Once all audio assets are guaranteed to exist, change this to `reject()`
            // to ensure that missing assets cause a hard failure during initialization.
            resolve(); // Resolve even on error to prevent Promise.all from failing
        };
        audio.load();
    }));
    return Promise.all(promises);
};


export const useGameInitializer = (
    startGame: (
        playerArchetypeKey: string,
        worldKey: string,
        playerLegacyKey: string,
        opponentArchetypeKey?: string,
        opponentLegacyKey?: string
    ) => void,
    setGamePhase: (phase: GamePhase) => void,
    setInitializationState: (isInitialized: boolean, message: string, error: string | null) => void
) => {
    useEffect(() => {
        const initialize = async () => {
            try {
                const updateMessage = (msg: string) => {
                    setInitializationState(false, msg, null);
                };

                updateMessage('Loading fonts...');
                await preloadFonts();

                const assetUrls = extractAssetUrls(ASSETS);
                
                updateMessage('Loading images...');
                await preloadImages(assetUrls.image);

                updateMessage('Loading videos...');
                await preloadVideos(assetUrls.video);
                
                updateMessage('Loading sounds...');
                await preloadAudio(assetUrls.audio);

                updateMessage('Initializing VFX...');
                await vfxManager.init();

                updateMessage('Initializing SFX...');
                await sfxManager.init();

                updateMessage('Ready to begin.');
                setGamePhase('mainMenu');
                setInitializationState(true, '', null);

            } catch (error) {
                console.error("Initialization failed:", error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                setInitializationState(false, '', `Initialization Failed: ${errorMessage}`);
            }
        };

        initialize();
    }, [setGamePhase, setInitializationState]);
};