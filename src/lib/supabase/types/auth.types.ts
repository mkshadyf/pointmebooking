// Remove the incorrect import
// import { DbProfile } from '.';

import type { Database } from './database';

export type AuthRole = 'customer' | 'business' | 'admin';

type DbProfile = Database['public']['Tables']['profiles']['Row'];

export interface AuthProfile extends DbProfile {
  role: AuthRole;
  email?: string;
  verification_attempts: number;
  last_verification_attempt?: string;
}

export interface AuthContextType {
  user: AuthProfile | null;
  profile: AuthProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: AuthRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthProfile>) => Promise<void>;
}