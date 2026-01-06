import React, { useState, useEffect, useRef } from 'react';
import { Habit, HabitFrequency } from '../types';
import { Check, Plus, Trash2, Flame, Pencil, X, Save, MoreVertical, SkipForward, PieChart } from 'lucide-react';

interface HabitListProps {
  habits: Habit[];
  onUpdateStatus: (id: string, date: string, status: 'completed' | 'partial' | 'skipped' | null) => void;
  onAddHabit: (title: string, category: string, frequency: HabitFrequency) => void;
  onEditHabit: (id: string, updates: Partial<Habit>) => void;
  onDeleteHabit: (id: string) => void;
}

const CATEGORIES = ['Fitness', 'Learning', 'Mindfulness', 'Health', 'Reading', 'Work'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Category emoji mapping
const CATEGORY_EMOJIS: Record<string, string> = {
  'Fitness': '💪',
  'Learning': '📚',
  'Mindfulness': '🧘',
  'Health': '❤️',
  'Reading': '📖',
  'Work': '💼'
};


// Helper function to get date string in local timezone (YYYY-MM-DD)
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const HabitList: React.FC<HabitListProps> = ({
  habits,
  onUpdateStatus,
  onAddHabit,
  onEditHabit,
  onDeleteHabit
}) => {
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState(CATEGORIES[0]);
  const [newFrequencyType, setNewFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [newCustomDays, setNewCustomDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editFrequencyType, setEditFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [editCustomDays, setEditCustomDays] = useState<number[]>([]);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number } | null>(null);

  const today = getLocalDateString(new Date());
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
      onAddHabit(newHabitTitle, newHabitCategory, {
        type: newFrequencyType,
        days: newFrequencyType === 'custom' ? newCustomDays : []
      });
      setNewHabitTitle('');
      setIsAdding(false);
      setNewFrequencyType('daily');
      setNewCustomDays([1, 2, 3, 4, 5]);
    }
  };

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id);
    setEditTitle(habit.title);
    setEditCategory(habit.category);
    setEditFrequencyType(habit.frequency.type);
    setEditCustomDays(habit.frequency.days || []);
  };

  const saveEditing = (id: string) => {
    if (editTitle.trim()) {
      onEditHabit(id, {
        title: editTitle,
        category: editCategory,
        frequency: {
          type: editFrequencyType,
          days: editFrequencyType === 'custom' ? editCustomDays : []
        }
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

  return (
    <div className="space-y-6 relative">
      {/* Date Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-white">
          <div>
            <div className="text-sm font-medium opacity-90">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div className="text-2xl font-bold">
              {currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono tabular-nums">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs opacity-75 mt-1">
              {currentTime.toLocaleTimeString('en-US', { second: '2-digit' }).split(' ')[0].split(':')[2]}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Habits</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>New Habit</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 animate-fade-in transition-colors">
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
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400">No habits yet. Start by adding one!</p>
          </div>
        ) : (
          habits.map((habit) => {
            const status = habit.history[today];
            const isEditing = editingId === habit.id;

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
                className={`flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-xl border transition-all group relative ${status === 'completed'
                  ? 'border-green-200 dark:border-green-900 shadow-sm'
                  : status === 'skipped'
                    ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50'
                    : 'border-gray-100 dark:border-gray-800 shadow-sm hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onUpdateStatus(habit.id, today, status === 'completed' ? null : 'completed')}
                    onContextMenu={(e) => handleContextMenu(e, habit.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${status === 'completed'
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

                  <div>
                    <h3 className={`font-medium transition-colors flex items-center gap-2 ${status === 'completed'
                      ? 'text-gray-400 dark:text-gray-500 line-through'
                      : 'text-gray-800 dark:text-gray-200'
                      }`}>
                      <span className="text-lg">{CATEGORY_EMOJIS[habit.category] || '📌'}</span>
                      {habit.title}
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
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400 font-medium mr-2" title="Current streak">
                    <Flame size={18} />
                    <span>{habit.streak}</span>
                  </div>

                  <div className="flex items-center gap-1">
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
            onClick={() => { onUpdateStatus(contextMenu.id, today, 'completed'); setContextMenu(null); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Check size={14} className="text-green-500" /> Complete
          </button>
          <button
            onClick={() => { onUpdateStatus(contextMenu.id, today, 'partial'); setContextMenu(null); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <PieChart size={14} className="text-blue-500" /> Mark Partial
          </button>
          <button
            onClick={() => { onUpdateStatus(contextMenu.id, today, 'skipped'); setContextMenu(null); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <SkipForward size={14} className="text-gray-500" /> Skip Day
          </button>
          <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
          <button
            onClick={() => { onUpdateStatus(contextMenu.id, today, null); setContextMenu(null); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <X size={14} /> Clear Status
          </button>
        </div>
      )}
    </div>
  );
};