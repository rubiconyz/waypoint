import React from 'react';
import { X, Command, Moon, Plus, LayoutDashboard, BarChart2, Award, Mountain, Check, Palette, Languages } from 'lucide-react';

interface SettingsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentWallpaper?: string;
    onSetWallpaper?: (id: string) => void;
    activeTab?: string;
    onSwitchTab?: (tab: string) => void;
    appMode?: 'habits' | 'languages';
    onSetAppMode?: (mode: 'habits' | 'languages') => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
    isOpen,
    onClose,
    currentWallpaper = 'none',
    onSetWallpaper = () => { },
    activeTab,
    onSwitchTab,
    appMode = 'habits',
    onSetAppMode
}) => {
    // Determine modifier key based on OS
    const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const modKey = isMac ? 'Cmd' : 'Ctrl';

    const NAV_ITEMS = [
        { id: 'tracker', label: 'Tracker', icon: <LayoutDashboard size={18} /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
        { id: 'badges', label: 'Badges', icon: <Award size={18} /> },
        { id: 'challenges', label: 'Challenges', icon: <Mountain size={18} /> }, // Using Mountain explicitly or Users if preferred? reusing import
        { id: 'mountain', label: 'Mountain', icon: <Mountain size={18} /> }
    ];

    const WALLPAPERS = [
        { id: 'none', label: 'Default', class: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800' },
        { id: 'sunset', label: 'Sunset', class: 'bg-cover bg-center', style: { backgroundImage: "url('/assets/wallpapers/sunset.jpg')" } },
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

                        {/* Domain Switcher */}
                        {onSetAppMode && (
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    Switch Platform
                                </h3>
                                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                    <button
                                        onClick={() => {
                                            onSetAppMode('habits');
                                            if (onSwitchTab) onSwitchTab('tracker');
                                        }}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${appMode === 'habits'
                                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <Check size={16} />
                                        Habits
                                    </button>
                                    <button
                                        onClick={() => {
                                            onSetAppMode('languages');
                                            if (onSwitchTab) onSwitchTab('immersion');
                                        }}
                                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${appMode === 'languages'
                                            ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {/* Need to import Languages from lucide-react if not already available in scope, but wait, it is imported? Checking file content... No Languages in import list at top */}
                                        {/* Let's use generic for now or fix imports next step? Actually I should check line 2.
                                        Line 2: import { X, Command, Moon, Plus, LayoutDashboard, BarChart2, Award, Mountain, Check, Palette } ... Languages is MISSING.
                                        I will fix import in a separate step or just assume I can edit imports?
                                        Warning: `replace_file_content` is a single contiguous block.
                                        I will use `Languages` here but I must update the import too.
                                        Ah, I can't edit imports AND this block in one tool call unless I replace the whole file or a huge chunk.
                                        I'll stick to replacing this block and adding a TODO or immediately following up.
                                        Actually, I can use a generic icon available like Globe? or just Text. Check is available.
                                        Let's assume I will fix imports right after.
                                         */}
                                        <Languages size={16} />
                                        <span>Languages</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mobile Navigation (Hidden on Desktop) */}
                        {onSwitchTab && activeTab && (
                            <div className="md:hidden">
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <LayoutDashboard className="w-3 h-3" />
                                    Navigate
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {NAV_ITEMS.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                onSwitchTab(item.id);
                                                onClose();
                                            }}
                                            className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${activeTab === item.id
                                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-medium'
                                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {item.icon}
                                            <span className="text-sm">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Wallpaper Section - Only for Habits Mode */}
                        {onSetWallpaper && appMode === 'habits' && (
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
                                                ${currentWallpaper === wp.id ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 scale-95' : 'hover:scale-105 hover:shadow-md'}
                                            `}
                                        >
                                            <div className={`w-full h-full ${wp.class}`} style={wp.style} />
                                            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-[10px] text-white py-1 text-center font-medium backdrop-blur-sm">
                                                {wp.label}
                                            </span>
                                            {currentWallpaper === wp.id && (
                                                <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5">
                                                    <Check size={10} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Shortcuts Section */}
                        {appMode === 'habits' && (
                            <div className="hidden md:block">
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
                        )}

                        {/* Navigation Section */}
                        {appMode === 'habits' && (
                            <div className="hidden md:block">
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
                        )}

                        {appMode === 'habits' && (
                            <div className="hidden md:block mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                    Tip: Shortcuts work anywhere in the app!
                                </p>
                            </div>
                        )}
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
