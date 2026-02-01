
import { Categoria, LimiteCategoria, AutoCategoryRule } from '@/types';
import { useCategoryStore } from '@/store/categoryStore';
import { useAutoCategoryStore } from '@/store/autoCategoryStore';
import { useLimitsStore } from '@/store/limitsStore';

interface BackupData {
    version: number;
    date: string;
    categories: Categoria[];
    rules: AutoCategoryRule[];
    limits: LimiteCategoria[];
}

export const generateBackup = (): string => {
    const categories = useCategoryStore.getState().categories;
    const rules = useAutoCategoryStore.getState().rules;
    const limits = useLimitsStore.getState().limits;

    const backup: BackupData = {
        version: 1,
        date: new Date().toISOString(),
        categories,
        rules,
        limits,
    };

    return JSON.stringify(backup, null, 2);
};

export const restoreBackup = (jsonString: string): { success: boolean; message: string; stats?: { categories: number; rules: number; limits: number } } => {
    try {
        const data = JSON.parse(jsonString) as any;

        // Basic validation
        if (!data || typeof data !== 'object') {
            return { success: false, message: 'Arquivo inválido.' };
        }

        // Backward compatibility: If specific fields are missing, treat as empty array
        const categories = Array.isArray(data.categories) ? data.categories : [];
        const rules = Array.isArray(data.rules) ? data.rules : [];
        const limits = Array.isArray(data.limits) ? data.limits : [];

        // 1. Import Categories (Upsert)
        // Ensure all categories required by rules/limits exist, plus any explicitly saved categories
        if (categories.length > 0) {
            useCategoryStore.getState().importCategories(categories);
        }

        // 2. Set Rules
        if (rules.length > 0) {
            useAutoCategoryStore.getState().setRules(rules);
        }

        // 3. Set Limits
        if (limits.length > 0) {
            useLimitsStore.getState().setLimits(limits);
        }

        return {
            success: true,
            message: 'Backup restaurado com sucesso!',
            stats: {
                categories: categories.length,
                rules: rules.length,
                limits: limits.length
            }
        };

    } catch (e) {
        console.error('Import error:', e);
        return { success: false, message: 'Erro ao processar arquivo de backup.' };
    }
};

export const downloadBackup = () => {
    const json = generateBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `billing-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
