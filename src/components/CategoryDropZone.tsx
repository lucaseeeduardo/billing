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
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.icone}</span>
                    <h3
                        className="font-bold text-lg"
                        style={{ color: colors.text }}
                    >
                        {category.nome}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
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
                        className="px-3 py-1 rounded-full font-semibold text-sm"
                        style={{ backgroundColor: colors.light, color: colors.text }}
                    >
                        {formattedTotal}
                    </div>
                </div>
            </div>

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
            <div className="text-sm text-gray-500 mb-3">
                {transactions.length} {transactions.length === 1 ? 'item' : 'itens'}
            </div>

            {/* Cards */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1">
                {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400">
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
                    </div>
                ) : (
                    transactions.map((transaction) => (
                        <TransactionCard key={transaction.id} transaction={transaction} />
                    ))
                )}
            </div>
        </div>
    );
}
