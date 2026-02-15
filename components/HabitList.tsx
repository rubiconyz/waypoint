import React, { useState, useEffect, useRef } from 'react';
import { Timer } from './Timer';

import { Habit, HabitFrequency, AspectRatio, ImageSize } from '../types';
import { Plus, Flame, Calendar, Check, X, MoreVertical, Trash2, Pencil, Timer as TimerIcon, Play, Pause, Square, SkipForward, BarChart2, PieChart, Star, Languages, Droplets, Moon, Flower2, Footprints, Coffee, BookOpen, Dumbbell, Award, GripVertical, Brain, Heart, Book, Briefcase, Pin, ChevronLeft, ChevronRight, ChevronDown, Clock, MessageCircle } from 'lucide-react';
import { EllipsisVerticalIcon, PencilSquareIcon, TrashIcon, ClockIcon, FireIcon, StarIcon } from '@heroicons/react/24/outline';
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
  viewDate: Date;
  onViewDateChange: (date: Date) => void;
}

const CATEGORIES: string[] = [...HABIT_CATEGORIES];
const DAYS: string[] = [...DAY_ABBREVIATIONS];

// Category icon mapping (Lucide icons)
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Fitness': <Dumbbell className="w-5 h-5 text-orange-500" />,
  'Learning': <BookOpen className="w-5 h-5 text-blue-500" />,
  'Mindfulness': <Brain className="w-5 h-5 text-purple-500" />,
  'Health': <Heart className="w-5 h-5 text-red-500" />,
  'Reading': <Book className="w-5 h-5 text-emerald-500" />,
  'Work': <Briefcase className="w-5 h-5 text-amber-500" />,
  'Other': <Star className="w-5 h-5 text-yellow-500" />
};

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  onUpdateStatus,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onReorderHabits,
  isTransparent,
  viewDate,
  onViewDateChange
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
  const [expandedMicroSteps, setExpandedMicroSteps] = useState<string | null>(null);

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

  // Date Navigation State - passed from parent
  const setViewDate = onViewDateChange;

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
        targetDuration: duration,
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
      <div className={`flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all ${isTransparent
        ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
        : 'bg-white/80 dark:bg-[#0F141D]/90 backdrop-blur-md dark:border-[#1F2733]'
        }`}>
        <button
          onClick={handlePrevDay}
          className="p-2 hover:bg-gray-100 dark:hover:bg-[#121821] rounded-lg text-gray-500 dark:text-slate-400 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
          {!isToday && <span className="text-xs font-normal px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">Viewing History</span>}
          {getDisplayDate()}
        </div>

        <button
          onClick={handleNextDay}
          disabled={isToday}
          className={`p-2 rounded-lg transition-colors ${isToday
            ? 'text-gray-300 dark:text-slate-700 cursor-not-allowed'
            : 'hover:bg-gray-100 dark:hover:bg-[#121821] text-gray-500 dark:text-slate-400'
            }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {isToday && isAdding && (
        <form onSubmit={handleAdd} className={`p-5 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 mb-6 animate-fade-in transition-all overflow-hidden ${isTransparent
          ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
          : 'bg-white/90 dark:bg-[#0F141D]/95 backdrop-blur-md dark:border-[#1F2733]'
          }`}>
          <div className="flex flex-col gap-6">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="What do you want to track?"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className="w-full text-xl px-4 py-3 border border-gray-200 dark:border-[#2A3444] bg-white/50 dark:bg-[#121821] text-gray-900 dark:text-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-gray-400 dark:placeholder-slate-500 font-semibold"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 block">Category</label>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewHabitCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${newHabitCategory === cat
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                      >
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency Selection */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 block">Frequency</label>
                  <div className="flex gap-1 bg-gray-100 dark:bg-[#121821] p-1 rounded-xl inline-flex mb-2">
                    {(['daily', 'weekly', 'custom'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewFrequencyType(type)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${newFrequencyType === type
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {newFrequencyType === 'custom' && (
                    <div className="flex gap-2 flex-wrap animate-fade-in mt-2">
                      {DAYS.map((d, i) => (
                        <button
                          key={d}
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
                      <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">Target days/week:</span>
                      <div className="flex items-center gap-2 bg-white dark:bg-[#121821] rounded-xl border border-gray-200 dark:border-[#2A3444] p-1">
                        <button type="button" onClick={() => setNewRepeatTarget(Math.max(1, newRepeatTarget - 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1A2433] rounded-lg text-gray-500 font-bold transition-colors w-8">-</button>
                        <span className="font-mono font-bold text-gray-900 dark:text-slate-100 w-6 text-center">{newRepeatTarget}</span>
                        <button type="button" onClick={() => setNewRepeatTarget(Math.min(7, newRepeatTarget + 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1A2433] rounded-lg text-gray-500 font-bold transition-colors w-8">+</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Extras */}
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 block">
                    Target Duration (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={newTargetDuration}
                      onChange={(e) => setNewTargetDuration(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full pl-10 pr-20 py-2.5 border border-gray-200 dark:border-[#2A3444] bg-white dark:bg-[#121821] text-gray-900 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Clock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <span className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">min</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    Micro-steps
                  </label>
                  <div className="space-y-2 bg-gray-50 dark:bg-[#121821] p-3 rounded-xl border border-gray-100 dark:border-[#1F2733]">
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

            {/* Form Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#121821] rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Create Habit
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Habit List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="text-center py-12 bg-white/50 dark:bg-[#0F141D]/70 rounded-2xl border border-dashed border-gray-200 dark:border-[#1F2733]">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#121821] rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">No habits yet</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-xs mx-auto mb-6">Start building your streak by creating your first habit!</p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Create Habit
            </button>
          </div>
        ) : (
          <>
            {habits.map((habit, index) => {
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
                const currentWeekKey = getWeekKey(viewDate);
                let count = 0;
                Object.keys(habit.history).forEach(dateStr => {
                  if (habit.history[dateStr] === 'completed') {
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
                  <div key={habit.id} className="p-5 bg-white dark:bg-[#0F141D] rounded-2xl border-2 border-blue-500 shadow-lg transition-all animate-fade-in relative z-10">
                    <div className="flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Editing Habit</h3>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <X size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">Title</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full text-base font-semibold px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                              autoFocus
                              placeholder="Habit name"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">Category</label>
                            <div className="flex gap-2 flex-wrap">
                              {CATEGORIES.map(cat => (
                                <button
                                  key={`edit-cat-${cat}`}
                                  type="button"
                                  onClick={() => setEditCategory(cat)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${editCategory === cat
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                >
                                  <span>{cat}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">Frequency</label>
                            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex mb-2">
                              {(['daily', 'weekly', 'custom'] as const).map(type => (
                                <button
                                  key={`edit-freq-${type}`}
                                  type="button"
                                  onClick={() => setEditFrequencyType(type)}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${editFrequencyType === type
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>

                            {editFrequencyType === 'custom' && (
                              <div className="flex gap-2 flex-wrap animate-fade-in mt-2">
                                {DAYS.map((dayLabel, dayIndex) => (
                                  <button
                                    key={`edit-day-${dayLabel}`}
                                    type="button"
                                    onClick={() => toggleEditDay(dayIndex)}
                                    className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${editCustomDays.includes(dayIndex)
                                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105'
                                      : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                                      }`}
                                  >
                                    {dayLabel}
                                  </button>
                                ))}
                              </div>
                            )}

                            {editFrequencyType === 'weekly' && (
                              <div className="flex items-center gap-3 animate-fade-in mt-3 pl-1">
                                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Target days/week:</span>
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
                                  <button type="button" onClick={() => setEditRepeatTarget(Math.max(1, editRepeatTarget - 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 font-bold transition-colors w-8">-</button>
                                  <span className="font-mono font-bold text-gray-900 dark:text-white w-6 text-center">{editRepeatTarget}</span>
                                  <button type="button" onClick={() => setEditRepeatTarget(Math.min(7, editRepeatTarget + 1))} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 font-bold transition-colors w-8">+</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block">
                              Target Duration (Optional)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                value={editTargetDuration}
                                onChange={(e) => setEditTargetDuration(e.target.value)}
                                placeholder="e.g. 30"
                                className="w-full pl-10 pr-20 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Clock size={16} className="absolute left-3.5 top-3 text-gray-400" />
                              <span className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">min</span>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                              Micro-steps
                            </label>
                            <div className="space-y-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                              {editMicroSteps.map((step, idx) => (
                                <div key={step.id} className="flex gap-2 items-center group">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                  <input
                                    type="text"
                                    value={step.text}
                                    onChange={(e) => {
                                      const next = [...editMicroSteps];
                                      next[idx].text = e.target.value;
                                      setEditMicroSteps(next);
                                    }}
                                    className="flex-1 min-w-0 bg-transparent text-sm text-gray-900 dark:text-white border-b border-transparent focus:border-emerald-500 group-hover:border-gray-200 dark:group-hover:border-gray-700 outline-none transition-colors py-1"
                                    placeholder={`Step ${idx + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setEditMicroSteps(prev => prev.filter((_, i) => i !== idx))}
                                    className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => setEditMicroSteps([...editMicroSteps, { id: crypto.randomUUID(), text: '', completed: false }])}
                                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 mt-2 px-1"
                              >
                                <Plus size={14} /> Add Micro-step
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEditing(habit.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
                  }}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  className={`p-4 rounded-2xl border transition-all group relative cursor-grab active:cursor-grabbing ${isTransparent
                    ? 'bg-white/60 dark:bg-[#0F141D]/85 backdrop-blur-xl border-white/20 dark:border-[#1F2733]'
                    : 'bg-white dark:bg-[#0F141D] border-gray-100 dark:border-[#1F2733]'
                    } ${isDragging
                      ? 'opacity-50 scale-95'
                      : 'hover:border-gray-200 dark:hover:border-[#2A3444]'
                    }`}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                      <div className="text-gray-300 dark:text-gray-600 transition-colors flex-shrink-0" title="Drag to reorder">
                        <GripVertical size={18} />
                      </div>
                      <button
                        onClick={() => onUpdateStatus(habit.id, viewDateString, status === 'completed' ? null : 'completed')}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-[#2A3444] text-transparent hover:border-gray-400 dark:hover:border-slate-500'
                          }`}
                      >
                        {status === 'completed' && <Check size={16} strokeWidth={3} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gray-100 dark:bg-[#121821] rounded-2xl text-gray-400 dark:text-slate-400">
                            {CATEGORY_ICONS[habit.category] || <StarIcon className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className={`font-semibold text-lg transition-colors truncate ${status === 'completed'
                              ? 'text-gray-500 line-through decoration-gray-500'
                              : 'text-gray-900 dark:text-slate-100'
                              }`}>
                              {habit.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-[#121821] px-1.5 py-0.5 rounded">
                                {habit.category}
                              </span>
                              {habit.microSteps && habit.microSteps.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedMicroSteps(prev => prev === habit.id ? null : habit.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                >
                                  <Check size={8} strokeWidth={3} />
                                  {habit.microSteps.filter(s => s.completed).length}/{habit.microSteps.length}
                                  <ChevronDown size={10} className={`transition-transform ${expandedMicroSteps === habit.id ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-orange-500 dark:text-orange-500/90 font-bold bg-orange-500/10 px-2 py-1 rounded-lg">
                        <FireIcon className="w-4 h-4" />
                        <span className="text-sm">{habit.streak}</span>
                      </div>
                      {!!habit.targetDuration && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setStopwatchHabitId(habit.id);
                          }}
                          className="text-gray-400 hover:text-white p-1.5 bg-gray-100 dark:bg-[#121821] rounded-lg transition-colors"
                        >
                          <ClockIcon className="w-4 h-4" />
                        </button>
                      )}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuHabitId(openMenuHabitId === habit.id ? null : habit.id);
                          }}
                          className="relative z-10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                        >
                          <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                        {openMenuHabitId === habit.id && (
                          <div className="absolute right-0 top-full mt-1 w-32 bg-[#1A1A1A] rounded-lg shadow-xl border border-white/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(habit);
                                setOpenMenuHabitId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 flex items-center gap-2"
                            >
                              <PencilSquareIcon className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteHabit(habit.id);
                                setOpenMenuHabitId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <TrashIcon className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Micro-steps */}
                  {expandedMicroSteps === habit.id && habit.microSteps && habit.microSteps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#1F2733] ml-[4.5rem] space-y-1">
                      {habit.microSteps.map((step, stepIdx) => (
                        <button
                          key={step.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedSteps = habit.microSteps!.map((s, i) =>
                              i === stepIdx ? { ...s, completed: !s.completed } : s
                            );
                            onEditHabit(habit.id, { microSteps: updatedSteps });
                          }}
                          className="flex items-center gap-2.5 w-full text-left group/step py-1.5 px-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#121821] transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            step.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-300 dark:border-[#2A3444] group-hover/step:border-emerald-400'
                          }`}>
                            {step.completed && <Check size={10} strokeWidth={3} />}
                          </div>
                          <span className={`text-sm transition-colors ${
                            step.completed
                              ? 'text-gray-400 dark:text-slate-500 line-through'
                              : 'text-gray-700 dark:text-slate-300'
                          }`}>
                            {step.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {isToday && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full p-4 rounded-2xl border border-dashed border-gray-300 dark:border-[#2A3444] bg-gray-50 dark:bg-[#121821] text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#1A2433] transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                <Plus size={18} />
                <span>{isAdding ? 'Adding Habit...' : 'Add Habit'}</span>
              </button>
            )}
          </>
        )}
      </div>

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
              onUpdateStatus(habit.id, getLocalDateString(new Date()), 'completed');
              setStopwatchHabitId(null);
            }}
            onClose={() => setStopwatchHabitId(null)}
          />
        );
      })()}
    </div>
  );
};
