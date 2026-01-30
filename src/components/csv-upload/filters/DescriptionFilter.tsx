import React, { useState } from 'react';
import { MatchMode } from '@/hooks/useCsvFilters';

interface DescriptionFilterProps {
    value: string;
    mode: MatchMode;
    onChange: (value: string, mode: MatchMode) => void;
}

const MODES: { value: MatchMode; label: string }[] = [
    { value: 'contains', label: 'Contém' },
    { value: 'startsWith', label: 'Começa com' },
    { value: 'endsWith', label: 'Termina com' },
    { value: 'exact', label: 'Exatamente igual' },
];

export function DescriptionFilter({ value, mode, onChange }: DescriptionFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
            >
                <span className="text-lg">📝</span>
                <span className="text-sm font-medium">Descrição</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Filtrar descrição</h4>
                        <div className="space-y-3">
                            <select
                                value={mode}
                                onChange={(e) => onChange(value, e.target.value as MatchMode)}
                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                {MODES.map((m) => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Digite o texto..."
                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={value}
                                onChange={(e) => onChange(e.target.value, mode)}
                                autoFocus
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
