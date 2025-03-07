import { ProtectedRoute } from '@/components/authorization/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { Permission } from '@/types/authorization';
import { AuthRole } from '@/types/database/auth';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleBasedGuardProps {
  /**
   * The roles allowed to access this route
   */
  allowedRoles?: AuthRole[];
  
  /**
   * Specific permissions required (in addition to role check)
   */
  requiredPermissions?: Permission[];
  
  /**
   * Whether all permissions are required or any is sufficient
   */
  requireAllPermissions?: boolean;
  
  /**
   * Children to render if authorized
   */
  children: React.ReactNode;
  
  /**
   * Custom redirect path for unauthorized users
   */
  redirectTo?: string;
  
  /**
   * Custom redirect path for authenticated but unauthorized users
   */
  unauthorizedRedirectTo?: string;
}


/**
 * Guard component that protects routes based on user roles
 */
export const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = false,
  children,
  redirectTo = '/login',
  unauthorizedRedirectTo = '/unauthorized',
}) => {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  
  // If still loading, show loading indicator
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }
  
  // If no roles specified, just check permissions
  if (!allowedRoles || allowedRoles.length === 0) {
    return (
      <ProtectedRoute 
        permissions={requiredPermissions} 
        requireAllPermissions={requireAllPermissions}
        unauthorizedRedirect={unauthorizedRedirectTo}
      >
        {children}
      </ProtectedRoute>
    );
  }
  
  // Get user role from metadata
  const userRole = (user.user_metadata?.role as AuthRole) || 'customer';
  
  // Check if user has an allowed role
  const hasAllowedRole = allowedRoles.includes(userRole);
  
  // If user doesn't have an allowed role, redirect to unauthorized
  if (!hasAllowedRole) {
    return <Navigate to={unauthorizedRedirectTo} replace />;
  }
  
  // If user has allowed role but we also need to check permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    return (
      <ProtectedRoute 
        permissions={requiredPermissions} 
        requireAllPermissions={requireAllPermissions}
        unauthorizedRedirect={unauthorizedRedirectTo}
      >
        {children}
      </ProtectedRoute>
    );
  }
  
  // User has allowed role and no permissions check needed
  return <>{children}</>;
};

/**
 * HOC that wraps a component with role-based protection
 */
export function withRoleBasedGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RoleBasedGuardProps, 'children'>
) {
  const WithRoleGuardComponent = (props: P) => {
    return (
      <RoleBasedGuard {...options}>
        <Component {...props} />
      </RoleBasedGuard>
    );
  };
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithRoleGuardComponent.displayName = `withRoleBasedGuard(${displayName})`;
  
  return WithRoleGuardComponent;
} 