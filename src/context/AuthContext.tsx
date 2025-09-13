import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../services/supabase';
import type { User, Session } from '@supabase/supabase-js';

type AuthUser = {
  id: string;
  email: string | null;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<{ error: any }>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  loginWithGoogle: () => Promise<{ error: any }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const AUTH_USER_KEY = 'authUser';

  const readCachedUser = (): AuthUser | null => {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) {
        return {
          id: parsed.id,
          email: parsed.email ?? null,
          user_metadata: parsed.user_metadata || {},
        } as AuthUser;
      }
      return null;
    } catch {
      return null;
    }
  };

  const cached = readCachedUser();
  const [user, setUser] = useState<AuthUser | null>(cached);
  const [loading, setLoading] = useState<boolean>(!cached);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata || {},
        };
        setUser(authUser);
        try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser)); } catch {}
        
        // Ensure user exists in database (non-blocking to prevent auth flow issues)
        userService.ensureUserExists({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url
        }).then(() => {
          console.log('✅ User ensured in database');
        }).catch(error => {
          console.error('❌ Error ensuring user exists in database:', error);
          console.log('⚠️ User creation failed, but auth flow continues. User will be created when needed.');
        });
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata || {},
        };
        setUser(authUser);
        try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser)); } catch {}
        
        // Ensure user exists in database (non-blocking to prevent auth flow issues)
        userService.ensureUserExists({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url
        }).then(() => {
          console.log('✅ User ensured in database');
        }).catch(error => {
          console.error('❌ Error ensuring user exists in database:', error);
          console.log('⚠️ User creation failed, but auth flow continues. User will be created when needed.');
        });
      } else {
        setUser(null);
        try { localStorage.removeItem(AUTH_USER_KEY); } catch {}
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(() => ({ 
    user, 
    loading, 
    signup, 
    login, 
    loginWithGoogle, 
    logout 
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};