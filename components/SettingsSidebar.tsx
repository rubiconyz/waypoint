import React from 'react';
import { X, Command, Moon, Plus, LayoutDashboard, BarChart2, Award, Mountain, Check, Palette } from 'lucide-react';

interface SettingsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentWallpaper?: string;
    onSetWallpaper?: (id: string) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
    isOpen,
    onClose,
    currentWallpaper = 'none',
    onSetWallpaper = () => { }
}) => {
    // Determine modifier key based on OS
    const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const modKey = isMac ? 'Cmd' : 'Ctrl';

    const WALLPAPERS = [
        { id: 'none', label: 'Default', class: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800' },
        { id: 'countryside', label: 'Countryside', class: 'bg-cover bg-center', style: { backgroundImage: "url('/assets/wallpapers/countryside.jpg')" } },
        { id: 'ocean', label: 'Ocean', class: 'bg-cover bg-center', style: { backgroundImage: "url('/assets/wallpapers/ocean.jpg')" } },
        { id: 'forest', label: 'Forest', class: 'bg-cover bg-center', style: { backgroundImage: "url('/assets/wallpapers/forest.jpg')" } },
        { id: 'midnight', label: 'Midnight', class: 'bg-cover bg-center', style: { backgroundImage: "url('/assets/wallpapers/midnight.jpg')" } },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5" />
                            Settings
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-8 overflow-y-auto flex-1">

                        {/* Wallpaper Section */}
                        {onSetWallpaper && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Palette className="w-3 h-3" />
                                    Appearance
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {WALLPAPERS.map((wp) => (
                                        <button
                                            key={wp.id}
                                            onClick={() => onSetWallpaper(wp.id)}
                                            className={`
                                                relative aspect-square rounded-xl overflow-hidden shadow-sm transition-all
                                                ${currentWallpaper === wp.id ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900 scale-95' : 'hover:scale-105 hover:shadow-md'}
                                            `}
                                        >
                                            <div className={`w-full h-full ${wp.class}`} style={wp.style} />
                                            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-[10px] text-white py-1 text-center font-medium backdrop-blur-sm">
                                                {wp.label}
                                            </span>
                                            {currentWallpaper === wp.id && (
                                                <div className="absolute top-1 right-1 bg-indigo-500 rounded-full p-0.5">
                                                    <Check size={10} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Shortcuts Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Shortcuts</h3>
                            <div className="space-y-2">
                                <ShortcutItem
                                    keys={[modKey, 'K']}
                                    label="Toggle Shortcuts"
                                    icon={<Command size={16} />}
                                />
                                <ShortcutItem
                                    keys={[modKey, 'I']}
                                    label="New Habit"
                                    icon={<Plus size={16} />}
                                />
                            </div>
                        </div>

                        {/* Navigation Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Navigation</h3>
                            <div className="space-y-2">
                                <ShortcutItem
                                    keys={[modKey, '1']}
                                    label="Tracker Tab"
                                    icon={<LayoutDashboard size={16} />}
                                />
                                <ShortcutItem
                                    keys={[modKey, '2']}
                                    label="Analytics Tab"
                                    icon={<BarChart2 size={16} />}
                                />
                                <ShortcutItem
                                    keys={[modKey, '3']}
                                    label="Badges Tab"
                                    icon={<Award size={16} />}
                                />
                                <ShortcutItem
                                    keys={[modKey, '4']}
                                    label="Mountain Tab"
                                    icon={<Mountain size={16} />}
                                />
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                Tip: Shortcuts work anywhere in the app!
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 mt-auto border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
                        v1.1.0 • Waypoint
                    </div>
                </div>
            </div>
        </>
    );
};

// Helper component for individual shortcut row
const ShortcutItem: React.FC<{ keys: string[], label: string, icon: React.ReactNode }> = ({ keys, label, icon }) => (
    <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <span className="text-gray-400 group-hover:text-indigo-500 transition-colors">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1">
            {keys.map((k, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-medium text-gray-500 dark:text-gray-400 font-mono">
                    {k}
                </span>
            ))}
        </div>
    </div>
);
