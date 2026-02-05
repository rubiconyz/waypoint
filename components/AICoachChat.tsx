import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Brain, Sparkles, Loader2, ChevronDown, User, Trash2, BookOpen } from 'lucide-react';
import { Habit } from '../types';
import { chatWithHabitCoach, ChatMessage, CoachPersona, COACH_PERSONAS, extractMemoriesFromMessage } from '../services/geminiService';
import { getLocalDateString } from '../utils/dateUtils';

interface AICoachChatProps {
    habits: Habit[];
    isOpen: boolean;
    onClose: () => void;
    selectedPersona: CoachPersona;
    onSelectPersona: (persona: CoachPersona) => void;
}

const QUICK_PROMPTS = [
    "How am I doing this week?",
    "What should I focus on today?",
    "Why do I keep missing habits?",
    "Give me motivation!"
];

export const AICoachChat: React.FC<AICoachChatProps> = ({ habits, isOpen, onClose, selectedPersona, onSelectPersona }) => {
    // const [selectedPersona, setSelectedPersona] = useState<CoachPersona>('waypoint'); // Moved to parent
    const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: "Hey! 👋 I'm Waypoint. Ready to crush some goals?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasGeneratedDailySummary = useRef(false);
    const [memories, setMemories] = useState<string[]>([]);
    const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);

    // Load memories on mount
    useEffect(() => {
        const saved = localStorage.getItem('habitvision_coach_memories');
        if (saved) {
            try {
                setMemories(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse memories", e);
            }
        }
    }, []);

    // Load history when persona changes
    useEffect(() => {
        const saved = localStorage.getItem(`habitvision_chat_${selectedPersona}`);
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse chat history", e);
                // Fallback to greeting
                setMessages([{
                    role: 'assistant',
                    content: COACH_PERSONAS[selectedPersona].greeting
                }]);
            }
        } else {
            // No history? New greeting.
            setMessages([{
                role: 'assistant',
                content: COACH_PERSONAS[selectedPersona].greeting
            }]);
        }
        hasGeneratedDailySummary.current = false; // Reset when persona changes
    }, [selectedPersona]);

    // Proactive Daily Summary: Generate personalized greeting when chat opens
    useEffect(() => {
        if (!isOpen || habits.length === 0 || hasGeneratedDailySummary.current) return;

        const today = getLocalDateString(new Date());
        const lastGreetedKey = `habitvision_last_greeted_${selectedPersona}`;
        const lastGreeted = localStorage.getItem(lastGreetedKey);

        // Only generate once per day per persona
        if (lastGreeted === today) return;

        const generateDailySummary = async () => {
            setIsLoading(true);
            hasGeneratedDailySummary.current = true;

            try {
                const summaryPrompt = "Give me a quick daily update. What's on my plate today and how did I do yesterday?";
                const response = await chatWithHabitCoach(summaryPrompt, habits, [], selectedPersona);

                setMessages([{ role: 'assistant', content: response }]);
                localStorage.setItem(lastGreetedKey, today);
            } catch (error) {
                console.error("Failed to generate daily summary:", error);
                // Fallback to static greeting
                setMessages([{
                    role: 'assistant',
                    content: COACH_PERSONAS[selectedPersona].greeting
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        generateDailySummary();
    }, [isOpen, habits, selectedPersona]);

    // Save history when messages change
    // Save history when messages change and scroll to bottom
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(`habitvision_chat_${selectedPersona}`, JSON.stringify(messages));
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedPersona]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: text.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithHabitCoach(text.trim(), habits, messages, selectedPersona, memories);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);

            // Extract and save new memories (async, non-blocking)
            extractMemoriesFromMessage(text.trim(), memories).then(newMemories => {
                if (newMemories.length > 0) {
                    const updated = [...memories, ...newMemories].slice(-20); // Keep last 20
                    setMemories(updated);
                    localStorage.setItem('habitvision_coach_memories', JSON.stringify(updated));
                }
            });
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Try again?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: COACH_PERSONAS[selectedPersona].greeting
        }]);
        localStorage.removeItem(`habitvision_chat_${selectedPersona}`);
        localStorage.removeItem(`habitvision_last_greeted_${selectedPersona}`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg h-[600px] max-h-[80vh] flex flex-col overflow-hidden animate-fade-in">
                {/* Header */}
                {/* Header with Persona Selector */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                            <img
                                src={COACH_PERSONAS[selectedPersona].avatar}
                                alt={COACH_PERSONAS[selectedPersona].name}
                                className="w-full h-full object-cover scale-125 transition-transform"
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                                className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 -ml-2 py-1 rounded-lg transition-colors group"
                            >
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-left leading-tight">{COACH_PERSONAS[selectedPersona].name}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                        {COACH_PERSONAS[selectedPersona].title} <ChevronDown size={10} />
                                    </p>
                                </div>
                            </button>

                            {/* Persona Dropdown */}
                            {isPersonaMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-1 animate-fade-in z-50">
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                                        Choose Personality
                                    </div>
                                    {Object.entries(COACH_PERSONAS).map(([key, persona]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                onSelectPersona(key as CoachPersona);
                                                setIsPersonaMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-3 border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${selectedPersona === key ? 'bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-600">
                                                <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover scale-125" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{persona.name}</div>
                                                <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-none">{persona.title}</div>
                                            </div>
                                            {selectedPersona === key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="relative">
                            <button
                                onClick={() => setIsMemoriesOpen(!isMemoriesOpen)}
                                title="Coach memories"
                                className={`transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full ${memories.length > 0 ? 'text-blue-500' : 'text-gray-400'}`}
                            >
                                <BookOpen size={16} />
                                {memories.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                                        {memories.length}
                                    </span>
                                )}
                            </button>
                            {isMemoriesOpen && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <span className="font-semibold text-sm text-gray-900 dark:text-white">Coach Memories</span>
                                        {memories.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setMemories([]);
                                                    localStorage.removeItem('habitvision_coach_memories');
                                                    setIsMemoriesOpen(false);
                                                }}
                                                className="text-xs text-red-500 hover:underline"
                                            >
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-48 overflow-y-auto">
                                        {memories.length === 0 ? (
                                            <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                No memories yet. Tell me about yourself and I'll remember!
                                            </p>
                                        ) : (
                                            <ul className="px-4 py-2 space-y-1.5">
                                                {memories.map((m, i) => (
                                                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                                        <span className="text-blue-500 mt-0.5">•</span>
                                                        <span className="capitalize">{m}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={clearChat}
                            title="Clear chat"
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.role === 'user'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-br-md'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md border border-gray-100 dark:border-gray-700'
                                }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.content.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, index) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={index}>{part.slice(2, -2)}</strong>;
                                        }
                                        if (part.startsWith('*') && part.endsWith('*')) {
                                            return <em key={index}>{part.slice(1, -1)}</em>;
                                        }
                                        return part;
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start items-end gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 border border-gray-200 dark:border-gray-600">
                                <img src={COACH_PERSONAS[selectedPersona].avatar} alt="" className="w-full h-full object-cover scale-125 animate-pulse" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 2 && (
                    <div className="px-4 pb-2">
                        <div className="flex flex-wrap gap-2">
                            {QUICK_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(prompt)}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                                >
                                    <Sparkles size={10} className="inline mr-1" />
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask your coach anything..."
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
};
