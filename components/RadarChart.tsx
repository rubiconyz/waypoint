import React from 'react';

interface RadarData {
    label: string;
    value: number; // 0 to 100
}

interface RadarChartProps {
    data: RadarData[];
    size?: number;
    color?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
    data,
    size = 300,
    color = '#6366f1' // Indigo-500 default
}) => {
    const padding = 40;
    const radius = (size - padding * 2) / 2;
    const center = size / 2;
    const totalAxes = data.length;
    const angleSlice = (Math.PI * 2) / totalAxes;

    // Helper to get coordinates for a point
    const getCoordinates = (value: number, index: number) => {
        const angle = index * angleSlice - Math.PI / 2; // Start from top
        const r = (value / 100) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    // Generate grid levels (20%, 40%, 60%, 80%, 100%)
    const gridLevels = [20, 40, 60, 80, 100];

    // Generate path string for the data
    const pathPoints = data.map((d, i) => {
        const coords = getCoordinates(d.value, i);
        return `${coords.x},${coords.y}`;
    }).join(' ');

    return (
        <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="overflow-visible">
                {/* Grid Background */}
                {gridLevels.map((level) => (
                    <polygon
                        key={level}
                        points={data.map((_, i) => {
                            const coords = getCoordinates(level, i);
                            return `${coords.x},${coords.y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity={0.1}
                        className="text-gray-400 dark:text-gray-500"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {data.map((_, i) => {
                    const endCoords = getCoordinates(100, i);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={endCoords.x}
                            y2={endCoords.y}
                            stroke="currentColor"
                            strokeOpacity={0.1}
                            className="text-gray-400 dark:text-gray-500"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Path (Filled Area) */}
                <polygon
                    points={pathPoints}
                    fill={color}
                    fillOpacity={0.2}
                    stroke={color}
                    strokeWidth="2"
                    className="transition-all duration-500 ease-out"
                />

                {/* Data Points (Dots) */}
                {data.map((d, i) => {
                    const coords = getCoordinates(d.value, i);
                    return (
                        <circle
                            key={i}
                            cx={coords.x}
                            cy={coords.y}
                            r="4"
                            fill={color}
                            className="transition-all duration-500 ease-out"
                        />
                    );
                })}

                {/* Labels */}
                {data.map((d, i) => {
                    const coords = getCoordinates(115, i); // Push label out a bit (115%)
                    return (
                        <text
                            key={i}
                            x={coords.x}
                            y={coords.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] font-medium fill-gray-500 dark:fill-gray-400 uppercase tracking-wider"
                        >
                            {d.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};
