import React from 'react';

interface SparklineChartProps {
    data: ('completed' | 'partial' | 'skipped' | null)[];
    showToday?: boolean;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const SparklineChart: React.FC<SparklineChartProps> = ({ data, showToday = true }) => {
    // data should be an array of 7 values representing the last 7 days
    const normalizedData = [...data].slice(-7);

    // Pad to 7 if needed
    while (normalizedData.length < 7) {
        normalizedData.unshift(null);
    }

    // Get day labels based on current day
    const today = new Date().getDay();
    // Shift labels so today is last
    const shiftedLabels: string[] = [];
    for (let i = 6; i >= 0; i--) {
        const dayIdx = (today - i + 7) % 7;
        // Convert Sunday (0) to index 6, Monday (1) to 0, etc.
        const labelIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        shiftedLabels.push(DAY_LABELS[labelIdx]);
    }

    return (
        <div className="flex items-center justify-between gap-1">
            {normalizedData.map((status, idx) => {
                const isLast = idx === normalizedData.length - 1;
                const isCompleted = status === 'completed';
                const isPartial = status === 'partial';
                const isSkipped = status === 'skipped';

                return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                        {/* Dot */}
                        <div
                            className={`size-3 rounded-full transition-all ${isCompleted
                                    ? 'bg-[#135bec] ring-2 ring-[#135bec]/20'
                                    : isPartial
                                        ? 'bg-[#135bec]/50 ring-2 ring-[#135bec]/10'
                                        : isSkipped
                                            ? 'bg-slate-400 dark:bg-slate-600'
                                            : isLast && showToday
                                                ? 'bg-slate-200 dark:bg-slate-700 ring-2 ring-slate-300 dark:ring-slate-600' // Today pending
                                                : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                        />
                        {/* Day label */}
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                            {shiftedLabels[idx]}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default SparklineChart;
