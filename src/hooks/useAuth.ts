import { supabase } from '@/lib/supabase/client';
import { AuthService } from '@/lib/supabase/services/auth.service';
import { AuthError, AuthRole } from '@/types/database/auth';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Common error handling function to reduce duplication
  const handleError = (err: unknown): AuthError => {
    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        code: 'unknown',
        status: 500
      };
    } else {
      return {
        name: 'UnknownError',
        message: 'An unknown error occurred',
        code: 'unknown',
        status: 500
      };
    }
  };

  useEffect(() => {
    async function getUser() {
      setLoading(true);
      try {
        const userResponse = await AuthService.getUser();
        setUser(userResponse.data);
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const sessionData = await AuthService.login({ email, password });
      if (sessionData.data?.supabaseUser) {
        setUser(sessionData.data.supabaseUser);
      }
      if (sessionData.error) {
        setError(sessionData.error);
      }
    } catch (err: unknown) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await AuthService.register(email, password, 'customer' as AuthRole);
      if (result.data?.supabaseUser) {
        setUser(result.data.supabaseUser);
      }
      if (result.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const result = await AuthService.logout();
      setUser(null);
      if (result.error) {
        setError(result.error);
      }
    } catch (err: unknown) {
      setError(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login, register, logout };
} 