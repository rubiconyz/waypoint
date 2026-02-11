import React, { useState } from 'react';
import { Dumbbell, Plus, Clock, Calendar, Trash2, ChevronDown, ChevronUp, Activity, Pencil, X, Settings, Play, CheckCircle2, Zap, Target, BarChart3, Flame } from 'lucide-react';
import { MuscleBodySVG } from './MuscleBodySVG';
import { RecoveryCalendar } from './RecoveryCalendar';
import { MUSCLE_GROUPS, getRecoveryColor, getRecoveryStatus, getMuscleRecoveryPercentage, getHoursUntilRecovered } from '../muscleRecoveryData';
import { WorkoutLog, WorkoutIntensity, TrainingProgramState } from '../types';
import { TRAINING_PROGRAMS, getTodaysProgramDay, getMuscleNames, getProgram } from '../trainingPrograms';

interface MuscleRecoveryTabProps {
    workoutLogs: WorkoutLog[];
    onAddWorkout: (log: Omit<WorkoutLog, 'id' | 'createdAt'>) => void;
    onDeleteWorkout: (id: string) => void;
    onUpdateWorkout: (log: WorkoutLog) => void;
    trainingProgram: TrainingProgramState;
    onProgramChange: (program: TrainingProgramState) => void;
}

export const MuscleRecoveryTab: React.FC<MuscleRecoveryTabProps> = ({
    workoutLogs,
    onAddWorkout,
    onDeleteWorkout,
    onUpdateWorkout,
    trainingProgram,
    onProgramChange,
}) => {
    const [isLogging, setIsLogging] = useState(false);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [intensity, setIntensity] = useState<WorkoutIntensity>('moderate');
    const [notes, setNotes] = useState('');
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
    const [showHistory, setShowHistory] = useState(false);
    const [showProgramSelector, setShowProgramSelector] = useState(false);

    // Get today's program day - use currentDayIndex for user selection
    const currentProgram = trainingProgram.selectedProgramId ? getProgram(trainingProgram.selectedProgramId) : null;
    const todaysDay = currentProgram
        ? currentProgram.days[trainingProgram.currentDayIndex % currentProgram.days.length]
        : null;

    const handleMuscleClick = (muscleId: string) => {
        if (!isLogging) return;
        setSelectedMuscles(prev =>
            prev.includes(muscleId)
                ? prev.filter(id => id !== muscleId)
                : [...prev, muscleId]
        );
    };

    const handleEditWorkout = (log: WorkoutLog) => {
        setEditingLogId(log.id);
        setSelectedMuscles(log.muscleGroups);
        setIntensity(log.intensity);
        setNotes(log.notes || '');
        setWorkoutDate(log.date);
        setIsLogging(true);
        // Scroll to top or ensure logging section is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelLogging = () => {
        setIsLogging(false);
        setEditingLogId(null);
        setSelectedMuscles([]);
        setIntensity('moderate');
        setNotes('');
        setWorkoutDate(new Date().toISOString().split('T')[0]);
    };

    const handleSubmitWorkout = () => {
        if (selectedMuscles.length === 0) return;

        if (editingLogId) {
            // Update existing log
            const existingLog = workoutLogs.find(log => log.id === editingLogId);
            if (existingLog) {
                onUpdateWorkout({
                    ...existingLog,
                    date: workoutDate,
                    muscleGroups: selectedMuscles,
                    intensity,
                    notes: notes.trim() || undefined,
                });
            }
        } else {
            // Create new log
            onAddWorkout({
                date: workoutDate,
                muscleGroups: selectedMuscles,
                intensity,
                notes: notes.trim() || undefined,
            });
        }

        handleCancelLogging();
    };

    // Calculate muscle stats
    const muscleStats = MUSCLE_GROUPS.map(muscle => ({
        ...muscle,
        recoveryPercent: getMuscleRecoveryPercentage(muscle.id, workoutLogs),
        hoursRemaining: getHoursUntilRecovered(muscle.id, workoutLogs),
    })).sort((a, b) => a.recoveryPercent - b.recoveryPercent);

    const needsRest = muscleStats.filter(m => m.recoveryPercent < 50);
    const readyToTrain = muscleStats.filter(m => m.recoveryPercent >= 100);
    const recovering = muscleStats.filter(m => m.recoveryPercent >= 50 && m.recoveryPercent < 100);

    // Format hours remaining for display
    const formatTimeRemaining = (hours: number): string => {
        if (hours === 0) return 'Ready';
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    };

    // Calculate overall recovery percentage
    const overallRecovery = Math.round(
        muscleStats.reduce((sum, m) => sum + Math.min(m.recoveryPercent, 100), 0) / muscleStats.length
    );

    return (
        <div className="space-y-6">
            {/* Premium Header with Glass Effect */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-red-500/25 to-orange-500/15 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-br from-rose-500/15 to-red-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-600/10 to-red-500/10 rounded-full blur-3xl" />
                </div>

                {/* Glass Overlay Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl blur-lg opacity-50" />
                                <div className="relative p-3.5 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-2xl">
                                    <Activity size={28} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                    Muscle Recovery
                                </h2>
                                <p className="text-red-200/70 text-sm mt-0.5">Track your recovery, optimize your gains</p>
                            </div>
                        </div>

                        <button
                            onClick={isLogging ? handleCancelLogging : () => setIsLogging(true)}
                            className={`group relative px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2.5 transition-all duration-300 ${isLogging
                                ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02]'
                                }`}
                        >
                            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                            {isLogging ? (
                                <>
                                    <X size={18} />
                                    <span>Cancel</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    <span>Log Workout</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Recovery Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        {/* Overall Recovery */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <Target size={16} className="text-emerald-400" />
                                    </div>
                                    <span className="text-xs text-white/60 font-medium">Overall</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white">{overallRecovery}</span>
                                    <span className="text-emerald-400 text-sm">%</span>
                                </div>
                                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                                        style={{ width: `${overallRecovery}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ready to Train */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <Zap size={16} className="text-green-400" />
                                    </div>
                                    <span className="text-xs text-white/60 font-medium">Ready</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white">{readyToTrain.length}</span>
                                    <span className="text-green-400 text-sm">muscles</span>
                                </div>
                            </div>
                        </div>

                        {/* Recovering */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                        <Clock size={16} className="text-amber-400" />
                                    </div>
                                    <span className="text-xs text-white/60 font-medium">Recovering</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white">{recovering.length}</span>
                                    <span className="text-amber-400 text-sm">muscles</span>
                                </div>
                            </div>
                        </div>

                        {/* Workouts Logged */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                        <Flame size={16} className="text-red-400" />
                                    </div>
                                    <span className="text-xs text-white/60 font-medium">Logged</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white">{workoutLogs.length}</span>
                                    <span className="text-red-400 text-sm">workouts</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Workout Section - Premium Card */}
            {currentProgram && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-gray-200/40 dark:shadow-gray-900/40">
                    {/* Subtle Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.05),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.05),transparent_50%)]" />

                    <div className="relative p-5 sm:p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 flex items-center justify-center text-2xl shadow-lg shadow-red-500/10">
                                    {currentProgram.icon}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{currentProgram.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {currentProgram.daysPerWeek} days per week
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProgramSelector(true)}
                                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-xl transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 group"
                                title="Change program"
                            >
                                <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Day Picker - Premium Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide -mx-1 px-1">
                            {currentProgram.days.filter((d, i, arr) => {
                                if (d.isRestDay) {
                                    return arr.findIndex(x => x.isRestDay) === i;
                                }
                                return true;
                            }).map((day, index) => {
                                const isSelected = todaysDay?.name === day.name;
                                return (
                                    <button
                                        key={`${day.name}-${index}`}
                                        onClick={() => {
                                            const dayIndex = currentProgram.days.findIndex(d => d.name === day.name);
                                            if (dayIndex !== -1) {
                                                onProgramChange({
                                                    ...trainingProgram,
                                                    currentDayIndex: dayIndex,
                                                });
                                            }
                                        }}
                                        className={`relative px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-300 ${isSelected
                                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 scale-105'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-[1.02]'
                                            }`}
                                    >
                                        {day.isRestDay ? '😴 Rest' : day.name}
                                        {isSelected && (
                                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected Day Content */}
                        {todaysDay?.isRestDay ? (
                            <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 rounded-2xl p-6 text-center border border-red-100 dark:border-red-800/50">
                                <div className="text-5xl mb-3">😴</div>
                                <p className="font-bold text-xl text-gray-800 dark:text-white mb-1">Rest Day</p>
                                <p className="text-gray-600 dark:text-gray-400">Recovery is just as important as training!</p>
                            </div>
                        ) : todaysDay ? (
                            <>
                                <div className="flex flex-wrap gap-2.5 mb-5">
                                    {todaysDay.muscles.map(muscleId => {
                                        const recoveryPercent = getMuscleRecoveryPercentage(muscleId, workoutLogs);
                                        const isReady = recoveryPercent >= 100;
                                        const muscle = MUSCLE_GROUPS.find(m => m.id === muscleId);
                                        return (
                                            <div
                                                key={muscleId}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isReady
                                                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50'
                                                    : 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50'
                                                    }`}
                                            >
                                                {isReady ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                                                {muscle?.name}
                                                <span className="text-xs opacity-70">
                                                    {Math.min(recoveryPercent, 100)}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedMuscles(todaysDay.muscles);
                                        setIsLogging(true);
                                    }}
                                    className="w-full relative overflow-hidden bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-600 hover:via-orange-600 hover:to-amber-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.01] group"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                    <Play size={20} fill="currentColor" />
                                    Start {todaysDay.name} Workout
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Program Selector Modal - Premium Design */}
            {showProgramSelector && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowProgramSelector(false)}>
                    <div
                        className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />

                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Training Program</h3>
                                <button
                                    onClick={() => setShowProgramSelector(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* No program option */}
                                <button
                                    onClick={() => {
                                        onProgramChange({ selectedProgramId: null, currentDayIndex: 0, programStartDate: '' });
                                        setShowProgramSelector(false);
                                    }}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${!trainingProgram.selectedProgramId
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/20'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-2xl">
                                            🎯
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">No Program</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Train freely without a schedule</p>
                                        </div>
                                    </div>
                                </button>

                                {TRAINING_PROGRAMS.map(program => (
                                    <button
                                        key={program.id}
                                        onClick={() => {
                                            onProgramChange({
                                                selectedProgramId: program.id,
                                                currentDayIndex: 0,
                                                programStartDate: new Date().toISOString().split('T')[0],
                                            });
                                            setShowProgramSelector(false);
                                        }}
                                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${trainingProgram.selectedProgramId === program.id
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 flex items-center justify-center text-2xl shadow-inner">
                                                {program.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-gray-800 dark:text-white">{program.name}</p>
                                                    <span className="text-xs px-2.5 py-0.5 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 rounded-full text-red-600 dark:text-red-300 font-medium">
                                                        {program.daysPerWeek}x/week
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{program.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No program CTA - Premium */}
            {!currentProgram && (
                <button
                    onClick={() => setShowProgramSelector(true)}
                    className="w-full relative overflow-hidden group p-6 bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col items-center gap-3 py-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Dumbbell size={28} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-center">
                            <span className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                Choose a Training Program
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PPL, Bro Split, Upper/Lower & more</p>
                        </div>
                    </div>
                </button>
            )}

            {/* Body Visualization - Ultra Premium */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-rose-500/15 to-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="relative z-10">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-4">
                            {isLogging ? (
                                <>
                                    <Pencil size={16} className="text-red-400" />
                                    <span className="text-sm font-medium text-white/90">
                                        {editingLogId ? 'Edit Workout' : 'Select Muscles'}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Activity size={16} className="text-emerald-400" />
                                    <span className="text-sm font-medium text-white/90">Recovery Status</span>
                                </>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                            {isLogging ? 'Tap muscles you trained' : 'Your Body Map'}
                        </h3>
                    </div>

                    <MuscleBodySVG
                        workoutLogs={workoutLogs}
                        selectedMuscles={selectedMuscles}
                        onMuscleClick={isLogging ? handleMuscleClick : undefined}
                        isSelectionMode={isLogging}
                    />

                    {/* Legend - Premium Pills */}
                    {!isLogging && (
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {[
                                { color: 'from-emerald-400 to-green-400', bgColor: 'bg-emerald-500/20', label: 'Recovered' },
                                { color: 'from-amber-400 to-yellow-400', bgColor: 'bg-amber-500/20', label: 'Recovering' },
                                { color: 'from-orange-400 to-amber-400', bgColor: 'bg-orange-500/20', label: 'Fatigued' },
                                { color: 'from-red-400 to-rose-400', bgColor: 'bg-red-500/20', label: 'Needs Rest' },
                            ].map(item => (
                                <div
                                    key={item.label}
                                    className={`flex items-center gap-2 px-4 py-2 ${item.bgColor} backdrop-blur-sm rounded-full border border-white/5`}
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${item.color}`} />
                                    <span className="text-sm text-white/80 font-medium">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Selection Mode Controls - Glass Card */}
            {isLogging && (
                <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xl shadow-gray-200/30 dark:shadow-gray-900/30">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />

                    <div className="relative space-y-5">
                        {/* Date Picker */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 block flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                Date
                            </label>
                            <input
                                type="date"
                                value={workoutDate}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setWorkoutDate(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Selected Muscles Pills */}
                        {selectedMuscles.length > 0 && (
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 block">
                                    Selected Muscles ({selectedMuscles.length})
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMuscles.map(muscleId => {
                                        const muscle = MUSCLE_GROUPS.find(m => m.id === muscleId);
                                        return (
                                            <span
                                                key={muscleId}
                                                className="group px-3.5 py-1.5 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/40 dark:to-orange-900/40 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium flex items-center gap-2 border border-red-200/50 dark:border-red-700/50 transition-all hover:shadow-md"
                                            >
                                                {muscle?.name}
                                                <button
                                                    onClick={() => setSelectedMuscles(prev => prev.filter(id => id !== muscleId))}
                                                    className="w-4 h-4 rounded-full bg-red-200 dark:bg-red-700 flex items-center justify-center hover:bg-red-300 dark:hover:bg-red-600 transition-colors"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Intensity Selector */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 block flex items-center gap-2">
                                <Flame size={14} className="text-gray-400" />
                                Workout Intensity
                            </label>
                            <div className="flex gap-3">
                                {(['light', 'moderate', 'heavy'] as const).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setIntensity(level)}
                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${intensity === level
                                            ? level === 'light'
                                                ? 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20'
                                                : level === 'moderate'
                                                    ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-300 border-2 border-amber-400 shadow-lg shadow-amber-500/20'
                                                    : 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-700 dark:text-red-300 border-2 border-red-400 shadow-lg shadow-red-500/20'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5 block">
                                Notes (optional)
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g., Chest & tricep day, heavy bench press"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 outline-none transition-all"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmitWorkout}
                            disabled={selectedMuscles.length === 0}
                            className="w-full relative overflow-hidden py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.01] group"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                            <Dumbbell size={20} />
                            {editingLogId ? 'Update Workout' : `Log Workout (${selectedMuscles.length} muscle${selectedMuscles.length !== 1 ? 's' : ''})`}
                        </button>
                    </div>
                </div>
            )}

            {/* Suggested Muscles - Ready to Train - Premium Card */}
            {!isLogging && readyToTrain.length > 0 && (
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl p-5 border border-emerald-200/60 dark:border-emerald-700/40">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-3xl" />

                    <div className="relative">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            Ready to Train
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {readyToTrain.slice(0, 8).map(muscle => (
                                <span
                                    key={muscle.id}
                                    className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium border border-emerald-200/50 dark:border-emerald-700/50 shadow-sm"
                                >
                                    {muscle.name}
                                </span>
                            ))}
                            {readyToTrain.length > 8 && (
                                <span className="px-4 py-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                    +{readyToTrain.length - 8} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Workouts - Premium Cards */}
            {workoutLogs.length > 0 && (
                <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xl shadow-gray-200/30 dark:shadow-gray-900/30">
                    <div className="absolute top-0 left-0 w-60 h-60 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />

                    <div className="relative">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <Calendar size={18} className="text-red-500" />
                            </div>
                            Recent Workouts
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin -mx-1 px-1">
                            {[...workoutLogs]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 10)
                                .map(log => (
                                    <div
                                        key={log.id}
                                        className="flex-shrink-0 w-52 p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-xl group hover:shadow-lg transition-all duration-300 relative border border-gray-100 dark:border-gray-700/50"
                                    >
                                        {/* Hover Actions */}
                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditWorkout(log)}
                                                className="p-1.5 bg-white dark:bg-gray-700 text-gray-400 hover:text-blue-500 rounded-lg shadow-sm transition-all hover:shadow-md"
                                                title="Edit"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                onClick={() => onDeleteWorkout(log.id)}
                                                className="p-1.5 bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 rounded-lg shadow-sm transition-all hover:shadow-md"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>

                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {new Date(log.date).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </div>
                                        <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-lg font-medium ${log.intensity === 'light'
                                            ? 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40 text-emerald-700 dark:text-emerald-300'
                                            : log.intensity === 'moderate'
                                                ? 'bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-300'
                                                : 'bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/40 dark:to-rose-900/40 text-red-700 dark:text-red-300'
                                            }`}>
                                            {log.intensity}
                                        </span>
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {log.muscleGroups.slice(0, 3).map(muscleId => {
                                                const muscle = MUSCLE_GROUPS.find(m => m.id === muscleId);
                                                return (
                                                    <span
                                                        key={muscleId}
                                                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg"
                                                    >
                                                        {muscle?.name}
                                                    </span>
                                                );
                                            })}
                                            {log.muscleGroups.length > 3 && (
                                                <span className="text-xs text-gray-500 px-1">+{log.muscleGroups.length - 3}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Recovery Calendar - Full Width */}
            <RecoveryCalendar workoutLogs={workoutLogs} />
        </div>
    );
};

export default MuscleRecoveryTab;
