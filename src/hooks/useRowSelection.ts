import { useState, useCallback, useMemo } from 'react';

interface UseRowSelectionResult {
    selectedIds: Set<string>;
    toggleSelection: (id: string) => void;
    toggleAll: (ids: string[]) => void;
    clearSelection: () => void;
    selectionCount: number;
    hasSelection: boolean;
}

export function useRowSelection(): UseRowSelectionResult {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const toggleAll = useCallback((ids: string[]) => {
        setSelectedIds((prev) => {
            // If all are selected, clear them. Otherwise, select all.
            // Check if all provided IDs are already in the set
            const allSelected = ids.every(id => prev.has(id));

            if (allSelected) {
                // Deselect these IDs, keep others
                const next = new Set(prev);
                ids.forEach(id => next.delete(id));
                return next;
            } else {
                // Add all IDs
                const next = new Set(prev);
                ids.forEach(id => next.add(id));
                return next;
            }
        });
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    return {
        selectedIds,
        toggleSelection,
        toggleAll,
        clearSelection,
        selectionCount: selectedIds.size,
        hasSelection: selectedIds.size > 0,
    };
}
