import { Fish } from './types';

// All fish species in the ocean
export const FISH_SPECIES: Fish[] = [
    // Starter Fish (Days 1-7)
    {
        id: 'clownfish',
        name: 'Clownfish',
        emoji: '🐠',
        unlockStreak: 1,
        rarity: 'starter',
        description: 'Your first ocean friend! Playful and colorful.',
        size: 'small',
        color: '#FF8C42'
    },
    {
        id: 'blue-tang',
        name: 'Blue Tang',
        emoji: '🐟',
        unlockStreak: 3,
        rarity: 'starter',
        description: 'Just keep swimming! A vibrant blue beauty.',
        size: 'small',
        color: '#4A90E2'
    },
    {
        id: 'shrimp',
        name: 'Shrimp',
        emoji: '🦐',
        unlockStreak: 5,
        rarity: 'starter',
        description: 'Small but mighty bottom dweller.',
        size: 'small',
        color: '#FF6B9D'
    },
    {
        id: 'starfish',
        name: 'Starfish',
        emoji: '⭐',
        unlockStreak: 7,
        rarity: 'starter',
        description: 'A star is born in your ocean!',
        size: 'small',
        color: '#FFD93D'
    },

    // Common Fish (Days 8-30)
    {
        id: 'pufferfish',
        name: 'Pufferfish',
        emoji: '🐡',
        unlockStreak: 10,
        rarity: 'common',
        description: 'Adorably spiky when threatened.',
        size: 'small',
        color: '#FFB84D'
    },
    {
        id: 'squid',
        name: 'Squid',
        emoji: '🦑',
        unlockStreak: 15,
        rarity: 'common',
        description: 'Intelligent and graceful swimmer.',
        size: 'medium',
        color: '#E94B3C'
    },
    {
        id: 'sea-turtle',
        name: 'Sea Turtle',
        emoji: '🐢',
        unlockStreak: 20,
        rarity: 'common',
        description: 'Ancient wisdom in a shell.',
        size: 'medium',
        color: '#6BCF7F'
    },
    {
        id: 'crab',
        name: 'Crab',
        emoji: '🦀',
        unlockStreak: 25,
        rarity: 'common',
        description: 'Sideways scuttling reef guardian.',
        size: 'small',
        color: '#FF6B6B'
    },
    {
        id: 'octopus',
        name: 'Octopus',
        emoji: '🐙',
        unlockStreak: 30,
        rarity: 'common',
        description: 'Master of camouflage and intelligence.',
        size: 'medium',
        color: '#9B59B6'
    },

    // Rare Fish (Days 31-100)
    {
        id: 'reef-shark',
        name: 'Reef Shark',
        emoji: '🦈',
        unlockStreak: 40,
        rarity: 'rare',
        description: 'Apex predator joins your reef!',
        size: 'large',
        color: '#5D6D7E'
    },
    {
        id: 'dolphin',
        name: 'Dolphin',
        emoji: '🐬',
        unlockStreak: 50,
        rarity: 'rare',
        description: 'Playful and highly intelligent friend.',
        size: 'large',
        color: '#3498DB'
    },
    {
        id: 'jellyfish',
        name: 'Jellyfish',
        emoji: '🪼',
        unlockStreak: 60,
        rarity: 'rare',
        description: 'Gracefully floating through the currents.',
        size: 'medium',
        color: '#E8B4F0'
    },
    {
        id: 'seal',
        name: 'Seal',
        emoji: '🦭',
        unlockStreak: 75,
        rarity: 'rare',
        description: 'Curious and playful marine mammal.',
        size: 'large',
        color: '#8B7355'
    },
    {
        id: 'lobster',
        name: 'Lobster',
        emoji: '🦞',
        unlockStreak: 90,
        rarity: 'rare',
        description: 'Armored royalty of the reef.',
        size: 'small',
        color: '#C0392B'
    },
    {
        id: 'orca',
        name: 'Orca',
        emoji: '🐋',
        unlockStreak: 100,
        rarity: 'rare',
        description: 'The ocean\'s most powerful hunter arrives!',
        size: 'large',
        color: '#2C3E50'
    },

    // Legendary Fish (Days 100+)
    {
        id: 'blue-whale',
        name: 'Blue Whale',
        emoji: '🐳',
        unlockStreak: 150,
        rarity: 'legendary',
        description: 'The largest animal on Earth graces your ocean!',
        size: 'large',
        color: '#2980B9'
    },
    {
        id: 'giant-squid',
        name: 'Giant Squid',
        emoji: '🦑',
        unlockStreak: 200,
        rarity: 'legendary',
        description: 'Mysterious deep-sea legend surfaces.',
        size: 'large',
        color: '#8E44AD'
    },
    {
        id: 'bioluminescent-jellyfish',
        name: 'Bioluminescent Jellyfish',
        emoji: '✨',
        unlockStreak: 250,
        rarity: 'legendary',
        description: 'Glowing beauty from the abyss.',
        size: 'medium',
        color: '#00F5FF'
    },
    {
        id: 'golden-seahorse',
        name: 'Golden Seahorse',
        emoji: '🏆',
        unlockStreak: 365,
        rarity: 'legendary',
        description: 'One year of dedication! The ultimate prize.',
        size: 'small',
        color: '#FFD700'
    },

    // Special Comeback Fish
    {
        id: 'resilient-grouper',
        name: 'Resilient Grouper',
        emoji: '🌟',
        unlockStreak: -1, // Special unlock condition
        rarity: 'special',
        description: 'Awarded for your first comeback after a 7+ day break!',
        size: 'medium',
        color: '#F39C12'
    },
    {
        id: 'phoenix-fish',
        name: 'Phoenix Fish',
        emoji: '💪',
        unlockStreak: -2, // Special unlock condition
        rarity: 'special',
        description: 'Rose from the ashes 3 times! True perseverance.',
        size: 'medium',
        color: '#E74C3C'
    }
];

// Pollution stage configurations
export const POLLUTION_STAGES = {
    0: {
        name: 'Pristine',
        waterGradient: 'from-cyan-400 via-blue-500 to-blue-900',
        clarity: 100,
        weedCoverage: 0,
        trashCount: 0,
        fishVisible: 100,
        coralColor: 'vibrant',
        message: '🌊 Your ocean is healthy and thriving!'
    },
    1: {
        name: 'Warning',
        waterGradient: 'from-cyan-400 via-emerald-500 to-blue-800',
        clarity: 80,
        weedCoverage: 10,
        trashCount: 0,
        fishVisible: 90,
        coralColor: 'slightly-dimmed',
        message: '⚠️ Your ocean misses you! Complete habits to keep it clean.'
    },
    2: {
        name: 'Polluted',
        waterGradient: 'from-emerald-500 via-emerald-700 to-slate-700',
        clarity: 50,
        weedCoverage: 30,
        trashCount: 5,
        fishVisible: 40,
        coralColor: 'graying',
        message: '🚨 Pollution spreading! Small fish are leaving.'
    },
    3: {
        name: 'Severely Polluted',
        waterGradient: 'from-emerald-700 via-slate-600 to-slate-800',
        clarity: 25,
        weedCoverage: 60,
        trashCount: 10,
        fishVisible: 20,
        coralColor: 'bleached',
        message: '💀 Critical! Your ocean is dying. Act now!'
    },
    4: {
        name: 'Dead Zone',
        waterGradient: 'from-slate-600 via-slate-700 to-slate-900',
        clarity: 10,
        weedCoverage: 90,
        trashCount: 15,
        fishVisible: 0,
        coralColor: 'dead',
        message: '☠️ Emergency! All marine life has fled. Restore your ocean!'
    }
} as const;

// Calculate pollution level based on days missed
export const calculatePollutionLevel = (daysSinceCompletion: number): 0 | 1 | 2 | 3 | 4 => {
    if (daysSinceCompletion === 0) return 0;
    if (daysSinceCompletion === 1) return 1;
    if (daysSinceCompletion <= 3) return 2;
    if (daysSinceCompletion <= 5) return 3;
    return 4;
};

// Get fish that should be visible based on pollution level
export const getActiveFish = (
    discoveredFish: string[],
    pollutionLevel: 0 | 1 | 2 | 3 | 4
): string[] => {
    const visiblePercentage = POLLUTION_STAGES[pollutionLevel].fishVisible;

    if (visiblePercentage === 0) return [];
    if (visiblePercentage === 100) return discoveredFish;

    // Remove fish based on size - smaller fish leave first
    const fishWithData = discoveredFish.map(id => {
        const fish = FISH_SPECIES.find(f => f.id === id);
        return { id, size: fish?.size || 'small' };
    });

    // Sort by size (small fish leave first)
    const sizeOrder = { small: 0, medium: 1, large: 2 };
    fishWithData.sort((a, b) => sizeOrder[a.size] - sizeOrder[b.size]);

    const keepCount = Math.ceil(fishWithData.length * (visiblePercentage / 100));
    return fishWithData.slice(-keepCount).map(f => f.id);
};
