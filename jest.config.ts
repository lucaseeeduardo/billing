import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
});

const customJestConfig: Config = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: [
        '**/__tests__/**/*.(test|spec).(ts|tsx)',
        '**/*.(test|spec).(ts|tsx)',
    ],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/app/**/*', // Exclude Next.js app directory
        '!**/node_modules/**',
    ],
    coverageThreshold: {
        global: {
            branches: 0, // Will improve as more tests are added
            functions: 0,
            lines: 0,
            statements: 0,
        },
        './src/utils/': {
            branches: 90,
            functions: 100,
            lines: 90,
            statements: 90,
        },
    },
};

export default createJestConfig(customJestConfig);
