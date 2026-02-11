import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';

interface DashboardHeaderProps {
    viewDate: Date;
    onViewDateChange: (date: Date) => void;
    userName?: string;
    isTransparent?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    viewDate,
    onViewDateChange,
    userName = 'there',
    isTransparent,
}) => {
    const today = new Date();
    const viewDateString = getLocalDateString(viewDate);
    const todayString = getLocalDateString(today);
    const isToday = viewDateString === todayString;

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = today.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Format date for display
    const formatDate = () => {
        return viewDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
    };

    const handlePrevDay = () => {
        const newDate = new Date(viewDate);
        newDate.setDate(viewDate.getDate() - 1);
        onViewDateChange(newDate);
    };

    const handleNextDay = () => {
        if (isToday) return;
        const newDate = new Date(viewDate);
        newDate.setDate(viewDate.getDate() + 1);
        onViewDateChange(newDate);
    };

    const handleToday = () => {
        onViewDateChange(new Date());
    };

    const cardBase = isTransparent
        ? 'bg-white/60 dark:bg-black/60 backdrop-blur-xl'
        : '';

    return (
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${cardBase}`}>
            <div>
                <h1 className="text-3xl font-bold text-[#111318] dark:text-white mb-2 font-display">
                    {getGreeting()}, {userName}
                </h1>
                <p className="text-[#616f89] dark:text-slate-400 text-sm font-medium">
                    Here's your habit progress for {formatDate()}.
                </p>
            </div>

            <div className="flex gap-2">
                {/* Date navigation */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePrevDay}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[#616f89] transition-colors"
                        aria-label="Previous day"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <button
                        onClick={handleNextDay}
                        disabled={isToday}
                        className={`p-2 rounded-lg transition-colors ${isToday
                                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[#616f89]'
                            }`}
                        aria-label="Next day"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* View toggle */}
                <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-700 rounded-lg p-1 flex">
                    <button
                        onClick={handleToday}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${isToday
                                ? 'bg-slate-100 dark:bg-slate-700 text-[#111318] dark:text-white shadow-sm'
                                : 'text-[#616f89] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        Today
                    </button>
                    <button
                        className="px-3 py-1.5 rounded text-[#616f89] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                    >
                        Week
                    </button>
                    <button
                        className="px-3 py-1.5 rounded text-[#616f89] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                    >
                        Month
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;
