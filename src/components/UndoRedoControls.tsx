'use client';

import React from 'react';

interface UndoRedoControlsProps {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export function UndoRedoControls({ canUndo, canRedo, onUndo, onRedo }: UndoRedoControlsProps) {
    return (
        <div className="flex items-center gap-1">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                title="Desfazer (Ctrl+Z)"
                className={`
                    p-2 rounded-lg transition-all duration-200
                    ${canUndo
                        ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        : 'text-gray-300 cursor-not-allowed'
                    }
                `}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <button
                onClick={onRedo}
                disabled={!canRedo}
                title="Refazer (Ctrl+Shift+Z)"
                className={`
                    p-2 rounded-lg transition-all duration-200
                    ${canRedo
                        ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                        : 'text-gray-300 cursor-not-allowed'
                    }
                `}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 00-5 5v2a1 1 0 11-2 0v-2a7 7 0 017-7h5.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    );
}
