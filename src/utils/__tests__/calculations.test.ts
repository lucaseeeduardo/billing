/**
 * Calculation utility tests - 🔴 Critical priority
 * Tests for financial aggregations and percentages
 */

import {
    calculateTotal,
    calculateCategoryTotals,
    calculatePercentages,
    calculateAverage,
    countByCategory,
} from '../calculations';
import { Transaction, Category } from '@/types';

// Helper to create test transactions
function createTransaction(
    amount: number,
    category: Category | null = null
): Transaction {
    return {
        id: `tx-${Math.random()}`,
        date: '2025-01-01',
        title: 'Test Transaction',
        amount,
        category,
    };
}

describe('calculateTotal', () => {
    test('soma básica de transações', () => {
        const transactions = [
            createTransaction(100),
            createTransaction(200),
            createTransaction(300),
        ];
        expect(calculateTotal(transactions)).toBe(600);
    });

    test('soma com valores decimais (precisão)', () => {
        const transactions = [
            createTransaction(10.5),
            createTransaction(20.3),
            createTransaction(30.2),
        ];
        expect(calculateTotal(transactions)).toBe(61);
    });

    test('soma com valores negativos', () => {
        const transactions = [
            createTransaction(100),
            createTransaction(-50),
            createTransaction(200),
        ];
        expect(calculateTotal(transactions)).toBe(250);
    });

    test('array vazio retorna 0', () => {
        expect(calculateTotal([])).toBe(0);
    });

    test('um único elemento', () => {
        expect(calculateTotal([createTransaction(500)])).toBe(500);
    });

    test('null/undefined retorna 0', () => {
        expect(calculateTotal(null as unknown as Transaction[])).toBe(0);
        expect(calculateTotal(undefined as unknown as Transaction[])).toBe(0);
    });

    test('valores muito grandes', () => {
        const transactions = [
            createTransaction(999999999.99),
            createTransaction(0.01),
        ];
        expect(calculateTotal(transactions)).toBe(1000000000);
    });
});

describe('calculateCategoryTotals', () => {
    test('agrupa transações por categoria corretamente', () => {
        const transactions = [
            createTransaction(100, 'Transporte'),
            createTransaction(200, 'Transporte'),
            createTransaction(150, 'Restaurante'),
            createTransaction(300, 'Mercado'),
        ];

        const totals = calculateCategoryTotals(transactions);

        expect(totals.Transporte).toBe(300);
        expect(totals.Restaurante).toBe(150);
        expect(totals.Mercado).toBe(300);
        expect(totals.Outros).toBe(0);
    });

    test('ignora transações sem categoria', () => {
        const transactions = [
            createTransaction(100, 'Transporte'),
            createTransaction(200, null), // Sem categoria
            createTransaction(150, 'Mercado'),
        ];

        const totals = calculateCategoryTotals(transactions);

        expect(totals.Transporte).toBe(100);
        expect(totals.Mercado).toBe(150);
    });

    test('array vazio retorna zeros', () => {
        const totals = calculateCategoryTotals([]);

        expect(totals.Transporte).toBe(0);
        expect(totals.Restaurante).toBe(0);
        expect(totals.Mercado).toBe(0);
        expect(totals.Outros).toBe(0);
    });

    test('precisão decimal nas somas por categoria', () => {
        const transactions = [
            createTransaction(0.1, 'Transporte'),
            createTransaction(0.2, 'Transporte'),
        ];

        const totals = calculateCategoryTotals(transactions);
        expect(totals.Transporte).toBe(0.3); // Não 0.30000000000000004
    });
});

describe('calculatePercentages 🔴 CRÍTICO', () => {
    test('percentuais devem somar 100%', () => {
        const totals: Record<Category, number> = {
            Transporte: 100,
            Restaurante: 200,
            Mercado: 150,
            Outros: 50,
        };

        const percentages = calculatePercentages(totals);
        const sum = Object.values(percentages).reduce((a, b) => a + b, 0);

        expect(sum).toBeCloseTo(100, 2);
    });

    test('calcula percentuais corretamente', () => {
        const totals: Record<Category, number> = {
            Transporte: 250,
            Restaurante: 250,
            Mercado: 250,
            Outros: 250,
        };

        const percentages = calculatePercentages(totals);

        expect(percentages.Transporte).toBe(25);
        expect(percentages.Restaurante).toBe(25);
        expect(percentages.Mercado).toBe(25);
        expect(percentages.Outros).toBe(25);
    });

    test('totais zero retornam percentuais zero', () => {
        const totals: Record<Category, number> = {
            Transporte: 0,
            Restaurante: 0,
            Mercado: 0,
            Outros: 0,
        };

        const percentages = calculatePercentages(totals);

        expect(percentages.Transporte).toBe(0);
        expect(percentages.Restaurante).toBe(0);
        expect(percentages.Mercado).toBe(0);
        expect(percentages.Outros).toBe(0);
    });

    test('uma categoria com 100%', () => {
        const totals: Record<Category, number> = {
            Transporte: 1000,
            Restaurante: 0,
            Mercado: 0,
            Outros: 0,
        };

        const percentages = calculatePercentages(totals);

        expect(percentages.Transporte).toBe(100);
    });

    test('valores não inteiros somam 100%', () => {
        const totals: Record<Category, number> = {
            Transporte: 33.33,
            Restaurante: 33.33,
            Mercado: 33.34,
            Outros: 0,
        };

        const percentages = calculatePercentages(totals);
        const sum = Object.values(percentages).reduce((a, b) => a + b, 0);

        expect(sum).toBeCloseTo(100, 2);
    });
});

describe('calculateAverage', () => {
    test('calcula média corretamente', () => {
        expect(calculateAverage([100, 200, 300])).toBe(200);
    });

    test('array vazio retorna 0', () => {
        expect(calculateAverage([])).toBe(0);
    });

    test('um único valor retorna ele mesmo', () => {
        expect(calculateAverage([500])).toBe(500);
    });

    test('média com decimais', () => {
        expect(calculateAverage([10, 20, 30])).toBe(20);
    });
});

describe('countByCategory', () => {
    test('conta transações por categoria', () => {
        const transactions = [
            createTransaction(100, 'Transporte'),
            createTransaction(200, 'Transporte'),
            createTransaction(150, 'Restaurante'),
            createTransaction(300, 'Mercado'),
            createTransaction(50, null), // Sem categoria
        ];

        const counts = countByCategory(transactions);

        expect(counts.Transporte).toBe(2);
        expect(counts.Restaurante).toBe(1);
        expect(counts.Mercado).toBe(1);
        expect(counts.Outros).toBe(0);
    });

    test('array vazio retorna zeros', () => {
        const counts = countByCategory([]);

        expect(counts.Transporte).toBe(0);
        expect(counts.Restaurante).toBe(0);
        expect(counts.Mercado).toBe(0);
        expect(counts.Outros).toBe(0);
    });
});
