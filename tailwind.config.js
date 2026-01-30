/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                transporte: {
                    DEFAULT: '#3B82F6',
                    light: '#DBEAFE',
                },
                restaurante: {
                    DEFAULT: '#F97316',
                    light: '#FED7AA',
                },
                mercado: {
                    DEFAULT: '#22C55E',
                    light: '#BBF7D0',
                },
                outros: {
                    DEFAULT: '#8B5CF6',
                    light: '#DDD6FE',
                },
            },
            animation: {
                'pulse-border': 'pulse-border 1s ease-in-out infinite',
            },
            keyframes: {
                'pulse-border': {
                    '0%, 100%': { borderColor: 'rgba(59, 130, 246, 0.5)' },
                    '50%': { borderColor: 'rgba(59, 130, 246, 1)' },
                },
            },
        },
    },
    plugins: [],
}
