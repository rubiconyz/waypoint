import React, { useState, useRef, useEffect } from 'react';
import { Habit } from '../types';
import { Mountain, Lock, Unlock, Play, Coins, MapPin, CheckCircle2 } from 'lucide-react';

interface MountainClimberProps {
    habits: Habit[];
    coins: number;
    unlockedCheckpoints: number[];
    onUnlockCheckpoint: (id: number, cost: number) => void;
}

// Configuration
const CHECKPOINT_DATA = [
    { id: 0, name: "Base Camp", cost: 0, image: "1.png", video: "scene1.mp4", altitude: 0 },
    { id: 1, name: "Foothills", cost: 5, image: "2.png", video: "scene2.mp4", altitude: 1000 },
    { id: 2, name: "High Pass", cost: 10, image: "3new.png", video: "scene3.mp4", altitude: 2500 },
    { id: 3, name: "Rocky Ridge", cost: 15, image: "4.png", video: "scene4.mp4", altitude: 4000 },
    { id: 4, name: "Snow Line", cost: 20, image: "5.png", video: "scene5.mp4", altitude: 6000 },
    { id: 5, name: "Ice Wall", cost: 25, image: "6.png", video: "scene6.mp4", altitude: 7500 },
    { id: 6, name: "The Summit", cost: 30, image: "7.png", video: "scene7.mp4", altitude: 8848 },
    { id: 7, name: "Beyond", cost: 50, image: "8.png", video: null, altitude: 10000 },
];

export const MountainClimber: React.FC<MountainClimberProps> = ({
    habits,
    coins,
    unlockedCheckpoints,
    onUnlockCheckpoint
}) => {
    // State
    const [isUnlocking, setIsUnlocking] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Derived State
    const highestUnlockedId = Math.max(...unlockedCheckpoints);

    const currentCheckpoint = CHECKPOINT_DATA.find(c => c.id === highestUnlockedId) || CHECKPOINT_DATA[0];
    const nextCheckpoint = CHECKPOINT_DATA.find(c => c.id === highestUnlockedId + 1);

    // Video Logic:
    // We always show the video associated with the CURRENT checkpoint.
    // - Resting: Paused at start (View of path ahead).
    // - Unlocking: Play from start (Climb the path).
    // - Post-Unlock: Current changes to Next -> Video updates to Next -> Paused at start.
    const videoSource = currentCheckpoint.video || "scene7.mp4";

    // Handlers
    const handleUnlock = () => {
        if (!nextCheckpoint || coins < nextCheckpoint.cost) return;
        setIsUnlocking(true);
        // The effect below will trigger playback when isUnlocking becomes true
    };

    const handleVideoEnd = () => {
        if (isUnlocking && nextCheckpoint) {
            // Actual Logic: Deduct coins and Unlock the next stage
            onUnlockCheckpoint(nextCheckpoint.id, nextCheckpoint.cost);
            setIsUnlocking(false);
            // After this, 'highestUnlockedId' increments.
            // 'currentCheckpoint' becomes what was 'nextCheckpoint'.
            // 'videoSource' stays the same (sceneX), avoiding a jump.
        }
    };

    // Effect to manage video playback/reloading
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Determine if we need to load or play
        const isTransitioning = isUnlocking;

        if (isTransitioning) {
            video.muted = false;
            video.play().catch(e => console.log("Play failed", e));
        } else {
            video.muted = true;
            video.pause();
            video.currentTime = 0; // Reset to start for the "Frozen" background look
        }
    }, [videoSource, isUnlocking]);

    /* 
       Note: When 'videoSource' changes (e.g. static -> unlock transition), 
       React updates the <video src>. The browser loads the new source.
       We might need to wait for load, but usually standard tag handles it fast enough for local assets.
       If glitchy, we could add onLoadedData handler.
    */

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Current Altitude</h2>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1 flex items-baseline gap-1">
                            {currentCheckpoint.altitude}
                            <span className="text-sm font-normal text-gray-500">m</span>
                        </div>
                        <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-1">
                            {currentCheckpoint.name}
                        </div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl">
                        <Mountain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">Available Funds</h2>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1 flex items-baseline gap-1">
                            {coins}
                            <span className="text-sm font-normal text-gray-500">coins</span>
                        </div>
                        <div className="text-green-600 dark:text-green-400 text-sm font-medium mt-1">
                            +1 per habit completed
                        </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-xl">
                        <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                </div>
            </div>

            {/* Main Visual Area */}
            <div className="relative w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800">
                {/* Background Video (Acts as both static bg and transition) */}
                <video
                    ref={videoRef}
                    src={`/assets/mountain_animation/${videoSource}`}
                    className="w-full h-auto block object-contain transition-opacity duration-700"
                    playsInline
                    onEnded={handleVideoEnd}
                    preload="auto"
                />

                {/* Optional: Add a "Play" hint if user wants to re-watch? No, keep it simple. */}
            </div>

            {/* Next Checkpoint / Unlock Section */}
            {nextCheckpoint ? (
                <div className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-1 shadow-lg transform transition-all hover:scale-[1.01]">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-full ${coins >= nextCheckpoint.cost ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                {coins >= nextCheckpoint.cost ? (
                                    <Unlock className="w-6 h-6 text-green-600 dark:text-green-400" />
                                ) : (
                                    <Lock className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Next: {nextCheckpoint.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <MapPin size={14} />
                                    <span>{nextCheckpoint.altitude}m</span>
                                    <span>•</span>
                                    <span>Cost: {nextCheckpoint.cost} Coins</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleUnlock}
                            disabled={coins < nextCheckpoint.cost}
                            className={`
                                relative px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all
                                ${coins >= nextCheckpoint.cost
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                                    : 'bg-gray-300 dark:bg-gray-800 cursor-not-allowed opacity-70'}
                            `}
                        >
                            {coins >= nextCheckpoint.cost ? (
                                <span className="flex items-center gap-2">
                                    Unlock Now <Unlock size={18} />
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Need {nextCheckpoint.cost - coins} More Coins <Lock size={18} />
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
                    <div className="inline-flex p-4 rounded-full bg-green-200 dark:bg-green-800/50 mb-4">
                        <CheckCircle2 className="w-12 h-12 text-green-700 dark:text-green-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">Summit Reached!</h2>
                    <p className="text-green-700 dark:text-green-300">
                        You have conquered the mountain! Stay tuned for more challenges.
                    </p>
                </div>
            )}

            {/* Timeline / Map (Simplified) */}
            <div className="mt-12 py-4 overflow-x-auto">
                <div className="flex items-center gap-4 min-w-max px-2">
                    {CHECKPOINT_DATA.map((cp, idx) => {
                        const isUnlocked = unlockedCheckpoints.includes(cp.id);
                        const isCurrent = currentCheckpoint.id === cp.id;

                        return (
                            <div key={cp.id} className="flex items-center">
                                <div className={`
                                    flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                                    ${isCurrent ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-110' :
                                        isUnlocked ? 'border-green-500/50 bg-green-50/50 dark:bg-transparent' :
                                            'border-gray-200 dark:border-gray-800 opacity-50'}
                                `}>
                                    <div className="text-xs font-bold text-gray-500">{cp.altitude}m</div>
                                    <div className={`w-3 h-3 rounded-full ${isUnlocked ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </div>
                                {idx < CHECKPOINT_DATA.length - 1 && (
                                    <div className={`w-8 h-0.5 ${unlockedCheckpoints.includes(CHECKPOINT_DATA[idx + 1].id) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
