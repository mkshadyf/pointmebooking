'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { UserProfile } from '@/types';
import { getSession, refreshSession, clearSessionCache } from '@/lib/auth/session';

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
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const router = useRouter();
  const pathname = usePathname();
  
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
      toast.error('Failed to load user profile');
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
        toast.error('Failed to initialize session');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsEmailVerified(false);
          if (!pathname.startsWith('/auth')) {
            router.push('/login');
          }
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user || null);
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [loadUserProfile, supabase, router, pathname]);

  const refreshUserSession = useCallback(async () => {
    try {
      const newSession = await refreshSession();
      if (newSession.user) {
        setUser(newSession.user);
        setProfile(newSession.profile);
        // Schedule next refresh for 5 minutes before token expiry
        const session = await supabase.auth.getSession();
        const expiresAt = session.data.session?.expires_at || 0;
        const expiresIn = expiresAt * 1000 - Date.now() - 5 * 60 * 1000;
        if (expiresIn > 0) {
          refreshTimeoutRef.current = setTimeout(refreshUserSession, expiresIn);
        }
      } else {
        // Handle session expiry
        await signOut();
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      toast.error('Session refresh failed');
    }
  }, []);

  useEffect(() => {
    // Initial refresh schedule
    const scheduleRefresh = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.expires_at) {
        const expiresIn = session.expires_at * 1000 - Date.now() - 5 * 60 * 1000;
        if (expiresIn > 0) {
          refreshTimeoutRef.current = setTimeout(refreshUserSession, expiresIn);
        }
      }
    };

    if (user) {
      scheduleRefresh();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user, refreshUserSession]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push('/dashboard');
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
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
        router.push('/verify-email');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to sign up');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearSessionCache(user?.id || '');
      setUser(null);
      setProfile(null);
      setIsEmailVerified(false);
      router.push('/login');
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
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
