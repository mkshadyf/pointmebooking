import type { Profile } from '@/types/auth';
import { AuthCredentials } from '@/types/auth/index';
import { supabase } from '../client';

const MAX_VERIFICATION_ATTEMPTS = 5;
const VERIFICATION_TIMEOUT_MINUTES = 30;

interface AuthError extends Error {
    code?: string;
}

export class AuthService {
    static async login({ email, password }: AuthCredentials) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            const authError = new Error(error.message) as AuthError;
            authError.code = error.status?.toString();
            throw authError;
        }
        return data;
    }

    static async register({ email, password, role }: AuthCredentials) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            const error = new Error(authError.message) as AuthError;
            error.code = authError.status?.toString();
            throw error;
        }

        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    role: role || 'customer',
                    email,
                    verification_attempts: 0,
                    email_verified: false,
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

    static async getProfile(): Promise<Profile | null> {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error) throw error;
        return data ? { ...data, email: session.user.email || '' } as Profile : null;
    }

    static async updateProfile(data: Partial<Profile>): Promise<Profile> {
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
        return { ...profile, email: session.user.email || '' } as Profile;
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

        // Check rate limiting
        if (data.verification_attempts >= MAX_VERIFICATION_ATTEMPTS) {
            const lastAttempt = new Date(data.last_verification_attempt || '');
            const timeSinceLastAttempt = (new Date().getTime() - lastAttempt.getTime()) / 1000 / 60;

            if (timeSinceLastAttempt < VERIFICATION_TIMEOUT_MINUTES) {
                throw new Error(`Too many attempts. Please try again in ${Math.ceil(VERIFICATION_TIMEOUT_MINUTES - timeSinceLastAttempt)} minutes.`);
            }
        }

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
        if (error) {
            const authError = new Error(error.message) as AuthError;
            authError.code = error.status?.toString();
            throw authError;
        }
    }

    static async updatePassword(password: string) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            const authError = new Error(error.message) as AuthError;
            authError.code = error.status?.toString();
            throw authError;
        }
    }
} 