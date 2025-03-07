'use client';

import { useAuthContext } from '@/lib/auth/context/AuthContext';
import { ReactNode } from 'react';

/**
 * Permission guard props
 */
interface PermissionGuardProps {
  children: ReactNode;
  requiredRole: 'customer' | 'business' | 'admin';
  fallback?: ReactNode;
}

/**
 * Permission guard component
 * Only renders children if user has the required role
 */
export function PermissionGuard({ 
  children, 
  requiredRole, 
  fallback = null 
}: PermissionGuardProps) {
  const { profile, isAuthenticated } = useAuthContext();
  
  // Check if user is authenticated and has the required role
  const hasPermission = isAuthenticated && profile?.role === requiredRole;
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
} 