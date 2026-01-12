import React, { useState } from 'react';
import { X, Users, Calendar, Link2, Copy, Check, Sparkles } from 'lucide-react';
import { Habit, Challenge } from '../types';
import { createChallenge, getInviteLink } from '../challengeUtils';

interface CreateChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    habits: Habit[];
    userId: string;
    userName: string;
    onSave: (challenge: Challenge) => void;
    initialData?: Challenge | null;
}

const DURATION_PRESETS = [
    { label: '7 days', value: 7 },
    { label: '14 days', value: 14 },
    { label: '21 days', value: 21 },
    { label: '30 days', value: 30 },
];

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
    isOpen,
    onClose,
    habits,
    userId,
    userName,
    onSave,
    initialData
}) => {
    const isEditing = !!initialData;
    const [step, setStep] = useState<'setup' | 'share'>('setup');
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(() => {
        if (initialData) {
            return habits.find(h => h.id === initialData.habitId) || null;
        }
        return null;
    });
    const [title, setTitle] = useState(() => initialData?.title || '');
    const [duration, setDuration] = useState(() => initialData?.duration || 7);
    const [customDuration, setCustomDuration] = useState('');
    const [useCustomDuration, setUseCustomDuration] = useState(false);
    const [createdChallenge, setCreatedChallenge] = useState<Challenge | null>(null);
    const [copied, setCopied] = useState(false);

    // Reset state when modal opens/closes or initialData changes
    React.useEffect(() => {
        if (isOpen && initialData) {
            const habit = habits.find(h => h.id === initialData.habitId) || null;
            setSelectedHabit(habit);
            setTitle(initialData.title);
            setDuration(initialData.duration);
            // Check if duration is a preset
            const isPreset = DURATION_PRESETS.some(p => p.value === initialData.duration);
            if (!isPreset) {
                setUseCustomDuration(true);
                setCustomDuration(initialData.duration.toString());
            }
        } else if (isOpen && !initialData) {
            // Reset for create mode
            setSelectedHabit(null);
            setTitle('');
            setDuration(7);
            setUseCustomDuration(false);
            setCustomDuration('');
        }
    }, [isOpen, initialData, habits]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!selectedHabit) return;

        const finalDuration = useCustomDuration ? parseInt(customDuration) || 7 : duration;
        const challengeTitle = title || `${finalDuration}-Day ${selectedHabit.title} Challenge`;

        if (isEditing && initialData) {
            // Update existing challenge
            const updatedChallenge: Challenge = {
                ...initialData,
                title: challengeTitle,
                habitId: selectedHabit.id,
                habitTitle: selectedHabit.title,
                duration: finalDuration,
                // Recalculate end date based on original start date and new duration
                endDate: new Date(new Date(initialData.startDate).getTime() + finalDuration * 24 * 60 * 60 * 1000).toISOString(),
            };
            onSave(updatedChallenge);
            onClose(); // Close immediately for edit
        } else {
            // Create new challenge
            const challenge = createChallenge(
                userId,
                userName,
                selectedHabit.title,
                selectedHabit.id,
                challengeTitle,
                finalDuration,
                undefined, // Description
                selectedHabit.category // Pass category from selected habit
            );
            setCreatedChallenge(challenge);
            onSave(challenge);
            setStep('share');
        }
    };

    const handleCopyLink = async () => {
        if (!createdChallenge) return;
        const link = getInviteLink(createdChallenge.inviteCode);
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setStep('setup');
        setSelectedHabit(null);
        setTitle('');
        setDuration(7);
        setCreatedChallenge(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="text-indigo-500" size={20} />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {step === 'setup' ? (isEditing ? 'Redact Challenge' : 'Create Challenge') : 'Invite Friends'}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {step === 'setup' ? (
                    <div className="p-6 space-y-5">
                        {/* Select Habit */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Choose a Habit
                            </label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {habits.map(habit => (
                                    <button
                                        key={habit.id}
                                        onClick={() => setSelectedHabit(habit)}
                                        className={`p-3 rounded-xl text-left text-sm transition-all ${selectedHabit?.id === habit.id
                                            ? 'bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-500'
                                            : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <span className="font-medium text-gray-900 dark:text-white">{habit.title}</span>
                                    </button>
                                ))}
                            </div>
                            {habits.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">Add habits first to create a challenge</p>
                            )}
                        </div>

                        {/* Challenge Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Challenge Title (optional)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={selectedHabit ? `${duration}-Day ${selectedHabit.title} Challenge` : 'Enter a title...'}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar size={14} className="inline mr-1" />
                                Duration
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DURATION_PRESETS.map(preset => (
                                    <button
                                        key={preset.value}
                                        onClick={() => {
                                            setDuration(preset.value);
                                            setUseCustomDuration(false);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!useCustomDuration && duration === preset.value
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={customDuration}
                                        onChange={(e) => {
                                            setCustomDuration(e.target.value);
                                            setUseCustomDuration(true);
                                        }}
                                        placeholder="Custom"
                                        className={`w-32 px-3 py-2 rounded-lg text-sm border ${useCustomDuration
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                            } focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white`}
                                    />
                                    <span className="text-sm text-gray-500">days</span>
                                </div>
                            </div>
                        </div>

                        {/* Create/Update Button */}
                        <button
                            onClick={handleSave}
                            disabled={!selectedHabit}
                            className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${selectedHabit
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg'
                                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                }`}
                        >
                            <Sparkles size={18} />
                            {isEditing ? 'Update Challenge' : 'Create Challenge'}
                        </button>
                    </div>
                ) : (
                    <div className="p-6 space-y-5">
                        {/* Success Message */}
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Challenge Created! 🎉
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Share the link below to invite friends
                            </p>
                        </div>

                        {/* Invite Code Display */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                            <p className="text-xs text-gray-500 mb-1">Invite Code</p>
                            <p className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                                {createdChallenge?.inviteCode}
                            </p>
                        </div>

                        {/* Copy Link Button */}
                        <button
                            onClick={handleCopyLink}
                            className="w-full py-3 rounded-xl font-semibold bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center gap-2 transition-all"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy Invite Link'}
                        </button>

                        {/* Share Options */}
                        <div className="flex items-center justify-center gap-4 pt-2">
                            <button
                                onClick={handleClose}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
