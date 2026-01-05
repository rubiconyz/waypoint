import { Habit } from './types';

export interface BonsaiStage {
    stage: number;
    minDays: number;
    maxDays: number | null;
    name: string;
    description: string;
    quote: string;
}

export interface GardenState {
    currentStage: number;
    dayStreak: number;
    totalDaysCultivated: number;
    lastCheckDate: string;
}

// 9 Growth Stages for the Bonsai Tree (Empty Pot removed - more motivating!)
export const BONSAI_STAGES: BonsaiStage[] = [
    {
        stage: 1,
        minDays: 0,
        maxDays: 3,
        name: 'Tiny Sprout',
        description: 'The first signs of life emerge',
        quote: 'A journey of a thousand miles begins with a single step'
    },
    {
        stage: 2,
        minDays: 4,
        maxDays: 7,
        name: 'Young Sapling',
        description: 'Small leaves reach toward the light',
        quote: 'Patience is the companion of wisdom'
    },
    {
        stage: 3,
        minDays: 8,
        maxDays: 12,
        name: 'Growing Tree',
        description: 'A thin trunk begins to take shape',
        quote: 'The best time to plant a tree was 20 years ago. The second best time is now'
    },
    {
        stage: 4,
        minDays: 13,
        maxDays: 18,
        name: 'Developing Bonsai',
        description: 'Branches spread with purpose',
        quote: 'Growth is never by mere chance; it is the result of forces working together'
    },
    {
        stage: 5,
        minDays: 19,
        maxDays: 25,
        name: 'Maturing Bonsai',
        description: 'Fuller foliage brings beauty',
        quote: 'Nature does not hurry, yet everything is accomplished'
    },
    {
        stage: 6,
        minDays: 26,
        maxDays: 33,
        name: 'Elegant Bonsai',
        description: 'A gracefully curved trunk emerges',
        quote: 'The bamboo that bends is stronger than the oak that resists'
    },
    {
        stage: 7,
        minDays: 34,
        maxDays: 42,
        name: 'Blooming Bonsai',
        description: 'Delicate flowers begin to appear',
        quote: 'In the confrontation between the stream and the rock, the stream always wins'
    },
    {
        stage: 8,
        minDays: 43,
        maxDays: 54,
        name: 'Magnificent Bonsai',
        description: 'Vibrant colors paint the branches',
        quote: 'A flower does not think of competing with the flower next to it. It just blooms'
    },
    {
        stage: 9,
        minDays: 55,
        maxDays: null,
        name: 'Masterpiece Bonsai',
        description: 'Cherry blossoms dance in the breeze',
        quote: 'The quieter you become, the more you can hear'
    }
];

// Helper to format date in local timezone
const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Calculate consecutive day streak
export const calculateDayStreak = (habits: Habit[]): number => {
    if (habits.length === 0) return 0;

    const today = getLocalDateString(new Date());
    const completedDays = new Set<string>();

    // Collect all unique days with at least one habit completion
    habits.forEach(habit => {
        Object.entries(habit.history).forEach(([date, status]) => {
            if (status === 'completed') {
                completedDays.add(date);
            }
        });
    });

    const sortedDays = Array.from(completedDays).sort().reverse();

    let streak = 0;
    let currentDate = new Date();

    // Count consecutive days backwards from today
    while (true) {
        const dateStr = getLocalDateString(currentDate);

        if (sortedDays.includes(dateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (dateStr === today && streak === 0) {
            // Grace period: if today has no completions yet, check yesterday
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
};

// Calculate bonsai stage based on day streak
export const calculateBonsaiStage = (dayStreak: number): number => {
    for (let i = BONSAI_STAGES.length - 1; i >= 0; i--) {
        if (dayStreak >= BONSAI_STAGES[i].minDays) {
            return BONSAI_STAGES[i].stage;
        }
    }
    return 1;
};

// Get current stage info
export const getCurrentStageInfo = (dayStreak: number): BonsaiStage => {
    const currentStage = calculateBonsaiStage(dayStreak);
    return BONSAI_STAGES[currentStage - 1];
};

// Get days until next stage
export const getDaysUntilNextStage = (dayStreak: number): number | null => {
    const currentStageNum = calculateBonsaiStage(dayStreak);

    // Already at max stage
    if (currentStageNum === 9) return null;

    const nextStage = BONSAI_STAGES[currentStageNum];
    return nextStage.minDays - dayStreak;
};
