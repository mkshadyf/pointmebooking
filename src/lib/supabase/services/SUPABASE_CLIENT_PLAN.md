# Supabase Client Singleton Implementation Plan

This document outlines the detailed plan for implementing a Supabase client singleton to replace the current direct exports and inconsistent usage patterns.

## Current State Analysis

### Current Implementation
- `src/lib/supabase/client.ts` exports a default `supabase` instance
- `src/lib/supabase/client/browser.ts` likely contains browser-specific client implementation
- `src/lib/supabase/client/server.ts` likely contains server-specific client implementation
- Services directly import and use the `supabase` instance
- Some code may create new instances using factory functions

### Issues with Current Approach
- Bypasses the singleton pattern established for services
- Inconsistent usage across the codebase
- No centralized error handling or retry logic
- Potential for multiple instances causing inefficiency
- No clear separation between browser and server usage

## Implementation Plan

### Step 1: Create SupabaseClientService Class

Create a new file `src/lib/supabase/services/supabase-client.service.ts` with the following structure:

```typescript
import { Database } from '@/types/database/generated.types';
import { BaseServiceUtils } from './BaseService';
import { createBrowserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { CookieContainer } from '@/lib/supabase/client';

/**
 * Singleton service for managing Supabase client instances
 * Provides centralized error handling and retry logic
 */
export class SupabaseClientService extends BaseServiceUtils {
  private static instance: SupabaseClientService;
  private browserClient: SupabaseClient<Database> | null = null;
  private serverClients: Map<string, SupabaseClient<Database>> = new Map();
  
  private constructor() {
    super();
  }
  
  public static getInstance(): SupabaseClientService {
    if (!SupabaseClientService.instance) {
      SupabaseClientService.instance = new SupabaseClientService();
    }
    return SupabaseClientService.instance;
  }
  
  /**
   * Get a Supabase client for browser environments
   * Creates a new client if one doesn't exist
   */
  public getBrowserClient(): SupabaseClient<Database> {
    if (!this.browserClient) {
      this.browserClient = createBrowserSupabaseClient();
    }
    return this.browserClient;
  }
  
  /**
   * Get a Supabase client for server environments
   * @param cookieStore The cookie store from the request
   * @param cacheKey Optional key for caching the client instance
   */
  public async getServerClient(
    cookieStore: CookieContainer,
    cacheKey?: string
  ): Promise<SupabaseClient<Database>> {
    const key = cacheKey || this.getCookieStoreKey(cookieStore);
    
    if (!this.serverClients.has(key)) {
      const client = await createServerSupabaseClient(cookieStore);
      this.serverClients.set(key, client);
    }
    
    return this.serverClients.get(key)!;
  }
  
  /**
   * Get a client for the current environment
   * Automatically determines whether to use browser or server client
   * @throws Error if called in a server context without cookies
   */
  public async getClient(): Promise<SupabaseClient<Database>> {
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      return this.getBrowserClient();
    } else {
      throw new Error(
        'getClient was called in a server context without cookies. ' +
        'Use getServerClient with cookies instead.'
      );
    }
  }
  
  /**
   * Clear all cached clients
   * Useful for testing or when auth state changes
   */
  public clearClients(): void {
    this.browserClient = null;
    this.serverClients.clear();
  }
  
  /**
   * Generate a unique key for a cookie store
   * Used for caching server clients
   */
  private getCookieStoreKey(cookieStore: CookieContainer): string {
    // Implementation depends on the structure of cookieStore
    // This is a simple example that may need to be adjusted
    const authCookie = cookieStore.get('supabase.auth.token');
    return authCookie ? 'auth' : 'anon';
  }
  
  /**
   * Execute a Supabase operation with retry logic
   * @param operation The operation to execute
   * @param options Retry options
   */
  public async executeWithRetry<T>(
    operation: (client: SupabaseClient<Database>) => Promise<T>,
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
      retryDelay = 1000,
      context = 'SupabaseClient',
      useServerClient = false,
      cookieStore
    } = options;
    
    let client: SupabaseClient<Database>;
    
    if (useServerClient && cookieStore) {
      client = await this.getServerClient(cookieStore);
    } else {
      client = await this.getClient();
    }
    
    return this.withRetry(
      () => operation(client),
      { maxRetries, retryDelay, context }
    );
  }
}

// Export the singleton instance
export const supabaseClientService = SupabaseClientService.getInstance();

// Static wrapper for backward compatibility
export class SupabaseClientServiceStatic {
  public static async getBrowserClient(): Promise<SupabaseClient<Database>> {
    return supabaseClientService.getBrowserClient();
  }
  
  public static async getServerClient(
    cookieStore: CookieContainer,
    cacheKey?: string
  ): Promise<SupabaseClient<Database>> {
    return supabaseClientService.getServerClient(cookieStore, cacheKey);
  }
  
  public static async getClient(): Promise<SupabaseClient<Database>> {
    return supabaseClientService.getClient();
  }
  
  public static async executeWithRetry<T>(
    operation: (client: SupabaseClient<Database>) => Promise<T>,
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
```

### Step 2: Update Client Exports

Update `src/lib/supabase/client.ts` to export the singleton:

```typescript
import { supabaseClientService, SupabaseClientServiceStatic } from './services/supabase-client.service';

// Re-export the types and factory functions for internal use
export * from './client/browser';
export * from './client/server';
export type { CookieContainer } from './client/server';

/**
 * @deprecated Import from '@/lib/supabase/services/supabase-client.service' instead.
 * This will be removed in a future version.
 */
export const supabase = supabaseClientService.getClient();

/**
 * @deprecated Use supabaseClientService.getBrowserClient() instead.
 * This will be removed in a future version.
 */
export const createBrowserClient = SupabaseClientServiceStatic.getBrowserClient;

/**
 * @deprecated Use supabaseClientService.getServerClient() instead.
 * This will be removed in a future version.
 */
export const createServerClient = SupabaseClientServiceStatic.getServerClient;

// Export the singleton service as the preferred way to get a client
export { supabaseClientService, SupabaseClientServiceStatic };
```

### Step 3: Update Service Implementations

For each service that uses the direct `supabase` import, update to use the singleton:

#### Example: Updating AuthService

```typescript
// Before
import { supabase } from '@/lib/supabase/client';

// After
import { supabaseClientService } from '@/lib/supabase/services/supabase-client.service';

// In methods
// Before
const { data, error } = await supabase.auth.signIn({ email, password });

// After
const client = await supabaseClientService.getClient();
const { data, error } = await client.auth.signIn({ email, password });

// Or with retry logic
const { data, error } = await supabaseClientService.executeWithRetry(
  async (client) => client.auth.signIn({ email, password }),
  { context: 'AuthService.login' }
);
```

### Step 4: Update Server Components and API Routes

For server components and API routes that use Supabase:

```typescript
// Before
import { createServerSupabaseClient } from '@/lib/supabase/client';

export async function getServerSideProps({ req, res }) {
  const supabase = createServerSupabaseClient({ req, res });
  // ...
}

// After
import { supabaseClientService } from '@/lib/supabase/services/supabase-client.service';

export async function getServerSideProps({ req, res }) {
  const cookieStore = req.cookies;
  const supabase = await supabaseClientService.getServerClient(cookieStore);
  // ...
}
```

### Step 5: Update Middleware

Update `src/middleware.ts` to use the singleton:

```typescript
// Before
import { createServerSupabaseClient } from '@/lib/supabase/client';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createServerSupabaseClient({ req, res });
  // ...
}

// After
import { supabaseClientService } from '@/lib/supabase/services/supabase-client.service';

export async function middleware(req) {
  const res = NextResponse.next();
  const cookieStore = req.cookies;
  const supabase = await supabaseClientService.getServerClient(cookieStore);
  // ...
}
```

## Testing Plan

### Unit Tests
- Test singleton instance creation
- Test browser client retrieval
- Test server client retrieval with different cookie stores
- Test retry logic with simulated failures

### Integration Tests
- Test authentication flows using the singleton
- Test data retrieval operations
- Test error handling and retries in real scenarios

### Component Tests
- Test components that use Supabase client
- Ensure they work with the new singleton implementation

## Migration Strategy

### Phase 1: Implementation and Internal Testing
- Implement the singleton service
- Update a few key services as a proof of concept
- Test thoroughly in development environment

### Phase 2: Gradual Rollout
- Update remaining services one by one
- Test each service after update
- Monitor for any issues

### Phase 3: Complete Migration
- Update all remaining code
- Remove deprecated exports
- Update documentation

## Rollback Plan

If issues are encountered:
1. Revert to direct imports temporarily
2. Fix issues in the singleton implementation
3. Try again with the fixed implementation

## Success Criteria

- All services use the singleton pattern for Supabase client access
- No direct imports of `supabase` from `src/lib/supabase/client.ts`
- Consistent error handling and retry logic across all Supabase operations
- No regression in functionality
- Improved performance metrics 