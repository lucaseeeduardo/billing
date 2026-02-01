import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AutoCategoryRule } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AutoCategoryState {
    rules: AutoCategoryRule[];

    // Actions
    addRule: (term: string, categoryId: string) => void;
    removeRule: (id: string) => void;
    toggleRule: (id: string) => void;
    updateRule: (id: string, updates: Partial<AutoCategoryRule>) => void;
    setRules: (rules: AutoCategoryRule[]) => void;
    clearRules: () => void;

    // Helpers
    getMatchingCategory: (title: string) => string | null;
}

export const useAutoCategoryStore = create<AutoCategoryState>()(
    persist(
        (set, get) => ({
            rules: [],

            addRule: (term, categoryId) =>
                set((state) => ({
                    rules: [
                        ...state.rules,
                        {
                            id: uuidv4(),
                            term,
                            categoryId,
                            active: true,
                        },
                    ],
                })),

            removeRule: (id) =>
                set((state) => ({
                    rules: state.rules.filter((r) => r.id !== id),
                })),

            toggleRule: (id) =>
                set((state) => ({
                    rules: state.rules.map((r) =>
                        r.id === id ? { ...r, active: !r.active } : r
                    ),
                })),

            updateRule: (id, updates) =>
                set((state) => ({
                    rules: state.rules.map((r) =>
                        r.id === id ? { ...r, ...updates } : r
                    ),
                })),

            setRules: (rules) => set({ rules }),

            clearRules: () => set({ rules: [] }),

            getMatchingCategory: (title) => {
                const { rules } = get();
                const titleLower = title.toLowerCase();

                // Find first matching active rule
                const match = rules.find(
                    (rule) =>
                        rule.active &&
                        titleLower.includes(rule.term.toLowerCase())
                );

                return match ? match.categoryId : null;
            },
        }),
        {
            name: 'billing-auto-categories',
            version: 1,
        }
    )
);
