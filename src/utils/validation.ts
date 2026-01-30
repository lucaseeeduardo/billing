/**
 * File validation utilities
 */

/**
 * Validate file extension against a list of accepted extensions
 * @param filename - The file name to validate
 * @param acceptedExtensions - Array of accepted extensions (e.g., ['.csv', '.txt'])
 * @returns True if the extension is accepted
 */
export function validateFileExtension(
    filename: string,
    acceptedExtensions: string[]
): boolean {
    if (!filename || !acceptedExtensions || acceptedExtensions.length === 0) {
        return false;
    }

    const extension = '.' + filename.split('.').pop()?.toLowerCase();
    return acceptedExtensions
        .map((ext) => ext.toLowerCase())
        .includes(extension);
}

/**
 * Validate file size against a maximum limit
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if the file size is within the limit
 */
export function validateFileSize(size: number, maxSize: number): boolean {
    if (typeof size !== 'number' || typeof maxSize !== 'number') {
        return false;
    }

    if (size < 0 || maxSize <= 0) {
        return false;
    }

    return size <= maxSize;
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Check if a file is a valid CSV file
 * @param file - File object to validate
 * @param maxSize - Maximum allowed size in bytes (default 5MB)
 * @returns Validation result with error message if invalid
 */
export function validateCsvFile(
    file: File,
    maxSize: number = 5 * 1024 * 1024
): { isValid: boolean; error?: string } {
    if (!file) {
        return { isValid: false, error: 'Nenhum arquivo selecionado' };
    }

    if (!validateFileExtension(file.name, ['.csv'])) {
        return {
            isValid: false,
            error: 'Tipo de arquivo inválido. Apenas arquivos .csv são aceitos'
        };
    }

    if (!validateFileSize(file.size, maxSize)) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
        return {
            isValid: false,
            error: `Arquivo muito grande. Máximo: ${maxMB}MB`
        };
    }

    return { isValid: true };
}
