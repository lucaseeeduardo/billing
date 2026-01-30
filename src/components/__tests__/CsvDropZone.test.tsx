/**
 * CsvDropZone component tests
 * Tests for file upload states and interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CsvDropZone } from '../CsvDropZone';

// Mock useDropZone hook
const mockSetStatus = jest.fn();
const mockClearFile = jest.fn();
const mockGetRootProps = jest.fn(() => ({
    onDragEnter: jest.fn(),
    onDragOver: jest.fn(),
    onDragLeave: jest.fn(),
    onDrop: jest.fn(),
    onClick: jest.fn(),
    onKeyDown: jest.fn(),
    tabIndex: 0,
    role: 'button',
    'aria-label': 'Área de upload',
}));
const mockGetInputProps = jest.fn(() => ({
    ref: { current: null },
    type: 'file',
    accept: '.csv',
    onChange: jest.fn(),
    className: 'hidden',
}));

jest.mock('@/hooks/useDropZone', () => ({
    useDropZone: jest.fn(() => ({
        status: 'idle',
        error: null,
        file: null,
        getRootProps: mockGetRootProps,
        getInputProps: mockGetInputProps,
        setStatus: mockSetStatus,
        clearFile: mockClearFile,
    })),
}));

import { useDropZone } from '@/hooks/useDropZone';

describe('CsvDropZone', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Estado Idle', () => {
        test('mostra instrução de arrastar arquivo', () => {
            render(<CsvDropZone onFileSelect={jest.fn()} />);
            expect(screen.getByText('Arraste seu arquivo CSV')).toBeInTheDocument();
        });

        test('mostra opção de clicar para selecionar', () => {
            render(<CsvDropZone onFileSelect={jest.fn()} />);
            expect(screen.getByText('clique para selecionar')).toBeInTheDocument();
        });

        test('mostra restrições de arquivo', () => {
            render(<CsvDropZone onFileSelect={jest.fn()} />);
            expect(screen.getByText('Apenas .csv')).toBeInTheDocument();
            expect(screen.getByText('Máx. 5MB')).toBeInTheDocument();
        });
    });

    describe('Estado Hover', () => {
        test('mostra texto de soltar arquivo', () => {
            (useDropZone as jest.Mock).mockReturnValue({
                status: 'hover',
                error: null,
                file: null,
                getRootProps: mockGetRootProps,
                getInputProps: mockGetInputProps,
                setStatus: mockSetStatus,
                clearFile: mockClearFile,
            });

            render(<CsvDropZone onFileSelect={jest.fn()} />);
            expect(screen.getByText('Solte o arquivo aqui')).toBeInTheDocument();
        });
    });

    describe('Estado Processing', () => {
        test('mostra indicador de processamento', () => {
            (useDropZone as jest.Mock).mockReturnValue({
                status: 'processing',
                error: null,
                file: null,
                getRootProps: mockGetRootProps,
                getInputProps: mockGetInputProps,
                setStatus: mockSetStatus,
                clearFile: mockClearFile,
            });

            render(<CsvDropZone onFileSelect={jest.fn()} />);
            expect(screen.getByText('Processando...')).toBeInTheDocument();
            expect(screen.getByText('Analisando arquivo CSV')).toBeInTheDocument();
        });
    });

    describe('Estado Success', () => {
        test('mostra nome do arquivo carregado', () => {
            (useDropZone as jest.Mock).mockReturnValue({
                status: 'success',
                error: null,
                file: { name: 'dados.csv' },
                getRootProps: mockGetRootProps,
                getInputProps: mockGetInputProps,
                setStatus: mockSetStatus,
                clearFile: mockClearFile,
            });

            render(<CsvDropZone onFileSelect={jest.fn()} />);
            expect(screen.getByText('Arquivo carregado!')).toBeInTheDocument();
            expect(screen.getByText('dados.csv')).toBeInTheDocument();
        });

        test('usa fileName prop quando fornecido', () => {
            (useDropZone as jest.Mock).mockReturnValue({
                status: 'success',
                error: null,
                file: { name: 'dados.csv' },
                getRootProps: mockGetRootProps,
                getInputProps: mockGetInputProps,
                setStatus: mockSetStatus,
                clearFile: mockClearFile,
            });

            render(<CsvDropZone onFileSelect={jest.fn()} fileName="custom.csv" />);
            expect(screen.getByText('custom.csv')).toBeInTheDocument();
        });
    });

    describe('Estado Error', () => {
        test('mostra mensagem de erro', () => {
            (useDropZone as jest.Mock).mockReturnValue({
                status: 'error',
                error: 'Tipo de arquivo inválido',
                file: null,
                getRootProps: mockGetRootProps,
                getInputProps: mockGetInputProps,
                setStatus: mockSetStatus,
                clearFile: mockClearFile,
            });

            render(<CsvDropZone onFileSelect={jest.fn()} />);
            expect(screen.getByText('Erro no upload')).toBeInTheDocument();
            expect(screen.getByText('Tipo de arquivo inválido')).toBeInTheDocument();
        });

        test('mostra botão de tentar novamente', () => {
            (useDropZone as jest.Mock).mockReturnValue({
                status: 'error',
                error: 'Erro',
                file: null,
                getRootProps: mockGetRootProps,
                getInputProps: mockGetInputProps,
                setStatus: mockSetStatus,
                clearFile: mockClearFile,
            });

            render(<CsvDropZone onFileSelect={jest.fn()} />);
            expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
        });
    });

    describe('Disabled State', () => {
        test('aplica estilo de desabilitado', () => {
            // Reset to idle state for this test
            (useDropZone as jest.Mock).mockReturnValue({
                status: 'idle',
                error: null,
                file: null,
                getRootProps: mockGetRootProps,
                getInputProps: mockGetInputProps,
                setStatus: mockSetStatus,
                clearFile: mockClearFile,
            });

            const { container } = render(<CsvDropZone onFileSelect={jest.fn()} disabled={true} />);

            const dropzone = container.querySelector('[role="button"]');
            expect(dropzone?.className).toContain('opacity-50');
            expect(dropzone?.className).toContain('cursor-not-allowed');
        });
    });

    describe('Interações', () => {
        test('chama onClear quando botão de limpar é clicado', () => {
            const onClear = jest.fn();
            (useDropZone as jest.Mock).mockReturnValue({
                status: 'success',
                error: null,
                file: { name: 'dados.csv' },
                getRootProps: mockGetRootProps,
                getInputProps: mockGetInputProps,
                setStatus: mockSetStatus,
                clearFile: mockClearFile,
            });

            render(<CsvDropZone onFileSelect={jest.fn()} onClear={onClear} />);

            const clearButton = screen.getByTitle('Remover arquivo');
            fireEvent.click(clearButton);

            expect(mockClearFile).toHaveBeenCalled();
            expect(onClear).toHaveBeenCalled();
            expect(mockSetStatus).toHaveBeenCalledWith('idle');
        });
    });
});
