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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                            <Activity size={24} className="text-white" />
                        </div>
                        Muscle Recovery
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track your workouts and optimize recovery
                    </p>
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Body Visualization */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                        {isLogging ? (editingLogId ? 'Edit Workout' : 'Select Muscles Worked') : 'Recovery Status'}
                    </h3>

                    <MuscleBodySVG
                        workoutLogs={workoutLogs}
                        selectedMuscles={selectedMuscles}
                        onMuscleClick={isLogging ? handleMuscleClick : undefined}
                        isSelectionMode={isLogging}
                    />

                    {/* Selection Mode Controls */}
                    {isLogging && (
                        <div className="mt-6 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
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

                    {/* Legend (when not in selection mode) */}
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
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Side Panel - Stats & Timeline */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-gray-400" />
                            Recovery Overview
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Ready to Train</span>
                                <span className="font-bold text-green-600 dark:text-green-400">
                                    {readyToTrain.length} / {MUSCLE_GROUPS.length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Needs Rest</span>
                                <span className="font-bold text-red-600 dark:text-red-400">
                                    {needsRest.length}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Workouts Logged</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {workoutLogs.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Recovery Calendar */}
                    <RecoveryCalendar workoutLogs={workoutLogs} />

                    {/* Recovery Timeline */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                            Muscle Status
                        </h3>

                        <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                            {muscleStats.map(muscle => (
                                <div
                                    key={muscle.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: getRecoveryColor(muscle.recoveryPercent) }}
                                    />
                                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                                        {muscle.name}
                                    </span>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {muscle.recoveryPercent >= 100
                                            ? '✓ Ready'
                                            : formatTimeRemaining(muscle.hoursRemaining)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Workouts */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full flex justify-between items-center font-semibold text-gray-800 dark:text-white"
                        >
                            <span className="flex items-center gap-2">
                                <Calendar size={18} className="text-gray-400" />
                                Recent Workouts
                            </span>
                            {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>

                        {showHistory && (
                            <div className="mt-4 space-y-3">
                                {workoutLogs.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                        No workouts logged yet
                                    </p>
                                ) : (
                                    [...workoutLogs]
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .slice(0, 5)
                                        .map(log => (
                                            <div
                                                key={log.id}
                                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group relative hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                            {new Date(log.date).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            })}
                                                        </span>
                                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${log.intensity === 'light'
                                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                                            : log.intensity === 'moderate'
                                                                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                                                                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                                                            }`}>
                                                            {log.intensity}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEditWorkout(log)}
                                                            className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                            title="Edit workout"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => onDeleteWorkout(log.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                            title="Delete workout"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {log.muscleGroups.slice(0, 4).map(muscleId => {
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
                                                    {log.muscleGroups.length > 4 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{log.muscleGroups.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                                {log.notes && (
                                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                                        {log.notes}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MuscleRecoveryTab;
