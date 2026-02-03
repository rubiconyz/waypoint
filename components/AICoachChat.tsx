import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Brain, Sparkles, Loader2 } from 'lucide-react';
import { Habit } from '../types';
import { chatWithHabitCoach, ChatMessage } from '../services/geminiService';

interface AICoachChatProps {
    habits: Habit[];
    isOpen: boolean;
    onClose: () => void;
}

const QUICK_PROMPTS = [
    "How am I doing this week?",
    "What should I focus on today?",
    "Why do I keep missing habits?",
    "Give me motivation!"
];

export const AICoachChat: React.FC<AICoachChatProps> = ({ habits, isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: "Hey! 👋 I'm your AI habit coach. Ask me anything about your habits, or use the prompts below to get started!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: text.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithHabitCoach(text.trim(), habits, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg h-[600px] max-h-[80vh] flex flex-col overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-indigo-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Brain size={22} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">AI Habit Coach</h3>
                            <p className="text-xs text-white/70">Powered by Gemini</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-indigo-500 text-white rounded-br-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md'
                                }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-indigo-500" />
                                <span className="text-sm text-gray-500">Thinking...</span>
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
        </div>
    );
};
