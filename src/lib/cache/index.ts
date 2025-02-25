/**
 * Simple in-memory cache implementation with TTL support
 */

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

interface CacheItem<T> {
  value: T;
  expiry: number | null; // Timestamp when the item expires
  lastAccessed: number; // Timestamp when the item was last accessed
}

export class Cache<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private readonly ttl: number | null;
  private readonly maxSize: number;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl || null; // Default: no expiration
    this.maxSize = options.maxSize || 100; // Default: 100 items
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to store
   * @param customTtl Optional custom TTL for this specific item
   */
  set(key: string, value: T, customTtl?: number): void {
    // Clean expired items before setting new ones
    this.cleanExpired();

    // If cache is at max size, remove least recently used item
    if (this.cache.size >= this.maxSize) {
      this.removeLRU();
    }

    const now = Date.now();
    const expiry = customTtl ? now + customTtl : this.ttl ? now + this.ttl : null;

    this.cache.set(key, {
      value,
      expiry,
      lastAccessed: now
    });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);

    if (!item) {
      return undefined;
    }

    // Check if item is expired
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    // Update last accessed time
    item.lastAccessed = Date.now();
    return item.value;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if item is expired
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of items in the cache
   */
  get size(): number {
    this.cleanExpired();
    return this.cache.size;
  }

  /**
   * Remove all expired items from the cache
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && item.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Remove the least recently used item from the cache
   */
  private removeLRU(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestAccess) {
        oldestAccess = item.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Get a value from the cache, or compute and cache it if not present
   * @param key Cache key
   * @param factory Function to compute the value if not in cache
   * @param customTtl Optional custom TTL for this specific item
   * @returns The cached or computed value
   */
  async getOrSet(key: string, factory: () => Promise<T>, customTtl?: number): Promise<T> {
    const cachedValue = this.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const value = await factory();
    this.set(key, value, customTtl);
    return value;
  }
}

// Create default cache instances with different configurations
export const shortCache = new Cache<any>({ ttl: 60 * 1000 }); // 1 minute
export const mediumCache = new Cache<any>({ ttl: 5 * 60 * 1000 }); // 5 minutes
export const longCache = new Cache<any>({ ttl: 30 * 60 * 1000 }); // 30 minutes 