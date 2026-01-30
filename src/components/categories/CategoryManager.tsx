'use client';

import React, { useState } from 'react';
import { Categoria, CATEGORY_ICONS, CATEGORY_COLOR_PRESETS } from '@/types';
import { useCategoryStore } from '@/store/categoryStore';
import { useTransactionStore } from '@/store/transactionStore';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Categoria;
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
    const addCategory = useCategoryStore((state) => state.addCategory);
    const updateCategory = useCategoryStore((state) => state.updateCategory);

    const [nome, setNome] = useState(category?.nome || '');
    const [icone, setIcone] = useState(category?.icone || '📦');
    const [cor, setCor] = useState(category?.cor || CATEGORY_COLOR_PRESETS[0]);
    const [descricao, setDescricao] = useState(category?.descricao || '');

    const isEditing = !!category;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!nome.trim()) return;

        if (isEditing) {
            updateCategory(category.id, { nome, icone, cor, descricao });
        } else {
            addCategory({ nome, icone, cor, descricao, ativo: true });
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Nome da Categoria
                        </label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Transporte"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all"
                            required
                        />
                    </div>

                    {/* Icone Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ícone
                        </label>
                        <div className="grid grid-cols-10 gap-1">
                            {CATEGORY_ICONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setIcone(emoji)}
                                    className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center
                              transition-all hover:scale-110
                              ${icone === emoji
                                            ? 'bg-blue-100 ring-2 ring-blue-500'
                                            : 'hover:bg-gray-100'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Cor
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1.5">
                                {CATEGORY_COLOR_PRESETS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setCor(color)}
                                        className={`w-7 h-7 rounded-full transition-all hover:scale-110
                                ${cor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                               `}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <input
                                type="color"
                                value={cor}
                                onChange={(e) => setCor(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Descrição (opcional)
                        </label>
                        <textarea
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Descrição da categoria..."
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all resize-none"
                        />
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium"
                            style={{ backgroundColor: cor + '30', color: cor }}
                        >
                            <span>{icone}</span>
                            <span>{nome || 'Nome da Categoria'}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl
                         text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600
                         text-white font-medium rounded-xl shadow-lg
                         hover:shadow-xl transition-all hover:-translate-y-0.5"
                        >
                            {isEditing ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ========================================
// Category Manager Component
// ========================================

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
    const categories = useCategoryStore((state) => state.categories);
    const deleteCategory = useCategoryStore((state) => state.deleteCategory);
    const toggleActive = useCategoryStore((state) => state.toggleActive);
    const getByCategoryId = useTransactionStore((state) => state.getByCategoryId);

    const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        const transactionCount = getByCategoryId(id).length;
        if (transactionCount > 0) {
            alert(`Não é possível excluir: ${transactionCount} transações usam esta categoria.`);
            return;
        }

        const success = deleteCategory(id);
        if (!success) {
            alert('Categoria padrão não pode ser excluída.');
        }
        setDeleteConfirm(null);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <span className="text-xl">⚙️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Gerenciar Categorias</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {categories.map((cat) => {
                            const count = getByCategoryId(cat.id).length;
                            return (
                                <div
                                    key={cat.id}
                                    className={`p-4 rounded-xl border-2 transition-all
                              ${cat.ativo ? 'border-gray-200 bg-white' : 'border-dashed border-gray-300 bg-gray-50 opacity-60'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                                                style={{ backgroundColor: cat.cor + '20' }}
                                            >
                                                {cat.icone}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{cat.nome}</div>
                                                <div className="text-sm text-gray-500">
                                                    <span
                                                        className="inline-block w-3 h-3 rounded-full mr-1"
                                                        style={{ backgroundColor: cat.cor }}
                                                    />
                                                    {count} {count === 1 ? 'transação' : 'transações'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {/* Toggle Active */}
                                            <button
                                                onClick={() => toggleActive(cat.id)}
                                                className={`p-2 rounded-lg transition-colors
                                    ${cat.ativo ? 'hover:bg-gray-100' : 'hover:bg-green-100'}`}
                                                title={cat.ativo ? 'Desativar' : 'Ativar'}
                                            >
                                                {cat.ativo ? '👁️' : '👁️‍🗨️'}
                                            </button>

                                            {/* Edit */}
                                            <button
                                                onClick={() => setEditingCategory(cat)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>

                                            {/* Delete */}
                                            {!cat.isDefault && (
                                                deleteConfirm === cat.id ? (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleDelete(cat.id)}
                                                            className="px-2 py-1 bg-red-500 text-white text-xs rounded-lg"
                                                        >
                                                            Confirmar
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setDeleteConfirm(cat.id)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        🗑️
                                                    </button>
                                                )
                                            )}
                                            {cat.isDefault && (
                                                <span className="p-2" title="Categoria padrão">🔒</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600
                         text-white font-medium rounded-xl shadow-lg
                         hover:shadow-xl transition-all hover:-translate-y-0.5
                         flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">+</span>
                            Nova Categoria
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <CategoryModal
                isOpen={!!editingCategory}
                onClose={() => setEditingCategory(null)}
                category={editingCategory || undefined}
            />

            {/* New Modal */}
            <CategoryModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
            />
        </>
    );
}
