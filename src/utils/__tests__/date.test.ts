/**
 * Date utility tests - 🟡 High priority
 */

import {
    formatDateBR,
    formatDateISO,
    parseDate,
    isValidDate,
} from '../date';

describe('formatDateBR', () => {
    test.each([
        { input: '2025-12-17', expected: '17/12/2025' },
        { input: '2025-01-01', expected: '01/01/2025' },
        { input: '2000-06-15', expected: '15/06/2000' },
    ])('deve formatar "$input" como "$expected"', ({ input, expected }) => {
        expect(formatDateBR(input)).toBe(expected);
    });

    test('string vazia retorna string vazia', () => {
        expect(formatDateBR('')).toBe('');
    });

    test('null/undefined retorna string vazia', () => {
        expect(formatDateBR(null as unknown as string)).toBe('');
        expect(formatDateBR(undefined as unknown as string)).toBe('');
    });

    test('formato inválido retorna input original', () => {
        expect(formatDateBR('invalid')).toBe('invalid');
    });

    test('já em formato BR retorna input original', () => {
        expect(formatDateBR('17/12/2025')).toBe('17/12/2025');
    });
});

describe('formatDateISO', () => {
    test.each([
        { input: '17/12/2025', expected: '2025-12-17' },
        { input: '01/01/2025', expected: '2025-01-01' },
        { input: '15/06/2000', expected: '2000-06-15' },
    ])('deve formatar "$input" como "$expected"', ({ input, expected }) => {
        expect(formatDateISO(input)).toBe(expected);
    });

    test('string vazia retorna string vazia', () => {
        expect(formatDateISO('')).toBe('');
    });
});

describe('parseDate', () => {
    test('parseia formato ISO (YYYY-MM-DD)', () => {
        const date = parseDate('2025-12-17');
        expect(date).not.toBeNull();
        expect(date?.getFullYear()).toBe(2025);
        expect(date?.getMonth()).toBe(11); // Dezembro = 11 (0-indexed)
        expect(date?.getDate()).toBe(17);
    });

    test('parseia formato BR (DD/MM/YYYY)', () => {
        const date = parseDate('17/12/2025');
        expect(date).not.toBeNull();
        expect(date?.getFullYear()).toBe(2025);
        expect(date?.getMonth()).toBe(11);
        expect(date?.getDate()).toBe(17);
    });

    test('string vazia retorna null', () => {
        expect(parseDate('')).toBeNull();
    });

    test('formato inválido retorna null', () => {
        expect(parseDate('invalid')).toBeNull();
    });

    test('null/undefined retorna null', () => {
        expect(parseDate(null as unknown as string)).toBeNull();
        expect(parseDate(undefined as unknown as string)).toBeNull();
    });
});

describe('isValidDate', () => {
    test.each([
        { input: '2025-12-17', expected: true },
        { input: '17/12/2025', expected: true },
        { input: '2025-01-01', expected: true },
    ])('$input é válida: $expected', ({ input, expected }) => {
        expect(isValidDate(input)).toBe(expected);
    });

    test.each([
        { input: '', expected: false },
        { input: 'invalid', expected: false },
    ])('$input é inválida: $expected', ({ input, expected }) => {
        expect(isValidDate(input)).toBe(expected);
    });
});
