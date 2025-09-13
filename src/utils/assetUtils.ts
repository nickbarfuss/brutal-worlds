import { CONFIG } from '@/data/config';

/**
 * Returns the asset URL. It can either construct a URL based on directory, key, and extension,
 * or return a provided direct URL string.
 * @param dirOrUrl The directory (e.g., 'archetype', 'sfx') or a direct URL string.
 * @param key The file name (e.g., 'my-asset').
 * @param ext The file extension (e.g., 'png', 'mp3').
 * @returns The constructed or provided asset URL.
 */
export function getAssetUrl(dirOrUrl: string, key?: string, ext?: string): string {
  // If a direct URL string is provided, return it.
  if (dirOrUrl.startsWith('http')) {
    return dirOrUrl;
  }

  // Otherwise, construct the URL from dir, key, and ext.
  if (!key || !ext) {
    throw new Error('Key and extension are required when constructing an asset URL.');
  }

  const CDN_BASE_URL = CONFIG.CDN.CDN_BASE_URL;
  return `${CDN_BASE_URL}/${dirOrUrl}/${key}.${ext}`;
}


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

