
import React, { useState, useEffect } from 'react';

// Frame counts based on typical sprites - will auto-detect or loop safely
const FRAMES = {
    idle: 4, // Estimate, usually small loop
    walk: 8, // Estimate
    cheer: 8 // Estimate
};

// Animation speeds in ms
const SPEEDS = {
    idle: 200,
    walk: 100,
    cheer: 150
};

interface ClimberAvatarProps {
    state: 'idle' | 'walk' | 'cheer';
    avatarColor: string;
    displayName: string;
    isCurrentUser: boolean;
    size?: number;
    variant?: '1' | '2';
    labelOffset?: number; // 0, 1, 2... for stacking labels
}

export const ClimberAvatar: React.FC<ClimberAvatarProps> = ({
    state,
    avatarColor,
    displayName,
    isCurrentUser,
    size = 48,
    variant = '1',
    labelOffset = 0
}) => {
    const [frameIndex, setFrameIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Reset frame on state change
    useEffect(() => {
        setFrameIndex(0);
        setImageError(false);
    }, [state, variant]);

    // Animation loop
    useEffect(() => {
        const interval = setInterval(() => {
            setFrameIndex(prev => prev + 1);
        }, SPEEDS[state]);

        return () => clearInterval(interval);
    }, [state]);

    // Handle missing frames by looping back or staying on last frame
    const handleImageError = () => {
        // If frame 0 fails, the whole folder might be wrong. 
        // If > 0 fails, we probably hit the end of the sequence.
        if (frameIndex > 0) {
            setFrameIndex(0); // Loop back to start
        } else {
            setImageError(true); // Stop trying if 0 fails
        }
    };

    // Construct path based on variant
    // Variant 1: /assets/mountain_animation
    // Variant 2: /assets/mountain_animation/second_char
    const baseUrl = variant === '2'
        ? '/assets/mountain_animation/second_char'
        : '/assets/mountain_animation';

    let imagePath = '';

    if (state === 'idle') {
        const frameStr = frameIndex % FRAMES.idle;
        imagePath = `${baseUrl}/idle/character-idle_${frameStr}.png`;
    } else if (state === 'walk') {
        const frame = frameIndex % FRAMES.walk;
        const frameStr = frame.toString().padStart(2, '0'); // 00, 01, ...
        imagePath = `${baseUrl}/walk/character-walk_${frameStr}.png`;
    } else if (state === 'cheer') {
        const frameStr = frameIndex % FRAMES.cheer;
        imagePath = `${baseUrl}/victory/character-victory_${frameStr}.png`;
    }

    return (
        <div className="relative flex flex-col items-center" style={{ width: size }}>
            {/* Name Label Removed per request - Identification via color in list */}
            {/* 
            <div
                className={`absolute whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-all duration-300 ${isCurrentUser
                    ? 'bg-indigo-600 text-white z-20'
                    : 'bg-white/90 text-gray-700 border border-gray-200 z-10'
                    }`}
                style={{
                    top: `${-24 - (labelOffset * 24)}px`,
                }}
            >
                {displayName}
            </div> 
            */}

            {/* Avatar Sprite */}
            <div
                className="relative transition-transform duration-300"
                style={{
                    width: size,
                    height: size,
                    backgroundColor: imageError ? avatarColor : 'transparent',
                    borderRadius: imageError ? '50%' : '0'
                }}
            >
                {!imageError ? (
                    <img
                        src={imagePath}
                        alt={state}
                        className="w-full h-full object-contain drop-shadow-lg"
                        onError={handleImageError}
                        style={{
                            filter: isCurrentUser ? 'brightness(1.1)' : 'grayscale(0.2)'
                        }}
                    />
                ) : (
                    // Fallback to colored circle if images missing
                    <div className="w-full h-full rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: avatarColor }}>
                        {displayName.charAt(0)}
                    </div>
                )}
            </div>

            {/* You Marker */}
            {isCurrentUser && (
                <div className="absolute -bottom-1 w-2 h-2 bg-indigo-600 rotate-45" />
            )}
        </div>
    );
};
