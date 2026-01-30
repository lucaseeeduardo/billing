'use client';

import React from 'react';
import { CurrencyFormat } from '@/hooks/useCsvParser';

interface CurrencyFormatSelectorProps {
    value: CurrencyFormat;
    onChange: (format: CurrencyFormat) => void;
    disabled?: boolean;
}

const FORMATS: { id: CurrencyFormat; label: string; example: string }[] = [
    { id: 'pt-BR', label: 'Brasileiro', example: '1.234,56' },
    { id: 'en-US', label: 'Americano', example: '1,234.56' },
];

export function CurrencyFormatSelector({
    value,
    onChange,
    disabled = false,
}: CurrencyFormatSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Formato:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
                {FORMATS.map((format) => (
                    <button
                        key={format.id}
                        onClick={() => onChange(format.id)}
                        disabled={disabled}
                        className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
              ${value === format.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                        title={`Exemplo: ${format.example}`}
                    >
                        {format.label}
                        <span className="ml-1 text-xs text-gray-400">
                            ({format.example})
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
