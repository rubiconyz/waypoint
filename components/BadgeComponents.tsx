import React from 'react';
import { Badge as BadgeType, BadgeProgress } from '../types';
import { Award, Lock } from 'lucide-react';

interface BadgeNotificationProps {
    badge: BadgeType;
    onClose: () => void;
}

export const BadgeNotification: React.FC<BadgeNotificationProps> = ({ badge, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-2xl p-6 max-w-sm border-2 border-yellow-300">
                <div className="flex items-start gap-4">
                    <div className="text-5xl">{badge.icon}</div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="text-white" size={20} />
                            <h3 className="font-bold text-white text-lg">Badge Unlocked!</h3>
                        </div>
                        <h4 className="font-semibold text-white text-xl mb-1">{badge.name}</h4>
                        <p className="text-yellow-50 text-sm">{badge.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-yellow-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};

interface BadgeCardProps {
    badge: BadgeType;
    progress: BadgeProgress;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, progress }) => {
    const isUnlocked = progress.unlocked;
    const currentProgress = progress.progress || 0;
    const percentage = Math.min(100, (currentProgress / badge.requirement) * 100);

    return (
        <div
            className={`relative p-4 rounded-xl border-2 transition-all ${isUnlocked
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600 shadow-md hover:shadow-lg'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                }`}
        >
            {!isUnlocked && (
                <div className="absolute top-2 right-2">
                    <Lock className="text-gray-400 dark:text-gray-500" size={16} />
                </div>
            )}

            <div className="flex flex-col items-center text-center gap-2">
                <div className={`text-4xl ${!isUnlocked && 'grayscale opacity-50'}`}>
                    {badge.icon}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white">
                    {badge.name}
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {badge.description}
                </p>

                {!isUnlocked && (
                    <div className="w-full mt-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{currentProgress}/{badge.requirement}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                )}

                {isUnlocked && progress.unlockedAt && (
                    <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        Unlocked {new Date(progress.unlockedAt).toLocaleDateString()}
                    </div>
                )}
            </div>
        </div>
    );
};
