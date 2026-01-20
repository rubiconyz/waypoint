export type HabitStatus = 'completed' | 'partial' | 'skipped';

export interface HabitHistory {
  [date: string]: HabitStatus; // key is YYYY-MM-DD
}

export interface HabitFrequency {
  type: 'daily' | 'weekly' | 'custom';
  days: number[]; // 0-6, used for 'custom'
  repeatTarget?: number; // X times per week
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  streak: number;
  frequency: HabitFrequency;
  history: HabitHistory;
  createdAt: string; // ISO timestamp - prevents retroactive badge exploitation
  targetDuration?: number; // Optional target duration in minutes for timed habits
  order?: number; // Persistence for drag-and-drop ordering
  completedDates?: string[]; // Deprecated
  microSteps?: { id: string; text: string; completed: boolean }[]; // ADHD Micro-steps
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

// Group Challenge types
export interface ChallengeParticipant {
  odId: string;                    // User ID
  displayName: string;
  avatarColor: string;             // Hex color for mountain visualization
  avatarVariant?: '1' | '2';       // Character skin variant (1=default, 2=second_char)
  joinedAt: string;                // ISO date
  completedDays: number;           // Days habit was completed
  totalDays: number;               // Days elapsed since joining
  completionRate: number;          // 0-100%
  hasCompleted: boolean;           // Reached 100% by challenge end?
}

export interface Challenge {
  id: string;
  creatorId: string;
  habitTitle: string;              // The habit being tracked
  habitId?: string;                // Optional link to creator's habit
  title: string;                   // "30-Day Meditation Challenge"
  category?: string;               // Category of the habit (e.g. Health, Learning)
  description?: string;
  startDate: string;               // ISO date
  endDate: string;                 // ISO date
  duration: number;                // Days
  inviteCode: string;              // Unique shareable code
  participants: ChallengeParticipant[];
  isActive: boolean;               // Challenge still running
  createdAt: string;
}

export interface SavedWord {
  id: string;
  word: string;
  translation: string;
  context: string;
  videoId: string;
  timestamp: number;
  addedAt: string; // ISO date
  status: 'learning' | 'known';
  sourceTitle?: string;
  channelTitle?: string;
  mastery?: number; // 0-5
}

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export interface RecentVideo {
  id: string; // YouTube ID
  title: string;
  thumbnail: string;
  lastWatched: number; // Date.now()
  progress?: number; // timestamp in seconds
  segments?: TranscriptSegment[];
}

export interface DailyUsageLog {
  [date: string]: number; // date "YYYY-MM-DD" -> seconds watched
}