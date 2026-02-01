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
// Auto Category Rules Component
// ========================================
import { useAutoCategoryStore } from '@/store/autoCategoryStore';

function RulesManager() {
    const rules = useAutoCategoryStore((state) => state.rules);
    const addRule = useAutoCategoryStore((state) => state.addRule);
    const removeRule = useAutoCategoryStore((state) => state.removeRule);
    const toggleRule = useAutoCategoryStore((state) => state.toggleRule);
    const categories = useCategoryStore((state) => state.categories);

    const [term, setTerm] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!term || !categoryId) return;
        addRule(term, categoryId);
        setTerm('');
        setCategoryId('');
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Add Rule Form */}
            <form onSubmit={handleAdd} className="p-4 bg-blue-50/50 border-b border-blue-100 space-y-3">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Nova Regra</label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={term}
                                onChange={(e) => setTerm(e.target.value)}
                                placeholder="Se a descrição conter..."
                                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="w-1/3">
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="" disabled>Mover para...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icone} {cat.nome}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={!term || !categoryId}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            +
                        </button>
                    </div>
                </div>
            </form>

            {/* Rules List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {rules.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>Nenhuma regra definida.</p>
                        <p className="text-xs mt-1">Regras ajudam a classificar automaticamente novas transações.</p>
                    </div>
                ) : (
                    rules.map(rule => {
                        const targetCat = categories.find(c => c.id === rule.categoryId);
                        return (
                            <div key={rule.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <div className="flex flex-col">
                                        <div className="text-sm font-medium text-gray-700">
                                            "{rule.term}"
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <span>move para</span>
                                            <span
                                                className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium flex items-center gap-1"
                                                style={{ backgroundColor: targetCat?.cor + '20', color: targetCat?.cor }}
                                            >
                                                {targetCat?.icone} {targetCat?.nome || '???'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => toggleRule(rule.id)}
                                        className={`p-1.5 rounded-lg transition-colors ${rule.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        title={rule.active ? 'Desativar' : 'Ativar'}
                                    >
                                        {rule.active ? '✅' : '⏸️'}
                                    </button>
                                    <button
                                        onClick={() => removeRule(rule.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ========================================
// Category Manager Component
// ========================================

import { downloadBackup, restoreBackup } from '@/utils/backupManager';
import { saveToCloud, loadFromCloud } from '@/actions/sync';
import { useSession } from 'next-auth/react';
import { LoginButtons } from '../auth/LoginButtons';
import { useLimitsStore } from '@/store/limitsStore';

function CloudBackupManager() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveToCloud = async () => {
        if (!confirm('Isso irá SOBRESCREVER seus dados na nuvem com a configuração atual. Continuar?')) return;

        setIsLoading(true);
        try {
            const data = {
                categories: useCategoryStore.getState().categories,
                rules: useAutoCategoryStore.getState().rules,
                limits: useLimitsStore.getState().limits
            };

            await saveToCloud(data);
            alert('✅ Dados salvos na nuvem com sucesso!');
        } catch (error) {
            console.error(error);
            alert('❌ Erro ao salvar na nuvem. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadFromCloud = async () => {
        if (!confirm('Isso irá SUBSTITUIR sua configuração local pela da nuvem. Continuar?')) return;

        setIsLoading(true);
        try {
            const data = await loadFromCloud();

            if (!data) {
                alert('Nenhum dado encontrado na nuvem.');
                return;
            }

            // Restore logic consistent with file import
            if (data.categories.length > 0) useCategoryStore.getState().importCategories(data.categories);
            if (data.rules.length > 0) useAutoCategoryStore.getState().setRules(data.rules);
            if (data.limits.length > 0) useLimitsStore.getState().setLimits(data.limits);

            alert('✅ Configurações restauradas da nuvem!');
        } catch (error) {
            console.error(error);
            alert('❌ Erro ao carregar da nuvem.');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading') return <div className="p-4 text-center">Carregando...</div>;

    if (!session) {
        return (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">☁️</div>
                <h3 className="font-bold text-indigo-900 mb-2">Sincronização na Nuvem</h3>
                <p className="text-sm text-indigo-700 mb-6">
                    Faça login para salvar suas configurações e acessá-las de qualquer dispositivo.
                </p>
                <div className="max-w-xs mx-auto">
                    <LoginButtons />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                        ☁️ Nuvem ({session.user?.name?.split(' ')[0]})
                    </h3>
                    <p className="text-xs text-indigo-600">Seus dados seguros no Neon DB</p>
                </div>
                {/* Logout could go here if needed, but usually handled in header */}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleSaveToCloud}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Salvando...' : (
                        <><span>⬆️</span> Salvar na Nuvem</>
                    )}
                </button>
                <button
                    onClick={handleLoadFromCloud}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-white border border-indigo-200 text-indigo-700 font-medium rounded-xl hover:bg-indigo-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Carregando...' : (
                        <><span>⬇️</span> Baixar da Nuvem</>
                    )}
                </button>
            </div>
        </div>
    );
}

function BackupManager() {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = restoreBackup(event.target?.result as string);
            if (result.success) {
                alert(`${result.message}\n` +
                    `Categorias: ${result.stats?.categories}\n` +
                    `Regras: ${result.stats?.rules}\n` +
                    `Limites: ${result.stats?.limits}`
                );
            } else {
                alert(`Erro: ${result.message}`);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Backup Completo 📦</h3>
                <p className="text-sm text-blue-700 mb-4">
                    Salve todas as suas configurações (Categorias, Regras Automáticas e Limites) em um único arquivo.
                    Ideal para mover suas configurações entre navegadores ou garantir que seus dados não sejam perdidos.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={downloadBackup}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <span>📤</span> Exportar Dados
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                        <span>📥</span> Importar Dados
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImportChange}
                        className="hidden"
                        accept=".json"
                    />
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Atenção ⚠️</h3>
                <p className="text-sm text-yellow-700">
                    Ao importar um backup:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Novas categorias serão adicionadas (existentes serão mantidas).</li>
                        <li>Regras automáticas serão <strong>substituídas</strong> pelas do backup.</li>
                        <li>Limites e alertas serão <strong>substituídos</strong> pelos do backup.</li>
                    </ul>
                </p>
            </div>

            <CloudBackupManager />
        </div>
    );
}

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'categories' | 'rules' | 'backup';

export function CategoryManager({ isOpen, onClose }: CategoryManagerProps) {
    const categories = useCategoryStore((state) => state.categories);
    const deleteCategory = useCategoryStore((state) => state.deleteCategory);
    const toggleActive = useCategoryStore((state) => state.toggleActive);
    const getByCategoryId = useTransactionStore((state) => state.getByCategoryId);

    const [activeTab, setActiveTab] = useState<Tab>('categories');
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

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-white z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                    <span className="text-xl">⚙️</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Gerenciar</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            <button
                                onClick={() => setActiveTab('categories')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'categories'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Categorias
                            </button>
                            <button
                                onClick={() => setActiveTab('rules')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'rules'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Regras Automáticas 🤖
                            </button>
                            <button
                                onClick={() => setActiveTab('backup')}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'backup'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Backup 💾
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'categories' ? (
                            <div className="h-full flex flex-col">
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
                        ) : activeTab === 'rules' ? (
                            <RulesManager />
                        ) : (
                            <BackupManager />
                        )}
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
