'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CsvDropZone } from './CsvDropZone';
import { CsvPreviewTable } from './CsvPreviewTable';
import { CurrencyFormatSelector } from './CurrencyFormatSelector';
import { useCsvParser, CurrencyFormat } from '@/hooks/useCsvParser';
import { useCsvFilters } from '@/hooks/useCsvFilters';
import { useTransactionStore } from '@/store/transactionStore';
import { useImportHistoryStore } from '@/store/importHistoryStore';
import { Transaction } from '@/types';
import { useRowSelection } from '@/hooks/useRowSelection';

type UploadStep = 'upload' | 'preview' | 'complete';

interface CsvUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    preloadedFile?: File | null; // Support for pre-loaded file (dnd)
}

export function CsvUploadModal({ isOpen, onClose, preloadedFile }: CsvUploadModalProps) {
    const [step, setStep] = useState<UploadStep>('upload');
    const [currencyFormat, setCurrencyFormat] = useState<CurrencyFormat>('pt-BR');
    const [fileName, setFileName] = useState<string>('');
    const fileRef = useRef<File | null>(null);

    const addTransactions = useTransactionStore((state) => state.addTransactions);
    const clearTransactions = useTransactionStore((state) => state.clearTransactions);
    const addImport = useImportHistoryStore((state) => state.addImport);

    const {
        status,
        rows,
        validRows,
        invalidRows,
        totalAmount,
        parseFile,
        reparseWithFormat,
        removeRow,
        reset,
        getValidRows,
    } = useCsvParser({
        onComplete: () => setStep('preview'),
        onError: () => setStep('upload'),
    });

    // Filters & Selection
    const {
        filters,
        filteredItems,
        filteredCount,
        hasActiveFilters,
        setDateRange,
        setDescription,
        setValueRange,
    } = useCsvFilters(rows);

    const {
        selectedIds,
        toggleSelection,
        toggleAll,
        clearSelection,
        selectionCount,
        hasSelection
    } = useRowSelection();

    // Reset when modal opens or preloadedFile changes
    useEffect(() => {
        if (isOpen) {
            setStep('upload');
            reset();
            setFileName('');
            fileRef.current = null;
            clearSelection();

            // Clear filters
            setDateRange(null, null);
            setDescription('');
            setValueRange(null, null);

            if (preloadedFile) {
                handleFileSelect(preloadedFile);
            }
        }
    }, [isOpen, preloadedFile, reset, clearSelection, setDateRange, setDescription, setValueRange]);

    const handleFileSelect = useCallback((file: File) => {
        fileRef.current = file;
        setFileName(file.name);
        parseFile(file, currencyFormat);
    }, [parseFile, currencyFormat]);

    const handleClear = useCallback(() => {
        reset();
        setFileName('');
        fileRef.current = null;
        setStep('upload');
        clearSelection();
    }, [reset, clearSelection]);

    const handleImport = useCallback(() => {
        // Decide which rows to import:
        // 1. If selection exists -> Only selected (must be valid)
        // 2. If no selection -> All filtered valid rows (Import All visible)

        let rowsToImport = filteredItems.filter(r => r.isValid);

        if (hasSelection) {
            rowsToImport = rowsToImport.filter(r => selectedIds.has(r.id));
        }

        if (rowsToImport.length === 0) return;

        const totalVal = rowsToImport.reduce((sum, row) => sum + row.amount, 0);

        const importId = addImport({
            nomeArquivo: fileName,
            quantidadeItens: rowsToImport.length,
            valorTotal: totalVal,
            status: invalidRows > 0 ? 'parcial' : 'sucesso',
            erros: invalidRows > 0 ? [`${invalidRows} linhas inválidas ignoradas`] : undefined,
            itensIds: rowsToImport.map(r => r.id),
        });

        const transactions: Transaction[] = rowsToImport.map((row) => ({
            id: row.id,
            date: row.date,
            title: row.title,
            amount: row.amount,
            categoryId: row.categoryId || null, // Use auto-categorized ID
            tags: row.tags || [],
            importId,
        }));

        clearTransactions();
        addTransactions(transactions);
        setStep('complete');

        // Close modal after success animation
        setTimeout(() => {
            onClose();
        }, 1500);
    }, [filteredItems, hasSelection, selectedIds, clearTransactions, addTransactions, onClose, addImport, fileName, invalidRows]);

    const handleCurrencyChange = useCallback((format: CurrencyFormat) => {
        setCurrencyFormat(format);
        reparseWithFormat(format);
    }, [reparseWithFormat]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Importar Transações</h2>
                            <p className="text-sm text-gray-500">
                                {step === 'upload' && 'Selecione um arquivo CSV'}
                                {step === 'preview' && 'Revise e filtre os dados antes de importar'}
                                {step === 'complete' && 'Importação concluída!'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {step === 'upload' && (
                            <CurrencyFormatSelector
                                value={currencyFormat}
                                onChange={setCurrencyFormat}
                            />
                        )}
                        {step === 'preview' && (
                            <CurrencyFormatSelector
                                value={currencyFormat}
                                onChange={handleCurrencyChange}
                            />
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                    {/* Step: Upload */}
                    {step === 'upload' && (
                        <div className="h-full flex items-center justify-center">
                            <CsvDropZone
                                onFileSelect={handleFileSelect}
                                status={status === 'parsing' ? 'processing' : status === 'error' ? 'error' : 'idle'}
                                fileName={fileName}
                                onClear={handleClear}
                            />
                        </div>
                    )}

                    {/* Step: Preview */}
                    {step === 'preview' && (
                        <div className="flex flex-col gap-4 h-full">
                            {/* Pre-Processing Filters */}
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Description Filter */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Descrição</label>
                                    <input
                                        type="text"
                                        placeholder="Filtrar por nome..."
                                        value={filters.description.value}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Value Filter */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Valor (Mín / Máx)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.value.min ?? ''}
                                            onChange={(e) => setValueRange(e.target.value ? Number(e.target.value) : null, filters.value.max)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.value.max ?? ''}
                                            onChange={(e) => setValueRange(filters.value.min, e.target.value ? Number(e.target.value) : null)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Date Filter (Simple inputs for now) */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Data (Início / Fim)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={filters.date.from ? filters.date.from.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setDateRange(e.target.value ? new Date(e.target.value) : null, filters.date.to)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="date"
                                            value={filters.date.to ? filters.date.to.toISOString().split('T')[0] : ''}
                                            onChange={(e) => setDateRange(filters.date.from, e.target.value ? new Date(e.target.value) : null)}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <CsvPreviewTable
                                rows={filteredItems}
                                totalAmount={totalAmount}
                                validRows={validRows}
                                invalidRows={invalidRows}
                                selectedIds={selectedIds}
                                onToggleSelection={toggleSelection}
                                onToggleAll={toggleAll}
                                onRemoveRow={removeRow}
                                maxHeight={450}
                            />
                        </div>
                    )}

                    {/* Step: Complete */}
                    {step === 'complete' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
                                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sucesso!</h3>
                            <p className="text-gray-500">
                                Transações importadas com sucesso.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'preview' && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ← Cancelar
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-500 text-right mr-2">
                                {hasSelection ? (
                                    <>
                                        <p className="font-semibold text-blue-600">{selectionCount} itens selecionados</p>
                                        <p className="text-xs">Apenas estes serão importados</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold text-gray-700">{filteredCount} itens filtrados</p>
                                        <p className="text-xs">Todos itens válidos da lista serão importados</p>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={filteredCount === 0}
                                className={`
                  px-6 py-2.5 rounded-xl font-semibold transition-all duration-200
                  ${filteredCount > 0
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }
                `}
                            >
                                {hasSelection ? 'Importar Selecionados' : 'Importar Tudo'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
