import { useState, useMemo, useCallback } from 'react';
import { ParsedRow } from './useCsvParser';

export type MatchMode = 'contains' | 'startsWith' | 'endsWith' | 'exact';

export interface CsvFilters {
    date: {
        from: Date | null;
        to: Date | null;
        quickSelect?: string;
    };
    description: {
        value: string;
        matchMode: MatchMode;
    };
    value: {
        min: number | null;
        max: number | null;
        quickSelect?: string;
    };
}

export interface UseCsvFiltersResult {
    filters: CsvFilters;
    filteredItems: ParsedRow[];
    filteredCount: number;
    filteredTotal: number;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    // Actions
    setDateRange: (from: Date | null, to: Date | null, quickSelect?: string) => void;
    setDescription: (value: string, mode?: MatchMode) => void;
    setValueRange: (min: number | null, max: number | null, quickSelect?: string) => void;
    clearFilter: (type: keyof CsvFilters) => void;
    clearAllFilters: () => void;
}

export function useCsvFilters(items: ParsedRow[]): UseCsvFiltersResult {
    const [filters, setFilters] = useState<CsvFilters>({
        date: { from: null, to: null },
        description: { value: '', matchMode: 'contains' },
        value: { min: null, max: null },
    });

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            // Filter by Date
            if (filters.date.from || filters.date.to) {
                // Assuming item.date is YYYY-MM-DD string as per dummy CSV
                // Need to parse correctly. item.date usually comes from CsvParser. 
                // CsvParser currently keeps it as string.
                // We'll simplisticly try to parse or compare string if format ensures it (ISO)
                // Let's instantiate Date objects for comparison.
                const itemDate = new Date(item.date);
                if (isNaN(itemDate.getTime())) return false; // Invalid date in row -> maybe should exclude?

                if (filters.date.from && itemDate < filters.date.from) return false;
                if (filters.date.to) {
                    // Set to end of day
                    const endOfDay = new Date(filters.date.to);
                    endOfDay.setHours(23, 59, 59, 999);
                    if (itemDate > endOfDay) return false;
                }
            }

            // Filter by Description
            if (filters.description.value) {
                const search = filters.description.value.toLowerCase();
                const text = item.title.toLowerCase();
                const mode = filters.description.matchMode;

                if (mode === 'exact' && text !== search) return false;
                if (mode === 'startsWith' && !text.startsWith(search)) return false;
                if (mode === 'endsWith' && !text.endsWith(search)) return false;
                if (mode === 'contains' && !text.includes(search)) return false;
            }

            // Filter by Value
            if (filters.value.min !== null || filters.value.max !== null) {
                const val = item.amount; // amount is number
                // Absolute comparison? Usually users mean magnitude or algebraic?
                // Depending on expense/income.
                // Requirement says "Min/Max". Usually algebraic for generic fields.
                // But for expenses (negative), "Min" might mean "More negative" or "Smaller magnitude"?
                // Let's assume algebraic for now (Standard).

                if (filters.value.min !== null && val < filters.value.min) return false;
                if (filters.value.max !== null && val > filters.value.max) return false;
            }

            return true;
        });
    }, [items, filters]);

    const filteredTotal = useMemo(() => {
        return filteredItems.reduce((acc, item) => acc + item.amount, 0);
    }, [filteredItems]);

    const hasActiveFilters = useMemo(() => {
        return (
            (filters.date.from !== null || filters.date.to !== null) ||
            (filters.description.value !== '') ||
            (filters.value.min !== null || filters.value.max !== null)
        );
    }, [filters]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.date.from !== null || filters.date.to !== null) count++;
        if (filters.description.value !== '') count++;
        if (filters.value.min !== null || filters.value.max !== null) count++;
        return count;
    }, [filters]);

    const setDateRange = useCallback((from: Date | null, to: Date | null, quickSelect?: string) => {
        setFilters((prev) => ({ ...prev, date: { from, to, quickSelect } }));
    }, []);

    const setDescription = useCallback((value: string, mode: MatchMode = 'contains') => {
        setFilters((prev) => ({ ...prev, description: { value, matchMode: mode } }));
    }, []);

    const setValueRange = useCallback((min: number | null, max: number | null, quickSelect?: string) => {
        setFilters((prev) => ({ ...prev, value: { min, max, quickSelect } }));
    }, []);

    const clearFilter = useCallback((type: keyof CsvFilters) => {
        setFilters((prev) => {
            const next = { ...prev };
            if (type === 'date') next.date = { from: null, to: null };
            if (type === 'description') next.description = { value: '', matchMode: 'contains' };
            if (type === 'value') next.value = { min: null, max: null };
            return next;
        });
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({
            date: { from: null, to: null },
            description: { value: '', matchMode: 'contains' },
            value: { min: null, max: null },
        });
    }, []);

    return {
        filters,
        filteredItems,
        filteredCount: filteredItems.length,
        filteredTotal,
        hasActiveFilters,
        activeFilterCount,
        setDateRange,
        setDescription,
        setValueRange,
        clearFilter,
        clearAllFilters,
    };
}
