/**
 * Audit Logging Utility
 * 
 * This module provides functionality for logging authentication events
 * and security-related actions for audit purposes.
 */

import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';

/**
 * Audit event types
 */
export enum AuditEventType {
  // Authentication events
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  REGISTER = 'auth.register',
  PASSWORD_RESET_REQUEST = 'auth.password.reset.request',
  PASSWORD_RESET_COMPLETE = 'auth.password.reset.complete',
  PASSWORD_CHANGE = 'auth.password.change',
  EMAIL_VERIFICATION = 'auth.email.verification',
  
  // Session events
  SESSION_CREATE = 'session.create',
  SESSION_EXPIRE = 'session.expire',
  SESSION_INVALIDATE = 'session.invalidate',
  
  // Two-factor authentication events
  TWO_FACTOR_SETUP = 'auth.2fa.setup',
  TWO_FACTOR_ENABLE = 'auth.2fa.enable',
  TWO_FACTOR_DISABLE = 'auth.2fa.disable',
  TWO_FACTOR_VERIFY = 'auth.2fa.verify',
  
  // Account events
  ACCOUNT_LOCK = 'account.lock',
  ACCOUNT_UNLOCK = 'account.unlock',
  
  // Profile events
  PROFILE_UPDATE = 'profile.update',
  
  // Permission events
  PERMISSION_CHANGE = 'permission.change',
  
  // Admin events
  ADMIN_ACTION = 'admin.action'
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id?: string;
  event_type: AuditEventType;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  created_at?: string;
}

/**
 * Log an audit event
 * @param event - The audit event to log
 * @returns Whether the event was logged successfully
 */
export async function logAuditEvent(event: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<boolean> {
  try {
    // Add client information if available
    if (typeof window !== 'undefined') {
      event.user_agent = event.user_agent || window.navigator.userAgent;
    }
    
    const client = await supabaseClientService.getClient();
    const { error } = await client
      .from('audit_logs')
      .insert([{
        event_type: event.event_type,
        user_id: event.user_id,
        ip_address: event.ip_address,
        user_agent: event.user_agent,
        details: event.details,
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Failed to log audit event:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error logging audit event:', error);
    return false;
  }
}

/**
 * Get audit logs for a specific user
 * @param userId - The user ID to get logs for
 * @param limit - Maximum number of logs to return
 * @param offset - Offset for pagination
 * @returns Audit log entries
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogEntry[]> {
  try {
    const client = await supabaseClientService.getClient();
    const { data, error } = await client
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Failed to get user audit logs:', error);
      return [];
    }
    
    return data as AuditLogEntry[];
  } catch (error) {
    console.error('Error getting user audit logs:', error);
    return [];
  }
}

/**
 * Get all audit logs (admin only)
 * @param filters - Optional filters for the logs
 * @param limit - Maximum number of logs to return
 * @param offset - Offset for pagination
 * @returns Audit log entries
 */
export async function getAllAuditLogs(
  filters?: {
    eventType?: AuditEventType;
    userId?: string;
    startDate?: string;
    endDate?: string;
  },
  limit: number = 100,
  offset: number = 0
): Promise<AuditLogEntry[]> {
  try {
    const client = await supabaseClientService.getClient();
    let query = client
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
    
    return data as AuditLogEntry[];
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

/**
 * Get count of audit logs (admin only)
 * @param filters - Optional filters for the logs
 * @returns Count of audit logs
 */
export async function getAuditLogsCount(
  filters?: {
    eventType?: AuditEventType;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<number> {
  try {
    const client = await supabaseClientService.getClient();
    let query = client
      .from('audit_logs')
      .select('id', { count: 'exact' });
    
    // Apply filters if provided
    if (filters) {
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
    }
    
    const { count, error } = await query;
    
    if (error) {
      console.error('Failed to get audit logs count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error getting audit logs count:', error);
    return 0;
  }
} 