import { Habit, SavedWord } from './types';

export const initialHabits: Habit[] = [
    {
        id: '1',
        title: 'Morning Meditation',
        category: 'Mindfulness',
        streak: 5,
        frequency: { type: 'daily', days: [] },
        history: {},
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        title: 'Read 30 Minutes',
        category: 'Learning',
        streak: 12,
        frequency: { type: 'daily', days: [] },
        history: {},
        createdAt: new Date().toISOString()
    },
    {
        id: '3',
        title: 'Evening Walk',
        category: 'Health',
        streak: 3,
        frequency: { type: 'custom', days: [1, 3, 5] },
        history: {},
        createdAt: new Date().toISOString()
    }
];

export const initialSavedWords: SavedWord[] = [];
