// Analytics and tracking setup

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Custom analytics tracking
export class AnalyticsTracker {
  private static instance: AnalyticsTracker
  private initialized = false
  private events: Array<any> = []

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker()
    }
    return AnalyticsTracker.instance
  }

  init(): void {
    if (this.initialized) return

    // Initialize Google Analytics
    this.initGoogleAnalytics()

    // Initialize custom tracking
    this.initCustomTracking()

    this.initialized = true
  }

  private initGoogleAnalytics(): void {
    if (typeof window === 'undefined') return

    const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
    if (!GA_ID) {
      console.warn('Google Analytics ID not found')
      return
    }

    // Load Google Analytics script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).gtag = function () {
      ;(window as any).dataLayer.push(arguments)
    }

    ;(window as any).gtag('js', new Date())
    ;(window as any).gtag('config', GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }

  private initCustomTracking(): void {
    // Track page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.track('page_visibility_change', {
          visible: !document.hidden,
        })
      })
    }

    // Track user engagement
    this.trackUserEngagement()

    // Track errors
    this.trackErrors()
  }

  private trackUserEngagement(): void {
    if (typeof window === 'undefined') return

    let startTime = Date.now()
    let isActive = true

    // Track scroll depth
    let maxScrollDepth = 0
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      )
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
      }
    })

    // Track time on page
    const trackTimeOnPage = () => {
      if (isActive) {
        const timeSpent = Date.now() - startTime
        this.track('time_on_page', {
          duration: timeSpent,
          scroll_depth: maxScrollDepth,
          page: window.location.pathname,
        })
      }
    }

    // Track when user becomes inactive
    let inactivityTimer: NodeJS.Timeout
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      if (!isActive) {
        isActive = true
        startTime = Date.now()
      }
      inactivityTimer = setTimeout(() => {
        isActive = false
        trackTimeOnPage()
      }, 30000) // 30 seconds of inactivity
    }

    // Listen for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      window.addEventListener(event, resetInactivityTimer)
    })

    // Track when user leaves
    window.addEventListener('beforeunload', trackTimeOnPage)
  }

  private trackErrors(): void {
    if (typeof window === 'undefined') return

    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.track('javascript_error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
      })
    })

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.track('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
      })
    })
  }

  // Public tracking methods
  track(event: string, properties?: Record<string, any>): void {
    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
      },
    }

    // Store event locally
    this.events.push(eventData)

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', event, properties)
    }

    // Send to custom analytics endpoint
    this.sendToAnalyticsEndpoint(eventData)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', eventData)
    }
  }

  private async sendToAnalyticsEndpoint(eventData: any): Promise<void> {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  // Predefined tracking methods
  trackPageView(page: string, title?: string): void {
    this.track('page_view', {
      page,
      title: title || document.title,
    })

    // Also send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
        page_title: title,
        page_location: window.location.href,
      })
    }
  }

  trackButtonClick(buttonText: string, location?: string): void {
    this.track('button_click', {
      button_text: buttonText,
      location,
    })
  }

  trackFormSubmission(formName: string, success: boolean, errorMessage?: string): void {
    this.track('form_submission', {
      form_name: formName,
      success,
      error_message: errorMessage,
    })
  }

  trackBookingAttempt(serviceType: string, step: string): void {
    this.track('booking_attempt', {
      service_type: serviceType,
      step,
    })
  }

  trackBookingComplete(serviceType: string, price: number): void {
    this.track('booking_complete', {
      service_type: serviceType,
      price,
    })
  }

  trackProductView(productId: string, productName: string, category: string): void {
    this.track('product_view', {
      product_id: productId,
      product_name: productName,
      category,
    })
  }

  trackAddToCart(productId: string, productName: string, price: number): void {
    this.track('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
    })
  }

  trackPurchase(orderId: string, total: number, items: Array<any>): void {
    this.track('purchase', {
      order_id: orderId,
      total,
      items,
    })

    // Send enhanced ecommerce data to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'purchase', {
        transaction_id: orderId,
        value: total,
        currency: 'USD',
        items: items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
        })),
      })
    }
  }

  trackSearch(query: string, resultsCount: number): void {
    this.track('search', {
      query,
      results_count: resultsCount,
    })
  }

  trackSocialShare(platform: string, url: string): void {
    this.track('social_share', {
      platform,
      url,
    })
  }

  trackNewsletter(action: 'signup' | 'unsubscribe', email?: string): void {
    this.track('newsletter_action', {
      action,
      email: email ? 'provided' : 'not_provided', // Don't store actual email
    })
  }

  trackContactForm(method: string, success: boolean): void {
    this.track('contact_form', {
      method, // 'form', 'phone', 'email', etc.
      success,
    })
  }

  // User identification
  identify(userId: string, traits?: Record<string, any>): void {
    this.track('identify', {
      user_id: userId,
      traits,
    })

    // Set user ID in Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
        user_id: userId,
      })
    }
  }

  // Get stored events
  getEvents(): Array<any> {
    return [...this.events]
  }

  // Clear stored events
  clearEvents(): void {
    this.events = []
  }
}

// Export components for use in app
import React from 'react'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children)
}

// Initialize analytics
export function initAnalytics(): void {
  const analytics = AnalyticsTracker.getInstance()
  analytics.init()
}

// Export singleton instance
export const analytics = AnalyticsTracker.getInstance()

export default analytics