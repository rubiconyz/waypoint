import React, { useMemo } from 'react';
import { Habit, Badge, BadgeProgress } from '../types';
import { BADGES, getBadgeProgress } from '../badges';
import { BadgeCard } from './BadgeComponents';
import { Award, TrendingUp, Target, Star } from 'lucide-react';

interface BadgesProps {
    habits: Habit[];
    badgeProgress: Record<string, BadgeProgress>;
    totalHabitsCreated: number; // ANTI-EXPLOIT: Pass total habits created counter
}

export const Badges: React.FC<BadgesProps> = ({ habits, badgeProgress, totalHabitsCreated }) => {
    const badgeData = useMemo(() => {
        return BADGES.map(badge => ({
            badge,
            progress: getBadgeProgress(badge, habits, totalHabitsCreated, badgeProgress[badge.id])
        }));
    }, [habits, badgeProgress, totalHabitsCreated]);

    const unlockedCount = badgeData.filter(b => b.progress.unlocked).length;
    const groupedBadges = useMemo(() => {
        return {
            streak: badgeData.filter(b => b.badge.category === 'streak'),
            perfect: badgeData.filter(b => b.badge.category === 'perfect'),
            collection: badgeData.filter(b => b.badge.category === 'collection'),
            special: badgeData.filter(b => b.badge.category === 'special')
        };
    }, [badgeData]);

    const categoryIcons = {
        streak: TrendingUp,
        perfect: Target,
        collection: Award,
        special: Star
    };

    const categoryTitles = {
        streak: 'Streak Badges',
        perfect: 'Perfect Day Badges',
        collection: 'Collection Badges',
        special: 'Special Badges'
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Achievement Badges</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <Award className="text-yellow-600 dark:text-yellow-400" size={20} />
                    <span className="font-semibold text-gray-900 dark:text-white">
                        {unlockedCount}/{BADGES.length}
                    </span>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(groupedBadges).map(([category, badges]) => {
                    const Icon = categoryIcons[category as keyof typeof categoryIcons];
                    const unlocked = badges.filter(b => b.progress.unlocked).length;

                    return (
                        <div
                            key={category}
                            className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className="text-gray-400" size={18} />
                                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {categoryTitles[category as keyof typeof categoryTitles]}
                                </h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {unlocked}/{badges.length}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Badge Grid by Category */}
            {Object.entries(groupedBadges).map(([category, badges]) => {
                if (badges.length === 0) return null;

                const Icon = categoryIcons[category as keyof typeof categoryIcons];

                return (
                    <div key={category}>
                        <div className="flex items-center gap-2 mb-4">
                            <Icon className="text-gray-500 dark:text-gray-400" size={20} />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {categoryTitles[category as keyof typeof categoryTitles]}
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {badges.map(({ badge, progress }) => (
                                <BadgeCard key={badge.id} badge={badge} progress={progress} />
                            ))}
                        </div>
                    </div>
                );
            })}

            {unlockedCount === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Award className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                        No badges yet!
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                        Complete habits and build streaks to unlock achievements
                    </p>
                </div>
            )}
        </div>
    );
};
