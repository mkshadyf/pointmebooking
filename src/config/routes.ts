import { UserRole } from '@/types';

export interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
  requiresAuth: boolean;
  requiresVerification: boolean;
  requiresOnboarding: boolean;
}

export const ROUTES: Record<string, RouteConfig> = {
  home: {
    path: '/',
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  login: {
    path: '/login',
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  register: {
    path: '/register',
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  customerDashboard: {
    path: '/(app)/dashboard/customer',
    allowedRoles: ['customer', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  businessDashboard: {
    path: '/(app)/dashboard/business',
    allowedRoles: ['business', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  adminDashboard: {
    path: '/(app)/dashboard/admin',
    allowedRoles: ['admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: false,
  },
  customerOnboarding: {
    path: '/(app)/onboarding/customer',
    allowedRoles: ['customer'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: false,
  },
  businessOnboarding: {
    path: '/(app)/onboarding/business',
    allowedRoles: ['business'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: false,
  },
  verifyEmail: {
    path: '/verify-email',
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: true,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  forgotPassword: {
    path: '/forgot-password',
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  resetPassword: {
    path: '/reset-password',
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
};

export function getRouteConfig(path: string): RouteConfig | undefined {
  return Object.values(ROUTES).find(route => 
    path.startsWith(route.path) || route.path.startsWith(path)
  );
}

export function canAccessRoute(role: UserRole, path: string): boolean {
  const config = getRouteConfig(path);
  return config ? config.allowedRoles.includes(role) : false;
}

export function getRedirectPath(role: UserRole, isVerified: boolean, isOnboarded: boolean): string {
  if (!isVerified) return ROUTES.verifyEmail.path;
  if (!isOnboarded) {
    return role === 'business' ? ROUTES.businessOnboarding.path : ROUTES.customerOnboarding.path;
  }
  switch (role) {
    case 'admin':
      return ROUTES.adminDashboard.path;
    case 'business':
      return ROUTES.businessDashboard.path;
    case 'customer':
      return ROUTES.customerDashboard.path;
    default:
      return ROUTES.home.path;
  }
} 