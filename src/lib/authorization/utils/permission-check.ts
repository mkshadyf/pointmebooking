/**
 * Centralized permission check utility
 * Provides standardized methods for checking user permissions
 */

import { User } from '@supabase/supabase-js';
import { ROLE_PERMISSIONS } from '../constants';
import { Permission, Role } from '../types';

/**
 * Check if a user has a specific permission
 * @param user - The user to check permissions for
 * @param permission - The permission to check
 * @returns Whether the user has the permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  
  // Get user role from metadata
  const userRole = (user.user_metadata?.role as Role) || 'user';
  
  // Get permissions for the role
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  
  // Check if the role has the permission
  return rolePermissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 * @param user - The user to check permissions for
 * @param permissions - The permissions to check
 * @returns Whether the user has any of the permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  
  // Check each permission
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 * @param user - The user to check permissions for
 * @param permissions - The permissions to check
 * @returns Whether the user has all of the permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user) return false;
  
  // Check each permission
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Check if a user has a specific role
 * @param user - The user to check role for
 * @param role - The role to check
 * @returns Whether the user has the role
 */
export function hasRole(user: User | null, role: Role): boolean {
  if (!user) return false;
  
  // Get user role from metadata
  const userRole = (user.user_metadata?.role as Role) || 'user';
  
  // Check if the user has the role
  return userRole === role;
}

/**
 * Check if a user has any of the specified roles
 * @param user - The user to check roles for
 * @param roles - The roles to check
 * @returns Whether the user has any of the roles
 */
export function hasAnyRole(user: User | null, roles: Role[]): boolean {
  if (!user) return false;
  
  // Check each role
  return roles.some(role => hasRole(user, role));
}

/**
 * Get all permissions for a user
 * @param user - The user to get permissions for
 * @returns Array of permissions the user has
 */
export function getUserPermissions(user: User | null): Permission[] {
  if (!user) return [];
  
  // Get user role from metadata
  const userRole = (user.user_metadata?.role as Role) || 'user';
  
  // Get permissions for the role
  return ROLE_PERMISSIONS[userRole] || [];
}

/**
 * Check if a user is an admin
 * @param user - The user to check
 * @returns Whether the user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if a user is a business owner
 * @param user - The user to check
 * @returns Whether the user is a business owner
 */
export function isBusinessOwner(user: User | null): boolean {
  return hasRole(user, 'business');
}

/**
 * Check if a user is a staff member
 * @param user - The user to check
 * @returns Whether the user is a staff member
 */
export function isStaff(user: User | null): boolean {
  return hasRole(user, 'staff');
}

/**
 * Check if a user is a regular user
 * @param user - The user to check
 * @returns Whether the user is a regular user
 */
export function isUser(user: User | null): boolean {
  return hasRole(user, 'user');
} 