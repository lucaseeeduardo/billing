import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ImportacaoHistorico } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const MAX_HISTORY_SIZE = 50;

interface ImportHistoryState {
    history: ImportacaoHistorico[];

    // Actions
    addImport: (data: Omit<ImportacaoHistorico, 'id' | 'dataImportacao'>) => string;
    updateImportStatus: (id: string, status: ImportacaoHistorico['status'], erros?: string[]) => void;
    deleteImport: (id: string) => void;
    clearHistory: () => void;

    // Selectors
    getImportById: (id: string) => ImportacaoHistorico | undefined;
    getRecentImports: (limit?: number) => ImportacaoHistorico[];
    getImportsByStatus: (status: ImportacaoHistorico['status']) => ImportacaoHistorico[];
}

export const useImportHistoryStore = create<ImportHistoryState>()(
    persist(
        (set, get) => ({
            history: [],

            addImport: (data) => {
                const id = uuidv4();
                const newImport: ImportacaoHistorico = {
                    ...data,
                    id,
                    dataImportacao: new Date().toISOString(),
                };

                set((state) => ({
                    history: [newImport, ...state.history].slice(0, MAX_HISTORY_SIZE),
                }));

                return id;
            },

            updateImportStatus: (id, status, erros) =>
                set((state) => ({
                    history: state.history.map((imp) =>
                        imp.id === id ? { ...imp, status, erros } : imp
                    ),
                })),

            deleteImport: (id) =>
                set((state) => ({
                    history: state.history.filter((imp) => imp.id !== id),
                })),

            clearHistory: () => set({ history: [] }),

            getImportById: (id) => {
                return get().history.find((imp) => imp.id === id);
            },

            getRecentImports: (limit = 10) => {
                return get().history.slice(0, limit);
            },

            getImportsByStatus: (status) => {
                return get().history.filter((imp) => imp.status === status);
            },
        }),
        {
            name: 'billing-import-history',
            version: 1,
        }
    )
);
