
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, Headphones, Clock, Info } from 'lucide-react';

interface FocusModeProps {
    isOpen: boolean;
    onClose: () => void;
}

const BrownNoisePlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    // Default to low volume as brown noise effectively masks at low levels
    const [volume, setVolume] = useState(0.5);
    const gainNodeRef = useRef<GainNode | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup: Stop source node first, then close context
            if (sourceNodeRef.current) {
                try {
                    sourceNodeRef.current.stop();
                } catch (e) { /* Already stopped */ }
                sourceNodeRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            setIsPlaying(false);
        };
    }, []);

    const toggleNoise = () => {
        if (isPlaying) {
            // Suspend context (keeps source ready for resume)
            if (audioContextRef.current) {
                audioContextRef.current.suspend();
            }
            setIsPlaying(false);
        } else {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                // Initialize Audio Context on first play (requires user gesture)
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                const ctx = new AudioContext();
                audioContextRef.current = ctx;

                // Create Brown Noise Buffer
                const bufferSize = 2 * ctx.sampleRate; // 2 seconds buffer
                const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);

                let lastOut = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    // Brownian motion algorithm: integrate white noise
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 3.5; // Compensate for gain loss
                }

                // Loop source
                const noiseSource = ctx.createBufferSource();
                noiseSource.buffer = noiseBuffer;
                noiseSource.loop = true;
                noiseSource.start(0);
                sourceNodeRef.current = noiseSource; // Store for cleanup

                // Gain (Volume) Node
                const gainNode = ctx.createGain();
                gainNode.gain.value = volume;
                gainNodeRef.current = gainNode;

                // Connect
                noiseSource.connect(gainNode);
                gainNode.connect(ctx.destination);
            } else {
                audioContextRef.current.resume();
            }
            setIsPlaying(true);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVol = parseFloat(e.target.value);
        setVolume(newVol);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = newVol;
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                    <Headphones size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Brown Noise</h3>
                    <p className="text-xs text-gray-500">Boosts concentration via stochastic resonance.</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleNoise}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${isPlaying
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    {isPlaying ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Play</>}
                </button>

                {isPlaying && (
                    <div className="flex items-center gap-2 w-24">
                        <Volume2 size={16} className="text-gray-400" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Visual Timer Removed as per user request (redundant with task timers)

export const FocusMode: React.FC<FocusModeProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Focus Audio
                        </h2>
                        <p className="text-xs text-gray-500">Science-backed Brown Noise for concentration</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto">

                    {/* Information / Science Tip */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                        <Info className="shrink-0 mt-0.5" size={16} />
                        <p>
                            <strong>Why this works:</strong> Brown noise increases dopamine via "stochastic resonance", helping block distractions.
                        </p>
                    </div>

                    <BrownNoisePlayer />

                </div>
            </div>
        </div>
    );
};
