import React from 'react';

interface SelectionToolbarProps {
    selectedCount: number;
    filteredCount: number;
    totalCount: number;
    hasActiveFilters: boolean;
    selectedTotal: number;
    onProcessSelected: () => void;
    onProcessFiltered: () => void;
    onDeleteSelected: () => void;
}

export function SelectionToolbar({
    selectedCount,
    filteredCount,
    totalCount,
    hasActiveFilters,
    selectedTotal,
    onProcessSelected,
    onProcessFiltered,
    onDeleteSelected,
}: SelectionToolbarProps) {

    // Determine which "Process" action to highlight
    const showProcessFiltered = hasActiveFilters && selectedCount === 0;
    const showProcessSelected = selectedCount > 0;
    const showProcessAll = !hasActiveFilters && selectedCount === 0;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6 shadow-sm animate-fade-in-up">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <span className="text-xl">✅</span>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">
                        {selectedCount > 0 ? (
                            `${selectedCount} itens selecionados`
                        ) : hasActiveFilters ? (
                            `Modo de Filtragem`
                        ) : (
                            `Pronto para importar`
                        )}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {selectedCount > 0 ? (
                            `Total: R$ ${selectedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        ) : hasActiveFilters ? (
                            `Exibindo ${filteredCount} de ${totalCount} transações`
                        ) : (
                            `${totalCount} transações encontradas no arquivo`
                        )}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedCount > 0 && (
                    <button
                        onClick={onDeleteSelected}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm flex-1 sm:flex-none border border-transparent hover:border-red-100"
                    >
                        🗑️ Excluir
                    </button>
                )}

                {showProcessSelected && (
                    <button
                        onClick={onProcessSelected}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all font-semibold flex-1 sm:flex-none"
                    >
                        Processar {selectedCount} itens
                    </button>
                )}

                {showProcessFiltered && (
                    <button
                        onClick={onProcessFiltered}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-md shadow-blue-500/20 transition-all font-semibold flex-1 sm:flex-none"
                    >
                        Processar {filteredCount} filtrados
                    </button>
                )}

                {showProcessAll && (
                    <button
                        onClick={onProcessFiltered} // Reusing handler since "Filtered" == "All" when no filter
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-md shadow-green-500/20 transition-all font-semibold flex-1 sm:flex-none"
                    >
                        Importar Tudo ({totalCount})
                    </button>
                )}
            </div>
        </div>
    );
}
