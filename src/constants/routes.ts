// Public Routes
export const PUBLIC_ROUTES = {
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

// Protected Routes
export const PROTECTED_ROUTES = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Dynamic Routes
export const DYNAMIC_ROUTES = {
  SERVICE_DETAILS: (id: string) => `/services/${id}`,
  BUSINESS_DETAILS: (id: string) => `/businesses/${id}`,
  BOOKING_DETAILS: (id: string) => `/bookings/${id}`,
} as const;

// Route Groups
export const ROUTE_GROUPS = {
  AUTH: [
    PUBLIC_ROUTES.LOGIN,
    PUBLIC_ROUTES.REGISTER,
    PUBLIC_ROUTES.FORGOT_PASSWORD,
    PUBLIC_ROUTES.RESET_PASSWORD,
    PUBLIC_ROUTES.VERIFY_EMAIL,
  ],
  PUBLIC: Object.values(PUBLIC_ROUTES),
} as const;

// Navigation
export const NAVIGATION = {
  MAIN: [
    { name: 'Home', href: PUBLIC_ROUTES.HOME },
    { name: 'Services', href: PUBLIC_ROUTES.SERVICES },
    { name: 'Businesses', href: PUBLIC_ROUTES.BUSINESSES },
    { name: 'About', href: PUBLIC_ROUTES.ABOUT },
    { name: 'Contact', href: PUBLIC_ROUTES.CONTACT },
  ],
  FOOTER: [
    { name: 'Terms', href: PUBLIC_ROUTES.TERMS },
    { name: 'Privacy', href: PUBLIC_ROUTES.PRIVACY },
    { name: 'Contact', href: PUBLIC_ROUTES.CONTACT },
  ],
} as const; 