import React, { useState, useMemo } from 'react';
import { OceanState, Habit } from '../types';
import { FISH_SPECIES, POLLUTION_STAGES, calculatePollutionLevel, getActiveFish } from '../oceanData';
import { CanvasOceanScene } from './CanvasOceanScene';
import { FishJournal } from './FishJournal';
import { Waves, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface OceanExplorerProps {
    oceanState: OceanState;
    habits: Habit[];
}

export const OceanExplorer: React.FC<OceanExplorerProps> = ({ oceanState, habits }) => {
    const [showJournal, setShowJournal] = useState(false);

    // Get actual fish objects for active fish
    const activeFishData = useMemo(() => {
        return oceanState.activeFish
            .map(id => FISH_SPECIES.find(f => f.id === id))
            .filter((f): f is NonNullable<typeof f> => f !== undefined);
    }, [oceanState.activeFish]);

    const pollutionStage = POLLUTION_STAGES[oceanState.pollutionLevel];
    const discoveryProgress = (oceanState.discoveredFish.length / FISH_SPECIES.length) * 100;

    // Calculate max streak from all habits
    const maxStreak = Math.max(0, ...habits.map(h => h.streak));

    // Get status icon
    const getStatusIcon = () => {
        if (oceanState.pollutionLevel === 0) return <CheckCircle2 className="text-green-500" size={20} />;
        if (oceanState.pollutionLevel <= 2) return <AlertTriangle className="text-yellow-500" size={20} />;
        return <AlertTriangle className="text-red-500" size={20} />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Waves className="text-blue-500" />
                        Ocean Explorer
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Build your ocean ecosystem through consistent habits
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-blue-500">
                        {oceanState.discoveredFish.length}<span className="text-lg text-gray-400">/{FISH_SPECIES.length}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Species Discovered</div>
                </div>
            </div>

            {/* Ocean Health Card */}
            <div className={`p - 4 rounded - xl border - 2 transition - all ${oceanState.pollutionLevel === 0
                    ? 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-300 dark:border-cyan-700'
                    : oceanState.pollutionLevel <= 2
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700'
                        : 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-300 dark:border-red-700'
                } `}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Ocean Health: {pollutionStage.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {pollutionStage.message}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {pollutionStage.clarity}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Water Clarity</div>
                    </div>
                </div>

                {/* Health Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                        className={`h - 3 rounded - full transition - all duration - 500 ${oceanState.pollutionLevel === 0
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                                : oceanState.pollutionLevel <= 2
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                            } `}
                        style={{ width: `${pollutionStage.clarity}% ` }}
                    />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Active Fish</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                            {oceanState.activeFish.length}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
                        <div className="text-xl font-bold text-orange-500 flex items-center justify-center gap-1">
                            <TrendingUp size={18} />
                            {maxStreak}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Recovery Days</div>
                        <div className="text-xl font-bold text-green-500">
                            {oceanState.recoveryStreak}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ocean Scene */}
            <div className="bg-white dark:bg-gray-900 rounded-xl">
                {/* Ocean Visualization */}
                <div className="relative" style={{ height: '600px' }}>
                    <CanvasOceanScene
                        pollutionLevel={oceanState.pollutionLevel}
                        activeFish={FISH_SPECIES.filter(f => oceanState.activeFish.includes(f.id))}
                    />
                </div>
            </div>

            {/* Journal Toggle */}
            <div className="flex justify-center">
                <button
                    onClick={() => setShowJournal(!showJournal)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                    📖 {showJournal ? 'Hide' : 'View'} Discovery Journal
                </button>
            </div>

            {/* Fish Journal */}
            {showJournal && (
                <FishJournal discoveredFish={oceanState.discoveredFish} />
            )}

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    💡 How It Works
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Complete habits to maintain your ocean's health</li>
                    <li>• Unlock new fish species by building longer streaks</li>
                    <li>• Missing habits causes pollution - fish will migrate away</li>
                    <li>• Resume your habits to clean the ocean and bring fish back</li>
                    <li>• Discover all {FISH_SPECIES.length} species!</li>
                </ul>
            </div>
        </div>
    );
};
