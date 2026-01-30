'use client';

import { useState, useCallback, useRef } from 'react';

interface UseMultiSelectOptions {
    onSelectionChange?: (selectedIds: Set<string>) => void;
}

export function useMultiSelect<T extends { id: string }>(
    items: T[],
    options: UseMultiSelectOptions = {}
) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const lastSelectedIdRef = useRef<string | null>(null);
    const { onSelectionChange } = options;

    const updateSelection = useCallback(
        (newSelection: Set<string>) => {
            setSelectedIds(newSelection);
            onSelectionChange?.(newSelection);
        },
        [onSelectionChange]
    );

    // Check if an item is selected
    const isSelected = useCallback(
        (id: string) => selectedIds.has(id),
        [selectedIds]
    );

    // Toggle single item (simple click)
    const toggle = useCallback(
        (id: string) => {
            const newSelection = new Set(selectedIds);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            lastSelectedIdRef.current = id;
            updateSelection(newSelection);
        },
        [selectedIds, updateSelection]
    );

    // Add/remove from selection (Ctrl/Cmd + Click)
    const toggleMultiple = useCallback(
        (id: string) => {
            const newSelection = new Set(selectedIds);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            lastSelectedIdRef.current = id;
            updateSelection(newSelection);
        },
        [selectedIds, updateSelection]
    );

    // Select range (Shift + Click)
    const toggleRange = useCallback(
        (id: string, visibleItems: T[]) => {
            const lastId = lastSelectedIdRef.current;
            if (!lastId) {
                toggle(id);
                return;
            }

            const itemIds = visibleItems.map((item) => item.id);
            const lastIndex = itemIds.indexOf(lastId);
            const currentIndex = itemIds.indexOf(id);

            if (lastIndex === -1 || currentIndex === -1) {
                toggle(id);
                return;
            }

            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);

            const newSelection = new Set(selectedIds);
            for (let i = start; i <= end; i++) {
                newSelection.add(itemIds[i]);
            }

            updateSelection(newSelection);
        },
        [selectedIds, toggle, updateSelection]
    );

    // Select all items
    const selectAll = useCallback(() => {
        const allIds = new Set(items.map((item) => item.id));
        updateSelection(allIds);
    }, [items, updateSelection]);

    // Select only visible/filtered items
    const selectVisible = useCallback(
        (visibleIds: string[]) => {
            const newSelection = new Set(selectedIds);
            visibleIds.forEach((id) => newSelection.add(id));
            updateSelection(newSelection);
        },
        [selectedIds, updateSelection]
    );

    // Deselect only visible items
    const deselectVisible = useCallback(
        (visibleIds: string[]) => {
            const newSelection = new Set(selectedIds);
            visibleIds.forEach((id) => newSelection.delete(id));
            updateSelection(newSelection);
        },
        [selectedIds, updateSelection]
    );

    // Clear all selection
    const clear = useCallback(() => {
        lastSelectedIdRef.current = null;
        updateSelection(new Set());
    }, [updateSelection]);

    // Get selected items
    const selectedItems = items.filter((item) => selectedIds.has(item.id));

    // Check if all visible items are selected
    const areAllVisibleSelected = useCallback(
        (visibleIds: string[]) => {
            if (visibleIds.length === 0) return false;
            return visibleIds.every((id) => selectedIds.has(id));
        },
        [selectedIds]
    );

    // Check if some (but not all) visible items are selected
    const areSomeVisibleSelected = useCallback(
        (visibleIds: string[]) => {
            if (visibleIds.length === 0) return false;
            const selectedCount = visibleIds.filter((id) => selectedIds.has(id)).length;
            return selectedCount > 0 && selectedCount < visibleIds.length;
        },
        [selectedIds]
    );

    // Handle click with modifiers
    const handleClick = useCallback(
        (id: string, event: React.MouseEvent, visibleItems: T[]) => {
            if (event.shiftKey) {
                toggleRange(id, visibleItems);
            } else if (event.ctrlKey || event.metaKey) {
                toggleMultiple(id);
            } else {
                // Simple click - select only this item (or toggle if already selected)
                const newSelection = new Set<string>();
                if (!selectedIds.has(id)) {
                    newSelection.add(id);
                }
                lastSelectedIdRef.current = id;
                updateSelection(newSelection);
            }
        },
        [selectedIds, toggleRange, toggleMultiple, updateSelection]
    );

    // Handle checkbox click (always toggle without clearing others)
    const handleCheckboxClick = useCallback(
        (id: string, event: React.MouseEvent) => {
            event.stopPropagation();
            toggle(id);
        },
        [toggle]
    );

    return {
        selectedIds,
        selectedItems,
        selectedCount: selectedIds.size,
        isSelected,
        toggle,
        toggleMultiple,
        toggleRange,
        selectAll,
        selectVisible,
        deselectVisible,
        clear,
        areAllVisibleSelected,
        areSomeVisibleSelected,
        handleClick,
        handleCheckboxClick,
    };
}
