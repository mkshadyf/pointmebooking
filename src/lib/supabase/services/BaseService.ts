import { Database } from '@generated.types';
import { SupabaseClient } from '@supabase/supabase-js';

type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Define a type for tables with an 'id' column
type TableWithId = {
  [K in TableName]: 'id' extends keyof Database['public']['Tables'][K]['Row'] ? K : never
}[TableName];

// Base utility class for retry logic that doesn't require a generic parameter
export class BaseServiceUtils {
  // Add retry mechanism for network operations
  public static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      shouldRetry?: (error: unknown) => boolean;
      context?: string;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      shouldRetry = (error) => this.isRetryableError(error),
      context = 'BaseService'
    } = options;

    let lastError: unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry if we've reached max retries or if the error isn't retryable
        if (attempt >= maxRetries || !shouldRetry(error)) {
          console.error(`[${context}] Operation failed after ${attempt + 1} attempts:`, error);
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
        console.warn(`[${context}] Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never be reached due to the throw in the loop, but TypeScript needs it
    throw lastError;
  }
  
  // Determine if an error is retryable
  private static isRetryableError(error: unknown): boolean {
    // Network errors are typically retryable
    if (error instanceof Error) {
      // Check for network-related error messages
      const networkErrorPatterns = [
        'network error',
        'timeout',
        'connection',
        'offline',
        'failed to fetch',
        'socket',
        'ECONNREFUSED',
        'ETIMEDOUT'
      ];
      
      const message = error.message.toLowerCase();
      if (networkErrorPatterns.some(pattern => message.includes(pattern))) {
        return true;
      }
      
      // Check for HTTP status codes that indicate retryable errors
      if ('status' in error && typeof error.status === 'number') {
        const status = error.status;
        // 408 Request Timeout, 429 Too Many Requests, 5xx Server Errors
        return status === 408 || status === 429 || (status >= 500 && status < 600);
      }
    }
    
    return false;
  }
}

export abstract class BaseService<T extends TableWithId> extends BaseServiceUtils {
  constructor(
    protected readonly client: SupabaseClient<Database>,
    protected readonly table: T
  ) {
    super();
  }

  protected async handleError(error: unknown): Promise<never> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(errorMessage);
  }

  async getAll(): Promise<Row<T>[]> {
    try {
      const { data, error } = await this.client
        .from(this.table)
        .select('*');

      if (error) throw error;
      return data as Row<T>[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getById(id: string): Promise<Row<T>> {
    try {
      // Using a type-safe approach for the id column
      const { data, error } = await this.client
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Row<T>;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async create(data: Insert<T>): Promise<Row<T>> {
    try {
      // Using a more type-safe approach
      const { data: created, error } = await this.client
        .from(this.table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return created as Row<T>;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async update(id: string, data: Update<T>): Promise<Row<T>> {
    try {
      // Using a more type-safe approach
      const { data: updated, error } = await this.client
        .from(this.table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Row<T>;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      // Using a more type-safe approach
      const { error } = await this.client
        .from(this.table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }

  protected async exists(id: string): Promise<boolean> {
    try {
      // Using a more type-safe approach
      const { count, error } = await this.client
        .from(this.table)
        .select('*', { count: 'exact', head: true })
        .eq('id', id);

      if (error) throw error;
      return (count ?? 0) > 0;
    } catch (error) {
      return this.handleError(error);
    }
  }
}