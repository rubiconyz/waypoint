import React, { useRef } from 'react';
import { Mountain, Users, Clock, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
    onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col items-center">

            {/* Navbar */}
            <nav className="w-full max-w-6xl px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Mountain className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Waypoint</span>
                </div>
            </nav>

            {/* Hero */}
            < main className="flex-1 w-full max-w-4xl px-6 flex flex-col items-center justify-center text-center py-12 md:py-20" >
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
                    <Trophy size={14} />
                    <span>Gamified Habit Tracker</span>
                </div>

                <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 md:mb-8 leading-tight">
                    Turn your habits into a <span className="text-blue-600 dark:text-blue-400">Journey</span>.
                </h1>

                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8 md:mb-12">
                    Stop staring at boring spreadsheets. Waypoint turns your daily tasks into a collaborative mountain climb.
                </p>

                <button
                    onClick={onStart}
                    className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-lg shadow-xl shadow-blue-500/20 transition-all hover:scale-105 flex items-center gap-3"
                >
                    Start Your Climb
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="mt-4 text-sm text-gray-400 font-medium">
                    100% Free. No hidden charges.
                </p>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-24 text-left w-full">
                    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                            <Users size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Multiplayer</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Don't grind alone. Invite friends and watch their avatars walk up the mountain in real-time.
                        </p>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center text-cyan-600 mb-4">
                            <Clock size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">History View</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Navigate through your past days to see your journey. Track your progress consistent over time.
                        </p>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Vibe First</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Designed to feel satisfying. Glassmorphism, smooth animations, and zero clutter.
                        </p>
                    </div>
                </div>
            </main >

            {/* Footer */}
            < footer className="w-full py-8 text-center text-gray-400 text-sm" >
                <p>© 2026 Waypoint.</p>
            </footer >
        </div >
    );
};
