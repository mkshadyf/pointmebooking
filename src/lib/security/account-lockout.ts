/**
 * Account Lockout Utility
 * 
 * This module provides functionality to lock accounts after multiple failed login attempts,
 * helping to prevent brute force attacks.
 */

import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';

// Constants
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// In-memory store for tracking failed attempts (should be replaced with Redis in production)
interface LockoutRecord {
  failedAttempts: number;
  lastFailedAttempt: number;
  lockedUntil: number | null;
}

const lockoutStore: Record<string, LockoutRecord> = {};

// In-memory cache of locked accounts for performance
const lockedAccounts = new Map<string, number>();

/**
 * Check if an account is locked
 * @param identifier - Email or username to check
 * @returns Whether the account is locked and when it will be unlocked
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  // Check in-memory cache first for performance
  if (lockedAccounts.has(userId)) {
    const lockedUntil = lockedAccounts.get(userId);
    if (lockedUntil && lockedUntil > Date.now()) {
      return true;
    } else {
      // Expired lockout, remove from memory
      lockedAccounts.delete(userId);
    }
  }
  
  // If not locked in memory, check database
  try {
    const client = await supabaseClientService.getClient();
    const { data, error } = await client
      .from('account_lockouts')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    const lockedUntil = data.locked_until ? new Date(data.locked_until).getTime() : 0;
    
    // If the lockout has expired, clear it from the database
    if (lockedUntil <= Date.now()) {
      const client = await supabaseClientService.getClient();
      await client
        .from('account_lockouts')
        .delete()
        .eq('user_id', userId);
      return false;
    }
    
    // Account is locked, cache in memory
    lockedAccounts.set(userId, lockedUntil);
    return true;
  } catch (error) {
    console.error('Error checking account lockout status:', error);
    return false;
  }
}

/**
 * Record a failed login attempt
 * @param identifier - Email or username that failed login
 * @returns Whether the account is now locked and when it will be unlocked
 */
export async function recordFailedLoginAttempt(identifier: string): Promise<{ locked: boolean; unlocksAt: number | null }> {
  // Get current record or create new one
  const record = lockoutStore[identifier] || {
    failedAttempts: 0,
    lastFailedAttempt: 0,
    lockedUntil: null
  };
  
  // Update record
  const now = Date.now();
  record.failedAttempts += 1;
  record.lastFailedAttempt = now;
  
  // Check if account should be locked
  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    
    // Store in database for persistence across server restarts
    try {
      const client = await supabaseClientService.getClient();
      await client
        .from('account_lockouts')
        .upsert({
          identifier,
          failed_attempts: record.failedAttempts,
          last_failed_attempt: new Date(record.lastFailedAttempt).toISOString(),
          locked_until: new Date(record.lockedUntil).toISOString()
        }, {
          onConflict: 'identifier'
        });
    } catch (error) {
      console.error('Error storing account lockout:', error);
    }
  }
  
  // Update in-memory store
  lockoutStore[identifier] = record;
  
  return {
    locked: record.lockedUntil !== null && record.lockedUntil > now,
    unlocksAt: record.lockedUntil
  };
}

/**
 * Reset failed login attempts after successful login
 * @param identifier - Email or username that succeeded login
 */
export async function resetFailedLoginAttempts(identifier: string): Promise<void> {
  // Clear from in-memory store
  delete lockoutStore[identifier];
  
  // Clear from database
  try {
    const client = await supabaseClientService.getClient();
    await client
      .from('account_lockouts')
      .delete()
      .eq('identifier', identifier);
  } catch (error) {
    console.error('Error resetting failed login attempts:', error);
  }
}

/**
 * Manually unlock an account (for admin use)
 * @param identifier - Email or username to unlock
 */
export async function unlockAccount(identifier: string): Promise<void> {
  // Clear from in-memory store
  delete lockoutStore[identifier];
  
  // Clear from database
  try {
    const client = await supabaseClientService.getClient();
    await client
      .from('account_lockouts')
      .delete()
      .eq('identifier', identifier);
  } catch (error) {
    console.error('Error unlocking account:', error);
  }
}

/**
 * Get all locked accounts (for admin use)
 * @returns List of locked accounts with their details
 */
export async function getLockedAccounts(): Promise<Array<{
  identifier: string;
  failedAttempts: number;
  lastFailedAttempt: number;
  lockedUntil: number;
}>> {
  try {
    const client = await supabaseClientService.getClient();
    const { data, error } = await client
      .from('account_lockouts')
      .select('*');
    
    if (error || !data) {
      return [];
    }
    
    return data.map((record: {
      user_id?: string;
      failed_attempts?: number;
      updated_at?: string;
      locked_until?: string;
    }) => ({
      identifier: record.user_id || '',
      failedAttempts: record.failed_attempts || 0,
      lastFailedAttempt: record.updated_at ? new Date(record.updated_at).getTime() : Date.now(),
      lockedUntil: record.locked_until ? new Date(record.locked_until).getTime() : null
    }));
  } catch (error) {
    console.error('Error getting locked accounts:', error);
    return [];
  }
} 