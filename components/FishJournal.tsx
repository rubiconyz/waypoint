import React, { useState } from 'react';
import { Fish, FishRarity } from '../types';
import { FISH_SPECIES } from '../oceanData';
import { Lock, Sparkles, Award } from 'lucide-react';

interface FishJournalProps {
    discoveredFish: string[];
}

export const FishJournal: React.FC<FishJournalProps> = ({ discoveredFish }) => {
    const [selectedFish, setSelectedFish] = useState<Fish | null>(null);
    const [filterRarity, setFilterRarity] = useState<FishRarity | 'all'>('all');

    const fishData = FISH_SPECIES.map(fish => ({
        fish,
        discovered: discoveredFish.includes(fish.id)
    }));

    const filteredFish = filterRarity === 'all'
        ? fishData
        : fishData.filter(f => f.fish.rarity === filterRarity);

    const rarityColors = {
        starter: 'from-gray-400 to-gray-600',
        common: 'from-green-400 to-green-600',
        rare: 'from-blue-400 to-blue-600',
        legendary: 'from-purple-400 to-purple-600',
        special: 'from-yellow-400 to-yellow-600'
    };

    const rarityIcons = {
        starter: null,
        common: null,
        rare: <Sparkles size={14} />,
        legendary: <Award size={14} />,
        special: <Sparkles size={14} className="text-yellow-400" />
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                    📖 Discovery Journal
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {discoveredFish.length}/{FISH_SPECIES.length} Discovered
                </span>
            </div>

            {/* Rarity Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {(['all', 'starter', 'common', 'rare', 'legendary', 'special'] as const).map(rarity => (
                    <button
                        key={rarity}
                        onClick={() => setFilterRarity(rarity)}
                        className={`px-3 py-1 text-xs rounded-full transition-all ${filterRarity === rarity
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                    </button>
                ))}
            </div>

            {/* Fish Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-4">
                {filteredFish.map(({ fish, discovered }) => (
                    <button
                        key={fish.id}
                        onClick={() => discovered && setSelectedFish(fish)}
                        className={`relative aspect-square rounded-lg border-2 transition-all ${discovered
                                ? `bg-gradient-to-br ${rarityColors[fish.rarity]} border-transparent hover:scale-110 cursor-pointer`
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-default'
                            }`}
                        title={discovered ? fish.name : '???'}
                    >
                        {/* Rarity icon */}
                        {discovered && rarityIcons[fish.rarity] && (
                            <div className="absolute top-0.5 right-0.5 text-white">
                                {rarityIcons[fish.rarity]}
                            </div>
                        )}

                        {/* Fish emoji/silhouette */}
                        <div className={`flex items-center justify-center w-full h-full text-2xl ${discovered ? '' : 'opacity-20'
                            }`}>
                            {discovered ? fish.emoji : '🐟'}
                        </div>

                        {/* Lock icon for undiscovered */}
                        {!discovered && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Lock size={16} className="text-gray-400 dark:text-gray-600" />
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Selected Fish Detail */}
            {selectedFish && (
                <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-start gap-4">
                        <div className="text-5xl">{selectedFish.emoji}</div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {selectedFish.name}
                                </h4>
                                <span className={`px-2 py-0.5 text-xs rounded-full bg-gradient-to-r ${rarityColors[selectedFish.rarity]} text-white`}>
                                    {selectedFish.rarity}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {selectedFish.description}
                            </p>
                            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-500">
                                <span>Size: {selectedFish.size}</span>
                                {selectedFish.unlockStreak > 0 && (
                                    <span>Unlocked at: {selectedFish.unlockStreak} day streak</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedFish(null)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {discoveredFish.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <p className="text-sm">Complete habits to discover your first fish!</p>
                </div>
            )}
        </div>
    );
};
