import { useAuthorization } from '@/lib/authorization';
import { Permission } from '@/lib/authorization/types';
import React from 'react';

interface PermissionGuardProps {
  /**
   * The permission(s) required to render the children
   */
  permissions: Permission | Permission[];
  
  /**
   * Whether all permissions are required (true) or any permission is sufficient (false)
   */
  requireAll?: boolean;
  
  /**
   * Content to render when the user has the required permissions
   */
  children: React.ReactNode;
  
  /**
   * Optional content to render when the user doesn't have the required permissions
   */
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { can, canAll, canAny } = useAuthorization();
  
  // Handle single permission case
  if (!Array.isArray(permissions)) {
    const isAuthorized = can(permissions);
    return isAuthorized ? <>{children}</> : <>{fallback}</>;
  }
  
  // Handle multiple permissions case
  const isAuthorized = requireAll
    ? canAll(permissions)
    : canAny(permissions);
  
  return isAuthorized ? <>{children}</> : <>{fallback}</>;
};

/**
 * Higher-order component that wraps a component with permission checks
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissions: Permission | Permission[],
  options?: {
    requireAll?: boolean;
    fallback?: React.ReactNode;
  }
) {
  const WithPermissionComponent = (props: P) => {
    return (
      <PermissionGuard
        permissions={permissions}
        requireAll={options?.requireAll}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </PermissionGuard>
    );
  };
  
  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithPermissionComponent.displayName = `withPermission(${displayName})`;
  
  return WithPermissionComponent;
} 