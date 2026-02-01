import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LimiteCategoria, Alerta } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface LimitsState {
    limits: LimiteCategoria[];
    alerts: Alerta[];

    // Actions
    setLimit: (categoryId: string, config: Omit<LimiteCategoria, 'id' | 'categoriaId'>) => void;
    removeLimit: (categoryId: string) => void;
    addAlert: (alert: Omit<Alerta, 'id' | 'dataAlerta'>) => void;
    clearAlerts: () => void;
    dismissAlert: (id: string) => void;
    setLimits: (limits: LimiteCategoria[]) => void;
    clearLimits: () => void;

    // Selectors
    getLimitByCategory: (categoryId: string) => LimiteCategoria | undefined;
    getActiveAlerts: () => Alerta[];
    checkLimit: (categoryId: string, currentValue: number) => {
        status: 'ok' | 'warning' | 'exceeded';
        percentage: number;
        limit: number;
    } | null;
}

export const useLimitsStore = create<LimitsState>()(
    persist(
        (set, get) => ({
            limits: [],
            alerts: [],

            setLimit: (categoryId, config) =>
                set((state) => {
                    const existing = state.limits.find((l) => l.categoriaId === categoryId);

                    if (existing) {
                        return {
                            limits: state.limits.map((l) =>
                                l.categoriaId === categoryId ? { ...l, ...config } : l
                            ),
                        };
                    }

                    return {
                        limits: [
                            ...state.limits,
                            { ...config, id: uuidv4(), categoriaId: categoryId },
                        ],
                    };
                }),

            removeLimit: (categoryId) =>
                set((state) => ({
                    limits: state.limits.filter((l) => l.categoriaId !== categoryId),
                })),

            setLimits: (limits) => set({ limits }),
            clearLimits: () => set({ limits: [] }),

            addAlert: (alert) =>
                set((state) => ({
                    alerts: [
                        ...state.alerts,
                        { ...alert, id: uuidv4(), dataAlerta: new Date().toISOString() },
                    ],
                })),

            clearAlerts: () => set({ alerts: [] }),

            dismissAlert: (id) =>
                set((state) => ({
                    alerts: state.alerts.filter((a) => a.id !== id),
                })),

            getLimitByCategory: (categoryId) => {
                return get().limits.find((l) => l.categoriaId === categoryId);
            },

            getActiveAlerts: () => {
                return get().alerts;
            },

            checkLimit: (categoryId, currentValue) => {
                const limit = get().getLimitByCategory(categoryId);
                if (!limit) return null;

                const percentage = (currentValue / limit.valorLimite) * 100;

                let status: 'ok' | 'warning' | 'exceeded' = 'ok';
                if (percentage >= 100) {
                    status = 'exceeded';
                } else if (percentage >= limit.percentualAlerta) {
                    status = 'warning';
                }

                return {
                    status,
                    percentage,
                    limit: limit.valorLimite,
                };
            },
        }),
        {
            name: 'billing-limits',
            version: 1,
        }
    )
);
