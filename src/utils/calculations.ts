/**
 * Calculation utilities for financial aggregations
 */

import { Transaction, Categoria } from '@/types';
import { sumValues } from './currency';

/**
 * Calculate the total amount from an array of transactions
 * @param transactions - Array of transactions
 * @returns The total sum
 */
export function calculateTotal(transactions: Transaction[]): number {
    if (!transactions || transactions.length === 0) {
        return 0;
    }

    const amounts = transactions.map((t) => t.amount);
    return sumValues(amounts);
}

/**
 * Calculate totals grouped by category (dynamic)
 * @param transactions - Array of transactions
 * @param categories - Array of categories
 * @returns Record of categoryId to total amount
 */
export function calculateCategoryTotals(
    transactions: Transaction[],
    categories: Categoria[]
): Record<string, number> {
    const totals: Record<string, number> = {};

    // Initialize all categories with 0
    categories.forEach((cat) => {
        totals[cat.id] = 0;
    });

    if (!transactions || transactions.length === 0) {
        return totals;
    }

    // Group transactions by categoryId
    const grouped: Record<string, number[]> = {};
    categories.forEach((cat) => {
        grouped[cat.id] = [];
    });

    transactions.forEach((t) => {
        if (t.categoryId && grouped[t.categoryId]) {
            grouped[t.categoryId].push(t.amount);
        }
    });

    // Sum each category using precise sumValues
    categories.forEach((cat) => {
        totals[cat.id] = sumValues(grouped[cat.id] || []);
    });

    return totals;
}

/**
 * Calculate percentages from totals
 * Ensures percentages sum to exactly 100% (or 0% if no data)
 * @param totals - Record of keys to amounts
 * @returns Record of keys to percentages
 */
export function calculatePercentages<T extends string>(
    totals: Record<T, number>
): Record<T, number> {
    const keys = Object.keys(totals) as T[];
    const total = sumValues(Object.values(totals));

    const result = {} as Record<T, number>;

    if (total === 0) {
        keys.forEach((key) => {
            result[key] = 0;
        });
        return result;
    }

    // Calculate percentages
    let sum = 0;
    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            // Last item gets the remainder to ensure 100% total
            result[key] = Math.round((100 - sum) * 100) / 100;
        } else {
            const percentage = Math.round((totals[key] / total) * 10000) / 100;
            result[key] = percentage;
            sum += percentage;
        }
    });

    return result;
}

/**
 * Calculate average of an array of numbers
 * @param values - Array of numbers
 * @returns The average, or 0 if empty
 */
export function calculateAverage(values: number[]): number {
    if (!values || values.length === 0) {
        return 0;
    }

    const total = sumValues(values);
    return Math.round((total / values.length) * 100) / 100;
}

/**
 * Count transactions by category (dynamic)
 * @param transactions - Array of transactions
 * @param categories - Array of categories
 * @returns Record of categoryId to count
 */
export function countByCategory(
    transactions: Transaction[],
    categories: Categoria[]
): Record<string, number> {
    const counts: Record<string, number> = {};

    categories.forEach((cat) => {
        counts[cat.id] = 0;
    });

    if (!transactions) {
        return counts;
    }

    transactions.forEach((t) => {
        if (t.categoryId && counts[t.categoryId] !== undefined) {
            counts[t.categoryId]++;
        }
    });

    return counts;
}
