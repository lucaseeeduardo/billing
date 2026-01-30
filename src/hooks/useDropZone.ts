'use client';

import { useState, useCallback, useRef, DragEvent } from 'react';

export type DropZoneStatus = 'idle' | 'hover' | 'processing' | 'success' | 'error';

interface UseDropZoneOptions {
    accept?: string[];
    maxSize?: number; // bytes
    onFileDrop?: (file: File) => void;
    onError?: (message: string) => void;
}

interface UseDropZoneReturn {
    status: DropZoneStatus;
    isDragging: boolean;
    error: string | null;
    file: File | null;
    getRootProps: () => {
        onDragEnter: (e: DragEvent) => void;
        onDragOver: (e: DragEvent) => void;
        onDragLeave: (e: DragEvent) => void;
        onDrop: (e: DragEvent) => void;
        onClick: () => void;
        onKeyDown: (e: React.KeyboardEvent) => void;
        tabIndex: number;
        role: string;
        'aria-label': string;
    };
    getInputProps: () => {
        ref: React.RefObject<HTMLInputElement>;
        type: 'file';
        accept: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        className: string;
    };
    setStatus: (status: DropZoneStatus) => void;
    clearFile: () => void;
}

export function useDropZone({
    accept = ['.csv'],
    maxSize = 5 * 1024 * 1024, // 5MB default
    onFileDrop,
    onError,
}: UseDropZoneOptions = {}): UseDropZoneReturn {
    const [status, setStatus] = useState<DropZoneStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const validateFile = useCallback(
        (file: File): string | null => {
            // Check file type
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!accept.includes(extension)) {
                return `Tipo de arquivo inválido. Aceitos: ${accept.join(', ')}`;
            }

            // Check file size
            if (file.size > maxSize) {
                const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
                return `Arquivo muito grande. Máximo: ${maxMB}MB`;
            }

            return null;
        },
        [accept, maxSize]
    );

    const handleFile = useCallback(
        (file: File) => {
            const validationError = validateFile(file);

            if (validationError) {
                setError(validationError);
                setStatus('error');
                onError?.(validationError);
                return;
            }

            setError(null);
            setFile(file);
            setStatus('processing');
            onFileDrop?.(file);
        },
        [validateFile, onFileDrop, onError]
    );

    const handleDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;

        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
            setStatus('hover');
        }
    }, []);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;

        if (dragCounter.current === 0) {
            setIsDragging(false);
            setStatus('idle');
        }
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            dragCounter.current = 0;

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                handleFile(files[0]);
            }
        },
        [handleFile]
    );

    const handleClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    }, [handleClick]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleFile(files[0]);
            }
            // Reset input to allow selecting same file again
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        },
        [handleFile]
    );

    const clearFile = useCallback(() => {
        setFile(null);
        setError(null);
        setStatus('idle');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, []);

    const getRootProps = useCallback(
        () => ({
            onDragEnter: handleDragEnter,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
            onClick: handleClick,
            onKeyDown: handleKeyDown,
            tabIndex: 0,
            role: 'button',
            'aria-label': 'Área de upload de arquivo. Clique ou arraste um arquivo CSV',
        }),
        [handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleClick, handleKeyDown]
    );

    const getInputProps = useCallback(
        () => ({
            ref: inputRef,
            type: 'file' as const,
            accept: accept.join(','),
            onChange: handleInputChange,
            className: 'hidden',
        }),
        [accept, handleInputChange]
    );

    return {
        status,
        isDragging,
        error,
        file,
        getRootProps,
        getInputProps,
        setStatus,
        clearFile,
    };
}
