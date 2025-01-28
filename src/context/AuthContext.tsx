'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';
import type { AuthError } from '@supabase/supabase-js';
import type { Database } from '@/types';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get authenticated user using getUser()
        const { data: { user: authenticatedUser }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }

        setUser(authenticatedUser);

        if (authenticatedUser) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authenticatedUser.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          if (profile) {
            setProfile(profile as UserProfile);
            setIsEmailVerified(profile.email_verified);
          }
        }
      } catch (error) {
        console.error('Error loading auth:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Verify user with getUser()
        const { data: { user: verifiedUser } } = await supabase.auth.getUser();
        setUser(verifiedUser);

        if (verifiedUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', verifiedUser.id)
            .single();
          
          if (profile) {
            setProfile(profile as UserProfile);
            setIsEmailVerified(profile.email_verified);
          }
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
  }, [supabase, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: 'business' | 'customer') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });
      if (error) throw error;
      if (data.user) {
        router.push('/verify-email');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/v1/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  };

  const verifyResetCode = async (code: string, newPassword: string) => {
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      if (!user) throw new Error('No user found');

      // First verify the code
      const { data: profiles, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .eq('verification_code', code)
        .single();

      if (verifyError || !profiles) {
        throw new Error('Invalid verification code');
      }

      // Update profile to mark email as verified
      const { data: profile, error: updateError } = await supabase
        .from('profiles')
        .update({
          email_verified: true,
          verification_code: undefined
        })
        .eq('id', user.id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      setIsEmailVerified(true);
      setProfile(profile as UserProfile);

      // Redirect based on role and onboarding status
      if (profile?.role === 'business') {
        if (profile.onboarding_completed) {
          router.push('/dashboard/business');
        } else {
          router.push('/onboarding/business');
        }
      } else {
        router.push('/dashboard/customer');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user) throw new Error('No user found');

      // Generate new verification code
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Update profile with new verification code
      const { data: profile, error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_code: verificationCode,
          email_verified: false
        } as Database['public']['Tables']['profiles']['Update'])
        .eq('id', user.id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      setProfile(profile as UserProfile);
      setIsEmailVerified(false);

      // Here you would normally send the email with the verification code
      console.log('New verification code:', verificationCode);

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      // Reload profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profile as UserProfile);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isEmailVerified, signOut, signIn, signUp, signInWithGoogle, resetPassword, verifyResetCode, verifyEmail, resendVerificationEmail, updateProfile }}>
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
