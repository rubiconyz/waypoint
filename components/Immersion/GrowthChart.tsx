import React, { useMemo } from 'react';
import { SavedWord } from '../../types';
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react';

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

    // Find max for scaling (min 5)
    const maxCount = Math.max(...weeklyData.map(w => w.count), 5); // Default scale of 5 if empty

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full min-h-[300px]">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 shrink-0">
                <BarChart2 size={16} className="text-gray-400" />
                Weekly Consistency
            </h4>

            <div className="flex-1 flex gap-3 px-2 items-end w-full pb-2">
                {weeklyData.map((week, i) => {
                    // Percentage relative to max
                    const max = Math.max(maxCount, 1);
                    const heightPercent = (week.count / max) * 100;

                    // Calculate improvement
                    const prevWeek = weeklyData[i - 1];
                    let diffPercent = 0;
                    let TrendIcon = BarChart2; // Default icon
                    let trendColor = 'text-indigo-500';
                    let labelText = `${week.count}`;

                    // Trend logic for weeks 2+
                    if (i > 0) {
                        const prevCount = prevWeek?.count || 0;
                        const diff = week.count - prevCount;
                        if (prevCount > 0) diffPercent = Math.round((diff / prevCount) * 100);
                        else diffPercent = week.count > 0 ? 100 : 0;

                        labelText = `${Math.abs(diffPercent)}%`;

                        if (diff > 0) {
                            TrendIcon = TrendingUp;
                            trendColor = 'text-green-500';
                        } else if (diff < 0) {
                            TrendIcon = TrendingDown;
                            trendColor = 'text-orange-500';
                        } else {
                            TrendIcon = Minus;
                            trendColor = 'text-gray-400';
                            labelText = '0%';
                        }
                    } else if (week.count > 0) {
                        // First week with data
                        TrendIcon = TrendingUp; // Show generic up for start
                        trendColor = 'text-indigo-500';
                        labelText = `${week.count}`;
                    }

                    // Only show label if there is data
                    const showLabel = week.count > 0;

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                            <div className="w-full relative flex-1 bg-gray-100 dark:bg-gray-700/30 rounded-md overflow-visible flex items-end">

                                <div
                                    className={`w-full transition-all duration-1000 ease-out rounded-md relative ${week.count > 0 ? 'bg-indigo-500' : 'bg-transparent'}`}
                                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                >
                                    {/* Floating Label - Show if count > 0 */}
                                    {showLabel && (
                                        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 flex items-center gap-0.5 whitespace-nowrap ${trendColor} text-xs font-bold bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full shadow-sm shadow-indigo-100 dark:shadow-none border border-gray-100 dark:border-gray-700`}>
                                            <TrendIcon size={10} strokeWidth={3} />
                                            <span>{labelText}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <span className="text-[10px] mt-3 font-medium text-gray-400 shrink-0">{week.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 shrink-0">
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Total for {currentMonthLabel}</span>
                    <div className="font-bold text-gray-900 dark:text-white">
                        {totalCount} mastered
                    </div>
                </div>
            </div>
        </div>
    );
};
