import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { HabitList } from './components/HabitList';
import { Analytics } from './components/Analytics';
import { Badges } from './components/Badges';
import { BadgeNotification } from './components/BadgeComponents';
import { MountainClimber } from './components/MountainClimber';
import { AuthModal } from './components/AuthModal';
import { Habit, HabitFrequency, Badge, BadgeProgress } from './types';
import { checkBadgeUnlocks } from './badges';
import { ListTodo, BarChart2, Sun, Moon, CheckCircle2, Award, Mountain, LogOut, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from './contexts/AuthContext';
import {
  saveHabitsToFirestore,
  loadHabitsFromFirestore,
  saveBadgeProgressToFirestore,
  loadBadgeProgressFromFirestore,
  saveTotalHabitsToFirestore,
  loadTotalHabitsFromFirestore
} from './services/firestoreService';

const STORAGE_KEY = 'habitvision_data';
const THEME_KEY = 'habitvision_theme';
const BADGES_KEY = 'habitvision_badges';
const TOTAL_HABITS_KEY = 'habitvision_total_habits_created';

// Helper function to get date string in local timezone (YYYY-MM-DD)
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calculateStreak = (habit: Habit) => {
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
      isDue = true; // For weekly, treat as daily for now
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
        // but stop counting here
        break;
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracker' | 'analytics' | 'badges' | 'mountain'>('tracker');
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
    return [
      {
        id: '1',
        title: 'Morning Meditation',
        category: 'Mindfulness',
        streak: 0,
        history: {},
        frequency: { type: 'daily', days: [] },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Gym (Mon/Wed/Fri)',
        category: 'Health',
        streak: 0,
        history: {},
        frequency: { type: 'custom', days: [1, 3, 5] },
        createdAt: new Date().toISOString()
      }
    ];
  });
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
        const [firestoreHabits, firestoreBadges, firestoreTotal] = await Promise.all([
          loadHabitsFromFirestore(user.uid),
          loadBadgeProgressFromFirestore(user.uid),
          loadTotalHabitsFromFirestore(user.uid)
        ]);

        // If Firestore has data, use it (cloud is source of truth)
        if (firestoreHabits && firestoreHabits.length > 0) {
          setHabits(firestoreHabits);
          if (firestoreBadges) setBadgeProgress(firestoreBadges);
          if (firestoreTotal) setTotalHabitsCreated(firestoreTotal);
        } else {
          // First login - migrate localStorage data to Firestore
          const localHabits = habits;
          const localBadges = badgeProgress;
          const localTotal = totalHabitsCreated;

          if (localHabits.length > 0) {
            await saveHabitsToFirestore(user.uid, localHabits);
            await saveBadgeProgressToFirestore(user.uid, localBadges);
            await saveTotalHabitsToFirestore(user.uid, localTotal);
          }
        }
      } catch (error) {
        console.error('Error syncing with Firestore:', error);
      }
    };

    loadFromFirestore();
  }, [user, authLoading]);

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
  }, [habits, user, authLoading]);

  useEffect(() => {
    if (!user || authLoading) return;

    const saveBadgesToFirestore = async () => {
      try {
        await saveBadgeProgressToFirestore(user.uid, badgeProgress);
        await saveTotalHabitsToFirestore(user.uid, totalHabitsCreated);
      } catch (error) {
        console.error('Error saving badges to Firestore:', error);
      }
    };

    saveBadgesToFirestore();
  }, [badgeProgress, totalHabitsCreated, user, authLoading]);



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
  }, [habits, badgeProgress, totalHabitsCreated]);



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

      return {
        ...habit,
        history: newHistory,
        streak: newStreak
      };
    }));
  };

  const addHabit = (title: string, category: string, frequency: HabitFrequency) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      category,
      streak: 0,
      history: {},
      frequency,
      createdAt: new Date().toISOString()
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

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => String(h.id) !== String(id)));
  };

  const reorderHabits = (reorderedHabits: Habit[]) => {
    setHabits(reorderedHabits);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-200">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
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


            {user ? (
              <div className="flex items-center gap-2">
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
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <User size={16} />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

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
              <button onClick={() => setActiveTab('mountain')} className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'mountain' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                <Mountain size={16} />
                <span className="hidden sm:inline">Mountain</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6">
        {activeTab === 'tracker' ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <HabitList
                habits={habits}
                onUpdateStatus={updateHabitStatus}
                onAddHabit={addHabit}
                onEditHabit={editHabit}
                onDeleteHabit={deleteHabit}
                onReorderHabits={reorderHabits}
              />
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                <h3 className="text-lg font-semibold mb-2 relative z-10">Daily Progress</h3>
                <div className="flex items-end gap-2 mb-1 relative z-10">
                  <span className="text-4xl font-bold">{progressPercentage}%</span>
                  <span className="mb-1 opacity-80">completed</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 mt-2 relative z-10">
                  <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
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
          </div>
        ) : activeTab === 'analytics' ? (
          <Analytics habits={habits} />
        ) : activeTab === 'badges' ? (
          <Badges habits={habits} badgeProgress={badgeProgress} totalHabitsCreated={totalHabitsCreated} />
        ) : (
          <MountainClimber habits={habits} />
        )}
      </main>

      {/* Badge Notification */}
      {newlyUnlockedBadge && (
        <BadgeNotification
          badge={newlyUnlockedBadge}
          onClose={() => setNewlyUnlockedBadge(null)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && !user && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default App;