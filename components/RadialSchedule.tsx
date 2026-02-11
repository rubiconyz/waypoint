import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X, Pencil, Trash2, Dumbbell, BookOpen, Brain, Heart, Book, Briefcase, Moon, Star } from 'lucide-react';
import { TimeBlock, TimeBlockCategory } from '../types';
import { getLocalDateString } from '../utils/dateUtils';

interface RadialScheduleProps {
    timeBlocks: TimeBlock[];
    selectedDate: Date;
    onAddBlock: (block: Omit<TimeBlock, 'id'>) => void;
    onEditBlock: (block: TimeBlock) => void;
    onDeleteBlock: (id: string) => void;
    externalAddTrigger?: number;
    showAddButton?: boolean;
}

const CATEGORY_COLORS: Record<TimeBlockCategory, string> = {
    'Fitness': '#84cc16',
    'Learning': '#3b82f6',
    'Mindfulness': '#a855f7',
    'Health': '#ef4444',
    'Reading': '#10b981',
    'Sleep': '#06b6d4',
    'Work': '#8b5e34',
    'Other': '#94a3b8'
};

const CATEGORY_LABELS: Record<TimeBlockCategory, string> = {
    'Fitness': 'Fitness',
    'Learning': 'Learning',
    'Mindfulness': 'Mindfulness',
    'Health': 'Health',
    'Reading': 'Reading',
    'Sleep': 'Sleep',
    'Work': 'Work',
    'Other': 'Other'
};

const CATEGORY_ICONS: Record<TimeBlockCategory, React.ElementType> = {
    'Fitness': Dumbbell,
    'Learning': BookOpen,
    'Mindfulness': Brain,
    'Health': Heart,
    'Reading': Book,
    'Sleep': Moon,
    'Work': Briefcase,
    'Other': Star
};

const MINUTES_PER_DAY = 24 * 60;
const SNAP_INTERVAL = 15;
const DEFAULT_DRAG_DURATION = 30;
const LAST_SLOT_MINUTE = 23 * 60 + 45;

const toMinutes = (hour: number, minute: number) => hour * 60 + minute;
const toTime = (minutes: number) => ({
    hour: Math.floor(minutes / 60),
    minute: minutes % 60,
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const snapToQuarter = (minutes: number) => {
    const rounded = Math.round(minutes / SNAP_INTERVAL) * SNAP_INTERVAL;
    return clamp(rounded, 0, LAST_SLOT_MINUTE);
};

export const RadialSchedule: React.FC<RadialScheduleProps> = ({
    timeBlocks,
    selectedDate,
    onAddBlock,
    onEditBlock,
    onDeleteBlock,
    externalAddTrigger = 0,
    showAddButton = true,
}) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);

    const [isDraggingRange, setIsDraggingRange] = useState(false);
    const [dragStartMinute, setDragStartMinute] = useState<number | null>(null);
    const [dragCurrentMinute, setDragCurrentMinute] = useState<number | null>(null);

    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState<TimeBlockCategory>('Fitness');
    const [formStartHour, setFormStartHour] = useState(9);
    const [formStartMinute, setFormStartMinute] = useState(0);
    const [formEndHour, setFormEndHour] = useState(10);
    const [formEndMinute, setFormEndMinute] = useState(0);
    const [formError, setFormError] = useState<string | null>(null);
    const [localNow, setLocalNow] = useState(() => new Date());

    const svgRef = useRef<SVGSVGElement | null>(null);
    const dragStartPointRef = useRef<{ x: number; y: number } | null>(null);
    const dragMovedRef = useRef(false);

    const dateStr = getLocalDateString(selectedDate);
    const localDayName = localNow.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase();
    const localTimeLabel = localNow.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    useEffect(() => {
        const timer = window.setInterval(() => {
            setLocalNow(new Date());
        }, 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (externalAddTrigger > 0) {
            openAddModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [externalAddTrigger]);

    const todayBlocks = useMemo(() => {
        return timeBlocks
            .filter((block) => block.date === dateStr)
            .sort((a, b) => toMinutes(a.startHour, a.startMinute) - toMinutes(b.startHour, b.startMinute));
    }, [timeBlocks, dateStr]);

    const totalScheduledMinutes = useMemo(() => {
        return todayBlocks.reduce((sum, block) => {
            const start = toMinutes(block.startHour, block.startMinute);
            const end = toMinutes(block.endHour, block.endMinute);
            return sum + (end > start ? end - start : 0);
        }, 0);
    }, [todayBlocks]);

    const resolveDragWindow = (anchorMinute: number, currentMinute: number) => {
        let a = anchorMinute;
        let b = currentMinute;
        const delta = b - a;

        if (delta > MINUTES_PER_DAY / 2) b -= MINUTES_PER_DAY;
        if (delta < -MINUTES_PER_DAY / 2) b += MINUTES_PER_DAY;

        let start = Math.min(a, b);
        let end = Math.max(a, b);

        if (start < 0) start = 0;
        if (end > LAST_SLOT_MINUTE) end = LAST_SLOT_MINUTE;

        start = snapToQuarter(start);
        end = snapToQuarter(end);

        if (end <= start) return null;
        return { start, end };
    };

    const dragPreview = useMemo(() => {
        if (!isDraggingRange || dragStartMinute === null || dragCurrentMinute === null) return null;
        return resolveDragWindow(dragStartMinute, dragCurrentMinute);
    }, [isDraggingRange, dragStartMinute, dragCurrentMinute]);

    const formatDuration = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
    };

    const formatTime = (hour: number, minute: number) =>
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    const size = 360;
    const center = size / 2;
    const outerRadius = 150;
    const innerRadius = 94;
    const tickRadius = 160;
    const dragBandInner = innerRadius - 14;
    const dragBandOuter = outerRadius + 14;

    const timeToAngle = (hour: number, minute: number) => {
        const totalMinutes = toMinutes(hour, minute);
        return (totalMinutes / MINUTES_PER_DAY) * 360 - 90;
    };

    const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
        const angleRad = (angleDeg * Math.PI) / 180;
        return {
            x: cx + r * Math.cos(angleRad),
            y: cy + r * Math.sin(angleRad),
        };
    };

    const createArcPathFromMinutes = (startMinute: number, endMinute: number) => {
        if (endMinute <= startMinute) return '';

        const startAngle = (startMinute / MINUTES_PER_DAY) * 360 - 90;
        const endAngle = (endMinute / MINUTES_PER_DAY) * 360 - 90;
        const largeArc = endMinute - startMinute > MINUTES_PER_DAY / 2 ? 1 : 0;

        const outerStart = polarToCartesian(center, center, outerRadius, startAngle);
        const outerEnd = polarToCartesian(center, center, outerRadius, endAngle);
        const innerStart = polarToCartesian(center, center, innerRadius, startAngle);
        const innerEnd = polarToCartesian(center, center, innerRadius, endAngle);

        return `
      M ${outerStart.x} ${outerStart.y}
      A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}
      L ${innerEnd.x} ${innerEnd.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}
      Z
    `;
    };

    const createArcPath = (startHour: number, startMinute: number, endHour: number, endMinute: number) => {
        const start = toMinutes(startHour, startMinute);
        const end = toMinutes(endHour, endMinute);
        return createArcPathFromMinutes(start, end);
    };

    const now = new Date();
    const currentAngle = timeToAngle(now.getHours(), now.getMinutes());
    const isToday = dateStr === getLocalDateString(new Date());

    const openAddModal = (startMinute?: number, endMinute?: number) => {
        setFormTitle('');
        setFormCategory('Fitness');
        setFormError(null);

        if (startMinute !== undefined && endMinute !== undefined) {
            const start = toTime(startMinute);
            const end = toTime(endMinute);
            setFormStartHour(start.hour);
            setFormStartMinute(start.minute);
            setFormEndHour(end.hour);
            setFormEndMinute(end.minute);
        } else {
            setFormStartHour(9);
            setFormStartMinute(0);
            setFormEndHour(10);
            setFormEndMinute(0);
        }

        setEditingBlock(null);
        setShowAddModal(true);
    };

    const handleOpenEdit = (block: TimeBlock) => {
        setFormTitle(block.title);
        setFormCategory(block.category);
        setFormStartHour(block.startHour);
        setFormStartMinute(block.startMinute);
        setFormEndHour(block.endHour);
        setFormEndMinute(block.endMinute);
        setFormError(null);
        setEditingBlock(block);
        setSelectedBlock(null);
        setShowAddModal(true);
    };

    const handleSubmit = () => {
        if (!formTitle.trim()) {
            setFormError('Please add a title.');
            return;
        }

        const start = toMinutes(formStartHour, formStartMinute);
        const end = toMinutes(formEndHour, formEndMinute);
        if (end <= start) {
            setFormError('End time must be after start time.');
            return;
        }

        const blockData = {
            title: formTitle.trim(),
            category: formCategory,
            startHour: formStartHour,
            startMinute: formStartMinute,
            endHour: formEndHour,
            endMinute: formEndMinute,
            date: dateStr,
        };

        if (editingBlock) {
            onEditBlock({ ...editingBlock, ...blockData });
        } else {
            onAddBlock(blockData);
        }

        setShowAddModal(false);
        setEditingBlock(null);
    };

    const getPointerMinute = (clientX: number, clientY: number) => {
        if (!svgRef.current) return null;

        const rect = svgRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return null;

        // Normalize browser coordinates into SVG viewBox coordinates so drag math
        // stays accurate regardless of responsive scaling.
        const x = ((clientX - rect.left) / rect.width) * size;
        const y = ((clientY - rect.top) / rect.height) * size;
        const dx = x - center;
        const dy = y - center;
        const distance = Math.hypot(dx, dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const rawMinute = ((angle + 90 + 360) % 360) / 360 * MINUTES_PER_DAY;

        return {
            minute: snapToQuarter(rawMinute),
            distance,
        };
    };

    const resetDragSelection = () => {
        setIsDraggingRange(false);
        setDragStartMinute(null);
        setDragCurrentMinute(null);
        dragStartPointRef.current = null;
        dragMovedRef.current = false;
    };

    const commitDragSelection = () => {
        if (dragStartMinute === null || dragCurrentMinute === null) {
            resetDragSelection();
            return;
        }

        const normalizedRange = resolveDragWindow(dragStartMinute, dragCurrentMinute);
        if (!normalizedRange) {
            resetDragSelection();
            return;
        }

        let start = normalizedRange.start;
        let end = normalizedRange.end;
        if (end - start < SNAP_INTERVAL) {
            end = snapToQuarter(start + DEFAULT_DRAG_DURATION);
        }

        if (end <= start) {
            resetDragSelection();
            return;
        }

        openAddModal(start, end);
        resetDragSelection();
    };

    const handleClockPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
        if (event.button !== 0) return;

        const target = event.target as Element;
        if (target.closest('[data-time-block="true"]')) return;

        const pointerData = getPointerMinute(event.clientX, event.clientY);
        if (!pointerData) return;
        if (pointerData.distance < dragBandInner || pointerData.distance > dragBandOuter) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        setSelectedBlock(null);
        setIsDraggingRange(true);
        setDragStartMinute(pointerData.minute);
        setDragCurrentMinute(pointerData.minute);
        dragStartPointRef.current = { x: event.clientX, y: event.clientY };
        dragMovedRef.current = false;
    };

    const handleClockPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
        if (!isDraggingRange) return;
        if (dragStartPointRef.current) {
            const dx = event.clientX - dragStartPointRef.current.x;
            const dy = event.clientY - dragStartPointRef.current.y;
            if (Math.hypot(dx, dy) > 6) {
                dragMovedRef.current = true;
            }
        }
        const pointerData = getPointerMinute(event.clientX, event.clientY);
        if (!pointerData) return;
        setDragCurrentMinute(pointerData.minute);
    };

    const handleClockPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
        if (!isDraggingRange) return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (!dragMovedRef.current) {
            resetDragSelection();
            return;
        }
        commitDragSelection();
    };

    return (
        <div className="relative">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                    Drag on the time ring to add a task quickly.
                </p>
                {dragPreview && (
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatTime(toTime(dragPreview.start).hour, toTime(dragPreview.start).minute)} - {formatTime(toTime(dragPreview.end).hour, toTime(dragPreview.end).minute)}
                    </p>
                )}
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-[430px_minmax(0,1fr)] gap-5 lg:items-start">
                <div className="relative w-full max-w-[430px] mx-auto lg:mx-0">
                    <div className="rounded-2xl border border-gray-200 dark:border-[#1F2733] bg-white dark:bg-[#0F141D] p-3 sm:p-4">
                        <svg
                            ref={svgRef}
                            width="100%"
                            height="100%"
                            viewBox={`0 0 ${size} ${size}`}
                            className={isDraggingRange ? 'cursor-grabbing select-none' : 'cursor-crosshair select-none'}
                            onPointerDown={handleClockPointerDown}
                            onPointerMove={handleClockPointerMove}
                            onPointerUp={handleClockPointerUp}
                            onPointerCancel={resetDragSelection}
                        >
                        <circle
                            cx={center}
                            cy={center}
                            r={outerRadius + 6}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-gray-200 dark:text-[#263244]"
                        />

                        <circle
                            cx={center}
                            cy={center}
                            r={outerRadius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-300 dark:text-[#2B384C]"
                        />

                        <circle
                            cx={center}
                            cy={center}
                            r={innerRadius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-200 dark:text-[#263244]"
                        />

                        {[0, 3, 6, 9, 12, 15, 18, 21].map((hour) => {
                            const angle = timeToAngle(hour, 0);
                            const tickStart = polarToCartesian(center, center, outerRadius + 2, angle);
                            const tickEnd = polarToCartesian(center, center, tickRadius, angle);
                            const labelPos = polarToCartesian(center, center, tickRadius + 12, angle);

                            return (
                                <g key={hour}>
                                    <line
                                        x1={tickStart.x}
                                        y1={tickStart.y}
                                        x2={tickEnd.x}
                                        y2={tickEnd.y}
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        className="text-gray-400 dark:text-slate-500"
                                    />
                                    <text
                                        x={labelPos.x}
                                        y={labelPos.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-xs font-medium fill-gray-500 dark:fill-slate-400"
                                    >
                                        {String(hour).padStart(2, '0')}
                                    </text>
                                </g>
                            );
                        })}

                        {Array.from({ length: 24 }, (_, i) => i)
                            .filter((hour) => ![0, 3, 6, 9, 12, 15, 18, 21].includes(hour))
                            .map((hour) => {
                                const angle = timeToAngle(hour, 0);
                                const tickStart = polarToCartesian(center, center, outerRadius + 2, angle);
                                const tickEnd = polarToCartesian(center, center, outerRadius + 6, angle);

                                return (
                                    <line
                                        key={hour}
                                        x1={tickStart.x}
                                        y1={tickStart.y}
                                        x2={tickEnd.x}
                                        y2={tickEnd.y}
                                        stroke="currentColor"
                                        strokeWidth="1"
                                        className="text-gray-300 dark:text-[#2B384C]"
                                    />
                                );
                            })}

                        {dragPreview && (
                            <path
                                d={createArcPathFromMinutes(dragPreview.start, dragPreview.end)}
                                fill="rgba(37, 99, 235, 0.18)"
                                stroke="#2563eb"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                            />
                        )}

                        {todayBlocks.map((block) => {
                            const color = block.color || CATEGORY_COLORS[block.category] || CATEGORY_COLORS['Other'];
                            const start = toMinutes(block.startHour, block.startMinute);
                            const end = toMinutes(block.endHour, block.endMinute);
                            const duration = end - start;
                            const midMinute = start + (end - start) / 2;
                            const midAngle = (midMinute / MINUTES_PER_DAY) * 360 - 90;
                            const iconPos = polarToCartesian(center, center, (outerRadius + innerRadius) / 2, midAngle);

                            return (
                                <g
                                    key={block.id}
                                    data-time-block="true"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setSelectedBlock(selectedBlock?.id === block.id ? null : block);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <path
                                        data-time-block="true"
                                        d={createArcPath(block.startHour, block.startMinute, block.endHour, block.endMinute)}
                                        fill={color}
                                        opacity={selectedBlock?.id === block.id ? 0.95 : 0.78}
                                        stroke={selectedBlock?.id === block.id ? '#ffffff' : '#ffffff70'}
                                        strokeWidth={selectedBlock?.id === block.id ? 2 : 1}
                                        className="transition-opacity duration-150 hover:opacity-95"
                                    />
                                    {duration >= 30 && (
                                        <>
                                            {block.icon ? (
                                                <text
                                                    x={iconPos.x}
                                                    y={iconPos.y}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-sm pointer-events-none"
                                                >
                                                    {block.icon}
                                                </text>
                                            ) : (
                                                <g transform={`translate(${iconPos.x - 9}, ${iconPos.y - 9})`} className="pointer-events-none text-white">
                                                    {(() => {
                                                        const Icon = CATEGORY_ICONS[block.category] || CATEGORY_ICONS['Other'];
                                                        return <Icon size={18} strokeWidth={2.5} />;
                                                    })()}
                                                </g>
                                            )}
                                        </>
                                    )}
                                </g>
                            );
                        })}

                        {isToday && (
                            <g>
                                <line
                                    x1={center}
                                    y1={center}
                                    x2={polarToCartesian(center, center, outerRadius + 8, currentAngle).x}
                                    y2={polarToCartesian(center, center, outerRadius + 8, currentAngle).y}
                                    stroke="#2563eb"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <circle cx={center} cy={center} r="4" fill="#2563eb" />
                            </g>
                        )}

                        <circle
                            cx={center}
                            cy={center}
                            r={innerRadius - 4}
                            className="fill-white dark:fill-[#0F141D]"
                        />
                        </svg>
                    </div>

                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center justify-center gap-1"
                        style={{ width: innerRadius * 1.5 }}
                    >
                        <div className="text-lg font-bold text-gray-900 dark:text-slate-100 tracking-wide">
                            {localDayName}
                        </div>
                        <div className="text-base font-mono font-semibold text-blue-600 dark:text-blue-400">
                            {localTimeLabel}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                            {formatDuration(totalScheduledMinutes)} scheduled
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-[#1F2733] bg-white dark:bg-[#0F141D] p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Schedule</h3>
                        {selectedBlock && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenEdit(selectedBlock)}
                                    className="p-2 bg-white dark:bg-[#121821] rounded-lg shadow-sm border border-gray-200 dark:border-[#2A3444] hover:bg-gray-50 dark:hover:bg-[#1A2433] transition-colors"
                                    aria-label="Edit selected task"
                                >
                                    <Pencil size={16} className="text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                    onClick={() => {
                                        onDeleteBlock(selectedBlock.id);
                                        setSelectedBlock(null);
                                    }}
                                    className="p-2 bg-white dark:bg-[#121821] rounded-lg shadow-sm border border-gray-200 dark:border-[#2A3444] hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    aria-label="Delete selected task"
                                >
                                    <Trash2 size={16} className="text-red-500" />
                                </button>
                            </div>
                        )}
                    </div>

                    {todayBlocks.length > 0 ? (
                        <div className="rounded-xl border border-gray-200 dark:border-[#1F2733] bg-white dark:bg-[#0F141D] divide-y divide-gray-100 dark:divide-[#1A2332] max-h-[340px] overflow-y-auto">
                            {todayBlocks.map((block) => {
                                const start = toMinutes(block.startHour, block.startMinute);
                                const end = toMinutes(block.endHour, block.endMinute);
                                const color = block.color || CATEGORY_COLORS[block.category] || CATEGORY_COLORS['Other'];
                                const isSelected = selectedBlock?.id === block.id;

                                return (
                                    <button
                                        key={`row-${block.id}`}
                                        onClick={() => setSelectedBlock(isSelected ? null : block)}
                                        className={`w-full px-4 py-3 text-left transition-colors ${isSelected
                                            ? 'bg-blue-50 dark:bg-[#172131]'
                                            : 'hover:bg-gray-50 dark:hover:bg-[#121821]'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span
                                                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                                                    {block.title}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                                                {formatTime(block.startHour, block.startMinute)} - {formatTime(block.endHour, block.endMinute)} ({formatDuration(end - start)})
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 dark:border-[#2A3444] px-4 py-6 text-sm text-gray-500 dark:text-slate-400 text-center">
                            No tasks yet for this day.
                        </div>
                    )}

                    {showAddButton && (
                        <button
                            onClick={() => openAddModal()}
                            className="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus size={20} />
                            New Task
                        </button>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-white dark:bg-[#0F141D] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-[#1F2733]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                                {editingBlock ? 'Edit Task' : 'New Task'}
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-[#121821] rounded-lg"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(event) => {
                                        setFormTitle(event.target.value);
                                        if (formError) setFormError(null);
                                    }}
                                    placeholder="What are you working on?"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#121821] border border-gray-200 dark:border-[#2A3444] rounded-xl text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">
                                    Category
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(CATEGORY_COLORS) as TimeBlockCategory[]).map((category) => {
                                        const isSelected = formCategory === category;
                                        const Icon = CATEGORY_ICONS[category];
                                        return (
                                            <button
                                                key={category}
                                                onClick={() => setFormCategory(category)}
                                                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${isSelected
                                                        ? 'border-current'
                                                        : 'border-transparent hover:border-gray-300 dark:hover:border-[#2A3444]'
                                                    }`}
                                                style={{
                                                    backgroundColor: `${CATEGORY_COLORS[category]}1A`,
                                                    color: CATEGORY_COLORS[category],
                                                }}
                                            >
                                                <Icon size={14} /> {CATEGORY_LABELS[category]}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">
                                        Start
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formStartHour}
                                            onChange={(event) => {
                                                setFormStartHour(Number(event.target.value));
                                                if (formError) setFormError(null);
                                            }}
                                            className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-[#121821] border border-gray-200 dark:border-[#2A3444] rounded-lg text-gray-900 dark:text-slate-100"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={i}>
                                                    {String(i).padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={formStartMinute}
                                            onChange={(event) => {
                                                setFormStartMinute(Number(event.target.value));
                                                if (formError) setFormError(null);
                                            }}
                                            className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-[#121821] border border-gray-200 dark:border-[#2A3444] rounded-lg text-gray-900 dark:text-slate-100"
                                        >
                                            {[0, 15, 30, 45].map((minute) => (
                                                <option key={minute} value={minute}>
                                                    {String(minute).padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 block">
                                        End
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formEndHour}
                                            onChange={(event) => {
                                                setFormEndHour(Number(event.target.value));
                                                if (formError) setFormError(null);
                                            }}
                                            className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-[#121821] border border-gray-200 dark:border-[#2A3444] rounded-lg text-gray-900 dark:text-slate-100"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={i}>
                                                    {String(i).padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            value={formEndMinute}
                                            onChange={(event) => {
                                                setFormEndMinute(Number(event.target.value));
                                                if (formError) setFormError(null);
                                            }}
                                            className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-[#121821] border border-gray-200 dark:border-[#2A3444] rounded-lg text-gray-900 dark:text-slate-100"
                                        >
                                            {[0, 15, 30, 45].map((minute) => (
                                                <option key={minute} value={minute}>
                                                    {String(minute).padStart(2, '0')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {formError && (
                                <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={!formTitle.trim()}
                                className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {editingBlock ? 'Save Changes' : 'Add Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RadialSchedule;
