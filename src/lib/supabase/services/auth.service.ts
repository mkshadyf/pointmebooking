import { supabase } from '../client';
import type { AuthProfile } from '../types';

export class AuthService {
  static async login(credentials: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  }

  static async register(data: { email: string; password: string; role: 'customer' | 'business' }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { role: data.role },
      },
    });
    if (authError) throw authError;

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: data.email,
        role: data.role,
      });
      if (profileError) throw profileError;
    }

    return authData;
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

  static async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getProfile(): Promise<AuthProfile | null> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as AuthProfile;
  }

  static async updateProfile(updates: Partial<AuthProfile>) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data as AuthProfile;
  }
} 