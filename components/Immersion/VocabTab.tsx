import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Trash2, Play, CheckCircle2, Clock, Calendar, Sparkles, GraduationCap, Star, RotateCcw, Layers, Keyboard, ListChecks, Type, ArrowLeftRight } from 'lucide-react';
import { SavedWord, WordMasteryLevel } from '../../types';
import { FlashcardSession } from './FlashcardSession';

// Mastery level definitions
type MasteryFilter = 'new' | 'learning' | 'familiar' | 'known';
type StudyMode = 'flip' | 'typing' | 'multiple_choice' | 'cloze';
type Direction = 'forward' | 'reverse';

const MASTERY_CONFIG: Record<MasteryFilter, { label: string; levels: number[]; color: string; bgColor: string; icon: React.ReactNode }> = {
    new: { label: 'New', levels: [0, 1], color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-700', icon: <Sparkles size={14} /> },
    learning: { label: 'Learning', levels: [2, 3], color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: <BookOpen size={14} /> },
    familiar: { label: 'Familiar', levels: [4], color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: <Star size={14} /> },
    known: { label: 'Known', levels: [5], color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: <CheckCircle2 size={14} /> },
};

const getMasteryCategory = (mastery: number): MasteryFilter => {
    if (mastery <= 1) return 'new';
    if (mastery <= 3) return 'learning';
    if (mastery === 4) return 'familiar';
    return 'known';
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
    const [activeFilter, setActiveFilter] = useState<MasteryFilter>('new');
    const [studyConfig, setStudyConfig] = useState<{ mode: StudyMode, direction: Direction } | null>(null);
    const [selectedDirection, setSelectedDirection] = useState<Direction>('forward');

    // Count words in each mastery category
    const categoryCounts = useMemo(() => {
        const counts: Record<MasteryFilter, number> = { new: 0, learning: 0, familiar: 0, known: 0 };
        words.forEach(w => {
            const cat = getMasteryCategory(w.mastery || 0);
            counts[cat]++;
        });
        return counts;
    }, [words]);

    // Group words by date
    const groupedWords = useMemo(() => {
        const filtered = words.filter(w => {
            const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.translation.toLowerCase().includes(searchTerm.toLowerCase());
            const cat = getMasteryCategory(w.mastery || 0);
            return matchesSearch && cat === activeFilter;
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

        return Object.entries(groups).sort((a, b) =>
            new Date(b[0]).getTime() - new Date(a[0]).getTime()
        );
    }, [words, searchTerm, activeFilter]);

    const highlightWord = (text: string, word: string) => {
        if (!text || !word) return text;
        const safeWord = escapeRegExp(word);
        const parts = text.split(new RegExp(`(${safeWord})`, 'gi'));
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

    const getMasteryBadge = (mastery: number) => {
        const cat = getMasteryCategory(mastery);
        const config = MASTERY_CONFIG[cat];
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bgColor} ${config.color}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    // Calculate overall progress percentage
    const progressPercentage = useMemo(() => {
        if (words.length === 0) return 0;
        const totalPoints = words.reduce((sum, w) => sum + (w.mastery || 0), 0);
        const maxPoints = words.length * 5;
        return Math.round((totalPoints / maxPoints) * 100);
    }, [words]);

    return (
        <div className="w-full h-full space-y-6 pt-0 pb-12 animate-fade-in relative z-20">
            {/* Statistics Dashboard */}
            {/* Study Center */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">

                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Study Center</h2>
                            <p className="text-sm text-gray-500">Choose a learning technique</p>
                        </div>
                    </div>

                    {/* Direction Toggle */}
                    <button
                        onClick={() => setSelectedDirection(prev => prev === 'forward' ? 'reverse' : 'forward')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        <ArrowLeftRight size={14} />
                        <span>{selectedDirection === 'forward' ? 'Target → Native' : 'Native → Target'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setStudyConfig({ mode: 'flip', direction: selectedDirection })}
                        disabled={categoryCounts[activeFilter] === 0}
                        className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Layers size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Flashcards</div>
                            <div className="text-xs text-gray-500">Classic flip cards</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setStudyConfig({ mode: 'typing', direction: selectedDirection })}
                        disabled={categoryCounts[activeFilter] === 0}
                        className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Keyboard size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Typing</div>
                            <div className="text-xs text-gray-500">Practice spelling</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setStudyConfig({ mode: 'multiple_choice', direction: selectedDirection })}
                        disabled={categoryCounts[activeFilter] === 0}
                        className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ListChecks size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Quiz</div>
                            <div className="text-xs text-gray-500">Multiple choice</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setStudyConfig({ mode: 'cloze', direction: selectedDirection })}
                        disabled={categoryCounts[activeFilter] === 0}
                        className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all group text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Type size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white">Fill Blanks</div>
                            <div className="text-xs text-gray-500">Complete sentences</div>
                        </div>
                    </button>
                </div>
            </div>

            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-sm text-gray-500 font-medium">
                    Showing {categoryCounts[activeFilter]} {activeFilter} words
                </div>

                <div className="flex items-center gap-3">
                    {/* 4 Level Tabs */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                        {(['new', 'learning', 'familiar', 'known'] as MasteryFilter[]).map(cat => {
                            const config = MASTERY_CONFIG[cat];
                            const isActive = activeFilter === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveFilter(cat)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${isActive
                                        ? `bg-white dark:bg-gray-700 ${config.color} shadow-sm`
                                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {config.icon}
                                    <span className="hidden sm:inline">{config.label}</span>
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? config.bgColor : 'bg-gray-200 dark:bg-gray-600'}`}>
                                        {categoryCounts[cat]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Find a word..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-48 dark:text-white transition-all shadow-sm"
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
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No {MASTERY_CONFIG[activeFilter].label} words</h3>
                        <p className="text-gray-500 max-w-xs text-sm mt-1">
                            {activeFilter === 'new'
                                ? 'Save some words from the Immersion player to get started!'
                                : `Keep studying to move words to ${MASTERY_CONFIG[activeFilter].label}!`}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Table Header */}
                        <div className="flex items-center gap-4 px-6 py-3 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider backdrop-blur-sm sticky top-0 z-10">
                            <div className="w-40">Word</div>
                            <div className="w-48">Translation</div>
                            <div className="flex-1">Context</div>
                            <div className="w-20 text-center">Source</div>
                            <div className="w-28 text-center">Level</div>
                            <div className="w-24 text-center">Actions</div>
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

                                                {/* Level Badge */}
                                                <div className="w-28 flex justify-center">
                                                    {getMasteryBadge(word.mastery || 0)}
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="w-24 flex items-center justify-center gap-1">
                                                    {activeFilter !== 'known' && (
                                                        <button
                                                            onClick={() => onUpdateMastery?.(word.id, 5)}
                                                            className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Mark as Known"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                    )}
                                                    {activeFilter === 'known' && (
                                                        <button
                                                            onClick={() => onUpdateMastery?.(word.id, 0)}
                                                            className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Reset to New"
                                                        >
                                                            <RotateCcw size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => onDeleteWord(word.id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
            {studyConfig && (
                <FlashcardSession
                    words={words.filter(w => getMasteryCategory(w.mastery || 0) === activeFilter)}
                    title={`Study ${MASTERY_CONFIG[activeFilter].label} Words`}
                    onClose={() => setStudyConfig(null)}
                    onUpdateWordStatus={onUpdateWordStatus}
                    onUpdateMastery={onUpdateMastery}
                    onLogTime={onLogTime}
                    initialMode={studyConfig.mode}
                    initialDirection={studyConfig.direction}
                />
            )}
        </div>
    );
};
