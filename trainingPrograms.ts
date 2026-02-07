// Training Program definitions for structured workout splits
import { MUSCLE_GROUPS } from './muscleRecoveryData';

export interface ProgramDay {
    name: string;
    muscles: string[]; // muscle IDs
    isRestDay?: boolean;
}

export interface TrainingProgram {
    id: string;
    name: string;
    shortName: string;
    description: string;
    daysPerWeek: number;
    days: ProgramDay[];
    icon: string;
}

// Muscle group helpers
const PUSH_MUSCLES = ['chest', 'front-delts', 'side-delts', 'triceps'];
const PULL_MUSCLES = ['upper-back', 'lats', 'rear-delts', 'biceps', 'forearms'];
const LEG_MUSCLES = ['quads', 'hamstrings', 'glutes', 'calves', 'hip-flexors'];
const UPPER_MUSCLES = ['chest', 'upper-back', 'lats', 'front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps', 'forearms'];
const LOWER_MUSCLES = ['quads', 'hamstrings', 'glutes', 'calves', 'hip-flexors'];
const CORE_MUSCLES = ['abs', 'obliques', 'lower-back'];
const ALL_MUSCLES = MUSCLE_GROUPS.map(m => m.id);

// Bro split specific
const CHEST_DAY = ['chest', 'front-delts', 'triceps'];
const BACK_DAY = ['upper-back', 'lats', 'lower-back', 'rear-delts', 'biceps'];
const SHOULDER_DAY = ['front-delts', 'side-delts', 'rear-delts'];
const ARMS_DAY = ['biceps', 'triceps', 'forearms'];

// Arnold split specific
const ARNOLD_CHEST_BACK = ['chest', 'upper-back', 'lats'];
const ARNOLD_SHOULDERS_ARMS = ['front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps'];

export const TRAINING_PROGRAMS: TrainingProgram[] = [
    {
        id: 'ppl',
        name: 'Push Pull Legs',
        shortName: 'PPL',
        description: '6-day split targeting push, pull, and leg movements',
        daysPerWeek: 6,
        icon: '💪',
        days: [
            { name: 'Push', muscles: PUSH_MUSCLES },
            { name: 'Pull', muscles: PULL_MUSCLES },
            { name: 'Legs', muscles: LEG_MUSCLES },
            { name: 'Push', muscles: PUSH_MUSCLES },
            { name: 'Pull', muscles: PULL_MUSCLES },
            { name: 'Legs', muscles: LEG_MUSCLES },
            { name: 'Rest', muscles: [], isRestDay: true },
        ],
    },
    {
        id: 'bro-split',
        name: 'Bro Split',
        shortName: 'Bro',
        description: 'Classic 5-day bodypart split',
        daysPerWeek: 5,
        icon: '🏋️',
        days: [
            { name: 'Chest', muscles: CHEST_DAY },
            { name: 'Back', muscles: BACK_DAY },
            { name: 'Shoulders', muscles: SHOULDER_DAY },
            { name: 'Arms', muscles: ARMS_DAY },
            { name: 'Legs', muscles: LEG_MUSCLES },
            { name: 'Rest', muscles: [], isRestDay: true },
            { name: 'Rest', muscles: [], isRestDay: true },
        ],
    },
    {
        id: 'upper-lower',
        name: 'Upper / Lower',
        shortName: 'U/L',
        description: '4-day split alternating upper and lower body',
        daysPerWeek: 4,
        icon: '⬆️',
        days: [
            { name: 'Upper', muscles: UPPER_MUSCLES },
            { name: 'Lower', muscles: [...LOWER_MUSCLES, ...CORE_MUSCLES] },
            { name: 'Rest', muscles: [], isRestDay: true },
            { name: 'Upper', muscles: UPPER_MUSCLES },
            { name: 'Lower', muscles: [...LOWER_MUSCLES, ...CORE_MUSCLES] },
            { name: 'Rest', muscles: [], isRestDay: true },
            { name: 'Rest', muscles: [], isRestDay: true },
        ],
    },
    {
        id: 'full-body',
        name: 'Full Body',
        shortName: 'Full',
        description: '3-day full body workouts with rest days between',
        daysPerWeek: 3,
        icon: '🔥',
        days: [
            { name: 'Full Body A', muscles: ALL_MUSCLES },
            { name: 'Rest', muscles: [], isRestDay: true },
            { name: 'Full Body B', muscles: ALL_MUSCLES },
            { name: 'Rest', muscles: [], isRestDay: true },
            { name: 'Full Body C', muscles: ALL_MUSCLES },
            { name: 'Rest', muscles: [], isRestDay: true },
            { name: 'Rest', muscles: [], isRestDay: true },
        ],
    },
    {
        id: 'arnold',
        name: 'Arnold Split',
        shortName: 'Arnold',
        description: '6-day high volume split inspired by Arnold Schwarzenegger',
        daysPerWeek: 6,
        icon: '🏆',
        days: [
            { name: 'Chest + Back', muscles: ARNOLD_CHEST_BACK },
            { name: 'Shoulders + Arms', muscles: ARNOLD_SHOULDERS_ARMS },
            { name: 'Legs', muscles: LEG_MUSCLES },
            { name: 'Chest + Back', muscles: ARNOLD_CHEST_BACK },
            { name: 'Shoulders + Arms', muscles: ARNOLD_SHOULDERS_ARMS },
            { name: 'Legs', muscles: LEG_MUSCLES },
            { name: 'Rest', muscles: [], isRestDay: true },
        ],
    },
];

// Get program by ID
export function getProgram(id: string): TrainingProgram | undefined {
    return TRAINING_PROGRAMS.find(p => p.id === id);
}

// Get today's workout day based on program and start date
export function getTodaysProgramDay(
    programId: string,
    startDate: string,
    currentDayOverride?: number
): ProgramDay | null {
    const program = getProgram(programId);
    if (!program) return null;

    if (currentDayOverride !== undefined) {
        return program.days[currentDayOverride % program.days.length];
    }

    const start = new Date(startDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dayIndex = daysDiff % program.days.length;

    return program.days[dayIndex];
}

// Get muscle names from IDs
export function getMuscleNames(muscleIds: string[]): string[] {
    return muscleIds
        .map(id => MUSCLE_GROUPS.find(m => m.id === id)?.name)
        .filter((name): name is string => !!name);
}
