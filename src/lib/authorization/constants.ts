/**
 * Authorization constants
 * Defines permissions and role-based access control
 */

import { Permission, Role } from './types';

/**
 * Permission descriptors for user management
 */
export const USER_PERMISSIONS = {
  VIEW_USERS: 'user:view' as Permission,
  CREATE_USER: 'user:create' as Permission,
  UPDATE_USER: 'user:update' as Permission,
  DELETE_USER: 'user:delete' as Permission,
  MANAGE_ROLES: 'user:manage-roles' as Permission,
};

/**
 * Permission descriptors for profile management
 */
export const PROFILE_PERMISSIONS = {
  VIEW_PROFILE: 'profile:view' as Permission,
  UPDATE_PROFILE: 'profile:update' as Permission,
  VIEW_ANY_PROFILE: 'profile:view-any' as Permission,
  UPDATE_ANY_PROFILE: 'profile:update-any' as Permission,
};

/**
 * Permission descriptors for business management
 */
export const BUSINESS_PERMISSIONS = {
  VIEW_BUSINESS: 'business:view' as Permission,
  CREATE_BUSINESS: 'business:create' as Permission,
  UPDATE_BUSINESS: 'business:update' as Permission,
  DELETE_BUSINESS: 'business:delete' as Permission,
  VIEW_ANY_BUSINESS: 'business:view-any' as Permission,
  UPDATE_ANY_BUSINESS: 'business:update-any' as Permission,
  DELETE_ANY_BUSINESS: 'business:delete-any' as Permission,
};

/**
 * Permission descriptors for service management
 */
export const SERVICE_PERMISSIONS = {
  VIEW_SERVICE: 'service:view' as Permission,
  CREATE_SERVICE: 'service:create' as Permission,
  UPDATE_SERVICE: 'service:update' as Permission,
  DELETE_SERVICE: 'service:delete' as Permission,
  VIEW_ANY_SERVICE: 'service:view-any' as Permission,
  UPDATE_ANY_SERVICE: 'service:update-any' as Permission,
  DELETE_ANY_SERVICE: 'service:delete-any' as Permission,
};

/**
 * Permission descriptors for booking management
 */
export const BOOKING_PERMISSIONS = {
  VIEW_BOOKING: 'booking:view' as Permission,
  CREATE_BOOKING: 'booking:create' as Permission,
  UPDATE_BOOKING: 'booking:update' as Permission,
  CANCEL_BOOKING: 'booking:cancel' as Permission,
  VIEW_ANY_BOOKING: 'booking:view-any' as Permission,
  UPDATE_ANY_BOOKING: 'booking:update-any' as Permission,
  CANCEL_ANY_BOOKING: 'booking:cancel-any' as Permission,
};

/**
 * Permission descriptors for admin operations
 */
export const ADMIN_PERMISSIONS = {
  VIEW_DASHBOARD: 'admin:view-dashboard' as Permission,
  MANAGE_SETTINGS: 'admin:manage-settings' as Permission,
  VIEW_LOGS: 'admin:view-logs' as Permission,
  MANAGE_CATEGORIES: 'admin:manage-categories' as Permission,
};

/**
 * All permissions combined
 */
export const ALL_PERMISSIONS = {
  ...USER_PERMISSIONS,
  ...PROFILE_PERMISSIONS,
  ...BUSINESS_PERMISSIONS,
  ...SERVICE_PERMISSIONS,
  ...BOOKING_PERMISSIONS,
  ...ADMIN_PERMISSIONS,
};

/**
 * Role-based permission mappings
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // Regular user permissions
  user: [
    PROFILE_PERMISSIONS.VIEW_PROFILE,
    PROFILE_PERMISSIONS.UPDATE_PROFILE,
    BUSINESS_PERMISSIONS.VIEW_BUSINESS,
    SERVICE_PERMISSIONS.VIEW_SERVICE,
    BOOKING_PERMISSIONS.VIEW_BOOKING,
    BOOKING_PERMISSIONS.CREATE_BOOKING,
    BOOKING_PERMISSIONS.UPDATE_BOOKING,
    BOOKING_PERMISSIONS.CANCEL_BOOKING,
  ],
  
  // Business owner permissions
  business: [
    PROFILE_PERMISSIONS.VIEW_PROFILE,
    PROFILE_PERMISSIONS.UPDATE_PROFILE,
    BUSINESS_PERMISSIONS.VIEW_BUSINESS,
    BUSINESS_PERMISSIONS.CREATE_BUSINESS,
    BUSINESS_PERMISSIONS.UPDATE_BUSINESS,
    SERVICE_PERMISSIONS.VIEW_SERVICE,
    SERVICE_PERMISSIONS.CREATE_SERVICE,
    SERVICE_PERMISSIONS.UPDATE_SERVICE,
    SERVICE_PERMISSIONS.DELETE_SERVICE,
    BOOKING_PERMISSIONS.VIEW_BOOKING,
    BOOKING_PERMISSIONS.VIEW_ANY_BOOKING,
    BOOKING_PERMISSIONS.UPDATE_ANY_BOOKING,
    BOOKING_PERMISSIONS.CANCEL_ANY_BOOKING,
  ],
  
  // Staff member permissions
  staff: [
    PROFILE_PERMISSIONS.VIEW_PROFILE,
    PROFILE_PERMISSIONS.UPDATE_PROFILE,
    BUSINESS_PERMISSIONS.VIEW_BUSINESS,
    SERVICE_PERMISSIONS.VIEW_SERVICE,
    BOOKING_PERMISSIONS.VIEW_BOOKING,
    BOOKING_PERMISSIONS.VIEW_ANY_BOOKING,
    BOOKING_PERMISSIONS.UPDATE_ANY_BOOKING,
    BOOKING_PERMISSIONS.CANCEL_ANY_BOOKING,
  ],
  
  // Admin permissions (has all permissions)
  admin: Object.values(ALL_PERMISSIONS),
};

/**
 * Default role for new users
 */
export const DEFAULT_ROLE: Role = 'user';

/**
 * Role display names for UI
 */
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  user: 'User',
  business: 'Business Owner',
  staff: 'Staff Member',
  admin: 'Administrator',
}; 