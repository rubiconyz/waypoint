import React, { useMemo } from 'react';
import { Habit } from '../types';
import { TrendingUp, Calendar, Award, Activity } from 'lucide-react';

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

export const Analytics: React.FC<AnalyticsProps> = ({ habits }) => {
  // 1. Calculate Summary Metrics
  const summary = useMemo(() => {
    const totalHabits = habits.length;
    if (totalHabits === 0) return { completionRate: 0, perfectDays: 0, bestStreak: 0 };

    const dates = getLast30Days();
    let totalOpportunities = totalHabits * dates.length; // Approximate, doesn't account for frequency
    let totalScore = 0;
    let perfectDaysCount = 0;

    dates.forEach(date => {
      let dailyScore = 0;
      habits.forEach(h => {
        if (h.history[date] === 'completed') dailyScore += 1;
        else if (h.history[date] === 'partial') dailyScore += 0.5;
      });
      totalScore += dailyScore;

      // Perfect day calculation for summary
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
        // If no habits due, is it a perfect day? Let's say yes for consistency.
        perfectDaysCount++;
      }
    });

    // Calculate Global Perfect Streak (Historical)
    let maxGlobalStreak = 0;
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
        intensity // 0 to 1
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months;
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
              {/* Grid Container */}
              <div className="flex flex-col gap-1">
                {/* Months Label (Approximate) */}
                <div className="flex text-xs text-gray-400 mb-2 pl-8">
                  {getMonthLabels().map(m => (
                    <div key={m} className="flex-1 w-12 text-center">{m}</div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {/* Days of week labels */}
                  <div className="grid grid-rows-7 gap-1.5 text-[10px] text-gray-400 pr-2 pt-0.5">
                    <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                  </div>

                  {/* The Grid: 52 columns (weeks) x 7 rows (days) */}
                  {/* Actually, mapping flat array to grid-flow-col is easier */}
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

                // Count completions for this day
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

              const maxCompletions = Math.max(...last7Days.map(d => d.completions), 1);

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
        <h3 className="font-semibold text-gray-800 dark:text-white mb-6">Habit Performance (Last 30 Days)</h3>
        <div className="space-y-5">
          {habitPerformance.map(habit => (
            <div key={habit.id}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700 dark:text-gray-300">{habit.title}</span>
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
            </div>
          ))}
          {habitPerformance.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No habits to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};