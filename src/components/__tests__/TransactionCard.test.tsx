/**
 * TransactionCard component tests
 * Tests for rendering and formatting
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransactionCard } from '../TransactionCard';
import { Transaction } from '@/types';

// Mock the transaction store
jest.mock('@/store/transactionStore', () => ({
    useTransactionStore: () => ({
        categorizeTransaction: jest.fn(),
    }),
}));

// Mock dnd-kit
jest.mock('@dnd-kit/core', () => ({
    useDraggable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        isDragging: false,
    }),
}));

// Helper to create test transaction
function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        id: 'tx-1',
        date: '2025-12-17',
        title: 'Test Transaction',
        amount: 100.50,
        category: null,
        ...overrides,
    };
}

describe('TransactionCard', () => {
    describe('Renderização Básica', () => {
        test('renderiza o título da transação', () => {
            render(<TransactionCard transaction={createTransaction({ title: 'Uber Ride' })} />);
            expect(screen.getByText('Uber Ride')).toBeInTheDocument();
        });

        test('renderiza a data formatada (DD/MM/YYYY)', () => {
            render(<TransactionCard transaction={createTransaction({ date: '2025-12-17' })} />);
            expect(screen.getByText('17/12/2025')).toBeInTheDocument();
        });
    });

    describe('Formatação de Valores', () => {
        test('formata valor positivo em pt-BR', () => {
            render(<TransactionCard transaction={createTransaction({ amount: 1234.56 })} />);
            // O componente formata como "R$ X.XXX,XX"
            expect(screen.getByText(/R\$ 1234,56/)).toBeInTheDocument();
        });

        test('formata valor com centavos', () => {
            render(<TransactionCard transaction={createTransaction({ amount: 29.99 })} />);
            expect(screen.getByText(/R\$ 29,99/)).toBeInTheDocument();
        });

        test('valor negativo (crédito) mostra sinal positivo e cor verde', () => {
            render(<TransactionCard transaction={createTransaction({ amount: -100 })} />);
            // Valores negativos são exibidos como créditos com + na frente
            const valueElement = screen.getByText(/\+ R\$ 100,00/);
            expect(valueElement).toBeInTheDocument();
            expect(valueElement).toHaveClass('text-green-600');
        });
    });

    describe('Categoria', () => {
        test('sem categoria mostra dropdown de seleção', () => {
            render(<TransactionCard transaction={createTransaction({ category: null })} />);
            expect(screen.getByRole('combobox')).toBeInTheDocument();
            expect(screen.getByText('Selecionar categoria...')).toBeInTheDocument();
        });

        test('com categoria mostra badge', () => {
            render(<TransactionCard transaction={createTransaction({ category: 'Transporte' })} />);
            expect(screen.getByText('Transporte')).toBeInTheDocument();
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });

        test('dropdown mostra todas as categorias', () => {
            render(<TransactionCard transaction={createTransaction({ category: null })} />);
            const select = screen.getByRole('combobox');

            expect(select).toContainHTML('Transporte');
            expect(select).toContainHTML('Restaurante');
            expect(select).toContainHTML('Mercado');
            expect(select).toContainHTML('Outros');
        });
    });

    describe('Estilos', () => {
        test('aplica estilo de drag overlay', () => {
            const { container } = render(
                <TransactionCard
                    transaction={createTransaction()}
                    isDragOverlay={true}
                />
            );

            const card = container.firstChild as HTMLElement;
            expect(card.className).toContain('shadow-2xl');
            expect(card.className).toContain('rotate-3');
        });
    });

    describe('Edge Cases', () => {
        test('data em formato inválido mantém original', () => {
            render(<TransactionCard transaction={createTransaction({ date: 'invalid-date' })} />);
            expect(screen.getByText('invalid-date')).toBeInTheDocument();
        });

        test('título longo é truncado', () => {
            const longTitle = 'Este é um título muito longo que deveria ser truncado após algumas linhas para manter o layout compacto';
            render(<TransactionCard transaction={createTransaction({ title: longTitle })} />);

            const titleElement = screen.getByText(longTitle);
            expect(titleElement).toHaveClass('line-clamp-2');
        });
    });
});
