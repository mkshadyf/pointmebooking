/**
 * Authorization hook
 * Provides authorization context and utilities
 */

import { useAuth } from '@/lib/auth';
import { useCallback, useMemo } from 'react';
import { AuthorizationContext, Permission, Role } from '../types';
import {
    getUserPermissions,
    hasAllPermissions,
    hasAnyPermission,
    hasAnyRole,
    hasPermission,
    hasRole,
    isAdmin,
    isBusinessOwner,
    isStaff,
    isUser
} from '../utils/permission-check';

/**
 * Hook for accessing authorization context and utilities
 * @returns Authorization context and utility functions
 */
export function useAuthorization() {
  const { user, isAuthenticated } = useAuth();
  
  // Get user role from metadata
  const role = useMemo<Role>(() => {
    if (!user) return 'user';
    return (user.user_metadata?.role as Role) || 'user';
  }, [user]);
  
  // Get user permissions
  const permissions = useMemo<Permission[]>(() => {
    return getUserPermissions(user);
  }, [user]);
  
  // Check if user has a specific permission
  const checkPermission = useCallback(
    (permission: Permission) => hasPermission(user, permission),
    [user]
  );
  
  // Check if user has any of the specified permissions
  const checkAnyPermission = useCallback(
    (permissions: Permission[]) => hasAnyPermission(user, permissions),
    [user]
  );
  
  // Check if user has all of the specified permissions
  const checkAllPermissions = useCallback(
    (permissions: Permission[]) => hasAllPermissions(user, permissions),
    [user]
  );
  
  // Check if user has a specific role
  const checkRole = useCallback(
    (roleToCheck: Role) => hasRole(user, roleToCheck),
    [user]
  );
  
  // Check if user has any of the specified roles
  const checkAnyRole = useCallback(
    (rolesToCheck: Role[]) => hasAnyRole(user, rolesToCheck),
    [user]
  );
  
  // Authorization context
  const authContext: AuthorizationContext = useMemo(
    () => ({
      role,
      permissions,
      isAuthenticated,
      isAdmin: isAdmin(user),
      isBusinessOwner: isBusinessOwner(user),
      isStaff: isStaff(user),
      isUser: isUser(user)
    }),
    [role, permissions, isAuthenticated, user]
  );
  
  return {
    // Authorization context
    ...authContext,
    
    // User
    user,
    
    // Permission checks
    can: checkPermission,
    canAny: checkAnyPermission,
    canAll: checkAllPermissions,
    
    // Role checks
    is: checkRole,
    isAny: checkAnyRole
  };
} 