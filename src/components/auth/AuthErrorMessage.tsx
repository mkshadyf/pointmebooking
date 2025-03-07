import { AuthError } from '@/types/database/auth';
import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorSolution {
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface AuthErrorMessageProps {
  error: AuthError | null;
  className?: string;
}

/**
 * Maps error codes to user-friendly messages and recovery actions
 */
const getErrorSolution = (error: AuthError): ErrorSolution => {
  if (!error) {
    return { message: 'An unknown error occurred. Please try again.' };
  }

  // Extract error code from the error
  const errorCode = error.code || 'unknown';

  // Map error codes to user-friendly messages and recovery actions
  switch (errorCode) {
    case 'auth/invalid-credentials':
      return {
        message: 'The email or password you entered is incorrect.',
        action: {
          label: 'Forgot password?',
          href: '/reset-password',
        },
      };
    
    case 'auth/email-in-use':
      return {
        message: 'This email is already in use. Please try logging in instead.',
        action: {
          label: 'Log in',
          href: '/login',
        },
      };
    
    case 'auth/weak-password':
      return {
        message: 'Your password is too weak. Please choose a stronger password with at least 8 characters, including numbers and symbols.',
      };
    
    case 'auth/invalid-email':
      return {
        message: 'Please enter a valid email address.',
      };
    
    case 'auth/user-not-found':
      return {
        message: 'No account found with this email. Please check your email or sign up for a new account.',
        action: {
          label: 'Sign up',
          href: '/signup',
        },
      };
    
    case 'auth/too-many-requests':
      return {
        message: 'Too many unsuccessful attempts. Please try again later or reset your password.',
        action: {
          label: 'Reset password',
          href: '/reset-password',
        },
      };
    
    case 'auth/expired-session':
      return {
        message: 'Your session has expired. Please log in again.',
        action: {
          label: 'Log in',
          href: '/login',
        },
      };
    
    case 'auth/unauthorized':
      return {
        message: 'You are not authorized to perform this action. Please log in with the appropriate account.',
        action: {
          label: 'Log in',
          href: '/login',
        },
      };
    
    case 'auth/verification-failed':
      return {
        message: 'Email verification failed. Please try again or request a new verification email.',
        action: {
          label: 'Resend verification',
          href: '/verify-email',
        },
      };
    
    case 'auth/password-mismatch':
      return {
        message: 'Passwords do not match. Please make sure both passwords are the same.',
      };
    
    case 'auth/invalid-token':
      return {
        message: 'Invalid or expired token. Please request a new link.',
        action: {
          label: 'Request new link',
          href: '/reset-password',
        },
      };
    
    case 'auth/session-expired':
      return {
        message: 'Your session has expired. Please log in again.',
        action: {
          label: 'Log in',
          href: '/login',
        },
      };
    
    case 'network/offline':
      return {
        message: 'You appear to be offline. Please check your internet connection and try again.',
      };
    
    case 'network/timeout':
      return {
        message: 'The request timed out. Please try again.',
      };
    
    default:
      return {
        message: error.message || 'An unexpected error occurred. Please try again later.',
      };
  }
};

/**
 * Component for displaying user-friendly authentication error messages with recovery suggestions
 */
const AuthErrorMessage: React.FC<AuthErrorMessageProps> = ({ error, className = '' }) => {
  if (!error) return null;
  
  const solution = getErrorSolution(error);
  
  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{solution.message}</p>
          </div>
          {solution.action && (
            <div className="mt-4">
              {solution.action.href ? (
                <Link
                  to={solution.action.href}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  {solution.action.label} <span aria-hidden="true">&rarr;</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={solution.action.onClick}
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  {solution.action.label} <span aria-hidden="true">&rarr;</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthErrorMessage; 