'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { Transaction } from '@/types';
import { useImportHistoryStore } from '@/store/importHistoryStore';
import { useAutoCategoryStore } from '@/store/autoCategoryStore';

import { ExportButton } from '@/components/ExportButton';
import { InboxList } from '@/components/InboxList';
import { CategoryDropZone } from '@/components/CategoryDropZone';
import { CsvDropZone } from '@/components/csv-upload/CsvDropZone';
import { DropZoneCollapsed } from '@/components/csv-upload/DropZoneCollapsed';
import { CsvFiltersPanel } from '@/components/csv-upload/CsvFiltersPanel';
import { SelectionToolbar } from '@/components/csv-upload/SelectionToolbar';
import { CsvPreviewTable } from '@/components/CsvPreviewTable';
import { useCsvParser, ParsedRow, CurrencyFormat } from '@/hooks/useCsvParser';
import { useCsvFilters } from '@/hooks/useCsvFilters';
import { useRowSelection } from '@/hooks/useRowSelection';
import { TransactionCard } from '@/components/TransactionCard';
import { PieChartCategories } from '@/components/charts/PieChartCategories';
import { BarChartCategories } from '@/components/charts/BarChartCategories';
import { Onboarding } from '@/components/Onboarding';
import { UndoRedoControls } from '@/components/UndoRedoControls';
import { useHistory } from '@/hooks/useHistory';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { LimitsAlertPanel } from '@/components/limits/LimitsAlertPanel';
import { ImportHistoryDrawer } from '@/components/history/ImportHistoryDrawer';
import { PeriodComparator } from '@/components/analytics/PeriodComparator';


export default function Home() {
    const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [dragCount, setDragCount] = useState(1);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [isLimitsOpen, setIsLimitsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

    // Store Hooks
    const categorizeTransaction = useTransactionStore((state) => state.categorizeTransaction);
    const categorizeMultiple = useTransactionStore((state) => state.categorizeMultiple);
    const setTransactions = useTransactionStore((state) => state.setTransactions);
    const transactions = useTransactionStore((state) => state.transactions);
    const globalDateStart = useTransactionStore((state) => state.globalDateStart);
    const globalDateEnd = useTransactionStore((state) => state.globalDateEnd);

    const categories = useCategoryStore((state) => state.getActiveCategories());
    const getCategoryById = useCategoryStore((state) => state.getCategoryById);

    // Show toast notification
    const showToast = useCallback((message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast({ message: '', visible: false }), 3000);
    }, []);

    const {
        parseFile,
        reset,
        ...csvState
    } = useCsvParser();

    const [fileName, setFileName] = useState('');
    const [currencyFormat, setCurrencyFormat] = useState<CurrencyFormat>('pt-BR');
    const addImport = useImportHistoryStore((state) => state.addImport);

    // Hydration fix
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);



    const handleFileSelect = useCallback((file: File) => {
        setFileName(file.name);
        parseFile(file, currencyFormat);
    }, [parseFile, currencyFormat]);

    const handleFormatChange = useCallback((format: CurrencyFormat) => {
        setCurrencyFormat(format);
        // Helper to re-parse existing data with new format
        // We need to access reparseWithFormat from csvState, but it's destructured below.
        // Wait, destructuring happens BEFORE this.
    }, []);

    const handleReset = useCallback(() => {
        setFileName('');
        reset();
    }, [reset]);

    // Filters and Selection Hooks
    const filterState = useCsvFilters(csvState.rows);
    const selectionState = useRowSelection();

    // Effect: Clear selection when filters change (to avoid confusion)
    useEffect(() => {
        selectionState.clearSelection();
    }, [filterState.filters]);

    const getMatchingCategory = useAutoCategoryStore((state) => state.getMatchingCategory);

    const handleProcessTransactions = useCallback((rowsToProcess: ParsedRow[]) => {
        // Calculate totals for history
        const totalAmount = rowsToProcess.reduce((sum, row) => sum + row.amount, 0);
        const itemIds = rowsToProcess.map(row => row.id);

        // Add to import history
        const importId = addImport({
            nomeArquivo: fileName,
            quantidadeItens: rowsToProcess.length,
            valorTotal: totalAmount,
            status: 'sucesso',
            itensIds: itemIds,
        });

        let autoCategorizedCount = 0;

        const newTransactions: Transaction[] = rowsToProcess.map((row) => {
            // Check for auto-categorization rule
            const matchedCategoryId = getMatchingCategory(row.title);
            if (matchedCategoryId) {
                autoCategorizedCount++;
            }

            return {
                id: row.id,
                date: new Date(row.date).toISOString(), // Ensure ISO string
                title: row.title,
                amount: row.amount,
                categoryId: matchedCategoryId, // Use matched category or null if not found
                importId: importId, // Tracking batch import
            };
        });

        // Add to store (append)
        setTransactions([...transactions, ...newTransactions]);

        // Remove processed rows from parser state
        // If processing ALL rows, just reset
        if (rowsToProcess.length === csvState.rows.length) {
            handleReset();
            if (autoCategorizedCount > 0) {
                showToast(`${newTransactions.length} importados (${autoCategorizedCount} auto-classificados)!`);
            } else {
                showToast(`${newTransactions.length} transações importadas com sucesso!`);
            }
        } else {
            // Processing subset - remove one by one (ideal would be bulk remove)
            rowsToProcess.forEach(row => csvState.removeRow(row.id));
            selectionState.clearSelection();
            if (autoCategorizedCount > 0) {
                showToast(`${newTransactions.length} importados (${autoCategorizedCount} auto-classificados). Restam ${csvState.rows.length - newTransactions.length}.`);
            } else {
                showToast(`${newTransactions.length} transações importadas. Restam ${csvState.rows.length - newTransactions.length}.`);
            }
        }
    }, [transactions, setTransactions, csvState, handleReset, selectionState, showToast, addImport, fileName, getMatchingCategory]);

    const handleProcessSelected = useCallback(() => {
        const selectedRows = csvState.rows.filter(r => selectionState.selectedIds.has(r.id));
        handleProcessTransactions(selectedRows);
    }, [csvState.rows, selectionState.selectedIds, handleProcessTransactions]);

    const handleProcessFiltered = useCallback(() => {
        handleProcessTransactions(filterState.filteredItems);
    }, [filterState.filteredItems, handleProcessTransactions]);

    const handleDeleteSelected = useCallback(() => {
        const idsToDelete = Array.from(selectionState.selectedIds);
        idsToDelete.forEach(id => csvState.removeRow(id));
        selectionState.clearSelection();
        showToast(`${idsToDelete.length} itens removidos.`);
    }, [selectionState, csvState, showToast]);





    // Undo/Redo functionality
    const { canUndo, canRedo, undo, redo, pushState } = useHistory(transactions);
    const prevTransactionsRef = useRef<Transaction[]>(transactions);

    // Track transaction changes for history
    useEffect(() => {
        const prev = prevTransactionsRef.current;
        const hasChanged = JSON.stringify(prev) !== JSON.stringify(transactions);

        if (hasChanged && transactions.length > 0) {
            pushState(transactions);
        }
        prevTransactionsRef.current = transactions;
    }, [transactions, pushState]);

    const handleUndo = useCallback(() => {
        const previousState = undo();
        if (previousState) {
            setTransactions(previousState);
            prevTransactionsRef.current = previousState;
        }
    }, [undo, setTransactions]);

    const handleRedo = useCallback(() => {
        const nextState = redo();
        if (nextState) {
            setTransactions(nextState);
            prevTransactionsRef.current = nextState;
        }
    }, [redo, setTransactions]);

    // Keyboard shortcuts for undo/redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
            // Escape to clear selection
            if (e.key === 'Escape') {
                setSelectedIds(new Set());
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);



    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const transaction = transactions.find((t) => t.id === active.id);
        if (transaction) {
            setActiveTransaction(transaction);

            // Set drag count based on selection
            const isSelectedItem = selectedIds.has(transaction.id);
            if (isSelectedItem && selectedIds.size > 1) {
                setDragCount(selectedIds.size);
            } else {
                setDragCount(1);
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over) {
            const categoryId = over.id as string;
            const category = getCategoryById(categoryId);

            if (category) {
                const draggedId = active.id as string;
                const isSelectedItem = selectedIds.has(draggedId);

                if (isSelectedItem && selectedIds.size > 1) {
                    // Batch categorization
                    categorizeMultiple(Array.from(selectedIds), categoryId);
                    showToast(`${selectedIds.size} itens movidos para ${category.nome}`);
                    setSelectedIds(new Set()); // Clear selection after move
                } else {
                    // Single item categorization
                    categorizeTransaction(draggedId, categoryId);
                    showToast(`1 item movido para ${category.nome}`);
                }
            }
        }

        setActiveTransaction(null);
        setDragCount(1);
    };

    const handleDragCancel = () => {
        setActiveTransaction(null);
        setDragCount(1);
    };

    const handleSelectionChange = useCallback((ids: Set<string>) => {
        setSelectedIds(ids);
    }, []);

    const totalTransactions = transactions.length;
    const categorizedCount = transactions.filter((t) => t.categoryId !== null).length;
    const progress = totalTransactions > 0 ? (categorizedCount / totalTransactions) * 100 : 0;

    if (!isMounted) return null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <main className="min-h-screen p-6 lg:p-8">
                {/* Onboarding Tour */}
                <Onboarding />

                {/* Toast Notification */}
                {toast.visible && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 
                          bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl
                          animate-fade-in-up flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {toast.message}
                    </div>
                )}

                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                    💰 Dashboard Financeiro
                                </h1>
                                <p className="text-gray-500">
                                    Importe seu CSV e categorize seus gastos arrastando os cards
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <UndoRedoControls
                                canUndo={canUndo}
                                canRedo={canRedo}
                                onUndo={handleUndo}
                                onRedo={handleRedo}
                            />


                            <button
                                onClick={() => setIsCategoryManagerOpen(true)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                title="Gerenciar Categorias"
                            >
                                <span className="text-xl">⚙️</span>
                            </button>

                            <button
                                onClick={() => setIsLimitsOpen(true)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                title="Limites e Alertas"
                            >
                                <span className="text-xl">⚠️</span>
                            </button>

                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                title="Histórico de Importação"
                            >
                                <span className="text-xl">📜</span>
                            </button>

                            <button
                                onClick={() => setIsAnalyticsOpen(true)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                title="Comparativo de Períodos"
                            >
                                <span className="text-xl">📊</span>
                            </button>

                            <div data-onboarding="export">
                                <ExportButton />
                            </div>
                        </div>
                    </div>

                    <CategoryManager
                        isOpen={isCategoryManagerOpen}
                        onClose={() => setIsCategoryManagerOpen(false)}
                    />

                    <LimitsAlertPanel
                        isOpen={isLimitsOpen}
                        onClose={() => setIsLimitsOpen(false)}
                    />

                    <ImportHistoryDrawer
                        isOpen={isHistoryOpen}
                        onClose={() => setIsHistoryOpen(false)}
                    />

                    <PeriodComparator
                        isOpen={isAnalyticsOpen}
                        onClose={() => setIsAnalyticsOpen(false)}
                    />

                    {/* Progress Bar */}
                    {totalTransactions > 0 && (
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">
                                    Progresso de Classificação
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                    {categorizedCount} / {totalTransactions} ({progress.toFixed(0)}%)
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </header>

                {/* CSV Drop Zone & Processing Area */}
                <div className="mb-8">
                    {!csvState.hasData ? (
                        <CsvDropZone
                            onFileSelect={handleFileSelect}
                            status={csvState.status === 'parsing' ? 'processing' : csvState.status === 'error' ? 'error' : 'idle'}
                            error={csvState.error}
                        />
                    ) : (
                        <div className="space-y-4">
                            <DropZoneCollapsed
                                fileName={fileName}
                                rowCount={csvState.totalRows}
                                isValid={csvState.status === 'success'}
                                onReplace={handleReset}
                                onClear={handleReset}
                                currencyFormat={currencyFormat}
                                onFormatChange={(fmt) => {
                                    setCurrencyFormat(fmt);
                                    csvState.reparseWithFormat(fmt);
                                }}
                            />

                            <CsvFiltersPanel filterState={filterState} />

                            <SelectionToolbar
                                selectedCount={selectionState.selectionCount}
                                filteredCount={filterState.filteredCount}
                                totalCount={csvState.totalRows}
                                hasActiveFilters={filterState.hasActiveFilters}
                                selectedTotal={filterState.filteredItems
                                    .filter(item => selectionState.selectedIds.has(item.id))
                                    .reduce((acc, item) => acc + item.amount, 0)
                                }
                                onProcessSelected={handleProcessSelected}
                                onProcessFiltered={handleProcessFiltered}
                                onDeleteSelected={handleDeleteSelected}
                            />

                            <CsvPreviewTable
                                rows={filterState.filteredItems}
                                totalAmount={filterState.filteredTotal}
                                validRows={filterState.filteredItems.filter(r => r.isValid).length}
                                invalidRows={filterState.filteredItems.filter(r => !r.isValid).length}
                                selectedIds={selectionState.selectedIds}
                                onToggleSelection={selectionState.toggleSelection}
                                onToggleAll={selectionState.toggleAll}
                                onRemoveRow={(id) => csvState.removeRow(id)}
                            />
                        </div>
                    )}
                </div>

                {/* Global Date Filter (Below CSV) */}
                <div className="mb-6 flex justify-end">
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1.5 shadow-sm">
                        <span className="pl-2 text-sm font-medium text-gray-600">Período Geral:</span>
                        <input
                            type="date"
                            className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 w-32 cursor-pointer"
                            onChange={(e) => {
                                const end = useTransactionStore.getState().globalDateEnd;
                                useTransactionStore.getState().setGlobalDateFilter(e.target.value || null, end);
                            }}
                            value={globalDateStart || ''}
                            title="Data Início"
                        />
                        <span className="text-gray-400">→</span>
                        <input
                            type="date"
                            className="text-sm bg-transparent border-none focus:ring-0 text-gray-700 w-32 cursor-pointer"
                            onChange={(e) => {
                                const start = useTransactionStore.getState().globalDateStart;
                                useTransactionStore.getState().setGlobalDateFilter(start, e.target.value || null);
                            }}
                            value={globalDateEnd || ''}
                            title="Data Fim"
                        />
                        {(globalDateStart || globalDateEnd) && (
                            <button
                                onClick={() => useTransactionStore.getState().setGlobalDateFilter(null, null)}
                                className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors ml-1"
                                title="Limpar filtro de data"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                    {/* Inbox */}
                    <div className="lg:col-span-4 xl:col-span-3 h-[600px]" data-onboarding="inbox">
                        <InboxList
                            selectedIds={selectedIds}
                            onSelectionChange={handleSelectionChange}
                        />
                    </div>

                    {/* Category Drop Zones */}
                    <div className="lg:col-span-8 xl:col-span-9" data-onboarding="categories">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {categories.map((category) => (
                                <CategoryDropZone key={category.id} category={category} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-onboarding="charts">
                    <PieChartCategories />
                    <BarChartCategories />
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center text-sm text-gray-400">
                    <p>Arraste os cards para as categorias ou use o dropdown para classificar</p>
                    <p className="mt-1 text-xs">Dica: Use Ctrl+Z para desfazer, Ctrl+Click para selecionar múltiplos, Shift+Click para intervalo</p>
                </footer>
            </main>

            {/* Drag Overlay */}
            <DragOverlay>
                {activeTransaction ? (
                    <TransactionCard
                        transaction={activeTransaction}
                        isDragOverlay
                        isSelected={selectedIds.has(activeTransaction.id)}
                        dragCount={dragCount}
                    />
                ) : null}
            </DragOverlay>
        </DndContext >
    );
}
