
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Lightbulb, RefreshCcw, Sparkles } from 'lucide-react';
import { Habit } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { generateDailyFocusTip, DailyFocusStats } from '../services/geminiService';

interface FocusTipProps {
    habits: Habit[];
    viewDate: Date;
}

const isHabitDue = (habit: Habit, date: Date): boolean => {
    if (habit.createdAt) {
        const createdAt = new Date(habit.createdAt);
        createdAt.setHours(0, 0, 0, 0);
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);
        if (checkDate < createdAt) return false;
    }

    if (habit.frequency.type === 'daily') return true;
    if (habit.frequency.type === 'custom') return habit.frequency.days.includes(date.getDay());
    return true;
};

const getDayStats = (habits: Habit[], date: Date) => {
    const dateStr = getLocalDateString(date);
    const dueHabits = habits.filter(h => isHabitDue(h, date));
    const completed = dueHabits.filter(h => h.history[dateStr] === 'completed' || h.history[dateStr] === 'skipped').length;
    const completedTitles = dueHabits.filter(h => h.history[dateStr] === 'completed' || h.history[dateStr] === 'skipped').map(h => h.title);
    const completionRate = dueHabits.length > 0 ? Math.round((completed / dueHabits.length) * 100) : 0;
    return { dueHabits, completed, completedTitles, completionRate };
};

const buildFallbackAdvice = (stats: DailyFocusStats): string => {
    if (stats.dueToday === 0) {
        return "No tasks are due today. Create one small anchor habit so tomorrow starts with momentum.";
    }

    const remaining = Math.max(stats.dueToday - stats.completedToday, 0);
    const weakest = stats.topMissedHabits[0];

    if (stats.completionRateToday < 40) {
        return weakest
            ? `You are at ${stats.completionRateToday}% today. Finish ${remaining} tasks, starting with ${weakest}, before adding anything new.`
            : `You are at ${stats.completionRateToday}% today. Finish ${remaining} tasks with one 20-minute focused block right now.`;
    }

    if (stats.completionRateToday < 80) {
        return weakest
            ? `You are at ${stats.completionRateToday}% today (avg ${stats.weeklyAverageRate}%). Close ${remaining} tasks and protect time for ${weakest}.`
            : `You are at ${stats.completionRateToday}% today (avg ${stats.weeklyAverageRate}%). Complete ${remaining} tasks before evening.`;
    }

    const strongest = stats.bestHabits[0];
    return strongest
        ? `Strong day at ${stats.completionRateToday}%. Lock in ${remaining} remaining tasks and chain them after ${strongest} to preserve momentum.`
        : `Strong day at ${stats.completionRateToday}%. Finish the remaining ${remaining} tasks and end with a quick review for tomorrow.`;
};

export const FocusTip: React.FC<FocusTipProps> = ({ habits, viewDate }) => {
    const [tip, setTip] = useState('Loading tailored advice...');
    const [isAiTip, setIsAiTip] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const focusStats = useMemo<DailyFocusStats>(() => {
        const todayStats = getDayStats(habits, viewDate);

        const last7 = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(viewDate);
            d.setDate(d.getDate() - i);
            return getDayStats(habits, d).completionRate;
        });

        const habitMissCounts: Record<string, number> = {};
        const habitCompleteCounts: Record<string, number> = {};

        for (let i = 0; i < 7; i++) {
            const d = new Date(viewDate);
            d.setDate(d.getDate() - i);
            const dateStr = getLocalDateString(d);

            habits.forEach(habit => {
                if (!isHabitDue(habit, d)) return;
                const status = habit.history[dateStr];
                if (status === 'completed' || status === 'skipped') {
                    habitCompleteCounts[habit.title] = (habitCompleteCounts[habit.title] || 0) + 1;
                } else if (!status || status === 'partial') {
                    habitMissCounts[habit.title] = (habitMissCounts[habit.title] || 0) + 1;
                }
            });
        }

        // Exclude habits that are completed TODAY from the missed list
        const completedTodayTitles = new Set(todayStats.completedTitles);
        const topMissedHabits = Object.entries(habitMissCounts)
            .filter(([title]) => !completedTodayTitles.has(title))
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([title]) => title);

        const bestHabits = Object.entries(habitCompleteCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([title]) => title);

        const weeklyAverageRate = last7.length ? Math.round(last7.reduce((sum, v) => sum + v, 0) / last7.length) : 0;

        return {
            date: getLocalDateString(viewDate),
            dueToday: todayStats.dueHabits.length,
            completedToday: todayStats.completed,
            completionRateToday: todayStats.completionRate,
            weeklyAverageRate,
            weeklyBestRate: last7.length ? Math.max(...last7) : 0,
            weeklyWorstRate: last7.length ? Math.min(...last7) : 0,
            topMissedHabits,
            bestHabits
        };
    }, [habits, viewDate]);

    const refreshTip = useCallback(async (forceRefresh: boolean) => {
        setIsRefreshing(true);

        // Immediate deterministic local fallback
        setTip(buildFallbackAdvice(focusStats));
        setIsAiTip(false);

        const cacheKey = `habitvision_focus_ai_${focusStats.date}_${focusStats.dueToday}_${focusStats.completedToday}_${focusStats.completionRateToday}_${focusStats.weeklyAverageRate}`;
        if (!forceRefresh) {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setTip(cached);
                setIsAiTip(true);
                setIsRefreshing(false);
                return;
            }
        }

        try {
            const aiTip = await generateDailyFocusTip(focusStats);
            setTip(aiTip);
            setIsAiTip(true);
            localStorage.setItem(cacheKey, aiTip);
        } catch {
            setIsAiTip(false);
        } finally {
            setIsRefreshing(false);
        }
    }, [focusStats]);

    useEffect(() => {
        void refreshTip(false);
    }, [refreshTip]);

    return (
        <div className="bg-white dark:bg-[#0F141D] rounded-3xl p-6 border border-gray-100 dark:border-[#1F2733] shadow-sm relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-[#1A2336] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                    <Lightbulb size={20} className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <button
                    onClick={() => void refreshTip(true)}
                    disabled={isRefreshing}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#121821] rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                    <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100">Daily Focus</h3>
                    {isAiTip && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-[#172131] px-2 py-1 rounded-full">
                            <Sparkles size={11} />
                            AI
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium leading-relaxed">
                    {tip}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">
                    Today: {focusStats.completedToday}/{focusStats.dueToday} done ({focusStats.completionRateToday}%). 7-day avg: {focusStats.weeklyAverageRate}%.
                    {focusStats.topMissedHabits[0] ? ` Watch: ${focusStats.topMissedHabits[0]}.` : ''}
                </p>
            </div>
        </div>
    );
};
