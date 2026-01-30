'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ParsedRow } from '@/hooks/useCsvParser';

interface CsvPreviewTableProps {
    rows: ParsedRow[];
    totalAmount: number;
    validRows: number;
    invalidRows: number;
    selectedIds: Set<string>;
    onToggleSelection: (id: string) => void;
    onToggleAll: (ids: string[]) => void;
    onRemoveRow: (id: string) => void;
    maxHeight?: number;
}

// Virtual row height
const ROW_HEIGHT = 52;
const BUFFER_ROWS = 5;

export function CsvPreviewTable({
    rows,
    totalAmount,
    validRows,
    invalidRows,
    selectedIds,
    onToggleSelection,
    onToggleAll,
    onRemoveRow,
    maxHeight = 400,
}: CsvPreviewTableProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(maxHeight);

    // Handle scroll for virtualization
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    // Calculate visible rows
    const totalHeight = rows.length * ROW_HEIGHT;
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
    const endIndex = Math.min(
        rows.length,
        Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_ROWS
    );
    const visibleRows = rows.slice(startIndex, endIndex);
    const offsetY = startIndex * ROW_HEIGHT;

    // Use virtualization only for large datasets
    const useVirtualization = rows.length > 100;

    useEffect(() => {
        if (containerRef.current) {
            setContainerHeight(containerRef.current.clientHeight);
        }
    }, []);

    // Master Checkbox Logic
    const allSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.id));
    const isIndeterminate = selectedIds.size > 0 && !allSelected;

    const handleMasterCheckbox = () => {
        onToggleAll(rows.map(r => r.id));
    };

    const formatCurrency = (value: number) => {
        const isNegative = value < 0;
        const formatted = Math.abs(value).toFixed(2).replace('.', ',');
        return (
            <span className={isNegative ? 'text-green-600' : 'text-gray-900'}>
                {isNegative ? '+' : ''} R$ {formatted}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dateStr;
        } catch {
            return dateStr;
        }
    };

    if (rows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg
                    className="w-12 h-12 mb-3 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <p className="text-sm">Nenhum dado para exibir</p>
                <p className="text-xs mt-1">Importe um arquivo CSV primeiro</p>
            </div>
        );
    }

    const renderRow = (row: ParsedRow, index: number) => {
        const isSelected = selectedIds.has(row.id);
        return (
            <tr
                key={row.id}
                className={`
            group transition-colors
            ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : row.isValid ? 'hover:bg-gray-50' : 'bg-red-50 hover:bg-red-100'}
          `}
                onClick={() => onToggleSelection(row.id)}
            >
                <td className="px-4 py-3 w-10">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelection(row.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                    />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                    {row.lineNumber}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(row.date)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium max-w-[300px] truncate">
                    {row.title}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                    {row.isValid ? formatCurrency(row.amount) : (
                        <span className="text-red-500 text-xs">{row.rawAmount || '—'}</span>
                    )}
                </td>
                <td className="px-4 py-3 text-sm">
                    {row.isValid ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            OK
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title={row.error}>
                            {row.error}
                        </span>
                    )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveRow(row.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                        title="Remover item"
                    >
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
            </tr>
        );
    };

    const header = (
        <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
                <th className="px-4 py-3 w-10">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        ref={input => {
                            if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={handleMasterCheckbox}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                    Linha
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                    Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Descrição
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                    Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                    Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                    Ação
                </th>
            </tr>
        </thead>
    );

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header Stats */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{rows.length}</span> itens
                    </span>
                    <span className="text-sm text-green-600">
                        <span className="font-semibold">{validRows}</span> válidos
                    </span>
                    {selectedIds.size > 0 && (
                        <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                            {selectedIds.size} selecionados
                        </span>
                    )}
                    {invalidRows > 0 && (
                        <span className="text-sm text-red-600">
                            <span className="font-semibold">{invalidRows}</span> com problemas
                        </span>
                    )}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                    Total: R$ {totalAmount.toFixed(2).replace('.', ',')}
                </div>
            </div>

            {/* Table */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="overflow-auto border-t border-gray-200"
                style={{ maxHeight }}
            >
                {useVirtualization ? (
                    <div style={{ height: totalHeight, position: 'relative' }}>
                        <table className="w-full" style={{ transform: `translateY(${offsetY}px)` }}>
                            {header}
                            <tbody className="divide-y divide-gray-100">
                                {visibleRows.map((row, i) => renderRow(row, startIndex + i))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <table className="w-full">
                        {header}
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row, i) => renderRow(row, i))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer with virtualization indicator */}
            {useVirtualization && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 text-center">
                    Mostrando {visibleRows.length} de {rows.length} itens (virtualizado para performance)
                </div>
            )}
        </div>
    );
}
