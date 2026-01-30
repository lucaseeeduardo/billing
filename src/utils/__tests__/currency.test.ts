/**
 * Currency utility tests - 🔴 Critical priority
 * Tests for currency parsing, formatting, and decimal precision
 */

import {
    parseCurrency,
    formatCurrency,
    sumValues,
    detectCurrencyFormat,
    CurrencyFormat,
} from '../currency';

describe('parseCurrency', () => {
    describe('pt-BR format', () => {
        const format: CurrencyFormat = 'pt-BR';

        test.each([
            { input: '1.234,56', expected: 1234.56, desc: 'milhares com decimal' },
            { input: '1234,56', expected: 1234.56, desc: 'sem separador de milhares' },
            { input: '1.234.567,89', expected: 1234567.89, desc: 'milhões' },
            { input: '100,00', expected: 100, desc: 'valor simples' },
            { input: '0,99', expected: 0.99, desc: 'centavos' },
            { input: '-100,00', expected: -100, desc: 'valor negativo' },
            { input: '-1.234,56', expected: -1234.56, desc: 'negativo com milhares' },
        ])('deve parsear "$input" como $expected ($desc)', ({ input, expected }) => {
            const result = parseCurrency(input, format);
            expect(result.isValid).toBe(true);
            expect(result.amount).toBe(expected);
        });

        test.each([
            { input: 'R$ 100,00', expected: 100, desc: 'com símbolo R$' },
            { input: 'R$100,00', expected: 100, desc: 'símbolo sem espaço' },
            { input: '  R$ 1.234,56  ', expected: 1234.56, desc: 'com espaços' },
        ])('deve remover símbolo de "$input" ($desc)', ({ input, expected }) => {
            const result = parseCurrency(input, format);
            expect(result.isValid).toBe(true);
            expect(result.amount).toBe(expected);
        });
    });

    describe('en-US format', () => {
        const format: CurrencyFormat = 'en-US';

        test.each([
            { input: '1,234.56', expected: 1234.56, desc: 'milhares com decimal' },
            { input: '1234.56', expected: 1234.56, desc: 'sem separador de milhares' },
            { input: '1,234,567.89', expected: 1234567.89, desc: 'milhões' },
            { input: '100.00', expected: 100, desc: 'valor simples' },
            { input: '0.99', expected: 0.99, desc: 'centavos' },
            { input: '-100.00', expected: -100, desc: 'valor negativo' },
        ])('deve parsear "$input" como $expected ($desc)', ({ input, expected }) => {
            const result = parseCurrency(input, format);
            expect(result.isValid).toBe(true);
            expect(result.amount).toBe(expected);
        });

        test.each([
            { input: '$ 100.00', expected: 100, desc: 'com símbolo $' },
            { input: '$100.00', expected: 100, desc: 'símbolo sem espaço' },
            { input: '€ 1,234.56', expected: 1234.56, desc: 'símbolo euro' },
            { input: '£ 1,234.56', expected: 1234.56, desc: 'símbolo libra' },
        ])('deve remover símbolo de "$input" ($desc)', ({ input, expected }) => {
            const result = parseCurrency(input, format);
            expect(result.isValid).toBe(true);
            expect(result.amount).toBe(expected);
        });
    });

    describe('Edge Cases', () => {
        test('deve retornar inválido para string vazia', () => {
            const result = parseCurrency('', 'pt-BR');
            expect(result.isValid).toBe(false);
            expect(result.amount).toBe(0);
        });

        test('deve retornar inválido para espaços em branco', () => {
            const result = parseCurrency('   ', 'pt-BR');
            expect(result.isValid).toBe(false);
        });

        test('deve retornar inválido para texto não numérico', () => {
            const result = parseCurrency('abc', 'pt-BR');
            expect(result.isValid).toBe(false);
        });

        test('deve retornar inválido para texto misto', () => {
            const result = parseCurrency('R$ abc', 'pt-BR');
            expect(result.isValid).toBe(false);
        });

        test('deve parsear zero corretamente', () => {
            const result = parseCurrency('0,00', 'pt-BR');
            expect(result.isValid).toBe(true);
            expect(result.amount).toBe(0);
        });

        test('formato padrão deve ser pt-BR', () => {
            const result = parseCurrency('1.234,56');
            expect(result.amount).toBe(1234.56);
        });
    });
});

describe('formatCurrency', () => {
    describe('pt-BR format', () => {
        test.each([
            { input: 1234.56, expected: 'R$ 1.234,56' },
            { input: 100, expected: 'R$ 100,00' },
            { input: 0.99, expected: 'R$ 0,99' },
            { input: 1234567.89, expected: 'R$ 1.234.567,89' },
        ])('deve formatar $input como "$expected"', ({ input, expected }) => {
            expect(formatCurrency(input, 'pt-BR')).toBe(expected);
        });

        test('deve formatar valor negativo', () => {
            expect(formatCurrency(-100, 'pt-BR')).toBe('-R$ 100,00');
        });

        test('deve formatar sem símbolo quando solicitado', () => {
            expect(formatCurrency(1234.56, 'pt-BR', false)).toBe('1.234,56');
        });
    });

    describe('en-US format', () => {
        test.each([
            { input: 1234.56, expected: '$ 1,234.56' },
            { input: 100, expected: '$ 100.00' },
            { input: 1234567.89, expected: '$ 1,234,567.89' },
        ])('deve formatar $input como "$expected"', ({ input, expected }) => {
            expect(formatCurrency(input, 'en-US')).toBe(expected);
        });
    });
});

describe('sumValues - Precisão Decimal 🔴 CRÍTICO', () => {
    test('deve evitar erro de ponto flutuante (0.1 + 0.2 = 0.3)', () => {
        // JavaScript padrão falha neste caso
        expect(0.1 + 0.2).not.toBe(0.3);

        // Nossa função deve funcionar corretamente
        expect(sumValues([0.1, 0.2])).toBe(0.3);
    });

    test('soma básica', () => {
        expect(sumValues([100, 200, 300])).toBe(600);
    });

    test('soma com decimais', () => {
        expect(sumValues([10.5, 20.3, 30.2])).toBe(61);
    });

    test('soma com negativos', () => {
        expect(sumValues([100, -50, 200])).toBe(250);
    });

    test('array vazio retorna 0', () => {
        expect(sumValues([])).toBe(0);
    });

    test('um único elemento', () => {
        expect(sumValues([500])).toBe(500);
    });

    test('valores muito grandes', () => {
        expect(sumValues([999999999.99, 0.01])).toBe(1000000000);
    });

    test('múltiplos valores pequenos que somam precisamente', () => {
        expect(sumValues([0.01, 0.02, 0.03, 0.04])).toBe(0.1);
    });

    test('valores monetários típicos', () => {
        expect(sumValues([29.99, 15.50, 245.80, 42.90])).toBe(334.19);
    });
});

describe('detectCurrencyFormat', () => {
    test('detecta pt-BR (vírgula como decimal)', () => {
        expect(detectCurrencyFormat('1.234,56')).toBe('pt-BR');
    });

    test('detecta en-US (ponto como decimal)', () => {
        expect(detectCurrencyFormat('1,234.56')).toBe('en-US');
    });

    test('retorna null para valor vazio', () => {
        expect(detectCurrencyFormat('')).toBeNull();
    });

    test('detecta formato simples pt-BR', () => {
        expect(detectCurrencyFormat('100,50')).toBe('pt-BR');
    });

    test('detecta formato simples en-US', () => {
        expect(detectCurrencyFormat('100.50')).toBe('en-US');
    });
});
