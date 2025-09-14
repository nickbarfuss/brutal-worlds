
import { VfxProfile } from '@/types/game';

/**
 * Returns the asset URL. It can be a full URL or a relative path.
 * @param url The URL string of the asset.
 * @returns The validated asset URL.
 */
export function getAssetUrl(url: string): string {
  try {
    if (typeof url !== 'string' || url.trim() === '') {
      throw new Error('Provided URL is not a valid string or is empty.');
    }
    return url;
  } catch (error) {
    console.error("Error in getAssetUrl:", error);
    throw error; // Re-throw to propagate the error
  }
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

type AssetUrls = {
    audio: string[];
    video: string[];
    image: string[];
};

/**
 * Extracts and categorizes asset URLs from a nested object structure.
 * It looks for URLs ending with .mp3, .webm, .jpg, and .png.
 * @param assets The nested object containing asset URLs.
 * @returns An object with categorized arrays of asset URLs.
 */
export const extractAssetUrls = (assets: any): AssetUrls => {
    const urls: AssetUrls = {
        audio: [],
        video: [],
        image: [],
    };

    const traverse = (obj: any) => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];

                if (typeof value === 'string') {
                    if (value.endsWith('.mp3')) {
                        urls.audio.push(value);
                    } else if (value.endsWith('.webm')) {
                        urls.video.push(value);
                    } else if (value.endsWith('.jpg') || value.endsWith('.png')) {
                        urls.image.push(value);
                    }
                } else if (Array.isArray(value)) {
                    value.forEach(item => {
                        if (typeof item === 'string') {
                            if (item.endsWith('.mp3')) {
                                urls.audio.push(item);
                            } else if (item.endsWith('.webm')) {
                                urls.video.push(item);
                            } else if (item.endsWith('.jpg') || item.endsWith('.png')) {
                                urls.image.push(item);
                            }
                        } else if (typeof item === 'object' && item !== null && 'url' in item) {
                            if (item.url.endsWith('.mp3')) {
                                urls.audio.push(item.url);
                            } else if (item.url.endsWith('.webm')) {
                                urls.video.push(item.url);
                            } else if (item.url.endsWith('.jpg') || item.url.endsWith('.png')) {
                                urls.image.push(item.url);
                            }
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    traverse(value);
                }
            }
        }
    };

    traverse(assets);

    // Remove duplicates
    urls.audio = Array.from(new Set(urls.audio));
    urls.video = Array.from(new Set(urls.video));
    urls.image = Array.from(new Set(urls.image));

    return urls;
};

/**
 * Flattens the nested ASSETS object into a map of logical keys to arrays of URLs.
 * @param assets The nested ASSETS object.
 * @returns A Map where keys are flattened strings (e.g., "ui-common-buttonGameStart") and values are arrays of URLs.
 */
export const flattenAssetUrls = (assets: any): Map<string, string[]> => {
    const flattenedMap = new Map<string, string[]>();

    const traverse = (obj: any, path: string[]) => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                const currentPath = [...path, key];
                const flattenedKey = currentPath.join('-');

                if (typeof value === 'string') {
                    if (value.endsWith('.mp3')) {
                        flattenedMap.set(flattenedKey, [value]);
                    }
                } else if (Array.isArray(value)) {
                    const urls: string[] = [];
                    value.forEach(item => {
                        if (typeof item === 'string' && item.endsWith('.mp3')) {
                            urls.push(item);
                        } else if (typeof item === 'object' && item !== null && 'url' in item && item.url.endsWith('.mp3')) {
                            urls.push(item.url);
                        }
                    });
                    if (urls.length > 0) {
                        flattenedMap.set(flattenedKey, urls);
                    }
                } else if (typeof value === 'object' && value !== null) {
                    traverse(value, currentPath);
                }
            }
        }
    };

    traverse(assets, []);
    return flattenedMap;
};

export const extractVfxProfiles = (assets: any): Record<string, VfxProfile> => {
    const vfxProfiles: Record<string, VfxProfile> = {};

    const traverse = (obj: any, path: string[]) => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                const currentPath = [...path, key];

                if (key === 'vfx' && Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null && 'url' in item) {
                            const profileKey = currentPath.slice(0, -1).join('-') + (value.length > 1 ? `-${index}` : '');
                            vfxProfiles[profileKey] = item as VfxProfile;
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    traverse(value, currentPath);
                }
            }
        }
    };

    traverse(assets, []);

    return vfxProfiles;
};

/**
 * Safely retrieves a nested property from an object using a string path.
 * @param obj The object to traverse.
 * @param path The path to the nested property, e.g., "archetype.firstSword.annihilationDoctrine.avatar".
 * @returns The value of the nested property, or undefined if not found.
 */
export const getNestedAsset = (obj: any, path: string): any => {
  const result = path.split('.').reduce((acc, part) => acc && acc[part], obj);
  return result;
};