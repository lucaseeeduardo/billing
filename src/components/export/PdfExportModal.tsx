'use client';

import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { PdfDocument } from './PdfDocument';
import { PdfExportConfig, PdfExportType, PdfOrientation } from '@/types';

interface PdfExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PdfExportModal({ isOpen, onClose }: PdfExportModalProps) {
    const transactions = useTransactionStore((state) => state.transactions);
    const categories = useCategoryStore((state) => state.getActiveCategories());
    const totals = useTransactionStore((state) => state.getCategoryTotals());

    const [config, setConfig] = useState<PdfExportConfig>({
        type: 'resumo',
        orientation: 'portrait',
        dateStart: null,
        dateEnd: null,
        categoryIds: null,
        includeLogo: false,
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const categorizedCount = transactions.filter((t) => t.categoryId !== null).length;

    const handleExport = async () => {
        if (categorizedCount === 0) {
            alert('Nenhuma transação classificada para exportar.');
            return;
        }

        setIsGenerating(true);

        try {
            const exportConfig: PdfExportConfig = {
                ...config,
                categoryIds: selectedCategories.length > 0 ? selectedCategories : null,
            };

            const blob = await pdf(
                <PdfDocument
                    transactions={transactions}
                    categories={categories}
                    config={exportConfig}
                    totals={totals}
                />
            ).toBlob();

            // Download the PDF
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const date = new Date().toISOString().split('T')[0];
            link.href = url;
            link.download = `relatorio_${date}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            onClose();
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Erro ao gerar o PDF. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleCategory = (id: string) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                            <span className="text-xl">📄</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Exportar PDF</h2>
                            <p className="text-sm text-gray-500">{categorizedCount} transações classificadas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Export Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Relatório
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'resumo', label: '📊 Resumo', desc: 'Visão geral' },
                                { value: 'completo', label: '📋 Completo', desc: 'Tudo' },
                                { value: 'por_categoria', label: '📂 Por Categoria', desc: 'Detalhado' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setConfig((c) => ({ ...c, type: option.value as PdfExportType }))}
                                    className={`p-3 rounded-xl border-2 transition-all text-left
                              ${config.type === option.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="font-medium text-gray-900">{option.label}</div>
                                    <div className="text-xs text-gray-500">{option.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orientation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orientação
                        </label>
                        <div className="flex gap-2">
                            {[
                                { value: 'portrait', label: '📱 Retrato' },
                                { value: 'landscape', label: '🖥️ Paisagem' },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setConfig((c) => ({ ...c, orientation: option.value as PdfOrientation }))}
                                    className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-medium transition-all
                              ${config.orientation === option.value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Período (opcional)
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="date"
                                value={config.dateStart || ''}
                                onChange={(e) => setConfig((c) => ({ ...c, dateStart: e.target.value || null }))}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="self-center text-gray-400">até</span>
                            <input
                                type="date"
                                value={config.dateEnd || ''}
                                onChange={(e) => setConfig((c) => ({ ...c, dateEnd: e.target.value || null }))}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filtrar por Categorias (opcional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                              ${selectedCategories.includes(cat.id)
                                            ? 'text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    style={
                                        selectedCategories.includes(cat.id)
                                            ? { backgroundColor: cat.cor }
                                            : undefined
                                    }
                                >
                                    {cat.icone} {cat.nome}
                                </button>
                            ))}
                        </div>
                        {selectedCategories.length === 0 && (
                            <p className="text-xs text-gray-400 mt-1">Nenhuma selecionada = todas</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl
                       text-gray-600 font-medium hover:bg-gray-100 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isGenerating || categorizedCount === 0}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all
                        flex items-center justify-center gap-2
                        ${isGenerating || categorizedCount === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Gerando...
                            </>
                        ) : (
                            <>📥 Baixar PDF</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
