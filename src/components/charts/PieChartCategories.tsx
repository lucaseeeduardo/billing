'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from 'recharts';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';

interface ChartDataItem {
    name: string;
    value: number;
    total: number;
    color: string;
}

export function PieChartCategories() {
    const totals = useTransactionStore((state) => state.getCategoryTotals());
    const categories = useCategoryStore((state) => state.getActiveCategories());

    // Calculate percentages
    const totalValue = Object.values(totals).reduce((sum, val) => sum + Math.abs(val), 0);

    const data: ChartDataItem[] = categories
        .filter((cat) => totals[cat.id] && Math.abs(totals[cat.id]) > 0)
        .map((cat) => ({
            name: cat.nome,
            value: totalValue > 0 ? parseFloat(((Math.abs(totals[cat.id]) / totalValue) * 100).toFixed(1)) : 0,
            total: Math.abs(totals[cat.id]),
            color: cat.cor,
        }));

    const hasData = data.length > 0;

    const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload as ChartDataItem;
            return (
                <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-100">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">
                        {item.value.toFixed(1)}% (R$ {item.total.toFixed(2).replace('.', ',')})
                    </p>
                </div>
            );
        }
        return null;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderLegend = (props: any) => {
        const { payload } = props;
        return (
            <ul className="flex flex-wrap justify-center gap-3 mt-4">
                {payload?.map((entry: { value: string; color: string }, index: number) => (
                    <li key={`legend-${index}`} className="flex items-center gap-2">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-600">{entry.value}</span>
                    </li>
                ))}
            </ul>
        );
    };


    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">🥧</span>
                Distribuição por Categoria
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
                            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                        />
                    </svg>
                    <p className="text-sm">Classifique itens para ver o gráfico</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={500}
                        >
                            {data.map((entry) => (
                                <Cell
                                    key={entry.name}
                                    fill={entry.color}
                                    stroke="white"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
