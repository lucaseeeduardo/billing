import React, { useState } from 'react';
import { NumericFormat } from 'react-number-format';

interface ValueRangeFilterProps {
    min: number | null;
    max: number | null;
    onChange: (min: number | null, max: number | null, label?: string) => void;
}

const RANGES = [
    { label: 'Até R$ 100', min: null, max: 100 },
    { label: 'R$ 100 - R$ 500', min: 100, max: 500 },
    { label: 'R$ 500 - R$ 1.000', min: 500, max: 1000 },
    { label: 'Acima de R$ 1.000', min: 1000, max: null },
    { label: 'Despesas (Negativo)', min: null, max: 0 },
    { label: 'Receitas (Positivo)', min: 0, max: null },
];

export function ValueRangeFilter({ min, max, onChange }: ValueRangeFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${min !== null || max !== null ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
            >
                <span className="text-lg">💰</span>
                <span className="text-sm font-medium">Valor</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Faixa de valor</h4>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {RANGES.map((range) => (
                                <button
                                    key={range.label}
                                    onClick={() => {
                                        onChange(range.min, range.max, range.label);
                                        setIsOpen(false);
                                    }}
                                    className="text-xs text-left px-2 py-1.5 rounded hover:bg-gray-100 text-gray-600 truncate"
                                    title={range.label}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-3 border-t border-gray-100 pt-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Mínimo</label>
                                <NumericFormat
                                    value={min ?? ''}
                                    onValueChange={(values: { floatValue?: number }) => onChange(values.floatValue ?? null, max)}
                                    prefix="R$ "
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    decimalScale={2}
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="R$ 0,00"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Máximo</label>
                                <NumericFormat
                                    value={max ?? ''}
                                    onValueChange={(values: { floatValue?: number }) => onChange(min, values.floatValue ?? null)}
                                    prefix="R$ "
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    decimalScale={2}
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="R$ 0,00"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
