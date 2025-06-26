// Performance monitoring and optimization utilities

import { performance } from 'perf_hooks'

// Performance metrics collection
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private startTimes: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(name: string): void {
    this.startTimes.set(name, performance.now())
  }

  endTimer(name: string): number {
    const startTime = this.startTimes.get(name)
    if (!startTime) {
      console.warn(`Timer ${name} was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.startTimes.delete(name)

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)?.push(duration)

    return duration
  }

  getMetrics(name: string): {
    count: number
    avg: number
    min: number
    max: number
    p95: number
    p99: number
  } | null {
    const measurements = this.metrics.get(name)
    if (!measurements || measurements.length === 0) {
      return null
    }

    const sorted = [...measurements].sort((a, b) => a - b)
    const count = sorted.length
    const sum = sorted.reduce((acc, val) => acc + val, 0)

    return {
      count,
      avg: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    }
  }

  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {}
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name)
    }
    return result
  }

  clearMetrics(): void {
    this.metrics.clear()
    this.startTimes.clear()
  }
}

// Performance decorator
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const timerName = name || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance()
      monitor.startTimer(timerName)

      try {
        const result = await originalMethod.apply(this, args)
        const duration = monitor.endTimer(timerName)

        // Log slow operations
        if (duration > 1000) {
          console.warn(`Slow operation detected: ${timerName} took ${duration.toFixed(2)}ms`)
        }

        return result
      } catch (error) {
        monitor.endTimer(timerName)
        throw error
      }
    }
  }
}

// Bundle size monitoring
export class BundleAnalyzer {
  static async getClientBundleSize(): Promise<{
    total: number
    gzipped: number
    chunks: Record<string, number>
  }> {
    if (typeof window === 'undefined') {
      return { total: 0, gzipped: 0, chunks: {} }
    }

    // This would be populated by webpack-bundle-analyzer in real implementation
    return {
      total: 0,
      gzipped: 0,
      chunks: {},
    }
  }

  static logBundleMetrics(): void {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('Bundle analysis would be performed here')
    }
  }
}

// Memory monitoring
export class MemoryMonitor {
  static getMemoryUsage(): NodeJS.MemoryUsage | null {
    if (typeof process === 'undefined') {
      return null
    }

    return process.memoryUsage()
  }

  static formatMemoryUsage(usage: NodeJS.MemoryUsage): string {
    const formatBytes = (bytes: number) => {
      return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    }

    return `RSS: ${formatBytes(usage.rss)}, Heap Used: ${formatBytes(usage.heapUsed)}, Heap Total: ${formatBytes(usage.heapTotal)}, External: ${formatBytes(usage.external)}`
  }

  static checkMemoryLeaks(): void {
    const usage = this.getMemoryUsage()
    if (!usage) return

    const heapUsedMB = usage.heapUsed / 1024 / 1024

    // Alert if heap usage is over 500MB
    if (heapUsedMB > 500) {
      console.warn(`High memory usage detected: ${this.formatMemoryUsage(usage)}`)
    }
  }

  static scheduleMemoryMonitoring(): void {
    if (typeof process !== 'undefined') {
      setInterval(() => {
        this.checkMemoryLeaks()
      }, 60000) // Check every minute
    }
  }
}

// Core Web Vitals monitoring
export class WebVitalsMonitor {
  static measureCLS(): void {
    if (typeof window === 'undefined') return

    let clsValue = 0
    let clsEntries: LayoutShift[] = []

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShift[]) {
        if (!entry.hadRecentInput) {
          clsEntries.push(entry)
          clsValue += entry.value
        }
      }
    })

    observer.observe({ type: 'layout-shift', buffered: true })

    // Report CLS after page load
    window.addEventListener('beforeunload', () => {
      console.log('CLS:', clsValue)
      // Send to analytics
    })
  }

  static measureLCP(): void {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry

      console.log('LCP:', lastEntry.startTime)
      // Send to analytics
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  }

  static measureFID(): void {
    if (typeof window === 'undefined') return

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime)
        // Send to analytics
      }
    })

    observer.observe({ type: 'first-input', buffered: true })
  }

  static initWebVitals(): void {
    this.measureCLS()
    this.measureLCP()
    this.measureFID()
  }
}

// Resource loading optimization
export class ResourceOptimizer {
  static preloadCriticalResources(): void {
    if (typeof document === 'undefined') return

    const criticalResources = [
      { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
      { href: '/images/hero-bg.jpg', as: 'image' },
    ]

    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource.href
      link.as = resource.as
      if (resource.type) {
        link.type = resource.type
      }
      if (resource.as === 'font') {
        link.crossOrigin = 'anonymous'
      }
      document.head.appendChild(link)
    })
  }

  static prefetchNextPageResources(nextPath: string): void {
    if (typeof document === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = nextPath
    document.head.appendChild(link)
  }

  static lazyLoadImages(): void {
    if (typeof window === 'undefined') return

    const images = document.querySelectorAll('img[data-src]')
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.dataset.src!
          img.removeAttribute('data-src')
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  }
}

// API response time monitoring
export function withResponseTimeLogging(handler: Function) {
  return async function (req: any, res: any, ...args: any[]) {
    const start = Date.now()
    const originalSend = res.send

    res.send = function (body: any) {
      const duration = Date.now() - start
      
      // Log slow API responses
      if (duration > 500) {
        console.warn(`Slow API response: ${req.method} ${req.url} took ${duration}ms`)
      }

      // Add performance headers
      res.setHeader('X-Response-Time', `${duration}ms`)
      res.setHeader('X-Timestamp', new Date().toISOString())

      return originalSend.call(this, body)
    }

    return handler(req, res, ...args)
  }
}

// Database query performance monitoring
export function withQueryLogging<T extends any[], R>(
  queryFn: (...args: T) => Promise<R>,
  queryName: string
) {
  return async (...args: T): Promise<R> => {
    const monitor = PerformanceMonitor.getInstance()
    monitor.startTimer(`db.${queryName}`)

    try {
      const result = await queryFn(...args)
      const duration = monitor.endTimer(`db.${queryName}`)

      if (duration > 1000) {
        console.warn(`Slow database query: ${queryName} took ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      monitor.endTimer(`db.${queryName}`)
      throw error
    }
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private static budgets = {
    'page-load': 3000, // 3 seconds
    'api-response': 500, // 500ms
    'database-query': 100, // 100ms
    'bundle-size': 500 * 1024, // 500KB
  }

  static checkBudget(metric: string, value: number): boolean {
    const budget = this.budgets[metric as keyof typeof this.budgets]
    if (!budget) return true

    const exceeded = value > budget
    if (exceeded) {
      console.warn(`Performance budget exceeded: ${metric} = ${value}, budget = ${budget}`)
    }

    return !exceeded
  }

  static setBudget(metric: string, value: number): void {
    (this.budgets as any)[metric] = value
  }

  static getBudgets(): typeof PerformanceBudget.budgets {
    return this.budgets
  }
}

// Export singleton instances
export const performanceMonitor = PerformanceMonitor.getInstance()

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  if (typeof window !== 'undefined') {
    WebVitalsMonitor.initWebVitals()
    ResourceOptimizer.preloadCriticalResources()
    ResourceOptimizer.lazyLoadImages()
  }

  if (typeof process !== 'undefined') {
    MemoryMonitor.scheduleMemoryMonitoring()
  }
}

export default {
  PerformanceMonitor,
  BundleAnalyzer,
  MemoryMonitor,
  WebVitalsMonitor,
  ResourceOptimizer,
  PerformanceBudget,
  measurePerformance,
  withResponseTimeLogging,
  withQueryLogging,
  initPerformanceMonitoring,
}