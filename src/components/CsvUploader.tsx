'use client';

import React, { useState } from 'react';
import { CsvUploadModal } from './CsvUploadModal';

export function CsvUploader() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 
                   text-white font-medium rounded-xl shadow-lg shadow-blue-500/25
                   hover:from-blue-600 hover:to-blue-700 transition-all duration-200
                   hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
                Importar CSV
            </button>

            <CsvUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
