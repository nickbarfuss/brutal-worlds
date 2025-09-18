export interface SFXAsset {
    src: string;
}

export interface VFXAsset {
    src: string;
    width: number;
    height: number;
}

export type Asset = SFXAsset | VFXAsset;

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
                        } else if (typeof item === 'object' && item !== null && typeof item.src === 'string') {
                            if (item.src.endsWith('.mp3')) {
                                urls.audio.push(item.src);
                            } else if (item.src.endsWith('.webm')) {
                                urls.video.push(item.src);
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
 * Flattens a nested asset object into a map of logical keys to arrays of URLs,
 * filtering by the specified file extensions.
 * @param assets The nested ASSETS object.
 * @param extensions An array of file extensions to include (e.g., ['.mp3', '.wav']).
 * @returns A Map where keys are flattened strings (e.g., "ui-common-buttonGameStart")
 *          and values are arrays of matching asset URLs.
 */
export const flattenAssetUrls = <T extends Asset>(assets: any, extensions: string[]): Map<string, T[]> => {
    const flattenedMap = new Map<string, T[]>();
    console.log(`[flattenAssetUrls] Starting for extensions: ${extensions.join(', ')}`);

    const traverse = (obj: any, path: string[]) => {
        if (obj === null || typeof obj !== 'object') {
            return;
        }

        const isLeafNode = (value: any): boolean => {
            if (Array.isArray(value)) {
                return value.every(item =>
                    (typeof item === 'object' &&
                    item !== null &&
                    typeof item.src === 'string' &&
                    extensions.some(ext => item.src.endsWith(ext))) || (typeof item === 'string' && extensions.some(ext => item.endsWith(ext)))
                );
            }
            if (typeof value === 'string') {
                return extensions.some(ext => value.endsWith(ext));
            }
            return false;
        };

        if (isLeafNode(obj)) {
            const items = (Array.isArray(obj) ? obj : [obj]).map(item => {
                if (typeof item === 'string') {
                    return { src: item } as T;
                }
                return item as T;
            });
            const key = path.join('-');
            console.log(`[flattenAssetUrls] Found leaf node. Setting key: '${key}' with path: [${path.join(', ')}]`);
            if (flattenedMap.has(key)) {
                flattenedMap.get(key)!.push(...items);
            } else {
                flattenedMap.set(key, items);
            }
        } else if (Array.isArray(obj)) {
            // This handles arrays that are not leaf nodes, i.e., arrays of objects.
            obj.forEach((item) => {
                // We don't append index to path for arrays of objects to keep keys clean
                traverse(item, path);
            });
        } else {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    traverse(obj[key], [...path, key]);
                }
            }
        }
    };

    traverse(assets, []);
    console.log(`[flattenAssetUrls] Finished. Map size: ${flattenedMap.size}`);
    return flattenedMap;
};

export const extractVfxProfiles = (assets: any): Record<string, string> => {
    const vfxProfiles: Record<string, string> = {};

    const traverse = (obj: any, path: string[]) => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                const currentPath = [...path, key];

                if (key === 'vfx' && Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null && typeof item.src === 'string') { // Now expecting object
                            const profileKey = currentPath.slice(0, -1).join('-') + (value.length > 1 ? `-${index}` : '');
                            vfxProfiles[profileKey] = item.src; // Assign the src property
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