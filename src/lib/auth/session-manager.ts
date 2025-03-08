/**
 * Session Manager
 * 
 * This module provides utilities for managing user sessions,
 * including session refresh, expiration handling, and auto-save functionality.
 */

import { logError } from '@/lib/error/error-logger';
import { tryCatch } from '@/lib/error/try-catch';
import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { Session } from '@supabase/supabase-js';

// Session refresh interval (15 minutes)
const SESSION_REFRESH_INTERVAL = 15 * 60 * 1000;

// Session expiration warning threshold (5 minutes before expiration)
const SESSION_EXPIRATION_WARNING = 5 * 60 * 1000;

/**
 * Session Manager Class
 * Handles session refresh and expiration
 */
export class SessionManager {
  private static instance: SessionManager;
  private refreshInterval: NodeJS.Timeout | null = null;
  private expirationWarningTimeout: NodeJS.Timeout | null = null;
  private sessionExpirationListeners: Array<() => void> = [];
  private sessionRefreshListeners: Array<() => void> = [];
  
  private constructor() {}
  
  /**
   * Get the singleton instance of SessionManager
   */
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }
  
  /**
   * Start session monitoring
   * @param expiresAt - Session expiration timestamp
   */
  public startSessionMonitoring(expiresAt?: string): void {
    this.stopSessionMonitoring();
    
    // Start regular session refresh
    this.refreshInterval = setInterval(() => {
      this.refreshSession();
    }, SESSION_REFRESH_INTERVAL);
    
    // Set expiration warning if we have an expiration time
    if (expiresAt) {
      const expirationTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const timeUntilExpiration = expirationTime - now;
      
      if (timeUntilExpiration > SESSION_EXPIRATION_WARNING) {
        const warningTime = timeUntilExpiration - SESSION_EXPIRATION_WARNING;
        this.expirationWarningTimeout = setTimeout(() => {
          this.notifySessionExpiringSoon();
        }, warningTime);
      }
    }
  }
  
  /**
   * Stop session monitoring
   */
  public stopSessionMonitoring(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    
    if (this.expirationWarningTimeout) {
      clearTimeout(this.expirationWarningTimeout);
      this.expirationWarningTimeout = null;
    }
  }
  
  /**
   * Refresh the current session
   */
  public async refreshSession(): Promise<void> {
    const { data, error } = await tryCatch(async () => {
      const client = await supabaseClientService.getBrowserClient();
      return client.auth.refreshSession();
    });
    
    if (error) {
      await logError(error, undefined, { action: 'refreshSession' });
    } else if (data?.data?.session) {
      // Notify listeners that session was refreshed
      this.notifySessionRefreshed();
      
      // Update monitoring with new expiration
      const session = data.data.session as Session;
      if (session.expires_at) {
        // Convert to ISO string if it's a number (timestamp)
        const expiresAtString = typeof session.expires_at === 'number' 
          ? new Date(session.expires_at * 1000).toISOString() 
          : session.expires_at;
        
        this.startSessionMonitoring(expiresAtString);
      }
    }
  }
  
  /**
   * Add a listener for session expiration warnings
   * @param listener - Function to call when session is about to expire
   */
  public onSessionExpiringSoon(listener: () => void): () => void {
    this.sessionExpirationListeners.push(listener);
    
    // Return a function to remove the listener
    return () => {
      this.sessionExpirationListeners = this.sessionExpirationListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Add a listener for session refresh events
   * @param listener - Function to call when session is refreshed
   */
  public onSessionRefreshed(listener: () => void): () => void {
    this.sessionRefreshListeners.push(listener);
    
    // Return a function to remove the listener
    return () => {
      this.sessionRefreshListeners = this.sessionRefreshListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all listeners that the session is about to expire
   */
  private notifySessionExpiringSoon(): void {
    this.sessionExpirationListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in session expiration listener:', error);
      }
    });
  }
  
  /**
   * Notify all listeners that the session was refreshed
   */
  private notifySessionRefreshed(): void {
    this.sessionRefreshListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in session refresh listener:', error);
      }
    });
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();

// Helper function to start session monitoring
export function startSessionMonitoring(expiresAt?: string): void {
  sessionManager.startSessionMonitoring(expiresAt);
}

// Helper function to refresh the session
export function refreshSession(): Promise<void> {
  return sessionManager.refreshSession();
} 