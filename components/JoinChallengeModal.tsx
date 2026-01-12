
import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface JoinChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: (inviteCode: string) => void;
}

export const JoinChallengeModal: React.FC<JoinChallengeModalProps> = ({
    isOpen,
    onClose,
    onJoin,
}) => {
    const [inviteCode, setInviteCode] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteCode.trim().length === 6) {
            onJoin(inviteCode.trim().toUpperCase());
            setInviteCode(''); // Clear after submit
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Join Challenge</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Enter Invite Code
                        </label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            placeholder="AH7X2B"
                            maxLength={6}
                            className="w-full px-4 py-3 text-2xl font-mono text-center tracking-widest uppercase bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-center text-gray-500">
                            Ask a friend for their 6-character challenge code
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={inviteCode.length !== 6}
                        className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${inviteCode.length === 6
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transform hover:-translate-y-0.5'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <span>Join Challenge</span>
                        <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};
