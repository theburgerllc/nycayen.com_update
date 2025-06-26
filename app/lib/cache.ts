import { Redis } from '@upstash/redis'

// Redis client setup
const redis = process.env.REDIS_URL 
  ? new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_PASSWORD || '',
    })
  : null

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 hour
  shortTTL: 300, // 5 minutes
  longTTL: 86400, // 24 hours
  keyPrefix: process.env.NODE_ENV === 'production' ? 'nycayen:' : 'nycayen:dev:',
}

// Cache key generators
export const cacheKeys = {
  services: () => `${CACHE_CONFIG.keyPrefix}services`,
  service: (id: string) => `${CACHE_CONFIG.keyPrefix}service:${id}`,
  products: () => `${CACHE_CONFIG.keyPrefix}products`,
  product: (id: string) => `${CACHE_CONFIG.keyPrefix}product:${id}`,
  blogPosts: () => `${CACHE_CONFIG.keyPrefix}blog:posts`,
  blogPost: (slug: string) => `${CACHE_CONFIG.keyPrefix}blog:post:${slug}`,
  booking: (id: string) => `${CACHE_CONFIG.keyPrefix}booking:${id}`,
  analytics: (date: string) => `${CACHE_CONFIG.keyPrefix}analytics:${date}`,
  instagram: () => `${CACHE_CONFIG.keyPrefix}instagram:feed`,
  sitemap: () => `${CACHE_CONFIG.keyPrefix}sitemap`,
  healthCheck: () => `${CACHE_CONFIG.keyPrefix}health`,
}

// Cache operations
export class CacheManager {
  private static instance: CacheManager
  private redis: Redis | null

  constructor() {
    this.redis = redis
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      console.warn('Redis not configured, cache miss')
      return null
    }

    try {
      const value = await this.redis.get(key)
      return value as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl: number = CACHE_CONFIG.defaultTTL): Promise<boolean> {
    if (!this.redis) {
      console.warn('Redis not configured, skipping cache set')
      return false
    }

    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis) {
      return false
    }

    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) {
      return false
    }

    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<boolean> {
    if (!this.redis) {
      return false
    }

    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error('Cache invalidate pattern error:', error)
      return false
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_CONFIG.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetcher()
    await this.set(key, value, ttl)
    return value
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.redis || keys.length === 0) {
      return keys.map(() => null)
    }

    try {
      const values = await this.redis.mget(...keys)
      return values as (T | null)[]
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  }

  async mset(keyValues: Record<string, any>, ttl: number = CACHE_CONFIG.defaultTTL): Promise<boolean> {
    if (!this.redis) {
      return false
    }

    try {
      const pipeline = this.redis.pipeline()
      
      Object.entries(keyValues).forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value))
      })
      
      await pipeline.exec()
      return true
    } catch (error) {
      console.error('Cache mset error:', error)
      return false
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.redis) {
      return 0
    }

    try {
      return await this.redis.incrby(key, amount)
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }

  async setWithTags(key: string, value: any, tags: string[], ttl: number = CACHE_CONFIG.defaultTTL): Promise<boolean> {
    if (!this.redis) {
      return false
    }

    try {
      const pipeline = this.redis.pipeline()
      
      // Set the main value
      pipeline.setex(key, ttl, JSON.stringify(value))
      
      // Add key to each tag set
      tags.forEach(tag => {
        const tagKey = `${CACHE_CONFIG.keyPrefix}tag:${tag}`
        pipeline.sadd(tagKey, key)
        pipeline.expire(tagKey, ttl)
      })
      
      await pipeline.exec()
      return true
    } catch (error) {
      console.error('Cache set with tags error:', error)
      return false
    }
  }

  async invalidateByTag(tag: string): Promise<boolean> {
    if (!this.redis) {
      return false
    }

    try {
      const tagKey = `${CACHE_CONFIG.keyPrefix}tag:${tag}`
      const keys = await this.redis.smembers(tagKey)
      
      if (keys.length > 0) {
        const pipeline = this.redis.pipeline()
        
        // Delete all keys associated with the tag
        keys.forEach(key => pipeline.del(key))
        
        // Delete the tag set itself
        pipeline.del(tagKey)
        
        await pipeline.exec()
      }
      
      return true
    } catch (error) {
      console.error('Cache invalidate by tag error:', error)
      return false
    }
  }

  async getStats(): Promise<{
    connected: boolean
    memoryUsage?: string
    keyCount?: number
    hitRate?: number
  }> {
    if (!this.redis) {
      return { connected: false }
    }

    try {
      const info = await this.redis.info('memory')
      const keyCount = await this.redis.dbsize()
      
      return {
        connected: true,
        memoryUsage: info.match(/used_memory_human:(.+)/)?.[1]?.trim(),
        keyCount,
        hitRate: 0, // Would need to implement hit/miss tracking
      }
    } catch (error) {
      console.error('Cache stats error:', error)
      return { connected: false }
    }
  }
}

// Helper functions for common caching patterns
export const cache = CacheManager.getInstance()

// Caching decorators/wrappers
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl: number = CACHE_CONFIG.defaultTTL
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args)
    return cache.getOrSet(key, () => fn(...args), ttl)
  }
}

// Pre-defined cached functions
export const cachedServices = withCache(
  async () => {
    // This would typically fetch from database
    const response = await fetch('/api/services')
    return response.json()
  },
  () => cacheKeys.services(),
  CACHE_CONFIG.longTTL
)

export const cachedBlogPosts = withCache(
  async () => {
    // This would typically fetch from database
    const response = await fetch('/api/blog')
    return response.json()
  },
  () => cacheKeys.blogPosts(),
  CACHE_CONFIG.longTTL
)

export const cachedInstagramFeed = withCache(
  async () => {
    // This would typically fetch from Instagram API
    const response = await fetch('/api/instagram/feed')
    return response.json()
  },
  () => cacheKeys.instagram(),
  CACHE_CONFIG.shortTTL
)

// Cache warming functions
export async function warmCache() {
  console.log('Warming cache...')
  
  try {
    await Promise.all([
      cachedServices(),
      cachedBlogPosts(),
      cachedInstagramFeed(),
    ])
    
    console.log('Cache warmed successfully')
  } catch (error) {
    console.error('Cache warming failed:', error)
  }
}

// Cache middleware for API routes
export function cacheMiddleware(ttl: number = CACHE_CONFIG.defaultTTL) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function(...args: any[]) {
      const request = args[0]
      const cacheKey = `${CACHE_CONFIG.keyPrefix}api:${request.url}`
      
      // Only cache GET requests
      if (request.method !== 'GET') {
        return originalMethod.apply(this, args)
      }
      
      return cache.getOrSet(
        cacheKey,
        () => originalMethod.apply(this, args),
        ttl
      )
    }
  }
}

export default cache