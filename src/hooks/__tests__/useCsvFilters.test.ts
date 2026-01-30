import { renderHook, act } from '@testing-library/react';
import { useCsvFilters } from '../useCsvFilters';
import { ParsedRow } from '../useCsvParser';

const mockRows: ParsedRow[] = [
    { id: '1', date: '2023-01-01', title: 'Supermarket', amount: -150.00, isValid: true, lineNumber: 1, rawAmount: '-150.00' },
    { id: '2', date: '2023-01-05', title: 'Gas Station', amount: -200.00, isValid: true, lineNumber: 2, rawAmount: '-200.00' },
    { id: '3', date: '2023-01-10', title: 'Salary', amount: 5000.00, isValid: true, lineNumber: 3, rawAmount: '5000.00' },
    { id: '4', date: '2023-01-15', title: 'Restaurant', amount: -80.00, isValid: true, lineNumber: 4, rawAmount: '-80.00' },
];

describe('useCsvFilters', () => {
    it('should return all items initially', () => {
        const { result } = renderHook(() => useCsvFilters(mockRows));

        expect(result.current.filteredItems).toHaveLength(4);
        expect(result.current.filteredCount).toBe(4);
        expect(result.current.hasActiveFilters).toBe(false);
    });

    it('should filter by description (contains)', () => {
        const { result } = renderHook(() => useCsvFilters(mockRows));

        act(() => {
            result.current.setDescription('market', 'contains');
        });

        expect(result.current.filteredItems).toHaveLength(1);
        expect(result.current.filteredItems[0].title).toBe('Supermarket');
        expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should filter by description (startsWith)', () => {
        const { result } = renderHook(() => useCsvFilters(mockRows));

        act(() => {
            result.current.setDescription('Gas', 'startsWith');
        });

        expect(result.current.filteredItems).toHaveLength(1);
        expect(result.current.filteredItems[0].title).toBe('Gas Station');
    });

    it('should filter by value range', () => {
        const { result } = renderHook(() => useCsvFilters(mockRows));

        act(() => {
            result.current.setValueRange(-200, -100);
        });

        // Should include -150 and -200
        expect(result.current.filteredItems).toHaveLength(2);
        const titles = result.current.filteredItems.map(r => r.title);
        expect(titles).toContain('Supermarket');
        expect(titles).toContain('Gas Station');
    });

    it('should filter by date range', () => {
        const { result } = renderHook(() => useCsvFilters(mockRows));

        act(() => {
            result.current.setDateRange(new Date('2023-01-01'), new Date('2023-01-05'));
        });

        // Should include Jan 1 and Jan 5
        expect(result.current.filteredItems).toHaveLength(2);
    });

    it('should clear individual filters', () => {
        const { result } = renderHook(() => useCsvFilters(mockRows));

        act(() => {
            result.current.setDescription('market', 'contains');
            result.current.setValueRange(-200, -100);
        });

        expect(result.current.filteredItems).toHaveLength(1); // Intersection

        act(() => {
            result.current.clearFilter('description');
        });

        expect(result.current.filters.description.value).toBe('');
        expect(result.current.filters.valueRange).not.toBeNull();
        expect(result.current.filteredItems).toHaveLength(2); // Only value filter
    });

    it('should clear all filters', () => {
        const { result } = renderHook(() => useCsvFilters(mockRows));

        act(() => {
            result.current.setDateRange(new Date('2023-01-01'), new Date('2023-01-05'));
            result.current.setDescription('market', 'contains');
        });

        expect(result.current.activeFilterCount).toBe(2);

        act(() => {
            result.current.clearAllFilters();
        });

        expect(result.current.hasActiveFilters).toBe(false);
        expect(result.current.filteredItems).toHaveLength(4);
    });
});
