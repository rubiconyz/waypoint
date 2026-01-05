export type HabitStatus = 'completed' | 'partial' | 'skipped';

export interface HabitHistory {
  [date: string]: HabitStatus; // key is YYYY-MM-DD
}

export interface HabitFrequency {
  type: 'daily' | 'weekly' | 'custom';
  days: number[]; // 0-6, used for 'custom'
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  streak: number;
  frequency: HabitFrequency;
  history: HabitHistory;
  createdAt: string; // ISO timestamp - prevents retroactive badge exploitation
  completedDates?: string[]; // Deprecated
}

export enum AspectRatio {
  Ratio_1_1 = '1:1',
  Ratio_3_4 = '3:4',
  Ratio_4_3 = '4:3',
  Ratio_9_16 = '9:16',
  Ratio_16_9 = '16:9'
}

export enum ImageSize {
  Size_1K = '1K',
  Size_2K = '2K',
  Size_4K = '4K'
}

export type BadgeCategory = 'streak' | 'perfect' | 'collection' | 'special';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: BadgeCategory;
  requirement: number; // threshold value for unlocking
}

export interface BadgeProgress {
  unlocked: boolean;
  unlockedAt?: string; // ISO date string
  progress?: number; // current progress towards requirement
}

// Ocean Explorer types
export type FishRarity = 'starter' | 'common' | 'rare' | 'legendary' | 'special';
export type FishSize = 'small' | 'medium' | 'large';
export type PollutionLevel = 0 | 1 | 2 | 3 | 4;

export interface Fish {
  id: string;
  name: string;
  emoji: string;
  unlockStreak: number;
  rarity: FishRarity;
  description: string;
  size: FishSize;
  color?: string; // For SVG rendering if not using emoji
}

export interface OceanState {
  discoveredFish: string[]; // Fish IDs permanently unlocked
  activeFish: string[]; // Currently visible fish (based on pollution)
  pollutionLevel: PollutionLevel;
  daysSinceLastCompletion: number;
  lastCompletionDate: string | null;
  recoveryStreak: number; // Days of current recovery
  comebackCount: number; // Number of times recovered from 7+ day break
}

// Bonsai Garden types
export interface GardenState {
  currentStage: number;
  dayStreak: number;
  totalDaysCultivated: number;
  lastCheckDate: string;
}

export interface AIStudioWindow {
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}