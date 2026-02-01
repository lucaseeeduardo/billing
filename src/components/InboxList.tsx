'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { useFilterStore } from '@/store/filterStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useImportHistoryStore } from '@/store/importHistoryStore';
import { useAutoCategoryStore } from '@/store/autoCategoryStore';
import { TransactionCard } from './TransactionCard';
import { SelectionToolbar } from './SelectionToolbar';
import { AdvancedFilters } from './filters/AdvancedFilters';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { Transaction } from '@/types';


interface InboxListProps {
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
}

export function InboxList({ selectedIds, onSelectionChange }: InboxListProps) {
    const transactions = useTransactionStore((state) => state.transactions);
    const clearTransactions = useTransactionStore((state) => state.clearAllData);
    const clearHistory = useImportHistoryStore((state) => state.clearHistory);


    const handleClearData = useCallback(() => {
        if (window.confirm('⚠️ Tem certeza que deseja limpar as IMPORTAÇÕES?\n\nIsso apagará:\n- Todas as transações\n- Histórico de importações\n\nSuas Categorias e Regras serão mantidas.')) {
            clearTransactions();
            clearHistory();
            // resetCategories(); // Configurações mantidas
            // clearRules();      // Configurações mantidas
            alert('Dados de importação limpos com sucesso!');
        }
    }, [clearTransactions, clearHistory]);

    // Filter Store
    const currentFilter = useFilterStore((state) => state.currentFilter);
    const setFilter = useFilterStore((state) => state.setFilter);
    const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);
    const getActiveFilterCount = useFilterStore((state) => state.getActiveFilterCount);

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);



    // Apply filters
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            // 1. Must be uncategorized (Inbox)
            if (t.categoryId !== null) return false;

            // 2. Text Filter
            if (currentFilter.text) {
                const search = currentFilter.text.toLowerCase();
                const title = t.title.toLowerCase();
                if (currentFilter.textMode === 'starts' && !title.startsWith(search)) return false;
                if (currentFilter.textMode === 'ends' && !title.endsWith(search)) return false;
                if (currentFilter.textMode === 'contains' && !title.includes(search)) return false;
            }

            // 3. Value Range
            if (currentFilter.valueMin !== null && t.amount < currentFilter.valueMin) return false;
            if (currentFilter.valueMax !== null && t.amount > currentFilter.valueMax) return false;

            // 4. Date Range
            if (currentFilter.dateStart && t.date < currentFilter.dateStart) return false;
            if (currentFilter.dateEnd && t.date > currentFilter.dateEnd) return false;

            // 5. Tags
            if (currentFilter.tags.length > 0) {
                const hasTag = currentFilter.tags.some(tag => (t.tags || []).includes(tag));
                if (!hasTag) return false;
            }

            // 6. Category Filter (Should exclude all if categories selected, as inbox has no category)
            if (currentFilter.categoryIds.length > 0) return false;

            return true;
        });
    }, [transactions, currentFilter]);

    // MultiSelection logic
    const {
        isSelected,
        handleClick,
        handleCheckboxClick,
        selectAll,
        selectVisible,
        deselectVisible,
        clear,
        areAllVisibleSelected,
        areSomeVisibleSelected,
        selectedCount,
    } = useMultiSelect<Transaction>(filteredTransactions, {
        onSelectionChange,
    });

    const visibleIds = filteredTransactions.map((t) => t.id);

    return (

        <div className="flex flex-col h-full bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                          flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <span className="text-xl">📥</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Inbox</h2>
                        <p className="text-sm text-gray-500">
                            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'item' : 'itens'}
                        </p>
                    </div>

                    <div className="ml-auto flex gap-2">
                        {/* Clear Data Button */}
                        <button
                            onClick={handleClearData}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Limpar todos os dados"
                        >
                            <span className="text-lg">🧹</span>
                        </button>


                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={currentFilter.text}
                            onChange={(e) => setFilter({ text: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl
                       bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200 placeholder:text-gray-400"
                        />
                        {currentFilter.text && (
                            <button
                                onClick={() => setFilter({ text: '' })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setIsFiltersOpen(true)}
                        className={`p-2.5 rounded-xl border transition-all relative
                        ${hasActiveFilters()
                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                        </svg>
                        {hasActiveFilters() && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 text-white text-xs 
                                           flex items-center justify-center rounded-full border-2 border-white">
                                {getActiveFilterCount()}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* List Container */}
            <div className="flex-1 overflow-hidden flex flex-col">

                {/* Selection Toolbar */}
                {filteredTransactions.length > 0 && (
                    <SelectionToolbar
                        selectedCount={selectedCount}
                        totalCount={filteredTransactions.length}
                        visibleCount={filteredTransactions.length}
                        areAllVisibleSelected={areAllVisibleSelected(visibleIds)}
                        areSomeVisibleSelected={areSomeVisibleSelected(visibleIds)}
                        onSelectAllVisible={() => selectVisible(visibleIds)}
                        onDeselectAllVisible={() => deselectVisible(visibleIds)}
                        onSelectAll={selectAll}
                        onClear={clear}
                    />
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16 mb-4 opacity-50"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-medium">
                                {transactions.some(t => t.categoryId === null)
                                    ? 'Nenhum item encontrado com esses filtros'
                                    : 'Tudo classificado!'}
                            </p>
                            <p className="text-sm mt-2 opacity-70">
                                Importe um arquivo CSV usando a área acima
                            </p>
                        </div>
                    ) : (
                        filteredTransactions.map((transaction) => (
                            <TransactionCard
                                key={transaction.id}
                                transaction={transaction}
                                isSelected={isSelected(transaction.id)}
                                isSelectionMode={true}
                                dragCount={selectedCount > 0 && isSelected(transaction.id) ? selectedCount : 1}
                                onSelect={(id, event) => handleClick(id, event, filteredTransactions)}
                                onCheckboxClick={handleCheckboxClick}
                            />
                        ))
                    )}
                </div>
            </div>

            {isFiltersOpen && (
                <AdvancedFilters
                    isOpen={isFiltersOpen}
                    onClose={() => setIsFiltersOpen(false)}
                />
            )}


        </div>
    );
}
