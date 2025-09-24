export function resolveNumericRange(value: number | [number, number] | undefined): number {
    if (value === undefined) return 0;
    if (Array.isArray(value)) {
        return Math.floor(Math.random() * (value[1] - value[0] + 1)) + value[0];
    }
    return value;
}
