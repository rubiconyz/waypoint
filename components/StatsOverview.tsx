import React from 'react';
import { Check, Flame, TrendingUp, Trophy } from 'lucide-react';
import { Habit } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface StatsOverviewProps {
    habits: Habit[];
    viewDate: Date;
    isTransparent?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ habits, viewDate, isTransparent }) => {
    const viewDateString = getLocalDateString(viewDate);

    // Calculate stats
    const dueHabits = habits.filter(h => {
        const dayOfWeek = viewDate.getDay();
        if (h.frequency.type === 'daily') return true;
        if (h.frequency.type === 'custom' && h.frequency.days?.includes(dayOfWeek)) return true;
        if (h.frequency.type === 'weekly') return true; // Weekly habits are always "available"
        return false;
    });

    const completedCount = dueHabits.filter(h => h.history[viewDateString] === 'completed').length;
    const totalDue = dueHabits.length;

    // Calculate efficiency (completion rate over last 7 days)
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(viewDate);
        d.setDate(d.getDate() - i);
        last7Days.push(getLocalDateString(d));
    }

    let totalPossible = 0;
    let totalCompleted = 0;
    habits.forEach(habit => {
        last7Days.forEach(dateStr => {
            // Check if habit was due on this day
            const d = new Date(dateStr + 'T12:00:00');
            const dow = d.getDay();
            let isDue = false;
            if (habit.frequency.type === 'daily') isDue = true;
            else if (habit.frequency.type === 'custom' && habit.frequency.days?.includes(dow)) isDue = true;
            else if (habit.frequency.type === 'weekly') isDue = true;

            if (isDue) {
                totalPossible++;
                if (habit.history[dateStr] === 'completed') totalCompleted++;
            }
        });
    });

    const efficiency = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    // Calculate current streak (consecutive days with all habits completed)
    let currentStreak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(checkDate);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);

        const dueOnDay = habits.filter(h => {
            const dow = d.getDay();
            if (h.frequency.type === 'daily') return true;
            if (h.frequency.type === 'custom' && h.frequency.days?.includes(dow)) return true;
            return false;
        });

        if (dueOnDay.length === 0) continue;

        const allCompleted = dueOnDay.every(h => h.history[dateStr] === 'completed');
        if (allCompleted) {
            currentStreak++;
        } else {
            break;
        }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    const allDates = new Set<string>();
    habits.forEach(h => Object.keys(h.history).forEach(d => allDates.add(d)));
    const sortedDates = Array.from(allDates).sort();

    sortedDates.forEach(dateStr => {
        const d = new Date(dateStr + 'T12:00:00');
        const dueOnDay = habits.filter(h => {
            const dow = d.getDay();
            if (h.frequency.type === 'daily') return true;
            if (h.frequency.type === 'custom' && h.frequency.days?.includes(dow)) return true;
            return false;
        });

        if (dueOnDay.length === 0) return;

        const allCompleted = dueOnDay.every(h => h.history[dateStr] === 'completed');
        if (allCompleted) {
            tempStreak++;
            if (tempStreak > bestStreak) bestStreak = tempStreak;
        } else {
            tempStreak = 0;
        }
    });

    const cardBase = isTransparent
        ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
        : 'bg-white dark:bg-black border-slate-200 dark:border-slate-800';

    const stats = [
        {
            icon: Check,
            iconColor: 'text-[#135bec]',
            label: 'Completed',
            value: completedCount,
            suffix: `/ ${totalDue}`,
        },
        {
            icon: Flame,
            iconColor: 'text-orange-500',
            label: 'Current Streak',
            value: currentStreak,
            suffix: 'Days',
        },
        {
            icon: TrendingUp,
            iconColor: 'text-green-500',
            label: 'Efficiency',
            value: efficiency,
            suffix: '%',
        },
        {
            icon: Trophy,
            iconColor: 'text-purple-500',
            label: 'Best Streak',
            value: bestStreak,
            suffix: 'Days',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className={`p-4 rounded-lg border shadow-sm ${cardBase}`}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <stat.icon size={20} className={stat.iconColor} />
                        <span className="text-xs font-bold text-[#616f89] dark:text-slate-400 uppercase tracking-wider">
                            {stat.label}
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-[#111318] dark:text-white font-display">
                        {stat.value}
                        {stat.suffix && (
                            <span className="text-base font-normal text-[#616f89] dark:text-slate-400 ml-1">
                                {stat.suffix}
                            </span>
                        )}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default StatsOverview;
