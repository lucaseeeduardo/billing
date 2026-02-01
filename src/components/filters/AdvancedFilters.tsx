'use client';

import React, { useState, useEffect } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useTransactionStore } from '@/store/transactionStore';
import { TextFilterMode } from '@/types';

interface AdvancedFiltersProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AdvancedFilters({ isOpen, onClose }: AdvancedFiltersProps) {
    // 1. Store Hooks
    const currentFilter = useFilterStore((state) => state.currentFilter);
    const setFilter = useFilterStore((state) => state.setFilter);
    const resetFilter = useFilterStore((state) => state.resetFilter);
    const saveCurrentFilter = useFilterStore((state) => state.saveCurrentFilter);
    const savedFilters = useFilterStore((state) => state.savedFilters);
    const applySavedFilter = useFilterStore((state) => state.applySavedFilter);
    const deleteSavedFilter = useFilterStore((state) => state.deleteSavedFilter);
    const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);

    const categories = useCategoryStore((state) => state.getActiveCategories());
    const allTags = useTransactionStore((state) => state.getAllTags());

    // 2. Local State Hooks
    const [saveFilterName, setSaveFilterName] = useState('');
    const [showSaveInput, setShowSaveInput] = useState(false);

    // Date filter local state
    const [localDateStart, setLocalDateStart] = useState(currentFilter.dateStart || '');
    const [localDateEnd, setLocalDateEnd] = useState(currentFilter.dateEnd || '');

    // 3. Effects
    useEffect(() => {
        setLocalDateStart(currentFilter.dateStart || '');
    }, [currentFilter.dateStart]);

    useEffect(() => {
        setLocalDateEnd(currentFilter.dateEnd || '');
    }, [currentFilter.dateEnd]);

    // 4. Early Return (Must be after all hooks)
    if (!isOpen) return null;

    // 5. Handlers
    const handleSaveFilter = () => {
        if (saveFilterName.trim()) {
            saveCurrentFilter(saveFilterName.trim());
            setSaveFilterName('');
            setShowSaveInput(false);
        }
    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        if (type === 'start') setLocalDateStart(value);
        else setLocalDateEnd(value);

        if (!value) {
            setFilter(type === 'start' ? { dateStart: null } : { dateEnd: null });
            return;
        }

        // Validate date (YYYY-MM-DD)
        const timestamp = Date.parse(value);
        if (!isNaN(timestamp) && value.length === 10) {
            setFilter(type === 'start' ? { dateStart: value } : { dateEnd: value });
        }
    };

    const toggleCategory = (id: string) => {
        const current = currentFilter.categoryIds;
        const newIds = current.includes(id)
            ? current.filter((c) => c !== id)
            : [...current, id];
        setFilter({ categoryIds: newIds });
    };

    const toggleTag = (tag: string) => {
        const current = currentFilter.tags;
        const newTags = current.includes(tag)
            ? current.filter((t) => t !== tag)
            : [...current, tag];
        setFilter({ tags: newTags });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-xl">🔍</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Filtros Avançados</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasActiveFilters() && (
                            <button
                                onClick={resetFilter}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Limpar
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Text Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buscar por Descrição
                        </label>
                        <div className="flex gap-2">
                            <select
                                value={currentFilter.textMode}
                                onChange={(e) => setFilter({ textMode: e.target.value as TextFilterMode })}
                                className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="contains">Contém</option>
                                <option value="starts">Começa com</option>
                                <option value="ends">Termina com</option>
                            </select>
                            <input
                                type="text"
                                value={currentFilter.text}
                                onChange={(e) => setFilter({ text: e.target.value })}
                                placeholder="Digite para buscar..."
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categorias
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => toggleCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                              ${currentFilter.categoryIds.includes(cat.id)
                                            ? 'text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    style={
                                        currentFilter.categoryIds.includes(cat.id)
                                            ? { backgroundColor: cat.cor }
                                            : undefined
                                    }
                                >
                                    {cat.icone} {cat.nome}
                                </button>
                            ))}
                        </div>
                        {currentFilter.categoryIds.length === 0 && (
                            <p className="text-xs text-gray-400 mt-1">Nenhuma selecionada = todas</p>
                        )}
                    </div>

                    {/* Value Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Faixa de Valor
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <input
                                    type="number"
                                    value={currentFilter.valueMin || ''}
                                    onChange={(e) => setFilter({ valueMin: e.target.value ? parseFloat(e.target.value) : null })}
                                    placeholder="Mín"
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <span className="text-gray-400">até</span>
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                                <input
                                    type="number"
                                    value={currentFilter.valueMax || ''}
                                    onChange={(e) => setFilter({ valueMax: e.target.value ? parseFloat(e.target.value) : null })}
                                    placeholder="Máx"
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>



                    {/* Tags */}
                    {allTags.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                ${currentFilter.tags.includes(tag)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Período
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="date"
                                value={localDateStart}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-gray-400">até</span>
                            <input
                                type="date"
                                value={localDateEnd}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Saved Filters */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">
                                Filtros Salvos
                            </label>
                            {!showSaveInput && hasActiveFilters() && (
                                <button
                                    onClick={() => setShowSaveInput(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    💾 Salvar Filtro Atual
                                </button>
                            )}
                        </div>

                        {showSaveInput && (
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={saveFilterName}
                                    onChange={(e) => setSaveFilterName(e.target.value)}
                                    placeholder="Nome do filtro..."
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveFilter}
                                    className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg"
                                >
                                    Salvar
                                </button>
                                <button
                                    onClick={() => setShowSaveInput(false)}
                                    className="px-3 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}

                        {savedFilters.length > 0 ? (
                            <div className="space-y-2">
                                {savedFilters.map((sf) => (
                                    <div
                                        key={sf.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <button
                                            onClick={() => applySavedFilter(sf.id)}
                                            className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                            {sf.name}
                                        </button>
                                        <button
                                            onClick={() => deleteSavedFilter(sf.id)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Nenhum filtro salvo</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600
                       text-white font-medium rounded-xl shadow-lg
                       hover:shadow-xl transition-all hover:-translate-y-0.5"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
}
