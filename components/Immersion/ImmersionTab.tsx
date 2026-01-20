import React, { useState, useEffect, useRef } from 'react';
import { Play, BookOpen, Languages, Plus, Search, Youtube, Captions, Sparkles, Loader2, X, Check } from 'lucide-react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { translateWord } from '../../services/translationService';
import { getWordLemma } from '../../services/geminiService';
import { SavedWord, RecentVideo, TranscriptSegment } from '../../types';
import { FlashcardSession } from './FlashcardSession';

const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const LANGUAGES = [
    { code: 'de', name: 'German', flag: '🇩🇪' },
];

const NATIVE_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
];



interface HoverTranslation {
    word: string;
    translation: string;
    x: number;
    y: number;
}

interface ImmersionTabProps {
    allSavedWords: SavedWord[];
    onSaveWord: (word: SavedWord) => void;
    onDeleteWord: (id: string) => void;
    onUpdateWordStatus: (id: string, status: 'learning' | 'known') => void;
    recentVideos: RecentVideo[];
    onVideoWatched: (video: RecentVideo) => void;
    onDeleteRecentVideo?: (videoId: string) => void;
    requestedVideo?: { id: string; timestamp: number } | null;
    onUpdateMastery?: (id: string, newMastery: number) => void;
    onLogTime?: (seconds: number) => void;
}

export const ImmersionTab: React.FC<ImmersionTabProps> = ({
    allSavedWords,
    onSaveWord,
    onDeleteWord,
    onUpdateWordStatus,
    onUpdateMastery,
    recentVideos,
    onVideoWatched,
    onDeleteRecentVideo,
    requestedVideo,
    onLogTime
}) => {
    const [videoUrl, setVideoUrl] = useState('');
    const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[0]);
    const [nativeLanguage, setNativeLanguage] = useState(NATIVE_LANGUAGES[0]);

    const [segments, setSegments] = useState<TranscriptSegment[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);

    const [activeSideTab, setActiveSideTab] = useState<'transcript' | 'vault' | 'chat'>('transcript');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [hasExtension, setHasExtension] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [showDualSubtitles, setShowDualSubtitles] = useState(false);
    const [secondarySubtitle, setSecondarySubtitle] = useState<string>('');
    const dualSubCache = useRef<Map<string, string>>(new Map());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLooping, setIsLooping] = useState(false);
    const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
    const [isStudying, setIsStudying] = useState(false);
    const [studyWords, setStudyWords] = useState<SavedWord[]>([]);

    // Hover Translation State
    const [hoverTranslation, setHoverTranslation] = useState<HoverTranslation | null>(null);
    const [tooltipLocked, setTooltipLocked] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const translationCache = useRef<Map<string, string>>(new Map());
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    // Player & Sync State
    const playerRef = useRef<any>(null);
    const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(-1);
    const activeSegmentRef = useRef<HTMLDivElement>(null);

    // Fetch Dual Subtitle when active segment changes
    useEffect(() => {
        if (!showDualSubtitles || activeSegmentIndex === -1 || !segments[activeSegmentIndex]) {
            setSecondarySubtitle('');
            return;
        }

        const currentText = segments[activeSegmentIndex].text;

        // 1. Immediate update if in cache (for sync "togetherness")
        if (dualSubCache.current.has(currentText)) {
            setSecondarySubtitle(dualSubCache.current.get(currentText)!);
        } else {
            // Only clear if not in cache yet
            setSecondarySubtitle('');
        }

        // 2. Fetcher & Pre-fetcher logic
        const fetchRange = async () => {
            // Fetch current if missing
            if (!dualSubCache.current.has(currentText)) {
                try {
                    const translation = await translateWord(currentText, targetLanguage.code, nativeLanguage.code);
                    if (translation) {
                        dualSubCache.current.set(currentText, translation);
                        // If we are still on this segment, update UI
                        setSecondarySubtitle(translation);
                    }
                } catch (e) { console.error(e); }
            }

            // LOOK-AHEAD: Pre-fetch next 3 segments
            for (let i = 1; i <= 3; i++) {
                const nextIdx = activeSegmentIndex + i;
                if (segments[nextIdx]) {
                    const nextText = segments[nextIdx].text;
                    if (!dualSubCache.current.has(nextText)) {
                        try {
                            const translation = await translateWord(nextText, targetLanguage.code, nativeLanguage.code);
                            if (translation) dualSubCache.current.set(nextText, translation);
                        } catch (e) { /* silent fail for pre-fetch */ }
                    }
                }
            }
        };

        const timer = setTimeout(fetchRange, 50); // Smaller delay for bg work
        return () => clearTimeout(timer);
    }, [activeSegmentIndex, showDualSubtitles, nativeLanguage.code, segments]);

    // Handle requested video from props
    useEffect(() => {
        if (requestedVideo) {
            const newUrl = `https://www.youtube.com/watch?v=${requestedVideo.id}`;
            // Always update if ID is different, OR if it's the same ID but loop/seek might be needed (for now just load)
            // Even if same ID, we might want to seek (future improvement).
            // For now, ensuring it loads is the priority.
            if (getYouTubeId(newUrl) !== getYouTubeId(videoUrl)) {
                setVideoUrl(newUrl);
            } else {
                // Same video, maybe seek?
                // If we passed timestamp from saved word, we could seek here.
                // But for now, just ensure it plays.
                if (playerRef.current) {
                    playerRef.current.playVideo();
                }
            }
        }
    }, [requestedVideo]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== window) return;
            if (event.data.source === 'HABIT_VISION_EXT') {
                if (event.data.type === 'EXTENSION_READY') {
                    setHasExtension(true);
                    console.log("Extension detected in React!");
                } else if (event.data.type === 'EXTENSION_IMPORT_DATA') {
                    console.log("Received IMPORT data from extension:", event.data.payload);
                    const { videoId, rawText, segments: importedSegments } = event.data.payload;
                    if (videoId) setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);

                    if (importedSegments && importedSegments.length > 0) {
                        setSegments(importedSegments);
                    } else if (rawText) {
                        setSegments([{ text: rawText, start: 0, duration: 9999 }]);
                    }
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Sync Loop with segment looping support
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current && segments.length > 0) {
                const currentTime = playerRef.current.getCurrentTime();
                const index = segments.findIndex(s => currentTime >= s.start && currentTime < (s.start + s.duration));

                // Loop segment if enabled
                if (isLooping && activeSegmentIndex !== -1 && segments[activeSegmentIndex]) {
                    const seg = segments[activeSegmentIndex];
                    if (currentTime >= (seg.start + seg.duration - 0.1)) {
                        playerRef.current.seekTo(seg.start, true);
                    }
                }

                if (index !== -1 && index !== activeSegmentIndex) {
                    setActiveSegmentIndex(index);
                }
            }
        }, 250);
        return () => clearInterval(interval);
    }, [segments, activeSegmentIndex, isLooping]);

    // Time Logging Interval
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (playerRef.current && onLogTime) {
            interval = setInterval(() => {
                const state = playerRef.current.getPlayerState();
                if (state === 1) { // Playing
                    onLogTime(10); // Log 10 seconds every 10 seconds
                }
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [onLogTime]);

    // Auto-scroll to active segment
    useEffect(() => {
        if (activeSegmentRef.current) {
            activeSegmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeSegmentIndex]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (!playerRef.current) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    const state = playerRef.current.getPlayerState();
                    if (state === 1) { // Playing
                        playerRef.current.pauseVideo();
                    } else {
                        playerRef.current.playVideo();
                    }
                    break;
                case 'j':
                    e.preventDefault();
                    const currentTime = playerRef.current.getCurrentTime();
                    playerRef.current.seekTo(Math.max(0, currentTime - 10), true);
                    break;
                case 'l':
                    e.preventDefault();
                    const time = playerRef.current.getCurrentTime();
                    playerRef.current.seekTo(time + 10, true);
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    if (activeSegmentIndex > 0) {
                        handleSegmentClick(segments[activeSegmentIndex - 1].start);
                    }
                    break;
                case 'arrowright':
                    e.preventDefault();
                    if (activeSegmentIndex < segments.length - 1) {
                        handleSegmentClick(segments[activeSegmentIndex + 1].start);
                    }
                    break;
                case 's':
                    e.preventDefault();
                    if (selectedWord) {
                        handleSaveWord();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [selectedWord, activeSegmentIndex, segments]);

    const handleWordClick = (word: string, event: React.MouseEvent) => {
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        setSelectedWord(cleanWord);
        setTooltipLocked(true);
        handleWordHover(word, event);
    };

    // Close tooltip on global click (background)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tooltipLocked && !(e.target as HTMLElement).closest('.translation-tooltip')) {
                setTooltipLocked(false);
                setHoverTranslation(null);
                setSelectedWord(null);
            }
        };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [tooltipLocked]);

    const handleSaveWord = async (word?: string) => {
        const wordToSave = word || selectedWord;
        if (!wordToSave) return;

        // Show lightweight loading state if needed, or just let it process

        // Context from current active segment
        const context = activeSegmentIndex !== -1 ? segments[activeSegmentIndex].text : '';

        // 1. Get Lemma (Base Form)
        // Only do this if context exists, otherwise just use the word
        let lemma = wordToSave;
        if (context) {
            try {
                // Assuming targetLanguage is tracked in state (e.g. 'de')
                lemma = await getWordLemma(wordToSave, context, targetLanguage.name);
            } catch (e) {
                console.warn("Lemmatization failed, using original", e);
            }
        }

        // 2. Find translation (for the LEMMA, not the conjugated form)
        // Try cache first for the lemma? Or just fetch fresh since lemma is new
        let translation = '';
        try {
            translation = await translateWord(lemma, targetLanguage.code, nativeLanguage.code) || '';
        } catch (e) { console.error(e); }

        const videoId = getYouTubeId(videoUrl) || 'unknown';

        onSaveWord({
            id: Math.random().toString(36).substr(2, 9),
            word: lemma, // Save the base form
            translation,
            context,
            videoId,
            timestamp: playerRef.current?.getCurrentTime() || 0,
            addedAt: new Date().toISOString(),
            status: 'learning',
            sourceTitle: currentVideoTitle,
            channelTitle: playerRef.current?.getVideoData()?.author || 'Unknown Channel'
        });

        setSelectedWord(null);
        setHoverTranslation(null);
        setTooltipLocked(false);
    };

    const handleSegmentClick = (start: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(start, true);
            playerRef.current.playVideo();
        }
    };

    const handleWordHover = async (word: string, event: React.MouseEvent) => {
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
        if (!cleanWord || cleanWord.length < 2) return;

        // Get word element bounds to center the tooltip
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const topY = rect.top;

        // Pause video on hover
        if (playerRef.current) {
            playerRef.current.pauseVideo();
        }

        // Clear any existing timeout
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }

        // Debounce: wait 200ms before fetching
        hoverTimeout.current = setTimeout(async () => {
            // Check cache first
            if (translationCache.current.has(cleanWord)) {
                setHoverTranslation({
                    word: cleanWord,
                    translation: translationCache.current.get(cleanWord)!,
                    x: centerX,
                    y: topY
                });
                return;
            }

            setIsTranslating(true);

            try {
                const translation = await translateWord(cleanWord, targetLanguage.code, nativeLanguage.code);
                if (translation) {
                    translationCache.current.set(cleanWord, translation);
                    setHoverTranslation({
                        word: cleanWord,
                        translation,
                        x: centerX,
                        y: topY
                    });
                }
            } catch (e) {
                console.error("Translation error:", e);
            } finally {
                setIsTranslating(false);
            }
        }, 200);
    };

    const handleWordLeave = () => {
        if (tooltipLocked) return;

        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
        }
        // Don't clear immediately - let user move to tooltip
        setTimeout(() => {
            if (!document.querySelector('.translation-tooltip:hover')) {
                setHoverTranslation(null);
                // Resume video when leaving (only if not locked/clicked)
                if (playerRef.current && !tooltipLocked) {
                    playerRef.current.playVideo();
                }
            }
        }, 100);
    };

    const renderInteractiveText = (text: string) => {
        return text.split(' ').map((word, i) => (
            <span
                key={i}
                onMouseEnter={(e) => { if (!tooltipLocked) handleWordHover(word, e); }}
                onMouseLeave={handleWordLeave}
                onClick={(e) => { e.stopPropagation(); handleWordClick(word, e); }}
                className={`hover:text-emerald-400 cursor-pointer transition-colors px-0.5 inline-block ${selectedWord === word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") ? 'text-emerald-400 font-bold' : ''}`}
            >
                {word}{' '}
            </span>
        ));
    };

    const renderSyncedTranscript = () => {
        if (segments.length === 0) return null;

        return (
            <div className="space-y-4">
                {segments.map((seg, idx) => {
                    const isActive = idx === activeSegmentIndex;
                    return (
                        <div
                            key={idx}
                            ref={isActive ? activeSegmentRef : null}
                            className={`p-3 rounded-lg transition-all duration-300 cursor-pointer border-l-4 ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm transform scale-[1.01]' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            onClick={() => handleSegmentClick(seg.start)}
                        >
                            <div className="flex gap-3">
                                <span className={`text-xs font-mono mt-1 ${isActive ? 'text-emerald-500 font-bold' : 'text-gray-400'}`}>
                                    {formatTime(seg.start)}
                                </span>
                                <p className={`leading-relaxed ${isActive ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {seg.text.split(' ').map((word, wIndex) => (
                                        <span
                                            key={wIndex}
                                            onClick={(e) => { e.stopPropagation(); handleWordClick(word, e); }}
                                            className={`cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded px-0.5 transition-colors ${selectedWord === word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") ? 'bg-emerald-500 text-white' : ''}`}
                                        >
                                            {word}{' '}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };



    const onPlayerReady = (event: any) => {
        playerRef.current = event.target;
        // Set initial playback speed
        if (playbackSpeed !== 1) {
            event.target.setPlaybackRate(playbackSpeed);
        }
        // Save to history
        const data = event.target.getVideoData();
        if (data && data.title) {
            setCurrentVideoTitle(data.title);
            onVideoWatched({
                id: getYouTubeId(videoUrl) || 'unknown',
                title: data.title,
                thumbnail: `https://img.youtube.com/vi/${getYouTubeId(videoUrl)}/mqdefault.jpg`,
                lastWatched: Date.now(),
                segments: segments.length > 0 ? segments : undefined
            });
        }
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        if (playerRef.current) {
            playerRef.current.setPlaybackRate(speed);
        }
    };

    return (
        <div className="space-y-6 pt-0 pb-12 animate-fade-in w-full h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <div className="flex items-center gap-4">
                    {/* Native Language Selector */}
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-400 pl-2">I speak:</span>
                        <select
                            value={nativeLanguage.code}
                            onChange={(e) => setNativeLanguage(NATIVE_LANGUAGES.find(l => l.code === e.target.value) || NATIVE_LANGUAGES[0])}
                            className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                        >
                            {NATIVE_LANGUAGES.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Extension Status */}




                    {/* Target Language */}
                    <select
                        value={targetLanguage.code}
                        onChange={(e) => setTargetLanguage(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5"
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.flag} {lang.name}
                            </option>
                        ))}
                    </select>





                </div>
            </div>

            {/* Hover Translation Tooltip */}
            {hoverTranslation && (
                <div
                    className="translation-tooltip fixed z-50 pointer-events-auto"
                    style={{
                        left: `${hoverTranslation.x}px`,
                        top: `${hoverTranslation.y - 60}px`,
                        transform: 'translate(-50%, -100%)'
                    }}
                    onMouseLeave={() => setHoverTranslation(null)}
                >
                    <div className="bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl flex flex-col items-center gap-2 animate-fade-in min-w-[140px]">
                        <div className="text-lg font-semibold text-center leading-tight">
                            {hoverTranslation.translation}
                        </div>
                        <button
                            onClick={() => handleSaveWord(hoverTranslation.word)}
                            className="bg-white/20 hover:bg-white/30 w-full py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center justify-center gap-2 mt-1"
                        >
                            <Plus size={14} />
                            Add to Vault
                        </button>
                        {/* Down Arrow */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-600 rotate-45"></div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* LEFT: Video Player */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {/* Input */}


                    {/* Player */}
                    <div className="flex-1 bg-black rounded-2xl overflow-hidden relative shadow-2xl group min-h-[400px]">
                        {videoUrl ? (
                            <>
                                <YouTube
                                    videoId={getYouTubeId(videoUrl) || ''}
                                    className="w-full h-full absolute inset-0"
                                    iframeClassName="w-full h-full absolute inset-0"
                                    onReady={onPlayerReady}
                                    opts={{
                                        height: '100%',
                                        width: '100%',
                                        playerVars: {
                                            autoplay: 1,
                                            rel: 0, // Limit related videos to same channel
                                            iv_load_policy: 3, // Disable annotations
                                            modestbranding: 1, // Minimize logo
                                            playsinline: 1,
                                        },
                                    }}
                                />

                                {/* Subtitle Overlay */}
                                {showSubtitles && activeSegmentIndex !== -1 && segments[activeSegmentIndex] && (
                                    <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none z-10 px-4">
                                        <div className="inline-block bg-black/60 px-6 py-3 rounded-lg backdrop-blur-sm pointer-events-auto transition-all hover:bg-black/70">
                                            {/* Primary Subtitle */}
                                            <p className="text-xl md:text-2xl font-medium text-white drop-shadow-md leading-relaxed">
                                                {renderInteractiveText(segments[activeSegmentIndex].text)}
                                            </p>
                                            {/* Secondary Subtitle (Dual) */}
                                            {showDualSubtitles && secondarySubtitle && (
                                                <p className="text-base md:text-lg text-yellow-300/90 mt-1 font-medium italic animate-fade-in">
                                                    {secondarySubtitle}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Controls Overlay (Bottom Right) */}
                                <div className="absolute bottom-4 right-4 flex gap-2">
                                    {/* Dual Subs Toggle */}
                                    <button
                                        onClick={() => setShowDualSubtitles(!showDualSubtitles)}
                                        className={`p-2 rounded-lg transition-colors border backdrop-blur-sm ${showDualSubtitles ? 'bg-yellow-500/80 text-white border-yellow-400' : 'bg-black/40 text-gray-300 border-white/20 hover:bg-black/60'}`}
                                        title={showDualSubtitles ? "Dual Subs Active" : "Enable Dual Subs"}
                                    >
                                        <Languages size={18} />
                                    </button>

                                    <button
                                        onClick={() => setShowSubtitles(!showSubtitles)}
                                        className={`p-2 rounded-lg transition-colors border backdrop-blur-sm ${showSubtitles ? 'bg-emerald-500/80 text-white border-emerald-400' : 'bg-black/40 text-gray-300 border-white/20 hover:bg-black/60'}`}
                                        title={showSubtitles ? "Hide Subtitles" : "Show Subtitles"}
                                    >
                                        <Captions size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center p-8 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 absolute inset-0 overflow-y-auto">


                                {recentVideos && recentVideos.length > 0 && (
                                    <div className="w-full max-w-4xl pb-12 animate-fade-in">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Recently Watched</span>
                                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                            {recentVideos.map(video => (
                                                <div className="group/card flex flex-col text-left bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-500/50 relative">
                                                    {onDeleteRecentVideo && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteRecentVideo(video.id);
                                                            }}
                                                            className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center"
                                                            title="Delete from history"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setVideoUrl(`https://www.youtube.com/watch?v=${video.id}`);
                                                            if (video.segments && video.segments.length > 0) {
                                                                setSegments(video.segments);
                                                            }
                                                        }}
                                                        className="w-full"
                                                    >
                                                        <div className="aspect-video relative overflow-hidden">
                                                            <img
                                                                src={video.thumbnail}
                                                                alt={video.title}
                                                                className="w-full h-full object-cover transition-transform group-hover/card:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Play size={32} className="text-white fill-current" />
                                                            </div>
                                                        </div>
                                                        <div className="p-3">
                                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight">
                                                                {video.title}
                                                            </h4>
                                                            <span className="text-[10px] text-gray-400 mt-2 block">
                                                                {new Date(video.lastWatched).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                </div>

                {/* RIGHT: Sidebar */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex border-b border-gray-100 dark:border-gray-700">
                        <button
                            onClick={() => setActiveSideTab('transcript')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeSideTab === 'transcript' ? 'text-emerald-600 border-emerald-600 bg-gray-50 dark:bg-gray-700/30' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Transcript
                        </button>
                        <button
                            onClick={() => setActiveSideTab('vault')}
                            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${activeSideTab === 'vault' ? 'text-emerald-600 border-emerald-600 bg-gray-50 dark:bg-gray-700/30' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                        >
                            Vocabulary
                            {(() => {
                                const currentVideoId = getYouTubeId(videoUrl) || 'unknown';
                                const count = allSavedWords.filter(w => w.videoId === currentVideoId).length;
                                return count > 0 && <span className="ml-2 bg-emerald-100 text-emerald-600 text-xs px-1.5 py-0.5 rounded-full">{count}</span>;
                            })()}
                        </button>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
                        {activeSideTab === 'transcript' && (
                            segments.length > 0 ? (
                                <div className="animate-fade-in relative">

                                    {renderSyncedTranscript()}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                    <Captions size={48} className="mb-4 opacity-20" />
                                    <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                        {errorMessage ? 'Error' : 'Transcript Empty'}
                                    </h3>
                                    <p className="text-sm max-w-[300px]">
                                        {errorMessage || 'Load a video with captions'}
                                    </p>
                                </div>
                            )
                        )}

                        {activeSideTab === 'vault' && (
                            (() => {
                                const currentVideoId = getYouTubeId(videoUrl) || 'unknown';
                                const currentVideoWords = allSavedWords.filter(w => w.videoId === currentVideoId);

                                return currentVideoWords.length > 0 ? (
                                    <div className="space-y-3">
                                        {currentVideoWords.map((word, idx) => (
                                            <div key={word.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex flex-col group hover:bg-white dark:hover:bg-gray-700 shadow-sm transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => onUpdateWordStatus(word.id, word.status === 'learning' ? 'known' : 'learning')}
                                                            className={`w-2 h-2 rounded-full ${word.status === 'known' ? 'bg-green-500' : 'bg-emerald-500'}`}
                                                            title={word.status === 'known' ? "Known" : "Learning"}
                                                        />
                                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{word.word}</span>
                                                    </div>
                                                    <button className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-red-500 p-1" onClick={() => onDeleteWord(word.id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                                {word.translation && (
                                                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium ml-4">{word.translation}</span>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const currentVideoId = getYouTubeId(videoUrl) || 'unknown';
                                                const currentVideoWords = allSavedWords.filter(w => w.videoId === currentVideoId);
                                                if (currentVideoWords.length > 0) {
                                                    setStudyWords(currentVideoWords);
                                                    setIsStudying(true);
                                                }
                                            }}
                                            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-100 dark:border-emerald-900/30"
                                        >
                                            <BookOpen size={16} />
                                            Practice all Flashcards
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                        <BookOpen size={48} className="mb-4 opacity-20" />
                                        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Current Video Vocabulary</h3>
                                        <p className="text-sm max-w-[200px]">
                                            Hover over words in the video to save them here
                                        </p>
                                    </div>
                                );
                            })()
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                        <p className="text-xs text-center text-gray-400">
                            Hover over subtitle words for instant translation
                        </p>
                    </div>
                </div>
            </div>

            {/* Flashcard Session Modal */}
            {isStudying && (
                <FlashcardSession
                    words={studyWords}
                    onClose={() => setIsStudying(false)}
                    onUpdateWordStatus={onUpdateWordStatus}
                    onUpdateMastery={onUpdateMastery}
                    title={currentVideoTitle || "Video Study Session"}
                />
            )}
        </div>
    );
};
