'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Transaction } from '@/types';

interface HistoryState {
    past: Transaction[][];
    present: Transaction[];
    future: Transaction[][];
}

interface UseHistoryReturn {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => Transaction[] | null;
    redo: () => Transaction[] | null;
    pushState: (state: Transaction[]) => void;
    clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

export function useHistory(initialState: Transaction[] = []): UseHistoryReturn {
    const [history, setHistory] = useState<HistoryState>({
        past: [],
        present: initialState,
        future: [],
    });

    const isInitialMount = useRef(true);

    // Sync with external state changes (like from store)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
    }, []);

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    const pushState = useCallback((newState: Transaction[]) => {
        setHistory((current) => {
            // Don't push if state is the same
            if (JSON.stringify(current.present) === JSON.stringify(newState)) {
                return current;
            }

            const newPast = [...current.past, current.present].slice(-MAX_HISTORY_SIZE);

            return {
                past: newPast,
                present: newState,
                future: [], // Clear redo stack on new action
            };
        });
    }, []);

    const undo = useCallback((): Transaction[] | null => {
        let undoneState: Transaction[] | null = null;

        setHistory((current) => {
            if (current.past.length === 0) return current;

            const previousState = current.past[current.past.length - 1];
            const newPast = current.past.slice(0, -1);

            undoneState = previousState;

            return {
                past: newPast,
                present: previousState,
                future: [current.present, ...current.future].slice(0, MAX_HISTORY_SIZE),
            };
        });

        return undoneState;
    }, []);

    const redo = useCallback((): Transaction[] | null => {
        let redoneState: Transaction[] | null = null;

        setHistory((current) => {
            if (current.future.length === 0) return current;

            const nextState = current.future[0];
            const newFuture = current.future.slice(1);

            redoneState = nextState;

            return {
                past: [...current.past, current.present].slice(-MAX_HISTORY_SIZE),
                present: nextState,
                future: newFuture,
            };
        });

        return redoneState;
    }, []);

    const clearHistory = useCallback(() => {
        setHistory({
            past: [],
            present: history.present,
            future: [],
        });
    }, [history.present]);

    return {
        canUndo,
        canRedo,
        undo,
        redo,
        pushState,
        clearHistory,
    };
}
