import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Brain, Sparkles, Loader2, ChevronDown, User, Trash2, BookOpen, Bot } from 'lucide-react';
import { Habit } from '../types';
import { chatWithHabitCoach, ChatMessage, CoachPersona, COACH_PERSONAS, extractMemoriesFromMessage } from '../services/geminiService';
import { getLocalDateString } from '../utils/dateUtils';

interface AICoachChatProps {
    habits: Habit[];
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    selectedPersona: CoachPersona;
    onSelectPersona: (persona: CoachPersona) => void;
}

const QUICK_PROMPTS = [
    "How am I doing this week?",
    "What should I focus on today?",
    "Why do I keep missing habits?",
    "Give me motivation!"
];

export const AICoachChat: React.FC<AICoachChatProps> = ({ habits, isOpen, onClose, onOpen, selectedPersona, onSelectPersona }) => {
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

    // Floating Widget - always render the button, conditionally render the popup
    return (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-4">
            {/* Chat Window Popup */}
            {isOpen && (
                <div className="w-[380px] h-[520px] bg-white dark:bg-[#0F141D] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-gray-200 dark:border-[#1F2733]">
                    {/* Header with Persona Selector */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-[#1F2733] bg-gray-50 dark:bg-[#121821]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#121821] flex items-center justify-center overflow-hidden border border-gray-200 dark:border-[#2A3444] shrink-0">
                                <img
                                    src={COACH_PERSONAS[selectedPersona].avatar}
                                    alt={COACH_PERSONAS[selectedPersona].name}
                                    className="w-full h-full object-cover scale-125 transition-transform"
                                />
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                                    className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-[#1A2433] px-2 -ml-2 py-1 rounded-lg transition-colors group"
                                >
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm text-left leading-tight">{COACH_PERSONAS[selectedPersona].name}</h3>
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                            {COACH_PERSONAS[selectedPersona].title} <ChevronDown size={8} />
                                        </p>
                                    </div>
                                </button>

                                {/* Persona Dropdown */}
                                {isPersonaMenuOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#0F141D] rounded-xl shadow-xl border border-gray-100 dark:border-[#1F2733] overflow-hidden py-1 animate-fade-in z-50">
                                        <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider bg-gray-50 dark:bg-[#121821]">
                                            Choose Personality
                                        </div>
                                        {Object.entries(COACH_PERSONAS).map(([key, persona]) => (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    onSelectPersona(key as CoachPersona);
                                                    setIsPersonaMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#121821] transition-colors flex items-center gap-2 ${selectedPersona === key ? 'bg-gray-50 dark:bg-[#121821] text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-400'
                                                    }`}
                                            >
                                                <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-[#121821] shrink-0 border border-gray-200 dark:border-[#2A3444]">
                                                    <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover scale-125" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-xs">{persona.name}</div>
                                                </div>
                                                {selectedPersona === key && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={() => setIsMemoriesOpen(!isMemoriesOpen)}
                                title="Coach memories"
                                className={`transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-[#1A2433] rounded-full ${memories.length > 0 ? 'text-blue-500' : 'text-gray-400'}`}
                            >
                                <BookOpen size={14} />
                            </button>
                            <button
                                onClick={clearChat}
                                title="Clear chat"
                                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-[#1A2433] rounded-full"
                            >
                                <Trash2 size={14} />
                            </button>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-[#1A2433] rounded-full">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Memories dropdown */}
                    {isMemoriesOpen && (
                        <div className="absolute top-14 right-4 w-64 bg-white dark:bg-[#0F141D] rounded-xl shadow-xl border border-gray-100 dark:border-[#1F2733] overflow-hidden animate-fade-in z-50">
                            <div className="px-3 py-2 border-b border-gray-100 dark:border-[#1F2733] flex items-center justify-between">
                                <span className="font-semibold text-xs text-gray-900 dark:text-white">Coach Memories</span>
                                {memories.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setMemories([]);
                                            localStorage.removeItem('habitvision_coach_memories');
                                            setIsMemoriesOpen(false);
                                        }}
                                        className="text-[10px] text-red-500 hover:underline"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                            <div className="max-h-40 overflow-y-auto">
                                {memories.length === 0 ? (
                                    <p className="px-3 py-2 text-xs text-gray-500 dark:text-slate-400">
                                        No memories yet. Tell me about yourself!
                                    </p>
                                ) : (
                                    <ul className="px-3 py-2 space-y-1">
                                        {memories.map((m, i) => (
                                            <li key={i} className="text-xs text-gray-700 dark:text-slate-300 flex items-start gap-1.5">
                                                <span className="text-blue-500 mt-0.5">•</span>
                                                <span className="capitalize">{m}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-3 py-2 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-br-md'
                                    : 'bg-gray-100 dark:bg-[#121821] text-gray-800 dark:text-gray-200 rounded-bl-md'
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
                                <div className="bg-gray-100 dark:bg-[#121821] px-3 py-2 rounded-2xl rounded-bl-md flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Prompts */}
                    {messages.length <= 2 && (
                        <div className="px-3 pb-2">
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_PROMPTS.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(prompt)}
                                        disabled={isLoading}
                                        className="px-2.5 py-1 text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                                    >
                                        <Sparkles size={8} className="inline mr-0.5" />
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 dark:border-[#1F2733] bg-gray-50/50 dark:bg-[#121821]/70">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask your coach..."
                                disabled={isLoading}
                                className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-[#121821] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 text-sm border border-gray-200 dark:border-[#2A3444] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={onOpen}
                className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 bg-emerald-600 hover:bg-emerald-700"
                style={{ display: isOpen ? 'none' : 'flex' }}
            >
                <Sparkles size={28} className="text-white" />
            </button>
        </div>
    );
};
