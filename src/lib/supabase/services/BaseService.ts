import { ServiceError } from '../types/errors';

// Need to implement proper error handling and validation
export class BaseService<T> {
  protected async handleError(error: unknown): Promise<never> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new ServiceError(errorMessage);
  }

  protected validate(data: unknown): asserts data is T {
    // Implement validation logic
  }
} 