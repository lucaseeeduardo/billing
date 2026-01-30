'use client';

import React from 'react';

interface SelectionToolbarProps {
    selectedCount: number;
    totalCount: number;
    visibleCount: number;
    areAllVisibleSelected: boolean;
    areSomeVisibleSelected: boolean;
    onSelectAllVisible: () => void;
    onDeselectAllVisible: () => void;
    onSelectAll: () => void;
    onClear: () => void;
}

export function SelectionToolbar({
    selectedCount,
    totalCount,
    visibleCount,
    areAllVisibleSelected,
    areSomeVisibleSelected,
    onSelectAllVisible,
    onDeselectAllVisible,
    onSelectAll,
    onClear,
}: SelectionToolbarProps) {
    const handleCheckboxChange = () => {
        if (areAllVisibleSelected) {
            onDeselectAllVisible();
        } else {
            onSelectAllVisible();
        }
    };

    return (
        <div className="flex flex-col gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
            {/* Select All Checkbox Row */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={areAllVisibleSelected}
                            ref={(input) => {
                                if (input) {
                                    input.indeterminate = areSomeVisibleSelected && !areAllVisibleSelected;
                                }
                            }}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 
                         focus:ring-2 focus:ring-blue-500 focus:ring-offset-0
                         transition-colors cursor-pointer"
                        />
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        Selecionar todos ({visibleCount} visíveis)
                    </span>
                </label>

                {/* Quick select all link */}
                {visibleCount < totalCount && (
                    <button
                        onClick={onSelectAll}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                        Selecionar todos os {totalCount} itens
                    </button>
                )}
            </div>

            {/* Selection Status Bar */}
            {selectedCount > 0 && (
                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                            {selectedCount}
                        </div>
                        <span className="text-sm font-medium text-blue-800">
                            {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
                        </span>
                    </div>
                    <button
                        onClick={onClear}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium 
                       hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                    >
                        Limpar seleção
                    </button>
                </div>
            )}
        </div>
    );
}
