'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';

interface BarDataItem {
    name: string;
    value: number;
    color: string;
}

export function BarChartCategories() {
    const totals = useTransactionStore((state) => state.getCategoryTotals());
    const categories = useCategoryStore((state) => state.getActiveCategories());

    const data: BarDataItem[] = categories.map((cat) => ({
        name: cat.nome,
        value: Math.abs(totals[cat.id] || 0),
        color: cat.cor,
    }));

    const hasData = Object.values(totals).some((v) => v !== 0);

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload as BarDataItem;
            return (
                <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-100">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                        R$ {item.value.toFixed(2).replace('.', ',')}
                    </p>
                </div>
            );
        }
        return null;
    };

    const formatYAxis = (value: number) => {
        if (value >= 1000) {
            return `R$${(value / 1000).toFixed(0)}k`;
        }
        return `R$${value}`;
    };

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Totais por Categoria
            </h3>

            {!hasData ? (
                <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-2 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                    <p className="text-sm">Classifique itens para ver o gráfico</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="value"
                            radius={[8, 8, 0, 0]}
                            animationBegin={0}
                            animationDuration={500}
                        >
                            {data.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
