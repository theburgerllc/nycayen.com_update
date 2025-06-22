import { InstagramMedia, InstagramCacheEntry, InstagramCacheManager } from '../types';

// In-memory cache for development/small scale
class MemoryCache implements InstagramCacheManager {
  private cache = new Map<string, InstagramCacheEntry>();
  private maxSize = 100; // Maximum number of cache entries

  get(key: string): InstagramCacheEntry | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expires_at) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }

  set(key: string, data: InstagramMedia[], ttl: number = 3600): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    const now = Date.now();
    const entry: InstagramCacheEntry = {
      data,
      timestamp: now,
      expires_at: now + (ttl * 1000),
    };
    
    this.cache.set(key, entry);
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  isValid(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? Date.now() <= entry.expires_at : false;
  }

  // Additional utility methods
  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  getStats(): { size: number; totalEntries: number; validEntries: number } {
    const now = Date.now();
    let validEntries = 0;
    
    for (const entry of this.cache.values()) {
      if (now <= entry.expires_at) {
        validEntries++;
      }
    }
    
    return {
      size: this.cache.size,
      totalEntries: this.cache.size,
      validEntries,
    };
  }

  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires_at) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }
}

// Local Storage cache for browser persistence
class LocalStorageCache implements InstagramCacheManager {
  private prefix = 'instagram_cache_';
  private maxAge = 24 * 60 * 60 * 1000; // 24 hours max

  get(key: string): InstagramCacheEntry | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.prefix + key);
      if (!stored) return null;
      
      const entry: InstagramCacheEntry = JSON.parse(stored);
      
      // Check if entry has expired
      if (Date.now() > entry.expires_at) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      
      return entry;
    } catch (error) {
      console.warn('Failed to read from localStorage cache:', error);
      return null;
    }
  }

  set(key: string, data: InstagramMedia[], ttl: number = 3600): void {
    if (typeof window === 'undefined') return;
    
    try {
      const now = Date.now();
      const entry: InstagramCacheEntry = {
        data,
        timestamp: now,
        expires_at: Math.min(now + (ttl * 1000), now + this.maxAge),
      };
      
      localStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to write to localStorage cache:', error);
      
      // If localStorage is full, try to clear old entries
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanup();
        try {
          const now = Date.now();
          const entry: InstagramCacheEntry = {
            data,
            timestamp: now,
            expires_at: Math.min(now + (ttl * 1000), now + this.maxAge),
          };
          localStorage.setItem(this.prefix + key, JSON.stringify(entry));
        } catch (retryError) {
          console.error('Failed to cache after cleanup:', retryError);
        }
      }
    }
  }

  clear(key?: string): void {
    if (typeof window === 'undefined') return;
    
    if (key) {
      localStorage.removeItem(this.prefix + key);
    } else {
      // Clear all Instagram cache entries
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
      keys.forEach(k => localStorage.removeItem(k));
    }
  }

  isValid(key: string): boolean {
    const entry = this.get(key);
    return entry !== null;
  }

  cleanup(): void {
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
    
    for (const key of keys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const entry: InstagramCacheEntry = JSON.parse(stored);
          if (now > entry.expires_at) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(key);
      }
    }
  }
}

// Hybrid cache that uses both memory and localStorage
class HybridCache implements InstagramCacheManager {
  private memoryCache = new MemoryCache();
  private localStorageCache = new LocalStorageCache();

  get(key: string): InstagramCacheEntry | null {
    // Try memory cache first (fastest)
    let entry = this.memoryCache.get(key);
    if (entry) return entry;
    
    // Fall back to localStorage
    entry = this.localStorageCache.get(key);
    if (entry) {
      // Promote to memory cache
      this.memoryCache.set(key, entry.data, Math.floor((entry.expires_at - Date.now()) / 1000));
      return entry;
    }
    
    return null;
  }

  set(key: string, data: InstagramMedia[], ttl: number = 3600): void {
    // Store in both caches
    this.memoryCache.set(key, data, ttl);
    this.localStorageCache.set(key, data, ttl);
  }

  clear(key?: string): void {
    this.memoryCache.clear(key);
    this.localStorageCache.clear(key);
  }

  isValid(key: string): boolean {
    return this.memoryCache.isValid(key) || this.localStorageCache.isValid(key);
  }

  cleanup(): void {
    this.memoryCache.cleanup();
    this.localStorageCache.cleanup();
  }

  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      localStorage: {
        size: typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.startsWith('instagram_cache_')).length : 0,
      },
    };
  }
}

// Cache key generation utilities
export class CacheKeyManager {
  static createFeedKey(userId: string, maxPosts: number = 25): string {
    return `feed_${userId}_${maxPosts}`;
  }

  static createMediaKey(mediaId: string): string {
    return `media_${mediaId}`;
  }

  static createUserKey(userId: string): string {
    return `user_${userId}`;
  }

  static createCarouselKey(mediaId: string): string {
    return `carousel_${mediaId}`;
  }

  static createSearchKey(query: string, filters: Record<string, any> = {}): string {
    const filtersString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    
    return `search_${encodeURIComponent(query)}_${encodeURIComponent(filtersString)}`;
  }

  static createCategoryKey(category: string, limit: number = 25): string {
    return `category_${category}_${limit}`;
  }
}

// Cache strategy manager
export class CacheStrategy {
  private cache: InstagramCacheManager;
  private defaultTTL: number;

  constructor(strategy: 'memory' | 'localStorage' | 'hybrid' = 'hybrid', defaultTTL: number = 3600) {
    switch (strategy) {
      case 'memory':
        this.cache = new MemoryCache();
        break;
      case 'localStorage':
        this.cache = new LocalStorageCache();
        break;
      case 'hybrid':
      default:
        this.cache = new HybridCache();
        break;
    }
    
    this.defaultTTL = defaultTTL;
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.cache.get(key);
    if (cached) {
      return cached.data as T;
    }

    // Fetch fresh data
    const data = await fetchFn();
    
    // Cache the result
    if (Array.isArray(data)) {
      this.cache.set(key, data as InstagramMedia[], ttl || this.defaultTTL);
    }
    
    return data;
  }

  invalidate(key: string): void {
    this.cache.clear(key);
  }

  invalidatePattern(pattern: string): void {
    // For simple pattern matching (starts with, ends with, contains)
    if (this.cache instanceof HybridCache) {
      const memoryCache = (this.cache as any).memoryCache;
      if (memoryCache && memoryCache.keys) {
        const keys = memoryCache.keys();
        const matchingKeys = keys.filter((key: string) => {
          if (pattern.endsWith('*')) {
            return key.startsWith(pattern.slice(0, -1));
          }
          if (pattern.startsWith('*')) {
            return key.endsWith(pattern.slice(1));
          }
          return key.includes(pattern);
        });
        
        matchingKeys.forEach((key: string) => this.cache.clear(key));
      }
    }
  }

  cleanup(): void {
    this.cache.cleanup();
  }

  getStats() {
    if (this.cache instanceof HybridCache) {
      return (this.cache as any).getStats();
    }
    return { message: 'Stats not available for this cache type' };
  }
}

// Default cache instance
export const instagramCache = new CacheStrategy(
  'hybrid',
  parseInt(process.env.INSTAGRAM_CACHE_DURATION || '3600')
);

// Utility functions for common caching patterns
export const cacheUtils = {
  // Cache feed data with automatic key generation
  cacheFeed: (userId: string, data: InstagramMedia[], maxPosts: number = 25, ttl?: number) => {
    const key = CacheKeyManager.createFeedKey(userId, maxPosts);
    instagramCache.cache.set(key, data, ttl);
  },

  // Get cached feed data
  getCachedFeed: (userId: string, maxPosts: number = 25): InstagramMedia[] | null => {
    const key = CacheKeyManager.createFeedKey(userId, maxPosts);
    const cached = instagramCache.cache.get(key);
    return cached ? cached.data : null;
  },

  // Cache individual media item
  cacheMedia: (media: InstagramMedia, ttl?: number) => {
    const key = CacheKeyManager.createMediaKey(media.id);
    instagramCache.cache.set(key, [media], ttl);
  },

  // Get cached media item
  getCachedMedia: (mediaId: string): InstagramMedia | null => {
    const key = CacheKeyManager.createMediaKey(mediaId);
    const cached = instagramCache.cache.get(key);
    return cached && cached.data.length > 0 ? cached.data[0] : null;
  },

  // Invalidate all cache entries for a user
  invalidateUser: (userId: string) => {
    instagramCache.invalidatePattern(`*${userId}*`);
  },

  // Schedule periodic cleanup
  scheduleCleanup: (intervalMinutes: number = 60) => {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        instagramCache.cleanup();
      }, intervalMinutes * 60 * 1000);
    }
  },
};