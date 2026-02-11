import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Dumbbell } from 'lucide-react';
import { WorkoutLog } from '../types';
import { MUSCLE_GROUPS } from '../muscleRecoveryData';

interface RecoveryCalendarProps {
    workoutLogs: WorkoutLog[];
}

export const RecoveryCalendar: React.FC<RecoveryCalendarProps> = ({ workoutLogs }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = new Date();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Helper to get logs for a specific day
    const getLogsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return workoutLogs.filter(log => log.date === dateStr);
    };

    // Helper to get abbreviated muscle names
    const getMuscleNames = (muscleIds: string[]) => {
        return muscleIds.map(id => {
            const m = MUSCLE_GROUPS.find(mg => mg.id === id);
            return m ? m.name : id;
        }).join(', ');
    };

    // Calculate stats for current month
    const workoutsThisMonth = workoutLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getMonth() === month && logDate.getFullYear() === year;
    }).length;

    const renderCalendarDays = () => {
        const days = [];
        // Empty slots for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div
                    key={`empty-${i}`}
                    className="h-20 lg:h-24 bg-gradient-to-br from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-100/50 dark:border-gray-800/30"
                />
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const logs = getLogsForDay(day);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasWorkout = logs.length > 0;

            days.push(
                <div
                    key={day}
                    className={`h-20 lg:h-24 p-1.5 lg:p-2 rounded-xl relative group transition-all duration-300 text-left flex flex-col overflow-hidden ${isToday
                        ? 'bg-gradient-to-br from-red-100/80 to-orange-100/80 dark:from-red-900/30 dark:to-orange-900/30 border-2 border-red-300 dark:border-red-600 shadow-lg shadow-red-500/10'
                        : hasWorkout
                            ? 'bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/60 dark:border-emerald-700/40 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600'
                            : 'bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'
                        }`}
                >
                    <div className="flex justify-between w-full">
                        <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-lg transition-all ${isToday
                            ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-sm'
                            : hasWorkout
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}>
                            {day}
                        </span>
                        {hasWorkout && (
                            <div className="flex gap-0.5 items-center">
                                {logs.map(log => (
                                    <div
                                        key={log.id}
                                        className={`w-2 h-2 rounded-full shadow-sm ${log.intensity === 'heavy'
                                            ? 'bg-gradient-to-br from-red-400 to-rose-500'
                                            : log.intensity === 'moderate'
                                                ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                                                : 'bg-gradient-to-br from-emerald-400 to-green-500'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Workout Content */}
                    <div className="mt-1 w-full flex-1 overflow-hidden">
                        {logs.map((log) => (
                            <div key={log.id} className="mb-1 last:mb-0">
                                <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate ${log.intensity === 'heavy'
                                    ? 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-700 dark:text-red-300'
                                    : log.intensity === 'moderate'
                                        ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-300'
                                        : 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 text-emerald-700 dark:text-emerald-300'
                                    }`}>
                                    {getMuscleNames(log.muscleGroups)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hover Tooltip */}
                    {hasWorkout && (
                        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-52 p-3 bg-gray-900/95 dark:bg-gray-800/95 text-white text-xs rounded-xl shadow-2xl pointer-events-none backdrop-blur-md border border-gray-700/50">
                            <div className="font-bold text-sm mb-2 pb-2 border-b border-gray-700/50 text-white flex items-center gap-2">
                                <CalendarIcon size={12} className="text-red-400" />
                                {new Date(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </div>
                            {logs.map(log => (
                                <div key={log.id} className="mb-2 last:mb-0">
                                    <div className={`font-semibold capitalize mb-0.5 ${log.intensity === 'heavy'
                                        ? 'text-red-400'
                                        : log.intensity === 'moderate'
                                            ? 'text-amber-400'
                                            : 'text-emerald-400'
                                        }`}>
                                        {log.intensity} Workout
                                    </div>
                                    <div className="text-gray-300 leading-relaxed">{getMuscleNames(log.muscleGroups)}</div>
                                </div>
                            ))}
                            {/* Tooltip Arrow */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900/95 dark:bg-gray-800/95 rotate-45 border-r border-b border-gray-700/50" />
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xl shadow-gray-200/30 dark:shadow-gray-900/30">
            {/* Background Decoration */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-full blur-3xl" />

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 flex items-center justify-center shadow-lg shadow-red-500/10">
                            <CalendarIcon size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                                Activity Calendar
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Dumbbell size={10} />
                                {workoutsThisMonth} workout{workoutsThisMonth !== 1 ? 's' : ''} this month
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all active:scale-95"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white min-w-[120px] text-center px-3 py-1.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
                            {monthNames[month]} {year}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all active:scale-95"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div
                            key={day}
                            className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {renderCalendarDays()}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                    {[
                        { color: 'from-emerald-400 to-green-500', label: 'Light', bg: 'bg-emerald-500/10' },
                        { color: 'from-amber-400 to-yellow-500', label: 'Moderate', bg: 'bg-amber-500/10' },
                        { color: 'from-red-400 to-rose-500', label: 'Heavy', bg: 'bg-red-500/10' },
                    ].map(item => (
                        <div
                            key={item.label}
                            className={`flex items-center gap-2 px-3 py-1.5 ${item.bg} rounded-lg`}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${item.color} shadow-sm`} />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
