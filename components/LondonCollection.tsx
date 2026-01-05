import React from 'react';
import { Habit } from '../types';
import {
    LONDON_LANDMARKS,
    calculateTotalCompletedDays,
    getNextLandmark,
    getUnlockedCount,
    Landmark
} from '../londonData';
import { Lock, Check, Trophy, Calendar } from 'lucide-react';

interface LondonCollectionProps {
    habits: Habit[];
}

interface LandmarkCardProps {
    landmark: Landmark;
    unlocked: boolean;
}

const LandmarkCard: React.FC<LandmarkCardProps> = ({ landmark, unlocked }) => {
    return (
        <div className="relative group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300">
            {/* Image */}
            <div className="aspect-square relative overflow-hidden bg-gray-50 dark:bg-gray-800">
                <img
                    src={landmark.image}
                    alt={landmark.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${unlocked
                            ? 'opacity-100 group-hover:scale-110'
                            : 'grayscale opacity-30 blur-sm'
                        }`}
                    onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                            parent.innerHTML = `<div class="flex items-center justify-center h-full text-8xl">${landmark.emoji}</div>`;
                        }
                    }}
                />

                {/* Lock Overlay */}
                {!unlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                        <Lock className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full">
                            {landmark.unlockAt} days
                        </span>
                    </div>
                )}

                {/* Unlocked Badge */}
                {unlocked && (
                    <div className="absolute top-3 right-3 bg-green-500 rounded-full p-2 shadow-lg animate-fade-in">
                        <Check className="w-5 h-5 text-white" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className={`font-bold text-lg mb-1 transition-colors ${unlocked
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-500'
                    }`}>
                    {landmark.name}
                </h3>
                <p className={`text-sm transition-colors ${unlocked
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}>
                    {landmark.description}
                </p>
            </div>
        </div>
    );
};

const ProgressHeader: React.FC<{ totalDays: number }> = ({ totalDays }) => {
    const unlockedCount = getUnlockedCount(totalDays);
    const nextLandmark = getNextLandmark(totalDays);
    const totalLandmarks = LONDON_LANDMARKS.length;
    const progressPercentage = Math.round((unlockedCount / totalLandmarks) * 100);

    return (
        <div className="mb-8">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-6 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'url(/assets/Builder/London/london.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }} />
                </div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Trophy className="w-8 h-8" />
                        London Landmarks Collection
                    </h1>
                    <p className="text-indigo-100 text-lg">
                        Unlock iconic landmarks as you build your habit streak
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Total Days */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Days</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {totalDays}
                    </div>
                </div>

                {/* Unlocked */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Unlocked</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {unlockedCount} / {totalLandmarks}
                    </div>
                </div>

                {/* Next Unlock */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Lock className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Next Unlock</span>
                    </div>
                    {nextLandmark ? (
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                {nextLandmark.unlockAt - totalDays} days
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {nextLandmark.name}
                            </div>
                        </div>
                    ) : (
                        <div className="text-2xl font-bold text-green-500">
                            All unlocked! 🎉
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Collection Progress
                    </span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {progressPercentage}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export const LondonCollection: React.FC<LondonCollectionProps> = ({ habits }) => {
    const totalDays = calculateTotalCompletedDays(habits);

    return (
        <div className="max-w-7xl mx-auto">
            <ProgressHeader totalDays={totalDays} />

            {/* Landmarks Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {LONDON_LANDMARKS.map((landmark) => (
                    <LandmarkCard
                        key={landmark.id}
                        landmark={landmark}
                        unlocked={totalDays >= landmark.unlockAt}
                    />
                ))}
            </div>

            {/* Empty State */}
            {totalDays === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏛️</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Start Your Journey
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Complete habits to unlock iconic London landmarks!
                    </p>
                </div>
            )}
        </div>
    );
};
