import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { userService } from '../services/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

type AuthUser = {
  id: string;
  email: string | null;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    phone_number?: string;
    name?: string;
    [key: string]: unknown; // Allow additional metadata fields
  };
};

type AuthResponse = {
  error: AuthError | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: () => Promise<AuthResponse>;
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
      if (parsed && parsed.id && typeof parsed.id === 'string') {
        return {
          id: parsed.id,
          email: parsed.email ?? null,
          user_metadata: parsed.user_metadata || {},
        } as AuthUser;
      }
      return null;
    } catch (error) {
      console.warn('Error reading cached user:', error);
      return null;
    }
  };

  const cached = readCachedUser();
  const [user, setUser] = useState<AuthUser | null>(cached);
  const [loading, setLoading] = useState<boolean>(!cached);

  const cacheUser = (authUser: AuthUser): void => {
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    } catch (error) {
      console.warn('Error caching user:', error);
    }
  };

  const clearCachedUser = (): void => {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
      console.warn('Error clearing cached user:', error);
    }
  };

  const ensureUserInDatabase = async (supabaseUser: User): Promise<void> => {
    try {
      await userService.ensureUserExists({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
        avatar_url: supabaseUser.user_metadata?.avatar_url || null
      });
      console.log('✅ User ensured in database');
    } catch (error) {
      console.error('❌ Error ensuring user exists in database:', error);
      console.log('⚠️ User creation failed, but auth flow continues. User will be created when needed.');
    }
  };

  const createAuthUser = (supabaseUser: User): AuthUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || null,
      user_metadata: {
        full_name: supabaseUser.user_metadata?.full_name,
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        phone: supabaseUser.user_metadata?.phone,
        phone_number: supabaseUser.user_metadata?.phone_number,
        name: supabaseUser.user_metadata?.name,
        ...supabaseUser.user_metadata
      },
    };
  };

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    const getInitialSession = async (): Promise<void> => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const authUser = createAuthUser(session.user);
          setUser(authUser);
          cacheUser(authUser);
          
          // Ensure user exists in database (non-blocking)
          ensureUserInDatabase(session.user).catch(console.error);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session?.user?.email);
      
      if (!isMounted) return;

      try {
        if (session?.user) {
          const authUser = createAuthUser(session.user);
          setUser(authUser);
          cacheUser(authUser);
          
          // Ensure user exists in database (non-blocking)
          ensureUserInDatabase(session.user).catch(console.error);
        } else {
          setUser(null);
          clearCachedUser();
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error as AuthError };
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error as AuthError };
    }
  };

  const loginWithGoogle = async (): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      return { error };
    } catch (error) {
      console.error('Google login error:', error);
      return { error: error as AuthError };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
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
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};