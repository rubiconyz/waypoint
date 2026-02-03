// Application-wide constants

// LocalStorage Keys
export const STORAGE_KEYS = {
    HABITS: 'habitvision_data',
    THEME: 'habitvision_theme',
    BADGES: 'habitvision_badges',
    TOTAL_HABITS: 'habitvision_total_habits_created',
    COINS: 'habitvision_coins',
    CHECKPOINTS: 'habitvision_unlocked_checkpoints',
    ACTIVE_TAB: 'habitvision_active_tab',
    WORKOUT_LOGS: 'habitvision_workout_logs',
    SAVED_WORDS: 'habitvision_saved_words',
    RECENT_VIDEOS: 'habitvision_recent_videos',
    IMMERSION_LOGS: 'habitvision_immersion_logs',
    CHALLENGES: 'habitvision_challenges',
    WALLPAPER: 'habitvision_wallpaper',
    HAS_VISITED: 'has_visited',
    SEEN_TOUR_STEPS: 'habitvision_seen_tour_steps',
} as const;

// Habit Categories
export const HABIT_CATEGORIES = [
    'Fitness',
    'Learning',
    'Mindfulness',
    'Health',
    'Reading',
    'Work',
    'Other'
] as const;

// Day abbreviations (0 = Sunday)
export const DAY_ABBREVIATIONS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

// Supported Languages for Immersion
export const TARGET_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
] as const;

export const NATIVE_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
] as const;

// Video playback speeds
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
