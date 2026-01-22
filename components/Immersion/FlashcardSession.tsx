import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, RotateCw, CheckCircle2, ChevronRight, Trophy, BookOpen, Keyboard, MousePointerClick, Check, AlertCircle, List, Type, ArrowLeftRight } from 'lucide-react';
import { SavedWord } from '../../types';
import confetti from 'canvas-confetti';

interface FlashcardSessionProps {
    words: SavedWord[];
    onClose: () => void;
    onUpdateWordStatus: (id: string, status: 'learning' | 'known') => void;
    onUpdateMastery?: (id: string, newMastery: number) => void;
    onLogTime?: (seconds: number) => void;
    title?: string;
    initialMode?: StudyMode;
    initialDirection?: Direction;
}

type StudyMode = 'flip' | 'typing' | 'multiple_choice' | 'cloze';
type Direction = 'forward' | 'reverse'; // forward: Word -> Translation, reverse: Translation -> Word

export const FlashcardSession: React.FC<FlashcardSessionProps> = ({
    words,
    onClose,
    onUpdateWordStatus,
    onUpdateMastery,
    onLogTime,
    title = "Study Session",
    initialMode = 'flip',
    initialDirection = 'forward'
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [stats, setStats] = useState({ learned: 0, review: 0 });
    const [isComplete, setIsComplete] = useState(false);

    // Modes & Settings
    const [mode, setMode] = useState<StudyMode>(initialMode);
    const [direction, setDirection] = useState<Direction>(initialDirection);

    // Time Logging
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (onLogTime && !isComplete) {
            interval = setInterval(() => {
                onLogTime(10); // Log 10 seconds every 10 seconds
            }, 10000);
        }
        return () => clearfix(interval);
    }, [onLogTime, isComplete]);

    // Helper to clear interval safely
    const clearfix = (i: NodeJS.Timeout) => clearInterval(i);

    // User Input State
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Multiple Choice State
    const [options, setOptions] = useState<string[]>([]);

    const currentWord = words[currentIndex];
    const progress = ((currentIndex) / words.length) * 100;

    // Determine Question/Answer based on Direction
    const questionText = direction === 'forward' ? currentWord.word : currentWord.translation;
    const answerText = direction === 'forward' ? currentWord.translation : currentWord.word;
    const contextText = currentWord.context;

    // Generator: Multiple Choice Options
    useEffect(() => {
        if (mode === 'multiple_choice') {
            const correct = answerText;
            const otherWords = words
                .filter(w => w.id !== currentWord.id)
                .map(w => direction === 'forward' ? w.translation : w.word);

            // Shuffle and pick 3 distractors
            const distractors = otherWords
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const allOptions = [correct, ...distractors].sort(() => 0.5 - Math.random());
            setOptions(allOptions);
        }
    }, [currentIndex, mode, direction, words]);

    // Generator: Cloze Sentence (Only valid for Forward direction basically, or generic context)
    // We mask the *Word* in the context.
    const clozeParts = useMemo(() => {
        if (mode !== 'cloze') return null;

        // Simple case-insensitive replacement
        const parts = contextText.split(new RegExp(`(${currentWord.word})`, 'gi'));
        return parts;
    }, [currentWord, mode]);

    // Effects
    useEffect(() => {
        if (isComplete) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#34D399', '#FCD34D']
            });
        }
    }, [isComplete]);

    // Focus input
    useEffect(() => {
        if ((mode === 'typing' || mode === 'cloze') && !isFlipped && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentIndex, mode, isFlipped]);

    const handleFlip = () => {
        if (mode !== 'flip' && !isFlipped) return;
        setIsFlipped(!isFlipped);
    };

    const checkAnswer = (answer: string) => {
        if (isFlipped) return; // Prevent double check

        const cleanUser = answer.trim().toLowerCase();
        // Check against word or translation depending on mode/direction
        // logic: answerText is the target.
        const cleanTarget = (mode === 'cloze' ? currentWord.word : answerText).trim().toLowerCase();

        // Loose matching
        const isCorrect = cleanUser === cleanTarget || cleanTarget.includes(cleanUser);

        setFeedback(isCorrect ? 'correct' : 'incorrect');
        setUserAnswer(answer); // Provide visual feedback for multiple choice selection
        setIsFlipped(true);

        if (isCorrect) {
            confetti({
                particleCount: 50,
                spread: 40,
                origin: { y: 0.7 },
                colors: ['#10B981']
            });
        }
    };

    const handleNext = (status: 'learning' | 'known') => {
        // Update stats
        // Update stats
        if (status === 'known') { // "Got it!" / Correct
            setStats(prev => ({ ...prev, learned: prev.learned + 1 }));

            if (onUpdateMastery) {
                // Increment mastery
                onUpdateMastery(currentWord.id, (currentWord.mastery || 0) + 1);
            } else if (currentWord.status !== 'known') {
                // Legacy fallback
                onUpdateWordStatus(currentWord.id, 'known');
            }
        } else { // "Still Learning" / Incorrect
            setStats(prev => ({ ...prev, review: prev.review + 1 }));

            if (onUpdateMastery) {
                // Decrement mastery (set back a step)
                onUpdateMastery(currentWord.id, Math.max(0, (currentWord.mastery || 0) - 1));
            } else if (currentWord.status === 'known') {
                // Legacy fallback
                onUpdateWordStatus(currentWord.id, 'learning');
            }
        }

        // Reset for next card
        if (currentIndex < words.length - 1) {
            setIsFlipped(false);
            setUserAnswer('');
            setFeedback(null);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        } else {
            setIsComplete(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isFlipped) {
            checkAnswer(userAnswer);
        }
    };

    if (isComplete) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-900/95 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative overflow-hidden">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy size={40} className="text-emerald-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session Complete!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">Great job practicing your vocabulary.</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.learned}</div>
                            <div className="text-xs text-green-600/80 dark:text-green-400/80 font-medium uppercase">Mastered</div>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.review}</div>
                            <div className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium uppercase">Review</div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30"
                    >
                        Close Session
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in">
            {/* Header / Nav */}
            <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8 text-white">
                <div className="flex items-center gap-3 opacity-90 w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold">{title}</h3>
                            <p className="text-xs text-white/60">{currentIndex + 1} of {words.length}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white/80 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl backdrop-blur-sm">
                    {/* Mode Toggles */}
                    <button
                        onClick={() => { setMode('flip'); setIsFlipped(false); }}
                        className={`p-2 rounded-lg transition-all ${mode === 'flip' ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                        title="Flip Mode"
                    >
                        <RotateCw size={18} />
                    </button>
                    <button
                        onClick={() => { setMode('typing'); setIsFlipped(false); }}
                        className={`p-2 rounded-lg transition-all ${mode === 'typing' ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                        title="Typing Mode"
                    >
                        <Keyboard size={18} />
                    </button>
                    <button
                        onClick={() => { setMode('multiple_choice'); setIsFlipped(false); }}
                        className={`p-2 rounded-lg transition-all ${mode === 'multiple_choice' ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                        title="Multiple Choice"
                    >
                        <List size={18} />
                    </button>
                    <button
                        onClick={() => { setMode('cloze'); setIsFlipped(false); }}
                        className={`p-2 rounded-lg transition-all ${mode === 'cloze' ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                        title="Sentence Completion"
                    >
                        <Type size={18} />
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1"></div>

                    {/* Direction Toggle */}
                    <button
                        onClick={() => { setDirection(prev => prev === 'forward' ? 'reverse' : 'forward'); setIsFlipped(false); }}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1 ${direction === 'reverse' ? 'bg-amber-500/80 text-white' : 'text-white/60 hover:text-white'}`}
                        title="Toggle Direction"
                    >
                        <ArrowLeftRight size={16} />
                        <span className="text-[10px] font-bold uppercase w-8 text-center">
                            {direction === 'forward' ? 'L2→L1' : 'L1→L2'}
                        </span>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="hidden md:block p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white/80 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl h-1.5 bg-gray-700/50 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* FLIP CARD AREA */}
            <div className="w-full max-w-xl aspect-[4/3] relative perspective-1000 group">
                <div
                    className={`relative w-full h-full transition-all duration-500 transform-style-3d ${mode === 'flip' ? 'cursor-pointer' : ''} ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={mode === 'flip' ? handleFlip : undefined}
                >
                    {/* Front of Card */}
                    <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-center">
                        <div className="absolute top-6 right-6 text-gray-300 dark:text-gray-600">
                            {/* Icon based on mode */}
                            {mode === 'typing' && <Keyboard size={20} />}
                            {mode === 'flip' && <RotateCw size={20} />}
                            {mode === 'multiple_choice' && <List size={20} />}
                            {mode === 'cloze' && <Type size={20} />}
                        </div>

                        {/* Prompt Label */}
                        <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">
                            {mode === 'cloze' ? 'Complete the Sentence' : (direction === 'forward' ? 'Translate to Native' : 'Translate to Target')}
                        </span>

                        {/* MAIN CONTENT AREA */}
                        <div className="w-full flex-1 flex flex-col items-center justify-center">

                            {/* CLOZE MODE */}
                            {mode === 'cloze' ? (
                                <div className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed max-w-md">
                                    {clozeParts && clozeParts.map((part, i) => (
                                        part.toLowerCase() === currentWord.word.toLowerCase() ? (
                                            <span key={i} className="inline-block border-b-2 border-emerald-500 min-w-[80px] mx-1 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                                {isFlipped ? part : '_____'}
                                            </span>
                                        ) : (
                                            <span key={i}>{part}</span>
                                        )
                                    ))}
                                </div>
                            ) : (
                                /* STANDARD QUESTION TEXT */
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                                    {questionText}
                                </h2>
                            )}

                            {/* INTERACTION AREA */}

                            {/* Typing & Cloze Inputs */}
                            {(mode === 'typing' || mode === 'cloze') && !isFlipped && (
                                <div className="w-full max-w-xs mt-4 animate-fade-in">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder={mode === 'cloze' ? "Type missing word..." : "Type translation..."}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-center font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        onKeyDown={handleKeyDown}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); checkAnswer(userAnswer); }}
                                        disabled={!userAnswer.trim()}
                                        className="w-full mt-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Check
                                    </button>
                                </div>
                            )}

                            {/* Multiple Choice Grid */}
                            {mode === 'multiple_choice' && !isFlipped && (
                                <div className="w-full grid grid-cols-2 gap-3 mt-4 animate-fade-in">
                                    {options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); checkAnswer(opt); }}
                                            className="p-3 text-sm font-medium bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-600 hover:border-indigo-200 rounded-xl transition-all"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {mode === 'flip' && (
                                <p className="text-sm text-gray-400 mt-8">Click to flip</p>
                            )}

                        </div>
                    </div>

                    {/* Back of Card */}
                    <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-emerald-50 dark:bg-gray-800 rounded-3xl shadow-2xl border-2 ${feedback === 'incorrect' ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-emerald-100 dark:border-emerald-500/30'} p-8 flex flex-col items-center justify-center text-center`}>

                        {feedback && (
                            <div className={`absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${feedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {feedback === 'correct' ? <Check size={14} /> : <AlertCircle size={14} />}
                                {feedback === 'correct' ? 'Correct!' : 'Try Again'}
                            </div>
                        )}

                        <div className="absolute top-6 right-6 text-emerald-300 dark:text-emerald-700/50">
                            <RotateCw size={20} />
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                            <span className="text-xs uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60 font-bold mb-2">
                                {mode === 'cloze' ? 'Answer' : 'Translation'}
                            </span>

                            {/* Main Answer text */}
                            <h3 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-6">
                                {mode === 'cloze' ? currentWord.word : answerText}
                            </h3>

                            {/* User Answer Verification Display */}
                            {(mode !== 'flip') && userAnswer && (
                                <div className="mb-6 text-sm">
                                    <span className="text-gray-400 mr-2">You Selected:</span>
                                    <span className={`font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-500 line-through'}`}>
                                        {userAnswer}
                                    </span>
                                </div>
                            )}

                            <div className="w-full h-px bg-emerald-200/50 dark:bg-emerald-900/30 mb-6"></div>

                            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Context</span>
                            <p className="text-lg text-gray-600 dark:text-gray-300 italic leading-relaxed max-w-md">
                                "{currentWord.context}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className={`flex items-center gap-4 mt-8 transition-all duration-300 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <button
                    onClick={(e) => { e.stopPropagation(); handleNext('learning'); }}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl font-bold transition-colors"
                >
                    <RotateCw size={18} />
                    Still Learning
                </button>
                <div className="w-px h-8 bg-gray-500/30 mx-2"></div>
                <button
                    onClick={(e) => { e.stopPropagation(); handleNext('known'); }}
                    className="flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105"
                >
                    <CheckCircle2 size={20} />
                    Got it!
                </button>
            </div>

            {/* Styles for 3D Flip */}
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
};
