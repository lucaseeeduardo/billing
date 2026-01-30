'use client';

import React, { useState, useMemo } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';

interface PeriodComparatorProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PeriodComparator({ isOpen, onClose }: PeriodComparatorProps) {
    const transactions = useTransactionStore((state) => state.transactions);
    const categories = useCategoryStore((state) => state.getActiveCategories());

    // Default to current and previous month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonth = now.getMonth() === 0
        ? `${now.getFullYear() - 1}-12`
        : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

    const [periodA, setPeriodA] = useState(currentMonth);
    const [periodB, setPeriodB] = useState(prevMonth);

    // Get available months from transactions
    const availableMonths = useMemo(() => {
        const months = new Set<string>();
        transactions.forEach((t) => {
            const parts = t.date.split('-');
            if (parts.length >= 2) {
                months.add(`${parts[0]}-${parts[1]}`);
            }
        });
        return Array.from(months).sort().reverse();
    }, [transactions]);

    // Calculate metrics for a period
    const getMetrics = (period: string) => {
        const filtered = transactions.filter((t) => t.date.startsWith(period) && t.categoryId);
        const total = filtered.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const count = filtered.length;
        const avg = count > 0 ? total / count : 0;

        const byCategory: Record<string, number> = {};
        categories.forEach((cat) => {
            byCategory[cat.id] = filtered
                .filter((t) => t.categoryId === cat.id)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        });

        return { total, count, avg, byCategory };
    };

    const metricsA = useMemo(() => getMetrics(periodA), [periodA, transactions, categories]);
    const metricsB = useMemo(() => getMetrics(periodB), [periodB, transactions, categories]);

    const calcDelta = (a: number, b: number) => {
        if (b === 0) return a > 0 ? 100 : 0;
        return ((a - b) / b) * 100;
    };

    const formatCurrency = (value: number) => {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };

    const formatMonth = (period: string) => {
        const [year, month] = period.split('-');
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${months[parseInt(month) - 1]}/${year}`;
    };

    const DeltaIndicator = ({ value }: { value: number }) => {
        const isPositive = value > 0;
        const isZero = Math.abs(value) < 0.01;

        if (isZero) {
            return <span className="text-gray-400">—</span>;
        }

        return (
            <span className={`font-medium ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
            </span>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-xl">📊</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Comparativo de Períodos</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Period Selectors */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">Período A</label>
                            <select
                                value={periodA}
                                onChange={(e) => setPeriodA(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {availableMonths.map((m) => (
                                    <option key={m} value={m}>{formatMonth(m)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-5 text-gray-400 font-bold">vs</div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">Período B</label>
                            <select
                                value={periodB}
                                onChange={(e) => setPeriodB(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {availableMonths.map((m) => (
                                    <option key={m} value={m}>{formatMonth(m)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Summary Table */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumo Geral</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                                    <th className="pb-2">Métrica</th>
                                    <th className="pb-2 text-right">{formatMonth(periodA)}</th>
                                    <th className="pb-2 text-right">{formatMonth(periodB)}</th>
                                    <th className="pb-2 text-right">Variação</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 text-gray-700">Valor Total</td>
                                    <td className="py-3 text-right font-medium">{formatCurrency(metricsA.total)}</td>
                                    <td className="py-3 text-right font-medium text-gray-500">{formatCurrency(metricsB.total)}</td>
                                    <td className="py-3 text-right">
                                        <DeltaIndicator value={calcDelta(metricsA.total, metricsB.total)} />
                                    </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-3 text-gray-700">Qtd Transações</td>
                                    <td className="py-3 text-right font-medium">{metricsA.count}</td>
                                    <td className="py-3 text-right font-medium text-gray-500">{metricsB.count}</td>
                                    <td className="py-3 text-right">
                                        <DeltaIndicator value={calcDelta(metricsA.count, metricsB.count)} />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-gray-700">Média/Transação</td>
                                    <td className="py-3 text-right font-medium">{formatCurrency(metricsA.avg)}</td>
                                    <td className="py-3 text-right font-medium text-gray-500">{formatCurrency(metricsB.avg)}</td>
                                    <td className="py-3 text-right">
                                        <DeltaIndicator value={calcDelta(metricsA.avg, metricsB.avg)} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* By Category */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Por Categoria</h3>
                        <div className="space-y-2">
                            {categories.map((cat) => {
                                const valA = metricsA.byCategory[cat.id] || 0;
                                const valB = metricsB.byCategory[cat.id] || 0;
                                const delta = calcDelta(valA, valB);

                                return (
                                    <div
                                        key={cat.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{cat.icone}</span>
                                            <span className="font-medium text-gray-700">{cat.nome}</span>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <span className="font-medium">{formatCurrency(valA)}</span>
                                            <span className="text-gray-400">{formatCurrency(valB)}</span>
                                            <DeltaIndicator value={delta} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
