import React, { useMemo, useState } from 'react';
import { Habit } from '../types';
import { TrendingUp, Calendar, Award, Activity, ChevronDown, Flame, Trophy, AlertTriangle, Clock, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsProps {
  habits: Habit[];
}

// Helper function to get date string in local timezone (YYYY-MM-DD)
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get dates for heatmap (Full current year)
const getYearDates = () => {
  const currentYear = new Date().getFullYear();
  const start = new Date(currentYear, 0, 1);
  const end = new Date(currentYear, 11, 31);
  const arr = [];

  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(getLocalDateString(new Date(dt)));
  }
  return arr;
};

// Helper for last 30 days
const getLast30Days = () => {
  const arr = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    arr.push(getLocalDateString(d));
  }
  return arr;
}

// Helper: Get last 28 days for mini heatmap
const getLast28Days = () => {
  const arr = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    arr.push(getLocalDateString(d));
  }
  return arr;
};

// Helper: Calculate per-habit detailed stats
const getHabitDetailStats = (habit: Habit) => {
  const last28 = getLast28Days();
  const allDates = Object.keys(habit.history);

  let completed = 0, partial = 0, skipped = 0, missed = 0;
  last28.forEach(d => {
    const status = habit.history[d];
    if (status === 'completed') completed++;
    else if (status === 'partial') partial++;
    else if (status === 'skipped') skipped++;
    else missed++;
  });

  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  const weekdayTotals = [0, 0, 0, 0, 0, 0, 0];
  last28.forEach(d => {
    const date = new Date(d);
    const day = date.getDay();
    weekdayTotals[day]++;
    if (habit.history[d] === 'completed') weekdayCounts[day]++;
  });
  const weekdayRates = weekdayCounts.map((c, i) => weekdayTotals[i] > 0 ? Math.round((c / weekdayTotals[i]) * 100) : 0);

  const maxRate = Math.max(...weekdayRates);
  const minRate = Math.min(...weekdayRates.filter(r => r >= 0));
  const bestDayIdx = weekdayRates.indexOf(maxRate);
  const dangerDayIdx = weekdayRates.indexOf(minRate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let bestStreak = 0, currentStreak = 0;
  const sortedDates = allDates.sort();
  sortedDates.forEach(d => {
    if (habit.history[d] === 'completed') {
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else if (habit.history[d] !== 'skipped') {
      currentStreak = 0;
    }
  });

  const firstDate = sortedDates[0];
  const daysSinceCreated = firstDate ? Math.floor((Date.now() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  let longestBreak = 0, currentBreak = 0;
  sortedDates.forEach(d => {
    if (habit.history[d] === 'completed' || habit.history[d] === 'skipped') {
      if (currentBreak > longestBreak) longestBreak = currentBreak;
      currentBreak = 0;
    } else {
      currentBreak++;
    }
  });
  if (currentBreak > longestBreak) longestBreak = currentBreak;

  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - 6);
  const prevWeekStart = new Date(today);
  prevWeekStart.setDate(today.getDate() - 13);

  let currentWeekCount = 0;
  let prevWeekCount = 0;

  for (let i = 0; i < 7; i++) {
    const d1 = new Date(currentWeekStart);
    d1.setDate(d1.getDate() + i);
    const ds1 = getLocalDateString(d1);
    if (habit.history[ds1] === 'completed') currentWeekCount++;

    const d2 = new Date(prevWeekStart);
    d2.setDate(d2.getDate() + i);
    const ds2 = getLocalDateString(d2);
    if (habit.history[ds2] === 'completed') prevWeekCount++;
  }

  const currentWeekRate = Math.round((currentWeekCount / 7) * 100);
  const prevWeekRate = Math.round((prevWeekCount / 7) * 100);
  const momentum = currentWeekRate - prevWeekRate;

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let completedInMonth = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (habit.history[dateStr] === 'completed') completedInMonth++;
    }

    const rate = Math.round((completedInMonth / daysInMonth) * 100);
    last6Months.push({ month: monthName, rate });
  }

  return {
    completed, partial, skipped, missed,
    weekdayRates,
    bestDay: dayNames[bestDayIdx],
    dangerDay: dayNames[dangerDayIdx],
    bestStreak,
    currentStreak: habit.streak,
    daysSinceCreated,
    longestBreak,
    last28,
    momentum,
    last6Months
  };
};

// Sub-component: Habit Detail Panel (Redesigned)
const HabitDetailPanel = ({ habit }: { habit: Habit & { rate: number } }) => {
  const stats = getHabitDetailStats(habit);
  const monthlyRate = habit.rate;

  // State for viewing different months
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate Total Completions (All Time)
  const totalCompletions = Object.values(habit.history).filter(s => s === 'completed').length;

  // Generate calendar for SELECTED month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();

  const calendarDays = [];
  for (let i = 0; i < startPadding; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    calendarDays.push(d);
  }

  const getDayStatus = (day: number) => {
    // Robust check for various date formats to handle legacy data
    const paddedMonth = String(month + 1).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');
    const unpaddedMonth = String(month + 1);
    const unpaddedDay = String(day);

    // Priority 1: Canonical padded format (YYYY-MM-DD)
    const k1 = `${year}-${paddedMonth}-${paddedDay}`;
    if (habit.history[k1]) return habit.history[k1];

    // Priority 2: Unpadded day (YYYY-MM-D)
    const k2 = `${year}-${paddedMonth}-${unpaddedDay}`;
    if (habit.history[k2]) return habit.history[k2];

    // Priority 3: Unpadded month (YYYY-M-DD)
    const k3 = `${year}-${unpaddedMonth}-${paddedDay}`;
    if (habit.history[k3]) return habit.history[k3];

    // Priority 4: Fully unpadded (YYYY-M-D)
    const k4 = `${year}-${unpaddedMonth}-${unpaddedDay}`;
    return habit.history[k4];
  };

  // Calculate Weekly Completions for the SELECTED month
  const getWeeklyCompletions = () => {
    const weeksData: { label: string, count: number, hasPassed: boolean }[] = [];
    let weekIndex = 0;
    let dayOfWeek = startPadding; // 0=Sun...

    const realToday = new Date();
    realToday.setHours(0, 0, 0, 0);

    // Initialize first week
    weeksData.push({ label: 'Week 1', count: 0, hasPassed: false });

    for (let d = 1; d <= lastDay.getDate(); d++) {
      // Ensure the current week exists
      if (!weeksData[weekIndex]) {
        weeksData[weekIndex] = { label: `Week ${weekIndex + 1}`, count: 0, hasPassed: false };
      }

      // Check if this day has passed (or is today)
      // If at least one day in the week has passed, we consider the week "started/passed" for stats
      const currentLoopDate = new Date(year, month, d);
      if (currentLoopDate <= realToday) {
        weeksData[weekIndex].hasPassed = true;
      }

      if (getDayStatus(d) === 'completed') {
        weeksData[weekIndex].count++;
      }

      // End of week (Saturday = 6)
      if (dayOfWeek === 6) {
        weekIndex++;
        dayOfWeek = 0;
        // Initialize next week if we have more days
        if (d < lastDay.getDate()) {
          weeksData[weekIndex] = { label: `Week ${weekIndex + 1}`, count: 0, hasPassed: false };
        }
      } else {
        dayOfWeek++;
      }
    }
    return weeksData;
  };

  const weeklyData = getWeeklyCompletions();

  // CHANGED: No longer scaling based on max count, but on 7 days (Absolute)
  // const maxWeeklyCount = Math.max(...weeklyData.map(w => w.count), 1); 

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  return (
    <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-6 animate-fade-in border border-gray-100 dark:border-gray-700">

      {/* 1. HERO STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 text-orange-500 mb-1">
            <Flame size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</div>
          <div className="text-[10px] text-gray-500">Best: {stats.bestStreak}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Activity size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyRate}%</div>
          <div className="text-[10px] text-gray-500">Last 30 days</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <Trophy size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalCompletions}</div>
          <div className="text-[10px] text-gray-500">Times completed</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <Calendar size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Best Day</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white truncate" title={stats.bestDay}>{stats.bestDay || 'N/A'}</div>
          <div className="text-[10px] text-gray-500">Most consistent</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. CALENDAR VIEW */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            {/* Month Navigation */}
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors">
              <ChevronDown size={20} className="rotate-90" />
            </button>

            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              {monthName}
            </h4>

            <button onClick={() => changeMonth(1)} disabled={currentDate > new Date()} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronDown size={20} className="-rotate-90" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-[10px] font-bold text-gray-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;

              const status = getDayStatus(day);
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
              const isFuture = year > new Date().getFullYear() || (year === new Date().getFullYear() && month > new Date().getMonth()) || (year === new Date().getFullYear() && month === new Date().getMonth() && day > new Date().getDate());

              let bgClass = isFuture ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';

              if (status === 'completed') bgClass = 'bg-green-500 text-white shadow-sm';
              else if (status === 'partial') bgClass = 'bg-yellow-500 text-white';
              else if (status === 'skipped') bgClass = 'bg-gray-200 dark:bg-gray-600 text-gray-400 opacity-50';

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all ${bgClass} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : ''}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. WEEKLY COMPLETION CHART */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full min-h-[300px]">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 shrink-0">
            <TrendingUp size={16} className="text-gray-400" />
            Weekly Completions
          </h4>

          <div className="flex-1 flex gap-3 px-2 items-stretch w-full">
            {weeklyData.map((week, i) => {
              // Percentage based on 7 days (Absolute height for bar)
              const heightPercent = Math.min((week.count / 7) * 100, 100);

              // Calculate improvement vs previous week
              let ChangeIcon = null;
              let changeLabel = null;
              let changeColor = 'text-gray-400';

              // Only show for weeks that have passed/started
              if (i > 0 && week.hasPassed) {
                const prevWeek = weeklyData[i - 1];
                const diff = week.count - prevWeek.count;
                const diffPercent = Math.round((Math.abs(diff) / 7) * 100);

                if (diff > 0) {
                  ChangeIcon = TrendingUp;
                  changeLabel = `${diffPercent}%`;
                  changeColor = 'text-green-500';
                } else if (diff < 0) {
                  ChangeIcon = TrendingDown;
                  changeLabel = `${diffPercent}%`;
                  changeColor = 'text-red-500 text-opacity-80';
                } else {
                  ChangeIcon = Minus;
                  changeLabel = '0%';
                  changeColor = 'text-gray-400 text-opacity-60';
                }
              }

              return (
                <div key={i} className="flex-1 flex flex-col items-center group h-full">
                  <div className="w-full relative flex-1 bg-gray-100 dark:bg-gray-700/30 rounded-md overflow-visible">

                    {/* Floating Improvement Label (Only for week 2+ and passed weeks) */}
                    {ChangeIcon && changeLabel && (
                      <div
                        className={`absolute w-full flex items-center justify-center gap-0.5 text-[9px] font-bold transition-all duration-500 ${changeColor}`}
                        style={{ bottom: `${heightPercent}%`, marginBottom: '4px' }}
                      >
                        <ChangeIcon size={10} strokeWidth={3} />
                        <span>{changeLabel}</span>
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      className={`absolute bottom-0 w-full transition-all duration-500 rounded-b-md ${heightPercent === 100 ? 'rounded-t-md bg-indigo-500' : 'bg-indigo-400'}`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] mt-2 font-medium text-gray-400 shrink-0">{week.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Total for {monthName}</span>
              <div className="font-bold text-gray-900 dark:text-white">
                {weeklyData.reduce((acc, curr) => acc + curr.count, 0)} completions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Analytics: React.FC<AnalyticsProps> = ({ habits }) => {
  // State for expanded habit detail
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  // 1. Calculate Summary Metrics
  const summary = useMemo(() => {
    const totalHabits = habits.length;
    if (totalHabits === 0) return { completionRate: 0, perfectDays: 0, bestStreak: 0 };

    const dates = getLast30Days();
    let totalOpportunities = totalHabits * dates.length;
    let totalScore = 0;
    let perfectDaysCount = 0;

    dates.forEach(date => {
      let dailyScore = 0;
      habits.forEach(h => {
        if (h.history[date] === 'completed') dailyScore += 1;
        else if (h.history[date] === 'partial') dailyScore += 0.5;
      });
      totalScore += dailyScore;

      const d = new Date(date);
      const dueHabits = habits.filter(h => {
        if (h.frequency.type === 'daily') return true;
        if (h.frequency.type === 'custom') return h.frequency.days.includes(d.getDay());
        return true;
      });

      if (dueHabits.length > 0) {
        const allDone = dueHabits.every(h => h.history[date] === 'completed' || h.history[date] === 'skipped');
        if (allDone) perfectDaysCount++;
      } else if (habits.length > 0) {
        perfectDaysCount++;
      }
    });

    let maxGlobalStreak = 0;
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        currentStreak++;
      } else {
        const allDone = dueHabits.every(h => h.history[dateStr] === 'completed' || h.history[dateStr] === 'skipped');
        if (allDone) currentStreak++;
        else currentStreak = 0;
      }
      if (currentStreak > maxGlobalStreak) maxGlobalStreak = currentStreak;
    }

    return {
      completionRate: Math.round((totalScore / totalOpportunities) * 100) || 0,
      perfectDays: perfectDaysCount,
      bestStreak: maxGlobalStreak
    };
  }, [habits]);

  // 2. Generate Heatmap Data (Current Year Jan 1 - Dec 31)
  const heatmapData = useMemo(() => {
    const days = getYearDates();
    const data = days.map(date => {
      let dailyScore = 0;
      const totalActive = habits.length;

      habits.forEach(h => {
        if (h.history[date] === 'completed') dailyScore += 1;
        else if (h.history[date] === 'partial') dailyScore += 0.5;
      });

      const intensity = totalActive === 0 ? 0 : dailyScore / totalActive;

      return {
        date,
        intensity
      };
    });

    return data;
  }, [habits]);

  // 3. Per Habit Performance
  const habitPerformance = useMemo(() => {
    const dates = getLast30Days();

    return habits.map(habit => {
      let score = 0;
      dates.forEach(d => {
        if (habit.history[d] === 'completed') score += 1;
        else if (habit.history[d] === 'partial') score += 0.5;
      });
      const rate = Math.round((score / 30) * 100);
      return { ...habit, rate };
    }).sort((a, b) => b.rate - a.rate);
  }, [habits]);

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity <= 0.25) return 'bg-green-200 dark:bg-green-900/40';
    if (intensity <= 0.5) return 'bg-green-400 dark:bg-green-700/60';
    if (intensity <= 0.75) return 'bg-green-600 dark:bg-green-600';
    return 'bg-green-800 dark:bg-green-500';
  };

  const getMonthLabels = () => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Analytics Dashboard</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">Overview</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Completion Rate</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{summary.completionRate}%</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 transition-colors">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Perfect Streak</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{summary.bestStreak} <span className="text-sm font-normal text-gray-400 dark:text-gray-500">days</span></h3>
          </div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-gray-400" size={20} />
          <h3 className="font-semibold text-gray-800 dark:text-white">Yearly Activity ({new Date().getFullYear()})</h3>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            Add habits to see your activity map
          </div>
        ) : (
          <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
            <div className="min-w-max">
              <div className="flex flex-col gap-1">
                <div className="flex text-xs text-gray-400 mb-2 pl-8">
                  {getMonthLabels().map(m => (
                    <div key={m} className="flex-1 w-12 text-center">{m}</div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="grid grid-rows-7 gap-1.5 text-[10px] text-gray-400 pr-2 pt-0.5">
                    <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                  </div>

                  <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                    {heatmapData.map((day) => (
                      <div
                        key={day.date}
                        className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] ${getColor(day.intensity)} hover:scale-125 transition-transform cursor-default`}
                        title={`${day.date}: ${Math.round(day.intensity * 100)}%`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 justify-end">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-200 dark:bg-green-900/40 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-400 dark:bg-green-700/60 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-600 dark:bg-green-600 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-800 dark:bg-green-500 rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Trend Bar Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-gray-400" size={20} />
          <h3 className="font-semibold text-gray-800 dark:text-white">Weekly Completion Trend</h3>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            Add habits to see your weekly trend
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const last7Days = [];
              const today = new Date();
              for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = getLocalDateString(d);

                let completions = 0;
                let partials = 0;
                habits.forEach(h => {
                  if (h.history[dateStr] === 'completed') completions++;
                  else if (h.history[dateStr] === 'partial') partials++;
                });

                const totalScore = completions + (partials * 0.5);
                const percentage = habits.length > 0 ? Math.round((totalScore / habits.length) * 100) : 0;

                last7Days.push({
                  date: dateStr,
                  dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                  completions,
                  partials,
                  totalScore,
                  percentage
                });
              }

              return (
                <div className="space-y-3">
                  {last7Days.map((day, idx) => (
                    <div key={day.date} className="group">
                      <div className="flex items-center gap-3">
                        <div className="w-12 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {day.dayName}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-8 overflow-hidden relative">
                            <div
                              className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 ${day.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                day.percentage >= 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                  day.percentage > 0 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                    'bg-gray-300 dark:bg-gray-700'
                                }`}
                              style={{ width: `${Math.max(day.percentage, 5)}%` }}
                            >
                              <span className="text-xs font-bold text-white">
                                {day.completions > 0 && day.completions}
                              </span>
                            </div>
                          </div>
                          <div className="w-16 text-right text-sm text-gray-600 dark:text-gray-400">
                            {day.percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>80%+</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>50-79%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span>&lt;50%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Habit Breakdown */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Habit Performance (Last 30 Days)</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Click a habit to see detailed insights</p>
        <div className="space-y-3">
          {habitPerformance.map(habit => {
            const isExpanded = expandedHabitId === habit.id;
            return (
              <div key={habit.id} className="transition-all">
                <button
                  onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                  className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 -m-2 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      {habit.title}
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{habit.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${habit.rate >= 80 ? 'bg-green-500' :
                        habit.rate >= 50 ? 'bg-blue-500' :
                          'bg-orange-400'
                        }`}
                      style={{ width: `${habit.rate}%` }}
                    ></div>
                  </div>
                </button>
                {isExpanded && <HabitDetailPanel habit={habit} />}
              </div>
            );
          })}
          {habitPerformance.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No habits to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};