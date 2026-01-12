
import React, { useState } from 'react';
import { Plus, Users, Calendar, ChevronRight, Trophy, Clock, Trash2, Edit2, Lock } from 'lucide-react';
import { Challenge, Habit } from '../types';
import { CreateChallengeModal } from './CreateChallengeModal';
import { ChallengeDetailView } from './ChallengeDetailView';
import { isChallengeActive, getDaysRemaining, sortParticipantsByProgress, removeParticipant, updateParticipantName } from '../challengeUtils';
import { JoinChallengeModal } from './JoinChallengeModal';

interface ChallengesTabProps {
    challenges: Challenge[];
    habits: Habit[];
    userId: string;
    userName: string;
    onCreateChallenge: (challenge: Challenge) => void;
    onUpdateChallenge: (challenge: Challenge) => void;
    onDeleteChallenge: (challengeId: string) => void;
    onRedactChallenge: (challengeId: string) => void;
    onJoinChallenge: (inviteCode: string) => void;
}

export const ChallengesTab: React.FC<ChallengesTabProps> = ({
    challenges,
    habits,
    userId,
    userName,
    onCreateChallenge,
    onUpdateChallenge,
    onDeleteChallenge,
    onRedactChallenge,
    onJoinChallenge,
}) => {
    // RESTRICT ACCESS - TOGGLE THIS TO 'true' TO RE-ENABLE
    const IS_ENABLED = true;

    if (!IS_ENABLED) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center px-6">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                    <Lock size={36} className="text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Challenges Coming Soon
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    We're putting the finishing touches on the new multiplayer challenges. Get ready to climb mountains with your friends!
                </p>
            </div>
        );
    }

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

    // Sync URL with Selected Challenge
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const challengeId = params.get('challenge');
        if (challengeId && !selectedChallenge) {
            const found = challenges.find(c => c.id === challengeId);
            if (found) {
                setSelectedChallenge(found);
            }
        }
    }, [challenges]); // Run when challenges load

    const handleSelectChallenge = (c: Challenge) => {
        setSelectedChallenge(c);
        const url = new URL(window.location.href);
        url.searchParams.set('challenge', c.id);
        window.history.pushState({}, '', url);
    };

    const handleClearSelection = () => {
        setSelectedChallenge(null);
        const url = new URL(window.location.href);
        url.searchParams.delete('challenge');
        window.history.pushState({}, '', url);
    };

    // Filter challenges
    const activeChallenges = challenges.filter(c => isChallengeActive(c));
    const pastChallenges = challenges.filter(c => !isChallengeActive(c));

    const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
        const daysRemaining = getDaysRemaining(challenge.endDate);
        const isActive = isChallengeActive(challenge);

        return (
            <div
                onClick={() => handleSelectChallenge(challenge)}
                className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mr-2">
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                {challenge.title}
                            </h3>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingChallenge(challenge);
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                    title="Edit Challenge"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteChallenge(challenge.id);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Delete Challenge"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {challenge.habitTitle}
                        </p>
                    </div>
                    {isActive ? (
                        <div className="flex items-center gap-1 text-xs font-medium text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg shrink-0">
                            <Clock size={12} />
                            {daysRemaining}d left
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg shrink-0">
                            <Trophy size={12} />
                            Completed
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {challenge.participants.slice(0, 3).map((p, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] text-white font-bold"
                                    style={{ backgroundColor: p.avatarColor }}
                                >
                                    {p.displayName.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {challenge.participants.length > 3 && (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] items-center text-gray-600 dark:text-gray-300">
                                    +{challenge.participants.length - 3}
                                </div>
                            )}
                        </div>
                        <span className="text-xs">{challenge.participants.length} climbers</span>
                    </div>

                    <ChevronRight size={16} className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
            </div>
        );
    };

    return (
        <>
            {selectedChallenge ? (
                <ChallengeDetailView
                    challenge={selectedChallenge}
                    onBack={handleClearSelection}
                    currentUserId={userId}
                    onDelete={() => {
                        onDeleteChallenge(selectedChallenge.id);
                        handleClearSelection();
                    }}
                    onRedact={() => {
                        setEditingChallenge(selectedChallenge);
                        setIsCreateModalOpen(true);
                    }}
                    onUpdateParticipantName={(participantId, newName) => {
                        const updated = updateParticipantName(selectedChallenge, participantId, newName);
                        onUpdateChallenge(updated);
                        setSelectedChallenge(updated);
                    }}
                    onRemoveParticipant={(participantId) => {
                        const updated = removeParticipant(selectedChallenge, participantId);
                        onUpdateChallenge(updated);
                        setSelectedChallenge(updated);
                    }}
                />
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Challenges</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Turn your daily habits into a shared adventure
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsJoinModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-all"
                            >
                                <Users size={18} />
                                Join
                            </button>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium shadow-lg transition-all"
                            >
                                <Plus size={18} />
                                New Challenge
                            </button>
                        </div>
                    </div>

                    {/* activeChallenges map */}
                    {activeChallenges.length > 0 && (
                        <section>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
                                Active Climbs
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeChallenges.map(challenge => (
                                    <ChallengeCard key={challenge.id} challenge={challenge} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Empty State */}
                    {challenges.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users size={36} className="text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No challenges yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                Create a challenge or join a friend using their invite code!
                            </p>
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setIsJoinModalOpen(true)}
                                    className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                    Join w/ Code
                                </button>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                                >
                                    Create Challenge
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Past Challenges */}
                    {pastChallenges.length > 0 && (
                        <section>
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
                                Past Expeditions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pastChallenges.map(challenge => (
                                    <ChallengeCard key={challenge.id} challenge={challenge} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* Create/Edit Challenge Modal */}
            <CreateChallengeModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingChallenge(null);
                }}
                habits={habits}
                userId={userId}
                userName={userName}
                initialData={editingChallenge}
                onSave={(challenge) => {
                    if (editingChallenge) {
                        onUpdateChallenge(challenge);
                        if (selectedChallenge && selectedChallenge.id === challenge.id) {
                            setSelectedChallenge(challenge);
                        }
                    } else {
                        onCreateChallenge(challenge);
                    }
                    if (editingChallenge) {
                        setIsCreateModalOpen(false);
                        setEditingChallenge(null);
                    }
                }}
            />

            {/* Join Challenge Modal */}
            <JoinChallengeModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                onJoin={(code) => {
                    onJoinChallenge(code);
                    setIsJoinModalOpen(false);
                }}
            />
        </>
    );
};
