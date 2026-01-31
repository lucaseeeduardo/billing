import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Categoria, DEFAULT_CATEGORIES } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface CategoryState {
    categories: Categoria[];

    // Actions
    addCategory: (category: Omit<Categoria, 'id' | 'createdAt'>) => Categoria;
    updateCategory: (id: string, updates: Partial<Categoria>) => void;
    deleteCategory: (id: string) => boolean;
    toggleActive: (id: string) => void;
    reorderCategories: (categories: Categoria[]) => void;
    resetToDefaults: () => void;

    // Selectors
    getActiveCategories: () => Categoria[];
    getCategoryById: (id: string) => Categoria | undefined;
    getCategoryByName: (name: string) => Categoria | undefined;
    getDefaultCategory: () => Categoria;
}

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set, get) => ({
            categories: DEFAULT_CATEGORIES,

            addCategory: (categoryData) => {
                const newCategory: Categoria = {
                    ...categoryData,
                    id: uuidv4(),
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    categories: [...state.categories, newCategory],
                }));

                return newCategory;
            },

            updateCategory: (id, updates) =>
                set((state) => ({
                    categories: state.categories.map((cat) =>
                        cat.id === id ? { ...cat, ...updates } : cat
                    ),
                })),

            deleteCategory: (id) => {
                const category = get().getCategoryById(id);

                // Cannot delete default category
                if (category?.isDefault) {
                    return false;
                }

                set((state) => ({
                    categories: state.categories.filter((cat) => cat.id !== id),
                }));

                return true;
            },

            toggleActive: (id) =>
                set((state) => ({
                    categories: state.categories.map((cat) =>
                        cat.id === id ? { ...cat, ativo: !cat.ativo } : cat
                    ),
                })),

            reorderCategories: (categories) =>
                set({ categories }),

            resetToDefaults: () => set({ categories: DEFAULT_CATEGORIES }),

            getActiveCategories: () => {
                return get().categories.filter((cat) => cat.ativo);
            },

            getCategoryById: (id) => {
                return get().categories.find((cat) => cat.id === id);
            },

            getCategoryByName: (name) => {
                return get().categories.find(
                    (cat) => cat.nome.toLowerCase() === name.toLowerCase()
                );
            },

            getDefaultCategory: () => {
                const defaultCat = get().categories.find((cat) => cat.isDefault);
                return defaultCat || get().categories[get().categories.length - 1];
            },
        }),
        {
            name: 'billing-categories',
            version: 1,
        }
    )
);
