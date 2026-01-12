import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, X } from 'lucide-react';

export interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface SpotlightTourProps {
    steps: TourStep[];
    onComplete: () => void;
    isOpen: boolean;
}

export const SpotlightTour: React.FC<SpotlightTourProps> = ({ steps, onComplete, isOpen }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const step = steps[currentStepIndex];

    const updatePosition = useCallback(() => {
        if (!step) return;
        const element = document.getElementById(step.targetId);
        if (element) {
            setTargetRect(element.getBoundingClientRect());
            // Scroll into view if needed
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Element not found? Maybe skip or wait?
            // Check if it's because of tab switching not happening yet?
            // ideally the parent controls visibility, but for now we set null
            setTargetRect(null);
        }
    }, [step]);

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);

            // Poll for element presence (handles dynamic mounting/animations)
            const interval = setInterval(updatePosition, 200);

            return () => {
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
                clearInterval(interval);
            };
        }
    }, [isOpen, currentStepIndex, updatePosition]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    if (!isOpen || !step || !targetRect) return null;

    // Calculate Tooltip Position
    const padding = 16;
    let tooltipStyle: React.CSSProperties = {};

    // Simple positioning logic
    const isMobile = window.innerWidth < 640;

    // Default to bottom
    let top = targetRect.bottom + padding;
    let left = targetRect.left + (targetRect.width / 2) - 150; // Center 300px wide tooltip

    // Clamp to screen edges
    if (left < 10) left = 10;
    if (left + 300 > window.innerWidth) left = window.innerWidth - 310;

    // Override based on preference
    if (step.position === 'top') {
        top = targetRect.top - padding - 150; // align above
    }

    tooltipStyle = {
        top: `${top}px`,
        left: `${left}px`,
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Dark Overlay with SVG cutout */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <mask id="tour-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect
                            x={targetRect.left - 4}
                            y={targetRect.top - 4}
                            width={targetRect.width + 8}
                            height={targetRect.height + 8}
                            rx="8"
                            fill="black"
                        />
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.6)"
                    mask="url(#tour-mask)"
                />
                {/* Highlight Border */}
                <rect
                    x={targetRect.left - 4}
                    y={targetRect.top - 4}
                    width={targetRect.width + 8}
                    height={targetRect.height + 8}
                    rx="8"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                />
            </svg>

            {/* Tooltip Card */}
            <div
                className="absolute w-[300px] bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700"
                style={tooltipStyle}
            >
                <button
                    onClick={onComplete}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X size={16} />
                </button>

                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                    {step.content}
                </p>

                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">
                        {currentStepIndex + 1} of {steps.length}
                    </span>
                    <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
                    >
                        {currentStepIndex === steps.length - 1 ? 'Got it!' : 'Next'}
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
