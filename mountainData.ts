import { Habit } from './types';

export interface Checkpoint {
    id: string;
    name: string;
    altitude: number; // Total days required
    emoji: string;
    message: string; // Congratulatory message
    color: string; // Checkpoint flag color
    stage: number;
}

export const MOUNTAIN_CHECKPOINTS: Checkpoint[] = [
    {
        id: 'stage1',
        name: 'Basecamp',
        altitude: 0,
        emoji: '⛺',
        message: 'Start your journey!',
        color: '#8B4513',
        stage: 1
    },
    {
        id: 'stage2',
        name: 'First Trail',
        altitude: 1,
        emoji: '🌲',
        message: 'First day complete!',
        color: '#22C55E',
        stage: 2
    },
    {
        id: 'stage3',
        name: 'Mountain Path',
        altitude: 7,
        emoji: '⛰️',
        message: 'One week strong!',
        color: '#16A34A',
        stage: 3
    },
    {
        id: 'stage4',
        name: 'Rocky Slope',
        altitude: 14,
        emoji: '🪨',
        message: 'Two weeks of dedication!',
        color: '#F59E0B',
        stage: 4
    },
    {
        id: 'stage5',
        name: 'Above the Clouds',
        altitude: 30,
        emoji: '☁️',
        message: 'One month climbed!',
        color: '#3B82F6',
        stage: 5
    },
    {
        id: 'stage6',
        name: 'Snow Line',
        altitude: 60,
        emoji: '❄️',
        message: 'Two months of climbing!',
        color: '#06B6D4',
        stage: 6
    },
    {
        id: 'stage7',
        name: 'Dangerous Road',
        altitude: 75,
        emoji: '⚠️',
        message: 'The path gets treacherous!',
        color: '#EF4444',
        stage: 7
    },
    {
        id: 'stage8',
        name: 'Summit',
        altitude: 100,
        emoji: '🏔️',
        message: 'You reached the top! 🎉',
        color: '#A855F7',
        stage: 8
    },
];

export const MOUNTAIN_HEIGHT = 400; // pixels
export const MOUNTAIN_MAX_DAYS = 100;

export interface MountainState {
    currentAltitude: number; // Current position (can slide down)
    highestReached: number; // Highest point ever reached
    lastCheckpointReached: Checkpoint; // Safety net
    lastActivityDate: string; // To detect breaks
    consecutiveBreaks: number; // Days without activity
}

/**
 * Calculate total number of days where ALL habits were completed
 * Only counts a day if every single habit was marked as 'completed'
 */
export function calculateTotalCompletedDays(habits: Habit[]): number {
    if (habits.length === 0) return 0;

    // Get all unique dates across all habits
    const allDatesSet = new Set<string>();
    habits.forEach(habit => {
        Object.keys(habit.history).forEach(date => {
            allDatesSet.add(date);
        });
    });

    // Count only dates where ALL habits were completed
    let perfectDays = 0;
    allDatesSet.forEach(date => {
        const allCompleted = habits.every(habit =>
            habit.history[date] === 'completed'
        );
        if (allCompleted) {
            perfectDays++;
        }
    });

    return perfectDays;
}

/**
 * Get the most recent date with a completed habit
 */
export function getLastCompletionDate(habits: Habit[]): string | null {
    let latestDate: string | null = null;

    habits.forEach(habit => {
        Object.entries(habit.history).forEach(([date, status]) => {
            if (status === 'completed') {
                if (!latestDate || date > latestDate) {
                    latestDate = date;
                }
            }
        });
    });

    return latestDate;
}

/**
 * Calculate days between two date strings (YYYY-MM-DD)
 */
export function calculateDaysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Convert days to pixel altitude (0-MOUNTAIN_HEIGHT)
 */
export function calculateAltitude(totalDays: number): number {
    const progress = Math.min(totalDays / MOUNTAIN_MAX_DAYS, 1);
    return Math.floor(progress * MOUNTAIN_HEIGHT);
}

/**
 * Get the highest checkpoint reached
 */
export function getCurrentCheckpoint(totalDays: number): Checkpoint {
    const reached = MOUNTAIN_CHECKPOINTS.filter(cp => totalDays >= cp.altitude);
    return reached[reached.length - 1] || MOUNTAIN_CHECKPOINTS[0];
}

/**
 * Get the next checkpoint to reach
 */
export function getNextCheckpoint(totalDays: number): Checkpoint | null {
    return MOUNTAIN_CHECKPOINTS.find(cp => cp.altitude > totalDays) || null;
}

/**
 * Calculate slide-down penalty for broken streaks
 * Slides down 10% per day, but never below last checkpoint
 */
export function calculateSlideDown(
    baseAltitude: number,
    daysWithoutActivity: number,
    lastCheckpoint: Checkpoint
): number {
    if (daysWithoutActivity === 0) return baseAltitude;

    // Slide down 10% per missed day
    const slidePercentage = 0.10 * daysWithoutActivity;
    const slideAmount = baseAltitude * slidePercentage;
    const checkpointAltitude = calculateAltitude(lastCheckpoint.altitude);
    const newAltitude = Math.max(baseAltitude - slideAmount, checkpointAltitude);

    return Math.floor(newAltitude);
}

/**
 * Get sky gradient based on altitude
 */
export function getSkyGradient(altitude: number): string {
    const progress = altitude / MOUNTAIN_HEIGHT;

    if (progress < 0.3) {
        // Lower altitude: bright blue sky
        return 'linear-gradient(to top, #87CEEB 0%, #4A90E2 100%)';
    } else if (progress < 0.7) {
        // Mid altitude: transitioning
        return 'linear-gradient(to top, #4A90E2 0%, #6A5ACD 100%)';
    } else {
        // High altitude: dark blue/purple
        return 'linear-gradient(to top, #6A5ACD 0%, #2C1654 100%)';
    }
}

/**
 * Get the current mountain stage image based on total days
 */
export function getMountainStage(totalDays: number): number {
    // Find which stage the user is in based on their altitude
    const currentCheckpoint = getCurrentCheckpoint(totalDays);
    return currentCheckpoint.stage;
}
