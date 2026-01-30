'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CsvDropZone } from './CsvDropZone';
import { CsvPreviewTable } from './CsvPreviewTable';
import { CurrencyFormatSelector } from './CurrencyFormatSelector';
import { useCsvParser, CurrencyFormat } from '@/hooks/useCsvParser';
import { useTransactionStore } from '@/store/transactionStore';
import { useImportHistoryStore } from '@/store/importHistoryStore';
import { Transaction } from '@/types';

type UploadStep = 'upload' | 'preview' | 'complete';

interface CsvUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CsvUploadModal({ isOpen, onClose }: CsvUploadModalProps) {
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

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('upload');
            reset();
            setFileName('');
            fileRef.current = null;
        }
    }, [isOpen, reset]);

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
    }, [reset]);

    const handleImport = useCallback(() => {
        const validRowsList = getValidRows();
        const totalVal = validRowsList.reduce((sum, row) => sum + row.amount, 0);

        const importId = addImport({
            nomeArquivo: fileName,
            quantidadeItens: validRowsList.length,
            valorTotal: totalVal,
            status: invalidRows > 0 ? 'parcial' : 'sucesso',
            erros: invalidRows > 0 ? [`${invalidRows} linhas inválidas`] : undefined,
            itensIds: validRowsList.map(r => r.id),
        });

        const transactions: Transaction[] = validRowsList.map((row) => ({
            id: row.id,
            date: row.date,
            title: row.title,
            amount: row.amount,
            categoryId: null,
            tags: [],
            importId,
        }));

        clearTransactions();
        addTransactions(transactions);
        setStep('complete');

        // Close modal after success animation
        setTimeout(() => {
            onClose();
        }, 1500);
    }, [getValidRows, clearTransactions, addTransactions, onClose, addImport, fileName, invalidRows]);

    const handleCurrencyChange = useCallback((format: CurrencyFormat) => {
        setCurrencyFormat(format);
        // Re-parse with new format
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
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
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
                                {step === 'preview' && 'Revise os dados antes de importar'}
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
                <div className="flex-1 overflow-auto p-6">
                    {/* Step: Upload */}
                    {step === 'upload' && (
                        <CsvDropZone
                            onFileSelect={handleFileSelect}
                            status={status === 'parsing' ? 'processing' : status === 'error' ? 'error' : 'idle'}
                            fileName={fileName}
                            onClear={handleClear}
                        />
                    )}

                    {/* Step: Preview */}
                    {step === 'preview' && (
                        <CsvPreviewTable
                            rows={rows}
                            totalAmount={totalAmount}
                            validRows={validRows}
                            invalidRows={invalidRows}
                            onRemoveRow={removeRow}
                            maxHeight={400}
                        />
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
                                {validRows} transações foram importadas
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'preview' && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ← Voltar
                        </button>

                        <div className="flex items-center gap-3">
                            {invalidRows > 0 && (
                                <span className="text-sm text-amber-600">
                                    ⚠️ {invalidRows} itens com problemas serão ignorados
                                </span>
                            )}
                            <button
                                onClick={handleImport}
                                disabled={validRows === 0}
                                className={`
                  px-6 py-2.5 rounded-xl font-semibold transition-all duration-200
                  ${validRows > 0
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }
                `}
                            >
                                Importar {validRows} {validRows === 1 ? 'transação' : 'transações'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
