'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabaseClientService } from '../services/core/supabase-client.service';
import { useAuthStore } from './auth.store';
// Import other slices if you have them

// Define AuthSlice type for backward compatibility
export type AuthSlice = ReturnType<typeof useAuthStore.getState>;

// Combine all slices into a single RootState
export type RootState = AuthSlice // & OtherSlice & AnotherSlice;


interface StoreState {
  categories: any[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchCategories: () => Promise<void>;
  setCategories: (categories: any[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Create the store with all slices and middleware
// Note: This is kept for backward compatibility
// New code should use useAuthStore directly
export const useStore = create<StoreState>()(
    devtools(
        persist(
            (set) => ({
                categories: [],
                isLoading: false,
                error: null,
                
                // Actions
                fetchCategories: async () => {
                    set({ isLoading: true, error: null });
                    
                    try {
                        const { data, error } = await supabaseClientService.executeWithRetry(async (client) => {
                            const { data, error } = await client
                                .from('service_categories')
                                .select('*')
                                .order('name');
                            
                            return { data, error };
                        });
                        
                        if (error) {
                            set({ 
                                error: error.message || 'Failed to fetch categories',
                                isLoading: false
                            });
                            return;
                        }
                        
                        set({ 
                            categories: data || [],
                            isLoading: false
                        });
                    } catch (error) {
                        set({ 
                            error: 'An unexpected error occurred',
                            isLoading: false
                        });
                    }
                },
                
                setCategories: (categories) => set({ categories }),
                setLoading: (isLoading) => set({ isLoading }),
                setError: (error) => set({ error }),
            }),
            {
                name: 'app-store',
                partialize: (state) => ({
                    categories: state.categories,
                }),
            }
        )
    )
); 