import React, { useState } from 'react';
import { Dumbbell, Plus, Clock, Calendar, Trash2, ChevronDown, ChevronUp, Activity, Pencil, X } from 'lucide-react';
import { MuscleBodySVG } from './MuscleBodySVG';
import { RecoveryCalendar } from './RecoveryCalendar';
import { MUSCLE_GROUPS, getRecoveryColor, getRecoveryStatus, getMuscleRecoveryPercentage, getHoursUntilRecovered } from '../muscleRecoveryData';
import { WorkoutLog, WorkoutIntensity } from '../types';

interface MuscleRecoveryTabProps {
    workoutLogs: WorkoutLog[];
    onAddWorkout: (log: Omit<WorkoutLog, 'id' | 'createdAt'>) => void;
    onDeleteWorkout: (id: string) => void;
    onUpdateWorkout: (log: WorkoutLog) => void;
}

export const MuscleRecoveryTab: React.FC<MuscleRecoveryTabProps> = ({
    workoutLogs,
    onAddWorkout,
    onDeleteWorkout,
    onUpdateWorkout,
}) => {
    const [isLogging, setIsLogging] = useState(false);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [intensity, setIntensity] = useState<WorkoutIntensity>('moderate');
    const [notes, setNotes] = useState('');
    const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
    const [showHistory, setShowHistory] = useState(false);

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

    // Format hours remaining for display
    const formatTimeRemaining = (hours: number): string => {
        if (hours === 0) return 'Ready';
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    };

    return (
        <div className="space-y-6">
            {/* Header - Simplified */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                            <Activity size={24} className="text-white" />
                        </div>
                        Muscle Recovery
                    </h2>
                </div>

                <button
                    onClick={isLogging ? handleCancelLogging : () => setIsLogging(true)}
                    className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${isLogging
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                        }`}
                >
                    {isLogging ? (
                        <>
                            <X size={20} />
                            <span>Cancel</span>
                        </>
                    ) : (
                        <>
                            <Plus size={20} />
                            <span>Log Workout</span>
                        </>
                    )}
                </button>
            </div>

            {/* Hero Stats Pills */}
            <div className="flex flex-wrap gap-3 justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/40 rounded-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        {readyToTrain.length} Ready to Train
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-sm font-semibold text-red-700 dark:text-red-300">
                        {needsRest.length} Need Rest
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Dumbbell size={14} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {workoutLogs.length} Workouts Logged
                    </span>
                </div>
            </div>

            {/* Hero Body Visualization */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 overflow-hidden">
                {/* Decorative gradient orbs */}
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <h3 className="font-semibold text-white text-center mb-6 text-lg">
                        {isLogging ? (editingLogId ? '✏️ Edit Workout' : '💪 Select Muscles Worked') : '🔥 Recovery Status'}
                    </h3>

                    <MuscleBodySVG
                        workoutLogs={workoutLogs}
                        selectedMuscles={selectedMuscles}
                        onMuscleClick={isLogging ? handleMuscleClick : undefined}
                        isSelectionMode={isLogging}
                    />

                    {/* Legend */}
                    {!isLogging && (
                        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                            {[
                                { color: '#22c55e', label: 'Recovered' },
                                { color: '#eab308', label: 'Recovering' },
                                { color: '#f97316', label: 'Fatigued' },
                                { color: '#ef4444', label: 'Needs Rest' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-gray-400">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Selection Mode Controls */}
            {isLogging && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-4">
                    {/* Date Picker */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                            Date
                        </label>
                        <input
                            type="date"
                            value={workoutDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setWorkoutDate(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        />
                    </div>

                    {/* Selected Muscles Pills */}
                    {selectedMuscles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedMuscles.map(muscleId => {
                                const muscle = MUSCLE_GROUPS.find(m => m.id === muscleId);
                                return (
                                    <span
                                        key={muscleId}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center gap-1"
                                    >
                                        {muscle?.name}
                                        <button
                                            onClick={() => setSelectedMuscles(prev => prev.filter(id => id !== muscleId))}
                                            className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                                        >
                                            ×
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Intensity Selector */}
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                            Workout Intensity
                        </label>
                        <div className="flex gap-2">
                            {(['light', 'moderate', 'heavy'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setIntensity(level)}
                                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium capitalize transition-all ${intensity === level
                                        ? level === 'light'
                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-2 border-green-500'
                                            : level === 'moderate'
                                                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-500'
                                                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-2 border-red-500'
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
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                            Notes (optional)
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Chest & tricep day, heavy bench press"
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmitWorkout}
                        disabled={selectedMuscles.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/30 transition-all"
                    >
                        <Dumbbell size={20} />
                        {editingLogId ? 'Update Workout' : `Log Workout (${selectedMuscles.length} muscle${selectedMuscles.length !== 1 ? 's' : ''})`}
                    </button>
                </div>
            )}

            {/* Suggested Muscles - Ready to Train */}
            {!isLogging && readyToTrain.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="text-green-500">✓</span> Ready to Train
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {readyToTrain.slice(0, 6).map(muscle => (
                            <span
                                key={muscle.id}
                                className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                            >
                                {muscle.name}
                            </span>
                        ))}
                        {readyToTrain.length > 6 && (
                            <span className="px-3 py-1.5 text-gray-500 text-sm">
                                +{readyToTrain.length - 6} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Workouts - Horizontal Scroll */}
            {workoutLogs.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        Recent Workouts
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                        {[...workoutLogs]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 10)
                            .map(log => (
                                <div
                                    key={log.id}
                                    className="flex-shrink-0 w-48 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl group hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors relative"
                                >
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditWorkout(log)}
                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                            title="Edit"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                        <button
                                            onClick={() => onDeleteWorkout(log.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {new Date(log.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </div>
                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${log.intensity === 'light'
                                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                        : log.intensity === 'moderate'
                                            ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                                            : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                        }`}>
                                        {log.intensity}
                                    </span>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {log.muscleGroups.slice(0, 3).map(muscleId => {
                                            const muscle = MUSCLE_GROUPS.find(m => m.id === muscleId);
                                            return (
                                                <span
                                                    key={muscleId}
                                                    className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                                                >
                                                    {muscle?.name}
                                                </span>
                                            );
                                        })}
                                        {log.muscleGroups.length > 3 && (
                                            <span className="text-xs text-gray-500">+{log.muscleGroups.length - 3}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Recovery Calendar - Full Width */}
            <RecoveryCalendar workoutLogs={workoutLogs} />
        </div>
    );
};

export default MuscleRecoveryTab;
