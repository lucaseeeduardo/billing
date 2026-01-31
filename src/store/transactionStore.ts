import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, LEGACY_CATEGORY_MAP, LegacyCategory } from '@/types';

interface TransactionState {
    transactions: Transaction[];
    filterText: string;
    globalDateStart: string | null;
    globalDateEnd: string | null;
    migrationDone: boolean;

    // Actions
    addTransactions: (transactions: Transaction[]) => void;
    categorizeTransaction: (id: string, categoryId: string) => void;
    categorizeMultiple: (ids: string[], categoryId: string) => void;
    uncategorizeTransaction: (id: string) => void;
    setTransactions: (transactions: Transaction[]) => void;
    setFilterText: (text: string) => void;
    setGlobalDateFilter: (start: string | null, end: string | null) => void;
    clearTransactions: () => void;
    clearAllData: () => void;
    removeTransactionsByImportId: (importId: string) => void;
    addTag: (transactionId: string, tag: string) => void;
    removeTag: (transactionId: string, tag: string) => void;

    // Selectors
    getUncategorized: () => Transaction[];
    getByCategoryId: (categoryId: string) => Transaction[];
    getCategoryTotals: () => Record<string, number>;
    getAllTags: () => string[];
    getFilteredTransactions: () => Transaction[];
}

export const useTransactionStore = create<TransactionState>()(
    persist(
        (set, get) => ({
            transactions: [],
            filterText: '',
            globalDateStart: null,
            globalDateEnd: null,
            migrationDone: false,

            addTransactions: (newTransactions) =>
                set((state) => ({
                    transactions: [...state.transactions, ...newTransactions],
                })),

            categorizeTransaction: (id, categoryId) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, categoryId } : t
                    ),
                })),

            categorizeMultiple: (ids, categoryId) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        ids.includes(t.id) ? { ...t, categoryId } : t
                    ),
                })),

            uncategorizeTransaction: (id) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, categoryId: null } : t
                    ),
                })),

            setTransactions: (transactions) => set({ transactions }),

            setFilterText: (text) => set({ filterText: text }),

            setGlobalDateFilter: (start, end) => set({ globalDateStart: start, globalDateEnd: end }),

            clearTransactions: () => set({ transactions: [], filterText: '' }),

            clearAllData: () => {
                localStorage.removeItem('billing-transactions');
                set({ transactions: [], filterText: '', globalDateStart: null, globalDateEnd: null });
            },

            removeTransactionsByImportId: (importId) =>
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.importId !== importId),
                })),

            addTag: (transactionId, tag) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === transactionId
                            ? { ...t, tags: [...(t.tags || []), tag] }
                            : t
                    ),
                })),

            removeTag: (transactionId, tag) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === transactionId
                            ? { ...t, tags: (t.tags || []).filter((tg) => tg !== tag) }
                            : t
                    ),
                })),

            getUncategorized: () => {
                const { transactions, filterText, globalDateStart, globalDateEnd } = get();
                return transactions
                    .filter((t) => t.categoryId === null)
                    .filter((t) => {
                        // Date Filter
                        if (globalDateStart && t.date < globalDateStart) return false;
                        if (globalDateEnd && t.date > globalDateEnd) return false;
                        // Text Filter
                        return filterText === '' ||
                            t.title.toLowerCase().includes(filterText.toLowerCase());
                    });
            },

            getByCategoryId: (categoryId) => {
                const { transactions, globalDateStart, globalDateEnd } = get();
                return transactions
                    .filter((t) => t.categoryId === categoryId)
                    .filter((t) => {
                        if (globalDateStart && t.date < globalDateStart) return false;
                        if (globalDateEnd && t.date > globalDateEnd) return false;
                        return true;
                    });
            },

            getCategoryTotals: () => {
                const { transactions, globalDateStart, globalDateEnd } = get();
                const totals: Record<string, number> = {};

                transactions.forEach((t) => {
                    if (t.categoryId) {
                        // Apply date filter for totals too
                        if (globalDateStart && t.date < globalDateStart) return;
                        if (globalDateEnd && t.date > globalDateEnd) return;

                        totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount;
                    }
                });

                return totals;
            },

            getAllTags: () => {
                const { transactions } = get();
                const tagSet = new Set<string>();
                transactions.forEach((t) => {
                    (t.tags || []).forEach((tag) => tagSet.add(tag));
                });
                return Array.from(tagSet).sort();
            },

            getFilteredTransactions: () => {
                const { transactions, filterText } = get();
                if (!filterText) return transactions;
                return transactions.filter((t) =>
                    t.title.toLowerCase().includes(filterText.toLowerCase())
                );
            },
        }),
        {
            name: 'billing-transactions',
            version: 3, // Increment version for new fields
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as { transactions?: Transaction[]; migrationDone?: boolean };

                // Migration to V2 logic (kept)
                /* ... V2 logic implied ... */

                // Just ensuring strict typing here to avoid errors, typically standard persist handles merging new fields with defaults
                // but explicit migration is safer if we change structure depth.
                // Since we just added root fields globalDateStart/End, standard merge usually works if we dont touch transactions structure.
                // But let's keep the existing migration logic safe.

                if (version < 2 && state.transactions) {
                    // Migrate from old category (string) to categoryId
                    const migratedTransactions = state.transactions.map((t: Transaction & { category?: LegacyCategory | null }) => {
                        if ('category' in t && t.category !== undefined) {
                            const legacyCat = t.category as LegacyCategory | null;
                            const categoryId = legacyCat ? LEGACY_CATEGORY_MAP[legacyCat] : null;
                            const { category, ...rest } = t as Transaction & { category?: LegacyCategory };
                            return { ...rest, categoryId, tags: [] };
                        }
                        return { ...t, tags: t.tags || [] };
                    });

                    return {
                        ...state,
                        transactions: migratedTransactions,
                        migrationDone: true,
                        globalDateStart: null,
                        globalDateEnd: null
                    };
                }

                // V2 -> V3: Add global date fields
                if (version < 3) {
                    return {
                        ...state,
                        globalDateStart: null,
                        globalDateEnd: null
                    };
                }

                return state;
            },
            partialize: (state) => ({
                transactions: state.transactions,
                migrationDone: state.migrationDone,
                globalDateStart: state.globalDateStart,
                globalDateEnd: state.globalDateEnd,
            }),
        }
    )
);
