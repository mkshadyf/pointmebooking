import { convertToAppError } from '@/lib/error';
import {
    Action,
    AuthorizationContext,
    AuthorizationResult,
    Permission,
    PermissionDescriptor,
    Resource,
    RolePermissions
} from '@/types/authorization';
import { AuthRole } from '@/types/database/auth';

/**
 * Permission descriptors provide detailed information about each permission
 */
const PERMISSION_DESCRIPTORS: Record<Permission, PermissionDescriptor> = {
  // User management permissions
  [Permission.VIEW_USERS]: {
    permission: Permission.VIEW_USERS,
    resource: Resource.USER,
    action: Action.READ,
    description: 'View user accounts'
  },
  [Permission.CREATE_USER]: {
    permission: Permission.CREATE_USER,
    resource: Resource.USER,
    action: Action.CREATE,
    description: 'Create user accounts'
  },
  [Permission.UPDATE_USER]: {
    permission: Permission.UPDATE_USER,
    resource: Resource.USER,
    action: Action.UPDATE,
    description: 'Update user accounts'
  },
  [Permission.DELETE_USER]: {
    permission: Permission.DELETE_USER,
    resource: Resource.USER,
    action: Action.DELETE,
    description: 'Delete user accounts'
  },
  
  // Profile management permissions
  [Permission.VIEW_PROFILE]: {
    permission: Permission.VIEW_PROFILE,
    resource: Resource.PROFILE,
    action: Action.READ,
    description: 'View user profiles'
  },
  [Permission.UPDATE_PROFILE]: {
    permission: Permission.UPDATE_PROFILE,
    resource: Resource.PROFILE,
    action: Action.UPDATE,
    description: 'Update user profiles'
  },
  
  // Business management permissions
  [Permission.VIEW_BUSINESS]: {
    permission: Permission.VIEW_BUSINESS,
    resource: Resource.BUSINESS,
    action: Action.READ,
    description: 'View business information'
  },
  [Permission.CREATE_BUSINESS]: {
    permission: Permission.CREATE_BUSINESS,
    resource: Resource.BUSINESS,
    action: Action.CREATE,
    description: 'Create business profiles'
  },
  [Permission.UPDATE_BUSINESS]: {
    permission: Permission.UPDATE_BUSINESS,
    resource: Resource.BUSINESS,
    action: Action.UPDATE,
    description: 'Update business information'
  },
  [Permission.DELETE_BUSINESS]: {
    permission: Permission.DELETE_BUSINESS,
    resource: Resource.BUSINESS,
    action: Action.DELETE,
    description: 'Delete business profiles'
  },
  
  // Service management permissions
  [Permission.VIEW_SERVICE]: {
    permission: Permission.VIEW_SERVICE,
    resource: Resource.SERVICE,
    action: Action.READ,
    description: 'View services'
  },
  [Permission.CREATE_SERVICE]: {
    permission: Permission.CREATE_SERVICE,
    resource: Resource.SERVICE,
    action: Action.CREATE,
    description: 'Create services'
  },
  [Permission.UPDATE_SERVICE]: {
    permission: Permission.UPDATE_SERVICE,
    resource: Resource.SERVICE,
    action: Action.UPDATE,
    description: 'Update services'
  },
  [Permission.DELETE_SERVICE]: {
    permission: Permission.DELETE_SERVICE,
    resource: Resource.SERVICE,
    action: Action.DELETE,
    description: 'Delete services'
  },
  
  // Booking management permissions
  [Permission.VIEW_BOOKING]: {
    permission: Permission.VIEW_BOOKING,
    resource: Resource.BOOKING,
    action: Action.READ,
    description: 'View bookings'
  },
  [Permission.CREATE_BOOKING]: {
    permission: Permission.CREATE_BOOKING,
    resource: Resource.BOOKING,
    action: Action.CREATE,
    description: 'Create bookings'
  },
  [Permission.UPDATE_BOOKING]: {
    permission: Permission.UPDATE_BOOKING,
    resource: Resource.BOOKING,
    action: Action.UPDATE,
    description: 'Update bookings'
  },
  [Permission.DELETE_BOOKING]: {
    permission: Permission.DELETE_BOOKING,
    resource: Resource.BOOKING,
    action: Action.DELETE,
    description: 'Delete bookings'
  },
  
  // Admin permissions
  [Permission.MANAGE_SYSTEM]: {
    permission: Permission.MANAGE_SYSTEM,
    resource: Resource.SYSTEM,
    action: Action.MANAGE,
    description: 'Manage system settings'
  },
  [Permission.VIEW_ANALYTICS]: {
    permission: Permission.VIEW_ANALYTICS,
    resource: Resource.SYSTEM,
    action: Action.READ,
    description: 'View system analytics'
  }
};

/**
 * Role-based permission mapping
 */
const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    // Admin has all permissions
    ...Object.values(Permission)
  ],
  business: [
    // Business profile permissions
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,
    
    // Business management permissions
    Permission.VIEW_BUSINESS,
    Permission.UPDATE_BUSINESS,
    
    // Service management permissions
    Permission.VIEW_SERVICE,
    Permission.CREATE_SERVICE,
    Permission.UPDATE_SERVICE,
    Permission.DELETE_SERVICE,
    
    // Booking management permissions
    Permission.VIEW_BOOKING,
    Permission.UPDATE_BOOKING,
  ],
  customer: [
    // Profile permissions
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,
    
    // Business viewing permissions
    Permission.VIEW_BUSINESS,
    
    // Service viewing permissions
    Permission.VIEW_SERVICE,
    
    // Booking permissions
    Permission.VIEW_BOOKING,
    Permission.CREATE_BOOKING,
    Permission.UPDATE_BOOKING,
    Permission.DELETE_BOOKING,
  ],
  // Adding staff role to match the database enum
  // staff: [
    // Staff permissions
    // Permission.VIEW_PROFILE,
    // Permission.UPDATE_PROFILE,
    
    // Business viewing permissions
    // Permission.VIEW_BUSINESS,
    
    // Service permissions
    // Permission.VIEW_SERVICE,
    // Permission.UPDATE_SERVICE,
    
    // Booking permissions
    // Permission.VIEW_BOOKING,
    // Permission.UPDATE_BOOKING,
  // ]
};

/**
 * AuthorizationService provides methods for checking user permissions
 */
export class AuthorizationService {
  /**
   * Check if a user has a specific permission
   * @param permission The permission to check
   * @param context The authorization context
   * @returns Authorization result
   */
  static hasPermission(
    permission: Permission,
    context: AuthorizationContext
  ): AuthorizationResult {
    try {
      // If no role is provided, user is not authorized
      if (!context.userRole) {
        return {
          isAuthorized: false,
          reason: 'User role not provided'
        };
      }

      // Check if the user's role has the required permission
      const hasPermission = ROLE_PERMISSIONS[context.userRole].includes(permission);
      
      if (!hasPermission) {
        return {
          isAuthorized: false,
          reason: `Role '${context.userRole}' does not have permission '${permission}'`
        };
      }

      // For resource ownership checks
      if (context.resourceOwnerId && context.userId) {
        const descriptor = PERMISSION_DESCRIPTORS[permission];
        
        // For update/delete operations on owned resources, check ownership
        if (
          (descriptor.action === Action.UPDATE || descriptor.action === Action.DELETE) &&
          context.resourceOwnerId !== context.userId &&
          context.userRole !== 'admin' // Admins can bypass ownership checks
        ) {
          return {
            isAuthorized: false,
            reason: 'User does not own this resource'
          };
        }
      }

      return { isAuthorized: true };
    } catch (error) {
      // Using the correct ErrorHandler options
      convertToAppError(error, 'AuthorizationService.hasPermission');
      
      return {
        isAuthorized: false,
        reason: 'Error checking permission'
      };
    }
  }

  /**
   * Check if a user has any of the specified permissions
   * @param permissions Array of permissions to check
   * @param context The authorization context
   * @returns Authorization result
   */
  static hasAnyPermission(
    permissions: Permission[],
    context: AuthorizationContext
  ): AuthorizationResult {
    for (const permission of permissions) {
      const result = this.hasPermission(permission, context);
      if (result.isAuthorized) {
        return result;
      }
    }
    
    return {
      isAuthorized: false,
      reason: `User does not have any of the required permissions: ${permissions.join(', ')}`
    };
  }

  /**
   * Check if a user has all of the specified permissions
   * @param permissions Array of permissions to check
   * @param context The authorization context
   * @returns Authorization result
   */
  static hasAllPermissions(
    permissions: Permission[],
    context: AuthorizationContext
  ): AuthorizationResult {
    for (const permission of permissions) {
      const result = this.hasPermission(permission, context);
      if (!result.isAuthorized) {
        return result;
      }
    }
    
    return { isAuthorized: true };
  }

  /**
   * Get all permissions for a specific role
   * @param role The role to get permissions for
   * @returns Array of permissions
   */
  static getPermissionsForRole(role: AuthRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Get all roles that have a specific permission
   * @param permission The permission to check
   * @returns Array of roles
   */
  static getRolesWithPermission(permission: Permission): AuthRole[] {
    return Object.entries(ROLE_PERMISSIONS)
      .filter(([_, permissions]) => permissions.includes(permission))
      .map(([role]) => role as AuthRole);
  }

  /**
   * Get detailed information about a permission
   * @param permission The permission to get information for
   * @returns Permission descriptor
   */
  static getPermissionInfo(permission: Permission): PermissionDescriptor {
    return PERMISSION_DESCRIPTORS[permission];
  }
} 