// Muscle Recovery Data - Science-based recovery times for each muscle group
import { MuscleGroup } from './types';

// Recovery times based on muscle size and scientific research:
// - Small muscles: ~48 hours
// - Medium muscles: 48-72 hours  
// - Large muscles: 72-96 hours
// Intensity multipliers: Light (0.7x), Moderate (1x), Heavy (1.3x)

export const MUSCLE_GROUPS: MuscleGroup[] = [
    // Upper Body - Front
    { id: 'chest', name: 'Chest', recoveryHours: 72, bodyView: 'front', category: 'upper' },
    { id: 'front-delts', name: 'Front Delts', recoveryHours: 48, bodyView: 'front', category: 'upper' },
    { id: 'side-delts', name: 'Side Delts', recoveryHours: 48, bodyView: 'both', category: 'upper' },
    { id: 'biceps', name: 'Biceps', recoveryHours: 48, bodyView: 'front', category: 'upper' },
    { id: 'forearms', name: 'Forearms', recoveryHours: 48, bodyView: 'both', category: 'upper' },

    // Upper Body - Back
    { id: 'upper-back', name: 'Upper Back', recoveryHours: 72, bodyView: 'back', category: 'upper' },
    { id: 'lats', name: 'Lats', recoveryHours: 72, bodyView: 'back', category: 'upper' },
    { id: 'lower-back', name: 'Lower Back', recoveryHours: 72, bodyView: 'back', category: 'upper' },
    { id: 'rear-delts', name: 'Rear Delts', recoveryHours: 48, bodyView: 'back', category: 'upper' },
    { id: 'triceps', name: 'Triceps', recoveryHours: 48, bodyView: 'back', category: 'upper' },

    // Core
    { id: 'abs', name: 'Abs', recoveryHours: 48, bodyView: 'front', category: 'core' },
    { id: 'obliques', name: 'Obliques', recoveryHours: 48, bodyView: 'both', category: 'core' },

    // Lower Body
    { id: 'quads', name: 'Quads', recoveryHours: 72, bodyView: 'front', category: 'lower' },
    { id: 'hamstrings', name: 'Hamstrings', recoveryHours: 72, bodyView: 'back', category: 'lower' },
    { id: 'glutes', name: 'Glutes', recoveryHours: 72, bodyView: 'back', category: 'lower' },
    { id: 'calves', name: 'Calves', recoveryHours: 48, bodyView: 'back', category: 'lower' },
    { id: 'hip-flexors', name: 'Hip Flexors', recoveryHours: 48, bodyView: 'front', category: 'lower' },
];

// Intensity multipliers for recovery time
export const INTENSITY_MULTIPLIERS: Record<'light' | 'moderate' | 'heavy', number> = {
    light: 0.7,
    moderate: 1.0,
    heavy: 1.3,
};

// Get recovery percentage for a muscle (0 = just worked, 100 = fully recovered)
export function getMuscleRecoveryPercentage(
    muscleId: string,
    workoutLogs: { date: string; muscleGroups: string[]; intensity: 'light' | 'moderate' | 'heavy' }[]
): number {
    const muscle = MUSCLE_GROUPS.find(m => m.id === muscleId);
    if (!muscle) return 100;

    const now = Date.now();

    // Find the most recent workout that included this muscle
    const sortedLogs = [...workoutLogs]
        .filter(log => log.muscleGroups.includes(muscleId))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedLogs.length === 0) return 100;

    const lastWorkout = sortedLogs[0];
    const workoutDate = new Date(lastWorkout.date).getTime();
    const hoursSinceWorkout = (now - workoutDate) / (1000 * 60 * 60);

    const recoveryTime = muscle.recoveryHours * INTENSITY_MULTIPLIERS[lastWorkout.intensity];
    const recoveryPercent = Math.min(100, Math.round((hoursSinceWorkout / recoveryTime) * 100));

    return recoveryPercent;
}

// Get color based on recovery percentage
export function getRecoveryColor(percentage: number): string {
    if (percentage >= 100) return '#22c55e'; // Green - fully recovered
    if (percentage >= 75) return '#84cc16'; // Lime - almost recovered
    if (percentage >= 50) return '#eab308'; // Yellow - recovering
    if (percentage >= 25) return '#f97316'; // Orange - fatigued
    return '#ef4444'; // Red - overworked
}

// Get recovery status text
export function getRecoveryStatus(percentage: number): string {
    if (percentage >= 100) return 'Recovered';
    if (percentage >= 75) return 'Almost Ready';
    if (percentage >= 50) return 'Recovering';
    if (percentage >= 25) return 'Fatigued';
    return 'Needs Rest';
}

// Get estimated hours until full recovery
export function getHoursUntilRecovered(
    muscleId: string,
    workoutLogs: { date: string; muscleGroups: string[]; intensity: 'light' | 'moderate' | 'heavy' }[]
): number {
    const muscle = MUSCLE_GROUPS.find(m => m.id === muscleId);
    if (!muscle) return 0;

    const sortedLogs = [...workoutLogs]
        .filter(log => log.muscleGroups.includes(muscleId))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedLogs.length === 0) return 0;

    const lastWorkout = sortedLogs[0];
    const workoutDate = new Date(lastWorkout.date).getTime();
    const now = Date.now();
    const hoursSinceWorkout = (now - workoutDate) / (1000 * 60 * 60);

    const recoveryTime = muscle.recoveryHours * INTENSITY_MULTIPLIERS[lastWorkout.intensity];
    const hoursRemaining = Math.max(0, recoveryTime - hoursSinceWorkout);

    return Math.round(hoursRemaining);
}
