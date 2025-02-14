// Context and hooks
export { AuthContext, useAuth } from '../supabase/auth/context/AuthContext';
export type { AuthContextType } from '../supabase/auth/context/AuthContext';

// Services
export { AuthService } from '../supabase/services/auth.service';

// Store
export {
    authSlice, selectIsAuthenticated,
    selectIsLoading, selectUser, useAuthStore
} from '../supabase/store/slices/auth.slice';

// Types
export type { AuthProfile } from '../supabase/types/database';

// Constants
export const AUTH_ROUTES = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
} as const; 