'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Categoria, getCategoryColor } from '@/types';
import { useTransactionStore } from '@/store/transactionStore';
import { useLimitsStore } from '@/store/limitsStore';
import { TransactionCard } from './TransactionCard';

interface CategoryDropZoneProps {
    category: Categoria;
}

export function CategoryDropZone({ category }: CategoryDropZoneProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: category.id,
        data: { category },
    });

    const transactions = useTransactionStore((state) => state.getByCategoryId(category.id));
    const totals = useTransactionStore((state) => state.getCategoryTotals());
    const checkLimit = useLimitsStore((state) => state.checkLimit);

    const colors = getCategoryColor(category);
    const total = totals[category.id] || 0;
    const formattedTotal = `R$ ${Math.abs(total).toFixed(2).replace('.', ',')}`;

    // Check limit status
    const limitStatus = checkLimit(category.id, Math.abs(total));

    // Local filter state
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [filterText, setFilterText] = React.useState('');

    const filteredTransactions = React.useMemo(() => {
        if (!filterText) return transactions;
        return transactions.filter(t =>
            t.title.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [transactions, filterText]);

    return (
        <div
            ref={setNodeRef}
            className={`
        flex flex-col rounded-2xl p-4 min-h-[200px]
        border-2 border-dashed transition-all duration-300
        ${isOver
                    ? 'border-solid scale-[1.02] shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }
      `}
            style={{
                backgroundColor: isOver ? colors.light : 'rgba(255,255,255,0.5)',
                borderColor: isOver ? colors.main : undefined,
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-2xl flex-shrink-0">{category.icone}</span>
                    <h3
                        className="font-bold text-lg truncate"
                        style={{ color: colors.text }}
                        title={category.nome}
                    >
                        {category.nome}
                    </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Search Toggle */}
                    <button
                        onClick={() => {
                            setIsSearchOpen(!isSearchOpen);
                            if (isSearchOpen) setFilterText('');
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${isSearchOpen
                                ? 'bg-blue-100 text-blue-600'
                                : 'hover:bg-gray-100 text-gray-400'
                            }`}
                        title="Buscar nesta categoria"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Limit indicator */}
                    {limitStatus && (
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${limitStatus.status === 'exceeded'
                                ? 'bg-red-100 text-red-700'
                                : limitStatus.status === 'warning'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                        >
                            {limitStatus.percentage.toFixed(0)}%
                        </span>
                    )}
                    <div
                        className="px-3 py-1 rounded-full font-semibold text-sm whitespace-nowrap"
                        style={{ backgroundColor: colors.light, color: colors.text }}
                    >
                        {formattedTotal}
                    </div>
                </div>
            </div>

            {/* Search Input */}
            {isSearchOpen && (
                <div className="mb-3 animate-fade-in-down">
                    <input
                        type="text"
                        autoFocus
                        placeholder="Filtrar..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none bg-white/80 backdrop-blur-sm"
                    />
                </div>
            )}

            {/* Limit progress bar */}
            {limitStatus && (
                <div className="mb-3">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${limitStatus.status === 'exceeded'
                                ? 'bg-red-500'
                                : limitStatus.status === 'warning'
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                                }`}
                            style={{ width: `${Math.min(limitStatus.percentage, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Counter */}
            <div className="text-sm text-gray-500 mb-3 flex justify-between items-center">
                <span>
                    {filteredTransactions.length} {filteredTransactions.length === 1 ? 'item' : 'itens'}
                </span>
                {filterText && transactions.length !== filteredTransactions.length && (
                    <span className="text-xs text-gray-400">
                        (Total: {transactions.length})
                    </span>
                )}
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
                {filteredTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
                        {filterText ? (
                            <>
                                <span className="text-2xl mb-2">🔍</span>
                                <span className="text-sm text-center">Nenhum resultado</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 mb-2 opacity-50"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                    />
                                </svg>
                                <span className="text-sm">Arraste itens aqui</span>
                            </>
                        )}
                    </div>
                ) : (
                    filteredTransactions.map((transaction) => (
                        <TransactionCard key={transaction.id} transaction={transaction} />
                    ))
                )}
            </div>
        </div>
    );
}
