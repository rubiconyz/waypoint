import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
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

    const renderCalendarDays = () => {
        const days = [];
        // Empty slots for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-20 lg:h-24 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800/50 rounded-lg"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const logs = getLogsForDay(day);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasWorkout = logs.length > 0;

            days.push(
                <div
                    key={day}
                    className={`h-20 lg:h-24 p-1.5 border rounded-xl relative group transition-all text-left flex flex-col items-start ${isToday
                            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                >
                    <div className="flex justify-between w-full">
                        <span className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {day}
                        </span>
                        {hasWorkout && (
                            <div className="flex gap-0.5">
                                {logs.map(log => (
                                    <div
                                        key={log.id}
                                        className={`w-1.5 h-1.5 rounded-full ${log.intensity === 'heavy' ? 'bg-red-500' :
                                                log.intensity === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Workout Content */}
                    <div className="mt-1 w-full flex-1 overflow-hidden">
                        {logs.map((log, idx) => (
                            <div key={log.id} className="mb-1">
                                <div className={`text-[10px] px-1 py-0.5 rounded truncate ${log.intensity === 'heavy' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                        log.intensity === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    }`}>
                                    {getMuscleNames(log.muscleGroups)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hover Tooltip for details if overflow */}
                    {hasWorkout && (
                        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900/95 dark:bg-gray-800 text-white text-xs rounded-lg shadow-xl pointer-events-none backdrop-blur-sm border border-gray-700/50">
                            <div className="font-semibold mb-1 border-b border-gray-700 pb-1">
                                {year}-{String(month + 1).padStart(2, '0')}-{String(day).padStart(2, '0')}
                            </div>
                            {logs.map(log => (
                                <div key={log.id} className="mb-1.5 last:mb-0">
                                    <div className="font-medium capitalize text-gray-300">{log.intensity} Workout</div>
                                    <div className="text-gray-400 truncate">{getMuscleNames(log.muscleGroups)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    <CalendarIcon size={18} className="text-gray-400" />
                    Activity Calendar
                </h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px] text-center">
                        {monthNames[month]} {year}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Light
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" /> Moderate
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> Heavy
                </div>
            </div>
        </div>
    );
};
