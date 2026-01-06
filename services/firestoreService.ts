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

    habits.forEach(habit => {
        const habitRef = doc(db, `users/${userId}/habits/${habit.id}`);
        batch.set(habitRef, habit);
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

    return snapshot.docs.map(doc => doc.data() as Habit);
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
