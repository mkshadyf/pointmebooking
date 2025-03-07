/**
 * Protected Route Component
 * Restricts access to routes based on authentication and authorization
 */

import { useAuth } from '@/lib/auth';
import { useAuthorization } from '@/lib/authorization';
import { Permission, Role } from '@/lib/authorization/types';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface ProtectedRouteProps {
  /**
   * The content to render if the user is authorized
   */
  children: React.ReactNode;
  
  /**
   * Redirect path if the user is not authenticated
   * @default '/login'
   */
  loginRedirect?: string;
  
  /**
   * Redirect path if the user is authenticated but not authorized
   * @default '/'
   */
  unauthorizedRedirect?: string;
  
  /**
   * Required permissions to access the route
   */
  permissions?: Permission[];
  
  /**
   * Whether all permissions are required (AND) or any permission is sufficient (OR)
   * @default false (OR)
   */
  requireAllPermissions?: boolean;
  
  /**
   * Required roles to access the route
   */
  roles?: Role[];
  
  /**
   * Whether all roles are required (AND) or any role is sufficient (OR)
   * @default false (OR)
   */
  requireAllRoles?: boolean;
  
  /**
   * Whether to show a loading state while checking authentication
   * @default true
   */
  showLoading?: boolean;
  
  /**
   * Content to render while checking authentication
   * @default null
   */
  loadingComponent?: React.ReactNode;
}

/**
 * Component that protects routes based on authentication and authorization
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  loginRedirect = '/login',
  unauthorizedRedirect = '/',
  permissions = [],
  requireAllPermissions = false,
  roles = [],
  requireAllRoles = false,
  showLoading = true,
  loadingComponent = null,
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { canAny, canAll, isAny, is } = useAuthorization();
  
  // Handle loading state
  if (isLoading && showLoading) {
    return <>{loadingComponent}</>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated && !isLoading) {
    router.push(loginRedirect);
    return null;
  }
  
  // Check permissions if specified
  if (permissions.length > 0) {
    const hasPermission = requireAllPermissions
      ? canAll(permissions)
      : canAny(permissions);
    
    if (!hasPermission) {
      router.push(unauthorizedRedirect);
      return null;
    }
  }
  
  // Check roles if specified
  if (roles.length > 0) {
    const hasRole = requireAllRoles
      ? roles.every(role => is(role))
      : isAny(roles);
    
    if (!hasRole) {
      router.push(unauthorizedRedirect);
      return null;
    }
  }
  
  // User is authenticated and authorized
  return <>{children}</>;
};

/**
 * Higher-order component that wraps a component with ProtectedRoute
 */
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedRouteComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
} 