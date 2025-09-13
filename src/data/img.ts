const ARCHETYPE_BASE_URL = 'https://storage.googleapis.com/brutal-worlds/archetype';


export const getArchetypeAvatarUrl = (archetypeKey: string, legacyKey: string): string => {
  return `${ARCHETYPE_BASE_URL}/${archetypeKey}-${legacyKey}.png`;
};
