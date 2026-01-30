'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';

interface TooltipPosition {
    top: number;
    left: number;
    arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

export function Onboarding() {
    const {
        isActive,
        currentStep,
        currentStepIndex,
        totalSteps,
        isLastStep,
        nextStep,
        prevStep,
        skipTour,
    } = useOnboarding();

    const [position, setPosition] = useState<TooltipPosition | null>(null);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isActive || !currentStep) return;

        const updatePosition = () => {
            const target = document.querySelector(currentStep.targetSelector);
            if (!target) return;

            const rect = target.getBoundingClientRect();
            setTargetRect(rect);

            const tooltipWidth = 320;
            const tooltipHeight = 180;
            const padding = 16;

            let top = 0;
            let left = 0;
            let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

            switch (currentStep.position) {
                case 'bottom':
                    top = rect.bottom + padding;
                    left = rect.left + rect.width / 2 - tooltipWidth / 2;
                    arrowPosition = 'top';
                    break;
                case 'top':
                    top = rect.top - tooltipHeight - padding;
                    left = rect.left + rect.width / 2 - tooltipWidth / 2;
                    arrowPosition = 'bottom';
                    break;
                case 'right':
                    top = rect.top + rect.height / 2 - tooltipHeight / 2;
                    left = rect.right + padding;
                    arrowPosition = 'left';
                    break;
                case 'left':
                    top = rect.top + rect.height / 2 - tooltipHeight / 2;
                    left = rect.left - tooltipWidth - padding;
                    arrowPosition = 'right';
                    break;
            }

            // Ensure tooltip stays within viewport
            left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
            top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

            setPosition({ top, left, arrowPosition });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isActive, currentStep]);

    if (!isActive || !currentStep || !position) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-[9998] pointer-events-none">
                <svg className="w-full h-full">
                    <defs>
                        <mask id="spotlight-mask">
                            <rect width="100%" height="100%" fill="white" />
                            {targetRect && (
                                <rect
                                    x={targetRect.left - 8}
                                    y={targetRect.top - 8}
                                    width={targetRect.width + 16}
                                    height={targetRect.height + 16}
                                    rx="12"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.6)"
                        mask="url(#spotlight-mask)"
                    />
                </svg>
            </div>

            {/* Highlight ring */}
            {targetRect && (
                <div
                    className="fixed z-[9999] pointer-events-none rounded-xl ring-4 ring-blue-500 ring-offset-4 ring-offset-transparent animate-pulse"
                    style={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                />
            )}

            {/* Tooltip */}
            <div
                ref={tooltipRef}
                className="fixed z-[10000] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
                style={{
                    top: position.top,
                    left: position.left,
                }}
            >
                {/* Arrow */}
                <div
                    className={`absolute w-4 h-4 bg-white border-gray-100 transform rotate-45 ${position.arrowPosition === 'top'
                            ? '-top-2 left-1/2 -translate-x-1/2 border-t border-l'
                            : position.arrowPosition === 'bottom'
                                ? '-bottom-2 left-1/2 -translate-x-1/2 border-b border-r'
                                : position.arrowPosition === 'left'
                                    ? '-left-2 top-1/2 -translate-y-1/2 border-l border-b'
                                    : '-right-2 top-1/2 -translate-y-1/2 border-r border-t'
                        }`}
                />

                {/* Progress bar */}
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                        style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {currentStep.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        {currentStep.description}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={skipTour}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Pular tour
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                                {currentStepIndex + 1} de {totalSteps}
                            </span>

                            {currentStepIndex > 0 && (
                                <button
                                    onClick={prevStep}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Voltar
                                </button>
                            )}

                            <button
                                onClick={nextStep}
                                className="px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                            >
                                {isLastStep ? 'Concluir' : 'Próximo'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
