'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { UserProfile } from '@/types';
import { getSession, refreshSession } from '@/lib/auth/session';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'business' | 'customer') => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyResetCode: (code: string, newPassword: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (profile) {
        setProfile(profile);
        setIsEmailVerified(profile.email_verified);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [supabase]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user, profile } = await getSession();
        setUser(user);
        if (user && profile) {
          setProfile(profile);
          setIsEmailVerified(profile.email_verified || false);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [loadUserProfile]);

  const persistSession = (session: any) => {
    if (session) {
      localStorage.setItem('auth_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('auth_session');
    }
  };

  const refreshUserSession = useCallback(async () => {
    try {
      const newSession = await refreshSession();
      if (newSession) {
        setUser(newSession.user);
        await loadUserProfile(newSession.user!.id);
        persistSession(newSession);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, [loadUserProfile]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshUserSession();
    }, 15 * 60 * 1000); // Refresh every 15 minutes

    return () => clearInterval(interval);
  }, [refreshUserSession]);

  useEffect(() => {
    const storedSession = localStorage.getItem('auth_session');
    if (storedSession) {
      const session = JSON.parse(storedSession);
      setUser(session.user);
      loadUserProfile(session.user.id);
    }
  }, [loadUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        await loadUserProfile(data.user.id);
        persistSession(data.session);
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message);
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
        toast.success('Please check your email to verify your account');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      persistSession(null);
      router.push('/');
    } catch (error: any) {
      toast.error(error.message);
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
        toast.error(error.message);
      }
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const verifyResetCode = async (code: string, newPassword: string) => {
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('verification_code')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('No profile found');

      if (data.verification_code !== code) {
        throw new Error('Invalid verification code');
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setIsEmailVerified(true);
      toast.success('Email verified successfully');

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
        toast.error(error.message);
      }
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user || !profile) throw new Error('No user found');

      // Generate new verification code
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Update profile with new code
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ verification_code: verificationCode })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Send new verification email
      await supabase.functions.invoke('send-email', {
        body: {
          to: profile.email,
          templateName: 'verification',
          data: {
            code: verificationCode,
          },
        },
      });

      toast.success('Verification email sent. Please check your inbox.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
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
      await loadUserProfile(user.id);
      toast.success('Profile updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const value = {
    user,
    profile,
    loading,
    isEmailVerified,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    verifyResetCode,
    verifyEmail,
    resendVerificationEmail,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
