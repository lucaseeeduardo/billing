'use client';

import React, { useState } from 'react';
import { useLimitsStore } from '@/store/limitsStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useTransactionStore } from '@/store/transactionStore';
import { Categoria } from '@/types';

interface LimitsAlertPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LimitsAlertPanel({ isOpen, onClose }: LimitsAlertPanelProps) {
    const categories = useCategoryStore((state) => state.getActiveCategories());
    const totals = useTransactionStore((state) => state.getCategoryTotals());
    const limits = useLimitsStore((state) => state.limits);
    const setLimit = useLimitsStore((state) => state.setLimit);
    const removeLimit = useLimitsStore((state) => state.removeLimit);
    const checkLimit = useLimitsStore((state) => state.checkLimit);

    const [editingCat, setEditingCat] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);
    const [editPeriod, setEditPeriod] = useState<'mensal' | 'semanal' | 'diario'>('mensal');
    const [editAlertPercent, setEditAlertPercent] = useState<number>(80);

    const startEditing = (cat: Categoria) => {
        const existing = limits.find((l) => l.categoriaId === cat.id);
        if (existing) {
            setEditValue(existing.valorLimite);
            setEditPeriod(existing.periodoLimite);
            setEditAlertPercent(existing.percentualAlerta);
        } else {
            setEditValue(0);
            setEditPeriod('mensal');
            setEditAlertPercent(80);
        }
        setEditingCat(cat.id);
    };

    const saveLimit = () => {
        if (editingCat && editValue > 0) {
            setLimit(editingCat, {
                valorLimite: editValue,
                periodoLimite: editPeriod,
                percentualAlerta: editAlertPercent,
                notificar: true,
            });
        }
        setEditingCat(null);
    };

    const formatCurrency = (value: number) => {
        return `R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Limites e Alertas</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {categories.map((cat) => {
                        const currentValue = Math.abs(totals[cat.id] || 0);
                        const limitStatus = checkLimit(cat.id, currentValue);
                        const existingLimit = limits.find((l) => l.categoriaId === cat.id);

                        return (
                            <div
                                key={cat.id}
                                className="p-4 rounded-xl border border-gray-200 bg-white"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{cat.icone}</span>
                                        <span className="font-semibold text-gray-900">{cat.nome}</span>
                                    </div>
                                    {editingCat !== cat.id && (
                                        <button
                                            onClick={() => startEditing(cat)}
                                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            {existingLimit ? 'Editar' : '+ Limite'}
                                        </button>
                                    )}
                                </div>

                                {editingCat === cat.id ? (
                                    <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Limite</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                                <input
                                                    type="number"
                                                    value={editValue || ''}
                                                    onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">Período</label>
                                                <select
                                                    value={editPeriod}
                                                    onChange={(e) => setEditPeriod(e.target.value as 'mensal' | 'semanal' | 'diario')}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                                                >
                                                    <option value="mensal">Mensal</option>
                                                    <option value="semanal">Semanal</option>
                                                    <option value="diario">Diário</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-500 mb-1 block">Alertar em</label>
                                                <select
                                                    value={editAlertPercent}
                                                    onChange={(e) => setEditAlertPercent(parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                                                >
                                                    <option value={50}>50%</option>
                                                    <option value={70}>70%</option>
                                                    <option value={80}>80%</option>
                                                    <option value={90}>90%</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={saveLimit}
                                                className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg"
                                            >
                                                Salvar
                                            </button>
                                            {existingLimit && (
                                                <button
                                                    onClick={() => {
                                                        removeLimit(cat.id);
                                                        setEditingCat(null);
                                                    }}
                                                    className="px-3 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-lg"
                                                >
                                                    Remover
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setEditingCat(null)}
                                                className="px-3 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : existingLimit ? (
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-500">
                                                Limite {existingLimit.periodoLimite}:
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(existingLimit.valorLimite)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-500">Gasto atual:</span>
                                            <span className={`font-medium ${limitStatus?.status === 'exceeded'
                                                ? 'text-red-600'
                                                : limitStatus?.status === 'warning'
                                                    ? 'text-amber-600'
                                                    : 'text-green-600'
                                                }`}>
                                                {formatCurrency(currentValue)} ({limitStatus?.percentage.toFixed(0)}%)
                                            </span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${limitStatus?.status === 'exceeded'
                                                    ? 'bg-red-500'
                                                    : limitStatus?.status === 'warning'
                                                        ? 'bg-amber-500'
                                                        : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${Math.min(limitStatus?.percentage || 0, 100)}%` }}
                                            />
                                        </div>
                                        {limitStatus?.status === 'exceeded' && (
                                            <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg flex items-center gap-1">
                                                🔴 LIMITE EXCEDIDO
                                            </div>
                                        )}
                                        {limitStatus?.status === 'warning' && (
                                            <div className="mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg flex items-center gap-1">
                                                ⚠️ Próximo do limite
                                            </div>
                                        )}
                                        {limitStatus?.status === 'ok' && (
                                            <div className="mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg flex items-center gap-1">
                                                ✅ Dentro do limite
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400">
                                        Gasto atual: {formatCurrency(currentValue)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
