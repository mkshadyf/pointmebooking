'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { UserProfile } from '@/types';

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
  const supabase = createClientComponentClient();

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        setUser(session.user);
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error loading profile:', error);
            return;
          }

          if (profile) {
            console.log('Profile loaded:', profile);
            setProfile(profile);
            setIsEmailVerified(profile.email_verified);

            // Only redirect if we're not already on these pages
            const currentPath = window.location.pathname;
            const authPages = ['/verify-email', '/login', '/register'];
            
            if (profile.role === 'business') {
              if (!profile.onboarding_completed && !currentPath.includes('/onboarding')) {
                router.push('/onboarding/business');
              } else if (profile.onboarding_completed && !currentPath.startsWith('/dashboard')) {
                router.push('/dashboard/business');
              }
            } else if (profile.role === 'customer') {
              if (!authPages.includes(currentPath) && !currentPath.startsWith('/dashboard')) {
                router.push('/dashboard/customer');
              }
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Load user profile after sign in
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await loadUserProfile(user.id);
        
        // Check if email is verified
        if (!isEmailVerified) {
          router.push('/verify-email');
          return;
        }

        // Redirect based on role
        if (profile?.role === 'business') {
          if (profile.onboarding_completed) {
            router.push('/dashboard/business');
          } else {
            router.push('/onboarding/business');
          }
        } else {
          router.push('/dashboard/customer');
        }
      }
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

  const signUp = async (email: string, password: string, role: 'business' | 'customer') => {
    try {
      // Generate a verification code
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // First create the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/v1/callback`,
          data: {
            role,
            verification_code: verificationCode,
          },
        },
      });

      if (error) throw error;
      if (!data?.user) throw new Error('No user returned from sign up');

      // Create profile
      const newProfile: UserProfile = {
        id: data.user.id,
        email: email,
        role,
        full_name: '',
        email_verified: false,
        verification_code: verificationCode,
        business_name: role === 'business' ? `${email.split('@')[0]}'s Business` : undefined,
        business_type: role === 'business' ? 'Service Provider' : undefined,
        business_category: role === 'business' ? 'Other' : undefined,
        description: role === 'business' ? 'Business description' : undefined,
        location: '',
        contact_number: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        contact_email: email,
        website: '',
        working_hours: role === 'business' ? {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '00:00', end: '00:00' },
          sunday: { start: '09:00', end: '17:00' }
        } : undefined,
        services: [],
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }

      // Send verification email
      try {
        const response = await fetch('/api/send-verification-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code: verificationCode,
          }),
        });

        if (!response.ok) {
          console.error('Failed to send verification email');
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }

      // Set local state
      setProfile(newProfile);
      setIsEmailVerified(false);

      // Redirect to verification page
      router.push('/verify-email');
    } catch (error) {
      console.error('Signup error:', error);
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
