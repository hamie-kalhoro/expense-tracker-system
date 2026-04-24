import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../supabase/config';
import { sendWelcomeEmail } from '../services/emailService';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<any>;
  updateProfile: (updates: { displayName?: string, photoURL?: string, bio?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  isMockMode: boolean; // Retained so UI code logic rarely changes, but effectively unused
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // We are fully dropping mockMode because Supabase is our single source of truth now.
  const isMockMode = false;

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setUserProfile({
          uid: data.id,
          email: data.email,
          displayName: data.display_name,
          username: data.username,
          photoURL: data.photo_url || undefined,
          bio: data.bio || undefined,
          createdAt: data.created_at,
        });

        // Welcome email logic
        const createdMs = new Date(data.created_at).getTime();
        const nowMs = Date.now();
        if (nowMs - createdMs < 30000) {
          const sentKey = `welcome_sent_${data.id}`;
          if (!localStorage.getItem(sentKey)) {
            sendWelcomeEmail(data.email, data.username, window.location.origin);
            localStorage.setItem(sentKey, 'true');
          }
        }
        setLoading(false);
      } else if (retryCount < 3) {
        // Trigger might be delayed, retry in 1s
        console.log(`Profile not found, retrying... (${retryCount + 1})`);
        setTimeout(() => fetchProfile(userId, retryCount + 1), 1500);
      } else {
        console.warn("Profile fetch exhausted retries.");
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (retryCount >= 3) setLoading(false);
      else setTimeout(() => fetchProfile(userId, retryCount + 1), 1500);
    }
  };

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AUTH EVENT:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          fetchProfile(session.user.id);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Real-time listener for profile updates (handles trigger finishing)
  useEffect(() => {
    if (!user) return;

    const profileChannel = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        (payload) => {
          console.log('REALTIME PROFILE UPDATE:', payload);
          if (payload.new) {
            const data = payload.new as any;
            setUserProfile({
              uid: data.id,
              email: data.email,
              displayName: data.display_name,
              username: data.username,
              photoURL: data.photo_url || undefined,
              bio: data.bio || undefined,
              createdAt: data.created_at,
            });
            setLoading(false); // Stop loading if this was the first time we got the profile
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user]);

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username.toLowerCase());
      
      if (error) {
        console.error('Error checking username:', error);
        return false;
      }
      return data.length === 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const generateUniqueUsername = async (baseName: string): Promise<string> => {
    let base = baseName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    if (base.length < 3) base = base + '_user';
    let username = base;
    let isAvailable = await checkUsernameAvailability(username);
    let attempts = 0;
    while (!isAvailable && attempts < 10) {
      username = `${base}${Math.floor(Math.random() * 10000)}`;
      isAvailable = await checkUsernameAvailability(username);
      attempts++;
    }
    return username;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
    // The redirect happens automatically.
    // However, when they return from OAuth, the onAuthStateChange is triggered.
    // If we want to intercept NEW user creation for OAuth to set custom fields 
    // and send welcome email, we'll need to do it after checking the db on mount
    // Let's implement an edge case handler inside fetchProfile.
  };

  // Removed separate onAuthStateChange listener since fetchProfile now handles it reliably

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    // 1. Sign up user and pass metadata for the trigger to use
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase(),
          display_name: username.toLowerCase(),
        }
      }
    });
    
    if (signUpError) throw signUpError;
    if (!signUpData.user) throw new Error("No user returned");

    // Profile will be created automatically by the database trigger `handle_new_user`!
    
    // 2. Send premium welcome email immediately
    sendWelcomeEmail(email, username.toLowerCase(), window.location.origin);
    const sentKey = `welcome_sent_${signUpData.user.id}`;
    localStorage.setItem(sentKey, 'true'); // Prevent OAuth logic from sending it twice

    // 3. Force fetch profile to update state if auto-login is permitted
    if (signUpData.session) {
      await fetchProfile(signUpData.user.id);
    }
    
    return signUpData;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  const updateProfile = async (updates: { displayName?: string, photoURL?: string, bio?: string }) => {
    if (!user) throw new Error("No authenticated user");
    
    const dbUpdates: any = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.photoURL !== undefined) dbUpdates.photo_url = updates.photoURL;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;

    const { error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, updateProfile, signOut, isMockMode, checkUsernameAvailability }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
