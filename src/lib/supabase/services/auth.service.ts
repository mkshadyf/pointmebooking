import { supabase } from '../client';
import { AuthProfile } from '../types/database';

interface AuthCredentials {
    email: string;
    password: string;
    role?: 'customer' | 'business';
}

export class AuthService {
    static async login({ email, password }: AuthCredentials) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    }

    static async register({ email, password, role }: AuthCredentials) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    role: role || 'customer',
                    email,
                });

            if (profileError) throw profileError;
        }

        return authData;
    }

    static async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    static async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    }

    static async getProfile(): Promise<AuthProfile | null> {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error) throw error;
        return data ? { ...data, email: session.user.email } : null;
    }

    static async updateProfile(data: Partial<AuthProfile>): Promise<AuthProfile> {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) throw new Error('No authenticated user');

        const { data: profile, error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', session.user.id)
            .select()
            .single();

        if (error) throw error;
        return { ...profile, email: session.user.email };
    }

  static async verifyEmail(code: string) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No user found');

    const { data, error } = await supabase
      .from('profiles')
      .select('verification_code, verification_attempts, last_verification_attempt')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    // Check verification code
    if (data.verification_code !== code) {
      // Increment attempts
      await supabase
        .from('profiles')
        .update({
          verification_attempts: (data.verification_attempts || 0) + 1,
          last_verification_attempt: new Date().toISOString(),
        })
        .eq('id', user.id);
      throw new Error('Invalid verification code');
    }

    // Mark email as verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        email_verified: true,
        verification_code: null,
        verification_attempts: 0,
        last_verification_attempt: null,
      })
      .eq('id', user.id);

    if (updateError) throw updateError;
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  static async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }
} 