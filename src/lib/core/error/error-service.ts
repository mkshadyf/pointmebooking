'use client';


// Import console logger for now - in a real implementation, you would import your error logger
const logError = (error: Error, context?: string) => {
  console.error(`[${context || 'Error'}]`, error);
  // In a real implementation, you would log to your error tracking service
};

export interface ErrorOptions {
  context?: string;
  showToast?: boolean;
  additionalData?: Record<string, any>;
}

export class ErrorService {
  /**
   * Handle an error with optional logging and toast notification
   */
  static handleError(error: unknown, options?: ErrorOptions): Error {
    // Normalize the error
    const normalizedError = this.normalizeError(error);
    
    // Add context to the error message if provided
    const context = options?.context || 'Application';
    
    // Log the error
    logError(normalizedError, context);
    
    // Return the normalized error
    return normalizedError;
  }

  /**
   * Create a standardized error object
   */
  static createError(message: string, options?: ErrorOptions): Error {
    const error = new Error(message);
    
    // Log the error if needed
    if (options) {
      this.handleError(error, options);
    }
    
    return error;
  }

  /**
   * Normalize any error type to an Error object
   */
  private static normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    try {
      return new Error(JSON.stringify(error));
    } catch {
      return new Error('Unknown error occurred');
    }
  }
}

// Helper functions
 