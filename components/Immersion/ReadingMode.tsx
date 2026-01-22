import React, { useState, useRef } from 'react';
import { BookOpen, Upload, Play, Sparkles, Loader2, Plus, Languages, BookMarked, MessageSquare, GraduationCap, X, Library, ChevronRight, Newspaper, RefreshCw, Wand2, ArrowRight } from 'lucide-react';
import { translateWord } from '../../services/translationService';
import { getWordLemma, getGrammarExplanation, getDictionaryDefinitions, getElaborateDefinition, translateSentence, rewriteArticleForCEFR, extractVocabulary, generateComprehensionQuestions } from '../../services/geminiService';
import { fetchNewsHeadlines } from '../../services/newsClient';
import { SavedWord, NewsArticle, RewrittenArticle } from '../../types';
import { getContentForLanguage, filterByLevel, LEVEL_INFO, GradedPassage } from '../../data/gradedContent';

interface ReadingModeProps {
    targetLanguage: { code: string; name: string };
    nativeLanguage: { code: string; name: string };
    onSaveWord: (word: SavedWord) => void;
    allSavedWords: SavedWord[];
}

interface HoverTranslation {
    word: string;
    translation: string;
    sentence: string;
    sentenceTranslation?: string;
    grammar?: string;
    dictionary?: string;
    elaboration?: string;
}

type LevelFilter = 'all' | 'A1' | 'A2' | 'B1' | 'B2';

export const ReadingMode: React.FC<ReadingModeProps> = ({
    targetLanguage,
    nativeLanguage,
    onSaveWord,
    allSavedWords
}) => {
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [text, setText] = useState('');
    const [articleTitle, setArticleTitle] = useState('');
    const [isEditing, setIsEditing] = useState(true);
    const [activeSection, setActiveSection] = useState<'library' | 'news' | 'import'>('library');
    const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');

    // News State
    const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
    const [isLoadingNews, setIsLoadingNews] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    const [rewrittenArticle, setRewrittenArticle] = useState<RewrittenArticle | null>(null);
    const [targetCEFR, setTargetCEFR] = useState<'A2' | 'B1' | 'B2'>('B1');

    // Translation State
    const [selectedWord, setSelectedWord] = useState<string | null>(null);
    const [hoverTranslation, setHoverTranslation] = useState<HoverTranslation | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isLoadingSentence, setIsLoadingSentence] = useState(false);
    const [isLoadingGrammar, setIsLoadingGrammar] = useState(false);
    const [isLoadingDictionary, setIsLoadingDictionary] = useState(false);
    const [isLoadingElaboration, setIsLoadingElaboration] = useState(false);

    const translationCache = useRef<Map<string, string>>(new Map());

    // Get library content for current language
    const libraryContent = getContentForLanguage(targetLanguage.code);
    const filteredContent = filterByLevel(libraryContent, selectedLevel);

    // Fetch news when entering news section
    React.useEffect(() => {
        if (activeSection === 'news' && newsArticles.length === 0) {
            loadNews();
        }
    }, [activeSection, targetLanguage.code]);

    const loadNews = async () => {
        setIsLoadingNews(true);
        const articles = await fetchNewsHeadlines(targetLanguage.code);
        setNewsArticles(articles);
        setIsLoadingNews(false);
    };

    const handleSelectNewsArticle = async (article: NewsArticle, level: 'A2' | 'B1' | 'B2') => {
        setIsRewriting(true);
        setTargetCEFR(level);

        try {
            // Parallel execution for speed
            const [rewrittenText, vocabulary, questions] = await Promise.all([
                rewriteArticleForCEFR(article.excerpt, level, targetLanguage.name, article.title),
                extractVocabulary(article.excerpt, targetLanguage.name, nativeLanguage.name),
                generateComprehensionQuestions(article.excerpt, targetLanguage.name, nativeLanguage.name)
            ]);

            const newContent: RewrittenArticle = {
                originalTitle: article.title,
                originalSource: article.source,
                originalUrl: article.sourceUrl,
                cefrLevel: level,
                content: rewrittenText,
                vocabulary: vocabulary.map(v => ({ ...v, cefrLevel: v.level })),
                questions
            };

            setRewrittenArticle(newContent);
            setText(rewrittenText);
            setArticleTitle(article.title);
            setIsEditing(false); // Go to reading mode
        } catch (error) {
            console.error("Error creating lesson:", error);
            // Fallback
            setText(article.excerpt);
            setArticleTitle(article.title);
        } finally {
            setIsRewriting(false);
        }
    };

    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            setText(clipboardText);
            setActiveSection('import');
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const handleLoadPassage = (passage: GradedPassage) => {
        setText(passage.content);
        setArticleTitle(passage.title);
        setActiveSection('library'); // effectively hiding it, but keeping track
        setIsEditing(false);
    };

    // Get the sentence containing a word
    const getSentenceForWord = (word: string): string => {
        const sentences = text.split(/(?<=[.!?])\s+/);
        const found = sentences.find(s => s.toLowerCase().includes(word.toLowerCase()));
        return found?.trim() || '';
    };

    const handleWordClick = async (word: string) => {
        const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
        if (!cleanWord || cleanWord.length < 2) return;

        setSelectedWord(cleanWord);
        setIsTranslating(true);

        const sentence = getSentenceForWord(cleanWord);

        try {
            // Check cache first
            let translation = translationCache.current.get(cleanWord);
            if (!translation) {
                translation = await translateWord(cleanWord, targetLanguage.code, nativeLanguage.code) || cleanWord;
                translationCache.current.set(cleanWord, translation);
            }

            setHoverTranslation({
                word: cleanWord,
                translation,
                sentence
            });
        } catch (e) {
            console.error("Translation error:", e);
            setHoverTranslation({
                word: cleanWord,
                translation: 'Translation failed',
                sentence
            });
        } finally {
            setIsTranslating(false);
        }
    };

    const handleSaveWord = async () => {
        if (!hoverTranslation) return;

        // Get lemma
        let lemma = hoverTranslation.word;
        try {
            lemma = await getWordLemma(hoverTranslation.word, hoverTranslation.sentence, targetLanguage.name);
        } catch (e) {
            console.warn("Lemmatization failed:", e);
        }

        onSaveWord({
            id: Math.random().toString(36).substr(2, 9),
            word: lemma,
            translation: hoverTranslation.translation,
            context: hoverTranslation.sentence || `From: ${articleTitle || 'Reading Mode'}`,
            videoId: 'reading-mode',
            timestamp: 0,
            addedAt: new Date().toISOString(),
            status: 'learning',
            sourceTitle: articleTitle || 'Reading Mode',
            channelTitle: 'Imported Text',
            mastery: 0
        });

        setSelectedWord(null);
        setHoverTranslation(null);
    };

    const renderInteractiveText = () => {
        const paragraphs = text.split('\n\n');

        return paragraphs.map((paragraph, pIdx) => (
            <p key={pIdx} className="mb-4 leading-relaxed">
                {paragraph.split(' ').map((word, wIdx) => {
                    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").toLowerCase();
                    const isKnown = allSavedWords.some(w => w.word.toLowerCase() === cleanWord && (w.mastery || 0) >= 4);
                    const isLearning = allSavedWords.some(w => w.word.toLowerCase() === cleanWord && (w.mastery || 0) < 4);
                    const isSelected = selectedWord === cleanWord;

                    return (
                        <span
                            key={`${pIdx}-${wIdx}`}
                            onClick={() => handleWordClick(word)}
                            className={`
                                cursor-pointer transition-colors px-0.5 rounded
                                hover:bg-emerald-200 dark:hover:bg-emerald-800
                                ${isKnown ? 'text-green-600 dark:text-green-400' : ''}
                                ${isLearning ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : ''}
                                ${isSelected ? 'bg-emerald-500 text-white' : ''}
                            `}
                        >
                            {word}{' '}
                        </span>
                    );
                })}
            </p>
        ));
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'A1': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
            case 'A2': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
            case 'B1': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
            case 'B2': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };


    const renderNewsSection = () => {
        if (isLoadingNews) {
            return (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="text-emerald-500 animate-spin mb-4" />
                    <p className="text-gray-500">Fetching latest news from {targetLanguage.name}...</p>
                </div>
            );
        }

        if (newsArticles.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Newspaper size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No news available right now
                    </h3>
                    <button
                        onClick={loadNews}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                        <RefreshCw size={16} /> Try Again
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Newspaper size={20} className="text-emerald-500" />
                        Latest News ({targetLanguage.name})
                    </h3>
                    <button
                        onClick={loadNews}
                        className="p-2 text-gray-400 hover:text-emerald-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Refresh News"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {newsArticles.map(article => (
                        <div
                            key={article.id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {article.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                        <span className="font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                                            {article.source}
                                        </span>
                                        <span>
                                            {new Date(article.publishedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                                        {article.excerpt}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-2">
                                <a
                                    href={article.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-medium text-gray-400 hover:text-emerald-500 flex items-center gap-1"
                                >
                                    Source <ArrowRight size={12} />
                                </a>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 font-medium mr-1">Learn at level:</span>
                                    {(['A2', 'B1', 'B2'] as const).map(level => (
                                        <button
                                            key={level}
                                            disabled={isRewriting}
                                            onClick={() => handleSelectNewsArticle(article, level)}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5
                                                ${isRewriting
                                                    ? 'bg-gray-100 text-gray-400 cursor-wait'
                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                                                }
                                            `}
                                        >
                                            {isRewriting && targetCEFR === level ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderLibrary = () => {
        if (libraryContent.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Library size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No content available for {targetLanguage.name}
                    </h3>
                    <p className="text-sm text-gray-400 max-w-xs">
                        Import your own text above to start reading, or switch to a different target language.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Level Filter Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filter:</span>
                    {(['all', 'A1', 'A2', 'B1', 'B2'] as LevelFilter[]).map(level => (
                        <button
                            key={level}
                            onClick={() => setSelectedLevel(level)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${selectedLevel === level
                                ? level === 'all'
                                    ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800'
                                    : getLevelColor(level) + ' ring-2 ring-offset-1 ring-gray-400'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {level === 'all' ? 'All Levels' : level}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredContent.map(passage => (
                        <div
                            key={passage.id}
                            className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all cursor-pointer"
                            onClick={() => handleLoadPassage(passage)}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getLevelColor(passage.level)}`}>
                                            {passage.level}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {passage.content.split(/\s+/).filter(w => w.length > 0).length} words
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {passage.title}
                                    </h4>
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-1" />
                            </div>

                            {/* Preview */}
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {passage.content.substring(0, 120)}...
                            </p>

                            {/* Source if exists */}
                            {passage.source && (
                                <p className="text-xs text-gray-400 mt-2 italic">
                                    — {passage.source}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Empty state for filtered */}
                {filteredContent.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <p>No passages found for level {selectedLevel}</p>
                        <button
                            onClick={() => setSelectedLevel('all')}
                            className="mt-2 text-emerald-500 hover:text-emerald-600 text-sm font-medium"
                        >
                            Show all levels
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* LEFT: Text Content */}
            <div className={`${isEditing ? 'lg:col-span-3' : 'lg:col-span-2'} flex flex-col h-full`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <BookOpen size={20} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Reading Mode</h3>
                                <p className="text-xs text-gray-500">
                                    {isEditing ? 'Choose from library or paste your own text' : 'Click any word to translate'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            {/* Library Tab */}
                            <button
                                onClick={() => setActiveSection('library')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeSection === 'library'
                                    ? 'bg-white dark:bg-gray-600 text-amber-600 dark:text-amber-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <Library size={14} />
                                Library
                            </button>

                            {/* News Tab */}
                            <button
                                onClick={() => setActiveSection('news')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeSection === 'news'
                                    ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <Newspaper size={14} />
                                News
                            </button>

                            {/* Import Tab */}
                            <button
                                onClick={() => setActiveSection('import')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeSection === 'import'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <Upload size={14} />
                                Import
                            </button>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            {!isEditing && text && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                                >
                                    Back to Library
                                </button>
                            )}
                            {text && (
                                <button
                                    onClick={() => { setText(''); setArticleTitle(''); setIsEditing(true); setActiveSection('library'); setHoverTranslation(null); setSelectedWord(null); }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Close Reader"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {isEditing ? (
                            <>
                                {activeSection === 'library' && (
                                    /* Library View */
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Library size={20} className="text-amber-500" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                Content Library
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                — {targetLanguage.name}
                                            </span>
                                        </div>
                                        {renderLibrary()}
                                    </div>
                                )}

                                {activeSection === 'news' && (
                                    /* News View */
                                    renderNewsSection()
                                )}

                                {activeSection === 'import' && (
                                    /* Import View */
                                    <div className="space-y-6">
                                        <div
                                            className={`
                                            flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 transition-colors bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden
                                            ${isLoadingFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500'}
                                        `}
                                        >
                                            {isLoadingFile && (
                                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                                                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Processing file...</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id="file-upload"
                                                className="hidden"
                                                accept=".txt,.md,.pdf,.epub"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setIsLoadingFile(true);
                                                        try {
                                                            let content = '';
                                                            const fileType = file.name.split('.').pop()?.toLowerCase();

                                                            if (fileType === 'pdf') {
                                                                const pdfjsLib = await import('pdfjs-dist');
                                                                pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

                                                                const arrayBuffer = await file.arrayBuffer();
                                                                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                                                                let fullText = '';

                                                                for (let i = 1; i <= pdf.numPages; i++) {
                                                                    const page = await pdf.getPage(i);
                                                                    const textContent = await page.getTextContent();
                                                                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                                                                    fullText += pageText + '\n\n';
                                                                }
                                                                content = fullText;
                                                            } else if (fileType === 'epub') {
                                                                const ePub = (await import('epubjs')).default;
                                                                const reader = new FileReader();

                                                                content = await new Promise((resolve, reject) => {
                                                                    reader.onload = async (e) => {
                                                                        try {
                                                                            const book = ePub(e.target?.result as ArrayBuffer);
                                                                            await book.ready;
                                                                            let fullBookText = '';
                                                                            const spine = book.spine as any;
                                                                            for (const item of spine.items) {
                                                                                const doc = await item.load(book.load.bind(book));
                                                                                if (doc) {
                                                                                    const chapterText = doc.body ? doc.body.innerText : (doc.textContent || '');
                                                                                    fullBookText += chapterText + '\n\n';
                                                                                }
                                                                            }
                                                                            resolve(fullBookText);
                                                                        } catch (err) {
                                                                            reject(err);
                                                                        }
                                                                    };
                                                                    reader.readAsArrayBuffer(file);
                                                                });
                                                            } else {
                                                                content = await new Promise((resolve) => {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (ev) => resolve(ev.target?.result as string);
                                                                    reader.readAsText(file);
                                                                });
                                                            }

                                                            if (content) {
                                                                setText(content);
                                                                setArticleTitle(file.name.replace(/\.[^/.]+$/, ""));
                                                            }
                                                        } catch (error) {
                                                            console.error("Import error:", error);
                                                            alert("Failed to import file. " + (error instanceof Error ? error.message : "Unknown error"));
                                                        } finally {
                                                            setIsLoadingFile(false);
                                                        }
                                                    }
                                                }}
                                            />

                                            {!text ? (
                                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center text-center">
                                                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                                                        <Upload size={32} className="text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                                        Upload your e-book or text
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                                                        Import .txt, .md, .pdf, or .epub to start reading with instant translation and grammar tools.
                                                    </p>
                                                    <span className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20">
                                                        Choose File
                                                    </span>
                                                </label>
                                            ) : (
                                                <div className="w-full">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                                                <BookMarked size={20} className="text-emerald-600 dark:text-emerald-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 dark:text-white">{articleTitle || 'Imported Text'}</h4>
                                                                <p className="text-xs text-gray-500">{text.split(/\s+/).length} words</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => { setText(''); setArticleTitle(''); }} className="text-gray-400 hover:text-red-500 p-2">
                                                            <X size={20} />
                                                        </button>
                                                    </div>

                                                    <textarea
                                                        value={text}
                                                        onChange={(e) => setText(e.target.value)}
                                                        className="w-full h-48 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none dark:text-white mb-4"
                                                    />

                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                                    >
                                                        <Play size={18} />
                                                        Start Reading
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Supported Formats Info */}
                                        {!text && (
                                            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    .TXT
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    .MD
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                    .PDF
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                    .EPUB
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="prose dark:prose-invert prose-lg max-w-none">
                                {articleTitle && (
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                        {articleTitle}
                                    </h2>
                                )}
                                <div className="text-gray-800 dark:text-gray-200 text-lg">
                                    {renderInteractiveText()}

                                    {rewrittenArticle && rewrittenArticle.questions && (
                                        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <MessageSquare size={24} className="text-emerald-500" />
                                                Comprehension Check
                                            </h3>
                                            <div className="space-y-4">
                                                {rewrittenArticle.questions.map((q, idx) => (
                                                    <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                                                        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                                            {idx + 1}. {q.question}
                                                        </p>
                                                        <details className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer group">
                                                            <summary className="font-medium text-emerald-600 hover:text-emerald-700 list-none flex items-center gap-1 select-none">
                                                                <span className="group-open:hidden">Show Answer</span>
                                                                <span className="hidden group-open:inline">Hide Answer</span>
                                                            </summary>
                                                            <p className="mt-2 pl-2 border-l-2 border-emerald-300 dark:border-emerald-700">
                                                                {q.answer}
                                                            </p>
                                                        </details>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Stats */}
                    {!isEditing && text && (
                        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{text.split(/\s+/).length} words</span>
                                <span>{allSavedWords.filter(w => w.sourceTitle === (articleTitle || 'Reading Mode')).length} saved from this text</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Translation Panel */}
            {!isEditing && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                        <div className="flex items-center gap-2">
                            <Languages size={16} className="text-blue-500" />
                            <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Translation</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        {selectedWord && hoverTranslation ? (
                            <div className="space-y-4">
                                {/* Word & Translation */}
                                <div className="text-center pb-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                        {hoverTranslation.word}
                                    </div>
                                    <div className="text-lg text-emerald-600 dark:text-emerald-400 font-medium">
                                        {isTranslating ? (
                                            <Loader2 size={16} className="inline animate-spin" />
                                        ) : (
                                            hoverTranslation.translation
                                        )}
                                    </div>
                                </div>

                                {/* Save Button */}
                                <button
                                    onClick={handleSaveWord}
                                    disabled={allSavedWords.some(w => w.word === hoverTranslation.word)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-sm transition-colors"
                                >
                                    <Plus size={16} />
                                    {allSavedWords.some(w => w.word === hoverTranslation.word) ? 'Already Saved' : 'Save to Vocab'}
                                </button>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Translate Sentence */}
                                    <button
                                        onClick={async () => {
                                            if (hoverTranslation && !hoverTranslation.sentenceTranslation) {
                                                setIsLoadingSentence(true);
                                                try {
                                                    const translation = await translateSentence(
                                                        hoverTranslation.sentence,
                                                        targetLanguage.code,
                                                        nativeLanguage.code
                                                    );
                                                    setHoverTranslation({ ...hoverTranslation, sentenceTranslation: translation || 'Unable to translate' });
                                                } catch (e: any) {
                                                    setHoverTranslation({ ...hoverTranslation, sentenceTranslation: `Error: ${e.message}` });
                                                } finally {
                                                    setIsLoadingSentence(false);
                                                }
                                            }
                                        }}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${hoverTranslation?.sentenceTranslation ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        <MessageSquare size={14} />
                                        {isLoadingSentence ? '...' : hoverTranslation?.sentenceTranslation ? '✓' : 'Sentence'}
                                    </button>

                                    {/* Grammar */}
                                    <button
                                        onClick={async () => {
                                            if (hoverTranslation && !hoverTranslation.grammar) {
                                                setIsLoadingGrammar(true);
                                                try {
                                                    const grammar = await getGrammarExplanation(
                                                        hoverTranslation.word,
                                                        hoverTranslation.sentence,
                                                        targetLanguage.name,
                                                        nativeLanguage.name
                                                    );
                                                    setHoverTranslation({ ...hoverTranslation, grammar });
                                                } catch (e: any) {
                                                    setHoverTranslation({ ...hoverTranslation, grammar: `Error: ${e.message}` });
                                                } finally {
                                                    setIsLoadingGrammar(false);
                                                }
                                            }
                                        }}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${hoverTranslation?.grammar ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        <Sparkles size={14} />
                                        {isLoadingGrammar ? '...' : hoverTranslation?.grammar ? '✓' : 'Grammar'}
                                    </button>

                                    {/* Dictionary */}
                                    <button
                                        onClick={async () => {
                                            if (hoverTranslation && !hoverTranslation.dictionary) {
                                                setIsLoadingDictionary(true);
                                                try {
                                                    const dict = await getDictionaryDefinitions(
                                                        hoverTranslation.word,
                                                        targetLanguage.name,
                                                        nativeLanguage.name
                                                    );
                                                    setHoverTranslation({ ...hoverTranslation, dictionary: dict || 'No definitions found' });
                                                } catch (e: any) {
                                                    setHoverTranslation({ ...hoverTranslation, dictionary: `Error: ${e.message}` });
                                                } finally {
                                                    setIsLoadingDictionary(false);
                                                }
                                            }
                                        }}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${hoverTranslation?.dictionary ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        <BookMarked size={14} />
                                        {isLoadingDictionary ? '...' : hoverTranslation?.dictionary ? '✓' : 'Dictionary'}
                                    </button>

                                    {/* Elaborate */}
                                    <button
                                        onClick={async () => {
                                            if (hoverTranslation && !hoverTranslation.elaboration) {
                                                setIsLoadingElaboration(true);
                                                try {
                                                    const elab = await getElaborateDefinition(
                                                        hoverTranslation.word,
                                                        hoverTranslation.sentence,
                                                        targetLanguage.name,
                                                        nativeLanguage.name
                                                    );
                                                    setHoverTranslation({ ...hoverTranslation, elaboration: elab || 'No explanation available' });
                                                } catch (e: any) {
                                                    setHoverTranslation({ ...hoverTranslation, elaboration: `Error: ${e.message}` });
                                                } finally {
                                                    setIsLoadingElaboration(false);
                                                }
                                            }
                                        }}
                                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${hoverTranslation?.elaboration ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        <GraduationCap size={14} />
                                        {isLoadingElaboration ? '...' : hoverTranslation?.elaboration ? '✓' : 'Elaborate'}
                                    </button>
                                </div>

                                {/* Expandable Content Sections */}
                                {hoverTranslation.sentenceTranslation && (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">Sentence Translation</div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">"{hoverTranslation.sentence}"</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{hoverTranslation.sentenceTranslation}</p>
                                    </div>
                                )}

                                {hoverTranslation.grammar && (
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">Grammar</div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{hoverTranslation.grammar}</p>
                                    </div>
                                )}

                                {hoverTranslation.dictionary && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">Dictionary</div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{hoverTranslation.dictionary}</p>
                                    </div>
                                )}

                                {hoverTranslation.elaboration && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Detailed Explanation</div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{hoverTranslation.elaboration}</p>
                                    </div>
                                )}
                            </div>
                        ) : rewrittenArticle ? (
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <BookMarked size={18} className="text-amber-500" />
                                    Key Vocabulary
                                </h3>
                                {rewrittenArticle.vocabulary.map((vocab, idx) => (
                                    <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/50">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white">{vocab.word}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getLevelColor(vocab.cefrLevel)}`}>
                                                {vocab.cefrLevel}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{vocab.translation}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
                                <BookOpen size={48} className="mb-4 opacity-20" />
                                <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Click a Word</h3>
                                <p className="text-sm max-w-[200px]">Click any word in the text to see its translation here</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
                        <p className="text-xs text-center text-gray-400">
                            Click words for instant translation
                        </p>
                    </div>
                </div>)}
        </div>
    );
};
