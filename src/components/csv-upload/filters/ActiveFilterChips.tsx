import React from 'react';
import { CsvFilters } from '@/hooks/useCsvFilters';

interface ActiveFilterChipsProps {
    filters: CsvFilters;
    onClear: (type: keyof CsvFilters) => void;
    onClearAll: () => void;
}

export function ActiveFilterChips({ filters, onClear, onClearAll }: ActiveFilterChipsProps) {
    const formatDate = (d: Date | null) => d ? d.toLocaleDateString() : '';

    // Helper to check if any filters are active
    const hasDate = filters.date.from !== null || filters.date.to !== null;
    const hasDesc = !!filters.description.value;
    const hasValue = filters.value.min !== null || filters.value.max !== null;

    if (!hasDate && !hasDesc && !hasValue) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
                Filtros ativos:
            </span>

            {hasDate && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                    📅 {filters.date.quickSelect || `${formatDate(filters.date.from)} - ${formatDate(filters.date.to)}`}
                    <button onClick={() => onClear('date')} className="hover:text-blue-900 ml-1 font-bold">×</button>
                </span>
            )}

            {hasDesc && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                    📝 "{filters.description.value}"
                    <button onClick={() => onClear('description')} className="hover:text-blue-900 ml-1 font-bold">×</button>
                </span>
            )}

            {hasValue && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                    💰 {filters.value.quickSelect || `R$ ${filters.value.min ?? '?'} - R$ ${filters.value.max ?? '?'}`}
                    <button onClick={() => onClear('value')} className="hover:text-blue-900 ml-1 font-bold">×</button>
                </span>
            )}

            <button
                onClick={onClearAll}
                className="text-xs text-gray-500 hover:text-red-600 underline decoration-dotted ml-2"
            >
                Limpar todos
            </button>
        </div>
    );
}
