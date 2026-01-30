/**
 * File validation utility tests - 🟡 High priority
 */

import {
    validateFileExtension,
    validateFileSize,
    formatFileSize,
    validateCsvFile,
} from '../validation';

describe('validateFileExtension', () => {
    test('extensão válida (.csv)', () => {
        expect(validateFileExtension('data.csv', ['.csv'])).toBe(true);
    });

    test('extensão válida case-insensitive', () => {
        expect(validateFileExtension('data.CSV', ['.csv'])).toBe(true);
        expect(validateFileExtension('data.Csv', ['.csv'])).toBe(true);
    });

    test('extensão inválida (.xlsx)', () => {
        expect(validateFileExtension('data.xlsx', ['.csv'])).toBe(false);
    });

    test('extensão inválida (.txt)', () => {
        expect(validateFileExtension('data.txt', ['.csv'])).toBe(false);
    });

    test('múltiplas extensões aceitas', () => {
        expect(validateFileExtension('data.csv', ['.csv', '.txt'])).toBe(true);
        expect(validateFileExtension('data.txt', ['.csv', '.txt'])).toBe(true);
        expect(validateFileExtension('data.xlsx', ['.csv', '.txt'])).toBe(false);
    });

    test('nome de arquivo vazio', () => {
        expect(validateFileExtension('', ['.csv'])).toBe(false);
    });

    test('lista de extensões vazia', () => {
        expect(validateFileExtension('data.csv', [])).toBe(false);
    });

    test('arquivo sem extensão', () => {
        expect(validateFileExtension('datacsv', ['.csv'])).toBe(false);
    });

    test('arquivo com múltiplos pontos', () => {
        expect(validateFileExtension('data.backup.csv', ['.csv'])).toBe(true);
    });
});

describe('validateFileSize', () => {
    const MB = 1024 * 1024;

    test('tamanho dentro do limite', () => {
        expect(validateFileSize(1 * MB, 5 * MB)).toBe(true);
    });

    test('tamanho exatamente no limite', () => {
        expect(validateFileSize(5 * MB, 5 * MB)).toBe(true);
    });

    test('tamanho excede limite', () => {
        expect(validateFileSize(6 * MB, 5 * MB)).toBe(false);
    });

    test('tamanho zero é válido', () => {
        expect(validateFileSize(0, 5 * MB)).toBe(true);
    });

    test('tamanho negativo é inválido', () => {
        expect(validateFileSize(-1, 5 * MB)).toBe(false);
    });

    test('limite negativo é inválido', () => {
        expect(validateFileSize(1 * MB, -1)).toBe(false);
    });

    test('limite zero é inválido', () => {
        expect(validateFileSize(0, 0)).toBe(false);
    });

    test('valores não numéricos retornam false', () => {
        expect(validateFileSize(NaN, 5 * MB)).toBe(false);
        expect(validateFileSize(1 * MB, NaN)).toBe(false);
    });
});

describe('formatFileSize', () => {
    test.each([
        { input: 0, expected: '0.0 B' },
        { input: 500, expected: '500.0 B' },
        { input: 1024, expected: '1.0 KB' },
        { input: 1536, expected: '1.5 KB' },
        { input: 1024 * 1024, expected: '1.0 MB' },
        { input: 1.5 * 1024 * 1024, expected: '1.5 MB' },
        { input: 1024 * 1024 * 1024, expected: '1.0 GB' },
    ])('formata $input bytes como "$expected"', ({ input, expected }) => {
        expect(formatFileSize(input)).toBe(expected);
    });

    test('valor negativo retorna 0 B', () => {
        expect(formatFileSize(-100)).toBe('0 B');
    });
});

describe('validateCsvFile', () => {
    const createMockFile = (name: string, size: number): File => {
        const file = new File([''], name, { type: 'text/csv' });
        Object.defineProperty(file, 'size', { value: size });
        return file;
    };

    test('arquivo CSV válido', () => {
        const file = createMockFile('data.csv', 1024);
        const result = validateCsvFile(file);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    test('arquivo com extensão inválida', () => {
        const file = createMockFile('data.xlsx', 1024);
        const result = validateCsvFile(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Tipo de arquivo inválido');
    });

    test('arquivo muito grande (> 5MB)', () => {
        const file = createMockFile('data.csv', 6 * 1024 * 1024);
        const result = validateCsvFile(file);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('muito grande');
    });

    test('arquivo muito grande com limite customizado', () => {
        const file = createMockFile('data.csv', 2 * 1024 * 1024);
        const result = validateCsvFile(file, 1 * 1024 * 1024); // 1MB limit
        expect(result.isValid).toBe(false);
    });

    test('sem arquivo selecionado', () => {
        const result = validateCsvFile(null as unknown as File);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Nenhum arquivo');
    });
});
