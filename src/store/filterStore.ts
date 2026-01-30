import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdvancedFilterState, SavedFilter } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_FILTER: AdvancedFilterState = {
    text: '',
    textMode: 'contains',
    categoryIds: [],
    valueMin: null,
    valueMax: null,
    dateStart: null,
    dateEnd: null,
    tags: [],
};

interface FilterState {
    currentFilter: AdvancedFilterState;
    savedFilters: SavedFilter[];
    isFilterPanelOpen: boolean;

    // Actions
    setFilter: (filter: Partial<AdvancedFilterState>) => void;
    resetFilter: () => void;
    saveCurrentFilter: (name: string) => void;
    deleteSavedFilter: (id: string) => void;
    applySavedFilter: (id: string) => void;
    toggleFilterPanel: () => void;

    // Selectors
    hasActiveFilters: () => boolean;
    getActiveFilterCount: () => number;
}

export const useFilterStore = create<FilterState>()(
    persist(
        (set, get) => ({
            currentFilter: DEFAULT_FILTER,
            savedFilters: [],
            isFilterPanelOpen: false,

            setFilter: (filter) =>
                set((state) => ({
                    currentFilter: { ...state.currentFilter, ...filter },
                })),

            resetFilter: () =>
                set({ currentFilter: DEFAULT_FILTER }),

            saveCurrentFilter: (name) =>
                set((state) => ({
                    savedFilters: [
                        ...state.savedFilters,
                        {
                            id: uuidv4(),
                            name,
                            filter: state.currentFilter,
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })),

            deleteSavedFilter: (id) =>
                set((state) => ({
                    savedFilters: state.savedFilters.filter((f) => f.id !== id),
                })),

            applySavedFilter: (id) => {
                const saved = get().savedFilters.find((f) => f.id === id);
                if (saved) {
                    set({ currentFilter: saved.filter });
                }
            },

            toggleFilterPanel: () =>
                set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),

            hasActiveFilters: () => {
                const { currentFilter } = get();
                return (
                    currentFilter.text !== '' ||
                    currentFilter.categoryIds.length > 0 ||
                    currentFilter.valueMin !== null ||
                    currentFilter.valueMax !== null ||
                    currentFilter.dateStart !== null ||
                    currentFilter.dateEnd !== null ||
                    currentFilter.tags.length > 0
                );
            },

            getActiveFilterCount: () => {
                const { currentFilter } = get();
                let count = 0;
                if (currentFilter.text) count++;
                if (currentFilter.categoryIds.length > 0) count++;
                if (currentFilter.valueMin !== null || currentFilter.valueMax !== null) count++;
                if (currentFilter.dateStart !== null || currentFilter.dateEnd !== null) count++;
                if (currentFilter.tags.length > 0) count++;
                return count;
            },
        }),
        {
            name: 'billing-filters',
            version: 1,
            partialize: (state) => ({
                savedFilters: state.savedFilters,
            }),
        }
    )
);
