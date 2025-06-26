import { PrismaClient } from '@prisma/client'

// Global database connection pool
declare global {
  var __db: PrismaClient | undefined
}

// Database configuration
const DATABASE_CONFIG = {
  connectionLimit: process.env.NODE_ENV === 'production' ? 10 : 5,
  connectionTimeout: parseInt(process.env.DATABASE_TIMEOUT || '30000', 10),
  poolTimeout: 30000,
  idleTimeout: 600000, // 10 minutes
  maxUses: 1000,
  previewFeatures: ['fullTextSearch', 'jsonProtocol'],
}

// Create Prisma client with optimized configuration
function createPrismaClient() {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'pretty',
  })

  // Add query optimization middleware
  prisma.$use(async (params, next) => {
    const before = Date.now()
    
    try {
      const result = await next(params)
      const after = Date.now()
      
      // Log slow queries in production
      if (process.env.NODE_ENV === 'production' && after - before > 1000) {
        console.warn(`Slow query detected: ${params.model}.${params.action} took ${after - before}ms`)
      }
      
      return result
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  })

  // Handle graceful shutdown
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })

  return prisma
}

// Singleton pattern for database connection
export const db = global.__db || createPrismaClient()

if (process.env.NODE_ENV === 'development') {
  global.__db = db
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy'
  latency: number
  connections?: number
  error?: string
}> {
  const start = Date.now()
  
  try {
    // Simple query to check database connectivity
    await db.$queryRaw`SELECT 1`
    
    const latency = Date.now() - start
    
    // Get connection pool stats if available
    const metrics = await db.$metrics.json()
    
    return {
      status: 'healthy',
      latency,
      connections: metrics?.counters?.find((c: any) => c.key === 'prisma_client_queries_total')?.value,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Connection pool monitoring
export async function getDatabaseStats() {
  try {
    const metrics = await db.$metrics.json()
    
    return {
      uptime: process.uptime(),
      activeConnections: metrics?.gauges?.find((g: any) => g.key === 'prisma_client_queries_active')?.value || 0,
      totalQueries: metrics?.counters?.find((c: any) => c.key === 'prisma_client_queries_total')?.value || 0,
      memoryUsage: process.memoryUsage(),
    }
  } catch (error) {
    console.error('Failed to get database stats:', error)
    return null
  }
}

// Query optimization helpers
export class QueryOptimizer {
  static async findManyWithPagination<T>(
    model: any,
    {
      page = 1,
      limit = 10,
      where = {},
      orderBy = {},
      include = {},
      select = undefined,
    }: {
      page?: number
      limit?: number
      where?: any
      orderBy?: any
      include?: any
      select?: any
    }
  ): Promise<{
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }> {
    const skip = (page - 1) * limit
    
    const [data, total] = await Promise.all([
      model.findMany({
        skip,
        take: limit,
        where,
        orderBy,
        include,
        select,
      }),
      model.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  }

  static async findUniqueWithCache<T>(
    model: any,
    where: any,
    cacheKey: string,
    ttl: number = 3600
  ): Promise<T | null> {
    // This would integrate with the cache system
    // For now, just return the direct query
    return model.findUnique({ where })
  }

  static async upsertWithOptimisticLocking<T>(
    model: any,
    {
      where,
      create,
      update,
      versionField = 'version',
    }: {
      where: any
      create: any
      update: any
      versionField?: string
    }
  ): Promise<T> {
    const maxRetries = 3
    let retries = 0
    
    while (retries < maxRetries) {
      try {
        const existing = await model.findUnique({ where })
        
        if (existing) {
          // Optimistic locking: include version in where clause
          const updateWhere = {
            ...where,
            [versionField]: existing[versionField],
          }
          
          return await model.update({
            where: updateWhere,
            data: {
              ...update,
              [versionField]: existing[versionField] + 1,
            },
          })
        } else {
          return await model.create({
            data: {
              ...create,
              [versionField]: 1,
            },
          })
        }
      } catch (error: any) {
        if (error.code === 'P2025' && retries < maxRetries - 1) {
          // Record not found (likely due to concurrent update)
          retries++
          await new Promise(resolve => setTimeout(resolve, 100 * retries))
          continue
        }
        throw error
      }
    }
    
    throw new Error('Max retries exceeded for optimistic locking')
  }
}

// Transaction helpers
export async function withTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return db.$transaction(fn, {
    timeout: DATABASE_CONFIG.connectionTimeout,
    maxWait: 5000,
    isolationLevel: 'ReadCommitted',
  })
}

// Batch operations
export class BatchOperations {
  static async batchInsert<T>(
    model: any,
    data: T[],
    batchSize: number = 1000
  ): Promise<void> {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      await model.createMany({
        data: batch,
        skipDuplicates: true,
      })
    }
  }

  static async batchUpdate<T>(
    model: any,
    updates: Array<{ where: any; data: any }>,
    batchSize: number = 100
  ): Promise<void> {
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)
      
      await withTransaction(async (tx) => {
        await Promise.all(
          batch.map(({ where, data }) =>
            tx[model.name].update({ where, data })
          )
        )
      })
    }
  }
}

// Database migrations helper
export async function runMigrations() {
  try {
    console.log('Checking for pending migrations...')
    
    // In production, this would be handled by deployment process
    if (process.env.NODE_ENV !== 'production') {
      const { execSync } = require('child_process')
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    }
    
    console.log('Migrations completed')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Database seeding for non-production environments
export async function seedDatabase() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping database seeding in production')
    return
  }

  try {
    console.log('Seeding database...')
    
    // Example seeding logic
    const existingServices = await db.service?.count?.()
    
    if (!existingServices || existingServices === 0) {
      const services = [
        {
          name: 'Hair Cut & Style',
          description: 'Professional haircut and styling',
          price: 75,
          duration: 60,
          category: 'Styling',
        },
        {
          name: 'Hair Color',
          description: 'Full color treatment',
          price: 150,
          duration: 120,
          category: 'Color',
        },
        // Add more seed data as needed
      ]
      
      await db.service?.createMany?.({
        data: services,
        skipDuplicates: true,
      })
    }
    
    console.log('Database seeding completed')
  } catch (error) {
    console.error('Database seeding failed:', error)
  }
}

export default db