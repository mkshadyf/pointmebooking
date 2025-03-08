/**
 * PointMe Routes
 * 
 * This file is the single source of truth for all route-related constants and functions.
 * It consolidates both path definitions and route configurations in one place.
 * 
 * Key exports:
 * - ROUTES: Object containing route paths with their configurations
 * - Route utility functions for access control and redirection
 * - Navigation configurations for UI components
 */

import { UserRole } from '@/types';

// -----------------------------------------------------------------------------
// Route Types and Interfaces
// -----------------------------------------------------------------------------

/**
 * Configuration for each route including access control
 */
export interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
  requiresAuth: boolean;
  requiresVerification: boolean;
  requiresOnboarding: boolean;
}

/**
 * Type for navigation items in UI components
 */
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
}

// -----------------------------------------------------------------------------
// Route Path Constants
// -----------------------------------------------------------------------------

/**
 * Public routes - accessible without authentication
 */
export const PUBLIC_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  SERVICES: '/services',
  BUSINESSES: '/businesses',
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
} as const;

/**
 * Protected routes - require authentication
 */
export const PROTECTED_PATHS = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Dashboard routes
  DASHBOARD: '/dashboard',
  CUSTOMER_DASHBOARD: '/dashboard/customer',
  BUSINESS_DASHBOARD: '/dashboard/business',
  ADMIN_DASHBOARD: '/dashboard/admin',
  
  // Onboarding routes
  CUSTOMER_ONBOARDING: '/onboarding/customer',
  BUSINESS_ONBOARDING: '/onboarding/business',
  
  // Dashboard sub-routes
  CUSTOMER_APPOINTMENTS: '/dashboard/customer/appointments',
  CUSTOMER_FAVORITES: '/dashboard/customer/favorites',
  CUSTOMER_SETTINGS: '/dashboard/customer/settings',
} as const;

/**
 * Dynamic routes - functions that generate paths with parameters
 */
export const DYNAMIC_ROUTES = {
  SERVICE_DETAILS: (id: string) => `/services/${id}`,
  BUSINESS_DETAILS: (id: string) => `/businesses/${id}`,
  BOOKING_DETAILS: (id: string) => `/bookings/${id}`,
} as const;

// -----------------------------------------------------------------------------
// Route Configurations
// -----------------------------------------------------------------------------

/**
 * Complete route configurations with access control settings
 */
export const ROUTES: Record<string, RouteConfig> = {
  // Public routes
  home: {
    path: PUBLIC_PATHS.HOME,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  services: {
    path: PUBLIC_PATHS.SERVICES,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  login: {
    path: PUBLIC_PATHS.LOGIN,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  register: {
    path: PUBLIC_PATHS.REGISTER,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  forgotPassword: {
    path: PUBLIC_PATHS.FORGOT_PASSWORD,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  resetPassword: {
    path: PUBLIC_PATHS.RESET_PASSWORD,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  verifyEmail: {
    path: '/auth/verify-email', // Note: Different from PUBLIC_PATHS.VERIFY_EMAIL
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: true,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  about: {
    path: PUBLIC_PATHS.ABOUT,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  contact: {
    path: PUBLIC_PATHS.CONTACT,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  terms: {
    path: PUBLIC_PATHS.TERMS,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  businesses: {
    path: PUBLIC_PATHS.BUSINESSES,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: false,
    requiresVerification: false,
    requiresOnboarding: false,
  },
  
  // Protected routes
  profile: {
    path: PROTECTED_PATHS.PROFILE,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  settings: {
    path: PROTECTED_PATHS.SETTINGS,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  
  // Dashboard routes
  dashboard: {
    path: PROTECTED_PATHS.DASHBOARD,
    allowedRoles: ['customer', 'business', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  customerDashboard: {
    path: PROTECTED_PATHS.CUSTOMER_DASHBOARD,
    allowedRoles: ['customer', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  customerAppointments: {
    path: PROTECTED_PATHS.CUSTOMER_APPOINTMENTS,
    allowedRoles: ['customer', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  customerFavorites: {
    path: PROTECTED_PATHS.CUSTOMER_FAVORITES,
    allowedRoles: ['customer', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  customerSettings: {
    path: PROTECTED_PATHS.CUSTOMER_SETTINGS,
    allowedRoles: ['customer', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  businessDashboard: {
    path: PROTECTED_PATHS.BUSINESS_DASHBOARD,
    allowedRoles: ['business', 'admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: true,
  },
  adminDashboard: {
    path: PROTECTED_PATHS.ADMIN_DASHBOARD,
    allowedRoles: ['admin'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: false,
  },
  
  // Onboarding routes
  customerOnboarding: {
    path: PROTECTED_PATHS.CUSTOMER_ONBOARDING,
    allowedRoles: ['customer'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: false,
  },
  businessOnboarding: {
    path: PROTECTED_PATHS.BUSINESS_ONBOARDING,
    allowedRoles: ['business'],
    requiresAuth: true,
    requiresVerification: true,
    requiresOnboarding: false,
  },
};

// -----------------------------------------------------------------------------
// Route Groups
// -----------------------------------------------------------------------------

/**
 * Route groupings for various purposes
 */
export const ROUTE_GROUPS = {
  AUTH: [
    PUBLIC_PATHS.LOGIN,
    PUBLIC_PATHS.REGISTER,
    PUBLIC_PATHS.FORGOT_PASSWORD,
    PUBLIC_PATHS.RESET_PASSWORD,
    PUBLIC_PATHS.VERIFY_EMAIL,
  ],
  PUBLIC: Object.values(PUBLIC_PATHS),
  DASHBOARD: [
    PROTECTED_PATHS.DASHBOARD,
    PROTECTED_PATHS.CUSTOMER_DASHBOARD,
    PROTECTED_PATHS.BUSINESS_DASHBOARD,
    PROTECTED_PATHS.ADMIN_DASHBOARD,
  ],
} as const;

// -----------------------------------------------------------------------------
// Navigation Configurations
// -----------------------------------------------------------------------------

/**
 * Navigation configurations for UI components
 */
export const NAVIGATION = {
  MAIN: [
    { name: 'Home', href: PUBLIC_PATHS.HOME },
    { name: 'Services', href: PUBLIC_PATHS.SERVICES },
    { name: 'Businesses', href: PUBLIC_PATHS.BUSINESSES },
    { name: 'About', href: PUBLIC_PATHS.ABOUT },
    { name: 'Contact', href: PUBLIC_PATHS.CONTACT },
  ],
  BUSINESS_DASHBOARD: [
    { name: 'Overview', href: PROTECTED_PATHS.BUSINESS_DASHBOARD, icon: 'home' },
    { name: 'Bookings', href: `${PROTECTED_PATHS.BUSINESS_DASHBOARD}/appointments`, icon: 'calendar' },
    { name: 'Services', href: `${PROTECTED_PATHS.BUSINESS_DASHBOARD}/services`, icon: 'services' },
    { name: 'Analytics', href: `${PROTECTED_PATHS.BUSINESS_DASHBOARD}/analytics`, icon: 'chart' },
    { name: 'Settings', href: `${PROTECTED_PATHS.BUSINESS_DASHBOARD}/settings`, icon: 'settings' },
  ],
  CUSTOMER_DASHBOARD: [
    { name: 'Overview', href: PROTECTED_PATHS.CUSTOMER_DASHBOARD, icon: 'home' },
    { name: 'My Bookings', href: PROTECTED_PATHS.CUSTOMER_APPOINTMENTS, icon: 'calendar' },
    { name: 'Favorites', href: PROTECTED_PATHS.CUSTOMER_FAVORITES, icon: 'heart' },
    { name: 'Settings', href: PROTECTED_PATHS.CUSTOMER_SETTINGS, icon: 'settings' },
  ],
  FOOTER: [
    { name: 'Terms', href: PUBLIC_PATHS.TERMS },
    { name: 'Privacy', href: PUBLIC_PATHS.PRIVACY },
    { name: 'Contact', href: PUBLIC_PATHS.CONTACT },
  ],
  USER_MENU: [
    { name: 'Your Profile', href: (role: string) => `/dashboard/${role}` },
    { name: 'Settings', href: (role: string) => `/dashboard/${role}/settings` },
  ],
} as const;

// -----------------------------------------------------------------------------
// Route Utility Functions
// -----------------------------------------------------------------------------

/**
 * Get route configuration for a given path
 * @param path The path to get configuration for
 * @returns The route configuration if found, undefined otherwise
 */
export function getRouteConfig(path: string): RouteConfig | undefined {
  return Object.values(ROUTES).find(route => 
    path.startsWith(route.path) || route.path.startsWith(path)
  );
}

/**
 * Check if a user with the given role can access a route
 * @param role The user's role
 * @param path The path to check access for
 * @returns Whether the user can access the route
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  const config = getRouteConfig(path);
  return config ? config.allowedRoles.includes(role) : false;
}

/**
 * Get the appropriate redirect path based on user state
 * @param role The user's role
 * @param isVerified Whether the user's email is verified
 * @param isOnboarded Whether the user has completed onboarding
 * @returns The path to redirect to
 */
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

/**
 * Check if a path corresponds to a protected route
 * @param path The path to check
 * @returns Whether the path is protected
 */
export function isProtectedRoute(path: string): boolean {
  const config = getRouteConfig(path);
  return config ? config.requiresAuth : false;
}

/**
 * Check if a user with the given role is authorized for a specific path
 * @param path The path to check
 * @param role The user's role
 * @returns Whether the user is authorized
 */
export function isRoleAuthorized(path: string, role: string): boolean {
  const config = getRouteConfig(path);
  return config ? config.allowedRoles.includes(role as UserRole) : false;
}

/**
 * Get the appropriate dashboard route for a user role
 * @param role The user's role
 * @returns The dashboard path for the role
 */
export function getRouteByRole(role: string): string {
  switch (role) {
    case 'customer':
      return PROTECTED_PATHS.CUSTOMER_DASHBOARD;
    case 'business':
      return PROTECTED_PATHS.BUSINESS_DASHBOARD;
    case 'admin':
      return PROTECTED_PATHS.ADMIN_DASHBOARD;
    default:
      return PROTECTED_PATHS.DASHBOARD;
  }
}

