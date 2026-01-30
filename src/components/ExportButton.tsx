'use client';

import React, { useState } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { PdfExportModal } from './export/PdfExportModal';

type ExportFormat = 'json' | 'csv' | 'pdf';

export function ExportButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPdfOpen, setIsPdfOpen] = useState(false);
    const transactions = useTransactionStore((state) => state.transactions);
    const getCategoryById = useCategoryStore((state) => state.getCategoryById);

    const exportData = (format: ExportFormat) => {
        const categorized = transactions.filter((t) => t.categoryId !== null);

        if (categorized.length === 0) {
            alert('Nenhuma transação classificada para exportar');
            return;
        }

        let content: string;
        let filename: string;
        let mimeType: string;

        if (format === 'json') {
            // Add category names to export
            const exportTransactions = categorized.map((t) => {
                const cat = t.categoryId ? getCategoryById(t.categoryId) : null;
                return {
                    ...t,
                    categoryName: cat?.nome || null,
                };
            });
            content = JSON.stringify(exportTransactions, null, 2);
            filename = 'transacoes-classificadas.json';
            mimeType = 'application/json';
        } else {
            const header = 'id,date,title,amount,categoryId,categoryName,tags\n';
            const rows = categorized
                .map((t) => {
                    const cat = t.categoryId ? getCategoryById(t.categoryId) : null;
                    const tagsStr = (t.tags || []).join(';');
                    return `"${t.id}","${t.date}","${t.title}",${t.amount},"${t.categoryId}","${cat?.nome || ''}","${tagsStr}"`;
                })
                .join('\n');
            content = header + rows;
            filename = 'transacoes-classificadas.csv';
            mimeType = 'text/csv';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 
                   text-white font-medium rounded-xl shadow-lg shadow-green-500/25
                   hover:from-green-600 hover:to-emerald-700 transition-all duration-200
                   hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
                Exportar
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                        <button
                            onClick={() => exportData('json')}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                            <span className="text-xl">📄</span>
                            <span className="font-medium text-gray-700">Exportar JSON</span>
                        </button>
                        <button
                            onClick={() => exportData('csv')}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-100"
                        >
                            <span className="text-xl">📊</span>
                            <span className="font-medium text-gray-700">Exportar CSV</span>
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setIsPdfOpen(true);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-100"
                        >
                            <span className="text-xl">📄</span>
                            <span className="font-medium text-gray-700">Relatório PDF</span>
                        </button>
                    </div>
                </>
            )}

            <PdfExportModal
                isOpen={isPdfOpen}
                onClose={() => setIsPdfOpen(false)}
            />
        </div>
    );
}
