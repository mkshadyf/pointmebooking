/**
 * Authorization types
 * Defines types for the authorization system
 */

import {
    Action,
    AuthorizationContext as AuthContext,
    AuthorizationResult,
    PermissionDescriptor,
    Permission as PermissionEnum,
    Resource as ResourceEnum,
    RolePermissions
} from '@/types/authorization';

// Re-export types from types/authorization
export { Action };
export type {
    AuthorizationResult, PermissionDescriptor, PermissionEnum, ResourceEnum,
    RolePermissions
};

/**
 * Available user roles in the system
 */
export type Role = 'user' | 'business' | 'staff' | 'admin';

/**
 * Permission string type
 * Format: resource:action
 * Example: 'user:create'
 * 
 * This is kept for backward compatibility.
 * New code should use PermissionEnum from types/authorization/index.ts
 */
export type Permission = string;

/**
 * Authorization context provided to components
 */
export interface AuthorizationContext extends Partial<AuthContext> {
  /**
   * Current user role
   */
  role: Role;
  
  /**
   * List of permissions the user has
   */
  permissions: Permission[];
  
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Whether the user is an admin
   */
  isAdmin: boolean;
  
  /**
   * Whether the user is a business owner
   */
  isBusinessOwner: boolean;
  
  /**
   * Whether the user is a staff member
   */
  isStaff: boolean;
  
  /**
   * Whether the user is a regular user
   */
  isUser: boolean;
}

/**
 * Resource type for permission checks
 */
export interface Resource {
  id: string;
  ownerId?: string;
}

/**
 * Permission check options
 */
export interface PermissionCheckOptions {
  /**
   * Whether to check ownership of the resource
   */
  checkOwnership?: boolean;
  
  /**
   * The resource to check ownership against
   */
  resource?: Resource;
}

/**
 * Permission guard props for components
 */
export interface PermissionGuardProps {
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