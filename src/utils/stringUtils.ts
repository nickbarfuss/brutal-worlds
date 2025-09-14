/**
 * Converts a string from kebab-case or snake_case to camelCase.
 * @param str The input string.
 * @returns The camelCased string.
 */
export const toCamelCase = (str: string): string => {
  if (!str) {
    return '';
  }
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};
