import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  friends: string[]; // Array of friend UIDs
  pendingRequests: string[]; // UIDs of pending friend requests
  sentRequests: string[]; // UIDs of sent friend requests
  createdAt: unknown;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for UI development when Firebase is not configured
const MOCK_USER = {
  uid: 'mock-user-123',
  displayName: 'Alex Demo',
  email: 'alex@demo.com',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
} as User;

const MOCK_PROFILE: UserProfile = {
  uid: 'mock-user-123',
  email: 'alex@demo.com',
  displayName: 'Alex Demo',
  photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  friends: ['mock-friend-1', 'mock-friend-2'],
  pendingRequests: [],
  sentRequests: [],
  createdAt: new Date(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode] = useState(!auth);

  useEffect(() => {
    if (!auth) {
      // Mock mode
      setTimeout(() => {
        const mockLogged = localStorage.getItem('mockLogged');
        if (mockLogged) {
          setUser(MOCK_USER);
          setUserProfile(MOCK_PROFILE);
        }
        setLoading(false);
      }, 500);
      return;
    }

    let profileUnsubscribe: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (profileUnsubscribe) {
        profileUnsubscribe();
      }

      if (user && db) {
        profileUnsubscribe = onSnapshot(
          doc(db, 'users', user.uid),
          (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            }
          },
          (error) => {
            console.error('Error fetching user profile snapshot:', error);
          }
        );
        setLoading(false);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, [isMockMode]);

  const signInWithGoogle = async () => {
    if (isMockMode) {
      localStorage.setItem('mockLogged', 'true');
      setUser(MOCK_USER);
      setUserProfile(MOCK_PROFILE);
      return;
    }
    if (!auth || !db) return;
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create user profile in Firestore if it doesn't exist
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Unknown User',
        photoURL: user.photoURL || undefined,
        friends: [],
        pendingRequests: [],
        sentRequests: [],
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
    } else {
      setUserProfile(userDoc.data() as UserProfile);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (isMockMode) {
      localStorage.setItem('mockLogged', 'true');
      setUser(MOCK_USER);
      setUserProfile(MOCK_PROFILE);
      return;
    }
    if (!auth || !db) return;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (isMockMode) {
      localStorage.setItem('mockLogged', 'true');
      setUser(MOCK_USER);
      setUserProfile(MOCK_PROFILE);
      return;
    }
    if (!auth || !db) return;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });

    // Create user profile in Firestore
    const newProfile: UserProfile = {
      uid: userCredential.user.uid,
      email,
      displayName,
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
    setUserProfile(newProfile);
  };

  const signOut = async () => {
    if (isMockMode) {
      localStorage.removeItem('mockLogged');
      setUser(null);
      setUserProfile(null);
      return;
    }
    if (!auth) return;
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, isMockMode }}
    >
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
