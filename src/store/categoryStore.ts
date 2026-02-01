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
    restoreCategory: (category: Categoria) => void;
    importCategories: (categories: Categoria[]) => void;
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

            restoreCategory: (category) => {
                const existing = get().categories.find((c) => c.id === category.id);
                if (!existing) {
                    set((state) => ({
                        categories: [...state.categories, category],
                    }));
                }
            },

            importCategories: (newCategories) => {
                set((state) => {
                    const currentIds = new Set(state.categories.map((c) => c.id));
                    const toAdd = newCategories.filter((c) => !currentIds.has(c.id));

                    // Optional: Update existing ones? For now, we only ensure existence as per "create if exists" logic.
                    // If we want to sync perfectly, we might want to upsert.
                    // Let's doing UPSERT (Update existing, Add new) to ensure backup properties take precedence.

                    const merged = [...state.categories];
                    newCategories.forEach(newCat => {
                        const index = merged.findIndex(c => c.id === newCat.id);
                        if (index !== -1) {
                            merged[index] = newCat;
                        } else {
                            merged.push(newCat);
                        }
                    });

                    return { categories: merged };
                });
            },
        }),
        {
            name: 'billing-categories',
            version: 1,
        }
    )
);
