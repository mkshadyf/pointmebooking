'use client';

/**
 * Re-export all slices and selectors from a single entry point
 * 
 * Note: This file is maintained for backward compatibility.
 * New code should import directly from the consolidated store files.
 */

// Auth store
export {
    // authSlice is no longer exported from auth.store.ts
    selectError,
    selectIsAuthenticated,
    selectIsLoading,
    selectRequires2FA,
    selectSessionId,
    selectUser,
    useAuthStore
} from '../auth.store';

// Import for type definition
import { useAuthStore as authStore } from '../auth.store';

// Define types for backward compatibility
export type AuthSlice = ReturnType<typeof authStore.getState>;
export type SupabaseStore = AuthSlice; 