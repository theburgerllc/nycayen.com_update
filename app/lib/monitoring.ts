// Monitoring and observability setup

import * as Sentry from '@sentry/nextjs'

// Sentry configuration
export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not found, error tracking disabled')
    return
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    
    // Performance monitoring
    profilesSampleRate: 0.1,
    
    // Configure which integrations to use
    integrations: [
      new Sentry.BrowserTracing({
        tracingOrigins: [
          'localhost',
          'nycayen.com',
          'staging-nycayen.vercel.app',
          /^\//,
        ],
      }),
    ],

    // Filter out noise
    beforeSend(event, hint) {
      // Filter out certain errors
      if (event.exception) {
        const error = hint.originalException
        
        // Ignore common browser errors
        if (error?.message?.includes('Non-Error promise rejection')) {
          return null
        }
        
        if (error?.message?.includes('Script error')) {
          return null
        }
        
        // Ignore network errors
        if (error?.message?.includes('Failed to fetch')) {
          return null
        }
      }

      return event
    },

    // Configure release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  })
}

// Custom error reporting
export class ErrorReporter {
  static reportError(error: Error, context?: Record<string, any>, level: 'error' | 'warning' | 'info' = 'error') {
    console.error('Error reported:', error)
    
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        scope.setLevel(level)
        
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            scope.setContext(key, value)
          })
        }
        
        Sentry.captureException(error)
      })
    }
  }

  static reportMessage(message: string, level: 'error' | 'warning' | 'info' = 'info', context?: Record<string, any>) {
    console.log(`[${level.toUpperCase()}] ${message}`)
    
    if (process.env.NODE_ENV === 'production') {
      Sentry.withScope((scope) => {
        scope.setLevel(level)
        
        if (context) {
          Object.entries(context).forEach(([key, value]) => {
            scope.setContext(key, value)
          })
        }
        
        Sentry.captureMessage(message)
      })
    }
  }

  static setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user)
  }

  static addBreadcrumb(message: string, category?: string, data?: any) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      timestamp: Date.now() / 1000,
    })
  }
}

// Structured logging
export class Logger {
  private static instance: Logger
  private context: Record<string, any> = {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context }
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      meta,
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    }

    // Console output
    const consoleMethod = console[level] || console.log
    consoleMethod(JSON.stringify(logEntry, null, 2))

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry)
    }
  }

  private async sendToLoggingService(logEntry: any): Promise<void> {
    try {
      // This would send logs to services like DataDog, LogRocket, etc.
      // For now, we'll just use Sentry for errors
      if (logEntry.level === 'error') {
        Sentry.captureMessage(logEntry.message, 'error')
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta)
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta)
  }

  error(message: string, meta?: any): void {
    this.log('error', message, meta)
  }
}

// Performance monitoring
export class PerformanceLogger {
  static logPageView(page: string, loadTime: number, userId?: string): void {
    const logger = Logger.getInstance()
    
    logger.info('Page view', {
      page,
      loadTime,
      userId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      timestamp: Date.now(),
    })

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: page,
        page_location: window.location.href,
        custom_parameter_load_time: loadTime,
      })
    }
  }

  static logUserAction(action: string, details?: any, userId?: string): void {
    const logger = Logger.getInstance()
    
    logger.info('User action', {
      action,
      details,
      userId,
      timestamp: Date.now(),
    })

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, details)
    }
  }

  static logAPICall(endpoint: string, method: string, responseTime: number, statusCode: number): void {
    const logger = Logger.getInstance()
    
    logger.info('API call', {
      endpoint,
      method,
      responseTime,
      statusCode,
      timestamp: Date.now(),
    })
  }
}

// System monitoring
export class SystemMonitor {
  private static metrics: Record<string, any> = {}

  static recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics[name] = {
      value,
      tags,
      timestamp: Date.now(),
    }

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendMetric(name, value, tags)
    }
  }

  private static async sendMetric(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    try {
      // This would send metrics to services like DataDog, New Relic, etc.
      console.log(`Metric: ${name} = ${value}`, tags)
    } catch (error) {
      console.error('Failed to send metric:', error)
    }
  }

  static getMetrics(): Record<string, any> {
    return this.metrics
  }

  static startHealthCheck(): void {
    setInterval(async () => {
      try {
        // Check database connectivity
        const dbStart = Date.now()
        // await db.$queryRaw`SELECT 1`
        const dbLatency = Date.now() - dbStart
        this.recordMetric('database.latency', dbLatency)

        // Check memory usage
        if (typeof process !== 'undefined') {
          const memUsage = process.memoryUsage()
          this.recordMetric('memory.heap_used', memUsage.heapUsed)
          this.recordMetric('memory.heap_total', memUsage.heapTotal)
          this.recordMetric('memory.rss', memUsage.rss)
        }

        // Check cache connectivity
        // const cacheStart = Date.now()
        // await cache.get('health-check')
        // const cacheLatency = Date.now() - cacheStart
        // this.recordMetric('cache.latency', cacheLatency)

      } catch (error) {
        ErrorReporter.reportError(error as Error, { component: 'health-check' })
      }
    }, 60000) // Every minute
  }
}

// Uptime monitoring
export class UptimeMonitor {
  private static checks: Map<string, any> = new Map()

  static addCheck(name: string, url: string, interval: number = 60000): void {
    const check = {
      name,
      url,
      interval,
      lastCheck: null,
      status: 'unknown',
      responseTime: 0,
    }

    this.checks.set(name, check)
    this.startCheck(name)
  }

  private static startCheck(name: string): void {
    const check = this.checks.get(name)
    if (!check) return

    const performCheck = async () => {
      try {
        const start = Date.now()
        const response = await fetch(check.url, { method: 'HEAD' })
        const responseTime = Date.now() - start

        check.lastCheck = new Date()
        check.status = response.ok ? 'up' : 'down'
        check.responseTime = responseTime

        SystemMonitor.recordMetric(`uptime.${name}.response_time`, responseTime)
        SystemMonitor.recordMetric(`uptime.${name}.status`, response.ok ? 1 : 0)

        if (!response.ok) {
          ErrorReporter.reportMessage(
            `Uptime check failed for ${name}`,
            'warning',
            { url: check.url, status: response.status }
          )
        }
      } catch (error) {
        check.status = 'down'
        check.lastCheck = new Date()
        
        ErrorReporter.reportError(error as Error, {
          component: 'uptime-monitor',
          check: name,
          url: check.url,
        })
      }
    }

    // Initial check
    performCheck()

    // Schedule recurring checks
    setInterval(performCheck, check.interval)
  }

  static getStatus(): Record<string, any> {
    const status: Record<string, any> = {}
    
    for (const [name, check] of this.checks) {
      status[name] = {
        status: check.status,
        lastCheck: check.lastCheck,
        responseTime: check.responseTime,
      }
    }

    return status
  }
}

// Alert manager
export class AlertManager {
  private static rules: Array<{
    name: string
    condition: (metrics: any) => boolean
    action: (alert: any) => void
  }> = []

  static addRule(
    name: string,
    condition: (metrics: any) => boolean,
    action: (alert: any) => void
  ): void {
    this.rules.push({ name, condition, action })
  }

  static checkRules(): void {
    const metrics = SystemMonitor.getMetrics()
    
    for (const rule of this.rules) {
      try {
        if (rule.condition(metrics)) {
          rule.action({
            name: rule.name,
            timestamp: new Date(),
            metrics,
          })
        }
      } catch (error) {
        ErrorReporter.reportError(error as Error, {
          component: 'alert-manager',
          rule: rule.name,
        })
      }
    }
  }

  static startMonitoring(): void {
    // Check rules every 30 seconds
    setInterval(() => {
      this.checkRules()
    }, 30000)
  }
}

// Initialize monitoring
export function initMonitoring(): void {
  initSentry()
  
  if (typeof process !== 'undefined') {
    SystemMonitor.startHealthCheck()
    AlertManager.startMonitoring()

    // Add default alert rules
    AlertManager.addRule(
      'high-memory-usage',
      (metrics) => metrics['memory.heap_used']?.value > 500 * 1024 * 1024, // 500MB
      (alert) => {
        ErrorReporter.reportMessage(
          'High memory usage detected',
          'warning',
          { alert }
        )
      }
    )

    AlertManager.addRule(
      'slow-database',
      (metrics) => metrics['database.latency']?.value > 1000, // 1 second
      (alert) => {
        ErrorReporter.reportMessage(
          'Slow database response detected',
          'warning',
          { alert }
        )
      }
    )
  }
}

// Export singleton instances
export const logger = Logger.getInstance()
export const errorReporter = ErrorReporter
export const performanceLogger = PerformanceLogger
export const systemMonitor = SystemMonitor
export const uptimeMonitor = UptimeMonitor
export const alertManager = AlertManager

export default {
  initMonitoring,
  logger,
  errorReporter,
  performanceLogger,
  systemMonitor,
  uptimeMonitor,
  alertManager,
}