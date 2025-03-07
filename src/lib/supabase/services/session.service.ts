/**
 * Session management service
 * Handles session creation, validation, and security
 */

import { Database } from '@/types/database/generated.types';
import { BaseServiceUtils } from './BaseService';
import { supabaseClientService } from './core/supabase-client.service';


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
 */
export class SessionService extends BaseServiceUtils {
  private static instance: SessionService;
  
  private constructor() {
    super();
  }
  
  /**
   * Get the singleton instance of SessionService
   */
  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }
  
  /**
   * Create a new session
   * @param userId The user ID
   * @param metadata Optional metadata for the session
   * @returns The created session
   */
  async createSession(userId: string, metadata?: Record<string, any>) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('sessions')
        .insert({
          user_id: userId,
          metadata: metadata || {},
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          last_active_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    });
  }
  
  /**
   * Get a session by ID
   * @param sessionId The session ID
   * @returns The session or null if not found
   */
  async getSessionById(sessionId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    });
  }
  
  /**
   * Get all sessions for a user
   * @param userId The user ID
   * @returns List of sessions
   */
  async getSessionsByUser(userId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    });
  }
  
  /**
   * Update a session
   * @param sessionId The session ID
   * @param updates The updates to apply
   * @returns The updated session
   */
  async updateSession(sessionId: string, updates: Partial<Database['public']['Tables']['sessions']['Update']>) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('sessions')
        .update({
          ...updates,
          last_active_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    });
  }
  
  /**
   * Delete a session
   * @param sessionId The session ID
   * @returns True if successful
   */
  async deleteSession(sessionId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { error } = await client
        .from('sessions')
        .delete()
        .eq('id', sessionId);
        
      if (error) throw error;
      return true;
    });
  }
  
  /**
   * Delete all sessions for a user
   * @param userId The user ID
   * @returns True if successful
   */
  async deleteAllUserSessions(userId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { error } = await client
        .from('sessions')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
      return true;
    });
  }
  
  /**
   * Clean up expired sessions
   * @returns Number of deleted sessions
   */
  async cleanupExpiredSessions() {
    return supabaseClientService.executeWithRetry(async (client) => {
      // First get the expired sessions
      const { data: expiredSessions, error: fetchError } = await client
        .from('sessions')
        .select('id')
        .lt('expires_at', new Date().toISOString());
        
      if (fetchError) throw fetchError;
      
      if (!expiredSessions || expiredSessions.length === 0) {
        return 0;
      }
      
      // Then delete them
      const { error } = await client
        .from('sessions')
        .delete()
        .in('id', expiredSessions.map(s => s.id));
        
      if (error) throw error;
      return expiredSessions.length;
    });
  }
  
  /**
   * Update the last activity timestamp for a session
   * @param sessionId The session ID
   * @returns The updated session
   */
  async updateLastActivity(sessionId: string) {
    return supabaseClientService.executeWithRetry(async (client) => {
      const { data, error } = await client
        .from('sessions')
        .update({
          last_active_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }
}

// Export a singleton instance
export const sessionService = SessionService.getInstance();

// For backward compatibility, expose static methods
export class SessionServiceStatic extends BaseServiceUtils {
  static async createSession(userId: string, metadata?: Record<string, any>) {
    return sessionService.createSession(userId, metadata);
  }
  
  static async getSessionById(sessionId: string) {
    return sessionService.getSessionById(sessionId);
  }
  
  static async getSessionsByUser(userId: string) {
    return sessionService.getSessionsByUser(userId);
  }
  
  static async updateSession(sessionId: string, updates: Partial<Database['public']['Tables']['sessions']['Update']>) {
    return sessionService.updateSession(sessionId, updates);
  }
  
  static async deleteSession(sessionId: string) {
    return sessionService.deleteSession(sessionId);
  }
  
  static async deleteAllUserSessions(userId: string) {
    return sessionService.deleteAllUserSessions(userId);
  }
  
  static async cleanupExpiredSessions() {
    return sessionService.cleanupExpiredSessions();
  }
  
  static async updateLastActivity(sessionId: string) {
    return sessionService.updateLastActivity(sessionId);
  }
} 