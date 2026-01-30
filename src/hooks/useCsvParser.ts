'use client';

import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

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

// Helper function to parse currency based on format
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
            // pt-BR: 1.234,56 -> remove thousand separators (dots), replace decimal comma with dot
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else {
            // en-US: 1,234.56 -> remove thousand separators (commas), keep decimal dot
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

// Helper to parse raw data into rows
function parseRawData(
    data: string[][],
    currencyFormat: CurrencyFormat
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

    data.forEach((values, index) => {
        const [date, title, rawAmount] = values;

        const { amount, isValid: amountValid } = parseCurrencyValue(
            rawAmount || '',
            currencyFormat
        );

        const hasDate = Boolean(date && date.trim() !== '');
        const hasTitle = Boolean(title && title.trim() !== '');
        const isValid: boolean = hasDate && hasTitle && amountValid;

        let error: string | undefined;
        if (!hasDate) error = 'Data ausente';
        else if (!hasTitle) error = 'Descrição ausente';
        else if (!amountValid) error = 'Valor inválido';

        const parsedRow: ParsedRow = {
            id: uuidv4(),
            lineNumber: index + 1,
            date: date?.trim() || '',
            title: title?.trim() || '',
            amount,
            rawAmount: rawAmount?.trim() || '',
            isValid,
            error,
        };

        rows.push(parsedRow);

        if (isValid) {
            validCount++;
            totalAmount += amount;
        } else {
            invalidCount++;
        }
    });

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
                        currencyFormat
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
        [onComplete, onError]
    );

    // Re-parse with new currency format without re-reading file
    const reparseWithFormat = useCallback(
        (currencyFormat: CurrencyFormat) => {
            if (!rawDataRef.current) return;

            const { rows, validCount, invalidCount, totalAmount } = parseRawData(
                rawDataRef.current,
                currencyFormat
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
        []
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
