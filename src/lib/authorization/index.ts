/**
 * Authorization module
 * Provides role-based access control (RBAC) for the application
 */

// Export authorization service
export { AuthorizationService } from './authorization.service';

// Export authorization hooks
export { useAuthorization } from './hooks/useAuthorization';

// Export authorization types
export type { Permission } from '@/types/authorization';

// Export authorization components
export {
    PermissionGuard,
    withPermission
} from '@/components/authorization/PermissionGuard';

export {
    ProtectedRoute,
    withProtectedRoute
} from '@/components/authorization/ProtectedRoute';

// Export types
export * from './types';

// Export constants
export * from './constants';

// Export utilities
export * from './utils/permission-check';

// Export hooks
export * from './hooks/useAuthorization';
