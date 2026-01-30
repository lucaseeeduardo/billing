import React from 'react';
import { CurrencyFormat } from '@/hooks/useCsvParser';

interface DropZoneCollapsedProps {
    fileName: string;
    rowCount: number;
    isValid: boolean;
    onReplace: () => void;
    onClear: () => void;
    currencyFormat: CurrencyFormat;
    onFormatChange: (format: CurrencyFormat) => void;
}

export function DropZoneCollapsed({
    fileName,
    rowCount,
    isValid,
    onReplace,
    onClear,
    currencyFormat,
    onFormatChange,
}: DropZoneCollapsedProps) {
    return (
        <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm animate-fade-in-down gap-4 sm:gap-0">
            <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isValid ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <span className="text-xl">📄</span>
                </div>
                <div className="min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{fileName}</h3>
                    <p className="text-sm text-gray-500">
                        {rowCount} {rowCount === 1 ? 'linha' : 'linhas'} encontradas
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                {/* Currency Selector */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => onFormatChange('pt-BR')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${currencyFormat === 'pt-BR'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        R$ (PT-BR)
                    </button>
                    <button
                        onClick={() => onFormatChange('en-US')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${currencyFormat === 'en-US'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        $ (EN-US)
                    </button>
                </div>

                <div className="w-px h-6 bg-gray-200 hidden sm:block" />

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                        onClick={onReplace}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Substituir
                    </button>

                    <button
                        onClick={onClear}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Limpar
                    </button>
                </div>
            </div>
        </div>
    );
}
