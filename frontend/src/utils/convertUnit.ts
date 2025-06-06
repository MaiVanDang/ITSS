export function convertToBaseUnit(measure: string, quantity: number): number {
    const map: Record<string, number> = {
        'kg': 1000,
        'tấn': 1000000,
        'tạ': 100000,
        'yến': 10000,
        'lít': 1000,
        'chai': 1000,
        'cốc': 240,
        'thìa': 15,
        'muỗng': 10,
        // những đơn vị gốc không đổi:
        'g': 1,
        'gram': 1,
        'ml': 1,
        'con': 1,
        'quả': 1,
        'củ': 1,
        'miếng': 1,
    };

    const factor = map[measure.toLowerCase()] || 1;
    return quantity * factor;
}
