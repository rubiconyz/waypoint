import React, { useMemo } from 'react';
import { SavedWord } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GrowthChartProps {
    words: SavedWord[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ words }) => {

    const { weeklyData, currentMonthLabel, totalCount } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 1. Determine weeks in current month
        // Start from 1st of month
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

        const weeks = [];
        let currentStart = new Date(startOfMonth);

        // Align to Sunday-Saturday weeks? Or just 7-day chunks?
        // Habit tracker usually uses calendar weeks (Sun-Sat or Mon-Sun).
        // Let's assume standard Sun-Sat distinct weeks for the month view.

        // Adjust start to be the first day of the first week that contains the 1st?
        // Or just partition the month into week 1, 2, 3, 4, 5?
        // Screenshot shows "Week 1", "Week 2".
        // Let's simple slice the month into 7-day chunks starting from the 1st?
        // No, calendar alignment is better.

        // Let's iterate by weeks.
        const weekData = [];
        // Helper to get week number of the month (0-based)

        // We will bin words into "Week 1" (Days 1-7), "Week 2" (8-14) etc for simplicity?
        // OR better: Real calendar weeks.

        // Let's go with "Week 1" = First 7 days of month, etc. This is consistent and easy.
        // Actually, "Weekly Completions" usually implies calendar weeks.
        // Let's stick to strict calendar weeks?
        // If I look at the screenshot, "Week 1" ... "Week 5".
        // A month can span 5 or 6 weeks.

        // Let's gather all weeks that overlap this month.
        // Find the Sunday before or on startOfMonth
        const calendarStart = new Date(startOfMonth);
        calendarStart.setDate(startOfMonth.getDate() - startOfMonth.getDay()); // Go back to Sunday

        let iter = new Date(calendarStart);
        let weekIndex = 1;

        while (iter <= endOfMonth && weekIndex <= 5) { // Limit to 5 weeks max to fit UI
            const weekStart = new Date(iter);
            const weekEnd = new Date(iter);
            weekEnd.setDate(weekEnd.getDate() + 6);

            // Count words in this range
            const count = words.filter(w => {
                const d = new Date(w.addedAt);
                return d >= weekStart && d <= weekEnd;
            }).length;

            // Check if past
            const hasPassed = weekStart <= now;

            weekData.push({ label: `Week ${weekIndex}`, count, hasPassed });

            // Next week
            iter.setDate(iter.getDate() + 7);
            weekIndex++;
        }

        const total = words.filter(w => {
            const d = new Date(w.addedAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        const monthLabel = startOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

        return { weeklyData: weekData, currentMonthLabel: monthLabel, totalCount: total };
    }, [words]);

    // Find max for scaling (min 10 to avoid huge bars for 1 word)
    const maxCount = Math.max(...weeklyData.map(w => w.count), 5); // Default scale of 5 if empty

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full min-h-[300px]">
            <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 shrink-0">
                <TrendingUp size={20} className="text-gray-400" />
                Weekly Consistency
            </h4>

            <div className="flex-1 flex gap-3 px-2 items-end w-full pb-4">
                {weeklyData.map((week, i) => {
                    // Percentage height relative to max in this period
                    const heightPercent = Math.max(4, (week.count / maxCount) * 100); // Min 4% for visibility

                    // Calculate improvement vs previous week
                    let ChangeIcon = null;
                    let changeLabel = null;
                    let changeColor = 'text-gray-400';

                    if (i > 0 && week.hasPassed) {
                        const prevWeek = weeklyData[i - 1];
                        const diff = week.count - prevWeek.count;
                        // Avoid division by zero
                        const diffPercent = prevWeek.count > 0 ? Math.round((Math.abs(diff) / prevWeek.count) * 100) : (week.count > 0 ? 100 : 0);

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
                        <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                            {/* Bar Container */}
                            <div className="w-full relative flex-1 bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden flex items-end">

                                {/* The Bar */}
                                <div
                                    className="w-full bg-emerald-500 rounded-lg transition-all duration-1000 ease-out group-hover:bg-emerald-400 relative"
                                    style={{ height: `${heightPercent}%` }}
                                >
                                    {/* Tooltip Value */}
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                        {week.count} words
                                    </div>
                                </div>

                                {/* Floating Improvement Label (Week 2+) */}
                                {ChangeIcon && changeLabel && (
                                    <div
                                        className={`absolute w-full top-2 left-0 flex items-center justify-center gap-0.5 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${changeColor}`}
                                    >
                                        <ChangeIcon size={10} strokeWidth={3} />
                                        <span>{changeLabel}</span>
                                    </div>
                                )}
                            </div>

                            <span className="text-[10px] text-gray-400 font-medium mt-3">{week.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <span className="text-xs text-gray-400">Total for {currentMonthLabel}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{totalCount} mastered</span>
            </div>
        </div>
    );
};
