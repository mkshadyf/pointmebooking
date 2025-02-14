import { create } from 'zustand';
import { AuthState, authSlice } from './slices/auth.slice';

export interface RootState extends AuthState {}

export const useStore = create<RootState>()((...a) => ({
    ...authSlice(...a)
})); 