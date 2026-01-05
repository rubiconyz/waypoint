import React, { useState, useEffect } from 'react';
import { Habit } from '../types';
import {
    MOUNTAIN_CHECKPOINTS,
    MOUNTAIN_HEIGHT,
    MOUNTAIN_MAX_DAYS,
    MountainState,
    calculateTotalCompletedDays,
    getLastCompletionDate,
    calculateDaysBetween,
    calculateAltitude,
    getCurrentCheckpoint,
    getNextCheckpoint,
    calculateSlideDown,
    getSkyGradient,
    getMountainStage,
    Checkpoint
} from '../mountainData';
import { AlertTriangle, Mountain, TrendingUp, TrendingDown, Trophy, Flag } from 'lucide-react';

interface MountainClimberProps {
    habits: Habit[];
}

const STORAGE_KEY = 'habitvision_mountain';

// Helper to get today's date string
const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const MountainClimber: React.FC<MountainClimberProps> = ({ habits }) => {
    const totalDays = calculateTotalCompletedDays(habits);
    const todayStr = getLocalDateString(new Date());
    const lastCompletionDate = getLastCompletionDate(habits);

    // Calculate days without activity
    const daysWithoutActivity = lastCompletionDate
        ? calculateDaysBetween(lastCompletionDate, todayStr)
        : totalDays === 0 ? 0 : 999; // If no completion date but has days, something's wrong

    // Mountain state
    const [mountainState, setMountainState] = useState<MountainState>({
        currentAltitude: 0,
        highestReached: 0,
        lastCheckpointReached: MOUNTAIN_CHECKPOINTS[0],
        lastActivityDate: '',
        consecutiveBreaks: 0
    });

    // Load saved state
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setMountainState(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse mountain state', e);
            }
        }
    }, []);

    // Update altitude with slide-down logic
    useEffect(() => {
        const baseAltitude = calculateAltitude(totalDays);
        const currentCheckpoint = getCurrentCheckpoint(totalDays);

        // Apply slide-down if there's been inactivity
        const newAltitude = calculateSlideDown(
            baseAltitude,
            daysWithoutActivity,
            mountainState.lastCheckpointReached
        );

        const newState = {
            currentAltitude: newAltitude,
            highestReached: Math.max(newAltitude, mountainState.highestReached),
            lastCheckpointReached: currentCheckpoint,
            lastActivityDate: lastCompletionDate || '',
            consecutiveBreaks: daysWithoutActivity
        };

        setMountainState(newState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }, [habits, totalDays, daysWithoutActivity]);

    const currentCheckpoint = getCurrentCheckpoint(totalDays);
    const nextCheckpoint = getNextCheckpoint(totalDays);
    const isSliding = daysWithoutActivity > 0 && totalDays > 0;
    const progressPercentage = Math.round((totalDays / MOUNTAIN_MAX_DAYS) * 100);

    return (
        <div className="max-w-7xl mx-auto">
            {/* Warning Banner for Sliding */}
            {isSliding && (
                <div className="mb-6 bg-red-500/10 border-2 border-red-500 rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-bold text-red-600 dark:text-red-400">Sliding Down!</h3>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80">
                                {daysWithoutActivity} {daysWithoutActivity === 1 ? 'day' : 'days'} without activity -
                                you're losing altitude! Complete a habit to stop the slide.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header - Mountain Explanation */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Mountain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Mountain Climber
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            Climb to the summit by completing <strong>all your daily habits every day</strong>.
                            Each perfect day moves you one step higher. Miss a day and you'll slide down!
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            {totalDays}/{MOUNTAIN_MAX_DAYS}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            days to summit
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Current Altitude */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Mountain className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Altitude</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {totalDays}
                        <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">days</span>
                    </div>
                </div>

                {/* Current Checkpoint */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Flag className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Checkpoint</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{currentCheckpoint.emoji}</span>
                        <span className="text-lg">{currentCheckpoint.name}</span>
                    </div>
                </div>

                {/* Next Checkpoint */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Next Goal</span>
                    </div>
                    {nextCheckpoint ? (
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {nextCheckpoint.altitude - totalDays} days
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {nextCheckpoint.emoji} {nextCheckpoint.name}
                            </div>
                        </div>
                    ) : (
                        <div className="text-2xl font-bold text-green-500">
                            Summit! 🎉
                        </div>
                    )}
                </div>

                {/* Progress */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        {isSliding ? (
                            <TrendingDown className="w-5 h-5 text-red-500" />
                        ) : (
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Progress</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {progressPercentage}%
                    </div>
                </div>
            </div>

            {/* Mountain Canvas */}
            <div
                className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800"
                style={{ height: `${MOUNTAIN_HEIGHT}px` }}
            >
                {/* Sky Background */}
                <div
                    className="absolute inset-0 transition-all duration-1000"
                    style={{ background: getSkyGradient(mountainState.currentAltitude) }}
                >
                    {/* Stars at high altitude */}
                    {mountainState.currentAltitude > MOUNTAIN_HEIGHT * 0.7 && (
                        <div className="absolute inset-0 opacity-30">
                            {[...Array(50)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 50}%`,
                                        animationDelay: `${Math.random() * 3}s`
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Mountain Image - Changes based on stage */}
                <img
                    src={`/assets/Mountain/${currentCheckpoint.stage === 3 ? '3new' : currentCheckpoint.stage}.png`}
                    alt={`Mountain Stage ${currentCheckpoint.stage}`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                />
            </div>

            {/* Checkpoints - Below the mountain */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {MOUNTAIN_CHECKPOINTS.map((checkpoint) => {
                    const isReached = totalDays >= checkpoint.altitude;

                    return (
                        <div
                            key={checkpoint.id}
                            className={`bg-white dark:bg-gray-900 rounded-xl p-4 border-2 transition-all duration-300 ${isReached
                                ? 'border-green-500 dark:border-green-400'
                                : 'border-gray-200 dark:border-gray-800 opacity-60'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-300 ${isReached
                                        ? 'bg-gradient-to-br shadow-lg'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                    style={isReached ? {
                                        backgroundImage: `linear-gradient(135deg, ${checkpoint.color} 0%, ${checkpoint.color}CC 100%)`
                                    } : {}}
                                >
                                    {checkpoint.emoji}
                                </div>
                                {isReached && (
                                    <div className="flex-shrink-0">
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={`text-sm font-semibold mb-1 ${isReached
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {checkpoint.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {checkpoint.altitude} days
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar - Below checkpoints */}
            <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Climb Progress
                    </span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {progressPercentage}%
                    </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-700"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Checkpoint Messages */}
            {totalDays > 0 && (
                <div className="mt-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <span className="text-2xl">{currentCheckpoint.emoji}</span>
                        {currentCheckpoint.message}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        You've climbed to <strong>{currentCheckpoint.name}</strong>!
                        {nextCheckpoint && ` Next checkpoint: ${nextCheckpoint.name} in ${nextCheckpoint.altitude - totalDays} days.`}
                    </p>
                </div>
            )}

            {/* Empty State */}
            {totalDays === 0 && (
                <div className="mt-6 text-center py-12">
                    <div className="text-6xl mb-4">⛺</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Ready to Start Climbing?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Complete habits to begin your ascent to the summit!
                    </p>
                </div>
            )}
        </div>
    );
};
