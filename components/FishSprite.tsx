import React, { useMemo } from 'react';
import { Fish } from '../types';

interface FishSpriteProps {
    fish: Fish;
    index: number;
    totalFish: number;
    oceanWidth: number;
    oceanHeight: number;
}

export const FishSprite: React.FC<FishSpriteProps> = ({ fish, index, totalFish, oceanWidth, oceanHeight }) => {
    // Calculate position based on index to distribute fish
    const position = useMemo(() => {
        const sizeMultiplier = fish.size === 'large' ? 2 : fish.size === 'medium' ? 1.5 : 1;
        const baseSize = 30 * sizeMultiplier;

        // Distribute fish across the ocean with some randomness but deterministic based on fish id
        const hashCode = fish.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const xPercent = ((hashCode * 7) % 80) + 10; // 10-90% across
        const yPercent = ((hashCode * 13) % 60) + 20; // 20-80% depth

        return {
            x: (oceanWidth * xPercent) / 100,
            y: (oceanHeight * yPercent) / 100,
            size: baseSize
        };
    }, [fish.id, fish.size, oceanWidth, oceanHeight]);

    // Swimming animation duration based on size (larger = slower)
    const duration = fish.size === 'large' ? 8 : fish.size === 'medium' ? 6 : 4;

    return (
        <g className="fish-sprite animate-swim" style={{
            animation: `swim ${duration}s ease-in-out infinite`,
            animationDelay: `${index * 0.5}s`
        }}>
            <g transform={`translate(${position.x}, ${position.y})`}>
                {/* Fish emoji container */}
                <foreignObject
                    x={-position.size / 2}
                    y={-position.size / 2}
                    width={position.size}
                    height={position.size}
                >
                    <div
                        style={{
                            fontSize: `${position.size * 0.8}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                        }}
                    >
                        {fish.emoji}
                    </div>
                </foreignObject>
            </g>
        </g>
    );
};
