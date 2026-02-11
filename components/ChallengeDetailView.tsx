import React from 'react';
import { Calendar, Users, Trophy, Clock, ArrowLeft, Share2, Trash2, Edit2, Check } from 'lucide-react';
import { Challenge } from '../types';
import { getDaysRemaining, getDaysElapsed, isChallengeActive, sortParticipantsByProgress } from '../challengeUtils';
import { MountainPath } from './MountainPath';

interface ChallengeDetailViewProps {
    challenge: Challenge;
    onBack: () => void;
    currentUserId: string;
    onDelete?: () => void;
    onRedact?: () => void;
    onRemoveParticipant?: (participantId: string) => void;
    onUpdateParticipantName?: (participantId: string, newName: string) => void;
}

export const ChallengeDetailView: React.FC<ChallengeDetailViewProps> = ({
    challenge,
    onBack,
    currentUserId,
    onDelete,
    onRedact,
    onRemoveParticipant,
    onUpdateParticipantName,
}) => {
    const daysRemaining = getDaysRemaining(challenge.endDate);
    const daysElapsed = getDaysElapsed(challenge.startDate);
    const isActive = isChallengeActive(challenge);
    const sortedParticipants = sortParticipantsByProgress(challenge.participants);

    const [copied, setCopied] = React.useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(challenge.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
            // Fallback could be added here if needed
        }
    };

    const [editingParticipant, setEditingParticipant] = React.useState<string | null>(null);
    const [editName, setEditName] = React.useState('');

    const handleStartEdit = (p: typeof sortedParticipants[0]) => {
        setEditingParticipant(p.odId);
        setEditName(p.displayName);
    };

    const handleSaveName = (pId: string) => {
        if (editName.trim() && onUpdateParticipantName) {
            onUpdateParticipantName(pId, editName.trim());
        }
        setEditingParticipant(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-2">
                    {onRedact && currentUserId === challenge.creatorId && (
                        <button
                            onClick={onRedact}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#121821] text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-[#1A2433] rounded-lg transition-colors"
                            title="Redact Challenge"
                        >
                            <Edit2 size={18} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                            title="Delete Challenge"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button
                        onClick={handleShare}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${copied
                            ? 'bg-green-500 text-white'
                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                            }`}
                    >
                        {copied ? <Check size={16} /> : <Share2 size={16} />}
                        {copied ? 'Copied!' : 'Invite Friend'}
                    </button>
                </div>
            </div>

            {/* Challenge Info Card */}
            <div className="bg-white dark:bg-[#0F141D] rounded-2xl p-6 border border-gray-200 dark:border-[#1F2733] shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            {challenge.title}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Habit: {challenge.habitTitle}
                        </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isActive
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-[#121821] dark:text-slate-400'
                        }`}>
                        {isActive ? 'Active' : 'Completed'}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Users size={14} />
                            <span className="text-xs">Participants</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {challenge.participants.length}
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Calendar size={14} />
                            <span className="text-xs">Duration</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {challenge.duration}d
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Clock size={14} />
                            <span className="text-xs">{isActive ? 'Remaining' : 'Ended'}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {isActive ? `${daysRemaining}d` : '—'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Shared Mountain Visualization */}
            <div>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2 px-2">
                    <Trophy size={18} className="text-yellow-500" />
                    Team Progress
                </h3>

                <MountainPath
                    participants={challenge.participants}
                    currentUserId={currentUserId}
                    challengeDuration={challenge.duration}
                    challengeId={challenge.id}
                />
            </div>

            {/* Participant List */}
            <div className="bg-white dark:bg-[#0F141D] rounded-2xl p-6 border border-gray-200 dark:border-[#1F2733] shadow-sm" >
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-4">Participants</h3>
                <div className="space-y-3">
                    {sortedParticipants.map((participant, index) => {
                        // FORCE COLOR OVERRIDE to match Sprites
                        // Creator (Admin) -> Green (#2E7D32)
                        // Guest -> Redish (#FF6B6B)
                        const displayColor = participant.odId === challenge.creatorId
                            ? '#2E7D32'
                            : '#FF6B6B';

                        return (
                            <div
                                key={participant.odId}
                                className="flex items-center gap-3 p-3 rounded-xl transition-all shadow-sm border-2"
                                style={{
                                    backgroundColor: `${displayColor}33`,
                                    borderColor: displayColor
                                }}
                            >
                                <span className="text-lg font-bold w-6" style={{ color: displayColor }}>
                                    {index + 1}
                                </span>

                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                                    style={{ backgroundColor: displayColor }}
                                >
                                    {participant.displayName.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1">
                                    {editingParticipant === participant.odId ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="px-2 py-1 text-sm border rounded dark:bg-[#121821] dark:border-[#2A3444] dark:text-slate-100 w-full max-w-[150px]"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveName(participant.odId);
                                                    if (e.key === 'Escape') setEditingParticipant(null);
                                                }}
                                                onBlur={() => handleSaveName(participant.odId)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group/name">
                                            <p className="font-bold text-gray-900 dark:text-slate-100">
                                                {participant.displayName}
                                                {participant.odId === currentUserId && (
                                                    <span className="text-xs ml-2 opacity-80" style={{ color: displayColor }}>(You)</span>
                                                )}
                                            </p>
                                            {/* Edit Button */}
                                            {(participant.odId === currentUserId || currentUserId === challenge.creatorId) && onUpdateParticipantName && (
                                                <button
                                                    onClick={() => handleStartEdit(participant)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all opacity-0 group-hover/name:opacity-100"
                                                    title="Rename"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                                        {participant.completedDays}/{challenge.duration} days completed
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-lg font-bold" style={{ color: displayColor }}>
                                        {Math.round((participant.completedDays / challenge.duration) * 100)}%
                                    </p>
                                    {participant.hasCompleted && (
                                        <span className="text-xs text-yellow-500 block font-bold">🏆 Champion</span>
                                    )}
                                    {currentUserId === challenge.creatorId && participant.odId !== challenge.creatorId && onRemoveParticipant && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm(`Remove ${participant.displayName} from this challenge?`)) {
                                                    onRemoveParticipant(participant.odId);
                                                }
                                            }}
                                            className="mt-1 text-xs text-red-500 hover:text-red-700 hover:underline flex items-center justify-end gap-1 opacity-60 hover:opacity-100"
                                        >
                                            <Trash2 size={12} />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div >
        </div >
    );
};
