// ==========================================
// CATEGORY TYPES
// ==========================================

export interface Categoria {
    id: string;
    nome: string;
    icone: string;
    cor: string;
    descricao?: string;
    ativo: boolean;
    createdAt: string;
    isDefault?: boolean;
}

// Default categories for initialization
export const DEFAULT_CATEGORIES: Categoria[] = [
    { id: 'transporte', nome: 'Transporte', icone: '🚗', cor: '#3B82F6', ativo: true, createdAt: new Date().toISOString(), isDefault: false },
    { id: 'restaurante', nome: 'Restaurante', icone: '🍔', cor: '#F97316', ativo: true, createdAt: new Date().toISOString(), isDefault: false },
    { id: 'mercado', nome: 'Mercado', icone: '🛒', cor: '#22C55E', ativo: true, createdAt: new Date().toISOString(), isDefault: false },
    { id: 'outros', nome: 'Outros', icone: '📦', cor: '#8B5CF6', ativo: true, createdAt: new Date().toISOString(), isDefault: true },
];

// Legacy category type for backward compatibility
export type LegacyCategory = 'Transporte' | 'Restaurante' | 'Mercado' | 'Outros';

// Map legacy category names to new IDs
export const LEGACY_CATEGORY_MAP: Record<LegacyCategory, string> = {
    Transporte: 'transporte',
    Restaurante: 'restaurante',
    Mercado: 'mercado',
    Outros: 'outros',
};

// ==========================================
// TRANSACTION TYPES
// ==========================================

export interface Transaction {
    id: string;
    date: string;
    title: string;
    amount: number;
    categoryId: string | null;
    tags?: string[];
    importId?: string; // Links to import history
}

// ==========================================
// IMPORT HISTORY TYPES
// ==========================================

export interface ImportacaoHistorico {
    id: string;
    nomeArquivo: string;
    dataImportacao: string;
    quantidadeItens: number;
    valorTotal: number;
    status: 'sucesso' | 'parcial' | 'erro';
    erros?: string[];
    itensIds: string[];
}

// ==========================================
// LIMITS & ALERTS TYPES
// ==========================================

export interface LimiteCategoria {
    id: string;
    categoriaId: string;
    valorLimite: number;
    periodoLimite: 'mensal' | 'semanal' | 'diario';
    notificar: boolean;
    percentualAlerta: number;
}

export interface Alerta {
    id: string;
    categoriaId: string;
    tipo: 'aviso' | 'limite_excedido';
    mensagem: string;
    percentual: number;
    dataAlerta: string;
}

// ==========================================
// FILTER TYPES
// ==========================================

export type TextFilterMode = 'contains' | 'starts' | 'ends';

export interface AdvancedFilterState {
    text: string;
    textMode: TextFilterMode;
    categoryIds: string[];
    valueMin: number | null;
    valueMax: number | null;
    dateStart: string | null;
    dateEnd: string | null;
    tags: string[];
}

export interface SavedFilter {
    id: string;
    name: string;
    filter: AdvancedFilterState;
    createdAt: string;
}

// ==========================================
// PDF EXPORT TYPES
// ==========================================

export type PdfExportType = 'resumo' | 'completo' | 'por_categoria';
export type PdfOrientation = 'portrait' | 'landscape';

export interface PdfExportConfig {
    type: PdfExportType;
    orientation: PdfOrientation;
    dateStart: string | null;
    dateEnd: string | null;
    categoryIds: string[] | null;
    includeLogo: boolean;
    logoUrl?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getCategoryColor(categoria: Categoria): { main: string; light: string; text: string } {
    const hex = categoria.cor;
    // Generate lighter version
    const light = hex + '30';
    // Generate text color (darker version)
    return {
        main: hex,
        light,
        text: hex,
    };
}

// Icon options for category picker
export const CATEGORY_ICONS = [
    '🚗', '🍔', '🛒', '📦', '💼', '🏠', '⚡', '📱', '💊', '🎮',
    '👕', '🎬', '✈️', '🏥', '📚', '🎁', '💇', '🛠️', '🌐', '💳',
    '🎵', '🍕', '☕', '🚌', '🏦', '💡', '🔧', '📧', '🎯', '💰',
];

// Color presets for category picker
export const CATEGORY_COLOR_PRESETS = [
    '#3B82F6', '#F97316', '#22C55E', '#8B5CF6', '#EF4444',
    '#06B6D4', '#EC4899', '#F59E0B', '#10B981', '#6366F1',
    '#84CC16', '#14B8A6', '#F43F5E', '#8B5CF6', '#64748B',
];
