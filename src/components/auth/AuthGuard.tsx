import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useStore } from '../../store/useStore';
import { Navigate } from 'react-router-dom';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, isAuthLoading, setAuthLoading } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Ensure user profile exists in Firestore
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              name: user.displayName || 'Anonymous',
              email: user.email,
              avatar_url: user.photoURL,
              currency_pref: 'INR',
              created_at: serverTimestamp(),
            });
          }
        }
      } catch (error) {
        console.error('AuthGuard Firestore Error:', error);
      } finally {
        setUser(user);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [setUser, setAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
