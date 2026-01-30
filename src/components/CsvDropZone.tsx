'use client';

import React from 'react';
import { useDropZone, DropZoneStatus } from '@/hooks/useDropZone';

interface CsvDropZoneProps {
    onFileSelect: (file: File) => void;
    status?: DropZoneStatus;
    fileName?: string;
    onClear?: () => void;
    disabled?: boolean;
}

const STATUS_CONFIG = {
    idle: {
        borderColor: 'border-gray-300',
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-400',
        textColor: 'text-gray-600',
    },
    hover: {
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-600',
    },
    processing: {
        borderColor: 'border-yellow-500',
        bgColor: 'bg-yellow-50',
        iconColor: 'text-yellow-500',
        textColor: 'text-yellow-700',
    },
    success: {
        borderColor: 'border-green-500',
        bgColor: 'bg-green-50',
        iconColor: 'text-green-500',
        textColor: 'text-green-700',
    },
    error: {
        borderColor: 'border-red-500',
        bgColor: 'bg-red-50',
        iconColor: 'text-red-500',
        textColor: 'text-red-700',
    },
};

export function CsvDropZone({
    onFileSelect,
    status: externalStatus,
    fileName,
    onClear,
    disabled = false,
}: CsvDropZoneProps) {
    const {
        status: internalStatus,
        error,
        file,
        getRootProps,
        getInputProps,
        setStatus,
        clearFile,
    } = useDropZone({
        accept: ['.csv'],
        maxSize: 5 * 1024 * 1024,
        onFileDrop: onFileSelect,
    });

    const status = externalStatus || internalStatus;
    const displayFileName = fileName || file?.name;
    const config = STATUS_CONFIG[status];

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        clearFile();
        onClear?.();
        setStatus('idle');
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
          relative flex flex-col items-center justify-center
          w-full min-h-[200px] p-8
          border-2 border-dashed rounded-2xl
          transition-all duration-300 ease-out
          cursor-pointer
          ${config.borderColor} ${config.bgColor}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
          ${status === 'hover' ? 'scale-[1.02] shadow-xl' : ''}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
            >
                <input {...getInputProps()} disabled={disabled} />

                {/* Processing Spinner */}
                {status === 'processing' && (
                    <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16 mb-4">
                            <div className="absolute inset-0 border-4 border-yellow-200 rounded-full" />
                            <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin" />
                        </div>
                        <p className={`text-lg font-medium ${config.textColor}`}>
                            Processando...
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Analisando arquivo CSV
                        </p>
                    </div>
                )}

                {/* Success State */}
                {status === 'success' && displayFileName && (
                    <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center`}>
                            <svg
                                className="w-8 h-8 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className={`text-lg font-medium ${config.textColor}`}>
                            Arquivo carregado!
                        </p>
                        <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                                {displayFileName}
                            </span>
                            <button
                                onClick={handleClear}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                title="Remover arquivo"
                            >
                                <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center`}>
                            <svg
                                className="w-8 h-8 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className={`text-lg font-medium ${config.textColor}`}>
                            Erro no upload
                        </p>
                        <p className="text-sm text-red-600 mt-1 text-center max-w-xs">
                            {error || 'Ocorreu um erro ao processar o arquivo'}
                        </p>
                        <button
                            onClick={handleClear}
                            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                            Tentar novamente
                        </button>
                    </div>
                )}

                {/* Idle / Hover State */}
                {(status === 'idle' || status === 'hover') && (
                    <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 mb-4 rounded-full ${status === 'hover' ? 'bg-blue-100' : 'bg-gray-100'} flex items-center justify-center transition-colors`}>
                            <svg
                                className={`w-8 h-8 ${config.iconColor} transition-colors`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <p className={`text-lg font-medium ${config.textColor}`}>
                            {status === 'hover' ? 'Solte o arquivo aqui' : 'Arraste seu arquivo CSV'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            ou <span className="text-blue-500 font-medium">clique para selecionar</span>
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Apenas .csv
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                                Máx. 5MB
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
