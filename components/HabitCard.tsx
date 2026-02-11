import React from 'react';
import { Check, MoreVertical, Dumbbell, BookOpen, Brain, Heart, Book, Briefcase, Star } from 'lucide-react';
import { Habit } from '../types';
import { SparklineChart } from './SparklineChart';
import { getLocalDateString } from '../utils/dateUtils';

interface HabitCardProps {
    habit: Habit;
    viewDate: Date;
    onUpdateStatus: (id: string, date: string, status: 'completed' | 'partial' | 'skipped' | null) => void;
    onEdit: (habit: Habit) => void;
    onDelete: (id: string) => void;
    isTransparent?: boolean;
}

// Category icon and color mapping
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
    'Fitness': {
        icon: <Dumbbell size={20} />,
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        textColor: 'text-orange-600',
    },
    'Learning': {
        icon: <BookOpen size={20} />,
        bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        textColor: 'text-purple-600',
    },
    'Mindfulness': {
        icon: <Brain size={20} />,
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        textColor: 'text-indigo-600',
    },
    'Health': {
        icon: <Heart size={20} />,
        bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        textColor: 'text-cyan-600',
    },
    'Reading': {
        icon: <Book size={20} />,
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        textColor: 'text-emerald-600',
    },
    'Work': {
        icon: <Briefcase size={20} />,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-600',
    },
    'Other': {
        icon: <Star size={20} />,
        bgColor: 'bg-slate-50 dark:bg-slate-800/50',
        textColor: 'text-slate-600',
    },
};

export const HabitCard: React.FC<HabitCardProps> = ({
    habit,
    viewDate,
    onUpdateStatus,
    onEdit,
    onDelete,
    isTransparent,
}) => {
    const viewDateString = getLocalDateString(viewDate);
    const status = habit.history[viewDateString];
    const isCompleted = status === 'completed';

    // Get last 7 days of data for sparkline
    const last7Days: ('completed' | 'partial' | 'skipped' | null)[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(viewDate);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);
        last7Days.push(habit.history[dateStr] || null);
    }

    // Calculate completion rate
    const completedDays = Object.values(habit.history).filter(s => s === 'completed').length;
    const totalDays = Object.keys(habit.history).length || 1;
    const completionRate = Math.round((completedDays / totalDays) * 100);

    const categoryConfig = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG['Other'];

    const cardBase = isTransparent
        ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl border-white/20 dark:border-white/10'
        : 'bg-white dark:bg-black border-slate-200 dark:border-slate-800';

    return (
        <div
            className={`rounded-lg border shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between h-full group ${cardBase}`}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                    <div className={`size-10 rounded flex items-center justify-center ${categoryConfig.bgColor} ${categoryConfig.textColor}`}>
                        {categoryConfig.icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-[#111318] dark:text-white text-lg leading-tight group-hover:text-[#135bec] transition-colors">
                            {habit.title}
                        </h4>
                        <span className="text-xs font-medium text-[#616f89] dark:text-slate-400">
                            {habit.category}
                        </span>
                    </div>
                </div>

                {/* Status button */}
                {isCompleted ? (
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-1 rounded-full">
                        <Check size={20} />
                    </div>
                ) : (
                    <button
                        onClick={() => onUpdateStatus(habit.id, viewDateString, 'completed')}
                        className="size-8 rounded-full border-2 border-slate-200 dark:border-slate-600 hover:border-[#135bec] hover:bg-[#135bec]/5 transition-all"
                        aria-label="Mark as completed"
                    />
                )}
            </div>

            {/* Sparkline */}
            <div className="mb-4">
                <SparklineChart data={last7Days} showToday={true} />
            </div>

            {/* Footer stats */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-[#616f89] dark:text-slate-500 tracking-wider">
                        Streak
                    </span>
                    <span className="text-sm font-bold text-[#111318] dark:text-white">
                        {habit.streak} Days
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-[#616f89] dark:text-slate-500 tracking-wider">
                        Rate
                    </span>
                    <span className={`text-sm font-bold ${completionRate >= 80 ? 'text-green-600 dark:text-green-400' :
                            completionRate >= 50 ? 'text-yellow-600 dark:text-yellow-500' :
                                'text-red-500'
                        }`}>
                        {completionRate}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default HabitCard;
