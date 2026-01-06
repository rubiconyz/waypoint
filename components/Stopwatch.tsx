import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface StopwatchProps {
    habitTitle: string;
    targetDuration: number; // in minutes
    onComplete: () => void;
    onClose: () => void;
}

export const Stopwatch: React.FC<StopwatchProps> = ({
    habitTitle,
    targetDuration,
    onComplete,
    onClose
}) => {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const targetSeconds = targetDuration * 60;
    const progress = (elapsedSeconds / targetSeconds) * 100;

    useEffect(() => {
        if (!isRunning || isCompleted) return;

        const interval = setInterval(() => {
            setElapsedSeconds(prev => {
                const newValue = prev + 1;
                if (newValue >= targetSeconds) {
                    setIsRunning(false);
                    setIsCompleted(true);
                    onComplete();
                    // Auto-close after 2 seconds
                    setTimeout(() => onClose(), 2000);
                    return targetSeconds;
                }
                return newValue;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, isCompleted, targetSeconds, onComplete, onClose]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleReset = () => {
        setElapsedSeconds(0);
        setIsRunning(false);
        setIsCompleted(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {habitTitle}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Target: {targetDuration} minute{targetDuration !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Progress Circle */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                    <svg className="w-full h-full -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            fill="none"
                            stroke={isCompleted ? '#10b981' : '#6366f1'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 120}`}
                            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                            className="transition-all duration-300"
                        />
                    </svg>

                    {/* Time display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-gray-900 dark:text-white font-mono">
                            {formatTime(elapsedSeconds)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {formatTime(targetSeconds - elapsedSeconds)} remaining
                        </div>
                    </div>
                </div>

                {isCompleted && (
                    <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-center font-semibold">
                        🎉 Goal reached! Habit completed!
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-3 justify-center">
                    {!isRunning && !isCompleted && elapsedSeconds === 0 && (
                        <button
                            onClick={() => setIsRunning(true)}
                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
                        >
                            <Play size={20} />
                            Start
                        </button>
                    )}

                    {isRunning && (
                        <button
                            onClick={() => setIsRunning(false)}
                            className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
                        >
                            <Pause size={20} />
                            Pause
                        </button>
                    )}

                    {!isRunning && elapsedSeconds > 0 && !isCompleted && (
                        <button
                            onClick={() => setIsRunning(true)}
                            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
                        >
                            <Play size={20} />
                            Resume
                        </button>
                    )}

                    {elapsedSeconds > 0 && !isCompleted && (
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
                        >
                            <RotateCcw size={20} />
                            Reset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
