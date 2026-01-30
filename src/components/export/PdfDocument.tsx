'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Transaction, Categoria, PdfExportConfig, getCategoryColor } from '@/types';

// Styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    header: {
        marginBottom: 30,
        borderBottom: '2px solid #3B82F6',
        paddingBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottom: '1px solid #E5E7EB',
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        minWidth: '30%',
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    summaryLabel: {
        fontSize: 9,
        color: '#6B7280',
        marginBottom: 3,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottom: '1px solid #F3F4F6',
    },
    categoryIcon: {
        width: 25,
        marginRight: 10,
    },
    categoryName: {
        flex: 1,
        fontSize: 11,
    },
    categoryValue: {
        fontSize: 11,
        fontWeight: 'bold',
        marginRight: 15,
    },
    categoryPercent: {
        fontSize: 10,
        color: '#6B7280',
        width: 40,
        textAlign: 'right',
    },
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        padding: 8,
        borderRadius: 4,
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#374151',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottom: '1px solid #F3F4F6',
    },
    tableCell: {
        fontSize: 9,
        color: '#4B5563',
    },
    colDate: { width: '15%' },
    colTitle: { width: '45%' },
    colCategory: { width: '20%' },
    colAmount: { width: '20%', textAlign: 'right' },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#9CA3AF',
    },
});

interface PdfDocumentProps {
    transactions: Transaction[];
    categories: Categoria[];
    config: PdfExportConfig;
    totals: Record<string, number>;
}

export function PdfDocument({ transactions, categories, config, totals }: PdfDocumentProps) {
    const formatCurrency = (value: number) => {
        return `R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`;
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

    // Filter transactions by config
    let filteredTransactions = transactions.filter((t) => t.categoryId !== null);

    if (config.dateStart) {
        filteredTransactions = filteredTransactions.filter((t) => t.date >= config.dateStart!);
    }
    if (config.dateEnd) {
        filteredTransactions = filteredTransactions.filter((t) => t.date <= config.dateEnd!);
    }
    if (config.categoryIds && config.categoryIds.length > 0) {
        filteredTransactions = filteredTransactions.filter(
            (t) => t.categoryId && config.categoryIds!.includes(t.categoryId)
        );
    }

    const grandTotal = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const avgTransaction = filteredTransactions.length > 0 ? grandTotal / filteredTransactions.length : 0;

    // Calculate category totals for filtered transactions
    const categoryTotals: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
        if (t.categoryId) {
            categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + Math.abs(t.amount);
        }
    });

    const getCategoryName = (id: string) => {
        const cat = categories.find((c) => c.id === id);
        return cat ? `${cat.icone} ${cat.nome}` : 'Desconhecida';
    };

    const now = new Date();
    const generatedAt = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    return (
        <Document>
            <Page size="A4" orientation={config.orientation} style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>📊 Relatório de Transações</Text>
                    <Text style={styles.subtitle}>
                        {config.dateStart && config.dateEnd
                            ? `Período: ${formatDate(config.dateStart)} - ${formatDate(config.dateEnd)}`
                            : 'Todas as transações'}
                    </Text>
                    <Text style={styles.subtitle}>Gerado em: {generatedAt}</Text>
                </View>

                {/* Summary Section */}
                {(config.type === 'resumo' || config.type === 'completo') && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📈 Resumo</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Total de Transações</Text>
                                <Text style={styles.summaryValue}>{filteredTransactions.length}</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Valor Total</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(grandTotal)}</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Média por Transação</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(avgTransaction)}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Category Distribution */}
                {(config.type === 'resumo' || config.type === 'completo') && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📊 Distribuição por Categoria</Text>
                        {categories
                            .filter((cat) => categoryTotals[cat.id] > 0)
                            .sort((a, b) => (categoryTotals[b.id] || 0) - (categoryTotals[a.id] || 0))
                            .map((cat) => {
                                const value = categoryTotals[cat.id] || 0;
                                const percentage = grandTotal > 0 ? (value / grandTotal) * 100 : 0;
                                return (
                                    <View key={cat.id} style={styles.categoryRow}>
                                        <Text style={styles.categoryIcon}>{cat.icone}</Text>
                                        <Text style={styles.categoryName}>{cat.nome}</Text>
                                        <Text style={styles.categoryValue}>{formatCurrency(value)}</Text>
                                        <Text style={styles.categoryPercent}>{percentage.toFixed(1)}%</Text>
                                    </View>
                                );
                            })}
                    </View>
                )}

                {/* Transactions Table */}
                {(config.type === 'completo' || config.type === 'por_categoria') && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📋 Transações Detalhadas</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, styles.colDate]}>Data</Text>
                                <Text style={[styles.tableHeaderCell, styles.colTitle]}>Descrição</Text>
                                <Text style={[styles.tableHeaderCell, styles.colCategory]}>Categoria</Text>
                                <Text style={[styles.tableHeaderCell, styles.colAmount]}>Valor</Text>
                            </View>
                            {filteredTransactions.slice(0, 50).map((t) => (
                                <View key={t.id} style={styles.tableRow}>
                                    <Text style={[styles.tableCell, styles.colDate]}>{formatDate(t.date)}</Text>
                                    <Text style={[styles.tableCell, styles.colTitle]}>{t.title.substring(0, 40)}</Text>
                                    <Text style={[styles.tableCell, styles.colCategory]}>
                                        {getCategoryName(t.categoryId || '')}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.colAmount]}>{formatCurrency(t.amount)}</Text>
                                </View>
                            ))}
                            {filteredTransactions.length > 50 && (
                                <Text style={{ fontSize: 9, color: '#9CA3AF', marginTop: 10, textAlign: 'center' }}>
                                    ... e mais {filteredTransactions.length - 50} transações
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Dashboard Financeiro • Relatório exportado automaticamente
                </Text>
            </Page>
        </Document>
    );
}
