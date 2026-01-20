import React, { useMemo } from 'react';
import { SavedWord, RecentVideo, DailyUsageLog } from '../../types';
import { BookOpen, CheckCircle2, Flame, Languages, Calendar, BarChart2, TrendingUp, Clock, History } from 'lucide-react';
import { TopSources } from './TopSources';
import { GrowthChart } from './GrowthChart';

interface AnalyticsTabProps {
    words: SavedWord[];
    recentVideos: RecentVideo[];
    onPlayVideo?: (videoId: string) => void;
    immersionLogs: DailyUsageLog;
}

// Sub-component: Insight Card (Shared style)
const InsightCard = ({ icon: Icon, title, value, description, color = 'blue' }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150`} />

        <div className="flex items-start justify-between mb-4 relative z-10">
            <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
                <Icon size={24} />
            </div>
        </div>

        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 relative z-10">{title}</h4>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 relative z-10">{value}</div>
        <p className="text-xs text-gray-400 relative z-10 leading-relaxed">{description}</p>
    </div>
);

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ words, recentVideos, onPlayVideo, immersionLogs }) => {

    // 1. Mastery Stats
    const stats = useMemo(() => {
        const total = words.length;
        const known = words.filter(w => w.status === 'known').length;
        const learning = total - known;
        const masteryRate = total > 0 ? Math.round((known / total) * 100) : 0;

        // Calculate Total Time
        const totalSeconds = Object.values(immersionLogs).reduce((acc, cur) => acc + cur, 0);
        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);

        let timeString = "";
        if (totalHours > 0) timeString += `${totalHours}h `;
        timeString += `${totalMinutes}m`;
        if (totalHours === 0 && totalMinutes === 0 && totalSeconds > 0) timeString = calculateTime(totalSeconds); // fallback to "< 1m" or similar if needed, or just "0m"

        return { total, known, learning, masteryRate, timeString, totalSeconds };
    }, [words, immersionLogs]);

    // Helper for low values
    function calculateTime(sec: number) {
        if (sec < 60) return "1m"; // Round up to 1m for UI niceness
        return Math.floor(sec / 60) + "m";
    }

    const knownWords = useMemo(() => words.filter(w => w.status === 'known'), [words]);

    // 2. Heatmap Data (Full Year)
    const heatmapData = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const start = new Date(currentYear, 0, 1);
        const end = new Date(currentYear, 11, 31);
        const dates: string[] = [];
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
            const year = dt.getFullYear();
            const month = String(dt.getMonth() + 1).padStart(2, '0');
            const day = String(dt.getDate()).padStart(2, '0');
            dates.push(`${year}-${month}-${day}`);
        }

        return dates.map(dateStr => {
            const logSeconds = immersionLogs[dateStr] || 0;
            const logMinutes = Math.ceil(logSeconds / 60);

            let intensity = 0;
            if (logMinutes > 0) intensity = 1;
            if (logMinutes > 15) intensity = 2;
            if (logMinutes > 30) intensity = 3;
            if (logMinutes > 60) intensity = 4;

            return { date: dateStr, count: logMinutes, intensity };
        });
    }, [immersionLogs]);

    // Add padding for start of year (Sun-Sat alignment)
    const startPadding = new Array(new Date(new Date().getFullYear(), 0, 1).getDay()).fill(null);
    const finalHeatmapData = [...startPadding, ...heatmapData];

    // 3. Vocab Growth (Simple mock trend for now, or actual accumulation)
    // To make a real line chart we'd need to sort all words by date and cumulative sum
    const growthTrend = useMemo(() => {
        // Group by week or month? Let's do cumulative last 4 weeks
        return [];
    }, [words]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Immersion Analytics</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">Overview</span>
            </div>

            {/* Top Cards: Words & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InsightCard
                    icon={BookOpen}
                    title="Words Mastered"
                    value={stats.known}
                    description={`${stats.total} total saved, ${stats.learning} learning`}
                    color="emerald"
                />
                <InsightCard
                    icon={Clock}
                    title="Time Studied"
                    value={stats.timeString}
                    description="Total time across videos, study, and web."
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                {/* Heatmap & Consistency - Full Width now */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Flame className="text-orange-500" size={20} />
                            <h3 className="font-bold text-gray-900 dark:text-white">Watch Time Consistency</h3>
                        </div>
                        <div className="text-xs text-gray-400">{new Date().getFullYear()}</div>
                    </div>

                    <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                        <div className="min-w-max">
                            <div className="flex flex-col gap-1">
                                <div className="flex text-xs text-gray-400 mb-2 pl-8">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                        <div key={m} className="flex-1 w-12 text-center">{m}</div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <div className="grid grid-rows-7 gap-1.5 text-[10px] text-gray-400 pr-2 pt-0.5">
                                        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                                    </div>

                                    <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                                        {finalHeatmapData.map((day, idx) => {
                                            if (!day) return <div key={`empty-${idx}`} />;
                                            let colorClass = 'bg-gray-100 dark:bg-gray-700/50';
                                            if (day.intensity === 1) colorClass = 'bg-emerald-200 dark:bg-emerald-900/60';
                                            if (day.intensity === 2) colorClass = 'bg-emerald-300 dark:bg-emerald-700';
                                            if (day.intensity === 3) colorClass = 'bg-emerald-400 dark:bg-emerald-600';
                                            if (day.intensity === 4) colorClass = 'bg-emerald-500 shadow-sm shadow-emerald-500/20';

                                            return (
                                                <div
                                                    key={day.date}
                                                    className={`w-3 h-3 rounded-[2px] ${colorClass} hover:scale-125 transition-transform cursor-pointer relative group hover:z-20`}
                                                >
                                                    {/* Tooltip on Hover */}
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded z-50 pointer-events-none">
                                                        {day.count} mins on {day.date}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 justify-end">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700/50 rounded-[2px]" />
                            <div className="w-3 h-3 bg-emerald-200 dark:bg-emerald-900/60 rounded-[2px]" />
                            <div className="w-3 h-3 bg-emerald-300 dark:bg-emerald-700 rounded-[2px]" />
                            <div className="w-3 h-3 bg-emerald-400 dark:bg-emerald-600 rounded-[2px]" />
                            <div className="w-3 h-3 bg-emerald-500 rounded-[2px]" />
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Growth & Sources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GrowthChart words={knownWords} />
                <TopSources words={words} />
            </div>

            {/* Recent Engagement List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-6">
                    <History className="text-purple-500" size={20} />
                    <h3 className="font-bold text-gray-900 dark:text-white">Recent Immersion</h3>
                </div>

                {recentVideos.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
                        No videos watched recently. Go to Immersion tab to start!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {recentVideos.slice(0, 5).map(video => (
                            <div key={video.id} className="py-3 flex items-center gap-4 group">
                                <div className="w-16 h-9 rounded bg-gray-200 overflow-hidden relative flex-shrink-0">
                                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-500 transition-colors">
                                        {video.title}
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        Watched {new Date(video.lastWatched).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-xs font-mono text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                                    {video.segments?.length || 0} segments
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
