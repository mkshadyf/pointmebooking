import { AuthRole } from '@/types/database/auth';

/**
 * Permission represents a specific action that can be performed in the system
 */
export enum Permission {
  // User management permissions
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // Profile management permissions
  VIEW_PROFILE = 'view_profile',
  UPDATE_PROFILE = 'update_profile',
  
  // Business management permissions
  VIEW_BUSINESS = 'view_business',
  CREATE_BUSINESS = 'create_business',
  UPDATE_BUSINESS = 'update_business',
  DELETE_BUSINESS = 'delete_business',
  
  // Service management permissions
  VIEW_SERVICE = 'view_service',
  CREATE_SERVICE = 'create_service',
  UPDATE_SERVICE = 'update_service',
  DELETE_SERVICE = 'delete_service',
  
  // Booking management permissions
  VIEW_BOOKING = 'view_booking',
  CREATE_BOOKING = 'create_booking',
  UPDATE_BOOKING = 'update_booking',
  DELETE_BOOKING = 'delete_booking',
  
  // Admin permissions
  MANAGE_SYSTEM = 'manage_system',
  VIEW_ANALYTICS = 'view_analytics',
}

/**
 * Resource represents an entity in the system that can be accessed
 */
export enum Resource {
  USER = 'user',
  PROFILE = 'profile',
  BUSINESS = 'business',
  SERVICE = 'service',
  BOOKING = 'booking',
  SYSTEM = 'system',
}

/**
 * Action represents operations that can be performed on resources
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

/**
 * PermissionDescriptor provides context for a permission
 */
export interface PermissionDescriptor {
  permission: Permission;
  resource: Resource;
  action: Action;
  description: string;
}

/**
 * RolePermissions maps roles to their allowed permissions
 */
export type RolePermissions = Record<AuthRole, Permission[]>;

/**
 * AuthorizationContext provides information needed for authorization decisions
 */
export interface AuthorizationContext {
  userId?: string;
  userRole?: AuthRole;
  resourceId?: string;
  resourceOwnerId?: string;
}

/**
 * AuthorizationResult represents the outcome of an authorization check
 */
export interface AuthorizationResult {
  isAuthorized: boolean;
  reason?: string;
} 