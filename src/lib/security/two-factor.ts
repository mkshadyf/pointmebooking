/**
 * Two-Factor Authentication Utility
 * 
 * This module provides functionality for implementing TOTP (Time-based One-Time Password)
 * based two-factor authentication.
 */

import { supabaseClientService } from '@/lib/supabase/services/core/supabase-client.service';
import { createHash, randomBytes } from 'crypto';

// Constants
const TOTP_DIGITS = 6;
const TOTP_WINDOW = 1; // Number of periods to check before and after current time
const TOTP_PERIOD = 30; // Seconds
const TOTP_ALGORITHM = 'sha1';
const ISSUER = 'YourAppName';

/**
 * Generate a random secret key for TOTP
 * @returns Base32 encoded secret key
 */
export function generateTOTPSecret(): string {
  const buffer = randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Generate a TOTP code based on the secret and current time
 * @param secret - The TOTP secret key (base32 encoded)
 * @param time - Optional time to use (defaults to current time)
 * @returns TOTP code
 */
export function generateTOTP(secret: string, time: number = Date.now()): string {
  const counter = Math.floor(time / 1000 / TOTP_PERIOD);
  return generateHOTP(secret, counter);
}

/**
 * Verify a TOTP code against the secret
 * @param token - The TOTP code to verify
 * @param secret - The TOTP secret key (base32 encoded)
 * @returns Whether the token is valid
 */
export function verifyTOTP(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  
  // Check current time period and window before/after
  const currentCounter = Math.floor(Date.now() / 1000 / TOTP_PERIOD);
  
  for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
    const counter = currentCounter + i;
    const generatedToken = generateHOTP(secret, counter);
    
    if (token === generatedToken) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate a HOTP (HMAC-based One-Time Password) code
 * @param secret - The secret key (base32 encoded)
 * @param counter - The counter value
 * @returns HOTP code
 */
function generateHOTP(secret: string, counter: number): string {
  // Decode the base32 secret
  const decodedSecret = base32Decode(secret);
  
  // Convert counter to buffer
  const buffer = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    buffer[7 - i] = counter & 0xff;
    counter = counter >> 8;
  }
  
  // Generate HMAC
  const hmac = createHash('sha1')
    .update(decodedSecret)
    .update(buffer)
    .digest();
  
  // Get offset and truncated hash
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = ((hmac[offset] & 0x7f) << 24) |
                ((hmac[offset + 1] & 0xff) << 16) |
                ((hmac[offset + 2] & 0xff) << 8) |
                (hmac[offset + 3] & 0xff);
  
  // Generate code with specified number of digits
  const code = binary % Math.pow(10, TOTP_DIGITS);
  return code.toString().padStart(TOTP_DIGITS, '0');
}

/**
 * Base32 encode a buffer
 * @param buffer - The buffer to encode
 * @returns Base32 encoded string
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    
    while (bits >= 5) {
      result += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 31];
  }
  
  return result;
}

/**
 * Base32 decode a string
 * @param str - The base32 encoded string
 * @returns Decoded buffer
 */
function base32Decode(str: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const lookup: Record<string, number> = {};
  for (let i = 0; i < alphabet.length; i++) {
    lookup[alphabet[i]] = i;
  }
  
  // Convert to uppercase and remove padding
  str = str.toUpperCase().replace(/=+$/, '');
  
  const result = [];
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < str.length; i++) {
    value = (value << 5) | lookup[str[i]];
    bits += 5;
    
    if (bits >= 8) {
      result.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  
  return Buffer.from(result);
}

/**
 * Generate a TOTP URI for QR code generation
 * @param secret - The TOTP secret key
 * @param accountName - The user's account name or email
 * @returns URI for QR code
 */
export function generateTOTPUri(secret: string, accountName: string): string {
  const encodedIssuer = encodeURIComponent(ISSUER);
  const encodedAccount = encodeURIComponent(accountName);
  
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=${TOTP_ALGORITHM}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
}

/**
 * Enable 2FA for a user
 * @param userId - The user ID
 * @param secret - The TOTP secret key
 */
export async function enable2FA(userId: string, secret: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await supabaseClientService.getClient();
    const { error } = await client
      .from('user_2fa')
      .upsert({
        user_id: userId,
        totp_secret: secret,
        enabled: true,
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return { success: false, error: 'Failed to enable 2FA' };
  }
}

/**
 * Disable 2FA for a user
 * @param userId - The user ID
 */
export async function disable2FA(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await supabaseClientService.getClient();
    const { error } = await client
      .from('user_2fa')
      .update({
        enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return { success: false, error: 'Failed to disable 2FA' };
  }
}

/**
 * Check if 2FA is enabled for a user
 * @param userId - The user ID
 * @returns Whether 2FA is enabled
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  try {
    const client = await supabaseClientService.getClient();
    const { data, error } = await client
      .from('user_2fa')
      .select('enabled')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return data.enabled;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
}

/**
 * Get the 2FA secret for a user
 * @param userId - The user ID
 * @returns The TOTP secret key or null if not found
 */
export async function get2FASecret(userId: string): Promise<string | null> {
  try {
    const client = await supabaseClientService.getClient();
    const { data, error } = await client
      .from('user_2fa')
      .select('totp_secret')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data.totp_secret;
  } catch (error) {
    console.error('Error getting 2FA secret:', error);
    return null;
  }
}

/**
 * Verify a 2FA token for a user
 * @param userId - The user ID
 * @param token - The TOTP token to verify
 * @returns Whether the token is valid
 */
export async function verify2FAToken(userId: string, token: string): Promise<boolean> {
  try {
    const secret = await get2FASecret(userId);
    
    if (!secret) {
      return false;
    }
    
    return verifyTOTP(token, secret);
  } catch (error) {
    return false;
  }
} 