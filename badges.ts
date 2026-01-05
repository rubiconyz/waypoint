import { Habit, Badge, BadgeProgress } from './types';
import { calculateTotalCompletedDays } from './mountainData';

// All available badges
export const BADGES: Badge[] = [
    // Streak-Based Badges
    {
        id: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first habit',
        icon: '🔥',
        category: 'special',
        requirement: 1
    },
    {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Achieve a 7-day streak',
        icon: '🏃',
        category: 'streak',
        requirement: 7
    },
    {
        id: 'consistency-king',
        name: 'Consistency King',
        description: 'Achieve a 30-day streak',
        icon: '💪',
        category: 'streak',
        requirement: 30
    },
    {
        id: 'century-club',
        name: 'Century Club',
        description: 'Achieve a 100-day streak',
        icon: '👑',
        category: 'streak',
        requirement: 100
    },
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Achieve a 365-day streak',
        icon: '🌟',
        category: 'streak',
        requirement: 365
    },

    // Collection Badges
    {
        id: 'getting-started',
        name: 'Getting Started',
        description: 'Create your first habit',
        icon: '🌱',
        category: 'collection',
        requirement: 1
    },
    {
        id: 'habit-collector',
        name: 'Habit Collector',
        description: 'Create 5 different habits',
        icon: '📚',
        category: 'collection',
        requirement: 5
    },
    {
        id: 'habit-master',
        name: 'Habit Master',
        description: 'Create 10 different habits',
        icon: '🏆',
        category: 'collection',
        requirement: 10
    },

    // Special Badges
    {
        id: 'variety-enthusiast',
        name: 'Variety Enthusiast',
        description: 'Have habits in all 6 categories',
        icon: '🎨',
        category: 'special',
        requirement: 6
    },
    {
        id: 'century-completions',
        name: 'Century Completions',
        description: 'Complete habits 100 times total',
        icon: '🎊',
        category: 'special',
        requirement: 100
    }
];

// Check badge unlocks and return newly unlocked badges
export const checkBadgeUnlocks = (
    habits: Habit[],
    currentBadges: Record<string, BadgeProgress>,
    totalHabitsCreated: number = 0 // ANTI-EXPLOIT: Use max habits created for collection badges
): { badge: Badge; progress: BadgeProgress }[] => {
    const newlyUnlocked: { badge: Badge; progress: BadgeProgress }[] = [];

    BADGES.forEach(badge => {
        // Skip if already unlocked
        if (currentBadges[badge.id]?.unlocked) return;

        let isUnlocked = false;
        let progress = 0;

        switch (badge.category) {
            case 'streak': {
                // Use mountain progress logic - count days where ALL habits were completed
                const maxStreak = calculateTotalCompletedDays(habits);
                progress = maxStreak;
                isUnlocked = maxStreak >= badge.requirement;
                break;
            }

            case 'collection': {
                // ANTI-EXPLOIT: Use totalHabitsCreated instead of habits.length
                progress = totalHabitsCreated;
                isUnlocked = totalHabitsCreated >= badge.requirement;
                break;
            }

            case 'special': {
                if (badge.id === 'first-steps') {
                    // Check if any habit has been completed at least once
                    const hasCompletion = habits.some(h =>
                        Object.values(h.history).some(status => status === 'completed')
                    );
                    progress = hasCompletion ? 1 : 0;
                    isUnlocked = hasCompletion;
                } else if (badge.id === 'variety-enthusiast') {
                    const categories = new Set(habits.map(h => h.category));
                    progress = categories.size;
                    isUnlocked = categories.size >= 6;
                } else if (badge.id === 'century-completions') {
                    const totalCompletions = habits.reduce((sum, habit) => {
                        return sum + Object.values(habit.history).filter(s => s === 'completed').length;
                    }, 0);
                    progress = totalCompletions;
                    isUnlocked = totalCompletions >= badge.requirement;
                }
                break;
            }
        }

        if (isUnlocked) {
            newlyUnlocked.push({
                badge,
                progress: {
                    unlocked: true,
                    unlockedAt: new Date().toISOString(),
                    progress
                }
            });
        }
    });

    return newlyUnlocked;
};

// Get progress for a specific badge
export const getBadgeProgress = (
    badge: Badge,
    habits: Habit[],
    totalHabitsCreated: number = 0, // ANTI-EXPLOIT: Use max habits created for collection badges
    currentProgress?: BadgeProgress
): BadgeProgress => {
    if (currentProgress?.unlocked) {
        return currentProgress;
    }

    let progress = 0;

    switch (badge.category) {
        case 'streak': {
            // Use mountain progress logic - count days where ALL habits were completed
            progress = calculateTotalCompletedDays(habits);
            break;
        }

        case 'collection': {
            // Use current habits count (consistent with Variety Enthusiast)
            progress = habits.length;
            break;
        }

        case 'special': {
            if (badge.id === 'first-steps') {
                // Check if any habit has been completed at least once
                const hasCompletion = habits.some(h =>
                    Object.values(h.history).some(status => status === 'completed')
                );
                progress = hasCompletion ? 1 : 0;
            } else if (badge.id === 'variety-enthusiast') {
                const categories = new Set(habits.map(h => h.category));
                progress = categories.size;
            } else if (badge.id === 'century-completions') {
                progress = habits.reduce((sum, habit) => {
                    return sum + Object.values(habit.history).filter(s => s === 'completed').length;
                }, 0);
            }
            break;
        }
    }

    // Check if badge should be unlocked
    const isUnlocked = progress >= badge.requirement;

    return {
        unlocked: isUnlocked,
        unlockedAt: isUnlocked && !currentProgress?.unlocked ? new Date().toISOString() : currentProgress?.unlockedAt,
        progress
    };
};
