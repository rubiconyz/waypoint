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
    const progress = Math.min((elapsedSeconds / targetSeconds) * 100, 100);

    useEffect(() => {
        if (!isRunning || isCompleted) return;

        const interval = setInterval(() => {
            setElapsedSeconds(prev => {
                const newValue = prev + 1;
                if (newValue >= targetSeconds) {
                    setIsRunning(false);
                    setIsCompleted(true);
                    onComplete();
                    // Auto-close after 3 seconds
                    setTimeout(() => onClose(), 3000);
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

    const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative border border-gray-200 dark:border-gray-700">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                        <span className="text-3xl">⏱️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {habitTitle}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Goal: {targetDuration} minute{targetDuration !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Progress Circle */}
                <div className="relative w-72 h-72 mx-auto mb-8">
                    <svg className="w-full h-full -rotate-90 drop-shadow-lg">
                        {/* Background circle */}
                        <circle
                            cx="144"
                            cy="144"
                            r="130"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        {/* Progress circle */}
                        <circle
                            cx="144"
                            cy="144"
                            r="130"
                            fill="none"
                            stroke={isCompleted ? '#10b981' : '#6366f1'}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 130}`}
                            strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)}`}
                            className="transition-all duration-300"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }}
                        />
                    </svg>

                    {/* Time display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-6xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
                            {formatTime(elapsedSeconds)}
                        </div>
                        <div className="text-base text-gray-500 dark:text-gray-400 mt-3 font-medium">
                            {isCompleted ? '✨ Complete!' : `${formatTime(remainingSeconds)} left`}
                        </div>
                        <div className="mt-2">
                            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                                {Math.round(progress)}%
                            </div>
                        </div>
                    </div>
                </div>

                {isCompleted && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl text-center animate-bounce-small">
                        <p className="text-green-700 dark:text-green-400 font-bold text-lg">
                            🎉 Goal Reached! Habit Completed!
                        </p>
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-3 justify-center">
                    {!isRunning && !isCompleted && elapsedSeconds === 0 && (
                        <button
                            onClick={() => setIsRunning(true)}
                            className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl transition-all font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Play size={24} fill="white" />
                            Start Timer
                        </button>
                    )}

                    {isRunning && (
                        <button
                            onClick={() => setIsRunning(false)}
                            className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-2xl transition-all font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Pause size={24} fill="white" />
                            Pause
                        </button>
                    )}

                    {!isRunning && elapsedSeconds > 0 && !isCompleted && (
                        <button
                            onClick={() => setIsRunning(true)}
                            className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl transition-all font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Play size={24} fill="white" />
                            Resume
                        </button>
                    )}

                    {elapsedSeconds > 0 && !isCompleted && (
                        <button
                            onClick={handleReset}
                            className="px-8 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl transition-all font-bold text-lg flex items-center gap-3 shadow-md hover:shadow-lg"
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
