/**
 * Date parsing and formatting utilities
 */

/**
 * Format a date string from YYYY-MM-DD to DD/MM/YYYY (Brazilian format)
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date string in DD/MM/YYYY format
 */
export function formatDateBR(dateStr: string): string {
    if (!dateStr || typeof dateStr !== 'string') {
        return '';
    }

    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

/**
 * Format a date string from DD/MM/YYYY to YYYY-MM-DD (ISO format)
 * @param dateStr - Date string in DD/MM/YYYY format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateISO(dateStr: string): string {
    if (!dateStr || typeof dateStr !== 'string') {
        return '';
    }

    try {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month}-${day}`;
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

/**
 * Parse a date string into a Date object
 * Supports both YYYY-MM-DD and DD/MM/YYYY formats
 * @param dateStr - Date string to parse
 * @returns Date object or null if invalid
 */
export function parseDate(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') {
        return null;
    }

    try {
        // Try YYYY-MM-DD format first
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const [year, month, day] = parts.map(Number);
                const date = new Date(year, month - 1, day);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }

        // Try DD/MM/YYYY format
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const [day, month, year] = parts.map(Number);
                const date = new Date(year, month - 1, day);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Check if a date string is valid
 * @param dateStr - Date string to validate
 * @returns True if the date is valid
 */
export function isValidDate(dateStr: string): boolean {
    return parseDate(dateStr) !== null;
}
