/**
 * Currency parsing and formatting utilities
 * Supports pt-BR (1.234,56) and en-US (1,234.56) formats
 */

export type CurrencyFormat = 'pt-BR' | 'en-US';

export interface ParseCurrencyResult {
    amount: number;
    isValid: boolean;
}

/**
 * Parse a currency string into a number
 * @param value - The string to parse (e.g., "1.234,56" or "R$ 100,00")
 * @param format - The currency format to use ('pt-BR' or 'en-US')
 * @returns An object with the parsed amount and validity flag
 */
export function parseCurrency(value: string, format: CurrencyFormat = 'pt-BR'): ParseCurrencyResult {
    if (!value || value.trim() === '') {
        return { amount: 0, isValid: false };
    }

    let cleaned = value.trim();

    // Remove currency symbols and whitespace
    cleaned = cleaned.replace(/[R$€£¥\s]/g, '');

    try {
        if (format === 'pt-BR') {
            // pt-BR: 1.234,56 -> remove dots, replace comma with dot
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
            // en-US: 1,234.56 -> remove commas
            cleaned = cleaned.replace(/,/g, '');
        }

        const amount = parseFloat(cleaned);

        if (isNaN(amount)) {
            return { amount: 0, isValid: false };
        }

        return { amount, isValid: true };
    } catch {
        return { amount: 0, isValid: false };
    }
}

/**
 * Format a number as a currency string
 * @param value - The number to format
 * @param format - The currency format to use ('pt-BR' or 'en-US')
 * @param includeSymbol - Whether to include the currency symbol
 * @returns The formatted currency string
 */
export function formatCurrency(
    value: number,
    format: CurrencyFormat = 'pt-BR',
    includeSymbol: boolean = true
): string {
    const absValue = Math.abs(value);
    const isNegative = value < 0;

    let formatted: string;
    let symbol: string;

    if (format === 'pt-BR') {
        symbol = 'R$ ';
        formatted = absValue.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else {
        symbol = '$ ';
        formatted = absValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    const prefix = isNegative ? '-' : '';
    return includeSymbol ? `${prefix}${symbol}${formatted}` : `${prefix}${formatted}`;
}

/**
 * Sum an array of numbers with decimal precision
 * Avoids floating-point precision issues (e.g., 0.1 + 0.2 = 0.3, not 0.30000000000000004)
 * @param values - Array of numbers to sum
 * @returns The precise sum
 */
export function sumValues(values: number[]): number {
    if (values.length === 0) {
        return 0;
    }

    // Multiply by 100, sum as integers, then divide back
    // This avoids floating-point precision issues for 2 decimal places
    const sum = values.reduce((acc, val) => {
        return acc + Math.round(val * 100);
    }, 0);

    return sum / 100;
}

/**
 * Detect the likely currency format from a string
 * @param value - The string to analyze
 * @returns The detected format or null if ambiguous
 */
export function detectCurrencyFormat(value: string): CurrencyFormat | null {
    if (!value) return null;

    const cleaned = value.replace(/[R$€£¥\s-]/g, '');

    // Count separators
    const dots = (cleaned.match(/\./g) || []).length;
    const commas = (cleaned.match(/,/g) || []).length;

    // pt-BR: uses comma for decimal (1.234,56)
    // en-US: uses dot for decimal (1,234.56)

    if (commas === 1 && dots >= 0) {
        // Check if comma is in decimal position (last 3 chars)
        const commaIndex = cleaned.indexOf(',');
        if (cleaned.length - commaIndex <= 3) {
            return 'pt-BR';
        }
    }

    if (dots === 1 && commas >= 0) {
        // Check if dot is in decimal position
        const dotIndex = cleaned.indexOf('.');
        if (cleaned.length - dotIndex <= 3) {
            return 'en-US';
        }
    }

    // Ambiguous
    return null;
}
