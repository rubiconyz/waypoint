import React from 'react';
import { MUSCLE_GROUPS, getMuscleRecoveryPercentage, getRecoveryColor } from '../muscleRecoveryData';
import { WorkoutLog } from '../types';

interface MuscleBodySVGProps {
    workoutLogs: WorkoutLog[];
    selectedMuscles: string[];
    onMuscleClick?: (muscleId: string) => void;
    isSelectionMode?: boolean;
}

// SVG paths for each muscle group - simplified anatomical shapes
const MUSCLE_PATHS: Record<string, { front?: string; back?: string }> = {
    // Chest - front view
    'chest': {
        front: 'M 85 95 Q 75 100 70 115 L 70 135 Q 85 145 100 145 Q 115 145 130 135 L 130 115 Q 125 100 115 95 Q 100 90 85 95 Z',
    },
    // Front Delts
    'front-delts': {
        front: 'M 62 95 Q 55 100 55 115 L 58 125 L 70 115 L 70 100 Q 66 95 62 95 Z M 138 95 Q 145 100 145 115 L 142 125 L 130 115 L 130 100 Q 134 95 138 95 Z',
    },
    // Side Delts (visible on both views)
    'side-delts': {
        front: 'M 55 100 Q 48 105 48 120 L 52 130 L 58 120 L 55 105 Z M 145 100 Q 152 105 152 120 L 148 130 L 142 120 L 145 105 Z',
        back: 'M 55 100 Q 48 105 48 120 L 52 130 L 58 120 L 55 105 Z M 145 100 Q 152 105 152 120 L 148 130 L 142 120 L 145 105 Z',
    },
    // Biceps
    'biceps': {
        front: 'M 48 125 Q 42 140 44 165 L 52 170 L 58 165 Q 60 145 58 125 Z M 152 125 Q 158 140 156 165 L 148 170 L 142 165 Q 140 145 142 125 Z',
    },
    // Forearms
    'forearms': {
        front: 'M 44 170 Q 38 190 40 220 L 50 225 L 58 218 Q 58 195 52 170 Z M 156 170 Q 162 190 160 220 L 150 225 L 142 218 Q 142 195 148 170 Z',
        back: 'M 44 170 Q 38 190 40 220 L 50 225 L 58 218 Q 58 195 52 170 Z M 156 170 Q 162 190 160 220 L 150 225 L 142 218 Q 142 195 148 170 Z',
    },
    // Upper Back
    'upper-back': {
        back: 'M 75 95 Q 85 90 100 90 Q 115 90 125 95 L 130 115 Q 115 120 100 120 Q 85 120 70 115 L 75 95 Z',
    },
    // Lats
    'lats': {
        back: 'M 70 120 L 65 160 Q 80 170 100 170 Q 120 170 135 160 L 130 120 Q 115 125 100 125 Q 85 125 70 120 Z',
    },
    // Lower Back
    'lower-back': {
        back: 'M 80 165 Q 90 170 100 170 Q 110 170 120 165 L 118 190 Q 108 195 100 195 Q 92 195 82 190 L 80 165 Z',
    },
    // Rear Delts
    'rear-delts': {
        back: 'M 62 95 Q 55 100 55 115 L 58 120 L 70 110 L 68 95 Q 65 93 62 95 Z M 138 95 Q 145 100 145 115 L 142 120 L 130 110 L 132 95 Q 135 93 138 95 Z',
    },
    // Triceps
    'triceps': {
        back: 'M 48 120 Q 42 140 44 165 L 52 170 L 60 160 Q 58 140 55 120 Z M 152 120 Q 158 140 156 165 L 148 170 L 140 160 Q 142 140 145 120 Z',
    },
    // Abs
    'abs': {
        front: 'M 85 150 L 85 200 Q 92 205 100 205 Q 108 205 115 200 L 115 150 Q 108 145 100 145 Q 92 145 85 150 Z',
    },
    // Obliques
    'obliques': {
        front: 'M 70 145 L 65 175 L 72 200 L 82 205 L 85 175 L 85 150 Q 78 145 70 145 Z M 130 145 L 135 175 L 128 200 L 118 205 L 115 175 L 115 150 Q 122 145 130 145 Z',
        back: 'M 70 165 L 68 190 L 78 195 L 82 170 Q 76 165 70 165 Z M 130 165 L 132 190 L 122 195 L 118 170 Q 124 165 130 165 Z',
    },
    // Quads
    'quads': {
        front: 'M 72 210 L 68 280 L 75 310 L 90 310 L 92 260 L 88 210 Q 80 205 72 210 Z M 128 210 L 132 280 L 125 310 L 110 310 L 108 260 L 112 210 Q 120 205 128 210 Z',
    },
    // Hamstrings
    'hamstrings': {
        back: 'M 72 200 L 68 270 L 75 310 L 90 310 L 88 260 L 85 200 Q 78 195 72 200 Z M 128 200 L 132 270 L 125 310 L 110 310 L 112 260 L 115 200 Q 122 195 128 200 Z',
    },
    // Glutes
    'glutes': {
        back: 'M 72 195 Q 85 200 100 200 Q 115 200 128 195 L 130 220 Q 115 230 100 230 Q 85 230 70 220 L 72 195 Z',
    },
    // Calves
    'calves': {
        back: 'M 70 315 L 68 360 L 75 380 L 88 380 L 90 355 L 85 315 Q 78 310 70 315 Z M 130 315 L 132 360 L 125 380 L 112 380 L 110 355 L 115 315 Q 122 310 130 315 Z',
    },
    // Hip Flexors
    'hip-flexors': {
        front: 'M 80 200 L 75 225 L 85 230 L 92 215 L 88 200 Q 84 198 80 200 Z M 120 200 L 125 225 L 115 230 L 108 215 L 112 200 Q 116 198 120 200 Z',
    },
};

export const MuscleBodySVG: React.FC<MuscleBodySVGProps> = ({
    workoutLogs,
    selectedMuscles,
    onMuscleClick,
    isSelectionMode = false,
}) => {
    const renderMuscle = (muscleId: string, pathData: string, view: 'front' | 'back') => {
        const isSelected = selectedMuscles.includes(muscleId);
        const recoveryPercent = isSelectionMode ? 100 : getMuscleRecoveryPercentage(muscleId, workoutLogs);
        const fillColor = isSelectionMode
            ? (isSelected ? '#3b82f6' : '#4b5563')
            : getRecoveryColor(recoveryPercent);

        const muscle = MUSCLE_GROUPS.find(m => m.id === muscleId);

        return (
            <path
                key={`${muscleId}-${view}`}
                d={pathData}
                fill={fillColor}
                stroke={isSelected ? '#60a5fa' : '#374151'}
                strokeWidth={isSelected ? 2 : 1}
                opacity={0.85}
                className={`transition-all duration-300 ${onMuscleClick ? 'cursor-pointer hover:opacity-100 hover:brightness-110' : ''}`}
                onClick={() => onMuscleClick?.(muscleId)}
            >
                <title>{muscle?.name}: {isSelectionMode ? (isSelected ? 'Selected' : 'Click to select') : `${recoveryPercent}% recovered`}</title>
            </path>
        );
    };

    const renderBodyOutline = (view: 'front' | 'back') => (
        <g className="body-outline" stroke="#6b7280" strokeWidth="1.5" fill="none">
            {/* Head */}
            <ellipse cx="100" cy="40" rx="25" ry="30" />
            {/* Neck */}
            <path d="M 90 68 L 90 85 M 110 68 L 110 85" />
            {/* Torso outline */}
            <path d="M 65 90 L 55 95 Q 45 110 45 130 L 40 220 L 50 225 L 58 220 L 58 175 L 55 130 Q 55 115 60 100 L 65 95 L 70 150 L 65 210 Q 65 240 70 280 L 68 360 L 75 385 L 90 385 L 92 350 L 88 280 Q 85 240 88 210 L 100 195 L 112 210 Q 115 240 112 280 L 108 350 L 110 385 L 125 385 L 132 360 L 130 280 Q 135 240 135 210 L 130 150 L 135 95 L 140 100 Q 145 115 145 130 L 142 175 L 142 220 L 150 225 L 160 220 L 155 130 Q 155 110 145 95 L 135 90" />
        </g>
    );

    return (
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Front View */}
            <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Front</span>
                <svg viewBox="0 0 200 400" className="w-40 h-80 sm:w-48 sm:h-96">
                    <defs>
                        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#1f2937" />
                            <stop offset="100%" stopColor="#111827" />
                        </linearGradient>
                    </defs>
                    {renderBodyOutline('front')}
                    {/* Render front-view muscles */}
                    {Object.entries(MUSCLE_PATHS).map(([muscleId, paths]) => {
                        if (paths.front) {
                            return renderMuscle(muscleId, paths.front, 'front');
                        }
                        return null;
                    })}
                </svg>
            </div>

            {/* Back View */}
            <div className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Back</span>
                <svg viewBox="0 0 200 400" className="w-40 h-80 sm:w-48 sm:h-96">
                    {renderBodyOutline('back')}
                    {/* Render back-view muscles */}
                    {Object.entries(MUSCLE_PATHS).map(([muscleId, paths]) => {
                        if (paths.back) {
                            return renderMuscle(muscleId, paths.back, 'back');
                        }
                        return null;
                    })}
                </svg>
            </div>
        </div>
    );
};

export default MuscleBodySVG;
