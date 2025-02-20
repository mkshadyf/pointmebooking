import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthSlice, authSlice } from './slices/auth.slice';
// Import other slices if you have them

// Combine all slices into a single RootState
export type RootState = AuthSlice // & OtherSlice & AnotherSlice;

// Create the store with all slices and middleware
export const useStore = create<RootState>()(
    devtools(
        (...a) => ({
            ...authSlice(...a),
            // ...otherSlice(...a),
        }),
        { name: 'YourAppName' } // Optional: Give your store a name for Redux DevTools
    )
); 