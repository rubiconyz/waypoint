import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Trash2, Play, CheckCircle2, Circle, Archive, Clock, Calendar, Download } from 'lucide-react';
import { SavedWord } from '../../types';
import { FlashcardSession } from './FlashcardSession';

interface VocabTabProps {
    words: SavedWord[];
    onDeleteWord: (id: string) => void;
    onUpdateWordStatus: (id: string, status: 'learning' | 'known') => void;
    onToggleWordStatus: (id: string) => void;
    onPlayVideo?: (videoId: string, timestamp: number) => void;
    onUpdateMastery?: (id: string, newMastery: number) => void;
    onLogTime?: (seconds: number) => void;
}

export const VocabTab: React.FC<VocabTabProps> = ({ words, onDeleteWord, onUpdateWordStatus, onToggleWordStatus, onPlayVideo, onUpdateMastery, onLogTime }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState<'learning' | 'known'>('learning');
    const [isStudying, setIsStudying] = useState(false);

    // Group words by date
    const groupedWords = useMemo(() => {
        const filtered = words.filter(w => {
            const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.translation.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch && w.status === activeStatus;
        });

        const groups: Record<string, SavedWord[]> = {};
        filtered.forEach(w => {
            const date = new Date(w.addedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(w);
        });

        // Sort dates descending
        return Object.entries(groups).sort((a, b) =>
            new Date(b[0]).getTime() - new Date(a[0]).getTime()
        );
    }, [words, searchTerm, activeStatus]);


    const highlightWord = (text: string, word: string) => {
        if (!text || !word) return text;
        const parts = text.split(new RegExp(`(${word})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === word.toLowerCase() ? (
                        <span key={i} className="text-emerald-500 font-bold">{part}</span>
                    ) : part
                )}
            </span>
        );
    };

    return (
        <div className="w-full h-full space-y-6 pt-0 pb-12 animate-fade-in relative z-20">
            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700/30">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                        <BookOpen size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wide">Total Words</span>
                    </div>
                    <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{words.length}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/30">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                        <Clock size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wide">Learning</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                        {words.filter(w => w.status === 'learning').length}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700/30">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                        <CheckCircle2 size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wide">Known</span>
                    </div>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                        {words.filter(w => w.status === 'known').length}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700/30">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                        <Calendar size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wide">Today</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                        {words.filter(w => {
                            const today = new Date().toDateString();
                            const wordDate = new Date(w.addedAt).toDateString();
                            return today === wordDate;
                        }).length}
                    </div>
                </div>
            </div>


            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={() => setIsStudying(true)}
                    disabled={words.filter(w => w.status === activeStatus).length === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${activeStatus === 'learning'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
                        }`}
                >
                    <BookOpen size={18} />
                    {activeStatus === 'learning' ? 'Start Study Session' : 'Start Review Session'}
                </button>

                <div className="flex items-center gap-3">
                    {/* Status Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveStatus('learning')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeStatus === 'learning' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Clock size={16} />
                            Learning ({words.filter(w => w.status === 'learning').length})
                        </button>
                        <button
                            onClick={() => setActiveStatus('known')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeStatus === 'known' ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <CheckCircle2 size={16} />
                            Known ({words.filter(w => w.status === 'known').length})
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find a word..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64 dark:text-white transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Vocabulary Table/List */}
            <div className="bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {groupedWords.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No words found</h3>
                        <p className="text-gray-500 max-w-xs text-sm mt-1">Try changing your filters or save some new words from the Immersion player.</p>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="flex items-center gap-4 px-6 py-3 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider backdrop-blur-sm sticky top-0 z-10">
                            <div className="w-40">Word</div>
                            <div className="w-48">Translation</div>
                            <div className="flex-1">Context</div>
                            <div className="w-20 text-center">Source</div>
                            <div className="w-32 text-center">Mastery</div>
                            <div className="w-10"></div>
                        </div>

                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {groupedWords.map(([date, items]) => (
                                <div key={date} className="relative">
                                    {/* Date Divider */}
                                    <div className="bg-gray-50/30 dark:bg-gray-800/30 px-6 py-2 border-b border-gray-100 dark:border-gray-800/50">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Calendar size={12} />
                                            {date}
                                        </div>
                                    </div>

                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {items.map((word) => (
                                            <div key={word.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-500/[0.02] px-6 py-4 flex items-center gap-4 transition-colors">

                                                {/* Word */}
                                                <div className="w-40 flex-shrink-0">
                                                    <div className="text-lg font-bold text-gray-900 dark:text-white truncate" title={word.word}>{word.word}</div>
                                                </div>

                                                {/* Translation */}
                                                <div className="w-48 flex-shrink-0 text-gray-600 dark:text-gray-400 font-medium truncate" title={word.translation}>
                                                    {word.translation}
                                                </div>

                                                {/* Context Sentence */}
                                                <div className="flex-1 text-gray-700 dark:text-gray-300 italic text-sm line-clamp-2 leading-relaxed">
                                                    {highlightWord(word.context, word.word)}
                                                </div>

                                                {/* Source Column */}
                                                <div className="w-20 flex justify-center">
                                                    {word.sourceTitle ? (
                                                        <button
                                                            onClick={() => onPlayVideo?.(word.videoId, word.timestamp)}
                                                            className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                                                            title={`Watch: ${word.sourceTitle}`}
                                                        >
                                                            <Play size={14} fill="currentColor" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </div>

                                                {/* Mastery Column */}
                                                <div className="w-32 flex justify-center">
                                                    {word.status === 'learning' ? (
                                                        <div className="flex gap-1" title={`Mastery: ${word.mastery || 0}/5`}>
                                                            {[1, 2, 3, 4, 5].map((level) => (
                                                                <button
                                                                    key={level}
                                                                    onClick={() => onUpdateMastery?.(word.id, level)}
                                                                    className={`w-4 h-6 rounded-sm transition-all ${(word.mastery || 0) >= level
                                                                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                                                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-emerald-200'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => onUpdateMastery?.(word.id, 0)} // Reset to 0 (learning)
                                                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wide"
                                                            title="Mastered! Click to reset to Learning"
                                                        >
                                                            Known
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="w-10 flex items-center justify-end">
                                                    <button
                                                        onClick={() => onDeleteWord(word.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>


            {/* Flashcard Session Overlay */}
            {
                isStudying && (
                    <FlashcardSession
                        words={words.filter(w => w.status === activeStatus)} // Contextual study
                        title={activeStatus === 'learning' ? 'Study Session' : 'Review Session'}
                        onClose={() => setIsStudying(false)}
                        onUpdateWordStatus={onUpdateWordStatus}
                        onUpdateMastery={onUpdateMastery}
                        onLogTime={onLogTime}
                    />
                )
            }
        </div >
    );
};
