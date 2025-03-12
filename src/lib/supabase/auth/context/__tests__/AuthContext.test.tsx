/**
 * AuthContext Test Suite
 * 
 * This file contains tests for the AuthContext provider and useAuth hook.
 */
import { act, render, renderHook, screen } from '@testing-library/react';
import React from 'react';
import { authService } from '../../../services/auth/auth.service';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the auth service
jest.mock('../../../services/auth/auth.service', () => ({
  authService: {
    getSession: jest.fn(),
    getProfile: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerification: jest.fn(),
    refreshSession: jest.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (authService.getSession as jest.Mock).mockResolvedValue({ data: null, error: null });
    (authService.getProfile as jest.Mock).mockResolvedValue({ data: null, error: null });
  });

  describe('AuthProvider', () => {
    it('should initialize with unauthenticated state', async () => {
      // Arrange
      (authService.getSession as jest.Mock).mockResolvedValue({ data: null, error: null });
      
      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Wait for the initialization to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Assert
      expect(screen.getByText('isAuthenticated: false')).toBeInTheDocument();
      expect(screen.getByText('isLoading: false')).toBeInTheDocument();
      expect(screen.getByText('user: null')).toBeInTheDocument();
      expect(authService.getSession).toHaveBeenCalled();
    });

    it('should initialize with authenticated state when session exists', async () => {
      // Arrange
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockSession = { user: mockUser };
      const mockProfile = { id: 'user-id', email: 'test@example.com', full_name: 'Test User' };
      
      (authService.getSession as jest.Mock).mockResolvedValue({ data: mockSession, error: null });
      (authService.getProfile as jest.Mock).mockResolvedValue({ data: mockProfile, error: null });
      
      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
      
      // Wait for the initialization to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Assert
      expect(screen.getByText('isAuthenticated: true')).toBeInTheDocument();
      expect(screen.getByText('isLoading: false')).toBeInTheDocument();
      expect(screen.getByText(`user: ${JSON.stringify(mockUser)}`)).toBeInTheDocument();
      expect(authService.getSession).toHaveBeenCalled();
      expect(authService.getProfile).toHaveBeenCalled();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside of AuthProvider', () => {
      // Suppress the expected error
      const originalError = console.error;
      console.error = jest.fn();
      
      // Act & Assert
      expect(() => {
        const { result } = renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      // Restore console.error
      console.error = originalError;
    });

    it('should provide auth methods', async () => {
      // Arrange
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      
      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Wait for the initialization to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      // Assert
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('signOut');
      expect(result.current).toHaveProperty('updateProfile');
      expect(result.current).toHaveProperty('refreshSession');
    });

    it('should call login method correctly', async () => {
      // Arrange
      (authService.login as jest.Mock).mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null });
      (authService.getProfile as jest.Mock).mockResolvedValue({ data: { id: 'user-id' }, error: null });
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
      );
      
      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Wait for the initialization to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password');
      });
      
      // Assert
      expect(authService.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    });
    
    // Add more tests for other methods
  });
});

// Helper component for testing
const TestComponent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  return (
    <div>
      <p>isAuthenticated: {isAuthenticated.toString()}</p>
      <p>isLoading: {isLoading.toString()}</p>
      <p>user: {JSON.stringify(user)}</p>
    </div>
  );
}; 