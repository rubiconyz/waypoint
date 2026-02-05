import React, { useState, useEffect, useRef } from 'react';
import { Play, BookOpen, Languages, Plus, Search, Youtube, Captions, Sparkles, Loader2, X, Check, FileText, Mic, Link, Compass, ExternalLink, RefreshCw, Zap, Target, TrendingUp } from 'lucide-react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { translateWord } from '../../services/translationService';
import { getWordLemma, getGrammarExplanation, getDictionaryDefinitions, getElaborateDefinition, refineTranscriptSegments, translateSentence, getContentRecommendations, ContentRecommendation } from '../../services/geminiService';
import { transcribeYouTubeVideo } from '../../services/assemblyAIService';
import { SavedWord, RecentVideo, TranscriptSegment } from '../../types';
import { FlashcardSession } from './FlashcardSession';
import { ReadingMode } from './ReadingMode';

const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
];

const NATIVE_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];



interface HoverTranslation {
    word: string;
    translation: string;
    grammar?: string;
    sentenceTranslation?: string;
    dictionary?: string;
    elaboration?: string;
    x: number;
    y: number;
    segmentIndex: number; // Track which segment the word was clicked in
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

// Helper: Extract the sentence containing a specific word from a text block
const extractSentenceWithWord = (text: string, word: string): string => {
    if (!text || !word) return text;

    // Split text into sentences (handles ., !, ?)
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());

    // If there's only one sentence or no sentences, return the original text
    if (sentences.length <= 1) return text.trim();

    // Find the sentence containing the word (case-insensitive)
    const wordLower = word.toLowerCase();
    const matchingSentence = sentences.find(sentence =>
        sentence.toLowerCase().includes(wordLower)
    );

    return matchingSentence?.trim() || text.trim();
};

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
    const [mode, setMode] = useState<'video' | 'reading'>('video');
    const [videoUrl, setVideoUrl] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionStatus, setTranscriptionStatus] = useState('');
    const [targetLanguage, setTargetLanguage] = useState(LANGUAGES[0]);
    const [nativeLanguage, setNativeLanguage] = useState(NATIVE_LANGUAGES[0]);

    const [segments, setSegments] = useState<TranscriptSegment[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);

    const [activeSideTab, setActiveSideTab] = useState<'transcript' | 'vault' | 'chat'>('transcript');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [hasExtension, setHasExtension] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLooping, setIsLooping] = useState(false);
    const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
    const [isStudying, setIsStudying] = useState(false);
    const [studyWords, setStudyWords] = useState<SavedWord[]>([]);

    const [isRefiningTranscript, setIsRefiningTranscript] = useState(false);
    const [isProRefining, setIsProRefining] = useState(false);
    const [isRefined, setIsRefined] = useState(false); // Track if refinement was successful

    // Content Recommendations State
    const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);

    // Fetch Content Recommendations
    const fetchRecommendations = async () => {
        if (allSavedWords.length < 5) return; // Need enough vocabulary data
        setIsLoadingRecs(true);
        try {
            const recs = await getContentRecommendations(allSavedWords, targetLanguage.name, recentVideos);
            setRecommendations(recs);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setIsLoadingRecs(false);
        }
    };

    // Hover Translation State
    const [hoverTranslation, setHoverTranslation] = useState<HoverTranslation | null>(null);
    const [tooltipLocked, setTooltipLocked] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isLoadingGrammar, setIsLoadingGrammar] = useState(false);
    const [isLoadingSentence, setIsLoadingSentence] = useState(false);
    const [isLoadingDictionary, setIsLoadingDictionary] = useState(false);
    const [isLoadingElaboration, setIsLoadingElaboration] = useState(false);
    const [showGrammarTab, setShowGrammarTab] = useState(false);
    const translationCache = useRef<Map<string, string>>(new Map());
    const grammarCache = useRef<Map<string, string>>(new Map());
    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    // Player & Sync State
    const playerRef = useRef<any>(null);
    const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(-1);
    const activeSegmentIndexRef = useRef<number>(-1);
    const [videoTime, setVideoTime] = useState<number>(0); // Current video playback time for word-level underline
    const activeSegmentRef = useRef<HTMLDivElement>(null);

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
            if (event.origin !== window.location.origin) return;
            if (!event.data || typeof event.data !== 'object') return;
            if (event.data.source !== 'HABIT_VISION_EXT') return;

            if (event.data.type === 'EXTENSION_READY') {
                setHasExtension(true);
                console.log("Extension detected in React!");
            } else if (event.data.type === 'EXTENSION_IMPORT_DATA') {
                console.log("Received IMPORT data from extension:", event.data.payload);
                const { videoId, rawText, segments: importedSegments } = event.data.payload || {};
                if (videoId) setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);

                if (importedSegments && importedSegments.length > 0) {
                    setSegments(importedSegments);
                } else if (rawText) {
                    setSegments([{ text: rawText, start: 0, duration: 9999 }]);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        activeSegmentIndexRef.current = activeSegmentIndex;
    }, [activeSegmentIndex]);

    // Sync Loop with segment looping support
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current && segments.length > 0) {
                const currentTime = playerRef.current.getCurrentTime();
                setVideoTime(currentTime); // Update video time for word-level underline
                const index = segments.findIndex(s => currentTime >= s.start && currentTime < (s.start + s.duration));

                const currentActive = activeSegmentIndexRef.current;
                // Loop segment if enabled
                if (isLooping && currentActive !== -1 && segments[currentActive]) {
                    const seg = segments[currentActive];
                    if (currentTime >= (seg.start + seg.duration - 0.1)) {
                        playerRef.current.seekTo(seg.start, true);
                    }
                }

                if (index !== -1 && index !== currentActive) {
                    activeSegmentIndexRef.current = index;
                    setActiveSegmentIndex(index);
                }
            }
        }, 250);
        return () => clearInterval(interval);
    }, [segments, isLooping]);

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

    const handleWordClick = (word: string, event: React.MouseEvent, segmentIdx?: number) => {
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        setSelectedWord(cleanWord);
        setTooltipLocked(true);
        handleWordHover(word, event, segmentIdx);
    };

    // Close tooltip on global click (background)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't close if clicking inside translation tooltip OR translation panel (right sidebar)
            if (tooltipLocked && !target.closest('.translation-tooltip') && !target.closest('.translation-panel')) {
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

        // Context from the segment where the word was clicked (not the active/playing segment)
        const segmentIdx = hoverTranslation?.segmentIndex ?? activeSegmentIndex;
        const currentSegment = segmentIdx !== -1 ? segments[segmentIdx] : null;
        const fullText = currentSegment?.fullSentence || currentSegment?.text || '';

        // Extract only the sentence containing the word
        const context = extractSentenceWithWord(fullText, wordToSave);

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
            channelTitle: playerRef.current?.getVideoData()?.author || 'Unknown Channel',
            mastery: 0 // New words start at mastery level 0
        });

        setSelectedWord(null);
        setHoverTranslation(null);
        setTooltipLocked(false);
    };

    // Silent save that doesn't close the panel (for mastery buttons)
    const saveWordSilently = async (cleanWord: string) => {
        // Use the segment where the word was clicked (not the active/playing segment)
        const segmentIdx = hoverTranslation?.segmentIndex ?? activeSegmentIndex;
        const currentSegment = segmentIdx !== -1 ? segments[segmentIdx] : null;
        const fullText = currentSegment?.fullSentence || currentSegment?.text || '';

        // Extract only the sentence containing the word
        const context = extractSentenceWithWord(fullText, cleanWord);
        const videoId = getYouTubeId(videoUrl || '');

        // Get lemma
        const lemma = await getWordLemma(cleanWord, context, targetLanguage.name);
        const translation = hoverTranslation?.translation || cleanWord;

        onSaveWord({
            id: Math.random().toString(36).substr(2, 9),
            word: lemma,
            translation,
            context,
            videoId: videoId || '',
            timestamp: playerRef.current?.getCurrentTime() || 0,
            addedAt: new Date().toISOString(),
            status: 'learning',
            sourceTitle: currentVideoTitle,
            channelTitle: playerRef.current?.getVideoData()?.author || 'Unknown Channel',
            mastery: 0
        });
        // Don't clear state - panel stays open
    };

    const handleSegmentClick = (start: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(start, true);
            playerRef.current.playVideo();
        }
    };

    const handleWordHover = async (word: string, event: React.MouseEvent, segmentIdx?: number) => {
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
        if (!cleanWord || cleanWord.length < 2) return;

        // Get word element bounds to center the tooltip
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        // Use provided segment index or fall back to active segment
        const effectiveSegmentIdx = segmentIdx ?? activeSegmentIndex;
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
                    y: topY,
                    segmentIndex: effectiveSegmentIdx
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
                        y: topY,
                        segmentIndex: effectiveSegmentIdx
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

        // Check if segments have speaker data (refined)
        const hasRefinedData = segments.some(s => s.speaker);

        if (!hasRefinedData) {
            // Fallback: original timestamped view for unrefined transcripts
            return (
                <div className="space-y-4">
                    {segments.map((seg, idx) => {
                        const isActive = idx === activeSegmentIndex;
                        return (
                            <div
                                key={idx}
                                ref={isActive ? activeSegmentRef : null}
                                className={`p-3 rounded-lg transition-all duration-300 cursor-pointer border-l-4 ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                onClick={() => handleSegmentClick(seg.start)}
                            >
                                <div className="flex gap-3">
                                    <span className={`text-xs font-mono mt-1 ${isActive ? 'text-emerald-500 font-bold' : 'text-gray-400'}`}>
                                        {formatTime(seg.start)}
                                    </span>
                                    <p className={`leading-relaxed ${isActive ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {seg.words && seg.words.length > 0
                                            ? seg.words.map((wordObj, wIndex) => {
                                                const isWordActive = videoTime >= wordObj.start && videoTime < wordObj.end;
                                                return (
                                                    <span
                                                        key={wIndex}
                                                        onClick={(e) => { e.stopPropagation(); handleWordClick(wordObj.text, e, idx); }}
                                                        className={`cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded px-0.5 transition-colors ${isWordActive ? 'underline decoration-emerald-400 decoration-2 underline-offset-2 font-bold' : ''} ${selectedWord === wordObj.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") ? 'bg-emerald-500 text-white' : ''}`}
                                                    >
                                                        {wordObj.text}{' '}
                                                    </span>
                                                );
                                            })
                                            : seg.text.split(' ').map((word, wIndex) => (
                                                <span
                                                    key={wIndex}
                                                    onClick={(e) => { e.stopPropagation(); handleWordClick(word, e, idx); }}
                                                    className={`cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-800 rounded px-0.5 transition-colors ${isActive ? 'underline decoration-emerald-400 decoration-2 underline-offset-2' : ''} ${selectedWord === word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") ? 'bg-emerald-500 text-white' : ''}`}
                                                >
                                                    {word}{' '}
                                                </span>
                                            ))
                                        }
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Dialogue view: Group segments by speaker
        const speakerColors: Record<string, { bg: string; border: string; dot: string }> = {
            'Speaker 1': { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-400', dot: 'bg-blue-500' },
            'Speaker 2': { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-400', dot: 'bg-purple-500' },
            'Speaker 3': { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-400', dot: 'bg-green-500' },
            'Speaker 4': { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-400', dot: 'bg-orange-500' },
        };
        const defaultColor = { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-400', dot: 'bg-gray-500' };

        // Group consecutive segments by speaker
        type SpeakerBlock = { speaker: string; segments: { seg: typeof segments[0]; idx: number }[] };
        const blocks: SpeakerBlock[] = [];
        let currentBlock: SpeakerBlock | null = null;

        segments.forEach((seg, idx) => {
            const speaker = seg.speaker || 'Speaker 1';
            if (!currentBlock || currentBlock.speaker !== speaker) {
                currentBlock = { speaker, segments: [] };
                blocks.push(currentBlock);
            }
            currentBlock.segments.push({ seg, idx });
        });

        return (
            <div className="space-y-4">
                {blocks.map((block, blockIdx) => {
                    const colors = speakerColors[block.speaker] || defaultColor;
                    const isBlockActive = block.segments.some(s => s.idx === activeSegmentIndex);
                    const firstSegment = block.segments[0];

                    return (
                        <div
                            key={blockIdx}
                            ref={isBlockActive ? activeSegmentRef : null}
                            className={`p-4 rounded-xl border-l-4 transition-all ${colors.bg} ${colors.border} ${isBlockActive ? 'shadow-md ring-2 ring-emerald-400/50' : ''}`}
                        >
                            {/* Speaker Header */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{block.speaker}</span>
                            </div>
                            {/* Merged Text */}
                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                {block.segments.map(({ seg, idx }) => {
                                    const isSegmentActive = idx === activeSegmentIndex;

                                    // Split text into sentences for sentence-level highlighting
                                    const text = seg.fullSentence || seg.text;
                                    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());

                                    // Estimate which sentence is active based on timing
                                    let activeSentenceIndex = -1;
                                    if (isSegmentActive && sentences.length > 1) {
                                        const segmentProgress = (videoTime - seg.start) / seg.duration;
                                        activeSentenceIndex = Math.min(
                                            Math.floor(segmentProgress * sentences.length),
                                            sentences.length - 1
                                        );
                                    } else if (isSegmentActive) {
                                        activeSentenceIndex = 0;
                                    }

                                    return (
                                        <span
                                            key={idx}
                                            onClick={() => handleSegmentClick(seg.start)}
                                            className="cursor-pointer"
                                        >
                                            {seg.words && seg.words.length > 0
                                                ? seg.words.map((wordObj, wIndex) => {
                                                    const isWordActive = videoTime >= wordObj.start && videoTime < wordObj.end;
                                                    return (
                                                        <span
                                                            key={`${idx}-${wIndex}`}
                                                            onClick={(e) => { e.stopPropagation(); handleWordClick(wordObj.text, e, idx); }}
                                                            className={`hover:bg-emerald-200 dark:hover:bg-emerald-700/50 rounded px-0.5 transition-colors ${isWordActive ? 'bg-emerald-400 dark:bg-emerald-500 text-white font-bold rounded' : ''} ${selectedWord === wordObj.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") ? 'bg-emerald-500 text-white' : ''}`}
                                                        >
                                                            {wordObj.text}{' '}
                                                        </span>
                                                    );
                                                })
                                                : sentences.map((sentence, sIndex) => {
                                                    const isSentenceActive = sIndex === activeSentenceIndex;
                                                    return (
                                                        <span
                                                            key={`${idx}-s${sIndex}`}
                                                            className={`transition-all ${isSentenceActive ? 'bg-emerald-100 dark:bg-emerald-900/40 rounded px-0.5' : ''}`}
                                                        >
                                                            {sentence.split(' ').map((word, wIndex) => (
                                                                <span
                                                                    key={`${idx}-${sIndex}-${wIndex}`}
                                                                    onClick={(e) => { e.stopPropagation(); handleWordClick(word, e, idx); }}
                                                                    className={`hover:bg-emerald-200 dark:hover:bg-emerald-700/50 rounded px-0.5 transition-colors ${selectedWord === word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") ? 'bg-emerald-500 text-white' : ''}`}
                                                                >
                                                                    {word}{' '}
                                                                </span>
                                                            ))}
                                                        </span>
                                                    );
                                                })
                                            }{' '}
                                        </span>
                                    );
                                })}
                            </p>
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

    const handleRefineTranscript = async () => {
        if (segments.length === 0) return;

        setIsRefiningTranscript(true);
        setErrorMessage(''); // Clear previous errors
        try {
            const refined = await refineTranscriptSegments(segments, targetLanguage.name);
            setSegments(refined);
            setIsRefined(true);

            // Auto-hide success state after 3 seconds
            setTimeout(() => setIsRefined(false), 3000);
        } catch (error) {
            console.error("Failed to refine transcript:", error);
            setErrorMessage("Failed to refine transcript. Please try again.");
            setTimeout(() => setErrorMessage(''), 3000);
        } finally {
            setIsRefiningTranscript(false);
        }
    };

    const handleProRefine = async () => {
        if (!videoUrl) return;
        const videoId = getYouTubeId(videoUrl);
        if (!videoId) return;

        setIsProRefining(true);
        setErrorMessage('');
        try {
            const refined = await transcribeYouTubeVideo(videoId, targetLanguage.code);
            setSegments(refined);
            setIsRefined(true);
            setTimeout(() => setIsRefined(false), 3000);
        } catch (error: any) {
            console.error("Pro refinement failed:", error);
            setErrorMessage("Pro refinement failed (Check API Key/Audio).");
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setIsProRefining(false);
        }
    };

    // NEW: Direct load video with AssemblyAI transcription
    const handleLoadVideo = async () => {
        const videoId = getYouTubeId(inputUrl);
        if (!videoId) {
            setErrorMessage('Please enter a valid YouTube URL');
            setTimeout(() => setErrorMessage(''), 3000);
            return;
        }

        setVideoUrl(inputUrl);
        setSegments([]);
        setIsTranscribing(true);
        setTranscriptionStatus('Checking cache...');
        setErrorMessage('');

        const cacheKey = `transcript_cache_${videoId}_${targetLanguage.code}`;

        try {
            // 1. Check Cache
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                console.log("Loading transcript from cache:", cacheKey);
                const parsedSegments = JSON.parse(cachedData);
                setSegments(parsedSegments);
                setTranscriptionStatus('Loaded from cache!');
                setIsRefined(true);
                setTimeout(() => setIsRefined(false), 2000); // Shorter duration for cache load
                if (playerRef.current) {
                    playerRef.current.playVideo();
                }
                setIsTranscribing(false);
                return;
            }

            // 2. Transcribe if not cached
            setTranscriptionStatus('Extracting audio from YouTube...');
            setTranscriptionStatus('Transcribing with AI (this may take 1-2 minutes)...');
            const transcribed = await transcribeYouTubeVideo(videoId, targetLanguage.code);

            // 3. Save to Cache
            try {
                localStorage.setItem(cacheKey, JSON.stringify(transcribed));
                console.log("Saved transcript to cache:", cacheKey);
            } catch (e) {
                console.warn("Failed to save to localStorage (quota exceeded?):", e);
            }

            setSegments(transcribed);
            setTranscriptionStatus('');
            setIsRefined(true);
            setTimeout(() => setIsRefined(false), 3000);

            // Auto-play video now that transcript is ready
            if (playerRef.current) {
                playerRef.current.playVideo();
            }
        } catch (error: any) {
            console.error('Transcription failed:', error);
            setErrorMessage(error.message || 'Transcription failed. Please try again.');
            setTranscriptionStatus('');
        } finally {
            setIsTranscribing(false);
        }
    };

    return (
        <div className="space-y-6 pt-0 pb-12 animate-fade-in w-full h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Mode Toggle */}
                {/* Mode Toggle - Only show when no video is loaded */}
                {!videoUrl && (
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setMode('video')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'video'
                                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <Youtube size={18} />
                            Video
                        </button>
                        <button
                            onClick={() => setMode('reading')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'reading'
                                ? 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <FileText size={18} />
                            Reading
                        </button>
                    </div>
                )}

                {/* Language selectors - only show when no video loaded */}
                {!videoUrl && (
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
                )}

                {/* Back Button - Show in header when video is loaded */}
                {videoUrl && (
                    <button
                        onClick={() => {
                            setVideoUrl('');
                            setSegments([]);
                            setInputUrl('');
                        }}
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium border border-gray-200 dark:border-gray-700"
                    >
                        ← Back
                    </button>
                )}
            </div>

            <div className={`grid gap-6 h-[calc(100vh-200px)] min-h-[600px] ${videoUrl ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {mode === 'video' ? (
                    <>
                        {/* LEFT: Video + Transcript */}
                        <div className={`flex flex-col gap-4 overflow-hidden ${videoUrl ? 'lg:col-span-2' : ''}`}>
                            {/* Video URL Input - Only show when no video is loaded */}
                            {!videoUrl && (
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Link size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={inputUrl}
                                                onChange={(e) => setInputUrl(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !isTranscribing && handleLoadVideo()}
                                                placeholder="Paste YouTube URL here..."
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={handleLoadVideo}
                                            disabled={isTranscribing || !inputUrl.trim()}
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {isTranscribing ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Transcribing...
                                                </>
                                            ) : (
                                                <>
                                                    <Mic size={18} />
                                                    Load & Transcribe
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {/* Status Message */}
                                    {transcriptionStatus && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 animate-pulse">
                                            <Loader2 size={14} className="animate-spin" />
                                            {transcriptionStatus}
                                        </div>
                                    )}
                                    {errorMessage && (
                                        <div className="mt-3 text-sm text-red-500 dark:text-red-400">
                                            {errorMessage}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Video Player */}
                            {videoUrl && (
                                <div className="bg-black rounded-2xl overflow-hidden relative shadow-xl flex-shrink-0 h-[280px] w-full">

                                    <YouTube
                                        videoId={getYouTubeId(videoUrl) || ''}
                                        className="w-full h-full absolute inset-0"
                                        iframeClassName="w-full h-full absolute inset-0"
                                        onReady={onPlayerReady}
                                        opts={{
                                            height: '100%',
                                            width: '100%',
                                            playerVars: {
                                                autoplay: 0,
                                                rel: 0,
                                                iv_load_policy: 3,
                                                modestbranding: 1,
                                                playsinline: 1,
                                            },
                                        }}
                                    />

                                    {/* Loading Overlay - Block video until transcript is ready */}
                                    {((isTranscribing || segments.length === 0) && !errorMessage) && (
                                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 backdrop-blur-sm px-6 text-center">
                                            <Loader2 size={40} className="text-emerald-400 animate-spin mb-4" />
                                            <p className="text-white font-medium text-lg">
                                                {transcriptionStatus || 'Loading transcript...'}
                                            </p>
                                            <p className="text-gray-400 text-sm mt-2">
                                                {transcriptionStatus.includes('AI') ? 'This usually takes 1-2 minutes' : 'Please wait...'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Error Overlay */}
                                    {errorMessage && segments.length === 0 && (
                                        <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center z-30 backdrop-blur-sm px-6 text-center">
                                            <div className="bg-red-500/20 p-4 rounded-full mb-4">
                                                <X size={32} className="text-red-200" />
                                            </div>
                                            <p className="text-white font-medium text-lg mb-2">
                                                Transcription Failed
                                            </p>
                                            <p className="text-red-200 text-sm mb-6 max-w-md">
                                                {errorMessage}
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setVideoUrl('');
                                                    setErrorMessage('');
                                                    setInputUrl('');
                                                }}
                                                className="bg-white text-red-900 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                                            >
                                                Try Another Video
                                            </button>
                                        </div>
                                    )}



                                </div>
                            )}

                            {/* Transcript Panel - Only show when video is loaded */}
                            {videoUrl && (
                                <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col min-h-0">

                                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-0">
                                        {segments.length > 0 ? (
                                            <div className="animate-fade-in">
                                                {renderSyncedTranscript()}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                                <Captions size={48} className="mb-4 opacity-20" />
                                                <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                                    {errorMessage ? 'Error' : 'Loading...'}
                                                </h3>
                                                <p className="text-sm max-w-[300px]">
                                                    {errorMessage || 'Transcript is being loaded'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* AI Content Recommendations - Only show when no video and has vocab */}
                            {!videoUrl && allSavedWords.length >= 5 && (
                                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm p-6 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Compass size={18} className="text-emerald-500" />
                                            <span className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-200">Recommended For You</span>
                                        </div>
                                        <button
                                            onClick={fetchRecommendations}
                                            disabled={isLoadingRecs}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-50"
                                        >
                                            <RefreshCw size={14} className={isLoadingRecs ? 'animate-spin' : ''} />
                                            {isLoadingRecs ? 'Finding...' : (recommendations.length > 0 ? 'Refresh' : 'Get Ideas')}
                                        </button>
                                    </div>

                                    {isLoadingRecs && (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                                                <Loader2 className="animate-spin" size={20} />
                                                <span className="font-medium">AI is finding videos for your level...</span>
                                            </div>
                                        </div>
                                    )}

                                    {!isLoadingRecs && recommendations.length === 0 && (
                                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                            <Compass size={32} className="mx-auto mb-2 text-emerald-400/50" />
                                            <p>Click "Get Ideas" to discover content matched to your vocabulary</p>
                                        </div>
                                    )}

                                    {!isLoadingRecs && recommendations.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {recommendations.map((rec, i) => {
                                                const difficultyConfig = {
                                                    easier: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: <Zap size={12} /> },
                                                    right: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: <Target size={12} /> },
                                                    challenging: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: <TrendingUp size={12} /> }
                                                };
                                                const config = difficultyConfig[rec.difficulty] || difficultyConfig.right;

                                                return (
                                                    <a
                                                        key={i}
                                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(rec.searchQuery)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all"
                                                    >
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                                                {rec.title}
                                                            </h4>
                                                            <ExternalLink size={14} className="text-gray-400 group-hover:text-emerald-500 shrink-0 mt-1" />
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{rec.reason}</p>
                                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                                                            {config.icon}
                                                            {rec.difficulty === 'easier' ? 'Review' : rec.difficulty === 'right' ? 'Your Level' : 'Challenge'}
                                                        </div>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Recently Watched - Only show when no video */}
                            {!videoUrl && recentVideos && recentVideos.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Play size={18} className="text-emerald-500" />
                                        <span className="text-sm font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">Recently Watched</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {recentVideos.slice(0, 8).map(video => (
                                            <div key={video.id} className="group/card relative">
                                                {onDeleteRecentVideo && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteRecentVideo(video.id);
                                                        }}
                                                        className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-red-500/90 hover:bg-red-600 text-white opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center"
                                                        title="Delete"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        // Use inputUrl to trigger handleLoadVideo which checks cache
                                                        const url = `https://www.youtube.com/watch?v=${video.id}`;
                                                        setInputUrl(url);

                                                        // Check localStorage cache first
                                                        const cacheKey = `transcript_cache_${video.id}_${targetLanguage.code}`;
                                                        const cachedData = localStorage.getItem(cacheKey);

                                                        if (cachedData) {
                                                            // Load from cache immediately
                                                            console.log("Loading from cache:", cacheKey);
                                                            setVideoUrl(url);
                                                            setSegments(JSON.parse(cachedData));
                                                        } else if (video.segments && video.segments.length > 0) {
                                                            // Fallback to video.segments if available
                                                            setVideoUrl(url);
                                                            setSegments(video.segments);
                                                        } else {
                                                            // No cache, trigger full transcription
                                                            setInputUrl(url);
                                                            setTimeout(() => {
                                                                const btn = document.querySelector('[data-load-btn]') as HTMLButtonElement;
                                                                if (btn) btn.click();
                                                            }, 100);
                                                        }
                                                    }}
                                                    className="w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:ring-2 hover:ring-emerald-400 transition-all"
                                                >
                                                    <img
                                                        src={video.thumbnail}
                                                        alt={video.title}
                                                        className="w-full aspect-video object-cover"
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* RIGHT: Translation Panel - Only show when video is loaded */}
                        {videoUrl && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                                {/* Header */}
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Languages size={16} className="text-blue-500" />
                                            <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Translation</span>
                                        </div>
                                        {/* Word count badge */}
                                        {(() => {
                                            const currentVideoId = getYouTubeId(videoUrl) || 'unknown';
                                            const count = allSavedWords.filter(w => w.videoId === currentVideoId).length;
                                            return count > 0 && (
                                                <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                                    {count} words saved
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Selected Word Display */}
                                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar translation-panel">
                                    {selectedWord && hoverTranslation ? (
                                        <div className="animate-fade-in">
                                            {/* Word Header */}
                                            <div className="text-center mb-6">
                                                <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                                    {hoverTranslation.word}
                                                </h2>
                                                {isTranslating ? (
                                                    <div className="flex items-center justify-center gap-2 text-gray-400">
                                                        <Loader2 size={16} className="animate-spin" />
                                                        <span>loading</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-xl text-gray-600 dark:text-gray-300">
                                                        {hoverTranslation.translation}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Mastery Levels */}
                                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                                {[
                                                    { name: 'New', color: 'bg-gray-500', status: 'new' },
                                                    { name: 'Learning', color: 'bg-blue-500', status: 'learning' },
                                                    { name: 'Familiar', color: 'bg-amber-500', status: 'familiar' },
                                                    { name: 'Known', color: 'bg-green-500', status: 'known' }
                                                ].map((level) => {
                                                    const savedWord = allSavedWords.find(w => w.word === hoverTranslation?.word);
                                                    const isSelected = savedWord?.status === level.status;
                                                    return (
                                                        <button
                                                            key={level.name}
                                                            onClick={() => {
                                                                if (hoverTranslation) {
                                                                    const existing = allSavedWords.find(w => w.word === hoverTranslation.word);
                                                                    if (existing) {
                                                                        onUpdateWordStatus(existing.id, level.status as 'learning' | 'known');
                                                                    } else {
                                                                        saveWordSilently(hoverTranslation.word);
                                                                    }
                                                                }
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isSelected
                                                                ? `${level.color} text-white`
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                                }`}
                                                        >
                                                            {level.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-2 mb-6">
                                                <button
                                                    onClick={async () => {
                                                        if (hoverTranslation && !hoverTranslation.sentenceTranslation) {
                                                            const currentSegment = activeSegmentIndex !== -1 ? segments[activeSegmentIndex] : null;
                                                            const fullText = currentSegment?.fullSentence || currentSegment?.text || '';

                                                            // Extract only the sentence containing the clicked word
                                                            let sentence = fullText;
                                                            if (fullText && hoverTranslation.word) {
                                                                // Split by sentence-ending punctuation
                                                                const sentences = fullText.split(/(?<=[.!?])\s+/);
                                                                // Find the sentence containing the word
                                                                const matchingSentence = sentences.find(s =>
                                                                    s.toLowerCase().includes(hoverTranslation.word.toLowerCase())
                                                                );
                                                                if (matchingSentence) {
                                                                    sentence = matchingSentence.trim();
                                                                }
                                                            }

                                                            if (sentence) {
                                                                setIsLoadingSentence(true);
                                                                try {
                                                                    const translation = await translateSentence(sentence, targetLanguage.name, nativeLanguage.name);
                                                                    setHoverTranslation({ ...hoverTranslation, sentenceTranslation: translation || 'Unable to translate sentence.' });
                                                                } catch (e: any) {
                                                                    console.error(e);
                                                                    setHoverTranslation({ ...hoverTranslation, sentenceTranslation: `Error: ${e.message || 'Unknown error'}` });
                                                                } finally {
                                                                    setIsLoadingSentence(false);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    disabled={isLoadingSentence}
                                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${hoverTranslation?.sentenceTranslation ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                                >
                                                    {isLoadingSentence ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                                                    {isLoadingSentence ? 'Translating...' : hoverTranslation?.sentenceTranslation ? '✓ Translated' : 'Translate Sentence'}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (!hoverTranslation.grammar && !grammarCache.current.has(hoverTranslation.word)) {
                                                            setIsLoadingGrammar(true);
                                                            const currentSegment = activeSegmentIndex !== -1 ? segments[activeSegmentIndex] : null;
                                                            const context = currentSegment?.fullSentence || currentSegment?.text || '';
                                                            try {
                                                                const grammar = await getGrammarExplanation(
                                                                    hoverTranslation.word,
                                                                    context,
                                                                    targetLanguage.name,
                                                                    nativeLanguage.name
                                                                );
                                                                const result = grammar || 'Unable to analyze grammar.';
                                                                grammarCache.current.set(hoverTranslation.word, result);
                                                                setHoverTranslation({ ...hoverTranslation, grammar: result });
                                                            } catch (e: any) {
                                                                console.error(e);
                                                                setHoverTranslation({ ...hoverTranslation, grammar: `Error: ${e.message || 'Unknown error'}` });
                                                            } finally {
                                                                setIsLoadingGrammar(false);
                                                            }
                                                        } else if (grammarCache.current.has(hoverTranslation.word)) {
                                                            setHoverTranslation({ ...hoverTranslation, grammar: grammarCache.current.get(hoverTranslation.word) });
                                                        }
                                                    }}
                                                    disabled={isLoadingGrammar}
                                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${hoverTranslation?.grammar ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                                >
                                                    {isLoadingGrammar ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                    {isLoadingGrammar ? 'Analyzing...' : hoverTranslation?.grammar ? '✓ Grammar' : 'Break down grammar'}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (hoverTranslation && !hoverTranslation.dictionary) {
                                                            setIsLoadingDictionary(true);
                                                            try {
                                                                const dictionary = await getDictionaryDefinitions(
                                                                    hoverTranslation.word,
                                                                    targetLanguage.name,
                                                                    nativeLanguage.name
                                                                );
                                                                setHoverTranslation({ ...hoverTranslation, dictionary: dictionary || 'No definitions found.' });
                                                            } catch (e: any) {
                                                                console.error(e);
                                                                setHoverTranslation({ ...hoverTranslation, dictionary: `Error: ${e.message || 'Unknown error'}` });
                                                            } finally {
                                                                setIsLoadingDictionary(false);
                                                            }
                                                        }
                                                    }}
                                                    disabled={isLoadingDictionary}
                                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${hoverTranslation?.dictionary ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                                >
                                                    {isLoadingDictionary ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
                                                    {isLoadingDictionary ? 'Loading...' : hoverTranslation?.dictionary ? '✓ Dictionary' : 'Dictionary Definitions'}
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (hoverTranslation && !hoverTranslation.elaboration) {
                                                            setIsLoadingElaboration(true);
                                                            const currentSegment = activeSegmentIndex !== -1 ? segments[activeSegmentIndex] : null;
                                                            const context = currentSegment?.fullSentence || currentSegment?.text || '';
                                                            try {
                                                                const elaboration = await getElaborateDefinition(
                                                                    hoverTranslation.word,
                                                                    context,
                                                                    targetLanguage.name,
                                                                    nativeLanguage.name
                                                                );
                                                                setHoverTranslation({ ...hoverTranslation, elaboration: elaboration || 'No detailed explanation available.' });
                                                            } catch (e: any) {
                                                                console.error(e);
                                                                setHoverTranslation({ ...hoverTranslation, elaboration: `Error: ${e.message || 'Unknown error'}` });
                                                            } finally {
                                                                setIsLoadingElaboration(false);
                                                            }
                                                        }
                                                    }}
                                                    disabled={isLoadingElaboration}
                                                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${hoverTranslation?.elaboration ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                                >
                                                    {isLoadingElaboration ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                                    {isLoadingElaboration ? 'Loading...' : hoverTranslation?.elaboration ? '✓ Elaboration' : 'Elaborate Definition'}
                                                </button>
                                            </div>

                                            {/* Sentence Translation */}
                                            {(isLoadingSentence || hoverTranslation.sentenceTranslation) && (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800 mb-4">
                                                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">Sentence Translation</h4>
                                                    {isLoadingSentence && !hoverTranslation.sentenceTranslation ? (
                                                        <div className="flex items-center justify-center gap-2 text-emerald-500">
                                                            <Loader2 size={16} className="animate-spin" />
                                                            <span className="text-sm">Translating...</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                                            "{hoverTranslation.sentenceTranslation}"
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Grammar Explanation */}
                                            {(isLoadingGrammar || hoverTranslation.grammar) && (
                                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800 mb-4">
                                                    <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase mb-2">Grammar</h4>
                                                    {isLoadingGrammar && !hoverTranslation.grammar ? (
                                                        <div className="flex items-center justify-center gap-2 text-purple-500">
                                                            <Loader2 size={16} className="animate-spin" />
                                                            <span className="text-sm">Analyzing...</span>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {hoverTranslation.grammar}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Dictionary Definitions */}
                                            {hoverTranslation.dictionary && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800 mb-4">
                                                    <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Dictionary</h4>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                        {hoverTranslation.dictionary}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Elaborate Definition */}
                                            {hoverTranslation.elaboration && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800 mb-4">
                                                    <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-2">Detailed Explanation</h4>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                        {hoverTranslation.elaboration}
                                                    </p>
                                                </div>
                                            )}

                                            {/* AI Chat Input */}
                                            <div className="mt-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                                <p className="text-xs text-gray-400 mb-2">
                                                    Welcome! Click one of the quick actions above, or enter a custom request!
                                                </p>
                                            </div>

                                            {/* Save Button */}
                                            <button
                                                onClick={() => handleSaveWord(hoverTranslation.word)}
                                                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
                                            >
                                                <Plus size={18} />
                                                Add to Vocabulary
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                            <Languages size={48} className="mb-4 opacity-20" />
                                            <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                                Click a Word
                                            </h3>
                                            <p className="text-sm max-w-[200px]">
                                                Click any word in the transcript or subtitles to see its translation here
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                                    <p className="text-xs text-center text-gray-400">
                                        Click words for instant translation & grammar
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="lg:col-span-3">
                        {/* Reading Mode */}
                        <ReadingMode
                            targetLanguage={targetLanguage}
                            nativeLanguage={nativeLanguage}
                            onSaveWord={onSaveWord}
                            allSavedWords={allSavedWords}
                        />
                    </div>
                )}
            </div>
            {/* Flashcard Session Modal */}
            {
                isStudying && (
                    <FlashcardSession
                        words={studyWords}
                        onClose={() => setIsStudying(false)}
                        onUpdateWordStatus={onUpdateWordStatus}
                        onUpdateMastery={onUpdateMastery}
                        title={currentVideoTitle || "Video Study Session"}
                    />
                )
            }
        </div >
    );
};
