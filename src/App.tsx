import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase/config';
import { ref, update, get, onDisconnect, serverTimestamp } from 'firebase/database';
import { useAppStore } from './store/useAppStore';
import { rateLimit } from './lib/rateLimit';
import Login from './components/Login';
import MainLayout from './components/layout/MainLayout';
import { Loader2 } from 'lucide-react';
import { BrowserRouter } from 'react-router-dom';
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { client } from "./agora/config";

export default function App() {
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAppStore();

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      if (currentUser) {
        const photoURL = currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.uid}&background=random`;
        const displayName = currentUser.displayName || 'Guest Gamer';
        
        // Initial state from auth object
        const isAdminUser = currentUser.email === 'admin1@gmail.com';
        setUser({
          uid: currentUser.uid,
          displayName: displayName,
          photoURL: photoURL,
          isAnonymous: currentUser.isAnonymous,
        });
        // @ts-ignore
        if (isAdminUser) useAppStore.getState().setIsAdmin(true);

        const userRef = ref(db, `users/${currentUser.uid}`);
        
        // Listen to user data in Realtime Database
        import('firebase/database').then(({ onValue }) => {
           onValue(userRef, (snapshot) => {
             if (snapshot.exists()) {
                const data = snapshot.val();
                if (isMounted) {
                   setUser({
                     uid: currentUser.uid,
                     displayName: data.displayName || currentUser.displayName || displayName,
                     photoURL: data.photoURL || currentUser.photoURL || photoURL,
                     isAnonymous: currentUser.isAnonymous,
                     xp: data.xp || 0,
                     level: data.level || 0,
                   });
                }
             }
           });
        });

        // Initialize or Update user record
        get(userRef).then((snapshot) => {
          if (!rateLimit('user-update', 3000)) return;
          const userData = snapshot.exists() ? snapshot.val() : null;
          
          if (!userData) {
            // New user initialization
            update(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || displayName,
              photoURL: currentUser.photoURL || photoURL,
              isOnline: true,
              lastSeen: serverTimestamp(),
              xp: 0,
              level: 0
            });
          } else {
            // Existing user update
            const updates: any = {
              isOnline: true,
              lastSeen: serverTimestamp()
            };
            // Only update displayName/photoURL if they are set in auth but not in DB or if we want to sync
            if (currentUser.displayName && !userData.displayName) {
               updates.displayName = currentUser.displayName;
            }
            if (currentUser.photoURL && !userData.photoURL) {
               updates.photoURL = currentUser.photoURL;
            }
            update(userRef, updates);
          }
        });
        
        onDisconnect(userRef).update({ 
          isOnline: false, 
          lastSeen: serverTimestamp() 
        });

      } else {
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Auth state error:", error);
      if (isMounted) setLoading(false);
    });

    const fallbackTimer = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [setUser]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0B0E14] text-indigo-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-widest uppercase animate-pulse">Initializing System...</h2>
      </div>
    );
  }

  return (
    <AgoraRTCProvider client={client as any}>
      <BrowserRouter>
        {user ? <MainLayout /> : <Login />}
      </BrowserRouter>
    </AgoraRTCProvider>
  );
}
