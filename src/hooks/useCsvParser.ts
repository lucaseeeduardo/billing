'use client';

import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import { useCategoryStore } from '@/store/categoryStore';
import { Categoria } from '@/types';

export type CurrencyFormat = 'pt-BR' | 'en-US';

export interface ParsedRow {
    id: string;
    lineNumber: number;
    date: string;
    title: string;
    amount: number;
    rawAmount: string;
    isValid: boolean;
    error?: string;
    categoryId: string | null;  // New field
    tags: string[];             // New field
}

export interface CsvParserState {
    status: 'idle' | 'parsing' | 'success' | 'error';
    rows: ParsedRow[];
    totalRows: number;
    validRows: number;
    invalidRows: number;
    totalAmount: number;
    error: string | null;
    progress: number;
}

interface UseCsvParserOptions {
    onComplete?: (rows: ParsedRow[]) => void;
    onError?: (error: string) => void;
}

// Common header patterns
const HEADER_PATTERNS = {
    date: /^(date|data|dt|fecha|created)/i,
    description: /^(desc|title|titulo|name|nome|texto|memo)/i,
    amount: /^(amount|valor|value|price|preco|total|v$)/i,
    category: /^(category|categoria|cat)/i,
    tags: /^(tags|labels|etiquetas)/i,
};

function parseCurrencyValue(
    value: string,
    format: CurrencyFormat
): { amount: number; isValid: boolean } {
    if (!value || value.trim() === '') {
        return { amount: 0, isValid: false };
    }

    let cleaned = value.trim();

    // Remove currency symbols and whitespace
    cleaned = cleaned.replace(/[R$€£¥\s]/g, '');

    try {
        if (format === 'pt-BR') {
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
            cleaned = cleaned.replace(/,/g, '');
        }

        const amount = parseFloat(cleaned);

        if (isNaN(amount)) {
            return { amount: 0, isValid: false };
        }

        return { amount, isValid: true };
    } catch {
        return { amount: 0, isValid: false };
    }
}

// Helper to find category ID by name or ID
function findCategory(value: string, categories: Categoria[]): string | null {
    if (!value) return null;
    const normalized = value.trim().toLowerCase();

    // 1. Try exact ID match
    const byId = categories.find(c => c.id === value.trim());
    if (byId) return byId.id;

    // 2. Try exact Name match (case-insensitive)
    const byName = categories.find(c => c.nome.toLowerCase() === normalized);
    if (byName) return byName.id;

    return null;
}

function parseRawData(
    data: string[][],
    currencyFormat: CurrencyFormat,
    categories: Categoria[]
): {
    rows: ParsedRow[];
    validCount: number;
    invalidCount: number;
    totalAmount: number;
} {
    const rows: ParsedRow[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let totalAmount = 0;

    if (data.length === 0) {
        return { rows, validCount, invalidCount, totalAmount };
    }

    // 1. Detect Headers in first row
    const firstRow = data[0];
    const headerMap: Record<string, number> = {};
    let hasHeaders = false;

    // Check if first row looks like headers (string values, not numbers/dates)
    // Simple heuristic: if any cell matches our header patterns
    let matches = 0;
    firstRow.forEach((cell, index) => {
        if (HEADER_PATTERNS.date.test(cell)) { headerMap.date = index; matches++; }
        else if (HEADER_PATTERNS.description.test(cell)) { headerMap.description = index; matches++; }
        else if (HEADER_PATTERNS.amount.test(cell)) { headerMap.amount = index; matches++; }
        else if (HEADER_PATTERNS.category.test(cell)) { headerMap.category = index; matches++; }
        else if (HEADER_PATTERNS.tags.test(cell)) { headerMap.tags = index; matches++; }
    });

    if (matches >= 2) { // strict heuristic: at least 2 matches to confirm headers
        hasHeaders = true;
    }

    const startIndex = hasHeaders ? 1 : 0;

    // Default indices if no headers found (positional: date, desc, amount)
    const idxDate = hasHeaders ? headerMap.date : 0;
    const idxDesc = hasHeaders ? headerMap.description : 1;
    const idxAmount = hasHeaders ? headerMap.amount : 2;
    const idxCategory = hasHeaders ? headerMap.category : -1;
    const idxTags = hasHeaders ? headerMap.tags : -1;

    for (let i = startIndex; i < data.length; i++) {
        const values = data[i];

        // Skip empty rows
        if (values.length <= 1 && values[0].trim() === '') continue;

        const rawDate = values[idxDate];
        const rawTitle = values[idxDesc];
        const rawAmount = values[idxAmount];
        const rawCategory = idxCategory !== -1 ? values[idxCategory] : '';
        const rawTags = idxTags !== -1 ? values[idxTags] : '';

        const { amount, isValid: amountValid } = parseCurrencyValue(
            rawAmount || '',
            currencyFormat
        );

        const hasDate = Boolean(rawDate && rawDate.trim() !== '');
        const hasTitle = Boolean(rawTitle && rawTitle.trim() !== '');
        const isValid: boolean = hasDate && hasTitle && amountValid;

        let error: string | undefined;
        if (!hasDate) error = 'Data ausente';
        else if (!hasTitle) error = 'Descrição ausente';
        else if (!amountValid) error = 'Valor inválido';

        // Resolve Category
        const categoryId = isValid ? findCategory(rawCategory, categories) : null;

        // Parse Tags (comma separated)
        const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : [];

        const parsedRow: ParsedRow = {
            id: uuidv4(),
            lineNumber: i + 1,
            date: rawDate?.trim() || '',
            title: rawTitle?.trim() || '',
            amount,
            rawAmount: rawAmount?.trim() || '',
            isValid,
            error,
            categoryId,
            tags
        };

        rows.push(parsedRow);

        if (isValid) {
            validCount++;
            totalAmount += amount;
        } else {
            invalidCount++;
        }
    }

    return { rows, validCount, invalidCount, totalAmount };
}

export function useCsvParser({
    onComplete,
    onError,
}: UseCsvParserOptions = {}) {
    const [state, setState] = useState<CsvParserState>({
        status: 'idle',
        rows: [],
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        totalAmount: 0,
        error: null,
        progress: 0,
    });

    const categories = useCategoryStore((state) => state.categories);

    // Store raw data for re-parsing
    const rawDataRef = useRef<string[][] | null>(null);
    const currentFileRef = useRef<File | null>(null);

    const parseFile = useCallback(
        (file: File, currencyFormat: CurrencyFormat) => {
            currentFileRef.current = file;

            setState((prev) => ({
                ...prev,
                status: 'parsing',
                rows: [],
                error: null,
                progress: 0,
            }));

            Papa.parse(file, {
                header: false,
                skipEmptyLines: true,
                complete: (results) => {
                    const data = results.data as string[][];
                    rawDataRef.current = data;

                    const { rows, validCount, invalidCount, totalAmount } = parseRawData(
                        data,
                        currencyFormat,
                        categories
                    );

                    setState({
                        status: 'success',
                        rows,
                        totalRows: rows.length,
                        validRows: validCount,
                        invalidRows: invalidCount,
                        totalAmount,
                        error: null,
                        progress: 100,
                    });

                    onComplete?.(rows);
                },
                error: (error) => {
                    const errorMessage = `Erro ao processar CSV: ${error.message}`;
                    setState((prev) => ({
                        ...prev,
                        status: 'error',
                        error: errorMessage,
                        progress: 0,
                    }));
                    onError?.(errorMessage);
                },
            });
        },
        [onComplete, onError, categories]
    );

    // Re-parse with new currency format without re-reading file
    const reparseWithFormat = useCallback(
        (currencyFormat: CurrencyFormat) => {
            if (!rawDataRef.current) return;

            const { rows, validCount, invalidCount, totalAmount } = parseRawData(
                rawDataRef.current,
                currencyFormat,
                categories
            );

            setState({
                status: 'success',
                rows,
                totalRows: rows.length,
                validRows: validCount,
                invalidRows: invalidCount,
                totalAmount,
                error: null,
                progress: 100,
            });
        },
        [categories]
    );

    const removeRow = useCallback((id: string) => {
        setState((prev) => {
            const row = prev.rows.find((r) => r.id === id);
            if (!row) return prev;

            const newRows = prev.rows.filter((r) => r.id !== id);

            return {
                ...prev,
                rows: newRows,
                totalRows: newRows.length,
                validRows: row.isValid ? prev.validRows - 1 : prev.validRows,
                invalidRows: row.isValid ? prev.invalidRows : prev.invalidRows - 1,
                totalAmount: row.isValid ? prev.totalAmount - row.amount : prev.totalAmount,
            };
        });
    }, []);

    const reset = useCallback(() => {
        rawDataRef.current = null;
        currentFileRef.current = null;
        setState({
            status: 'idle',
            rows: [],
            totalRows: 0,
            validRows: 0,
            invalidRows: 0,
            totalAmount: 0,
            error: null,
            progress: 0,
        });
    }, []);

    const getValidRows = useCallback(() => {
        return state.rows.filter((r) => r.isValid);
    }, [state.rows]);

    return {
        ...state,
        parseFile,
        reparseWithFormat,
        removeRow,
        reset,
        getValidRows,
        hasData: rawDataRef.current !== null,
    };
}
