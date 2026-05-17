import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getDatabase, ref, set, onValue, push, serverTimestamp, child, get } from "firebase/database";

// Firebase config (original)
const firebaseConfig = {
  apiKey: "AIzaSyDsDwx3pB3Eg-vb8C6t8wOQDOdON8N5Yqo",
  authDomain: "club-fire-11.firebaseapp.com",
  databaseURL: "https://club-fire-11-default-rtdb.firebaseio.com",
  projectId: "club-fire-11",
  storageBucket: "club-fire-11.firebasestorage.app",
  messagingSenderId: "519098949332",
  appId: "1:519098949332:web:563a47157dd9e5ba50a541",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
