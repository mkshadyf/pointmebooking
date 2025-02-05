'use client';

import { ROUTES } from '@/config/routes';
import { useSupabase } from '@/lib/supabase/hooks';
import { UserProfile } from '@/types';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useReducer } from 'react';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isEmailVerified: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EMAIL_VERIFIED'; payload: boolean }
  | { type: 'RESET_STATE' };

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  loading: true,
  error: null,
  isEmailVerified: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_SESSION':
      return { ...state, session: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_EMAIL_VERIFIED':
      return { ...state, isEmailVerified: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  signOut: async () => {},
  updateProfile: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const supabase = useSupabase();

  const checkEmailVerification = (user: User | null) => {
    if (!user) return false;
    return !!user.email_confirmed_at || 
           (user.user_metadata && user.user_metadata.email_verified);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial user
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (mounted) {
          if (error) throw error;
          
          if (user) {
            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'SET_EMAIL_VERIFIED', payload: checkEmailVerification(user) });
            await fetchProfile(user.id);
          }
        }

        // Set up auth state listener
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session: Session | null) => {
            if (!mounted) return;

            if (session?.user) {
              dispatch({ type: 'SET_USER', payload: session.user });
              dispatch({ 
                type: 'SET_EMAIL_VERIFIED', 
                payload: checkEmailVerification(session.user)
              });
              await fetchProfile(session.user.id);
            } else {
              dispatch({ type: 'SET_USER', payload: null });
              dispatch({ type: 'SET_PROFILE', payload: null });
              dispatch({ type: 'SET_EMAIL_VERIFIED', payload: false });
            }

            // Handle specific auth events
            switch (event) {
              case 'SIGNED_OUT':
                dispatch({ type: 'RESET_STATE' });
                router.push(ROUTES.login.path);
                break;
              case 'USER_UPDATED':
                if (session?.user) {
                  await fetchProfile(session.user.id);
                }
                break;
            }
          }
        );

        // Set up user refresh
        const refreshInterval = setInterval(async () => {
          if (state.user) {
            const { data: { user: refreshedUser }, error: refreshError } = await supabase.auth.getUser();
            if (mounted && refreshedUser && !refreshError) {
              dispatch({ type: 'SET_USER', payload: refreshedUser });
              dispatch({ type: 'SET_EMAIL_VERIFIED', payload: checkEmailVerification(refreshedUser) });
            }
          }
        }, 5 * 60 * 1000); // Every 5 minutes

        dispatch({ type: 'SET_LOADING', payload: false });

        return () => {
          mounted = false;
          subscription.unsubscribe();
          clearInterval(refreshInterval);
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    initializeAuth();
  }, [supabase, router]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      dispatch({ type: 'SET_PROFILE', payload: data });
    } catch (error) {
      console.error('Error fetching profile:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch user profile' });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'RESET_STATE' });
      router.push(ROUTES.login.path);
    } catch (error) {
      console.error('Error signing out:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign out' });
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!state.user) throw new Error('No user logged in');

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', state.user.id);

      if (updateError) throw updateError;

      await fetchProfile(state.user.id);
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };

