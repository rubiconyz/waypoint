
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Quote, RefreshCcw, Sparkles } from 'lucide-react';
import { Habit } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { generateAIQuote, DailyFocusStats } from '../services/geminiService';

interface FocusTipProps {
    habits: Habit[];
    viewDate: Date;
}

const QUOTE_HISTORY_KEY = 'habitvision_quote_history';

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

const FALLBACK_QUOTES = [
    { quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { quote: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { quote: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
];

const getQuoteHistory = (): string[] => {
    try {
        const saved = localStorage.getItem(QUOTE_HISTORY_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const addToQuoteHistory = (quote: string) => {
    const history = getQuoteHistory();
    if (!history.includes(quote)) {
        // Keep last 50 quotes in history
        const updated = [...history, quote].slice(-50);
        localStorage.setItem(QUOTE_HISTORY_KEY, JSON.stringify(updated));
    }
};

export const FocusTip: React.FC<FocusTipProps> = ({ habits, viewDate }) => {
    const [quote, setQuote] = useState('');
    const [author, setAuthor] = useState('');
    const [isAiQuote, setIsAiQuote] = useState(false);
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

    const refreshQuote = useCallback(async (forceRefresh: boolean) => {
        setIsRefreshing(true);

        // Immediate fallback
        const history = getQuoteHistory();
        const availableFallbacks = FALLBACK_QUOTES.filter(q => !history.includes(q.quote));
        const fallback = availableFallbacks.length > 0
            ? availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)]
            : FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
        setQuote(fallback.quote);
        setAuthor(fallback.author);
        setIsAiQuote(false);

        // Check cache (by date + stats fingerprint)
        const cacheKey = `habitvision_aiquote_${focusStats.date}_${focusStats.completedToday}_${focusStats.completionRateToday}_${focusStats.weeklyAverageRate}`;
        if (!forceRefresh) {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    setQuote(parsed.quote);
                    setAuthor(parsed.author);
                    setIsAiQuote(true);
                    setIsRefreshing(false);
                    return;
                } catch { /* fall through */ }
            }
        }

        try {
            const result = await generateAIQuote(focusStats, history);
            setQuote(result.quote);
            setAuthor(result.author);
            setIsAiQuote(true);
            addToQuoteHistory(result.quote);
            localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch {
            setIsAiQuote(false);
        } finally {
            setIsRefreshing(false);
        }
    }, [focusStats]);

    useEffect(() => {
        void refreshQuote(false);
    }, [refreshQuote]);

    return (
        <div className="bg-white dark:bg-[#0F141D] rounded-3xl p-6 border border-gray-100 dark:border-[#1F2733] shadow-sm relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-[#1A2336] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <Quote size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <button
                    onClick={() => void refreshQuote(true)}
                    disabled={isRefreshing}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#121821] rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                    <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100">Daily Quote</h3>
                    {isAiQuote && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-[#172131] px-2 py-1 rounded-full">
                            <Sparkles size={11} />
                            AI
                        </span>
                    )}
                </div>
                <blockquote className="text-[15px] text-gray-700 dark:text-slate-300 font-medium leading-relaxed italic">
                    "{quote}"
                </blockquote>
                {author && (
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-2.5">
                        — {author}
                    </p>
                )}
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
                    Today: {focusStats.completedToday}/{focusStats.dueToday} done ({focusStats.completionRateToday}%) · 7-day avg: {focusStats.weeklyAverageRate}%
                </p>
            </div>
        </div>
    );
};
