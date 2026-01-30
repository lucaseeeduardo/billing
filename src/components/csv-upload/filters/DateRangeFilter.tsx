import React, { useState } from 'react';

interface DateRangeFilterProps {
    from: Date | null;
    to: Date | null;
    onChange: (from: Date | null, to: Date | null, label?: string) => void;
}

const QUICK_OPTIONS = [
    { label: 'Hoje', days: 0 },
    { label: 'Últimos 7 dias', days: 7 },
    { label: 'Últimos 15 dias', days: 15 },
    { label: 'Últimos 30 dias', days: 30 },
    { label: 'Este mês', type: 'month' },
    { label: 'Mês passado', type: 'lastMonth' },
];

export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleQuickSelect = (option: any) => {
        const end = new Date();
        let start = new Date();

        if (option.days !== undefined) {
            start.setDate(end.getDate() - option.days);
        } else if (option.type === 'month') {
            start.setDate(1);
        } else if (option.type === 'lastMonth') {
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            end.setDate(0); // Last day of previous month
        }

        // Reset hours to start/end of day
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        onChange(start, end, option.label);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${from || to ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
            >
                <span className="text-lg">📅</span>
                <span className="text-sm font-medium">Data</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Filtrar por data</h4>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {QUICK_OPTIONS.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => handleQuickSelect(opt)}
                                    className="text-xs text-left px-2 py-1.5 rounded hover:bg-gray-100 text-gray-600"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-3 border-t border-gray-100 pt-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">De</label>
                                <input
                                    type="date"
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={from ? from.toISOString().split('T')[0] : ''}
                                    onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null, to)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Até</label>
                                <input
                                    type="date"
                                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={to ? to.toISOString().split('T')[0] : ''}
                                    onChange={(e) => onChange(from, e.target.value ? new Date(e.target.value) : null)}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
