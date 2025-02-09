// Environment Types
type Environment = 'development' | 'test' | 'production';
type AppEnvironment = 'development' | 'staging' | 'production';

// Required environment variables by category
const requiredEnvVars = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
    storageUrl: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL,
  },
  // Email
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
  },
} as const;

// Optional environment variables by category
const optionalEnvVars = {
  // Environment settings
  environment: {
    nodeEnv: (process.env.NODE_ENV || 'development') as Environment,
    appEnv: (process.env.NEXT_PUBLIC_APP_ENV || 'development') as AppEnvironment,
    isVercel: !!process.env.VERCEL, // Convert to boolean using double negation
  },
  // Feature flags
  features: {
    enableEmailVerification: true,
    enableOAuth: true,
    enableStorageUpload: true,
  },
} as const;

type RequiredEnvVars = typeof requiredEnvVars;
type OptionalEnvVars = typeof optionalEnvVars;

// Validate and transform environment variables
function validateAndTransformEnv(): typeof requiredEnvVars & typeof optionalEnvVars {
  const missingVars: string[] = [];
  const validatedVars = { ...optionalEnvVars } as any;

  // Validate required variables by category
  Object.entries(requiredEnvVars).forEach(([category, vars]) => {
    validatedVars[category] = {};
    Object.entries(vars).forEach(([key, value]) => {
      if (!value) {
        missingVars.push(`${category}.${key}`);
      } else {
        validatedVars[category][key] = value;
      }
    });
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join('\n')}`
    );
  }

  return validatedVars;
}

// Environment configuration object with runtime validation
export const ENV = {
  ...validateAndTransformEnv(),
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

// Type for environment variables
export type Env = typeof ENV;

// Get environment variable with type safety
export function getEnvVar<
  C extends keyof RequiredEnvVars,
  K extends keyof RequiredEnvVars[C]
>(category: C, key: K): NonNullable<RequiredEnvVars[C][K]>;
export function getEnvVar<
  C extends keyof OptionalEnvVars,
  K extends keyof OptionalEnvVars[C]
>(category: C, key: K): NonNullable<OptionalEnvVars[C][K]>;
export function getEnvVar(category: string, key: string): any {
  const value = (ENV as any)[category]?.[key];
  if (value === undefined || value === null) {
    throw new Error(`Environment variable ${category}.${key} is not defined`);
  }
  return value;
}

// Helper functions
export const isProduction = () => ENV.environment.nodeEnv === 'production';
export const isDevelopment = () => ENV.environment.nodeEnv === 'development';
export const isTest = () => ENV.environment.nodeEnv === 'test';
export const isVercel = () => ENV.environment.isVercel;

// Initialize and validate on import
validateAndTransformEnv(); 