import React from 'react';
import { UseCsvFiltersResult } from '@/hooks/useCsvFilters';
import { DateRangeFilter } from './filters/DateRangeFilter';
import { DescriptionFilter } from './filters/DescriptionFilter';
import { ValueRangeFilter } from './filters/ValueRangeFilter';
import { ActiveFilterChips } from './filters/ActiveFilterChips';

interface CsvFiltersPanelProps {
    filterState: UseCsvFiltersResult;
}

export function CsvFiltersPanel({ filterState }: CsvFiltersPanelProps) {
    const {
        filters,
        setDateRange,
        setDescription,
        setValueRange,
        clearFilter,
        clearAllFilters,
        activeFilterCount,
        filteredTotal,
        filteredCount
    } = filterState;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6 animate-fade-in-down">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Filtrar Transações</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{filteredCount}</span> itens encontrados
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="text-sm text-gray-500">
                        Total: <span className="font-medium text-gray-900">R$ {filteredTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {activeFilterCount > 0 && (
                        <span className="ml-2 text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {activeFilterCount} ativos
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <DateRangeFilter
                    from={filters.date.from}
                    to={filters.date.to}
                    onChange={setDateRange}
                />
                <DescriptionFilter
                    value={filters.description.value}
                    mode={filters.description.matchMode}
                    onChange={setDescription}
                />
                <ValueRangeFilter
                    min={filters.value.min}
                    max={filters.value.max}
                    onChange={setValueRange}
                />
            </div>

            <ActiveFilterChips
                filters={filters}
                onClear={clearFilter}
                onClearAll={clearAllFilters}
            />
        </div>
    );
}
