import { Challenge, ChallengeParticipant } from './types';

// Avatar color palette for participants
export const AVATAR_COLORS = [
    '#2E7D32', // Green (Creator/Admin) - Matches Character 1
    '#FF6B6B', // Redish (First Guest) - Matches Character 2
    '#FFD600', // Yellow
    '#1565C0', // Blue
    '#9C27B0', // Purple
    '#FF6D00', // Orange
    '#00ACC1', // Cyan
    '#455A64', // Blue Grey
];

// Generate a unique invite code
export const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0/O, 1/I
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Get shareable invite link
export const getInviteLink = (inviteCode: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://waypoint.app';
    return `${baseUrl}/challenge/${inviteCode}`;
};

// Calculate completion rate for a participant
export const calculateCompletionRate = (completedDays: number, totalDays: number): number => {
    if (totalDays === 0) return 0;
    return Math.round((completedDays / totalDays) * 100);
};

// Get next available avatar color for a challenge
export const getNextAvatarColor = (existingParticipants: ChallengeParticipant[]): string => {
    const usedColors = existingParticipants.map(p => p.avatarColor);
    const availableColor = AVATAR_COLORS.find(color => !usedColors.includes(color));
    return availableColor || AVATAR_COLORS[existingParticipants.length % AVATAR_COLORS.length];
};

// Calculate days elapsed in challenge
export const getDaysElapsed = (startDate: string): number => {
    const start = new Date(startDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays + 1); // +1 to include start day
};

// Calculate days remaining in challenge
export const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

// Check if challenge is still active
export const isChallengeActive = (challenge: Challenge): boolean => {
    const today = new Date();
    const endDate = new Date(challenge.endDate);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return today <= endDate && challenge.isActive;
};

// Create a new challenge object
export const createChallenge = (
    creatorId: string,
    creatorName: string,
    habitTitle: string,
    habitId: string | undefined,
    title: string,
    duration: number,
    description?: string,
    category?: string // Add category parameter
): Challenge => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + duration - 1);

    const inviteCode = generateInviteCode();

    const creatorParticipant: ChallengeParticipant = {
        odId: creatorId,
        displayName: creatorName,
        avatarColor: AVATAR_COLORS[0],
        avatarVariant: '1', // Creator always gets character 1
        joinedAt: today.toISOString(),
        completedDays: 0,
        totalDays: duration, // FIX: Initialize with full duration
        completionRate: 0,
        hasCompleted: false,
    };

    return {
        id: crypto.randomUUID(),
        creatorId,
        habitTitle,
        habitId,
        title,
        description,
        category, // Save category
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        duration,
        inviteCode,
        participants: [creatorParticipant],
        createdAt: new Date().toISOString(),
        isActive: true,
    };
};

// Add a participant to a challenge
export const addParticipant = (
    challenge: Challenge,
    odId: string,
    displayName: string
): Challenge => {
    // Limit to 2 participants
    if (challenge.participants.length >= 2) {
        console.warn("Challenge is full (max 2 participants)");
        return challenge;
    }

    // Check if already joined
    if (challenge.participants.some(p => p.odId === odId)) {
        return challenge;
    }

    const newParticipant: ChallengeParticipant = {
        odId,
        displayName,
        avatarColor: getNextAvatarColor(challenge.participants),
        avatarVariant: '2', // Second participant always gets character 2
        joinedAt: new Date().toISOString(),
        completedDays: 0,
        totalDays: challenge.duration, // FIX: Initialize with full duration
        completionRate: 0,
        hasCompleted: false,
    };

    return {
        ...challenge,
        participants: [...challenge.participants, newParticipant],
    };
};

// Update participant progress
export const updateParticipantProgress = (
    challenge: Challenge,
    odId: string,
    completedDays: number
): Challenge => {
    // FIX: Calculate against TOTAL DURATION, not elapsed days.
    // This ensures 1 day completed = 1/45 progress, not 1/1 (100%).
    const targetDays = challenge.duration;
    const completionRate = calculateCompletionRate(completedDays, targetDays);
    const hasCompleted = completedDays >= targetDays; // Simple check

    return {
        ...challenge,
        participants: challenge.participants.map(p =>
            p.odId === odId
                ? { ...p, completedDays, totalDays: targetDays, completionRate, hasCompleted }
                : p
        ),
    };
};

// Sort participants by completion rate (for leaderboard later)
export const sortParticipantsByProgress = (participants: ChallengeParticipant[]): ChallengeParticipant[] => {
    return [...participants].sort((a, b) => b.completionRate - a.completionRate);
};

// Remove a participant from a challenge
export const removeParticipant = (
    challenge: Challenge,
    participantId: string
): Challenge => {
    // Cannot remove creator
    if (participantId === challenge.creatorId) {
        return challenge;
    }

    return {
        ...challenge,
        participants: challenge.participants.filter(p => p.odId !== participantId)
    };
};

// Update a participant's display name
export const updateParticipantName = (
    challenge: Challenge,
    participantId: string,
    newName: string
): Challenge => {
    return {
        ...challenge,
        participants: challenge.participants.map(p =>
            p.odId === participantId
                ? { ...p, displayName: newName }
                : p
        )
    };
};
