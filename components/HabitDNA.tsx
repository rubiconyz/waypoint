import React, { useState, useRef, useCallback } from 'react';
import { Loader2, Share2, Download, Clock, Sparkles, TrendingUp, Shield, Scale, History, Zap, ChevronRight, Sword, Swords, Info } from 'lucide-react';
import { Habit, HabitDNASnapshot, HabitDNAProfile, HabitDNAArchetype } from '../types';
import { generateHabitDNA, generateCharacterImage } from '../services/geminiService';

interface HabitDNAProps {
    habits: Habit[];
    dnaProfile: HabitDNAProfile;
    onUpdateProfile: (profile: HabitDNAProfile) => void;
}

// ─── Character Display ────────────────────────────────────────────────────────
const CharacterDisplay: React.FC<{
    imageBase64: string;
    archetype: HabitDNAArchetype;
    animate: boolean;
}> = ({ imageBase64, archetype, animate }) => {
    const colors = archetype.colorPalette;

    return (
        <div className="relative">
            {/* Ambient glow behind the character */}
            <div
                className="absolute inset-0 rounded-2xl opacity-20 blur-3xl"
                style={{
                    background: `radial-gradient(circle at 50% 60%, ${colors[0]}, ${colors[1]}80, transparent 70%)`,
                }}
            />

            {/* Character Image */}
            <img
                src={`data:image/png;base64,${imageBase64}`}
                alt={archetype.name}
                className={`w-full rounded-2xl ${animate ? 'animate-fade-in' : ''}`}
                style={{
                    boxShadow: `0 0 40px ${colors[0]}30, 0 0 80px ${colors[1]}15`,
                }}
            />
        </div>
    );
};

// ─── Metric Bar ───────────────────────────────────────────────────────────────
const MetricBar: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string; info: string }> = ({ label, value, icon, color, info }) => {
    const [showInfo, setShowInfo] = React.useState(false);
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                    {icon}
                    {label}
                    <div className="relative">
                        <button
                            onMouseEnter={() => setShowInfo(true)}
                            onMouseLeave={() => setShowInfo(false)}
                            onClick={() => setShowInfo(!showInfo)}
                            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <Info size={12} />
                        </button>
                        {showInfo && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-xl z-50 leading-relaxed">
                                {info}
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700" />
                            </div>
                        )}
                    </div>
                </div>
                <span className="text-sm font-bold" style={{ color }}>{value}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
                />
            </div>
        </div>
    );
};

// ─── Share Card ───────────────────────────────────────────────────────────────
const ShareCard: React.FC<{
    snapshot: HabitDNASnapshot;
    cardRef: React.RefObject<HTMLDivElement | null>;
}> = ({ snapshot, cardRef }) => {
    const { archetype, metrics } = snapshot;
    const colors = archetype.colorPalette;

    return (
        <div
            ref={cardRef}
            className="relative w-[400px] rounded-3xl overflow-hidden shadow-2xl"
            style={{
                background: `linear-gradient(135deg, #0a0a1a 0%, #111827 50%, #0a0a1a 100%)`,
            }}
        >
            {/* Background gradient overlay */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    background: `radial-gradient(circle at 50% 40%, ${colors[0]}, transparent 60%),
                       radial-gradient(circle at 70% 80%, ${colors[2]}, transparent 60%)`,
                }}
            />

            <div className="relative p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/10 p-1.5 rounded-lg">
                            <Sword size={14} style={{ color: colors[0] }} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Habit DNA</span>
                    </div>
                    <span className="text-xs text-gray-500">{snapshot.weekLabel}</span>
                </div>

                {/* Character Image */}
                {snapshot.characterImageBase64 ? (
                    <div className="flex justify-center mb-5">
                        <img
                            src={`data:image/png;base64,${snapshot.characterImageBase64}`}
                            alt={archetype.name}
                            className="w-48 h-48 object-cover rounded-2xl shadow-xl"
                            style={{
                                boxShadow: `0 0 30px ${colors[0]}30`,
                            }}
                        />
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center mb-5">
                        <div className="text-6xl">{archetype.emoji}</div>
                    </div>
                )}

                {/* Archetype */}
                <div className="text-center mb-5">
                    <div className="text-3xl mb-1">{archetype.emoji}</div>
                    <h2 className="text-xl font-extrabold text-white">{archetype.name}</h2>
                    <p className="text-sm font-medium mt-0.5" style={{ color: colors[0] }}>{archetype.title}</p>
                </div>

                {/* Traits */}
                <div className="flex justify-center gap-2 mb-5">
                    {archetype.traits.map((trait, i) => (
                        <span
                            key={i}
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: colors[i % colors.length] }}
                        >
                            {trait}
                        </span>
                    ))}
                </div>

                {/* Stats mini bar */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { label: 'Rhythm', value: metrics.consistencyRhythm },
                        { label: 'Harmony', value: metrics.categoryHarmony },
                        { label: 'Resilience', value: metrics.streakResilience },
                        { label: 'Growth', value: metrics.growthVelocity },
                    ].map((stat, i) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-lg font-extrabold" style={{ color: colors[i % colors.length] }}>
                                {stat.value}
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-gray-500">waypoint.ltd</span>
                    <span className="text-xs font-medium text-gray-500">⚔️ #{metrics.totalCompletions} completions</span>
                </div>
            </div>
        </div>
    );
};


// ─── Main HabitDNA Component ──────────────────────────────────────────────────
export const HabitDNA: React.FC<HabitDNAProps> = ({ habits, dnaProfile, onUpdateProfile }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationPhase, setGenerationPhase] = useState<'archetype' | 'character' | null>(null);
    const [showShareCard, setShowShareCard] = useState(false);
    const [showTimeline, setShowTimeline] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const shareCardRef = useRef<HTMLDivElement | null>(null);

    const currentSnapshot = dnaProfile.current;

    const handleGenerate = useCallback(async () => {
        if (habits.length === 0) return;
        setIsGenerating(true);
        setError(null);
        setGenerationPhase('archetype');

        try {
            // Phase 1: Generate archetype + metrics
            const result = await generateHabitDNA(habits);
            if (!result) {
                setError('Failed to analyze your habit data. Please try again.');
                return;
            }

            setGenerationPhase('character');

            // Phase 2: Generate character image
            let characterImageBase64: string | null = null;
            try {
                characterImageBase64 = await generateCharacterImage(habits, result.metrics, result.archetype);
            } catch (imgErr) {
                console.warn('Character image generation failed, proceeding without:', imgErr);
            }

            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const weekLabel = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

            const snapshot: HabitDNASnapshot = {
                id: crypto.randomUUID(),
                generatedAt: now.toISOString(),
                weekLabel,
                archetype: result.archetype,
                metrics: result.metrics,
                characterImageBase64: characterImageBase64 || undefined,
            };

            // Keep max 12 historical snapshots — strip image data to avoid localStorage quota issues
            const newHistory = [...dnaProfile.history];
            if (dnaProfile.current) {
                // Remove the large base64 image before archiving to history
                const { characterImageBase64: _img, ...archivedSnapshot } = dnaProfile.current;
                newHistory.push(archivedSnapshot as HabitDNASnapshot);
            }
            while (newHistory.length > 12) {
                newHistory.shift();
            }

            onUpdateProfile({
                current: snapshot,
                history: newHistory,
            });
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating your Habit DNA.');
        } finally {
            setIsGenerating(false);
            setGenerationPhase(null);
        }
    }, [habits, dnaProfile, onUpdateProfile]);

    const handleDownloadCard = useCallback(async () => {
        if (!shareCardRef.current) return;
        try {
            // Dynamic import html2canvas
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(shareCardRef.current, {
                backgroundColor: '#0a0a1a',
                scale: 2,
                useCORS: true,
            });
            const link = document.createElement('a');
            link.download = `habit-dna-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to export share card:', err);
            alert('Download failed. Try taking a screenshot instead.');
        }
    }, []);

    // ─── Empty State ────────────────────────────────────────────────────────────
    if (habits.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-[#0F141D] rounded-2xl border border-gray-100 dark:border-[#1F2733] shadow-sm p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Sword size={36} className="text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Your Character Awaits</h2>
                    <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                        Start tracking habits to forge your unique RPG character. Your avatar will evolve as you grow stronger.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-slate-500">
                        <Swords size={14} />
                        <span>Add at least one habit to begin</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="bg-gradient-to-br from-rose-500 to-red-600 p-2.5 rounded-xl text-white shadow-lg shadow-rose-500/20">
                            <Sword size={24} />
                        </div>
                        Habit DNA
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1.5">Your unique behavioral character</p>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${isGenerating
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-lg shadow-rose-500/20 hover:shadow-xl hover:scale-[1.02]'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {generationPhase === 'archetype' ? 'Analyzing...' : 'Forging...'}
                        </>
                    ) : currentSnapshot ? (
                        <>
                            <Sparkles size={16} />
                            Regenerate
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            Forge My Character
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Generating Animation */}
            {isGenerating && !currentSnapshot && (
                <div className="bg-white dark:bg-[#0F141D] rounded-2xl border border-gray-100 dark:border-[#1F2733] shadow-sm p-16 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 rounded-full border-4 border-rose-200 dark:border-rose-900/50" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rose-600 animate-spin" />
                        <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-red-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sword size={28} className="text-rose-600 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {generationPhase === 'archetype' ? 'Analyzing Your Data...' : 'Forging Your Character...'}
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">
                        {generationPhase === 'archetype'
                            ? 'AI is studying your behavioral patterns, streaks, and growth trajectory...'
                            : 'Creating your unique RPG avatar from your habit data...'}
                    </p>
                </div>
            )}

            {/* Main Content */}
            {currentSnapshot && (
                <div className="space-y-5">
                    {/* Top Row: Character + Archetype side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-5">
                        {/* Character Image */}
                        <div className="bg-white dark:bg-[#0F141D] rounded-2xl border border-gray-100 dark:border-[#1F2733] shadow-sm overflow-hidden">
                            <div
                                className="relative"
                                style={{
                                    background: `linear-gradient(180deg, #0a0a1a 0%, ${currentSnapshot.archetype.colorPalette[0]}08 50%, #0a0a1a 100%)`,
                                }}
                            >
                                {currentSnapshot.characterImageBase64 ? (
                                    <CharacterDisplay
                                        imageBase64={currentSnapshot.characterImageBase64}
                                        archetype={currentSnapshot.archetype}
                                        animate={true}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center py-10">
                                        <div className="text-center">
                                            <div className="text-7xl mb-3">{currentSnapshot.archetype.emoji}</div>
                                            <p className="text-xs text-gray-500 dark:text-slate-500">
                                                Regenerate to create character art
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Archetype Info */}
                        <div className="bg-white dark:bg-[#0F141D] rounded-2xl border border-gray-100 dark:border-[#1F2733] shadow-sm p-5 flex flex-col justify-between min-w-0">
                            <div>
                                <div className="flex items-start gap-3 mb-3">
                                    <div
                                        className="text-3xl w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `${currentSnapshot.archetype.colorPalette[0]}15` }}
                                    >
                                        {currentSnapshot.archetype.emoji}
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">
                                            {currentSnapshot.archetype.name}
                                        </h2>
                                        <p className="text-xs font-semibold" style={{ color: currentSnapshot.archetype.colorPalette[0] }}>
                                            {currentSnapshot.archetype.title}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-3">
                                    {currentSnapshot.archetype.narrative}
                                </p>

                                {/* Traits */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {currentSnapshot.archetype.traits.map((trait, i) => (
                                        <span
                                            key={i}
                                            className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-sm"
                                            style={{ backgroundColor: currentSnapshot.archetype.colorPalette[i % currentSnapshot.archetype.colorPalette.length] }}
                                        >
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowShareCard(!showShareCard)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
                                >
                                    <Share2 size={14} />
                                    Share
                                </button>
                                {dnaProfile.history.length > 0 && (
                                    <button
                                        onClick={() => setShowTimeline(!showTimeline)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors"
                                    >
                                        <History size={14} />
                                        Timeline ({dnaProfile.history.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Behavioral Metrics — 2x2 compact grid */}
                    <div className="bg-white dark:bg-[#0F141D] rounded-2xl border border-gray-100 dark:border-[#1F2733] shadow-sm p-5">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" />
                            Behavioral Metrics
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            <MetricBar
                                label="Consistency Rhythm"
                                value={currentSnapshot.metrics.consistencyRhythm}
                                icon={<Clock size={14} className="text-blue-500" />}
                                color={currentSnapshot.archetype.colorPalette[0]}
                                info="Percentage of the last 30 days where you completed at least one habit. Higher = more consistent daily presence."
                            />
                            <MetricBar
                                label="Category Harmony"
                                value={currentSnapshot.metrics.categoryHarmony}
                                icon={<Scale size={14} className="text-emerald-500" />}
                                color={currentSnapshot.archetype.colorPalette[1]}
                                info="How balanced your completions are across different categories. 100 = perfectly even, lower = dominated by one category."
                            />
                            <MetricBar
                                label="Streak Resilience"
                                value={currentSnapshot.metrics.streakResilience}
                                icon={<Shield size={14} className="text-orange-500" />}
                                color={currentSnapshot.archetype.colorPalette[2]}
                                info="How well you bounce back after missing a habit. Measures recovery patterns — getting back on track within days of a miss."
                            />
                            <MetricBar
                                label="Growth Velocity"
                                value={currentSnapshot.metrics.growthVelocity}
                                icon={<TrendingUp size={14} className="text-violet-500" />}
                                color={currentSnapshot.archetype.colorPalette[3] || currentSnapshot.archetype.colorPalette[0]}
                                info="Your recent momentum — compares this week's completions to last week. Higher = you're accelerating, lower = slowing down."
                            />
                        </div>
                    </div>

                    {/* Generated time */}
                    <div className="text-xs text-gray-400 dark:text-slate-500 text-center">
                        Generated {new Date(currentSnapshot.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            )}

            {/* Share Card Modal */}
            {showShareCard && currentSnapshot && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShareCard(false)}>
                    <div className="animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex justify-end gap-2">
                            <button
                                onClick={handleDownloadCard}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl text-sm font-semibold shadow-lg hover:scale-105 transition-transform"
                            >
                                <Download size={14} />
                                Download
                            </button>
                            <button
                                onClick={() => setShowShareCard(false)}
                                className="px-4 py-2 bg-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                        <ShareCard snapshot={currentSnapshot} cardRef={shareCardRef} />
                    </div>
                </div>
            )}

            {/* Timeline */}
            {showTimeline && dnaProfile.history.length > 0 && (
                <div className="bg-white dark:bg-[#0F141D] rounded-2xl border border-gray-100 dark:border-[#1F2733] shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                        <History size={18} className="text-indigo-500" />
                        Evolution Timeline
                    </h3>
                    <div className="space-y-4">
                        {[...dnaProfile.history]
                            .filter((snapshot, idx, arr) => arr.findIndex(s => s.id === snapshot.id) === idx)
                            .reverse()
                            .map((snapshot, i) => (
                                <div
                                    key={snapshot.id}
                                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {snapshot.characterImageBase64 ? (
                                        <img
                                            src={`data:image/png;base64,${snapshot.characterImageBase64}`}
                                            alt={snapshot.archetype.name}
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">{snapshot.archetype.emoji}</div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-gray-900 dark:text-white text-sm">{snapshot.archetype.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-slate-400">{snapshot.weekLabel}</div>
                                    </div>
                                    <div className="flex gap-1">
                                        {snapshot.archetype.colorPalette.slice(0, 4).map((color, ci) => (
                                            <div key={ci} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                        <span>{snapshot.metrics.consistencyRhythm}%</span>
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};
