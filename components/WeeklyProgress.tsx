
import React from 'react';
import { Habit } from '../types';
import { getLocalDateString, parseLocalDate } from '../utils/dateUtils';
import { BarChart2 } from 'lucide-react';

interface WeeklyProgressProps {
    habits: Habit[];
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ habits }) => {
    // Calculate last 7 days including today
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    const data = days.map((date, i) => {
        const dateStr = getLocalDateString(date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        // Count completed habits for this date
        // Note: We should only count habits that were active/created on this date? 
        // For simplicity, we count any completed habit.
        // If we want completion RATE, we need to know how many were due.
        // The mockup usually shows simple bars. Let's show Completion Count.

        let completed = 0;
        habits.forEach(h => {
            if (h.history[dateStr] === 'completed') {
                completed++;
            }
        });

        return { day: dayName[0], fullDay: dayName, count: completed, date: dateStr, isToday: i === 6 };
    });

    const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid div by zero

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Progress</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Last 7 days completion</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                    <BarChart2 size={20} />
                </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-32 pt-4">
                {data.map((item, idx) => {
                    const heightPercent = (item.count / maxCount) * 100;
                    return (
                        <div key={item.date} className="flex flex-col items-center gap-2 flex-1 group/bar cursor-default">
                            <div className="relative w-full flex justify-center h-full items-end">
                                <div
                                    className={`w-full max-w-[12px] rounded-full transition-all duration-500 ease-out ${item.isToday
                                        ? 'bg-blue-500 shadow-lg shadow-blue-500/30'
                                        : item.count > 0
                                            ? 'bg-blue-400 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-500 opacity-90'
                                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-blue-300 dark:hover:bg-blue-700'
                                        }`}
                                    style={{ height: `${Math.max(heightPercent, 4)}%` }} // Min height 4% for visibility
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10">
                                        <div className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap font-bold">
                                            {item.count} habits
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold ${item.isToday ? 'text-blue-500' : 'text-gray-400'}`}>
                                {item.day}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};
