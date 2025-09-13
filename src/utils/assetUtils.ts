import { CONFIG } from '@/data/config';

export enum AssetType {
  ArchetypeAvatar = 'archetypeAvatar',
  // Add other asset types here
}

interface AssetParams {
  archetypeKey?: string;
  legacyKey?: string;
  // Add other asset-specific parameters here
}

/**
 * Returns the asset URL. It can either construct a URL based on AssetType and parameters,
 * or return a provided direct URL string.
 * @param typeOrUrl The type of asset (AssetType) or a direct URL string.
 * @param params Optional: Parameters specific to the asset type, if typeOrUrl is AssetType.
 * @returns The constructed or provided asset URL.
 */
export const getAssetUrl = (typeOrUrl: AssetType | string, params?: AssetParams): string => {
  // If a direct URL string is provided, return it.
  if (typeof typeOrUrl === 'string' && typeOrUrl.startsWith('http')) {
    return typeOrUrl;
  }

  // Otherwise, treat typeOrUrl as AssetType and construct the URL.
  const type = typeOrUrl as AssetType;
  const CDN_BASE_URL = CONFIG.CDN_CONFIG.CDN_BASE_URL;

  switch (type) {
    case AssetType.ArchetypeAvatar:
      if (!params?.archetypeKey || !params?.legacyKey) {
        throw new Error('archetypeKey and legacyKey are required for ArchetypeAvatar assets.');
      }
      return `${CDN_BASE_URL}/archetype/${params.archetypeKey}-${params.legacyKey}.png`;
    // Add cases for other asset types here
    default:
      throw new Error(`Unknown asset type: ${type}`);
  }
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

