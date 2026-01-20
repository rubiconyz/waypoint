import React, { useMemo, useState } from 'react';
import { SavedWord } from '../../types';
import { TrendingUp, ChevronLeft, ChevronRight, TrendingDown, Minus } from 'lucide-react';

interface GrowthChartProps {
    words: SavedWord[];
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ words }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { weeklyData, currentMonthLabel, totalCount } = useMemo(() => {
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // 1. Determine weeks in current month
        const startOfMonth = new Date(currentYear, currentMonth, 1);
        const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

        // Align to Calendar Weeks (Sun-Sat)
        const calendarStart = new Date(startOfMonth);
        calendarStart.setDate(startOfMonth.getDate() - startOfMonth.getDay()); // Go back to Sunday

        let iter = new Date(calendarStart);
        let weekIndex = 1;
        const weekData = [];
        const now = new Date(); // To check "hasPassed"

        while (iter <= endOfMonth && weekIndex <= 5) { // Limit to 5 rows for UI space
            const weekStart = new Date(iter);
            const weekEnd = new Date(iter);
            weekEnd.setDate(weekEnd.getDate() + 6);

            // Count words in this range
            const count = words.filter(w => {
                const d = new Date(w.addedAt);
                return d >= weekStart && d <= weekEnd;
            }).length;

            // Check if past (week start is before right now)
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
    }, [words, currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
        });
    };


    // Find max for scaling (min 5)
    const maxCount = Math.max(...weeklyData.map(w => w.count), 5);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-full min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 shrink-0">
                    <TrendingUp size={20} className="text-gray-400" />
                    Weekly Consistency
                </h4>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-medium text-gray-500 min-w-[80px] text-center">{currentMonthLabel}</span>
                    <button
                        onClick={handleNextMonth}
                        disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-3 px-2 items-end w-full pb-2">
                {weeklyData.map((week, i) => {
                    // Percentage height relative to max in this period
                    const heightPercent = maxCount > 0 ? (week.count / maxCount) * 100 : 0;

                    // Calculate improvement vs previous week
                    const prevWeek = weeklyData[i - 1];
                    const isImproved = prevWeek ? week.count >= prevWeek.count : true;

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                            {/* Bar Container */}
                            <div className="w-full relative flex-1 bg-gray-100 dark:bg-gray-700/30 rounded-md overflow-visible flex items-end">

                                {/* The Bar */}
                                <div
                                    className={`w-full transition-all duration-1000 ease-out rounded-md ${week.count > 0 ? 'bg-indigo-500' : 'bg-indigo-400 opacity-50'}`}
                                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-2 px-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none mb-1">
                                        <div className="font-bold mb-0.5">{week.label}</div>
                                        <div>{week.count} mastered</div>
                                    </div>
                                </div>
                            </div>

                            <span className="text-[10px] mt-3 font-medium text-gray-400 shrink-0">{week.label}</span>

                            {/* Trend Indicator */}
                            {i > 0 && week.hasPassed && (
                                <div className={`text-[9px] mt-1 font-bold ${isImproved ? 'text-green-500' : 'text-orange-500'}`}>
                                    {isImproved ? '↑' : '↓'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <span className="text-xs text-gray-400">Total for {currentMonthLabel}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{totalCount} mastered</span>
            </div>
        </div>
    );
};
