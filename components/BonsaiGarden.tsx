import React from 'react';
import { GardenState } from '../types';
import { BONSAI_STAGES, getCurrentStageInfo, getDaysUntilNextStage } from '../bonsaiData';
import { Sprout } from 'lucide-react';

interface BonsaiGardenProps {
    gardenState: GardenState;
}

export const BonsaiGarden: React.FC<BonsaiGardenProps> = ({ gardenState }) => {
    const stageInfo = getCurrentStageInfo(gardenState.dayStreak);
    const daysUntilNext = getDaysUntilNextStage(gardenState.dayStreak);

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 transition-colors">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Sprout className="w-10 h-10 text-green-600" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                            Zen Garden
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg italic">
                        "{stageInfo.quote}"
                    </p>
                </div>

                {/* Main Garden Scene */}
                <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-sky-200 via-amber-100 to-stone-300 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" style={{ height: '600px' }}>
                    {/* Japanese Garden Background */}
                    <div className="absolute inset-0">
                        {/* Sky with clouds */}
                        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-orange-200 to-amber-100"></div>

                        {/* Distant mountains */}
                        <svg className="absolute bottom-0 w-full opacity-20" viewBox="0 0 1000 200" preserveAspectRatio="none">
                            <path d="M0,100 Q250,20 500,80 T1000,100 L1000,200 L0,200 Z" fill="#4A5568" />
                        </svg>

                        {/* Ground/Floor */}
                        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-b from-stone-400 to-stone-500"></div>

                        {/* Bamboo fence background */}
                        <div className="absolute bottom-0 left-0 right-0 h-64 flex justify-between px-12 opacity-30">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="w-4 bg-gradient-to-b from-amber-700 to-amber-900 rounded-sm"></div>
                            ))}
                        </div>

                        {/* Stone pathway */}
                        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-4">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-16 h-12 bg-stone-600 rounded-full opacity-40"
                                    style={{
                                        transform: `rotate(${Math.random() * 10 - 5}deg)`,
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>

                    {/* Bonsai Tree Container */}
                    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
                        {/* Bonsai Stage Image */}
                        <div className="relative w-[800px] h-[408px] flex items-center justify-center">
                            <img
                                src={`/assets/bonsai/stage_${gardenState.currentStage}.png`}
                                alt={stageInfo.name}
                                className="w-full h-full object-contain rounded-xl shadow-2xl"
                                onError={(e) => {
                                    // Fallback to emoji if image not found
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'block';
                                }}
                            />
                            {/* Fallback placeholder for stages without images */}
                            <div className="text-center" style={{ display: 'none' }}>
                                <div className="text-8xl mb-4">
                                    {gardenState.currentStage === 1 && '🌱'}
                                    {gardenState.currentStage === 2 && '🌿'}
                                    {gardenState.currentStage === 3 && '🪴'}
                                    {gardenState.currentStage === 4 && '🌳'}
                                    {gardenState.currentStage === 5 && '🌲'}
                                    {gardenState.currentStage === 6 && '🎋'}
                                    {gardenState.currentStage === 7 && '🌸'}
                                    {gardenState.currentStage === 8 && '🌺'}
                                    {gardenState.currentStage === 9 && '🌸'}
                                </div>
                                <div className="px-8 py-4 bg-amber-900 text-amber-50 rounded-xl shadow-lg">
                                    <p className="text-sm font-semibold">Stage {gardenState.currentStage}</p>
                                    <p className="text-xs opacity-80">Awaiting image asset</p>
                                </div>
                            </div>
                        </div>

                        {/* Shadow beneath pot - commented out as it clashes with user's baked-in shadows */}
                        {/* <div className="w-48 h-6 bg-black opacity-20 rounded-full blur-md -mt-8"></div> */}
                    </div>

                    {/* Decorative elements */}
                    {/* Stone lantern (left) */}
                    <div className="absolute bottom-36 left-24 opacity-60">
                        <div className="w-12 h-4 bg-stone-700 rounded-sm mb-1"></div>
                        <div className="w-10 h-16 bg-stone-600 mx-auto rounded"></div>
                        <div className="w-8 h-12 bg-stone-700 mx-auto rounded-sm"></div>
                        <div className="w-12 h-4 bg-stone-700 rounded-sm"></div>
                    </div>

                    {/* Small plant (right) */}
                    <div className="absolute bottom-40 right-32 text-4xl opacity-70">
                        🎍
                    </div>
                </div>

                {/* Garden Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500 dark:border-green-400 transition-colors">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Current Stage</div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{gardenState.currentStage} / 10</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stageInfo.name}</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 dark:border-blue-400 transition-colors">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Day Streak</div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{gardenState.dayStreak}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Consecutive days</div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 dark:border-purple-400 transition-colors">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Next Growth</div>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            {daysUntilNext === null ? '✓' : daysUntilNext}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {daysUntilNext === null ? 'Masterpiece!' : `${daysUntilNext} day${daysUntilNext > 1 ? 's' : ''} to go`}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-amber-500 dark:border-amber-400 transition-colors">
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Days</div>
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{gardenState.totalDaysCultivated}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cultivated</div>
                    </div>
                </div>

                {/* Stage Description */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-t-4 border-green-500 dark:border-green-400 transition-colors">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{stageInfo.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">{stageInfo.description}</p>

                    {/* Progress to next stage */}
                    {daysUntilNext !== null && (
                        <div className="mt-6">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                                <span>Progress to Stage {gardenState.currentStage + 1}</span>
                                <span>{gardenState.dayStreak} / {BONSAI_STAGES[gardenState.currentStage].minDays} days</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(100, (gardenState.dayStreak / BONSAI_STAGES[gardenState.currentStage].minDays) * 100)}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Growth Stages Reference */}
                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Growth Stages</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {BONSAI_STAGES.map((stage) => (
                            <div
                                key={stage.stage}
                                className={`p-4 rounded-lg text-center transition-all ${stage.stage === gardenState.currentStage
                                    ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-400 shadow-md'
                                    : stage.stage < gardenState.currentStage
                                        ? 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-50'
                                    }`}
                            >
                                <div className="text-2xl mb-2">
                                    {stage.stage <= gardenState.currentStage ? '✓' : '🔒'}
                                </div>
                                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">{stage.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stage.minDays}+ days</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
