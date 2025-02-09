'use client';

import { ROUTES } from '@/config/routes';
import { supabase } from '@/lib/supabase/client';
import { UserProfile } from '@/types';
import { Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
    isEmailVerified: false,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        if (!session) return setState(s => ({ ...s, loading: false }));

        const { user } = session;
        const profile = await fetchProfile(user.id);
        
        setState({
          user,
          profile,
          session,
          loading: false,
          error: null,
          isEmailVerified: !!user.email_confirmed_at,
        });

      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(s => ({
          ...s,
          loading: false,
          error: 'Failed to initialize authentication'
        }));
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
            isEmailVerified: false,
          });
          router.push(ROUTES.login.path);
        }
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState(s => ({
            ...s,
            user: session.user,
            profile,
            session,
            loading: false,
            isEmailVerified: !!session.user.email_confirmed_at,
          }));
        }
      }
    );

    initializeAuth();
    return () => subscription.unsubscribe();
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Profile fetch error:', error);
      setState(s => ({ ...s, error: 'Failed to load profile' }));
      return null;
    }
  };

  const signIn = async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.session) throw new Error('No session returned');

      const profile = await fetchProfile(data.user.id);
      
      setState({
        user: data.user,
        profile,
        session: data.session,
        loading: false,
        error: null,
        isEmailVerified: !!data.user.email_confirmed_at,
      });

    } catch (error) {
      console.error('Sign in error:', error);
      setState(s => ({
        ...s,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      await supabase.auth.signOut();
      router.push(ROUTES.login.path);
    } catch (error) {
      console.error('Sign out error:', error);
      setState(s => ({
        ...s,
        loading: false,
        error: 'Failed to sign out'
      }));
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!state.user) throw new Error('No authenticated user');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', state.user.id);

      if (error) throw error;
      const updatedProfile = await fetchProfile(state.user.id);
      setState(s => ({ ...s, profile: updatedProfile }));

    } catch (error) {
      console.error('Profile update error:', error);
      setState(s => ({
        ...s,
        error: 'Failed to update profile'
      }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

