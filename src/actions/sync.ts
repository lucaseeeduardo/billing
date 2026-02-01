
'use server'

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { Categoria, AutoCategoryRule, LimiteCategoria } from "@/types"

// Sync Data Structure
interface SyncData {
    categories: Categoria[];
    rules: AutoCategoryRule[];
    limits: LimiteCategoria[];
}

export async function saveToCloud(data: SyncData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Usuário não autenticado");
    }

    const userId = session.user.id;
    const { categories, rules, limits } = data;

    try {
        // Transaction to ensure data integrity
        await prisma.$transaction(async (tx) => {

            // 1. Sync Categories
            // Strategy: Upsert based on ID. Categories present in DB but not in payload are NOT deleted (Local-first principle, maybe archived later?)
            // For now, let's just Upsert all provided categories.
            for (const cat of categories) {
                await tx.category.upsert({
                    where: { id: cat.id },
                    update: {
                        name: cat.nome,
                        icon: cat.icone,
                        color: cat.cor,
                        description: cat.descricao,
                        active: cat.ativo,
                        isDefault: cat.isDefault ?? false, // Handle optional
                        archived: false, // Ensure unarchived if saving active
                        updatedAt: new Date(),
                    },
                    create: {
                        id: cat.id,
                        userId: userId,
                        name: cat.nome,
                        icon: cat.icone,
                        color: cat.cor,
                        description: cat.descricao,
                        active: cat.ativo,
                        isDefault: cat.isDefault ?? false,
                        archived: false
                    }
                });
            }

            // 2. Sync Rules
            // Strategy: Delete all existing rules for user and insert new ones to guarantee full sync
            // This is safer for simple lists like rules
            await tx.autoCategoryRule.deleteMany({
                where: { userId: userId }
            });

            if (rules.length > 0) {
                await tx.autoCategoryRule.createMany({
                    data: rules.map(rule => ({
                        id: rule.id,
                        userId: userId,
                        categoryId: rule.categoryId,
                        term: rule.term,
                        active: rule.active
                    }))
                });
            }

            // 3. Sync Limits
            // Strategy: Delete all limits and re-insert or Upsert. 
            // Since limits are unique per category, let's upsert to act cleaner.
            for (const limit of limits) {
                await tx.categoryLimit.upsert({
                    where: {
                        userId_categoryId: {
                            userId: userId,
                            categoryId: limit.categoriaId
                        }
                    },
                    update: {
                        limitValue: limit.valorLimite,
                        period: limit.periodoLimite,
                        notify: limit.notificar,
                        alertPercent: limit.percentualAlerta
                    },
                    create: {
                        userId: userId,
                        categoryId: limit.categoriaId,
                        limitValue: limit.valorLimite,
                        period: limit.periodoLimite,
                        notify: limit.notificar,
                        alertPercent: limit.percentualAlerta
                    }
                });
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Cloud Sync Error:", error);
        throw new Error("Falha ao salvar na nuvem.");
    }
}

export async function loadFromCloud(): Promise<SyncData | null> {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const userId = session.user.id;

    try {
        const [categories, rules, limits] = await Promise.all([
            prisma.category.findMany({
                where: {
                    userId: userId,
                    archived: false
                }
            }),
            prisma.autoCategoryRule.findMany({ where: { userId: userId } }),
            prisma.categoryLimit.findMany({ where: { userId: userId } })
        ]);

        // Map DB models to App types
        const mapCategories: Categoria[] = categories.map(c => ({
            id: c.id,
            nome: c.name,
            icone: c.icon,
            cor: c.color,
            descricao: c.description || undefined,
            ativo: c.active,
            isDefault: c.isDefault,
            createdAt: c.createdAt.toISOString()
        }));

        const mapRules: AutoCategoryRule[] = rules.map(r => ({
            id: r.id,
            term: r.term,
            categoryId: r.categoryId,
            active: r.active
        }));

        const mapLimits: LimiteCategoria[] = limits.map(l => ({
            id: l.id,
            categoriaId: l.categoryId,
            valorLimite: Number(l.limitValue),
            periodoLimite: l.period as any,
            notificar: l.notify,
            percentualAlerta: l.alertPercent
        }));

        return {
            categories: mapCategories,
            rules: mapRules,
            limits: mapLimits
        };

    } catch (error) {
        console.error("Cloud Load Error:", error);
        throw new Error("Falha ao carregar da nuvem.");
    }
}
