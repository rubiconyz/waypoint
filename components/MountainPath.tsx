
import React, { useRef, useEffect, useState } from 'react';
import { MOUNTAIN_PATH_SVG, MOUNTAIN_VIEWBOX, MOUNTAIN_WIDTH, MOUNTAIN_HEIGHT } from '../mountainData';
import { ClimberAvatar } from './ClimberAvatar';
import { ChallengeParticipant } from '../types';

interface MountainPathProps {
    participants: ChallengeParticipant[];
    currentUserId: string;
    challengeDuration: number;
    challengeId: string;
}

interface ParticipantPosition {
    x: number;
    y: number;
    rotation: number;
}

const getPositionForDay = (day: number, duration: number, path: SVGPathElement): ParticipantPosition | null => {
    if (!path || duration === 0) return null;
    const totalLength = path.getTotalLength();
    const correctRate = (day / duration) * 100;
    const progress = Math.min(Math.max(correctRate, 0), 100) / 100;
    const length = progress * totalLength;
    const point = path.getPointAtLength(length);
    return {
        x: point.x / 1812,
        y: point.y / 1087,
        rotation: 0
    };
};

export const MountainPath: React.FC<MountainPathProps> = ({ participants, currentUserId, challengeDuration, challengeId }) => {
    const pathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Initialize positions from LocalStorage if available (to allow animation from old -> new)
    const [positions, setPositions] = useState<Record<string, ParticipantPosition>>({});

    // Animation State
    const [movingIds, setMovingIds] = useState<Set<string>>(new Set());
    const prevPositionsRef = useRef<Record<string, number>>({});

    // Refs for cache management
    const initializedRef = useRef(false);

    // Update container size on resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Calculate positions when path or participants change
    // Calculate positions when path or participants change
    useEffect(() => {
        if (!pathRef.current) return;

        const path = pathRef.current;
        const totalLength = path.getTotalLength();
        const targetPositions: Record<string, ParticipantPosition> = {};
        const CACHE_KEY = `habitvision_pos_${challengeId}`;

        // Calculate Target Positions
        participants.forEach(p => {
            const correctRate = (p.completedDays / challengeDuration) * 100;
            const progress = Math.min(Math.max(correctRate, 0), 100) / 100;
            const length = progress * totalLength;
            const point = path.getPointAtLength(length);

            const sameProgressCount = participants.filter(other => Math.abs((other.completedDays / challengeDuration * 100) - correctRate) < 1).length;
            const indexAtProgress = participants.filter(other => Math.abs((other.completedDays / challengeDuration * 100) - correctRate) < 1)
                .findIndex(other => other.odId === p.odId);

            const offsetX = (sameProgressCount > 1) ? (indexAtProgress * 0.04 - 0.02) : 0;

            targetPositions[p.odId] = {
                x: (point.x / 1812) + offsetX,
                y: point.y / 1087,
                rotation: 0
            };
        });

        // First Mount Logic
        if (!initializedRef.current) {
            const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            const startPositions: Record<string, ParticipantPosition> = { ...targetPositions };
            const playersToAnimate = new Set<string>();

            participants.forEach(p => {
                const lastDays = stored[p.odId];
                if (lastDays !== undefined && lastDays < p.completedDays) {
                    const startPos = getPositionForDay(lastDays, challengeDuration, path);
                    if (startPos) {
                        startPositions[p.odId] = startPos;
                        playersToAnimate.add(p.odId);
                    }
                }
            });

            if (playersToAnimate.size > 0) {
                setPositions(startPositions);
                setMovingIds(prev => {
                    const next = new Set(prev);
                    playersToAnimate.forEach(id => next.add(id));
                    return next;
                });

                setTimeout(() => {
                    setPositions(targetPositions);
                }, 50);

                setTimeout(() => {
                    setMovingIds(prev => {
                        const next = new Set(prev);
                        playersToAnimate.forEach(id => next.delete(id));
                        return next;
                    });
                }, 1500);
            } else {
                setPositions(targetPositions);
            }

            initializedRef.current = true;

        } else {
            // Normal Update
            const currentlyMoving = new Set<string>();
            participants.forEach(p => {
                const prevX = prevPositionsRef.current[p.odId];
                // If previous position exists and diff is significant
                if (prevX !== undefined && Math.abs(targetPositions[p.odId].x - prevX) > 0.001) {
                    currentlyMoving.add(p.odId);
                }
                prevPositionsRef.current[p.odId] = targetPositions[p.odId].x;
            });

            setPositions(targetPositions);

            if (currentlyMoving.size > 0) {
                setMovingIds(prev => {
                    const next = new Set(prev);
                    currentlyMoving.forEach(id => next.add(id));
                    return next;
                });
                setTimeout(() => {
                    setMovingIds(prev => {
                        const next = new Set(prev);
                        currentlyMoving.forEach(id => next.delete(id));
                        return next;
                    });
                }, 1500);
            }
        }

        // Save new state to cache
        const cacheData: Record<string, number> = {};
        participants.forEach(p => cacheData[p.odId] = p.completedDays);
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

    }, [participants, challengeDuration, challengeId]);

    // Background Image URL (Updated to user's placed file if available, or default)
    const bgImage = '/assets/mountain_animation/path without flags.png';

    return (
        <div
            ref={containerRef}
            className="relative w-full rounded-3xl overflow-hidden bg-gray-100 dark:bg-[#0F141D] shadow-inner border border-gray-200 dark:border-[#1F2733]"
            style={{ aspectRatio: `${MOUNTAIN_WIDTH}/${MOUNTAIN_HEIGHT}` }}
        >
            {/* Mountain Background */}
            <img
                src={bgImage}
                alt="Mountain Path"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Invisible SVG for path calculation */}
            <svg
                viewBox={MOUNTAIN_VIEWBOX}
                className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
                preserveAspectRatio="none"
            >
                <path
                    ref={pathRef}
                    d={MOUNTAIN_PATH_SVG}
                    fill="none"
                    stroke="white"
                    strokeWidth="5"
                    strokeDasharray="10 10" // Visualization helper (optional)
                />
            </svg>

            {/* Climbers */}
            {participants.map(p => {
                const pos = positions[p.odId];
                if (!pos) return null;

                const isMe = p.odId === currentUserId;

                // Determine State: Cheer > Walk > Idle
                let state: 'idle' | 'walk' | 'cheer' = 'idle';
                if (p.hasCompleted) {
                    state = 'cheer';
                } else if (movingIds.has(p.odId)) {
                    state = 'walk';
                }

                // Label Stacking Logic:
                const sameProgressCount = participants.filter(other => Math.abs(other.completionRate - p.completionRate) < 1).length;
                const indexAtProgress = participants.filter(other => Math.abs(other.completionRate - p.completionRate) < 1)
                    .sort((a, b) => a.odId.localeCompare(b.odId)) // Sort deterministically
                    .findIndex(other => other.odId === p.odId);

                // Pass index as offset for vertical stacking
                // If not crowded, index is 0. If crowded, goes 0, 1, 2...
                const labelOffset = indexAtProgress;

                return (
                    <div
                        key={p.odId}
                        className="absolute transform -translate-x-1/2 -translate-y-[80%] transition-all duration-1000 ease-in-out"
                        style={{
                            left: `${pos.x * 100}%`,
                            top: `${pos.y * 100}%`,
                            zIndex: Math.floor(pos.y * 100) + indexAtProgress // Ensure upper labels are on top
                        }}
                    >
                        <ClimberAvatar
                            state={state}
                            avatarColor={p.avatarColor}
                            displayName={p.displayName}
                            isCurrentUser={isMe}
                            size={64}
                            variant={p.avatarVariant || '1'}
                            labelOffset={labelOffset}
                        />
                    </div>
                );
            })}
        </div>
    );
};
