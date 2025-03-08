/**
 * Session management service
 * Handles session creation, validation, and security
 */

import { AuditEventType, logAuditEvent } from '@/lib/security/audit-log';
import { Session } from '@supabase/supabase-js';
import { BaseServiceUtils } from '../BaseService';
import { supabaseClientService } from '../core/supabase-client.service';


export interface SessionData {
  id: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
  lastActiveAt: number;
  userAgent?: string | null;
  ipAddress?: string | null;
  isActive: boolean;
}

export interface SessionResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
  } | null;
}

/**
 * Service for managing user sessions
 * Follows the singleton pattern for consistent instance usage
 */
export class SessionService extends BaseServiceUtils {
  private static instance: SessionService;

  private constructor() {
    super();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  async getAuthSession(): Promise<Session | null> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      
      return data.session;
    });
  }

  async refreshSession(): Promise<Session | null> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return null;
      }
      
      return data.session;
    });
  }

  async signOut(): Promise<void> {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { error } = await client.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }
    });
  }

  /**
   * Create a new session
   * @param userId - The user ID to create a session for
   * @param expiresAt - When the session expires (timestamp)
   * @param options - Additional session options
   */
  async createSession(
    userId: string,
    expiresAt: number,
    options?: {
      userAgent?: string;
      ipAddress?: string;
    }
  ): Promise<SessionResponse<SessionData>> {
    try {
      const { data, error } = await supabaseClientService.executeWithRetry(async (client) => {
        const { data, error } = await client
          .from('sessions')
          .insert({
            user_id: userId,
            expires_at: new Date(expiresAt).toISOString(),
            user_agent: options?.userAgent,
            ip_address: options?.ipAddress,
            is_active: true
          })
          .select()
          .single();
          
        return { data, error };
      });

      if (error || !data) {
        return {
          data: null,
          error: {
            message: error?.message || 'Failed to create session',
            status: 500
          }
        };
      }

      // Log the session creation
      await this.logEvent('session.created', {
        success: true, 
        session_id: data.id,
        expires_at: new Date(data.expires_at).toISOString()
      });

      return {
        data: {
          id: data.id,
          userId: data.user_id,
          expiresAt: new Date(data.expires_at).getTime(),
          createdAt: new Date(data.created_at).getTime(),
          lastActiveAt: new Date(data.last_active_at).getTime(),
          userAgent: data.user_agent,
          ipAddress: data.ip_address,
          isActive: data.is_active
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to create session',
          status: 500
        }
      };
    }
  }
  
  /**
   * Get all active sessions for a user
   * @param userId - The user ID to get sessions for
   */
  async getUserSessions(userId: string): Promise<SessionResponse<SessionData[]>> {
    try {
      const { data, error } = await supabaseClientService.executeWithRetry(async (client) => {
        const { data, error } = await client
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        return { data, error };
      });
      
      if (error || !data) {
        return {
          data: null,
          error: {
            message: error?.message || 'Failed to get user sessions',
            status: 500
          }
        };
      }
      
      const sessions = data.map((session: {
        id: string;
        user_id: string;
        expires_at: string;
        created_at: string;
        last_active_at: string;
        user_agent?: string;
        ip_address?: string;
        is_active: boolean;
      }) => ({
        id: session.id,
        userId: session.user_id,
        expiresAt: new Date(session.expires_at).getTime(),
        createdAt: new Date(session.created_at).getTime(),
        lastActiveAt: new Date(session.last_active_at).getTime(),
        userAgent: session.user_agent,
        ipAddress: session.ip_address,
        isActive: session.is_active
      }));
      
      return {
        data: sessions,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get user sessions',
          status: 500
        }
      };
    }
  }
  
  /**
   * Update a session's last active time
   * @param sessionId - The session ID to update
   */
  async updateSessionActivity(sessionId: string): Promise<SessionResponse<SessionData>> {
    try {
      const { data, error } = await supabaseClientService.executeWithRetry(async (client) => {
        const { data, error } = await client
          .from('sessions')
          .update({
            last_active_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select()
          .single();
          
        return { data, error };
      });
      
      if (error || !data) {
        return {
          data: null,
          error: {
            message: error?.message || 'Failed to update session activity',
            status: 500
          }
        };
      }
      
      return {
        data: {
          id: data.id,
          userId: data.user_id,
          expiresAt: new Date(data.expires_at).getTime(),
          createdAt: new Date(data.created_at).getTime(),
          lastActiveAt: new Date(data.last_active_at).getTime(),
          userAgent: data.user_agent,
          ipAddress: data.ip_address,
          isActive: data.is_active
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to update session activity',
          status: 500
        }
      };
    }
  }
  
  /**
   * Invalidate a session
   * @param sessionId - The session ID to invalidate
   */
  async invalidateSession(sessionId: string): Promise<SessionResponse<null>> {
    try {
      const { data: sessionData } = await this.getSessionById(sessionId);
      const userId = sessionData?.userId;
      
      const { error } = await supabaseClientService.executeWithRetry(async (client) => {
        const { error } = await client
          .from('sessions')
          .update({
            is_active: false
          })
          .eq('id', sessionId);
          
        return { error };
      });
      
      if (error) {
        if (userId) {
          await logAuditEvent({
            event_type: AuditEventType.SESSION_INVALIDATE,
            user_id: userId,
            details: { success: false, reason: error.message, session_id: sessionId }
          });
        }
        
        return {
          data: null,
          error: {
            message: error.message,
            status: 500
          }
        };
      }
      
      if (userId) {
        await logAuditEvent({
          event_type: AuditEventType.SESSION_INVALIDATE,
          user_id: userId,
          details: { success: true, session_id: sessionId }
        });
      }
      
      return {
        data: null,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to invalidate session',
          status: 500
        }
      };
    }
  }
  
  /**
   * Invalidate all sessions for a user except the current one
   * @param userId - The user ID to invalidate sessions for
   * @param currentSessionId - The current session ID to keep active
   */
  async invalidateOtherSessions(
    userId: string,
    currentSessionId: string
  ): Promise<SessionResponse<null>> {
    try {
      const { error } = await supabaseClientService.executeWithRetry(async (client) => {
        const { error } = await client
          .from('sessions')
          .update({
            is_active: false
          })
          .eq('user_id', userId)
          .neq('id', currentSessionId);
          
        return { error };
      });
      
      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            status: 500
          }
        };
      }
      
      return {
        data: null,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to invalidate other sessions',
          status: 500
        }
      };
    }
  }
  
  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<SessionResponse<null>> {
    try {
      const now = new Date().toISOString();
      
      const { data: expiredSessions, error: fetchError } = await supabaseClientService.executeWithRetry(async (client) => {
        const { data, error } = await client
          .from('sessions')
          .select('id, user_id')
          .eq('is_active', true)
          .lt('expires_at', now);
          
        return { data, error };
      });
        
      if (fetchError || !expiredSessions || expiredSessions.length === 0) {
        return {
          data: null,
          error: fetchError ? {
            message: fetchError.message || 'Failed to fetch expired sessions',
            status: 500
          } : null
        };
      }
      
      const { error } = await supabaseClientService.executeWithRetry(async (client) => {
        const { error } = await client
          .from('sessions')
          .update({
            is_active: false
          })
          .in('id', expiredSessions.map((s: { id: string }) => s.id));
          
        return { error };
      });
      
      if (error) {
        return {
          data: null,
          error: {
            message: error.message || 'Failed to cleanup expired sessions',
            status: 500
          }
        };
      }
      
      return {
        data: null,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to cleanup expired sessions',
          status: 500
        }
      };
    }
  }

  /**
   * Get a session by ID
   */
  async getSessionById(sessionId: string): Promise<SessionResponse<SessionData>> {
    try {
      const { data, error } = await supabaseClientService.executeWithRetry(async (client) => {
        const { data, error } = await client
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
          
        return { data, error };
      });

      if (error || !data) {
        return {
          data: null,
          error: {
            message: error?.message || 'Failed to get session',
            status: 500
          }
        };
      }

      return {
        data: {
          id: data.id,
          userId: data.user_id,
          expiresAt: new Date(data.expires_at).getTime(),
          createdAt: new Date(data.created_at).getTime(),
          lastActiveAt: new Date(data.last_active_at).getTime(),
          userAgent: data.user_agent,
          ipAddress: data.ip_address,
          isActive: data.is_active
        },
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.message || 'Failed to get session',
          status: 500
        }
      };
    }
  }

  // Add a logEvent method to the SessionService class
  private async logEvent(eventType: string, details: any): Promise<void> {
    try {
      await supabaseClientService.executeWithRetry(async (client) => {
        const { error } = await client
          .from('audit_logs')
          .insert({
            event_type: eventType,
            details,
            user_id: details.user_id || null
          });
        
        if (error) {
          console.error('Error logging event:', error);
        }
      });
    } catch (error) {
      console.error('Error in logEvent:', error);
    }
  }
}

export const sessionService = SessionService.getInstance(); 