/**
 * Auth Service Test Suite
 * 
 * This file contains tests for the authService singleton and its methods.
 */
import { supabaseClientService } from '../../core/supabase-client.service';
import { authService } from '../auth.service';

// Mock the Supabase client service
jest.mock('../../core/supabase-client.service', () => ({
  supabaseClientService: {
    executeWithRetry: jest.fn(),
    getBrowserClient: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSession', () => {
    it('should return session when successful', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-id', email: 'test@example.com' } };
      (supabaseClientService.executeWithRetry as jest.Mock).mockImplementation(async (callback) => {
        return { data: mockSession, error: null };
      });

      // Act
      const result = await authService.getSession();

      // Assert
      expect(result.data).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(supabaseClientService.executeWithRetry).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
      // Arrange
      const mockError = { name: 'AuthError', message: 'Session error' };
      (supabaseClientService.executeWithRetry as jest.Mock).mockImplementation(async (callback) => {
        return { data: null, error: mockError };
      });

      // Act
      const result = await authService.getSession();

      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
      expect(supabaseClientService.executeWithRetry).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      // Arrange
      const mockSession = { user: { id: 'user-id', email: 'test@example.com' } };
      (supabaseClientService.executeWithRetry as jest.Mock).mockImplementation(async (callback) => {
        return { data: mockSession, error: null };
      });

      // Act
      const result = await authService.login({ email: 'test@example.com', password: 'password' });

      // Assert
      expect(result.data).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(supabaseClientService.executeWithRetry).toHaveBeenCalled();
    });

    it('should handle login errors correctly', async () => {
      // Arrange
      const mockError = { name: 'AuthError', message: 'Invalid credentials' };
      (supabaseClientService.executeWithRetry as jest.Mock).mockImplementation(async (callback) => {
        return { data: null, error: mockError };
      });

      // Act
      const result = await authService.login({ email: 'test@example.com', password: 'wrong-password' });

      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
      expect(supabaseClientService.executeWithRetry).toHaveBeenCalled();
    });
  });

  // Add more test cases for other methods
  describe('register', () => {
    // Todo: Add tests for register method
  });

  describe('logout', () => {
    // Todo: Add tests for logout method
  });

  describe('getProfile', () => {
    // Todo: Add tests for getProfile method
  });

  describe('updateProfile', () => {
    // Todo: Add tests for updateProfile method
  });

  describe('resetPassword', () => {
    // Todo: Add tests for resetPassword method
  });

  describe('verifyEmail', () => {
    // Todo: Add tests for verifyEmail method
  });

  describe('resendVerification', () => {
    // Todo: Add tests for resendVerification method
  });

  describe('refreshSession', () => {
    // Todo: Add tests for refreshSession method
  });

  describe('verifySessionIntegrity', () => {
    // Todo: Add tests for verifySessionIntegrity method
  });
}); 