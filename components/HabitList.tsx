import React, { useState, useEffect, useRef } from 'react';
import { Habit, HabitFrequency } from '../types';
import { Check, Plus, Trash2, Flame, Pencil, X, Save, MoreVertical, SkipForward, PieChart, GripVertical, Timer as TimerIcon, Dumbbell, BookOpen, Brain, Heart, Book, Briefcase, Pin, ChevronLeft, ChevronRight, Star, Languages, Droplets, Footprints, Moon, Flower2, Coffee } from 'lucide-react';
import { Timer } from './Timer';

interface HabitListProps {
  habits: Habit[];
  onUpdateStatus: (id: string, date: string, status: 'completed' | 'partial' | 'skipped' | null) => void;
  onAddHabit: (title: string, category: string, frequency: HabitFrequency, targetDuration?: number, microSteps?: { id: string; text: string; completed: boolean }[]) => void;
  onEditHabit: (id: string, updates: Partial<Habit>) => void;
  onDeleteHabit: (id: string) => void;
  onReorderHabits: (reorderedHabits: Habit[]) => void;
  isTransparent?: boolean;
}



const CATEGORIES = ['Fitness', 'Learning', 'Mindfulness', 'Health', 'Reading', 'Work', 'Other'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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


// Helper function to get date string in local timezone (YYYY-MM-DD)
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to safely parse local date string 'YYYY-MM-DD' to Date object at local midnight
const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper to get week number (ISO week)
const getWeekKey = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
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
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState(CATEGORIES[0]);
  const [newFrequencyType, setNewFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [newCustomDays, setNewCustomDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [newRepeatTarget, setNewRepeatTarget] = useState<number>(3); // Default 3 times/week
  const [newTargetDuration, setNewTargetDuration] = useState<string>(''); // Optional target duration in minutes
  const [newMicroSteps, setNewMicroSteps] = useState<{ id: string; text: string; completed: boolean }[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editFrequencyType, setEditFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [editCustomDays, setEditCustomDays] = useState<number[]>([]);
  const [editRepeatTarget, setEditRepeatTarget] = useState<number>(3);
  const [editTargetDuration, setEditTargetDuration] = useState<string>(''); // Optional target duration
  const [editMicroSteps, setEditMicroSteps] = useState<{ id: string; text: string; completed: boolean }[]>([]);

  // Context Menu State
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitTitle.trim()) {
      const duration = newTargetDuration ? parseInt(newTargetDuration) : undefined;
      onAddHabit(newHabitTitle, newHabitCategory, {
        type: newFrequencyType,
        days: newFrequencyType === 'custom' ? newCustomDays : [],
        repeatTarget: newFrequencyType === 'weekly' ? newRepeatTarget : undefined
      }, duration, newMicroSteps);
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
        ...(duration !== undefined && { targetDuration: duration })
      });
      setEditingId(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

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
      <div className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all ${isTransparent
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
          className={`p-2 rounded-lg transition-colors ${isToday
            ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'}`}
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={20} />
            <span>New Habit</span>
          </button>
        )}
      </div>

      {isToday && isAdding && (
        <form onSubmit={handleAdd} className={`p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 animate-fade-in transition-all ${isTransparent
          ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
          : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md'
          }`}>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="What do you want to track?"
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              className="w-full p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500"
              autoFocus
            />

            <div className="flex flex-wrap gap-4">
              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto scrollbar-thin">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewHabitCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${newHabitCategory === cat
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800 border'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 border hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Frequency */}
              <div className="w-full border-t border-gray-100 dark:border-gray-800 pt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                <div className="flex gap-3 mb-3">
                  {(['daily', 'weekly', 'custom'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewFrequencyType(type)}
                      className={`px-3 py-1.5 rounded-md text-sm capitalize ${newFrequencyType === type
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {newFrequencyType === 'custom' && (
                  <div className="flex gap-2">
                    {DAYS.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${newCustomDays.includes(i)
                          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
                          }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}

                {/* Weekly Target Input */}
                {newFrequencyType === 'weekly' && (
                  <div className="flex items-center gap-3 animate-fade-in">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Days per week:</label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setNewRepeatTarget(Math.max(1, newRepeatTarget - 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">-</button>
                      <span className="font-mono font-medium text-gray-900 dark:text-white w-4 text-center">{newRepeatTarget}</span>
                      <button type="button" onClick={() => setNewRepeatTarget(Math.min(7, newRepeatTarget + 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">+</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Duration (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Target Duration (Optional) ⏱️
                </label>
                <input
                  type="number"
                  min="0"
                  value={newTargetDuration}
                  onChange={(e) => setNewTargetDuration(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="e.g., 30 minutes (0 to remove)"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Add a timer for this habit (in minutes)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              {/* Micro-steps (Add Form) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Micro-steps (Break it down) 📝
                </label>
                <div className="space-y-2 mb-2">
                  {newMicroSteps.map((step, idx) => (
                    <div key={step.id} className="flex gap-2">
                      <input
                        type="text"
                        value={step.text}
                        onChange={(e) => {
                          const newSteps = [...newMicroSteps];
                          newSteps[idx].text = e.target.value;
                          setNewMicroSteps(newSteps);
                        }}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={`Step ${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => setNewMicroSteps(prev => prev.filter((_, i) => i !== idx))}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setNewMicroSteps([...newMicroSteps, { id: crypto.randomUUID(), text: '', completed: false }])}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Plus size={12} /> Add Micro-step
                </button>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Habit
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className={`text-center py-8 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-all ${isTransparent
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
                onClick={() => onAddHabit('Read 15 mins', 'Learning', { type: 'daily', days: [] }, 900)}
                className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl hover:scale-105 transition-transform border border-emerald-100 dark:border-emerald-800 flex flex-col items-center gap-2"
              >
                <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-full"><BookOpen size={20} /></div>
                <span className="font-semibold text-sm">Read</span>
              </button>

              <button
                onClick={() => onAddHabit('Meditate', 'Mindfulness', { type: 'daily', days: [] }, 600)}
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
            <p className="text-xs text-gray-400 mt-6 date-text">Or create your own custom habit below</p>
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
            const isEditing = editingId === habit.id;
            const isDragging = draggedIndex === index;

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
                <div key={habit.id} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm transition-colors">
                  <div className="flex flex-col gap-4">
                    {/* Title */}
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg"
                      autoFocus
                      placeholder="Habit name"
                    />

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Category</label>
                      <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEditCategory(cat)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${editCategory === cat
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800 border'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 border hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Frequency</label>
                      <div className="flex gap-2 mb-3">
                        {(['daily', 'weekly', 'custom'] as const).map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setEditFrequencyType(type)}
                            className={`px-3 py-1.5 rounded-md text-sm capitalize ${editFrequencyType === type
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                              }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      {editFrequencyType === 'custom' && (
                        <div className="flex gap-2">
                          {DAYS.map((d, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => toggleEditDay(i)}
                              className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${editCustomDays.includes(i)
                                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-500 border border-gray-200 dark:border-gray-700'
                                }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Weekly Target Input - Edit Mode */}
                      {editFrequencyType === 'weekly' && (
                        <div className="flex items-center gap-3 animate-fade-in">
                          <label className="text-sm text-gray-600 dark:text-gray-400">Days per week:</label>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setEditRepeatTarget(Math.max(1, editRepeatTarget - 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">-</button>
                            <span className="font-mono font-medium text-gray-900 dark:text-white w-4 text-center">{editRepeatTarget}</span>
                            <button type="button" onClick={() => setEditRepeatTarget(Math.min(7, editRepeatTarget + 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">+</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Target Duration (Optional) - Edit Form */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Target Duration (Optional) ⏱️
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editTargetDuration}
                        onChange={(e) => setEditTargetDuration(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="e.g., 30 minutes (0 to remove)"
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Add a timer for this habit (in minutes)
                      </p>
                    </div>


                    {/* Micro-steps (ADHD) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Micro-steps (Break it down) 📝
                      </label>
                      <div className="space-y-2 mb-2">
                        {editMicroSteps.map((step, idx) => (
                          <div key={step.id} className="flex gap-2">
                            <input
                              type="text"
                              value={step.text}
                              onChange={(e) => {
                                const newSteps = [...editMicroSteps];
                                newSteps[idx].text = e.target.value;
                                setEditMicroSteps(newSteps);
                              }}
                              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder={`Step ${idx + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => setEditMicroSteps(prev => prev.filter((_, i) => i !== idx))}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditMicroSteps([...editMicroSteps, { id: crypto.randomUUID(), text: '', completed: false }])}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Micro-step
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Cancel</button>
                      <button onClick={() => saveEditing(habit.id)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
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
                className={`flex items-center justify-between p-4 rounded-xl border transition-all group relative cursor-grab active:cursor-grabbing ${isTransparent
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
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                          {weeklyProgress.count >= weeklyProgress.target ? (
                            <Check size={10} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          )}
                          {weeklyProgress.count}/{weeklyProgress.target} this week
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400 font-medium mr-2" title="Current streak">
                    <Flame size={18} />
                    <span>{habit.streak}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Timer button - only show if habit has targetDuration */}
                    {habit.targetDuration && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setStopwatchHabitId(habit.id);
                        }}
                        className="relative z-10 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={`Start ${habit.targetDuration} min timer`}
                      >
                        <TimerIcon size={18} />
                      </button>
                    )}

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
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Custom Context Menu */}
      {contextMenu && (
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
      )}

      {/* Stopwatch Modal */}
      {stopwatchHabitId && (() => {
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
      })()}
    </div>
  );
};