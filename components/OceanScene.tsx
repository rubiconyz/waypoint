import React from 'react';
import { PollutionLevel } from '../types';
import { POLLUTION_STAGES } from '../oceanData';
import { FishSprite } from './FishSprite';
import { Fish } from '../types';

interface OceanSceneProps {
    pollutionLevel: PollutionLevel;
    activeFish: Fish[];
}

export const OceanScene: React.FC<OceanSceneProps> = ({ pollutionLevel, activeFish }) => {
    const stage = POLLUTION_STAGES[pollutionLevel];
    const oceanWidth = 1000;
    const oceanHeight = 600;

    return (
        <div className="relative w-full h-full overflow-hidden rounded-xl shadow-2xl">
            <svg
                viewBox={`0 0 ${oceanWidth} ${oceanHeight}`}
                className="w-full h-full"
                style={{ minHeight: '400px', maxHeight: '600px' }}
            >
                <defs>
                    {/* Enhanced water gradients with more depth */}
                    <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        {pollutionLevel === 0 && (
                            <>
                                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                                <stop offset="30%" stopColor="#0EA5E9" />
                                <stop offset="70%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#1E3A8A" />
                            </>
                        )}
                        {pollutionLevel === 1 && (
                            <>
                                <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#10B981" />
                                <stop offset="100%" stopColor="#1E40AF" />
                            </>
                        )}
                        {pollutionLevel === 2 && (
                            <>
                                <stop offset="0%" stopColor="#22C55E" />
                                <stop offset="50%" stopColor="#059669" />
                                <stop offset="100%" stopColor="#475569" />
                            </>
                        )}
                        {pollutionLevel === 3 && (
                            <>
                                <stop offset="0%" stopColor="#16A34A" />
                                <stop offset="50%" stopColor="#475569" />
                                <stop offset="100%" stopColor="#1E293B" />
                            </>
                        )}
                        {pollutionLevel === 4 && (
                            <>
                                <stop offset="0%" stopColor="#64748B" />
                                <stop offset="50%" stopColor="#334155" />
                                <stop offset="100%" stopColor="#0F172A" />
                            </>
                        )}
                    </linearGradient>

                    {/* Radial gradient for depth effect */}
                    <radialGradient id="depthGradient" cx="50%" cy="30%">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                    </radialGradient>

                    {/* Caustics pattern for light refraction */}
                    <filter id="caustics">
                        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="2">
                            <animate attributeName="baseFrequency" values="0.02;0.03;0.02" dur="10s" repeatCount="indefinite" />
                        </feTurbulence>
                        <feDisplacementMap in="SourceGraphic" scale="15" />
                    </filter>

                    {/* Glow effect for pristine water */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Main water background */}
                <rect
                    x="0"
                    y="0"
                    width={oceanWidth}
                    height={oceanHeight}
                    fill="url(#waterGradient)"
                    className="transition-all duration-2000"
                />

                {/* Depth radial overlay */}
                <rect
                    x="0"
                    y="0"
                    width={oceanWidth}
                    height={oceanHeight}
                    fill="url(#depthGradient)"
                    opacity={pollutionLevel <= 1 ? 0.3 : 0.1}
                />

                {/* Caustic light patterns (only in clean water) */}
                {pollutionLevel === 0 && (
                    <rect
                        x="0"
                        y="0"
                        width={oceanWidth}
                        height={oceanHeight}
                        fill="white"
                        opacity="0.08"
                        filter="url(#caustics)"
                    />
                )}

                {/* Enhanced sun rays */}
                {pollutionLevel <= 1 && (
                    <g opacity={pollutionLevel === 0 ? 0.4 : 0.2}>
                        {[...Array(7)].map((_, i) => (
                            <g key={i}>
                                <defs>
                                    <linearGradient id={`rayGradient${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <polygon
                                    points={`${100 + i * 140},0 ${120 + i * 140},0 ${140 + i * 140},${oceanHeight} ${110 + i * 140},${oceanHeight}`}
                                    fill={`url(#rayGradient${i})`}
                                    className="animate-pulse"
                                    style={{
                                        animationDelay: `${i * 0.8}s`,
                                        animationDuration: '6s',
                                        opacity: 0.15
                                    }}
                                />
                            </g>
                        ))}
                    </g>
                )}

                {/* Enhanced sandy bottom with texture */}
                <g>
                    <rect
                        x="0"
                        y={oceanHeight - 100}
                        width={oceanWidth}
                        height="100"
                        fill={pollutionLevel >= 3 ? '#52525B' : '#E6D5B8'}
                        opacity="0.7"
                    />
                    {/* Sand texture dots */}
                    {pollutionLevel <= 2 && [...Array(50)].map((_, i) => (
                        <circle
                            key={i}
                            cx={(i * 37) % oceanWidth}
                            cy={oceanHeight - 80 + ((i * 13) % 40)}
                            r="1.5"
                            fill="#D4B896"
                            opacity="0.4"
                        />
                    ))}
                </g>

                {/* Beautiful enhanced coral reef */}
                {pollutionLevel <= 2 && (
                    <g opacity={pollutionLevel === 0 ? 1 : pollutionLevel === 1 ? 0.9 : 0.5}>
                        {[80, 220, 380, 540, 720, 880].map((x, i) => (
                            <g key={i}>
                                {/* Large coral formations */}
                                <ellipse
                                    cx={x}
                                    cy={oceanHeight - 50}
                                    rx="45"
                                    ry="60"
                                    fill={pollutionLevel === 0 ? '#FF6B9D' : '#A78295'}
                                    opacity="0.85"
                                    filter={pollutionLevel === 0 ? 'url(#glow)' : 'none'}
                                />
                                <ellipse
                                    cx={x + 35}
                                    cy={oceanHeight - 45}
                                    rx="30"
                                    ry="50"
                                    fill={pollutionLevel === 0 ? '#FFD93D' : '#B8A880'}
                                    opacity="0.8"
                                />
                                <ellipse
                                    cx={x - 25}
                                    cy={oceanHeight - 48}
                                    rx="35"
                                    ry="55"
                                    fill={pollutionLevel === 0 ? '#6BCF7F' : '#7A9985'}
                                    opacity="0.82"
                                />

                                {/* Small detail corals */}
                                <circle cx={x + 15} cy={oceanHeight - 30} r="8" fill="#F472B6" opacity="0.9" />
                                <circle cx={x - 10} cy={oceanHeight - 25} r="6" fill="#FB923C" opacity="0.85" />

                                {/* Seaweed/kelp */}
                                <path
                                    d={`M ${x + 60} ${oceanHeight - 20} Q ${x + 65} ${oceanHeight - 60} ${x + 62} ${oceanHeight - 90}`}
                                    stroke={pollutionLevel === 0 ? '#10B981' : '#6B7280'}
                                    strokeWidth="4"
                                    fill="none"
                                    opacity="0.7"
                                    className="animate-sway"
                                    style={{ animationDelay: `${i * 0.4}s` }}
                                />
                            </g>
                        ))}
                    </g>
                )}

                {/* Waterweeds (pollution) - enhanced */}
                {stage.weedCoverage > 0 && (
                    <g opacity={stage.weedCoverage / 100}>
                        {[...Array(Math.floor(stage.weedCoverage / 8))].map((_, i) => (
                            <g key={i}>
                                <path
                                    d={`M ${i * 90 + (i * 13) % 30} ${oceanHeight} L ${i * 90 + (i * 13) % 30} ${oceanHeight - 130}`}
                                    stroke="#166534"
                                    strokeWidth="6"
                                    fill="none"
                                    opacity="0.7"
                                    className="animate-sway"
                                    style={{ animationDelay: `${i * 0.3}s` }}
                                />
                                <path
                                    d={`M ${i * 90 + (i * 13) % 30 + 10} ${oceanHeight} L ${i * 90 + (i * 13) % 30 + 10} ${oceanHeight - 110}`}
                                    stroke="#14532D"
                                    strokeWidth="5"
                                    fill="none"
                                    opacity="0.6"
                                    className="animate-sway"
                                    style={{ animationDelay: `${i * 0.3 + 0.5}s` }}
                                />
                            </g>
                        ))}
                    </g>
                )}

                {/* Enhanced trash with shadows */}
                {stage.trashCount > 0 && (
                    <g>
                        {[...Array(stage.trashCount)].map((_, i) => (
                            <g key={i}>
                                {/* Shadow */}
                                <ellipse
                                    cx={60 + i * 70}
                                    cy={oceanHeight - 60}
                                    rx="8"
                                    ry="3"
                                    fill="#000000"
                                    opacity="0.2"
                                />
                                {/* Plastic bottle */}
                                <rect
                                    x={55 + i * 70}
                                    y={oceanHeight - 170 - (i * 23) % 50}
                                    width="14"
                                    height="30"
                                    fill="#94A3B8"
                                    opacity="0.8"
                                    rx="3"
                                />
                                <rect
                                    x={57 + i * 70}
                                    y={oceanHeight - 175 - (i * 23) % 50}
                                    width="10"
                                    height="5"
                                    fill="#64748B"
                                    opacity="0.9"
                                    rx="1"
                                />
                                {i % 3 === 0 && (
                                    /* Plastic bag */
                                    <path
                                        d={`M ${220 + i * 90} ${oceanHeight - 220 - (i * 17) % 60} q 15 -15 30 0 l 0 40 q -15 15 -30 0 z`}
                                        fill="#CBD5E1"
                                        opacity="0.6"
                                        className="animate-float"
                                    />
                                )}
                            </g>
                        ))}
                    </g>
                )}

                {/* Beautiful bubbles with gradient */}
                {pollutionLevel <= 1 && (
                    <g>
                        {[...Array(20)].map((_, i) => (
                            <g key={i}>
                                <defs>
                                    <radialGradient id={`bubbleGrad${i}`}>
                                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                                        <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
                                    </radialGradient>
                                </defs>
                                <circle
                                    cx={60 + (i * 67) % 900}
                                    cy={oceanHeight - 30}
                                    r={4 + (i % 4)}
                                    fill={`url(#bubbleGrad${i})`}
                                    className="animate-bubble"
                                    style={{
                                        animationDelay: `${i * 0.6}s`,
                                        animationDuration: `${5 + i % 4}s`
                                    }}
                                />
                            </g>
                        ))}
                    </g>
                )}

                {/* Animated fish */}
                {activeFish.map((fish, index) => (
                    <FishSprite
                        key={fish.id}
                        fish={fish}
                        index={index}
                        totalFish={activeFish.length}
                        oceanWidth={oceanWidth}
                        oceanHeight={oceanHeight - 120}
                    />
                ))}

                {/* Pollution overlay with particles */}
                {pollutionLevel >= 3 && (
                    <g>
                        <rect
                            x="0"
                            y="0"
                            width={oceanWidth}
                            height={oceanHeight}
                            fill="#1E293B"
                            opacity={pollutionLevel === 3 ? 0.25 : 0.45}
                        />
                        {/* Floating pollution particles */}
                        {[...Array(15)].map((_, i) => (
                            <circle
                                key={i}
                                cx={(i * 89) % oceanWidth}
                                cy={100 + (i * 47) % 400}
                                r={2 + (i % 3)}
                                fill="#475569"
                                opacity="0.4"
                                className="animate-float"
                                style={{ animationDelay: `${i * 0.4}s` }}
                            />
                        ))}
                    </g>
                )}
            </svg>
        </div>
    );
};
