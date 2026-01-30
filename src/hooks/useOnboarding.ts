'use client';

import { useState, useCallback, useEffect } from 'react';

export interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    targetSelector: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'import',
        title: '📥 Importar seus dados',
        description: 'Clique aqui para importar um arquivo CSV com suas transações. O formato esperado é: data, título, valor.',
        targetSelector: '[data-onboarding="import"]',
        position: 'bottom',
    },
    {
        id: 'inbox',
        title: '📋 Suas transações',
        description: 'Aqui ficam todas as transações não classificadas. Você pode filtrar por texto ou arrastar para categorizar.',
        targetSelector: '[data-onboarding="inbox"]',
        position: 'right',
    },
    {
        id: 'categories',
        title: '🗂️ Categorias',
        description: 'Arraste os cards para essas áreas ou use o dropdown no card para classificar. Cada categoria soma automaticamente os valores.',
        targetSelector: '[data-onboarding="categories"]',
        position: 'left',
    },
    {
        id: 'charts',
        title: '📊 Visualização',
        description: 'Acompanhe a distribuição dos seus gastos em tempo real através dos gráficos.',
        targetSelector: '[data-onboarding="charts"]',
        position: 'top',
    },
    {
        id: 'export',
        title: '💾 Exportar dados',
        description: 'Quando terminar, exporte suas transações classificadas em JSON ou CSV.',
        targetSelector: '[data-onboarding="export"]',
        position: 'bottom',
    },
];

const STORAGE_KEY = 'billing-onboarding-completed';

export function useOnboarding() {
    const [isActive, setIsActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [hasCompleted, setHasCompleted] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem(STORAGE_KEY) === 'true';
        setHasCompleted(completed);

        // Auto-start for new users after a short delay
        if (!completed) {
            const timer = setTimeout(() => {
                setIsActive(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    const totalSteps = ONBOARDING_STEPS.length;
    const isLastStep = currentStepIndex === totalSteps - 1;

    const startTour = useCallback(() => {
        setCurrentStepIndex(0);
        setIsActive(true);
    }, []);

    const nextStep = useCallback(() => {
        if (isLastStep) {
            completeTour();
        } else {
            setCurrentStepIndex((prev) => prev + 1);
        }
    }, [isLastStep]);

    const prevStep = useCallback(() => {
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }, []);

    const skipTour = useCallback(() => {
        setIsActive(false);
        localStorage.setItem(STORAGE_KEY, 'true');
        setHasCompleted(true);
    }, []);

    const completeTour = useCallback(() => {
        setIsActive(false);
        localStorage.setItem(STORAGE_KEY, 'true');
        setHasCompleted(true);
    }, []);

    const resetTour = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setHasCompleted(false);
        setCurrentStepIndex(0);
    }, []);

    return {
        isActive,
        currentStep,
        currentStepIndex,
        totalSteps,
        isLastStep,
        hasCompleted,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        resetTour,
    };
}
