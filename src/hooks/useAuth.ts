import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { useAuth as useAuthFromContext } from '@/context/AuthContext';

// This hook is deprecated. Import useAuth from '@/context/AuthContext' instead
export const useAuth = useAuthFromContext;

// export function useAuth() {
//   console.warn('This hook is deprecated. Import useAuth from @/context/AuthContext instead');
//   const context = useContext(AuthContext);
  
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
  
//   return context;
// }
