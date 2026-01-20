import React, { useMemo } from 'react';
import { SavedWord } from '../../types';
import { Video, Globe, Book } from 'lucide-react';

interface TopSourcesProps {
    words: SavedWord[];
}

export const TopSources: React.FC<TopSourcesProps> = ({ words }) => {
    const sources = useMemo(() => {
        const counts: Record<string, { count: number; type: string }> = {};

        words.forEach(w => {
            // Prioritize Channel Name, fallback to Video Title
            const title = w.channelTitle || w.sourceTitle || 'Manual Entry';

            // Simple type inference
            const type = title.includes('Manual') ? 'manual' : (w.videoId ? 'video' : 'web');

            if (!counts[title]) counts[title] = { count: 0, type };
            counts[title].count++;
        });

        // Convert to array and sort
        return Object.entries(counts)
            .map(([title, { count, type }]) => ({ title, count, type }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Limit to top 5
    }, [words]);

    const maxCount = sources[0]?.count || 1;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Book className="text-emerald-500" size={20} />
                Top Learning Sources
            </h3>

            {sources.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center text-gray-400">
                    <Book size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">Save words to see your top sources.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sources.map((source, idx) => (
                        <div key={idx} className="group">
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <div className="flex items-center gap-2 truncate max-w-[80%]">
                                    <span className="text-gray-400">
                                        {source.type === 'video' ? <Video size={14} /> : source.type === 'web' ? <Globe size={14} /> : <Book size={14} />}
                                    </span>
                                    <span className="font-medium text-gray-700 dark:text-gray-200 truncate" title={source.title}>
                                        {source.title}
                                    </span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-gray-100">{source.count}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out group-hover:bg-emerald-400"
                                    style={{ width: `${(source.count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
