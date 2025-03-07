import { Database } from '@/types/database/generated.types';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { cookies } from 'next/headers';

// Import from supabase packages
import * as supabaseSSR from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import process from 'process';

// Type for cookie containers that work with createServerSupabaseClient
export type CookieContainer = 
  | RequestCookies 
  | ReadonlyRequestCookies 
  | { get: (name: string) => { value?: string } | undefined }
  | { get: (name: string) => string | undefined };

// Define a type alias for our specific Supabase client type
type TypedSupabaseClient = ReturnType<typeof createClient<Database>>;

/**
 * Creates a Supabase client for browser contexts with session persistence
 * @returns A typed Supabase client for browser components
 */
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: true,
        storageKey: 'supabase.auth.token',
        storage: {
          getItem: (key: string): string | null => {
            const value = document.cookie
              .split('; ')
              .find((row) => row.startsWith(`${key}=`))
              ?.split('=')[1];
            return value || null;
          },
          setItem: (key, value) => {
            document.cookie = `${key}=${value}; path=/; max-age=31536000`;
          },
          removeItem: (key) => {
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          },
        },
      },
    }
  );
};

/**
 * Creates a Supabase client for server contexts
 * @param cookieStore The cookie store to use for auth
 * @returns A typed Supabase client for server components
 */
export const createServerSupabaseClient = (cookieStore: CookieContainer) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return supabaseSSR.createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string): string | null | undefined {
          const cookie = cookieStore.get(name);
          // Cookie from ReadonlyRequestCookies or RequestCookies
          if (cookie && typeof cookie === 'object' && 'value' in cookie) return cookie.value;
          // Cookie from a simple object with get method
          return cookie as string | undefined;
        },
        set() {
          // We don't need to set cookies in this context
        },
        remove() {
          // We don't need to remove cookies in this context
        },
      },
    }
  );
};

/**
 * Singleton service for managing Supabase clients
 */
export class SupabaseClientService {
  private static instance: SupabaseClientService;
  private browserClient: TypedSupabaseClient | null = null;
  private serverClients: Map<string, TypedSupabaseClient> = new Map();
  
  private constructor() {
    // Private constructor to enforce singleton pattern
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): SupabaseClientService {
    if (!SupabaseClientService.instance) {
      SupabaseClientService.instance = new SupabaseClientService();
    }
    return SupabaseClientService.instance;
  }
  
  /**
   * Get a Supabase client for browser contexts
   */
  public getBrowserClient(): TypedSupabaseClient {
    if (!this.browserClient) {
      this.browserClient = createBrowserClient() as unknown as TypedSupabaseClient;
    }
    return this.browserClient;
  }
  
  /**
   * Get a Supabase client for server contexts
   * @param cookieStore The cookie store to use for auth
   * @param cacheKey Optional key to cache the client
   */
  public async getServerClient(
    cookieStore: CookieContainer,
    cacheKey?: string
  ): Promise<TypedSupabaseClient> {
    const key = cacheKey || this.getCookieStoreKey(cookieStore);
    
    if (!this.serverClients.has(key)) {
      this.serverClients.set(key, createServerSupabaseClient(cookieStore) as unknown as TypedSupabaseClient);
    }
    
    return this.serverClients.get(key)!;
  }
  
  /**
   * Get a Supabase client based on the current context
   */
  public async getClient(): Promise<TypedSupabaseClient> {
    if (typeof window !== 'undefined') {
      return this.getBrowserClient();
    } else {
      // In server context, we need cookies
      const cookieStore = await cookies();
      return this.getServerClient(cookieStore);
    }
  }
  
  /**
   * Clear all cached clients
   */
  public clearClients(): void {
    this.browserClient = null;
    this.serverClients.clear();
  }
  
  /**
   * Get a unique key for a cookie store
   */
  private getCookieStoreKey(cookieStore: CookieContainer): string {
    // Use a simple hash of the cookie store object
    return JSON.stringify(cookieStore).slice(0, 50);
  }
  
  /**
   * Execute an operation with retry logic
   */
  public async executeWithRetry<T>(
    operation: (client: TypedSupabaseClient) => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      context?: string;
      useServerClient?: boolean;
      cookieStore?: CookieContainer;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 500,
      context = 'unknown',
      useServerClient = false,
      cookieStore,
    } = options;
    
    let client: TypedSupabaseClient;
    
    if (useServerClient && cookieStore) {
      client = await this.getServerClient(cookieStore);
    } else {
      client = await this.getClient();
    }
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation(client);
      } catch (error) {
        lastError = error as Error;
        console.error(`Error in ${context} (attempt ${attempt + 1}/${maxRetries}):`, error);
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }
    
    throw lastError || new Error(`Failed after ${maxRetries} attempts in ${context}`);
  }
}

// Create a singleton instance
export const supabaseClientService = SupabaseClientService.getInstance();

/**
 * Static methods for convenience
 */
export class SupabaseClientServiceStatic {
  public static async getBrowserClient(): Promise<TypedSupabaseClient> {
    return supabaseClientService.getBrowserClient();
  }
  
  public static async getServerClient(
    cookieStore: CookieContainer,
    cacheKey?: string
  ): Promise<TypedSupabaseClient> {
    return supabaseClientService.getServerClient(cookieStore, cacheKey);
  }
  
  public static async getClient(): Promise<TypedSupabaseClient> {
    return supabaseClientService.getClient();
  }
  
  public static async executeWithRetry<T>(
    operation: (client: TypedSupabaseClient) => Promise<T>,
    options?: {
      maxRetries?: number;
      retryDelay?: number;
      context?: string;
      useServerClient?: boolean;
      cookieStore?: CookieContainer;
    }
  ): Promise<T> {
    return supabaseClientService.executeWithRetry(operation, options);
  }
}

/**
 * Creates a Supabase client for server-side usage
 * @returns Supabase client instance
 */
export async function getSupabaseClient() {
  const cookieStore = await cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return supabaseSSR.createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get: (name: string) => {
          return cookieStore.get(name)?.value;
        },
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

/**
 * Creates a Supabase client for client-side usage
 * @returns Supabase client instance
 */
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient<Database>(supabaseUrl, supabaseKey);
}