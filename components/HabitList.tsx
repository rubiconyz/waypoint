import React, { useState, useEffect, useRef } from 'react';
import { Timer } from './Timer';

import { Habit, HabitFrequency, AspectRatio, ImageSize } from '../types';
import { Plus, Flame, Calendar, Check, X, MoreVertical, Trash2, Pencil, Timer as TimerIcon, Play, Pause, Square, SkipForward, BarChart2, PieChart, Star, Languages, Droplets, Moon, Flower2, Footprints, Coffee, BookOpen, Dumbbell, Award, GripVertical, Brain, Heart, Book, Briefcase, Pin, ChevronLeft, ChevronRight, Clock, MessageCircle } from 'lucide-react';
import { HABIT_CATEGORIES, DAY_ABBREVIATIONS } from '../constants';
import { getLocalDateString, parseLocalDate, getWeekKey } from '../utils/dateUtils';



interface HabitListProps {
  habits: Habit[];
  onUpdateStatus: (id: string, date: string, status: 'completed' | 'partial' | 'skipped' | null) => void;
  onAddHabit: (title: string, category: string, frequency: HabitFrequency, targetDuration?: number, microSteps?: { id: string; text: string; completed: boolean }[]) => void;
  onEditHabit: (id: string, updates: Partial<Habit>) => void;
  onDeleteHabit: (id: string) => void;
  onReorderHabits: (reorderedHabits: Habit[]) => void;
  isTransparent?: boolean;
}

const CATEGORIES: string[] = [...HABIT_CATEGORIES];
const DAYS: string[] = [...DAY_ABBREVIATIONS];

// Category icon mapping (Lucide icons)
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Fitness': <Dumbbell size={18} className="text-orange-500" />,
  'Learning': <BookOpen size={18} className="text-blue-500" />,
  'Mindfulness': <Brain size={18} className="text-purple-500" />,
  'Health': <Heart size={18} className="text-red-500" />,
  'Reading': <Book size={18} className="text-emerald-500" />,
  'Work': <Briefcase size={18} className="text-amber-800" />,
  'Other': <Star size={18} className="text-yellow-500" />
};

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  onUpdateStatus,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onReorderHabits,
  isTransparent
}) => {
  // Add Habit State
  const [isAdding, setIsAdding] = useState(false);
  const [openMenuHabitId, setOpenMenuHabitId] = useState<string | null>(null); // For mobile dropdown
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState(CATEGORIES[3]); // Default Health
  const [newFrequencyType, setNewFrequencyType] = useState<HabitFrequency['type']>('daily');
  const [newCustomDays, setNewCustomDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [newRepeatTarget, setNewRepeatTarget] = useState<number>(3);
  const [newTargetDuration, setNewTargetDuration] = useState('');
  const [newMicroSteps, setNewMicroSteps] = useState<{ id: string; text: string; completed: boolean }[]>([]);

  // Edit Habit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState(CATEGORIES[3]);
  const [editFrequencyType, setEditFrequencyType] = useState<HabitFrequency['type']>('daily');
  const [editCustomDays, setEditCustomDays] = useState<number[]>([]);
  const [editRepeatTarget, setEditRepeatTarget] = useState<number>(3);
  const [editTargetDuration, setEditTargetDuration] = useState('');
  const [editMicroSteps, setEditMicroSteps] = useState<{ id: string; text: string; completed: boolean }[]>([]);

  // View State
  const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number } | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Stopwatch state
  const [stopwatchHabitId, setStopwatchHabitId] = useState<string | null>(() => {
    return localStorage.getItem('habitvision_active_timer_id');
  });

  // Persist active timer ID
  useEffect(() => {
    if (stopwatchHabitId) {
      localStorage.setItem('habitvision_active_timer_id', stopwatchHabitId);
    } else {
      localStorage.removeItem('habitvision_active_timer_id');
    }
  }, [stopwatchHabitId]);

  // Date Navigation State
  const [viewDate, setViewDate] = useState(new Date());

  const viewDateString = getLocalDateString(viewDate);
  const today = getLocalDateString(new Date()); // Keep 'today' for comparison
  const isToday = viewDateString === today;



  const handlePrevDay = () => {
    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() - 1);
    setViewDate(newDate);
  };

  const handleNextDay = () => {
    // Prevent going into future
    if (isToday) return;

    const newDate = new Date(viewDate);
    newDate.setDate(viewDate.getDate() + 1);
    setViewDate(newDate);
  };

  const getDisplayDate = () => {
    if (isToday) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (viewDateString === getLocalDateString(yesterday)) return 'Yesterday';

    return viewDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Live clock state

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const toggleDay = (dayIndex: number) => {
    setNewCustomDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const toggleEditDay = (dayIndex: number) => {
    setEditCustomDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitTitle.trim()) {
      const duration = newTargetDuration ? parseInt(newTargetDuration) : undefined;
      onAddHabit(newHabitTitle, newHabitCategory, {
        type: newFrequencyType,
        days: newFrequencyType === 'custom' ? newCustomDays : [],
        repeatTarget: newFrequencyType === 'weekly' ? newRepeatTarget : undefined
      }, duration, newMicroSteps);

      // Reset Form
      setNewHabitTitle('');
      setNewTargetDuration('');
      setNewMicroSteps([]);
      setIsAdding(false);
      setNewFrequencyType('daily');
      setNewCustomDays([1, 2, 3, 4, 5]);
      setNewRepeatTarget(3);
    }
  };

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id);
    setEditTitle(habit.title);
    setEditCategory(habit.category);
    setEditFrequencyType(habit.frequency.type);
    setEditCustomDays(habit.frequency.days || []);
    setEditRepeatTarget(habit.frequency.repeatTarget || 3);
    setEditTargetDuration(habit.targetDuration ? habit.targetDuration.toString() : '');
    setEditMicroSteps(habit.microSteps || []);
  };

  const saveEditing = (id: string) => {
    if (editTitle.trim()) {
      const duration = editTargetDuration ? parseInt(editTargetDuration) : undefined;
      onEditHabit(id, {
        title: editTitle,
        category: editCategory,
        frequency: {
          type: editFrequencyType,
          days: editFrequencyType === 'custom' ? editCustomDays : [],
          repeatTarget: editFrequencyType === 'weekly' ? editRepeatTarget : undefined
        },
        ...(duration !== undefined && { targetDuration: duration }),
        microSteps: editMicroSteps
      });
      setEditingId(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newHabits = [...habits];
    const draggedHabit = newHabits[draggedIndex];
    newHabits.splice(draggedIndex, 1);
    newHabits.splice(index, 0, draggedHabit);

    onReorderHabits(newHabits);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };


  return (
    <div className="space-y-6 relative">
      {/* Date Navigation Header */}
      <div className={`flex items-center justify-between p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all ${isTransparent
        ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
        : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'
        }`}>
        <button
          onClick={handlePrevDay}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          {!isToday && <span className="text-xs font-normal px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">Viewing History</span>}
          {getDisplayDate()}
        </div>

        <button
          onClick={handleNextDay}
          disabled={isToday}
          className={`p - 2 rounded - lg transition - colors ${isToday
            ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
            } `}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Habits</h2>
        {isToday && (
          <button
            id="btn-new-habit"
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>New Habit</span>
          </button>
        )}
      </div>





      {isToday && isAdding && (
        <form onSubmit={handleAdd} className={`p-5 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 mb-6 animate-fade-in transition-all overflow-hidden ${isTransparent
          ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
          : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md'
          }`}>
          <div className="flex flex-col gap-6">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="What do you want to track?"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className="w-full text-xl px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-gray-400 font-semibold"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Category & Frequency */}
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">Category</label>
                  <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewHabitCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${newHabitCategory === cat
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-sm'
                          : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">Frequency</label>
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex shadow-inner">
                    {(['daily', 'weekly', 'custom'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewFrequencyType(type)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${newFrequencyType === type
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {newFrequencyType === 'custom' && (
                    <div className="flex gap-2 mt-3 animate-fade-in pl-1">
                      {DAYS.map((d, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${newCustomDays.includes(i)
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                            : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                            }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}

                  {newFrequencyType === 'weekly' && (
                    <div className="flex items-center gap-3 animate-fade-in mt-3 pl-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Target days/week:</span>
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
                        <button type="button" onClick={() => setNewRepeatTarget(Math.max(1, newRepeatTarget - 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 font-bold transition-colors w-8">-</button>
                        <span className="font-mono font-bold text-gray-900 dark:text-white w-6 text-center">{newRepeatTarget}</span>
                        <button type="button" onClick={() => setNewRepeatTarget(Math.min(7, newRepeatTarget + 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 font-bold transition-colors w-8">+</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Extras */}
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">
                    Target Duration (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={newTargetDuration}
                      onChange={(e) => setNewTargetDuration(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full pl-10 pr-20 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Clock size={16} className="absolute left-3.5 top-3 text-gray-400" />

                    {/* Unit Label */}
                    <span className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">min</span>

                    {/* Custom Spinners */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col border-l border-gray-100 dark:border-gray-700 pl-1">
                      <button
                        type="button"
                        onClick={() => setNewTargetDuration(String((parseInt(newTargetDuration || '0') + 5)))}
                        className="p-0.5 hover:text-blue-500 text-gray-400 transition-colors"
                      >
                        <ChevronLeft size={10} className="rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewTargetDuration(String(Math.max(0, (parseInt(newTargetDuration || '0') - 5))))}
                        className="p-0.5 hover:text-blue-500 text-gray-400 transition-colors"
                      >
                        <ChevronLeft size={10} className="-rotate-90" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    Micro-steps
                  </label>
                  <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    {newMicroSteps.map((step, idx) => (
                      <div key={step.id} className="flex gap-2 items-center group">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <input
                          type="text"
                          value={step.text}
                          onChange={(e) => {
                            const newSteps = [...newMicroSteps];
                            newSteps[idx].text = e.target.value;
                            setNewMicroSteps(newSteps);
                          }}
                          className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white border-b border-transparent focus:border-emerald-500 group-hover:border-gray-200 dark:group-hover:border-gray-700 outline-none transition-colors py-1"
                          placeholder={`Step ${idx + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => setNewMicroSteps(prev => prev.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNewMicroSteps([...newMicroSteps, { id: crypto.randomUUID(), text: '', completed: false }])}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 mt-2 px-1"
                    >
                      <Plus size={14} /> Add Micro-step
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
              >
                <Plus size={18} strokeWidth={2.5} /> Create Habit
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className={`text-center py-8 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 transition-all ${isTransparent
            ? 'bg-white/20 dark:bg-black/20 backdrop-blur-md'
            : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm'
            }`}>
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">No habits yet? Pick a starter pack:</p>
            <div id="empty-state-grid" className="grid grid-cols-2 gap-3 px-4 max-w-md mx-auto">
              <button
                onClick={() => onAddHabit('Drink Water', 'Health', { type: 'daily', days: [] })}
                className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl hover:scale-105 transition-transform border border-blue-100 dark:border-blue-800 flex flex-col items-center gap-2"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full"><Droplets size={20} /></div>
                <span className="font-semibold text-sm">Hydrate</span>
              </button>

              <button
                onClick={() => onAddHabit('Read 15 mins', 'Learning', { type: 'daily', days: [] }, 15)}
                className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-800 flex flex-col items-center gap-2"
              >
                <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-full"><BookOpen size={20} /></div>
                <span className="font-semibold text-sm">Read</span>
              </button>

              <button
                onClick={() => onAddHabit('Meditate', 'Mindfulness', { type: 'daily', days: [] }, 10)}
                className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl hover:scale-105 transition-transform border border-purple-100 dark:border-purple-800 flex flex-col items-center gap-2"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full"><Flower2 size={20} /></div>
                <span className="font-semibold text-sm">Zen</span>
              </button>

              <button
                onClick={() => onAddHabit('Go for a Run', 'Fitness', { type: 'weekly', days: [], repeatTarget: 3 })}
                className="p-4 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl hover:scale-105 transition-transform border border-orange-100 dark:border-orange-800 flex flex-col items-center gap-2"
              >
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full"><Footprints size={20} /></div>
                <span className="font-semibold text-sm">Run 3x</span>
              </button>
            </div>

          </div>
        ) : (
          habits.map((habit, index) => {
            // Logic: Hide habit if looking at a date before it was created
            if (habit.createdAt) {
              const createdDate = new Date(habit.createdAt);
              const createdDateStr = getLocalDateString(createdDate);
              // Simple string comparison works for ISO YYYY-MM-DD
              if (viewDateString < createdDateStr) {
                return null;
              }
            }

            const status = habit.history[viewDateString];
            const isDragging = draggedIndex === index;
            const isEditing = editingId === habit.id;

            // Calculate weekly progress if applicable
            let weeklyProgress = null;
            if (habit.frequency.type === 'weekly' && habit.frequency.repeatTarget) {
              const currentWeekKey = getWeekKey(viewDate); // Use viewDate for weekly calculation context
              let count = 0;
              Object.keys(habit.history).forEach(dateStr => {
                if (habit.history[dateStr] === 'completed') {
                  // FIX: Parse local date string correctly
                  const localDate = parseLocalDate(dateStr);
                  if (getWeekKey(localDate) === currentWeekKey) {
                    count++;
                  }
                }
              });
              weeklyProgress = { count, target: habit.frequency.repeatTarget };
            }

            if (isEditing) {
              return (
                <div key={habit.id} className="p-5 bg-white dark:bg-gray-900 rounded-3xl border-2 border-blue-500 shadow-lg transition-all animate-fade-in relative z-10">
                  <div className="flex flex-col gap-5">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Editing Habit</h3>
                      <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={18} />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-lg font-semibold px-0 py-2 bg-transparent border-b-2 border-gray-100 dark:border-gray-800 focus:border-blue-500 transition-colors outline-none text-gray-900 dark:text-white rounded-none"
                      autoFocus
                      placeholder="Habit name"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {/* Category */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Category</label>
                          <div className="flex gap-2 flex-wrap">
                            {CATEGORIES.map(cat => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setEditCategory(cat)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${editCategory === cat
                                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                                  }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Frequency */}
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Frequency</label>
                          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex mb-2">
                            {(['daily', 'weekly', 'custom'] as const).map(type => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setEditFrequencyType(type)}
                                className={`px-3 py-1 rounded text-xs font-medium capitalize transition-all ${editFrequencyType === type
                                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                  }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>

                          {editFrequencyType === 'custom' && (
                            <div className="flex gap-1.5 flex-wrap">
                              {DAYS.map((d, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => toggleEditDay(i)}
                                  className={`w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center transition-all ${editCustomDays.includes(i)
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          )}

                          {editFrequencyType === 'weekly' && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">Days/week:</span>
                              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => setEditRepeatTarget(Math.max(1, editRepeatTarget - 1))} className="px-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-l text-gray-500 font-bold">-</button>
                                <span className="text-xs font-mono font-bold w-4 text-center text-gray-900 dark:text-white">{editRepeatTarget}</span>
                                <button type="button" onClick={() => setEditRepeatTarget(Math.min(7, editRepeatTarget + 1))} className="px-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-r text-gray-500 font-bold">+</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Duration (min)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={editTargetDuration}
                              onChange={(e) => setEditTargetDuration(e.target.value)}
                              className="w-full pl-8 pr-16 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              placeholder="None"
                            />
                            <Clock size={12} className="absolute left-2.5 top-2.5 text-gray-400" />

                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium pointer-events-none">min</span>

                            {/* Custom Spinners */}
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col border-l border-gray-200 dark:border-gray-700 pl-0.5">
                              <button
                                type="button"
                                onClick={() => setEditTargetDuration(String((parseInt(editTargetDuration || '0') + 5)))}
                                className="hover:text-blue-500 text-gray-400 transition-colors"
                              >
                                <ChevronLeft size={8} className="rotate-90" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditTargetDuration(String(Math.max(0, (parseInt(editTargetDuration || '0') - 5))))}
                                className="hover:text-blue-500 text-gray-400 transition-colors"
                              >
                                <ChevronLeft size={8} className="-rotate-90" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Micro-steps</label>
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800 space-y-2">
                            {editMicroSteps.map((step, idx) => (
                              <div key={step.id} className="flex gap-2 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <input
                                  type="text"
                                  value={step.text}
                                  onChange={(e) => {
                                    const newSteps = [...editMicroSteps];
                                    newSteps[idx].text = e.target.value;
                                    setEditMicroSteps(newSteps);
                                  }}
                                  className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 focus:border-emerald-500 outline-none pb-0.5"
                                />
                                <button type="button" onClick={() => setEditMicroSteps(prev => prev.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 shrink-0">
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => setEditMicroSteps([...editMicroSteps, { id: crypto.randomUUID(), text: '', completed: false }])}
                              className="text-[10px] uppercase font-bold text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              <Plus size={10} /> Add Step
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 mt-2 border-t border-gray-100 dark:border-gray-800">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEditing(habit.id)}
                        className="px-5 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={habit.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                  // Set drag image to the row itself (browser default usually works well for row)
                }}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                className={`flex items-center justify-between p-4 rounded-3xl border transition-all group relative cursor-grab active:cursor-grabbing ${isTransparent
                  ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
                  : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md'
                  } ${isDragging
                    ? 'opacity-50 scale-95'
                    : 'hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800'
                  } ${status === 'completed'
                    ? 'border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-900/10'
                    : status === 'partial'
                      ? 'border-yellow-200 dark:border-yellow-900 bg-yellow-50/30 dark:bg-yellow-900/10'
                      : status === 'skipped'
                        ? 'border-gray-200 dark:border-gray-700'
                        : 'border-gray-200 dark:border-gray-800'
                  }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                  {/* Drag Handle (Visual Only) */}
                  <div
                    className="text-gray-300 dark:text-gray-600 transition-colors flex-shrink-0"
                    title="Drag to reorder"
                  >
                    <GripVertical size={18} />
                  </div>

                  <button
                    onClick={() => onUpdateStatus(habit.id, viewDateString, status === 'completed' ? null : 'completed')}
                    onContextMenu={(e) => handleContextMenu(e, habit.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${status === 'completed'
                      ? 'bg-green-500 text-white scale-110'
                      : status === 'partial'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-2 border-blue-500'
                        : status === 'skipped'
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    title="Left click to complete, Right click for more options"
                  >
                    {status === 'completed' && <Check size={18} />}
                    {status === 'partial' && <PieChart size={18} />}
                    {status === 'skipped' && <SkipForward size={18} />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h3 className={`font-medium transition-colors flex items-center gap-2 truncate ${status === 'completed'
                      ? 'text-gray-400 dark:text-gray-500 line-through'
                      : 'text-gray-800 dark:text-gray-200'
                      }`}>
                      <span className="flex-shrink-0">
                        {(() => {
                          const lowerTitle = habit.title.toLowerCase();
                          // Language Learning -> Users 'Languages' icon
                          if (['german', 'french', 'spanish', 'italian', 'japanese', 'chinese', 'korean', 'russian'].some(l => lowerTitle.includes(l))) {
                            return <Languages size={18} className="text-indigo-500" />;
                          }

                          if (lowerTitle.includes('water') || lowerTitle.includes('drink')) return <Droplets size={18} className="text-blue-400" />;
                          if (lowerTitle.includes('sleep') || lowerTitle.includes('bed')) return <Moon size={18} className="text-indigo-400" />;
                          if (lowerTitle.includes('meditate') || lowerTitle.includes('yoga')) return <Flower2 size={18} className="text-pink-400" />;
                          if (lowerTitle.includes('run') || lowerTitle.includes('walk')) return <Footprints size={18} className="text-orange-400" />;
                          if (lowerTitle.includes('coffee')) return <Coffee size={18} className="text-amber-700" />;
                          if (lowerTitle.includes('read')) return <BookOpen size={18} className="text-emerald-500" />;

                          return CATEGORY_ICONS[habit.category] || <Star size={18} className="text-gray-400" />;
                        })()}
                      </span>
                      <span className="truncate">{habit.title}</span>
                    </h3>
                    <p className="text-xs flex items-center gap-1 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                        {habit.category}
                      </span>
                      {habit.frequency.type === 'custom' && (
                        <span className="text-gray-400 text-[10px] ml-1">
                          {habit.frequency.days.map(d => DAYS[d]).join(' ')}
                        </span>
                      )}

                      {/* Weekly Progress Badge */}
                      {weeklyProgress && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${weeklyProgress.count >= weeklyProgress.target
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                          <Dumbbell size={10} />
                          {weeklyProgress.count}/{weeklyProgress.target}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-3">
                  <div className="flex items-center gap-0.5 sm:gap-1 text-orange-500 dark:text-orange-400 font-medium mr-1 sm:mr-2" title="Current streak">
                    <Flame size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="text-sm sm:text-base">{habit.streak}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Timer button - only show if habit has targetDuration */}
                    {!!habit.targetDuration && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setStopwatchHabitId(habit.id);
                        }}
                        className="relative z-10 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={`Start ${habit.targetDuration} min timer`}
                      >
                        <TimerIcon size={18} />
                      </button>
                    )}

                    {/* Desktop Actions (Hidden on Mobile) */}
                    <div className="hidden sm:flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditing(habit);
                        }}
                        className="relative z-10 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteHabit(habit.id);
                        }}
                        className="relative z-10 text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Mobile Actions Menu (Visible on Mobile) */}
                    <div className="sm:hidden relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuHabitId(openMenuHabitId === habit.id ? null : habit.id);
                        }}
                        className="relative z-10 text-gray-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuHabitId === habit.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(habit);
                              setOpenMenuHabitId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Pencil size={14} /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteHabit(habit.id);
                              setOpenMenuHabitId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Micro-steps Checklist */}
                {habit.microSteps && habit.microSteps.length > 0 && (
                  <div className="mt-3 pl-2 border-l-2 border-gray-100 dark:border-gray-800 space-y-1.5 animate-fade-in">
                    {habit.microSteps.map(step => (
                      <div key={step.id} className="flex items-start gap-2 group">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSteps = habit.microSteps!.map(s =>
                              s.id === step.id ? { ...s, completed: !s.completed } : s
                            );
                            onEditHabit(habit.id, { microSteps: newSteps });
                          }}
                          className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 ${step.completed
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-blue-400'
                            }`}
                        >
                          {step.completed && <Check size={10} strokeWidth={4} />}
                        </button>
                        <span className={`text-sm leading-tight break-words min-w-0 flex-1 transition-all ${step.completed
                          ? 'text-gray-400 line-through dark:text-gray-500'
                          : 'text-gray-600 dark:text-gray-300'
                          }`}>
                          {step.text}
                        </span>
                      </div>
                    ))}
                    {/* Progress Bar for Micro-steps */}
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{
                          width: `${(habit.microSteps.filter(s => s.completed).length / habit.microSteps.length) * 100}% `
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Custom Context Menu */}
      {
        contextMenu && (
          <div
            ref={contextMenuRef}
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 min-w-[160px] animate-fade-in"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              onClick={() => { onUpdateStatus(contextMenu.id, viewDateString, 'completed'); setContextMenu(null); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Check size={14} className="text-green-500" /> Complete
            </button>
            <button
              onClick={() => { onUpdateStatus(contextMenu.id, viewDateString, 'partial'); setContextMenu(null); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <PieChart size={14} className="text-blue-500" /> Mark Partial
            </button>
            <button
              onClick={() => { onUpdateStatus(contextMenu.id, viewDateString, 'skipped'); setContextMenu(null); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <SkipForward size={14} className="text-gray-500" /> Skip Day
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
            <button
              onClick={() => { onUpdateStatus(contextMenu.id, viewDateString, null); setContextMenu(null); }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <X size={14} /> Clear Status
            </button>
          </div>
        )
      }

      {/* Stopwatch Modal */}
      {
        stopwatchHabitId && (() => {
          const habit = habits.find(h => h.id === stopwatchHabitId);
          if (!habit || !habit.targetDuration) return null;

          return (
            <Timer
              key={habit.id}
              habitId={habit.id}
              habitTitle={habit.title}
              targetDuration={habit.targetDuration}
              onComplete={() => {
                // Auto-complete the habit when timer finishes
                onUpdateStatus(habit.id, today, 'completed');
                setStopwatchHabitId(null);
              }}
              onClose={() => setStopwatchHabitId(null)}
            />
          );
        })()
      }

    </div >
  );
};