import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HabitList } from './components/HabitList';
import { Analytics } from './components/Analytics';
import { Badges } from './components/Badges';
import { ChallengesTab } from './components/ChallengesTab';
import { BadgeNotification } from './components/BadgeComponents';
import { MountainClimber } from './components/MountainClimber';
import { AuthModal } from './components/AuthModal';
import { Habit, HabitFrequency, Badge, BadgeProgress, Challenge } from './types';
import { checkBadgeUnlocks } from './badges';
import { ListTodo, BarChart2, Sun, Moon, CheckCircle2, Award, Mountain, LogOut, User, Menu, Command, Plus, Coins, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from './contexts/AuthContext';
import { SettingsSidebar } from './components/SettingsSidebar';
import { LandingPage } from './components/LandingPage';
import { FocusMode } from './components/FocusMode';
import { SpotlightTour, TourStep } from './components/SpotlightTour';
import { BrainCircuit } from 'lucide-react';
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import {
  saveHabitsToFirestore,
  loadHabitsFromFirestore,
  saveBadgeProgressToFirestore,
  loadBadgeProgressFromFirestore,
  saveUserStatsToFirestore,
  loadUserStatsFromFirestore,
  deleteHabitFromFirestore
} from './services/firestoreService';
import {
  createChallenge,
  getDaysRemaining,
  addParticipant,
  updateParticipantName,
  updateParticipantProgress,
  isChallengeActive
} from './challengeUtils';
import {
  saveChallengeToFirestore,
  findChallengeByInviteCode,
  updateChallengeInFirestore,
  loadUserChallengesFromFirestore,
  deleteChallengeFromFirestore,
  subscribeToUserChallenges
} from './services/firestoreService';

const STORAGE_KEY = 'habitvision_data';
const THEME_KEY = 'habitvision_theme';
const BADGES_KEY = 'habitvision_badges';
const TOTAL_HABITS_KEY = 'habitvision_total_habits_created';
const COINS_KEY = 'habitvision_coins';
const CHECKPOINTS_KEY = 'habitvision_unlocked_checkpoints';
const ACTIVE_TAB_KEY = 'habitvision_active_tab';

// Helper function to get date string in local timezone (YYYY-MM-DD)
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get week number
const getWeekKey = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
};

// Helper to safely parse local date string 'YYYY-MM-DD' to Date object at local midnight
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const calculateStreak = (habit: Habit) => {
  // Weekly Frequency Logic
  if (habit.frequency.type === 'weekly' && habit.frequency.repeatTarget) {
    const target = habit.frequency.repeatTarget;
    let streak = 0;

    // Group history by week using consistent local dates
    const historyByWeek: Record<string, number> = {};
    Object.keys(habit.history).forEach(dateStr => {
      if (habit.history[dateStr] === 'completed') {
        const localDate = parseLocalDate(dateStr);
        const weekKey = getWeekKey(localDate);
        historyByWeek[weekKey] = (historyByWeek[weekKey] || 0) + 1;
      }
    });

    let currentCheckDate = new Date();
    currentCheckDate.setHours(0, 0, 0, 0); // Ensure clean start
    let safety = 100;

    // Check "Current Week" first
    const currentWeekKey = getWeekKey(currentCheckDate);
    // If current week is met, it counts!
    if ((historyByWeek[currentWeekKey] || 0) >= target) {
      streak++; // e.g. streak 1
    }

    // Move to previous week
    currentCheckDate.setDate(currentCheckDate.getDate() - 7);

    // Iterate backwards
    while (safety > 0) {
      const weekKey = getWeekKey(currentCheckDate);
      if ((historyByWeek[weekKey] || 0) >= target) {
        streak++;
        currentCheckDate.setDate(currentCheckDate.getDate() - 7);
      } else {
        // Break usage: If a week is MISSED, the streak stops.

        // EDGE CASE: If I am in "Current Week" and have streak of 0 (because incomplete).
        // I check "Previous Week". If Previous Week is completed, streak should be 1?
        // My current logic:
        // current (0/4) -> streak = 0.
        // check prev (4/4) -> streak = 1.
        // So yes, it counts past streaks correctly even if current week is partial.
        break;
      }
      safety--;
    }
    return streak;
  }

  // Daily / Custom Logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let checkDate = new Date(today);
  let maxIterations = 365 * 2;

  while (maxIterations > 0) {
    const dateStr = getLocalDateString(checkDate);
    const status = habit.history[dateStr];

    const dayOfWeek = checkDate.getDay();
    let isDue = true;

    if (habit.frequency.type === 'custom') {
      isDue = habit.frequency.days.includes(dayOfWeek);
    } else if (habit.frequency.type === 'weekly') {
      isDue = true; // Fallback for old weekly
    }

    // If this day was not due, skip it without breaking the streak
    if (!isDue) {
      checkDate.setDate(checkDate.getDate() - 1);
      maxIterations--;
      continue;
    }

    // Check the status for days that were due
    if (status === 'completed') {
      streak++;
    } else if (status === 'skipped') {
      // Skipped days don't break the streak, but don't increment it
    } else if (status === 'partial') {
      // Partial doesn't break the streak, but doesn't increment it
    } else {
      // No status - habit was due but not completed
      const isToday = checkDate.getTime() === today.getTime();

      if (isToday) {
        // Grace period: if today isn't done yet, don't break the streak
        // Just continue to check yesterday
      } else {
        // Past day that was due but not completed - break the streak
        break;
      }
    }

    checkDate.setDate(checkDate.getDate() - 1);
    maxIterations--;
  }

  return streak;
};

// New Helper: Calculate Best Streak of Perfect Days
const calculatePerfectDayStreak = (habits: Habit[]) => {
  if (habits.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let maxStreak = 0;
  let currentStreak = 0;

  // Check last 365 days
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);

    const dueHabits = habits.filter(h => {
      if (h.frequency.type === 'daily') return true;
      if (h.frequency.type === 'custom') return h.frequency.days.includes(d.getDay());
      return true;
    });

    if (dueHabits.length === 0) {
      // If no habits due, count as perfect day
      currentStreak++;
    } else {
      const allDone = dueHabits.every(h => {
        const s = h.history[dateStr];
        return s === 'completed' || s === 'skipped';
      });
      if (allDone) {
        currentStreak++;
      } else {
        // Break streak
        currentStreak = 0;
      }
    }

    if (currentStreak > maxStreak) maxStreak = currentStreak;
  }
  return maxStreak;
};

const App: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLanding, setShowLanding] = useState(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('has_visited');
    if (hasVisited) return false;

    // Check if user has existing data (legacy user)
    const savedData = localStorage.getItem('habitvision_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Legacy user found, mark as visited and skip landing
          localStorage.setItem('has_visited', 'true');
          return false;
        }
      } catch (e) {
        // invalid data, treat as new
      }
    }

    return true;
  });

  // Interactive Tour State
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const [seenTourSteps, setSeenTourSteps] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('habitvision_seen_tour_steps') || '[]');
  });

  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics' | 'badges' | 'challenges' | 'mountain'>(() => {
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    return (saved as any) || 'tracker';
  });

  const [wallpaper, setWallpaper] = useState<string>(() => {
    return localStorage.getItem('habitvision_wallpaper') || 'none';
  });

  // Persist wallpaper
  useEffect(() => {
    localStorage.setItem('habitvision_wallpaper', wallpaper);
  }, [wallpaper]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // PERSIST: Save active tab
  useEffect(() => {
    localStorage.setItem(ACTIVE_TAB_KEY, activeTab);
  }, [activeTab]);

  const handleStartApp = () => {
    localStorage.setItem('has_visited', 'true');
    setShowLanding(false);
  };



  // Keyboard Shortcuts Effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd (Mac) or Ctrl (Windows)
      if (e.metaKey || e.ctrlKey) {

        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            setIsSettingsOpen(prev => !prev);
            break;
          case 'd':
            e.preventDefault();
            // We need to access toggleTheme here, but it's defined later.
            // Best to move toggleTheme definition UP or use a ref/trigger.
            // Actually, we can just trigger the button click or duplicate logic for now since toggleTheme is simple.
            // Better yet, let's just dispatch a custom event or define logic here?
            // To keep it clean, let's just toggle state directly if possible, but isDarkMode is state.
            // Let's rely on finding the button? No, that's brittle.
            // Let's define the logic inline since it matches the effect dependency
            setIsDarkMode(prev => {
              const newMode = !prev;
              localStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
              if (newMode) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
              return newMode;
            });
            break;
          case 'i':
            e.preventDefault();
            setActiveTab('tracker');
            // Try to find the input first (if form is open)
            const input = document.querySelector('input[placeholder="What do you want to track?"]') as HTMLInputElement;
            if (input) {
              input.focus();
            } else {
              // If form not open, click the "New Habit" button
              const btn = document.getElementById('btn-new-habit');
              if (btn) btn.click();
            }
            break;
          case '1':
            e.preventDefault();
            setActiveTab('tracker');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('analytics');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('badges');
            break;
          case '4':
            e.preventDefault();
            setActiveTab('mountain');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize habits directly from localStorage to avoid race condition
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // MIGRATION: Ensure all habits have createdAt and proper structure
        return parsed.map((h: any) => {
          const dates = Object.keys(h.history || {});
          const earliestDate = dates.length > 0 ? dates.sort()[0] : new Date().toISOString();

          if (Array.isArray(h.completedDates)) {
            const history: any = {};
            h.completedDates.forEach((d: string) => {
              history[d] = 'completed';
            });
            const historyDates = Object.keys(history);
            const creationDate = historyDates.length > 0 ? historyDates.sort()[0] : earliestDate;

            return {
              ...h,
              history,
              completedDates: undefined,
              frequency: h.frequency || { type: 'daily', days: [] },
              createdAt: h.createdAt || creationDate
            };
          }
          return {
            ...h,
            frequency: h.frequency || { type: 'daily', days: [] },
            createdAt: h.createdAt || earliestDate
          };
        });
      } catch (e) {
        console.error("Failed to parse habits", e);
      }
    }
    // Return default habits if no saved data
    // Return empty array if no saved data (clean slate for new users)
    return [];
  });

  // Challenges state - load from storage or create demo
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('habitvision_challenges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse challenges', e);
      }
    }
    return [];
  });

  // FIREBASE: Load Challenges on Login & Sync Local to Remote
  useEffect(() => {
    if (!user) return;

    const syncChallenges = async () => {
      try {
        // 2. Push Local -> Remote (Legacy Sync / Offline creations)
        const saved = localStorage.getItem('habitvision_challenges');
        if (saved) {
          try {
            const localChallenges = JSON.parse(saved) as Challenge[];
            for (const localC of localChallenges) {
              // PROTECTION: Only push if WE are the creator (or it's a guest challenge we created).
              // This prevents participants from re-uploading a challenge that the Admin deleted.
              const isOwner = localC.creatorId === user.uid || localC.creatorId === 'guest';

              if (isOwner) {
                await saveChallengeToFirestore(localC);
              }
            }
          } catch (e) { /* ignore parse error */ }
        }

        // 3. Subscribe to Remote (Source of Truth)
        // This replaces the one-time Pull. It keeps us in sync with Global state (e.g. new joiners, deletions).
        // Since we pushed our local stuff first, the subscription will pick it up (if we own it).
        // Note: subscribeToUserChallenges returns an unsubscribe function.
      } catch (e: any) {
        console.error("Failed to sync challenges (Push)", e);
      }
    };

    // Run the Push Sync once
    syncChallenges();

    // Start Subscription
    const unsubscribe = subscribeToUserChallenges(user.uid, (remoteChallenges) => {
      // Update local state with authoritative remote state
      setChallenges(remoteChallenges);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount/user change
  }, [user]); // Run only on user change to avoid loops

  // Sync user name in challenges when user updates/logs in
  useEffect(() => {
    if (user && challenges.length > 0) {
      const currentName = user.email?.split('@')[0] || 'User';
      const userId = user.uid;

      let hasChanges = false;
      const updatedChallenges = challenges.map(challenge => {
        const participant = challenge.participants.find(p => p.odId === userId);
        if (participant && participant.displayName !== currentName) {
          hasChanges = true;
          return updateParticipantName(challenge, userId, currentName);
        }
        return challenge;
      });

      if (hasChanges) {
        setChallenges(updatedChallenges);
        localStorage.setItem('habitvision_challenges', JSON.stringify(updatedChallenges));
      }
    }
  }, [user]); // Removed 'challenges' from deps to avoid loop, though logic handles it. 
  // Actually, including challenges is fine if we check hasChanges properly, but let's be safe.
  // Ideally we only want to run when 'user' changes.

  // PERSIST: Save challenges to localStorage
  useEffect(() => {
    localStorage.setItem('habitvision_challenges', JSON.stringify(challenges));
  }, [challenges]);

  // SYNC: Update challenge progress from habit completions
  useEffect(() => {
    if (challenges.length === 0) return;

    const currentUserId = user?.uid || 'guest';
    let hasChanges = false;

    const updated = challenges.map(challenge => {
      const habit = habits.find(h => h.id === challenge.habitId);
      if (!habit) return challenge;

      const userIdx = challenge.participants.findIndex(p => p.odId === currentUserId);
      if (userIdx === -1) return challenge;

      // Get date range as YYYY-MM-DD strings
      const startStr = challenge.startDate.split('T')[0];
      const endStr = challenge.endDate.split('T')[0];

      // Count completed days in range
      const completed = Object.keys(habit.history || {}).filter(dateKey => {
        return dateKey >= startStr && dateKey <= endStr && habit.history[dateKey] === 'completed';
      }).length;

      if (completed !== challenge.participants[userIdx].completedDays) {
        hasChanges = true;
        const rate = Math.round((completed / challenge.duration) * 100);
        const newParticipants = [...challenge.participants];
        newParticipants[userIdx] = {
          ...newParticipants[userIdx],
          completedDays: completed,
          totalDays: challenge.duration,
          completionRate: rate,
          hasCompleted: rate >= 100
        };
        return { ...challenge, participants: newParticipants };
      }

      return challenge;
    });

    if (hasChanges) {
      if (hasChanges) {
        setChallenges(updated);
        // FIREBASE: Save progress updates to remote
        if (user) {
          updated.forEach(c => saveChallengeToFirestore(c));
        }
      }
    }
  }, [habits, user?.uid]);

  // 2. Initial Tour (Tracker + Coins)
  useEffect(() => {
    if (showLanding || activeTab !== 'tracker') return;

    // Check if we should show initial tour
    if (habits.length === 0 && !seenTourSteps.includes('start')) {
      const timer = setTimeout(() => {
        setTourSteps([
          {
            targetId: 'empty-state-grid',
            title: "Quick Start",
            content: "Pick a starter pack to begin effortlessly.",
            position: 'bottom'
          },
          {
            targetId: 'btn-new-habit',
            title: "Custom Habits",
            content: "Or create any habit you want from scratch.",
            position: 'left'
          },
          {
            targetId: 'stats-coins',
            title: "Earn Coins",
            content: "Every habit you complete earns you coins. Spend them on themes and upgrades!",
            position: 'bottom'
          }
        ]);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [habits.length, activeTab, seenTourSteps, showLanding]);

  // 3. Manual Mountain Guide Trigger
  const handleShowMountainGuide = () => {
    setTourSteps([
      {
        targetId: 'nav-mountain',
        title: "Your Journey",
        content: "This is your progress visualizer. As you complete habits, your avatar climbs higher!",
        position: 'bottom'
      },
      {
        targetId: 'unlock-card',
        title: "Unlock Checkpoints",
        content: "Spend your earned coins here to unlock new altitudes.",
        position: 'top'
        // If unlock card is hidden (finished game), SpotlightTour handles missing elements gracefully now
      }
    ]);
  };

  const handleTourComplete = () => {
    // Mark current steps as seen
    let justSeen = '';
    if (tourSteps[0]?.targetId === 'empty-state-grid') justSeen = 'start';
    if (tourSteps[0]?.targetId === 'stats-coins') justSeen = 'coins';
    // Mountain is manual now, so we don't necessarily need to mark it 'seen' to prevent re-show, 
    // but we can if we want. For manual trigger, we always show.

    if (justSeen) {
      const newSeen = [...seenTourSteps, justSeen];
      setSeenTourSteps(newSeen);
      localStorage.setItem('habitvision_seen_tour_steps', JSON.stringify(newSeen));
    }
    setTourSteps([]);
  };

  // PERSIST: Save challenges to localStorage
  useEffect(() => {
    localStorage.setItem('habitvision_challenges', JSON.stringify(challenges));
  }, [challenges]);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Badge State - Initialize from localStorage to avoid race condition
  const [badgeProgress, setBadgeProgress] = useState<Record<string, BadgeProgress>>(() => {
    const savedBadges = localStorage.getItem(BADGES_KEY);
    if (savedBadges) {
      try {
        return JSON.parse(savedBadges);
      } catch (e) {
        console.error("Failed to parse badges", e);
      }
    }
    return {};
  });
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  // ANTI-EXPLOIT: Track max habits ever created - Initialize from localStorage
  const [totalHabitsCreated, setTotalHabitsCreated] = useState(() => {
    const savedTotal = localStorage.getItem(TOTAL_HABITS_KEY);
    if (savedTotal) {
      return parseInt(savedTotal, 10);
    }
    // Initialize with current habits length on first load
    const initialTotal = habits.length;
    localStorage.setItem(TOTAL_HABITS_KEY, initialTotal.toString());
    return initialTotal;
  });

  // Mountain Game State
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem(COINS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [unlockedCheckpoints, setUnlockedCheckpoints] = useState<number[]>(() => {
    const saved = localStorage.getItem(CHECKPOINTS_KEY);
    return saved ? JSON.parse(saved) : [0]; // 0 = Camp (default)
  });



  // No longer need isInitialized - state is loaded synchronously in lazy initializer

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Firebase Sync - Load data when user logs in
  useEffect(() => {
    if (!user || authLoading) return;

    const loadFromFirestore = async () => {
      try {
        // Load all data from Firestore
        const [firestoreHabits, firestoreBadges, firestoreStats] = await Promise.all([
          loadHabitsFromFirestore(user.uid),
          loadBadgeProgressFromFirestore(user.uid),
          loadUserStatsFromFirestore(user.uid)
        ]);

        // If Firestore has data, use it (cloud is source of truth)
        if (firestoreHabits && firestoreHabits.length > 0) {
          setHabits(firestoreHabits);
          if (firestoreBadges) setBadgeProgress(firestoreBadges);
          if (firestoreStats) {
            if (firestoreStats.totalHabitsCreated !== undefined) setTotalHabitsCreated(firestoreStats.totalHabitsCreated);
            if (firestoreStats.coins !== undefined) setCoins(firestoreStats.coins);
            if (firestoreStats.unlockedCheckpoints !== undefined) setUnlockedCheckpoints(firestoreStats.unlockedCheckpoints);
          }
        } else {
          // First login - migrate localStorage data to Firestore
          const localHabits = habits;
          const localBadges = badgeProgress;
          const localStats = {
            totalHabitsCreated,
            coins,
            unlockedCheckpoints
          };

          if (localHabits.length > 0) {
            await saveHabitsToFirestore(user.uid, localHabits);
            await saveBadgeProgressToFirestore(user.uid, localBadges);
            await saveUserStatsToFirestore(user.uid, localStats);
          }
        }
      } catch (error) {
        console.error('Error syncing with Firestore:', error);
      }
    };

    loadFromFirestore();
  }, [user?.uid, authLoading]);

  // Save to Firestore when data changes (if user is logged in)
  useEffect(() => {
    if (!user || authLoading) return;

    const saveToFirestore = async () => {
      try {
        await saveHabitsToFirestore(user.uid, habits);
      } catch (error) {
        console.error('Error saving habits to Firestore:', error);
      }
    };

    saveToFirestore();
  }, [habits, user?.uid, authLoading]);

  useEffect(() => {
    if (!user || authLoading) return;

    const saveBadgesToFirestore = async () => {
      try {
        await saveBadgeProgressToFirestore(user.uid, badgeProgress);
        await saveBadgeProgressToFirestore(user.uid, badgeProgress);
        await saveUserStatsToFirestore(user.uid, {
          totalHabitsCreated,
          coins,
          unlockedCheckpoints
        });
      } catch (error) {
        console.error('Error saving badges to Firestore:', error);
      }
    };

    saveBadgesToFirestore();
  }, [badgeProgress, totalHabitsCreated, coins, unlockedCheckpoints, user?.uid, authLoading]);



  // Auto-save habits (runs after first render since state is initialized synchronously)
  const isFirstRender = useRef(true);
  useEffect(() => {
    // Skip save on first render (state already loaded from localStorage)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Always save, even if habits array is empty (to persist deletions)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    if (habits.length > 0) {
      setLastSaved(new Date());
    }

    // Check for newly unlocked badges
    const newBadges = checkBadgeUnlocks(habits, badgeProgress, totalHabitsCreated);
    if (newBadges.length > 0) {
      const updatedBadges = { ...badgeProgress };
      newBadges.forEach(({ badge, progress }) => {
        updatedBadges[badge.id] = progress;
        // Show notification for first newly unlocked badge
        if (!newlyUnlockedBadge) {
          setNewlyUnlockedBadge(badge);
          triggerConfetti();
        }
      });
      setBadgeProgress(updatedBadges);
      // Save updated badges to localStorage
      localStorage.setItem(BADGES_KEY, JSON.stringify(updatedBadges));
    }


    // Persist Stats
    localStorage.setItem(COINS_KEY, coins.toString());
    localStorage.setItem(CHECKPOINTS_KEY, JSON.stringify(unlockedCheckpoints));

  }, [habits, badgeProgress, totalHabitsCreated, coins, unlockedCheckpoints]);



  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Sound effects using Web Audio API
  const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Classic "correct answer" sound - two quick ascending notes
    const playNote = (frequency: number, startTime: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.25, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    };

    const now = audioContext.currentTime;
    playNote(523.25, now);       // C5 (first note)
    playNote(659.25, now + 0.08); // E5 (second note, slightly higher)
  };

  const playPartialSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 392; // G4 note
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  };

  const playSkipSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 294; // D4 note
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const updateHabitStatus = (id: string, date: string, status: 'completed' | 'partial' | 'skipped' | null) => {
    // Play sound based on status
    if (status === 'completed') {
      playCompletionSound();
    } else if (status === 'partial') {
      playPartialSound();
    } else if (status === 'skipped') {
      playSkipSound();
    }

    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit;

      const newHistory = { ...habit.history };
      if (status === null) {
        delete newHistory[date];
      } else {
        newHistory[date] = status;
      }

      const tempHabit = { ...habit, history: newHistory };
      const newStreak = calculateStreak(tempHabit);

      if (status === 'completed' && newStreak > habit.streak && (newStreak % 7 === 0 || newStreak === 1 || newStreak === 30)) {
        triggerConfetti();
      }

      // --- SYNC WITH CHALLENGES ---
      // If this habit (by title) is part of any active challenge, update progress
      if (challenges.length > 0 && user) {
        // Find matching active challenges
        const linkedChallenges = challenges.filter(c =>
          c.habitTitle === habit.title &&
          isChallengeActive(c) &&
          c.participants.some(p => p.odId === user.uid)
        );

        if (linkedChallenges.length > 0) {
          // Identify completed dates within challenge window
          const completedDates = Object.entries(newHistory)
            .filter(([d, s]) => s === 'completed') // Only completed
            .map(([d]) => d);

          linkedChallenges.forEach(challenge => {
            // Count valid days for THIS challenge's range
            const validCount = completedDates.filter(d =>
              d >= challenge.startDate.split('T')[0] &&
              d <= challenge.endDate.split('T')[0]
            ).length;

            // Prepare updated challenge object
            const updatedChallenge = updateParticipantProgress(challenge, user.uid, validCount);

            // Update Local State (Optimistic)
            setChallenges(prev => prev.map(c => c.id === updatedChallenge.id ? updatedChallenge : c));

            // Update Remote (Async)
            saveChallengeToFirestore(updatedChallenge).catch(err => console.error("Sync to challenge failed", err));
          });
        }
      }
      // ----------------------------

      return {
        ...habit,
        history: newHistory,
        streak: newStreak
      };
    }));

    // Coin Logic (Anti-Exploit)
    const habit = habits.find(h => h.id === id);
    if (habit) {
      const oldStatus = habit.history[date];
      // If changing TO completed (from null/skipped/partial) -> Add Coin
      if (status === 'completed' && oldStatus !== 'completed') {
        setCoins(prev => prev + 1);
      }
      // If changing FROM completed (to null/skipped/partial) -> Deduct Coin
      else if (oldStatus === 'completed' && status !== 'completed') {
        setCoins(prev => Math.max(0, prev - 1));
      }
    }
  };

  const addHabit = (title: string, category: string, frequency: HabitFrequency, targetDuration?: number) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      category,
      streak: 0,
      history: {},
      frequency,
      createdAt: new Date().toISOString(),
      ...(targetDuration && { targetDuration })
    };
    setHabits([...habits, newHabit]);

    // ANTI-EXPLOIT: Track total habits created (never decreases)
    const newTotal = Math.max(totalHabitsCreated, habits.length + 1);
    setTotalHabitsCreated(newTotal);
    localStorage.setItem(TOTAL_HABITS_KEY, newTotal.toString());
  };

  const editHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(habit =>
      habit.id === id ? { ...habit, ...updates } : habit
    ));
  };

  const deleteHabit = async (id: string) => {
    // Optimistic update: Remove locally immediately
    setHabits(prev => prev.filter(h => String(h.id) !== String(id)));

    if (user) {
      try {
        await deleteHabitFromFirestore(user.uid, id);
      } catch (error) {
        console.error('Error deleting habit from Firestore:', error);
      }
    }
  };

  const reorderHabits = (reorderedHabits: Habit[]) => {
    setHabits(reorderedHabits);
  };

  const unlockCheckpoint = (checkpointId: number, cost: number) => {
    if (coins >= cost && !unlockedCheckpoints.includes(checkpointId)) {
      setCoins(prev => prev - cost);
      setUnlockedCheckpoints(prev => [...prev, checkpointId]);
      triggerConfetti();
    }
  };


  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Progress today
  const todayStr = getLocalDateString(new Date());
  const dueHabitsToday = habits.filter(h => {
    if (h.frequency.type === 'daily') return true;
    if (h.frequency.type === 'custom') return h.frequency.days.includes(new Date().getDay());
    return true;
  });

  const completedCount = dueHabitsToday.filter(h => h.history[todayStr] === 'completed' || h.history[todayStr] === 'skipped').length;
  const progressPercentage = dueHabitsToday.length > 0 ? Math.round((completedCount / dueHabitsToday.length) * 100) : 0;

  // Calculate Perfect Streak
  const perfectStreak = useMemo(() => calculatePerfectDayStreak(habits), [habits]);

  // Handle Join Challenge (Async with Firestore)
  const handleJoinChallenge = async (inviteCode: string) => {
    const currentUserId = user?.uid || 'guest';
    const displayName = user?.email?.split('@')[0] || 'Guest';

    // 1. Check if we already have it locally
    let challenge = challenges.find(c => c.inviteCode === inviteCode);

    // 2. If not, look it up in Firestore
    if (!challenge) {
      // PERMISSION CHECK: Guests cannot query Firestore usually
      if (!user) {
        const confirmLogin = confirm("To join a remote challenge, you must be signed in. Sign in now?");
        if (confirmLogin) {
          setShowAuthModal(true);
        }
        return;
      }

      try {
        const remoteChallenge = await findChallengeByInviteCode(inviteCode);
        if (remoteChallenge) {
          challenge = remoteChallenge;
        }
      } catch (error: any) {
        console.error("Error finding challenge", error);
        alert(`Error finding challenge: ${error.message}`);
        return;
      }
    }

    if (challenge) {
      if (challenge.participants.some(p => p.odId === currentUserId)) {
        alert('You have already joined this challenge!');
        return;
      }

      const updated = addParticipant(challenge, currentUserId, displayName);

      // Validate: Challenge must allow this user (e.g. valid habit data?). 
      // For now, assume open join.

      // Update Local State
      setChallenges(prev => {
        // If it existed, update it. If it's new (from remote), add it.
        const exists = prev.find(p => p.id === updated.id);
        if (exists) {
          return prev.map(c => c.id === updated.id ? updated : c);
        }
        return [...prev, updated];
      });

      // Update Remote
      if (user) {
        await saveChallengeToFirestore(updated);
      }

      // AUTO-CREATE HABIT: If user doesn't have this habit, create it
      const existingHabit = habits.find(h => h.title === updated.habitTitle);
      if (!existingHabit) {
        const newHabit: Habit = {
          id: Date.now().toString(), // Helper for unique ID
          title: updated.habitTitle,
          category: updated.category || 'Health', // Use challenge category (e.g. from original habit) or default to Health
          streak: 0,
          history: {},
          frequency: { type: 'daily', days: [] },
          createdAt: new Date().toISOString()
        };
        setHabits(prev => [...prev, newHabit]);

        // Track stats
        const newTotal = Math.max(totalHabitsCreated, habits.length + 1);
        setTotalHabitsCreated(newTotal);
        localStorage.setItem(TOTAL_HABITS_KEY, newTotal.toString());

        alert(`Successfully joined "${updated.title}"!\nA new habit "${updated.habitTitle}" has been added to your tracker.`);
      } else {
        alert(`Successfully joined "${updated.title}"!\nPlease track progress using your existing "${updated.habitTitle}" habit.`);
      }
    } else {
      alert('Invalid invite code. Could not find a matching challenge.');
    }
  };

  if (showLanding) {
    return <LandingPage onStart={handleStartApp} />;
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${(activeTab === 'tracker' && wallpaper !== 'none') ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-950'
      }`}>
      <header className={`border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors ${(activeTab === 'tracker' && wallpaper !== 'none')
        ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
        : 'bg-white dark:bg-gray-900'
        }`}>
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Mountain className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">Waypoint</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {lastSaved && (
              <span className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 animate-fade-in">
                <CheckCircle2 size={12} />
                Saved
              </span>
            )}

            <div id="stats-coins" className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full font-bold text-sm">
              <Coins size={14} />
              <span>{coins}</span>
            </div>

            <button
              onClick={() => setShowFocusMode(true)}
              className="p-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-white transition-colors rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40"
              title="Focus Tools (ADHD Assist)"
            >
              <BrainCircuit size={20} />
            </button>



            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <nav className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg ml-1">
              <button onClick={() => setActiveTab('tracker')} className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'tracker' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                <ListTodo size={16} />
                <span className="hidden sm:inline">Tracker</span>
              </button>
              <button onClick={() => setActiveTab('analytics')} className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                <BarChart2 size={16} />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button onClick={() => setActiveTab('badges')} className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'badges' ? 'bg-white dark:bg-gray-700 text-yellow-600 dark:text-yellow-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                <Award size={16} />
                <span className="hidden sm:inline">Badges</span>
              </button>
              <button onClick={() => setActiveTab('challenges')} className={`relative px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'challenges' ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                <Users size={16} />
                <span className="hidden sm:inline">Challenges</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1 rounded-full font-bold animate-bounce shadow-sm">
                  New
                </span>
              </button>
              <button id="nav-mountain" onClick={() => setActiveTab('mountain')} className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'mountain' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                <Mountain size={16} />
                <span className="hidden sm:inline">Mountain</span>
              </button>
            </nav>



            {/* User Auth - Far Right */}
            {user ? (
              <div className="flex items-center gap-2 ml-2">
                {/* User Avatar */}
                {user.photoURL ? (
                  // Google profile photo
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-indigo-500"
                  />
                ) : (
                  // Email initial for email/password sign-in
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm border-2 border-indigo-500">
                    {user.email?.[0].toUpperCase()}
                  </div>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="ml-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <User size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Quick Menu Handle (Shortcuts) - Far Right */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="ml-2 p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Menu / Shortcuts (Cmd+K)"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>
      {/* Wallpaper Background Layer */}
      {activeTab === 'tracker' && wallpaper !== 'none' && (
        <div
          className={`fixed inset-0 -z-10 transition-all duration-700 bg-cover bg-center bg-no-repeat ${wallpaper === 'ocean' ? 'bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-900/40 dark:to-cyan-900/40' :
            wallpaper === 'forest' ? 'bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/40 dark:to-teal-900/40' :
              wallpaper === 'midnight' ? 'bg-gradient-to-br from-slate-900 to-indigo-900' :
                wallpaper === 'minimalist' ? 'bg-gray-50 dark:bg-black' :
                  ''
            }`}
          style={{
            backgroundImage:
              wallpaper === 'sunset' ? 'url(/assets/wallpapers/sunset.jpg)' :
                wallpaper === 'countryside' ? 'url(/assets/wallpapers/countryside.jpg)' :
                  wallpaper === 'forest' ? 'url(/assets/wallpapers/forest.jpg)' :
                    wallpaper === 'midnight' ? 'url(/assets/wallpapers/midnight.jpg)' :
                      wallpaper === 'ocean' ? 'url(/assets/wallpapers/ocean.jpg)' :
                        undefined
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-5xl">
        {activeTab === 'tracker' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats Column - Order 1 on Mobile, Order 2 on Desktop (Right Side) */}
            <div className="space-y-6 order-1 md:order-2 md:col-span-1">
              <div className={`rounded-xl p-6 text-white shadow-lg relative overflow-hidden ${(activeTab === 'tracker' && wallpaper !== 'none')
                ? 'bg-gradient-to-br from-indigo-500/75 to-purple-600/75 backdrop-blur-sm'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                }`}>
                <h3 className="text-lg font-semibold mb-2 relative z-10">Daily Progress</h3>
                <div className="flex items-end gap-2 mb-1 relative z-10">
                  <span className="text-4xl font-bold">{progressPercentage}%</span>
                  <span className="mb-1 opacity-80">completed</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 mt-2 relative z-10">
                  <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>



              <div className={`rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors ${(activeTab === 'tracker' && wallpaper !== 'none')
                ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
                : 'bg-white dark:bg-gray-900'
                }`}>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart2 size={18} className="text-gray-400" />
                  Quick Stats
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Active Habits</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{habits.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Perfect Streak</span>
                    <span className="font-medium text-orange-500 dark:text-orange-400">
                      {perfectStreak} days
                    </span>
                  </div>
                  <button onClick={() => setActiveTab('analytics')} className="w-full mt-2 py-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                    View Full Analytics
                  </button>
                </div>
              </div>
            </div>

            <div className="order-2 md:order-1 md:col-span-2">
              <HabitList
                habits={habits}
                onUpdateStatus={updateHabitStatus}
                onAddHabit={addHabit}
                onEditHabit={editHabit}
                onDeleteHabit={deleteHabit}
                onReorderHabits={reorderHabits}
                isTransparent={wallpaper !== 'none'}
              />
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <Analytics habits={habits} />
        ) : activeTab === 'badges' ? (
          <Badges habits={habits} badgeProgress={badgeProgress} totalHabitsCreated={totalHabitsCreated} />
        ) : activeTab === 'challenges' ? (
          <ChallengesTab
            challenges={challenges}
            habits={habits}
            userId={user?.uid || 'guest'}
            userName={user?.email?.split('@')[0] || 'Guest'}
            onCreateChallenge={(challenge) => {
              // Check if habit needs to be created
              const habitExists = habits.some(h => h.id === challenge.habitId);
              if (!habitExists) {
                // This case usually happens during Join, but for Create we select existing.
                // If we allow "Custom Challenge", we might need to create here.
              }
              setChallenges([...challenges, challenge]);
              // FIREBASE: Create Global Challenge
              if (user) {
                saveChallengeToFirestore(challenge).catch(e => {
                  console.error("Failed to save challenge to cloud", e);
                  alert(`Warning: Failed to save challenge to cloud. It may not be joinable by others. Error: ${e.message}`);
                });
              } else {
                alert("Note: You are creating this challenge as a Guest. It will be saved locally, but others cannot join it until you Sign In.");
              }
            }}
            onUpdateChallenge={(updatedChallenge) => {
              setChallenges(challenges.map(c => c.id === updatedChallenge.id ? updatedChallenge : c));
              // FIREBASE: Update Global Challenge
              if (user) {
                saveChallengeToFirestore(updatedChallenge);
              }
            }}
            onDeleteChallenge={(challengeId) => {
              if (confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
                setChallenges(challenges.filter(c => c.id !== challengeId));
                // FIREBASE: Delete Global Challenge
                if (user) {
                  deleteChallengeFromFirestore(challengeId)
                    .then(() => console.log('Challenge deleted from cloud'))
                    .catch(e => {
                      console.error("Failed to delete from cloud", e);
                      alert(`Failed to delete challenge from cloud: ${e.message}`);
                    });
                }
              }
            }}
            onRedactChallenge={(challengeId) => {
              // For now, this is just a placeholder or could trigger an edit modal.
              // Since ChallengesTab handles editing via `editingChallenge` state,
              // we might not need extensive logic here unless we want to control it from App.
              console.log('Redact/Edit challenge requested:', challengeId);
            }}
            onJoinChallenge={handleJoinChallenge}
          />
        ) : activeTab === 'mountain' ? (
          <MountainClimber
            habits={habits}
            coins={coins}
            unlockedCheckpoints={unlockedCheckpoints}
            onUnlockCheckpoint={unlockCheckpoint}
            onShowGuide={handleShowMountainGuide}
          />
        ) : null /* Fallback for unknown tab */}
      </main>

      {/* Settings/Shortcuts Sidebar */}
      <SettingsSidebar
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentWallpaper={wallpaper}
        onSetWallpaper={setWallpaper}
      />

      {/* Badge Notification */}
      {newlyUnlockedBadge && (
        <BadgeNotification
          badge={newlyUnlockedBadge}
          onClose={() => setNewlyUnlockedBadge(null)}
        />
      )}

      <SpotlightTour
        steps={tourSteps}
        isOpen={tourSteps.length > 0}
        onComplete={handleTourComplete}
      />

      <FocusMode isOpen={showFocusMode} onClose={() => setShowFocusMode(false)} />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      <VercelAnalytics />
    </div>
  );
};

export default App;