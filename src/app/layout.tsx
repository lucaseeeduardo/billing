import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import Providers from "@/components/auth/Providers";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Dashboard Financeiro | Classificação de Gastos',
    description: 'Dashboard interativo para classificação e análise de gastos via Drag-and-Drop',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
