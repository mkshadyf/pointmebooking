import type { AuthProfile as BaseAuthProfile } from '@/types/database/auth'; // Correct import path


export type AuthFormData = Record<string, string>; // Simple form data

export interface AuthProfile extends Omit<BaseAuthProfile, 'email'> {
    email: string; // Make email required
    // is_verified: boolean; // No longer needed here
    // is_email_verified: boolean; // No longer needed here
    // role: AuthRole; // No longer needed here
}

export interface AuthContextType {
    user: AuthProfile | null;
    profile: AuthProfile | null;
    loading: boolean;
    error: string | null;
    isEmailVerified: boolean;
    signOut: () => Promise<void>;
    updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
} 