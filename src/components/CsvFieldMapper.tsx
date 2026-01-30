'use client';

import React, { useState, useEffect, useCallback } from 'react';

export type FieldType = 'date' | 'description' | 'amount' | 'ignore';

interface ColumnMapping {
    columnIndex: number;
    fieldType: FieldType;
    headerName: string;
}

interface CsvFieldMapperProps {
    headers: string[];
    sampleData: string[][];
    onMappingChange: (mapping: ColumnMapping[]) => void;
    onMappingComplete: () => void;
}

const FIELD_OPTIONS: { value: FieldType; label: string; required: boolean }[] = [
    { value: 'date', label: 'Data', required: true },
    { value: 'description', label: 'Descrição', required: true },
    { value: 'amount', label: 'Valor', required: true },
    { value: 'ignore', label: 'Ignorar', required: false },
];

// Common header patterns for auto-detection
const FIELD_PATTERNS: Record<Exclude<FieldType, 'ignore'>, RegExp[]> = {
    date: [/^date$/i, /^data$/i, /^dt$/i, /^fecha$/i, /^created/i],
    description: [/^desc/i, /^title$/i, /^titulo$/i, /^name$/i, /^nome$/i, /^texto$/i, /^memo$/i],
    amount: [/^amount$/i, /^valor$/i, /^value$/i, /^price$/i, /^preco$/i, /^total$/i, /^v$/i],
};

const STORAGE_KEY = 'csv-field-mapping-preferences';

export function CsvFieldMapper({
    headers,
    sampleData,
    onMappingChange,
    onMappingComplete,
}: CsvFieldMapperProps) {
    const [mapping, setMapping] = useState<ColumnMapping[]>([]);

    // Auto-detect field types based on header names
    const autoDetectFieldType = useCallback((header: string): FieldType => {
        const headerLower = header.toLowerCase().trim();

        for (const [fieldType, patterns] of Object.entries(FIELD_PATTERNS)) {
            for (const pattern of patterns) {
                if (pattern.test(headerLower)) {
                    return fieldType as FieldType;
                }
            }
        }

        return 'ignore';
    }, []);

    // Load preferences from localStorage
    const loadPreferences = useCallback((): Record<string, FieldType> | null => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    }, []);

    // Save preferences to localStorage
    const savePreferences = useCallback((mapping: ColumnMapping[]) => {
        try {
            const prefs: Record<string, FieldType> = {};
            mapping.forEach((m) => {
                if (m.headerName && m.fieldType !== 'ignore') {
                    prefs[m.headerName.toLowerCase()] = m.fieldType;
                }
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    // Initialize mapping
    useEffect(() => {
        const savedPrefs = loadPreferences();

        const initialMapping: ColumnMapping[] = headers.map((header, index) => {
            let fieldType: FieldType = 'ignore';

            // Try saved preferences first
            if (savedPrefs && savedPrefs[header.toLowerCase()]) {
                fieldType = savedPrefs[header.toLowerCase()];
            } else {
                // Fall back to auto-detection
                fieldType = autoDetectFieldType(header);
            }

            return {
                columnIndex: index,
                fieldType,
                headerName: header,
            };
        });

        // If no headers, assume positional (date, description, amount)
        if (headers.every((h) => !h || h.trim() === '')) {
            if (initialMapping.length >= 3) {
                initialMapping[0].fieldType = 'date';
                initialMapping[1].fieldType = 'description';
                initialMapping[2].fieldType = 'amount';
            }
        }

        setMapping(initialMapping);
        onMappingChange(initialMapping);
    }, [headers, autoDetectFieldType, loadPreferences, onMappingChange]);

    const handleFieldChange = (columnIndex: number, fieldType: FieldType) => {
        const newMapping: ColumnMapping[] = mapping.map((m): ColumnMapping => {
            if (m.columnIndex === columnIndex) {
                return { ...m, fieldType };
            }
            // Remove duplicate assignments (except ignore)
            if (m.fieldType === fieldType && fieldType !== 'ignore') {
                return { ...m, fieldType: 'ignore' as FieldType };
            }
            return m;
        });

        setMapping(newMapping);
        onMappingChange(newMapping);
    };

    const handleConfirm = () => {
        savePreferences(mapping);
        onMappingComplete();
    };

    const requiredFields: FieldType[] = ['date', 'description', 'amount'];
    const mappedFields = mapping.filter((m) => m.fieldType !== 'ignore').map((m) => m.fieldType);
    const missingFields = requiredFields.filter((f) => !mappedFields.includes(f));
    const isComplete = missingFields.length === 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Mapeamento de Campos</h3>
                {!isComplete && (
                    <span className="text-sm text-amber-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Campos obrigatórios: {missingFields.join(', ')}
                    </span>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map((header, i) => (
                                <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase min-w-[150px]">
                                    {header || `Coluna ${i + 1}`}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Field selector row */}
                        <tr className="bg-blue-50">
                            {mapping.map((col) => (
                                <td key={col.columnIndex} className="px-4 py-2">
                                    <select
                                        value={col.fieldType}
                                        onChange={(e) => handleFieldChange(col.columnIndex, e.target.value as FieldType)}
                                        className={`
                      w-full px-3 py-2 text-sm rounded-lg border transition-colors
                      ${col.fieldType === 'ignore'
                                                ? 'border-gray-200 bg-gray-50 text-gray-500'
                                                : 'border-blue-300 bg-white text-blue-700 font-medium'
                                            }
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    `}
                                    >
                                        {FIELD_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            ))}
                        </tr>
                        {/* Sample data rows */}
                        {sampleData.slice(0, 3).map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t border-gray-100">
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className={`
                      px-4 py-2 text-sm truncate max-w-[200px]
                      ${mapping[cellIndex]?.fieldType === 'ignore' ? 'text-gray-400' : 'text-gray-700'}
                    `}
                                        title={cell}
                                    >
                                        {cell || '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleConfirm}
                    disabled={!isComplete}
                    className={`
            px-6 py-2.5 rounded-xl font-medium transition-all duration-200
            ${isComplete
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
          `}
                >
                    Confirmar Mapeamento
                </button>
            </div>
        </div>
    );
}
