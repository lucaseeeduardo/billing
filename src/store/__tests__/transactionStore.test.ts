/**
 * Transaction Store tests
 * Tests for Zustand store selectors and actions
 */

import { act } from '@testing-library/react';
import { useTransactionStore } from '../transactionStore';
import { Transaction, Category } from '@/types';

// Helper to reset store between tests
const resetStore = () => {
    const { clearTransactions } = useTransactionStore.getState();
    clearTransactions();
};

// Helper to create test transactions
function createTransaction(
    id: string,
    amount: number,
    category: Category | null = null
): Transaction {
    return {
        id,
        date: '2025-01-01',
        title: `Transaction ${id}`,
        amount,
        category,
    };
}

describe('useTransactionStore', () => {
    beforeEach(() => {
        resetStore();
    });

    describe('addTransactions', () => {
        test('adiciona transações ao estado', () => {
            const transactions = [
                createTransaction('1', 100),
                createTransaction('2', 200),
            ];

            act(() => {
                useTransactionStore.getState().addTransactions(transactions);
            });

            expect(useTransactionStore.getState().transactions).toHaveLength(2);
        });

        test('mantém transações existentes', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([createTransaction('1', 100)]);
                useTransactionStore.getState().addTransactions([createTransaction('2', 200)]);
            });

            expect(useTransactionStore.getState().transactions).toHaveLength(2);
        });
    });

    describe('categorizeTransaction', () => {
        test('categoriza transação corretamente', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([createTransaction('1', 100)]);
                useTransactionStore.getState().categorizeTransaction('1', 'Transporte');
            });

            const transaction = useTransactionStore.getState().transactions[0];
            expect(transaction.category).toBe('Transporte');
        });

        test('não altera outras transações', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([
                    createTransaction('1', 100),
                    createTransaction('2', 200),
                ]);
                useTransactionStore.getState().categorizeTransaction('1', 'Transporte');
            });

            const transactions = useTransactionStore.getState().transactions;
            expect(transactions[0].category).toBe('Transporte');
            expect(transactions[1].category).toBeNull();
        });
    });

    describe('uncategorizeTransaction', () => {
        test('remove categoria da transação', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([
                    createTransaction('1', 100, 'Transporte'),
                ]);
                useTransactionStore.getState().uncategorizeTransaction('1');
            });

            const transaction = useTransactionStore.getState().transactions[0];
            expect(transaction.category).toBeNull();
        });
    });

    describe('getUncategorized', () => {
        test('retorna apenas transações sem categoria', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([
                    createTransaction('1', 100, 'Transporte'),
                    createTransaction('2', 200, null),
                    createTransaction('3', 300, null),
                ]);
            });

            const uncategorized = useTransactionStore.getState().getUncategorized();
            expect(uncategorized).toHaveLength(2);
        });

        test('filtra por texto', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([
                    { ...createTransaction('1', 100), title: 'Uber Ride' },
                    { ...createTransaction('2', 200), title: 'Pizza' },
                ]);
                useTransactionStore.getState().setFilterText('uber');
            });

            const uncategorized = useTransactionStore.getState().getUncategorized();
            expect(uncategorized).toHaveLength(1);
            expect(uncategorized[0].title).toBe('Uber Ride');
        });
    });

    describe('getByCategory', () => {
        test('retorna transações da categoria especificada', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([
                    createTransaction('1', 100, 'Transporte'),
                    createTransaction('2', 200, 'Transporte'),
                    createTransaction('3', 300, 'Mercado'),
                ]);
            });

            const transporteTransactions = useTransactionStore
                .getState()
                .getByCategory('Transporte');
            expect(transporteTransactions).toHaveLength(2);
        });
    });

    describe('getCategoryTotals 🔴 CRÍTICO', () => {
        test('calcula totais por categoria corretamente', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([
                    createTransaction('1', 100, 'Transporte'),
                    createTransaction('2', 200, 'Transporte'),
                    createTransaction('3', 150, 'Mercado'),
                ]);
            });

            const totals = useTransactionStore.getState().getCategoryTotals();
            expect(totals.Transporte).toBe(300);
            expect(totals.Mercado).toBe(150);
            expect(totals.Restaurante).toBe(0);
            expect(totals.Outros).toBe(0);
        });

        test('estado vazio retorna zeros', () => {
            const totals = useTransactionStore.getState().getCategoryTotals();
            expect(totals.Transporte).toBe(0);
            expect(totals.Restaurante).toBe(0);
            expect(totals.Mercado).toBe(0);
            expect(totals.Outros).toBe(0);
        });
    });

    describe('getCategoryPercentages 🔴 CRÍTICO', () => {
        test('calcula percentuais corretamente', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([
                    createTransaction('1', 100, 'Transporte'),
                    createTransaction('2', 100, 'Mercado'),
                ]);
            });

            const percentages = useTransactionStore.getState().getCategoryPercentages();
            expect(percentages.Transporte).toBe(50);
            expect(percentages.Mercado).toBe(50);
        });

        test('percentuais somam 100%', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([
                    createTransaction('1', 100, 'Transporte'),
                    createTransaction('2', 200, 'Restaurante'),
                    createTransaction('3', 150, 'Mercado'),
                    createTransaction('4', 50, 'Outros'),
                ]);
            });

            const percentages = useTransactionStore.getState().getCategoryPercentages();
            const total = Object.values(percentages).reduce((a, b) => a + b, 0);
            expect(total).toBeCloseTo(100, 2);
        });

        test('estado vazio retorna zeros', () => {
            const percentages = useTransactionStore.getState().getCategoryPercentages();
            expect(percentages.Transporte).toBe(0);
            expect(percentages.Restaurante).toBe(0);
            expect(percentages.Mercado).toBe(0);
            expect(percentages.Outros).toBe(0);
        });
    });

    describe('clearTransactions', () => {
        test('limpa todas as transações', () => {
            act(() => {
                useTransactionStore.getState().addTransactions([
                    createTransaction('1', 100),
                    createTransaction('2', 200),
                ]);
                useTransactionStore.getState().clearTransactions();
            });

            expect(useTransactionStore.getState().transactions).toHaveLength(0);
        });

        test('limpa o filtro de texto', () => {
            act(() => {
                useTransactionStore.getState().setFilterText('test');
                useTransactionStore.getState().clearTransactions();
            });

            expect(useTransactionStore.getState().filterText).toBe('');
        });
    });
});
