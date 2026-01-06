import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCvnjQ8WQk4AjvAEx4UBRhDur5iVvqAU_w",
    authDomain: "waypoint-habits.firebaseapp.com",
    projectId: "waypoint-habits",
    storageBucket: "waypoint-habits.firebasestorage.app",
    messagingSenderId: "191474473354",
    appId: "1:191474473354:web:d351c314d99828aaa09073",
    measurementId: "G-ZCE05NT33Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
