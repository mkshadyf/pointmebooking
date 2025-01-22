'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { UserProfile } from '@/types';

interface AuthContextType {
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, role: 'business' | 'customer') => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyResetCode: (code: string, newPassword: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (profile) {
        // Ensure all required fields from UserProfile type are present
        const userProfile: UserProfile = {
          id: profile.id,
          full_name: profile.full_name || '',
          email: profile.email || user?.email || '',
          role: profile.role || 'customer',
          business_name: profile.business_name,
          business_type: profile.business_type,
          business_category: profile.business_category,
          description: profile.description,
          location: profile.location,
          contact_number: profile.contact_number,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          postal_code: profile.postal_code,
          contact_email: profile.contact_email,
          website: profile.website,
          working_hours: profile.working_hours,
          services: profile.services,
          onboarding_completed: profile.onboarding_completed,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
        setProfile(userProfile);
        setIsEmailVerified(profile.email_verified);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile');
    }
  }, [supabase, user?.email]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsEmailVerified(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, loadUserProfile]);

  const signIn = async (email: string, password: string, ) => {
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (!session?.user) throw new Error('No user returned from sign in');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile?.email_verified) {
        toast.error('Please verify your email address');
        router.push('/verify-email');
        return;
      }

      toast.success('Welcome back!');
      router.push(profile?.role === 'business' ? '/dashboard/business' : '/dashboard/customer');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, role: 'business' | 'customer') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Create profile
        await supabase.from('profiles').insert({
          id: data.user.id,
          role,
          email_verified: false,
        });

        toast.success('Verification email sent. Please check your inbox.');
        router.push('/verify-email');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: 'email',
      });

      if (error) throw error;

      if (user) {
        await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', user.id);

        setIsEmailVerified(true);
      }

      toast.success('Email verified successfully!');
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user?.email) throw new Error('No email address found');

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;
      toast.success('Verification email sent!');
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
      // First verify the code
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: 'recovery',
      });

      if (verifyError) throw verifyError;

      // Then update the password
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

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        resetPassword,
        verifyResetCode,
        verifyEmail,
        resendVerificationEmail,
        updateProfile,
        user,
        profile,
        loading,
        isEmailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
