import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    onSnapshot,
    writeBatch,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { Habit, BadgeProgress } from '../types';

// Save habits to Firestore
export const saveHabitsToFirestore = async (userId: string, habits: Habit[]) => {
    const batch = writeBatch(db);

    habits.forEach((habit, index) => {
        const habitRef = doc(db, `users/${userId}/habits/${habit.id}`);
        // Ensure order is saved
        batch.set(habitRef, { ...habit, order: index });
    });

    await batch.commit();
};

// Delete habit from Firestore
export const deleteHabitFromFirestore = async (userId: string, habitId: string) => {
    const habitRef = doc(db, `users/${userId}/habits/${habitId}`);
    await deleteDoc(habitRef);
};

// Load habits from Firestore
export const loadHabitsFromFirestore = async (userId: string): Promise<Habit[]> => {
    const habitsRef = collection(db, `users/${userId}/habits`);
    const snapshot = await getDocs(habitsRef);

    const habits = snapshot.docs.map(doc => doc.data() as Habit);
    // Sort by order field
    return habits.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

// Save badge progress
export const saveBadgeProgressToFirestore = async (
    userId: string,
    badgeProgress: Record<string, BadgeProgress>
) => {
    const progressRef = doc(db, `users/${userId}/badges/progressDoc`);
    await setDoc(progressRef, { badgeProgress });
};

// Load badge progress
export const loadBadgeProgressFromFirestore = async (
    userId: string
): Promise<Record<string, BadgeProgress> | null> => {
    const progressRef = doc(db, `users/${userId}/badges/progressDoc`);
    const snapshot = await getDoc(progressRef);

    if (snapshot.exists()) {
        return snapshot.data().badgeProgress;
    }
    return null;
};

// Save total habits created
// Save user stats (coins, checkpoints, total habits)
export const saveUserStatsToFirestore = async (
    userId: string,
    stats: {
        totalHabitsCreated?: number;
        coins?: number;
        unlockedCheckpoints?: number[];
    }
) => {
    const metaRef = doc(db, `users/${userId}/meta/statsDoc`);
    await setDoc(metaRef, stats, { merge: true });
};

// Load total habits created
// Load user stats
export const loadUserStatsFromFirestore = async (
    userId: string
): Promise<{
    totalHabitsCreated?: number;
    coins?: number;
    unlockedCheckpoints?: number[];
} | null> => {
    const metaRef = doc(db, `users/${userId}/meta/statsDoc`);
    const snapshot = await getDoc(metaRef);

    if (snapshot.exists()) {
        return snapshot.data() as {
            totalHabitsCreated?: number;
            coins?: number;
            unlockedCheckpoints?: number[];
        };
    }
    return null;
};

// Real-time listener for habits
export const subscribeToHabits = (
    userId: string,
    callback: (habits: Habit[]) => void
) => {
    const habitsRef = collection(db, `users/${userId}/habits`);

    return onSnapshot(habitsRef, (snapshot) => {
        const habits = snapshot.docs.map(doc => doc.data() as Habit);
        callback(habits);
    });
};

import { Challenge, ChallengeParticipant } from '../types';
import { query, where, updateDoc, arrayUnion } from 'firebase/firestore';

// CHALLENGES SERVICE

// 1. Create/Update a challenge (Global collection)
// 1. Create/Update a challenge (Global collection)
export const saveChallengeToFirestore = async (challenge: Challenge) => {
    // Sanitize: Firestore rejects 'undefined' values. Convert optional fields to null if undefined.
    // Indexing: Add 'participantIds' for efficient querying
    const participantIds = challenge.participants.map(p => p.odId);

    const dataToSave = {
        ...challenge,
        description: challenge.description ?? null,
        habitId: challenge.habitId ?? null,
        participantIds // searchable index
    };

    // Also ensure participants don't have undefined fields (e.g. avatarVariant)
    const sanitizedParticipants = challenge.participants.map(p => ({
        ...p,
        avatarVariant: p.avatarVariant ?? '1'
    }));
    dataToSave.participants = sanitizedParticipants;

    const challengeRef = doc(db, 'challenges', challenge.id);
    await setDoc(challengeRef, dataToSave, { merge: true });
};

// 2. Find challenge by Invite Code (Global lookup)
export const findChallengeByInviteCode = async (inviteCode: string): Promise<Challenge | null> => {
    console.log(`[Firestore] Looking up challenge with code: ${inviteCode}`);
    try {
        const challengesRef = collection(db, 'challenges');
        const q = query(challengesRef, where('inviteCode', '==', inviteCode));
        const snapshot = await getDocs(q);

        console.log(`[Firestore] Lookup result empty? ${snapshot.empty}. Docs found: ${snapshot.size}`);

        if (!snapshot.empty) {
            const data = snapshot.docs[0].data() as Challenge;
            console.log('[Firestore] Challenge found:', data.id, data.title);
            return data;
        }
        return null;
    } catch (error) {
        console.error('[Firestore] Error looking up challenge:', error);
        throw error; // Throw so UI can handle/display it
    }
};

// 3. Update Challenge (e.g. adding participant)
// 3. Update Challenge (e.g. adding participant)
export const updateChallengeInFirestore = async (challengeId: string, updates: Partial<Challenge>) => {
    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, updates);
};

// 4. Delete Challenge (Global)
export const deleteChallengeFromFirestore = async (challengeId: string) => {
    const challengeRef = doc(db, 'challenges', challengeId);
    await deleteDoc(challengeRef);
};

// 5. Subscribe to User's Challenges (Real-time)
// Replaces loadUserChallengesFromFirestore for main sync
export const subscribeToUserChallenges = (
    userId: string,
    callback: (challenges: Challenge[]) => void
) => {
    // Query challenges where 'participantIds' array contains userId
    const challengesRef = collection(db, 'challenges');
    const q = query(challengesRef, where('participantIds', 'array-contains', userId));

    return onSnapshot(q, (snapshot) => {
        const challenges = snapshot.docs.map(doc => doc.data() as Challenge);
        callback(challenges);
    });
};

// Legacy load (optional, for explicit One-Shot fetch if needed)
export const loadUserChallengesFromFirestore = async (userId: string): Promise<Challenge[]> => {
    // Attempt to query efficiently if index exists, fallback manual if needed?
    // Actually, let's use the new robust query now.
    const challengesRef = collection(db, 'challenges');
    const q = query(challengesRef, where('participantIds', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Challenge);
};
