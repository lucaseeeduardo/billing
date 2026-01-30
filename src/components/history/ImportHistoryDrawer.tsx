'use client';

import React, { useState } from 'react';
import { useImportHistoryStore } from '@/store/importHistoryStore';
import { useTransactionStore } from '@/store/transactionStore';
import { ImportacaoHistorico } from '@/types';

interface ImportHistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ImportHistoryDrawer({ isOpen, onClose }: ImportHistoryDrawerProps) {
    const history = useImportHistoryStore((state) => state.history);
    const deleteImport = useImportHistoryStore((state) => state.deleteImport);
    const removeTransactionsByImportId = useTransactionStore((state) => state.removeTransactionsByImportId);

    const [confirmRevert, setConfirmRevert] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'sucesso' | 'parcial' | 'erro'>('all');

    const filteredHistory = filterStatus === 'all'
        ? history
        : history.filter((h) => h.status === filterStatus);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (value: number) => {
        return `R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`;
    };

    const handleRevert = (importItem: ImportacaoHistorico) => {
        removeTransactionsByImportId(importItem.id);
        deleteImport(importItem.id);
        setConfirmRevert(null);
    };

    const getStatusBadge = (status: ImportacaoHistorico['status']) => {
        switch (status) {
            case 'sucesso':
                return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">✅ Sucesso</span>;
            case 'parcial':
                return <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">⚠️ Parcial</span>;
            case 'erro':
                return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">❌ Erro</span>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-xl">📜</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Histórico de Importações</h2>
                            <p className="text-sm text-gray-500">{history.length} importações</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Filters */}
                <div className="px-6 py-3 border-b border-gray-100 flex gap-2">
                    {(['all', 'sucesso', 'parcial', 'erro'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                          ${filterStatus === status
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <span className="text-5xl mb-3">📂</span>
                            <p className="font-medium">Nenhuma importação encontrada</p>
                            <p className="text-sm">Importe um CSV para começar</p>
                        </div>
                    ) : (
                        filteredHistory.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">📄</span>
                                        <span className="font-medium text-gray-900 truncate max-w-[200px]">
                                            {item.nomeArquivo}
                                        </span>
                                    </div>
                                    {getStatusBadge(item.status)}
                                </div>

                                <div className="text-sm text-gray-500 mb-3">
                                    <div>{formatDate(item.dataImportacao)}</div>
                                    <div className="flex gap-3 mt-1">
                                        <span>{item.quantidadeItens} itens</span>
                                        <span>•</span>
                                        <span>{formatCurrency(item.valorTotal)}</span>
                                    </div>
                                </div>

                                {item.erros && item.erros.length > 0 && (
                                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mb-3">
                                        {item.erros.slice(0, 2).join(', ')}
                                        {item.erros.length > 2 && ` +${item.erros.length - 2} mais`}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {confirmRevert === item.id ? (
                                        <>
                                            <button
                                                onClick={() => handleRevert(item)}
                                                className="flex-1 px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-lg"
                                            >
                                                Confirmar Reversão
                                            </button>
                                            <button
                                                onClick={() => setConfirmRevert(null)}
                                                className="px-3 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-lg"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmRevert(item.id)}
                                            className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            ↩️ Reverter
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
