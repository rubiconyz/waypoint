import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';

interface TimerProps {
    habitId: string;
    habitTitle: string;
    targetDuration: number; // in minutes
    onComplete: () => void;
    onClose: () => void;
}

export const Timer: React.FC<TimerProps> = ({
    habitId,
    habitTitle,
    targetDuration,
    onComplete,
    onClose
}) => {
    const STORAGE_KEY = `habitvision_timer_state_${habitId}`;

    const [remainingSeconds, setRemainingSeconds] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? parseInt(saved, 10) : targetDuration * 60;
    });

    // Resume isRunning state? Maybe safer to start paused on reload to avoid confusion.
    // User requested "pauses and refreshes", so default false is correct.
    const [isRunning, setIsRunning] = useState(false);

    // If we loaded from storage but it's finished (0), we should probably reset/handle it?
    // But logic handles <= 0.

    const [isCompleted, setIsCompleted] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Use refs to avoid recreating interval when callbacks change
    const onCompleteRef = useRef(onComplete);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCompleteRef.current = onComplete;
        onCloseRef.current = onClose;
    }, [onComplete, onClose]);

    const targetSeconds = targetDuration * 60;
    // Calculate remaining percentage instead of elapsed
    const remainingPercent = Math.max((remainingSeconds / targetSeconds) * 100, 0);

    // Force state reset when habitId changes (Double-safety against instance reuse)
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        setRemainingSeconds(saved ? parseInt(saved, 10) : targetDuration * 60);
        setIsRunning(false);
        setIsCompleted(false);
    }, [habitId, STORAGE_KEY, targetDuration]); // Re-run if habitId changes

    // Persist State
    useEffect(() => {
        if (remainingSeconds > 0 && !isCompleted) {
            localStorage.setItem(STORAGE_KEY, remainingSeconds.toString());
        } else {
            // If completed or 0, clear it? Or keeps it at 0 until reset?
            // Logic below clears on completion.
        }
    }, [remainingSeconds, isCompleted, STORAGE_KEY]);

    useEffect(() => {
        if (!isRunning || isCompleted) return;

        const interval = setInterval(() => {
            setRemainingSeconds(prev => {
                const newValue = prev - 1;
                if (newValue <= 0) {
                    setIsRunning(false);
                    setIsCompleted(true);
                    localStorage.removeItem(STORAGE_KEY); // Clear storage on completion
                    onCompleteRef.current();
                    // Auto-close after 3 seconds if not collapsed
                    if (!isCollapsed) {
                        setTimeout(() => onCloseRef.current(), 3000);
                    }
                    return 0;
                }
                return newValue;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, isCompleted, isCollapsed, STORAGE_KEY]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleReset = () => {
        setRemainingSeconds(targetSeconds);
        localStorage.removeItem(STORAGE_KEY);
        setIsRunning(false);
        setIsCompleted(false);
    };

    if (isCollapsed) {
        return (
            <div className="fixed bottom-24 right-6 z-50 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 w-72">
                    {/* Ring Mini */}
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-700" />
                            <circle cx="24" cy="24" r="20" fill="none" stroke={isCompleted ? '#10b981' : '#6366f1'} strokeWidth="4" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 20}`}
                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - remainingPercent / 100)}`}
                                className="transition-all duration-300"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                            {Math.round(remainingPercent)}%
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs text-gray-500 dark:text-gray-400 truncate">{habitTitle}</h4>
                        <div className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                            {formatTime(remainingSeconds)}
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsRunning(!isRunning)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                        >
                            {isRunning ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                        >
                            <Maximize2 size={16} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-gray-400 hover:text-red-500"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative border border-gray-200 dark:border-gray-700">
                <div className="absolute top-6 right-6 flex items-center gap-2">
                    <button
                        onClick={() => setIsCollapsed(true)}
                        className="text-gray-400 hover:text-indigo-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Minimize"
                    >
                        <Minimize2 size={24} />
                    </button>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
                        <span className="text-3xl">⏱️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {habitTitle}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Timer: {targetDuration} minute{targetDuration !== 1 ? 's' : ''}
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
                            strokeDashoffset={`${2 * Math.PI * 130 * (1 - remainingPercent / 100)}`}
                            className="transition-all duration-300"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }}
                        />
                    </svg>

                    {/* Time display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-6xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
                            {formatTime(remainingSeconds)}
                        </div>
                        <div className="text-base text-gray-500 dark:text-gray-400 mt-3 font-medium">
                            {isCompleted ? '✨ Complete!' : 'remaining'}
                        </div>
                        <div className="mt-2">
                            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">
                                {Math.round(remainingPercent)}%
                            </div>
                        </div>
                    </div>
                </div>

                {isCompleted && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl text-center animate-bounce-small">
                        <p className="text-green-700 dark:text-green-400 font-bold text-lg">
                            🎉 Time's Up! Habit Completed!
                        </p>
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-3 justify-center">
                    {!isRunning && !isCompleted && remainingSeconds === targetSeconds && (
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

                    {!isRunning && remainingSeconds < targetSeconds && !isCompleted && (
                        <button
                            onClick={() => setIsRunning(true)}
                            className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl transition-all font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Play size={24} fill="white" />
                            Resume
                        </button>
                    )}

                    {remainingSeconds < targetSeconds && !isCompleted && (
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
