import React from 'react';
import { List, Clock } from 'lucide-react';

export type TrackerView = 'list' | 'radial';

interface TrackerViewToggleProps {
    view: TrackerView;
    onViewChange: (view: TrackerView) => void;
}

export const TrackerViewToggle: React.FC<TrackerViewToggleProps> = ({
    view,
    onViewChange,
}) => {
    return (
        <div className="inline-flex bg-gray-100 dark:bg-[#0F141D] border border-transparent dark:border-[#1F2733] rounded-xl p-1 gap-1">
            <button
                onClick={() => onViewChange('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'list'
                        ? 'bg-white dark:bg-[#172131] text-gray-900 dark:text-slate-100 shadow-sm'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                    }`}
            >
                <List size={16} />
                <span className="hidden sm:inline">List</span>
            </button>
            <button
                onClick={() => onViewChange('radial')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'radial'
                        ? 'bg-white dark:bg-[#172131] text-gray-900 dark:text-slate-100 shadow-sm'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                    }`}
            >
                <Clock size={16} />
                <span className="hidden sm:inline">Radial</span>
            </button>
        </div>
    );
};

export default TrackerViewToggle;
