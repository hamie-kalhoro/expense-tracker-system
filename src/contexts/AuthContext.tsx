import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for UI development when Firebase is not configured
const MOCK_USER = {
  uid: 'mock-user-123',
  displayName: 'Alex Demo',
  email: 'alex@demo.com',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
} as User;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode] = useState(!auth);

  useEffect(() => {
    if (!auth) {
      // Mock mode
      setTimeout(() => {
        const mockLogged = localStorage.getItem('mockLogged');
        if (mockLogged) setUser(MOCK_USER);
        setLoading(false);
      }, 500);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (isMockMode) {
      localStorage.setItem('mockLogged', 'true');
      setUser(MOCK_USER);
      return;
    }
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    if (isMockMode) {
      localStorage.removeItem('mockLogged');
      setUser(null);
      return;
    }
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, isMockMode }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
