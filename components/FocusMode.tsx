
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, Headphones, Clock, Info } from 'lucide-react';

interface FocusModeProps {
    isOpen: boolean;
    onClose: () => void;
}

const BrownNoisePlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioNode | null>(null);
    // Default to low volume as brown noise effectively masks at low levels
    const [volume, setVolume] = useState(0.5);
    const gainNodeRef = useRef<GainNode | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            setIsPlaying(false);
        };
    }, []);

    const toggleNoise = () => {
        if (isPlaying) {
            if (audioContextRef.current) {
                audioContextRef.current.suspend();
            }
            setIsPlaying(false);
        } else {
            if (!audioContextRef.current) {
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
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
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

// Visual Timer Component
const VisualTimer = () => {
    const [duration, setDuration] = useState(25 * 60); // Default 25 min
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isActive, setIsActive] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft => timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Optionally play a ding here
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    useEffect(() => {
        setTimeLeft(duration);
        setIsActive(false);
    }, [duration]);

    // Draw Visual Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const radius = width / 2 - 10;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);

        // Background Circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#e5e7eb'; // gray-200
        // Check dark mode via system preference or prop (simplified here, assume Light/Dark handled by canvas clear)
        // Ideally pass theme prop. For now, solid color.
        ctx.stroke();

        // Progress Arc
        const progress = timeLeft / duration;
        const startAngle = -0.5 * Math.PI; // Top
        const endAngle = startAngle + (2 * Math.PI * progress);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false); // Clockwise
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#4f46e5'; // indigo-600
        ctx.stroke();

    }, [timeLeft, duration]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Clock size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Visual Timer</h3>
                    <p className="text-xs text-gray-500">Combats time blindness.</p>
                </div>
            </div>

            <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4">
                    <canvas ref={canvasRef} width={200} height={200} className="w-full h-full" />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold font-mono text-gray-900 dark:text-white transition-all">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                            {isActive ? 'Focus' : 'Ready'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`flex-1 py-2 rounded-lg font-medium transition-colors ${isActive
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        {isActive ? 'Pause' : 'Start Focus'}
                    </button>
                    <button
                        onClick={() => { setIsActive(false); setTimeLeft(duration); }}
                        className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

                <div className="flex gap-2 mt-4">
                    {[5, 15, 25, 45].map(min => (
                        <button
                            key={min}
                            onClick={() => setDuration(min * 60)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${duration === min * 60
                                    ? 'bg-indigo-100 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'
                                }`}
                        >
                            {min}m
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const FocusMode: React.FC<FocusModeProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            Focus Toolkit
                        </h2>
                        <p className="text-xs text-gray-500">ADHD-friendly science-backed tools</p>
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
                            <strong>Why this works:</strong> Brown noise increases dopamine via "stochastic resonance", helping block distractions. Visual timers externalize time to combat execution paralysis.
                        </p>
                    </div>

                    <BrownNoisePlayer />
                    <VisualTimer />

                </div>
            </div>
        </div>
    );
};
