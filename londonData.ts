import { Habit } from './types';

export interface Landmark {
    id: string;
    name: string;
    description: string;
    unlockAt: number; // Total habit completion days required
    image: string; // Path to landmark image
    emoji: string; // Fallback emoji representation
}

export const LONDON_LANDMARKS: Landmark[] = [
    {
        id: 'big-ben',
        name: 'Big Ben',
        description: 'The iconic clock tower of Westminster',
        unlockAt: 7,
        image: '/assets/Builder/London/landmarks/big-ben.png',
        emoji: '🏛️'
    },
    {
        id: 'tower-bridge',
        name: 'Tower Bridge',
        description: 'Victorian bridge with twin towers over the Thames',
        unlockAt: 14,
        image: '/assets/Builder/London/landmarks/tower-bridge.png',
        emoji: '🌉'
    },
    {
        id: 'london-eye',
        name: 'London Eye',
        description: 'Giant observation wheel on the South Bank',
        unlockAt: 30,
        image: '/assets/Builder/London/landmarks/london-eye.png',
        emoji: '🎡'
    },
    {
        id: 'buckingham-palace',
        name: 'Buckingham Palace',
        description: 'The official residence of the British monarch',
        unlockAt: 60,
        image: '/assets/Builder/London/landmarks/buckingham-palace.png',
        emoji: '🏰'
    },
    {
        id: 'the-shard',
        name: 'The Shard',
        description: 'Modern glass skyscraper piercing the skyline',
        unlockAt: 100,
        image: '/assets/Builder/London/landmarks/the-shard.png',
        emoji: '🏙️'
    },
    {
        id: 'tower-of-london',
        name: 'Tower of London',
        description: 'Historic medieval fortress and former royal palace',
        unlockAt: 180,
        image: '/assets/Builder/London/landmarks/tower-of-london.png',
        emoji: '🏯'
    }
];

/**
 * Calculate total number of unique days with at least one completed habit
 */
export function calculateTotalCompletedDays(habits: Habit[]): number {
    const allDates = new Set<string>();

    habits.forEach(habit => {
        Object.entries(habit.history).forEach(([date, status]) => {
            if (status === 'completed') {
                allDates.add(date);
            }
        });
    });

    return allDates.size;
}

/**
 * Get the next locked landmark (if any)
 */
export function getNextLandmark(totalDays: number): Landmark | null {
    const locked = LONDON_LANDMARKS.filter(l => l.unlockAt > totalDays);
    return locked.length > 0 ? locked[0] : null;
}

/**
 * Get count of unlocked landmarks
 */
export function getUnlockedCount(totalDays: number): number {
    return LONDON_LANDMARKS.filter(l => l.unlockAt <= totalDays).length;
}
