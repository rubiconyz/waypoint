import React, { useMemo, useState } from 'react';
import { Habit, HabitStatus } from '../types';
import { TrendingUp, Calendar, Award, Activity, ChevronDown, Flame, Trophy, AlertTriangle, Clock, TrendingDown, Minus, Flag, Hexagon, Scale, Target, BarChart2 } from 'lucide-react';
import { RadarChart } from './RadarChart';

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
    const weeklyData = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Determine weeks in this month
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // Find the Sunday before or on startOfMonth to align weeks
    const calendarStart = new Date(startOfMonth);
    calendarStart.setDate(startOfMonth.getDate() - startOfMonth.getDay());

    let iter = new Date(calendarStart);
    let weekIndex = 1;

    // Iterate until we pass the end of the month
    // Cap at 6 weeks max to prevent overflow, though 5 is typical
    while (iter <= endOfMonth && weekIndex <= 6) {
      const startOfWeek = new Date(iter);
      const endOfWeek = new Date(iter);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      const now = new Date();

      let completedCount = 0;
      let totalCount = 0; // Opportunities (days due)
      let rawRate = 0; // Sum of completion values (1 for done, 0.5 partial)

      // Iterate through days in this week window
      for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
        // Robust lookup (Format priority: YYYY-MM-DD, YYYY-MM-D, YYYY-M-DD, YYYY-M-D)
        const dYear = d.getFullYear();
        const dMonth = d.getMonth() + 1;
        const dDay = d.getDate();

        const paddedMonth = String(dMonth).padStart(2, '0');
        const paddedDay = String(dDay).padStart(2, '0');
        const unpaddedMonth = String(dMonth);
        const unpaddedDay = String(dDay);

        const k1 = `${dYear}-${paddedMonth}-${paddedDay}`;
        const k2 = `${dYear}-${paddedMonth}-${unpaddedDay}`;
        const k3 = `${dYear}-${unpaddedMonth}-${paddedDay}`;
        const k4 = `${dYear}-${unpaddedMonth}-${unpaddedDay}`;

        const status = habit.history[k1] || habit.history[k2] || habit.history[k3] || habit.history[k4];

        // Is habit due on this day?
        const dayIdx = d.getDay();
        let isDue = true;
        if (habit.frequency.type === 'custom' && !habit.frequency.days.includes(dayIdx)) {
          isDue = false;
        }

        if (isDue) {
          totalCount++;
          if (status === 'completed') {
            completedCount++;
            rawRate += 1;
          } else if (status === 'partial') {
            rawRate += 0.5;
          }
        }
      }

      const rate = totalCount > 0 ? Math.round((rawRate / totalCount) * 100) : 0;

      // Label logic: "Week 1", "Week 2" etc.
      const label = `Week ${weekIndex}`;

      // Has this week passed?
      const hasPassed = startOfWeek <= now;

      weeklyData.push({
        label,
        count: completedCount,
        total: totalCount,
        rate,
        start: startOfWeek.toLocaleDateString(),
        end: endOfWeek.toLocaleDateString(),
        hasPassed
      });

      // Next week
      iter.setDate(iter.getDate() + 7);
      weekIndex++;
    }

    return weeklyData;
  };

  const weeklyData = getWeeklyCompletions();

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

        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-700 shadow-sm">
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

              // Check if this is the creation date (Visual only, failsafe)
              let isCreationDate = false;
              let isAfterCreation = false;

              try {
                if (habit.createdAt) {
                  // Normalize: Extract YYYY-MM-DD part only to avoid timezone shifts
                  const dateStr = habit.createdAt.split('T')[0];
                  const [cYear, cMonth, cDay] = dateStr.split('-').map(Number);

                  // Create comparable values (YYYYMMDD integer) for simple comparison
                  const currentVal = year * 10000 + (month + 1) * 100 + day;
                  const createdVal = cYear * 10000 + cMonth * 100 + cDay;

                  if (currentVal === createdVal) isCreationDate = true;
                  if (currentVal >= createdVal) isAfterCreation = true;
                }
              } catch (e) {
                // Ignore errors
              }

              // Default: Pre-Start (Gray)
              let bgClass = 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500';

              if (isFuture) {
                bgClass = 'bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600';
              } else if (isAfterCreation) {
                // Missed (Red) - Default state for days after creation that aren't done
                bgClass = 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400';
              }

              // Status Overrides
              if (status === 'completed') bgClass = 'bg-green-500 text-white shadow-sm';
              else if (status === 'partial') bgClass = 'bg-yellow-500 text-white';
              else if (status === 'skipped') bgClass = 'bg-gray-200 dark:bg-gray-600 text-gray-400 opacity-50';

              return (
                <div
                  key={day}
                  className={`relative aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all ${bgClass} 
                    ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : ''}
                    ${isCreationDate ? 'border-2 border-dashed border-yellow-500 dark:border-yellow-400' : ''}
                  `}
                  title={isCreationDate ? 'Habit Created' : undefined}
                >
                  {isCreationDate && (
                    <Flag
                      className="absolute top-0.5 right-0.5 text-yellow-500 fill-yellow-500 pointer-events-none z-10"
                      size={8}
                      style={{ width: '8px', height: '8px' }}
                    />
                  )}
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Done</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-800"></div>
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-600"></div>
              <span>Pre-Start</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="relative w-3 h-3 flex items-center justify-center border border-dashed border-yellow-500 rounded-[1px]">
                <Flag size={6} className="text-yellow-500 fill-yellow-500" />
              </div>
              <span>Started</span>
            </div>
          </div>
        </div>

        {/* 3. WEEKLY COMPLETIONS CHART (Restored) */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full min-h-[300px]">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 shrink-0">
            <BarChart2 size={16} className="text-gray-400" />
            Weekly Completions
          </h4>

          <div className="flex-1 flex gap-3 px-2 items-end w-full pb-2">
            {weeklyData.map((week, i) => {
              // Calculate relative height (max 100%)
              const heightPercent = week.rate;

              // Define improvement
              const prevWeek = weeklyData[i - 1];
              let diffPercent = 0;
              let TrendIcon = Minus;
              let trendColor = 'text-gray-400';

              if (i > 0) {
                const diff = week.rate - prevWeek.rate;
                // Percent difference logic or just absolute difference? 
                // Image shows "14%", likely difference in rate or count.
                // Let's use simple difference for rate (e.g. 50% -> 64% = +14%)
                diffPercent = diff;

                if (diff > 0) {
                  TrendIcon = TrendingUp;
                  trendColor = 'text-green-500';
                } else if (diff < 0) {
                  TrendIcon = TrendingDown;
                  trendColor = 'text-orange-500';
                }
              }

              return (
                <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                  <div className="w-full relative flex-1 bg-gray-100 dark:bg-gray-700/30 rounded-md overflow-visible flex items-end">

                    {/* Bar */}
                    <div
                      className={`w-full transition-all duration-1000 ease-out rounded-md relative ${week.rate > 0 ? 'bg-indigo-500' : 'bg-transparent'}`}
                      style={{ height: `${Math.max(heightPercent, 0)}%` }}
                    >
                      {/* Floating Trend Label (Above Bar) */}
                      {i > 0 && Math.abs(diffPercent) > 0 && (
                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 flex items-center gap-0.5 whitespace-nowrap ${trendColor} z-10 font-bold`}>
                          <TrendIcon size={12} strokeWidth={3} />
                          <span className="text-[10px]">{Math.abs(diffPercent)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] mt-3 font-medium text-gray-400 shrink-0">{week.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Performance</span>
              <div className="font-bold text-gray-900 dark:text-white">
                {Math.round(weeklyData.reduce((acc, curr) => acc + curr.rate, 0) / 4)}% avg
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Insight Card
const InsightCard = ({ icon: Icon, title, value, description, trend, trendLabel, color = 'blue' }: any) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150`} />

    <div className="flex items-start justify-between mb-3 relative z-10">
      <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'} bg-white dark:bg-gray-900 px-2 py-1 rounded-full shadow-sm`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendLabel}
        </div>
      )}
    </div>

    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 relative z-10">{title}</h4>
    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">{value}</div>
    <p className="text-xs text-gray-400 relative z-10">{description}</p>
  </div>
);

export const Analytics: React.FC<AnalyticsProps> = ({ habits }) => {
  // State for expanded habit detail
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  const insights = useMemo(() => {
    if (habits.length === 0) return null;

    const today = new Date();
    const currentMonth = today.getMonth();
    // const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    // 1. Strongest Habit (Best rate this month)
    let strongestHabit = null;
    let strongestRate = -1;

    // 2. Monthly Growth
    let currentMonthTotal = 0;
    let currentMonthOpportunities = 0;
    let prevMonthTotal = 0;
    let prevMonthOpportunities = 0;

    habits.forEach(h => {
      // Strongest Habit Logic
      const stats = getHabitDetailStats(h);

      const currentMonthStat = stats.last6Months[stats.last6Months.length - 1];
      if (currentMonthStat && currentMonthStat.rate > strongestRate) {
        strongestRate = currentMonthStat.rate;
        strongestHabit = h;
      }

      // Monthly Growth Logic
      const prevMonthStat = stats.last6Months[stats.last6Months.length - 2];
      if (currentMonthStat) {
        currentMonthTotal += currentMonthStat.rate;
        currentMonthOpportunities++;
      }
      if (prevMonthStat) {
        prevMonthTotal += prevMonthStat.rate;
        prevMonthOpportunities++;
      }
    });

    const avgCurrentRate = currentMonthOpportunities > 0 ? Math.round(currentMonthTotal / currentMonthOpportunities) : 0;
    const avgPrevRate = prevMonthOpportunities > 0 ? Math.round(prevMonthTotal / prevMonthOpportunities) : 0;
    const growth = avgCurrentRate - avgPrevRate;

    return {
      strongest: {
        name: strongestHabit ? (strongestHabit as Habit).title : 'N/A',
        rate: strongestRate,
        icon: strongestHabit ? (strongestHabit as Habit).category : 'Award'
      },
      growth: {
        value: growth,
        current: avgCurrentRate,
        prev: avgPrevRate
      }
    };
  }, [habits]);

  const summary = useMemo(() => {
    const totalHabits = habits.length;
    if (totalHabits === 0) return { completionRate: 0, perfectDays: 0, bestStreak: 0 };

    const dates = getLast30Days();
    let totalOpportunities = 0;
    let totalScore = 0;
    let perfectDaysCount = 0;

    dates.forEach(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      const activeHabitsOnDate = habits.filter(h => {
        if (!h.createdAt) return true; // Legacy support
        const created = new Date(h.createdAt);
        created.setHours(0, 0, 0, 0);
        return created <= d;
      });

      // Skip days where no habits existed yet
      if (activeHabitsOnDate.length === 0) return;

      let dailyScore = 0;
      activeHabitsOnDate.forEach(h => {
        if (h.history[date] === 'completed') dailyScore += 1;
        else if (h.history[date] === 'partial') dailyScore += 0.5;
      });

      totalScore += dailyScore;
      const dueHabits = activeHabitsOnDate.filter(h => {
        if (h.frequency.type === 'daily') return true;
        if (h.frequency.type === 'custom') return h.frequency.days.includes(d.getDay());
        return true;
      });

      // Add to total opportunities based on DUE habits on that day
      // Only count opportunities if the habit was actually scheduled
      totalOpportunities += dueHabits.length;

      if (dueHabits.length > 0) {
        const allDone = dueHabits.every(h => h.history[date] === 'completed' || h.history[date] === 'skipped');
        if (allDone) perfectDaysCount++;
      } else {
        // If habits existed but none were due, strictly speaking it's a perfect adherence day?
        // Or null day. Let's count it as perfect to avoid penalizing off-days.
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

      // Also filter streak calculation by creation date
      const activeForStreak = habits.filter(h => {
        if (!h.createdAt) return true;
        const created = new Date(h.createdAt);
        created.setHours(0, 0, 0, 0);
        return created <= d;
      });

      if (activeForStreak.length === 0) {
        // Determine if we should break streak or continue?
        // If no habits existed, streak logic is undefined. 
        // Let's stop counting streak if we hit a date before ANY habit existed.
        if (currentStreak > 0) {
          // We reached the beginning of time for the user
          if (currentStreak > maxGlobalStreak) maxGlobalStreak = currentStreak;
          break;
        }
        continue;
      }

      const dueHabits = activeForStreak.filter(h => {
        if (h.frequency.type === 'daily') return true;
        if (h.frequency.type === 'custom') return h.frequency.days.includes(d.getDay());
        return true;
      });

      if (dueHabits.length === 0) {
        currentStreak++;
      } else {
        const allDone = dueHabits.every(h => h.history[dateStr] === 'completed' || h.history[dateStr] === 'skipped');
        if (allDone) currentStreak++;
        else {
          if (currentStreak > maxGlobalStreak) maxGlobalStreak = currentStreak;
          currentStreak = 0;
        }
      }
    }
    // Final check
    if (currentStreak > maxGlobalStreak) maxGlobalStreak = currentStreak;

    return {
      completionRate: totalOpportunities === 0 ? 0 : Math.round((totalScore / totalOpportunities) * 100),
      perfectDays: perfectDaysCount,
      bestStreak: maxGlobalStreak
    };
  }, [habits]);

  // 2. Generate Heatmap Data (Current Year Jan 1 - Dec 31)
  const heatmapData = useMemo(() => {
    const days = getYearDates();
    const currentYear = new Date().getFullYear();
    const startDayIndex = new Date(currentYear, 0, 1).getDay(); // 0=Sun, 1=Mon, etc.

    // Pre-parse habit creation dates for efficiency
    const habitCreationDates = habits.map(h => ({
      ...h,
      parsedCreatedAt: h.createdAt ? new Date(h.createdAt) : null
    }));

    // Normalize creation dates to midnight
    habitCreationDates.forEach(h => {
      if (h.parsedCreatedAt) h.parsedCreatedAt.setHours(0, 0, 0, 0);
    });

    const data = days.map(date => {
      let dailyScore = 0;
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);

      const activeHabits = habitCreationDates.filter(h => {
        if (!h.parsedCreatedAt) return true;
        return h.parsedCreatedAt <= d;
      });

      const totalActive = activeHabits.length;

      activeHabits.forEach(h => {
        if (h.history[date] === 'completed') dailyScore += 1;
        else if (h.history[date] === 'partial') dailyScore += 0.5;
      });

      const intensity = totalActive === 0 ? 0 : dailyScore / totalActive;

      return {
        date,
        intensity
      };
    });

    // Add padding for start of year to align grid rows (Sun-Sat)
    const padding = new Array(startDayIndex).fill(null);
    return [...padding, ...data];
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

      {/* 0. INSIGHTS SECTION */}
      {insights && (
        <>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Hexagon size={20} className="text-blue-500" />
            Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InsightCard
              icon={TrendingUp}
              title="Strongest Habit"
              value={insights.strongest.name}
              description={`Leading with ${insights.strongest.rate}% completion rate this month.`}
              color="indigo"
            />
            <InsightCard
              icon={Activity}
              title="Monthly Growth"
              value={`${insights.growth.value > 0 ? '+' : ''}${insights.growth.value}%`}
              description={insights.growth.value >= 0 ? "You're improving compared to last month!" : "Slight dip compared to last month."}
              trend={insights.growth.value >= 0 ? 'up' : 'down'}
              trendLabel={`${Math.abs(insights.growth.value)}%`}
              color={insights.growth.value >= 0 ? 'green' : 'orange'}
            />
            <InsightCard
              icon={Award}
              title="Consistency Score"
              value={summary.completionRate + '%'}
              description="Overall adherence across all active habits."
              color="blue"
            />
          </div>
        </>
      )}

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
                    {heatmapData.map((day, idx) => {
                      if (!day) return <div key={`empty-${idx}`} />;
                      return (
                        <div
                          key={day.date}
                          className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] ${getColor(day.intensity)} hover:scale-125 transition-transform cursor-default`}
                          title={`${day.date}: ${Math.round(day.intensity * 100)}%`}
                        />
                      );
                    })}
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

                // FILTER: Only count habits that existed on this day
                const dMidnight = new Date(d);
                dMidnight.setHours(0, 0, 0, 0);

                const activeHabitsOnDay = habits.filter(h => {
                  if (!h.createdAt) return true;
                  const created = new Date(h.createdAt);
                  created.setHours(0, 0, 0, 0);
                  return created <= dMidnight;
                });

                // Filter for DUE habits (Daily or Custom Day match)
                const dueHabits = activeHabitsOnDay.filter(h => {
                  // Status check: If the day is valid for this habit
                  if (h.frequency.type === 'daily') return true;
                  if (h.frequency.type === 'custom') return h.frequency.days.includes(d.getDay());
                  return true; // Weekly habits are "due" every day in terms of opportunity? Or just track progress? 
                  // Let's count them as due to encourage daily engagement, or maybe only if they have history?
                  // For consistency with Harmony Score, let's treat Weekly as always available for "Done" but maybe not strictly "Missed" if skipped?
                  // For simplicity/strictness (Ghost Mode): treat as opportunity.
                });

                let completions = 0;
                let partials = 0;
                let activeCount = 0;

                dueHabits.forEach(h => {
                  if (h.history[dateStr] === 'completed') completions++;
                  else if (h.history[dateStr] === 'partial') partials++;

                  // Only count towards denominator if it was due
                  activeCount++;
                });

                const totalScore = completions + (partials * 0.5);
                const percentage = activeCount > 0 ? Math.round((totalScore / activeCount) * 100) : 0;

                last7Days.push({
                  date: dateStr,
                  dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                  completions,
                  partials,
                  totalScore,
                  percentage,
                  activeCount
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
                            {/* Bar Layer */}
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3 ${day.percentage >= 80 ? 'bg-emerald-500' :
                                day.percentage >= 50 ? 'bg-blue-500' :
                                  day.percentage > 0 ? 'bg-orange-500' :
                                    'bg-gray-300 dark:bg-gray-700'
                                }`}
                              style={{ width: `${Math.max(day.percentage, 5)}%` }}
                            >
                              {/* Count Label */}
                              <span className="text-xs font-bold text-white shadow-sm">
                                {day.completions > 0 ? day.completions : ''}
                              </span>
                            </div>
                          </div>
                          <div className="w-10 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                            {day.percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-4 text-[10px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>80%+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>50-79%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>&lt;50%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. LIFE BALANCE SPIDER CHART & STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-slide-up-delay-2">
        {/* SPIDER CHART */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 self-start w-full">
            <Hexagon size={18} className="text-purple-500" />
            Life Balance
          </h4>
          <p className="text-xs text-gray-500 mb-6 self-start">Consistency across categories</p>

          <div className="w-full flex justify-center">
            {(() => {
              // Calculate Category Scores
              const categoryStats = useMemo(() => {
                const stats: Record<string, { total: number; completed: number }> = {};

                habits.forEach(habit => {
                  if (!stats[habit.category]) {
                    stats[habit.category] = { total: 0, completed: 0 };
                  }

                  // Check history for completions
                  // We'll look at the last 30 days for relevance
                  const today = new Date();
                  for (let i = 0; i < 30; i++) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];

                    // Simplified consistency: 
                    // If habit existed on that day (createdAt <= date), calculate it
                    const created = habit.createdAt ? new Date(habit.createdAt) : new Date(0);
                    if (d >= created) {
                      stats[habit.category].total += 1;

                      if (habit.history[dateStr] === 'completed') {
                        stats[habit.category].completed += 1;
                      }
                    }
                  }
                });

                // Convert to array
                return Object.entries(stats).map(([label, data]) => ({
                  label,
                  value: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
                }));
              }, [habits]);

              if (categoryStats.length < 3) {
                return (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 p-8 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl w-full">
                    <Hexagon size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Not enough categories</p>
                    <p className="text-xs mt-1">Add habits in at least 3 distinct categories<br />to see your life balance web.</p>
                  </div>
                );
              }

              return (
                <RadarChart
                  data={categoryStats}
                  size={280}
                  color="#2563eb" // Blue-600
                />
              );
            })()}
          </div>
        </div>

        {/* HARMONY SCORE & FOCUS (Replaces Weekly Cycle) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Scale size={18} className="text-teal-500" />
              Harmony Score
            </h4>
            <p className="text-xs text-gray-500 mb-6">Measure of your life balance</p>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-8">
            {(() => {
              // Calculate category stats
              const catRates: Record<string, number> = {};
              const catCounts: Record<string, number> = {};

              habits.forEach(h => {
                if (!catCounts[h.category]) {
                  catCounts[h.category] = 0;
                  catRates[h.category] = 0;
                }
                catCounts[h.category]++;

                // Smart Rate Calculation (Active days only)
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const created = h.createdAt ? new Date(h.createdAt) : new Date(0);
                created.setHours(0, 0, 0, 0);

                let completions = 0;
                let opportunities = 0;

                for (let i = 0; i < 30; i++) {
                  const d = new Date();
                  d.setDate(today.getDate() - i);
                  d.setHours(0, 0, 0, 0);

                  // Only count if habit existed
                  if (d >= created) {
                    const dateStr = getLocalDateString(d);
                    const dayIdx = d.getDay();

                    // Check if due (Daily or Custom)
                    let isDue = true;
                    if (h.frequency.type === 'custom' && !h.frequency.days.includes(dayIdx)) {
                      isDue = false;
                    }

                    if (isDue) {
                      opportunities++;
                      if (h.history[dateStr] === 'completed') completions++;
                    }
                  }
                }

                // If no opportunities (e.g. created today but not due yet), treat as 100% to avoid penalty?
                // Or 0? Let's treat as 0 but valid if it strictly starts tomorrow.
                // Better: if opportunities is 0, ignore this habit from stats or default to 0.
                const rate = opportunities > 0 ? (completions / opportunities) : 0;
                catRates[h.category] += rate;
              });

              // Average per category (0-100 scale)
              const categoryScores = Object.keys(catRates).map(cat => {
                const avg = catCounts[cat] > 0 ? (catRates[cat] / catCounts[cat]) * 100 : 0;
                return { category: cat, score: Math.round(avg) };
              });

              if (categoryScores.length === 0) return <p className="text-gray-400 text-sm text-center">Add habits to see your harmony score.</p>;

              // 1. Calculate Harmony
              // Uses Coefficient of Variation (CV) for stricter balance checking
              const values = categoryScores.map(c => c.score);
              const mean = values.reduce((a, b) => a + b, 0) / values.length;

              let harmonyScore = 0;

              if (mean > 0) {
                const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
                const stdDev = Math.sqrt(variance);

                // Penalty factor: How much deviation is allowed?
                // A CV of 0.5 (Mean 50, SD 25) should result in a low score (e.g. 50).
                // Formula: 100 * (1 - CV)
                const cv = stdDev / mean;
                // Clamp CV to 1 (if SD > mean, score is 0)
                harmonyScore = Math.round(Math.max(0, 100 * (1 - cv)));
              }

              // Edge case: If Mean is 0 (all zeros), Harmony is technically 100 (Balanced failure)
              // But that feels wrong for a "Score". Let's handle all-zeros as 0 harmony for motivation.
              if (mean === 0) harmonyScore = 0;

              // 2. Identify Weakest Link (Lowest score)
              const sorted = [...categoryScores].sort((a, b) => a.score - b.score);
              const weakest = sorted[0];

              return (
                <>
                  {/* HARMONY DISPLAY */}
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {/* Circle Background */}
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-gray-100 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className={`${harmonyScore > 80 ? 'text-teal-500' : harmonyScore > 50 ? 'text-blue-500' : 'text-orange-500'} transition-all duration-1000 ease-out`}
                          strokeDasharray={`${harmonyScore}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke="currentColor" strokeWidth="3" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{harmonyScore}</span>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 dark:text-white">
                        {harmonyScore >= 80 ? 'Excellent Balance' : harmonyScore >= 60 ? 'Good Balance' : 'Unbalanced'}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed max-w-[150px]">
                        {harmonyScore >= 80 ? "You're giving attention to all areas of your life!" : "Some areas are getting left behind."}
                      </p>
                    </div>
                  </div>

                  {/* WEAKEST LINK */}
                  <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-4 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 shrink-0">
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-0.5">Focus Area</p>
                      <h5 className="font-bold text-gray-900 dark:text-white">{weakest.category}</h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Trailing at <span className="font-bold">{weakest.score}%</span>. Try doing just one small task in this category today.
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
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