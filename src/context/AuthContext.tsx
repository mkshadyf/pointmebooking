'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';
import type { AuthError } from '@supabase/supabase-js';
import type { Database } from '@/types';

const TIMEOUT_DURATION = 10000; // 10 seconds timeout

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isEmailVerified: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'business' | 'customer') => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyResetCode: (code: string, newPassword: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isEmailVerified: false,
  signOut: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  resetPassword: async () => {},
  verifyResetCode: async () => {},
  verifyEmail: async () => {},
  resendVerificationEmail: async () => {},
  updateProfile: async () => {},
});

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: NodeJS.Timeout | undefined;
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('Request timed out'));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const promise = Promise.resolve(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
      ).then(({ data, error }) => {
        if (error) throw error;
        return { data, error };
      });

      const { data: profile, error } = await withTimeout(promise, TIMEOUT_DURATION);

      if (error) throw error;
      if (profile) {
        setProfile(profile as UserProfile);
        setIsEmailVerified(profile.email_verified);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setIsEmailVerified(false);
    }
  }, [supabase]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const promise = Promise.resolve(
          supabase.auth.getUser()
        ).then(({ data, error }) => {
          if (error) throw error;
          return { data, error };
        });

        const { data: { user: authenticatedUser }, error: userError } = await withTimeout(promise, TIMEOUT_DURATION);

        if (userError) throw userError;

        setUser(authenticatedUser);
        if (authenticatedUser) {
          await fetchProfile(authenticatedUser.id);
        }
      } catch (error) {
        console.error('Error loading auth:', error);
        setUser(null);
        setProfile(null);
        setIsEmailVerified(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        try {
          const promise = Promise.resolve(
            supabase.auth.getUser()
          ).then(({ data, error }) => {
            if (error) throw error;
            return { data, error };
          });

          const { data: { user: verifiedUser } } = await withTimeout(promise, TIMEOUT_DURATION);

          setUser(verifiedUser);
          if (verifiedUser) {
            await fetchProfile(verifiedUser.id);
          }
        } catch (error) {
          console.error('Error during auth state change:', error);
          setUser(null);
          setProfile(null);
          setIsEmailVerified(false);
        }
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsEmailVerified(false);
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, fetchProfile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const promise = Promise.resolve(
        supabase.auth.signInWithPassword({
          email,
          password,
        })
      ).then(({ data, error }) => {
        if (error) throw error;
        return { data, error };
      });

      const { data, error } = await withTimeout(promise, TIMEOUT_DURATION);

      if (error) throw error;
      if (data.user) {
        await fetchProfile(data.user.id);
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, role: 'business' | 'customer') => {
    setLoading(true);
    try {
      const promise = Promise.resolve(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role },
          },
        })
      ).then(({ data, error }) => {
        if (error) throw error;
        return { data, error };
      });

      const { data, error } = await withTimeout(promise, TIMEOUT_DURATION);

      if (error) throw error;
      if (data.user) {
        router.push('/verify-email');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const promise = Promise.resolve(
        supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/v1/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        })
      ).then(({ error }) => {
        if (error) throw error;
        return { error };
      });

      const { error } = await withTimeout(promise, TIMEOUT_DURATION);

      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const promise = Promise.resolve(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
      ).then(({ error }) => {
        if (error) throw error;
        return { error };
      });

      const { error } = await withTimeout(promise, TIMEOUT_DURATION);

      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyResetCode = async (code: string, newPassword: string) => {
    setLoading(true);
    try {
      const promise = Promise.resolve(
        supabase.auth.updateUser({
          password: newPassword,
        })
      ).then(({ error }) => {
        if (error) throw error;
        return { error };
      });

      const { error: updateError } = await withTimeout(promise, TIMEOUT_DURATION);

      if (updateError) throw updateError;
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (code: string) => {
    setLoading(true);
    try {
      if (!user) throw new Error('No user found');

      const verifyPromise = Promise.resolve(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .eq('verification_code', code)
          .single()
      ).then(({ data, error }) => {
        if (error) throw error;
        return { data, error };
      });

      const { data: profiles, error: verifyError } = await withTimeout(verifyPromise, TIMEOUT_DURATION);

      if (verifyError || !profiles) {
        throw new Error('Invalid verification code');
      }

      const updatePromise = Promise.resolve(
        supabase
          .from('profiles')
          .update({
            email_verified: true,
            verification_code: undefined
          })
          .eq('id', user.id)
          .select('*')
          .single()
      ).then(({ data, error }) => {
        if (error) throw error;
        return { data, error };
      });

      const { data: profile, error: updateError } = await withTimeout(updatePromise, TIMEOUT_DURATION);

      if (updateError) throw updateError;

      setProfile(profile as UserProfile);
      setIsEmailVerified(true);
      router.push('/dashboard');

    } catch (error) {
      console.error('Error verifying email:', error);
      if (error instanceof Error) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setLoading(true);
    try {
      if (!user) throw new Error('No user found');

      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const promise = Promise.resolve(
        supabase
          .from('profiles')
          .update({
            verification_code: verificationCode,
            email_verified: false
          } as Database['public']['Tables']['profiles']['Update'])
          .eq('id', user.id)
          .select('*')
          .single()
      ).then(({ data, error }) => {
        if (error) throw error;
        return { data, error };
      });

      const { data: profile, error: updateError } = await withTimeout(promise, TIMEOUT_DURATION);

      if (updateError) throw updateError;

      setProfile(profile as UserProfile);
      setIsEmailVerified(false);

      console.log('New verification code:', verificationCode);

    } catch (error) {
      console.error('Error resending verification:', error);
      if (error instanceof Error) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    setLoading(true);
    try {
      if (!user) throw new Error('No user found');

      const promise = Promise.resolve(
        supabase
          .from('profiles')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', user.id)
      ).then(({ error }) => {
        if (error) throw error;
        return { error };
      });

      const { error } = await withTimeout(promise, TIMEOUT_DURATION);

      if (error) throw error;

      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof Error) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isEmailVerified,
        signOut,
        signIn,
        signUp,
        signInWithGoogle,
        resetPassword,
        verifyResetCode,
        verifyEmail,
        resendVerificationEmail,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
