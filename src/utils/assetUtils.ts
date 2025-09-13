/**
 * Returns the asset URL. Cache-busting logic has been removed as it was causing
 * issues with font loading.
 * @param url The original asset URL.
 * @returns The original URL.
 */
export const getAssetUrl = (url: string): string => {
    return url;
};

/**
 * Takes a single asset key or an array of asset keys and returns a randomly selected key.
 * If a single key is provided, it returns that key. If undefined, it returns undefined.
 * @param assetKeys A single asset key (string) or an array of asset keys (string[]).
 * @returns A randomly selected asset key (string) or undefined.
 */
export const getRandomAssetKey = (assetKeys: string | string[] | undefined): string | undefined => {
    if (assetKeys === undefined) {
        return undefined;
    }
    if (Array.isArray(assetKeys)) {
        if (assetKeys.length === 0) {
            return undefined;
        }
        const randomIndex = Math.floor(Math.random() * assetKeys.length);
        return assetKeys[randomIndex];
    }
    return assetKeys;
};
