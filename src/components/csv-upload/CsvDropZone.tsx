'use client';

import React from 'react';
import { useDropZone, DropZoneStatus } from '@/hooks/useDropZone';

interface CsvDropZoneProps {
    onFileSelect: (file: File) => void;
    status?: DropZoneStatus;
    error?: string | null;
}

const STATUS_CONFIG = {
    idle: {
        borderColor: 'border-gray-300',
        bgColor: 'bg-white',
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
    error: externalError,
}: CsvDropZoneProps) {
    const {
        status: internalStatus,
        error: internalError,
        getRootProps,
        getInputProps,
    } = useDropZone({
        accept: ['.csv'],
        maxSize: 5 * 1024 * 1024,
        onFileDrop: onFileSelect,
    });

    const status = externalStatus || internalStatus;
    const error = externalError || internalError;
    const config = STATUS_CONFIG[status];

    return (
        <div
            {...getRootProps()}
            className={`
        relative flex flex-col items-center justify-center
        w-full h-48
        border-2 border-dashed rounded-2xl
        transition-all duration-300 ease-out
        cursor-pointer
        ${config.borderColor} ${config.bgColor}
        ${status === 'hover' ? 'scale-[1.01] shadow-lg' : 'hover:border-gray-400'}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
        >
            <input {...getInputProps()} />

            {/* Processing State */}
            {status === 'processing' && (
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
                    <p className="font-medium text-yellow-700">Processando arquivo...</p>
                </div>
            )}

            {/* Error State */}
            {status === 'error' && (
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 mb-3 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="font-medium text-red-700">Erro no upload</p>
                    <p className="text-sm text-red-500 mt-1">{error}</p>
                </div>
            )}

            {/* Idle / Hover */}
            {(status === 'idle' || status === 'hover') && (
                <div className="flex flex-col items-center transition-transform duration-200">
                    <div className={`w-12 h-12 mb-3 rounded-xl flex items-center justify-center transition-colors ${status === 'hover' ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <h3 className={`text-lg font-semibold mb-1 ${config.textColor}`}>
                        {status === 'hover' ? 'Solte para fazer upload' : 'Arraste seu CSV aqui'}
                    </h3>
                    <p className="text-sm text-gray-400">
                        ou clique para selecionar (máx 5MB)
                    </p>
                </div>
            )}
        </div>
    );
}
