// Comprehensive Analytics & SEO System
"use client";

import { z } from 'zod';
import { Cart, CartItem, Order } from '../shop/types';

// Enhanced Global Types
declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
    dataLayer?: any[];
    fbq?: (command: string, ...args: any[]) => void;
    hj?: (command: string, ...args: any[]) => void;
    _hjSettings?: { hjid: number; hjsv: number };
    clarity?: (command: string, ...args: any[]) => void;
    performance?: Performance;
  }
}

// Comprehensive Analytics Configuration
export const ANALYTICS_CONFIG = {
  // Google Analytics 4
  GA4: {
    MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX',
    API_SECRET: process.env.GA4_API_SECRET,
    DEBUG_MODE: process.env.NODE_ENV === 'development',
    ENHANCED_ECOMMERCE: true,
    CROSS_DOMAIN_TRACKING: true,
    ANONYMIZE_IP: true,
  },
  // Google Tag Manager
  GTM: {
    CONTAINER_ID: process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX',
    AUTH: process.env.NEXT_PUBLIC_GTM_AUTH,
    PREVIEW: process.env.NEXT_PUBLIC_GTM_PREVIEW,
  },
  // Hotjar
  HOTJAR: {
    SITE_ID: parseInt(process.env.NEXT_PUBLIC_HOTJAR_ID || '0'),
    VERSION: 6,
    ENABLED: process.env.NODE_ENV === 'production',
  },
  // Microsoft Clarity
  CLARITY: {
    PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_ID || '',
    ENABLED: process.env.NODE_ENV === 'production',
  },
  // Facebook Pixel
  FACEBOOK: {
    PIXEL_ID: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
    ENABLED: !!process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  },
  // Custom Analytics
  CUSTOM: {
    ENDPOINT: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics/track',
    BATCH_SIZE: 10,
    FLUSH_INTERVAL: 5000, // 5 seconds
    STORAGE_KEY: 'nycayen_analytics_queue',
  },
  // Attribution
  ATTRIBUTION: {
    WINDOW_DAYS: 30,
    TOUCH_POINTS: ['organic_search', 'paid_search', 'social', 'email', 'direct', 'referral'],
    CONVERSION_EVENTS: ['purchase', 'booking', 'newsletter_signup', 'contact_form'],
  },
  // A/B Testing
  AB_TESTING: {
    ENABLED: true,
    STORAGE_KEY: 'ab_test_assignments',
    DEFAULT_TRAFFIC_SPLIT: 0.5,
  },
  // Performance Monitoring
  PERFORMANCE: {
    CORE_WEB_VITALS: true,
    RESOURCE_TIMING: true,
    NAVIGATION_TIMING: true,
    SLOW_THRESHOLD: 1000, // ms
  },
};

// Event Schemas for Validation
export const EventSchemas = {
  // Booking Events
  booking_initiated: z.object({
    service_type: z.string(),
    service_category: z.string(),
    estimated_value: z.number(),
    preferred_date: z.string().optional(),
    step: z.number().default(1),
    source: z.string().optional(),
  }),

  booking_completed: z.object({
    booking_id: z.string(),
    service_type: z.string(),
    service_category: z.string(),
    value: z.number(),
    appointment_date: z.string(),
    duration_minutes: z.number(),
    stylist: z.string().optional(),
    customer_type: z.enum(['new', 'returning']).optional(),
  }),

  // Enhanced E-commerce
  purchase: z.object({
    transaction_id: z.string(),
    value: z.number(),
    currency: z.string().default('USD'),
    items: z.array(z.object({
      item_id: z.string(),
      item_name: z.string(),
      item_category: z.string(),
      quantity: z.number(),
      price: z.number(),
    })),
    coupon: z.string().optional(),
    payment_method: z.string().optional(),
    shipping: z.number().optional(),
    tax: z.number().optional(),
  }),

  // Lead Generation
  newsletter_signup: z.object({
    source: z.string(),
    email_hash: z.string().optional(),
    interests: z.array(z.string()).optional(),
    list_type: z.string().optional(),
  }),

  contact_form: z.object({
    form_id: z.string(),
    form_name: z.string(),
    source: z.string(),
    inquiry_type: z.string(),
    estimated_value: z.number().optional(),
  }),

  // User Behavior
  page_view: z.object({
    page_title: z.string(),
    page_location: z.string(),
    page_referrer: z.string().optional(),
    content_group: z.string().optional(),
    engagement_time_msec: z.number().optional(),
  }),

  scroll: z.object({
    percent_scrolled: z.number(),
    page_location: z.string(),
    content_type: z.string().optional(),
  }),

  video_engagement: z.object({
    video_title: z.string(),
    video_duration: z.number(),
    video_current_time: z.number(),
    video_percent: z.number(),
    action: z.enum(['play', 'pause', 'complete', '25%', '50%', '75%']),
  }),

  search: z.object({
    search_term: z.string(),
    results_count: z.number(),
    source: z.string().default('site_search'),
    filters_applied: z.array(z.string()).optional(),
  }),

  social_share: z.object({
    platform: z.string(),
    content_type: z.string(),
    content_id: z.string(),
    url: z.string(),
  }),
};

// Enhanced Analytics Manager
export class AnalyticsManager {
  private static initialized = false;
  private static queue: any[] = [];
  private static batchTimeout: NodeJS.Timeout | null = null;
  private static abTestAssignments: Map<string, string> = new Map();

  static async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      // Initialize all analytics services
      await this.initializeGA4();
      this.initializeGTM();
      this.initializeHotjar();
      this.initializeClarity();
      this.initializeFacebookPixel();
      this.initializePerformanceMonitoring();
      this.initializeCustomAnalytics();

      // Set up attribution tracking
      this.setupAttributionTracking();

      // Set up engagement tracking
      this.setupEngagementTracking();

      // Load A/B test assignments
      this.loadABTestAssignments();

      this.initialized = true;
      console.log('Analytics Manager initialized');
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  // Google Analytics 4 Enhanced Setup
  private static async initializeGA4(): Promise<void> {
    if (!ANALYTICS_CONFIG.GA4.MEASUREMENT_ID) return;

    try {
      // Load gtag script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA4.MEASUREMENT_ID}`;
      document.head.appendChild(script);

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      
      // gtag function
      window.gtag = function() {
        window.dataLayer!.push(arguments);
      };

      // Configure GA4
      window.gtag('js', new Date());
      window.gtag('config', ANALYTICS_CONFIG.GA4.MEASUREMENT_ID, {
        debug_mode: ANALYTICS_CONFIG.GA4.DEBUG_MODE,
        anonymize_ip: ANALYTICS_CONFIG.GA4.ANONYMIZE_IP,
        allow_enhanced_conversions: true,
        allow_google_signals: true,
        allow_ad_personalization_signals: true,
        cookie_flags: 'secure;samesite=strict',
        send_page_view: false, // We'll send manually with enhanced data
        custom_map: {
          'custom_parameter_1': 'user_type',
          'custom_parameter_2': 'customer_lifetime_value',
          'custom_parameter_3': 'service_preference',
        },
      });

      console.log('GA4 Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize GA4:', error);
    }
  }

  // Google Tag Manager Setup
  private static initializeGTM(): void {
    if (!ANALYTICS_CONFIG.GTM.CONTAINER_ID) return;

    try {
      (function(w: any, d: Document, s: string, l: string, i: string) {
        w[l] = w[l] || []; 
        w[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
        const f = d.getElementsByTagName(s)[0];
        const j = d.createElement(s) as HTMLScriptElement;
        const dl = l !== 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl + 
               (ANALYTICS_CONFIG.GTM.AUTH ? '&gtm_auth=' + ANALYTICS_CONFIG.GTM.AUTH : '') +
               (ANALYTICS_CONFIG.GTM.PREVIEW ? '&gtm_preview=' + ANALYTICS_CONFIG.GTM.PREVIEW : '');
        f.parentNode?.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', ANALYTICS_CONFIG.GTM.CONTAINER_ID);

      console.log('GTM initialized');
    } catch (error) {
      console.error('GTM initialization failed:', error);
    }
  }

  // Hotjar User Behavior Analytics
  private static initializeHotjar(): void {
    if (!ANALYTICS_CONFIG.HOTJAR.ENABLED || !ANALYTICS_CONFIG.HOTJAR.SITE_ID) return;

    try {
      (function(h: any, o: Document, t: string, j: string, a?: any, r?: any) {
        h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
        h._hjSettings = {
          hjid: ANALYTICS_CONFIG.HOTJAR.SITE_ID, 
          hjsv: ANALYTICS_CONFIG.HOTJAR.VERSION
        };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

      console.log('Hotjar initialized');
    } catch (error) {
      console.error('Hotjar initialization failed:', error);
    }
  }

  // Microsoft Clarity
  private static initializeClarity(): void {
    if (!ANALYTICS_CONFIG.CLARITY.ENABLED || !ANALYTICS_CONFIG.CLARITY.PROJECT_ID) return;

    try {
      (function(c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
        c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', ANALYTICS_CONFIG.CLARITY.PROJECT_ID);

      console.log('Microsoft Clarity initialized');
    } catch (error) {
      console.error('Clarity initialization failed:', error);
    }
  }

  // Facebook Pixel
  private static initializeFacebookPixel(): void {
    if (!ANALYTICS_CONFIG.FACEBOOK.ENABLED || !ANALYTICS_CONFIG.FACEBOOK.PIXEL_ID) return;

    try {
      (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return; n = f.fbq = function() {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq!('init', ANALYTICS_CONFIG.FACEBOOK.PIXEL_ID);
      window.fbq!('track', 'PageView');

      console.log('Facebook Pixel initialized');
    } catch (error) {
      console.error('Facebook Pixel initialization failed:', error);
    }
  }

  // Performance Monitoring Setup
  private static initializePerformanceMonitoring(): void {
    if (!ANALYTICS_CONFIG.PERFORMANCE.CORE_WEB_VITALS) return;

    this.observeCoreWebVitals();
    this.observeNavigationTiming();
    this.observeResourceTiming();
  }

  // Custom Analytics Queue System
  private static initializeCustomAnalytics(): void {
    // Load queued events from localStorage
    this.loadQueueFromStorage();
    
    // Set up periodic flush
    this.scheduleFlush();

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  // Attribution Tracking Setup
  private static setupAttributionTracking(): void {
    // Track UTM parameters
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source');
    const medium = urlParams.get('utm_medium');
    const campaign = urlParams.get('utm_campaign');
    const content = urlParams.get('utm_content');
    const term = urlParams.get('utm_term');

    if (source && medium) {
      this.recordTouchPoint({
        source,
        medium,
        campaign: campaign || 'none',
        content: content || '',
        term: term || '',
        timestamp: Date.now(),
        page: window.location.href,
        referrer: document.referrer,
      });
    } else {
      // Infer source from referrer
      this.inferSourceFromReferrer();
    }
  }

  // Engagement Tracking Setup
  private static setupEngagementTracking(): void {
    let startTime = Date.now();
    let isActive = true;
    let scrollDepth = 0;

    // Scroll tracking
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > scrollDepth && scrollPercent % 25 === 0) {
        scrollDepth = scrollPercent;
        this.track('scroll', {
          percent_scrolled: scrollPercent,
          page_location: window.location.href,
          content_type: this.getContentType(),
        });
      }
    };

    // Engagement time tracking
    const trackEngagement = () => {
      if (isActive) {
        const engagementTime = Date.now() - startTime;
        this.track('user_engagement', {
          engagement_time_msec: engagementTime,
        });
      }
    };

    // Event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trackEngagement();
        isActive = false;
      } else {
        startTime = Date.now();
        isActive = true;
      }
    });

    // Periodic engagement tracking
    setInterval(trackEngagement, 30000); // Every 30 seconds
  }

  // Core Web Vitals Monitoring
  private static observeCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    this.createPerformanceObserver('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      
      this.trackWebVital('LCP', lcp, lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor');
    });

    // First Input Delay (FID)
    this.createPerformanceObserver('first-input', (entries) => {
      const firstEntry = entries[0];
      const fid = firstEntry.processingStart - firstEntry.startTime;
      
      this.trackWebVital('FID', fid, fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor');
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.createPerformanceObserver('layout-shift', (entries) => {
      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      
      this.trackWebVital('CLS', clsValue, clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor');
    });
  }

  // Performance Observer Helper
  private static createPerformanceObserver(entryType: string, callback: (entries: any[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes: [entryType] });
    } catch (error) {
      console.warn(`Failed to create observer for ${entryType}:`, error);
    }
  }

  // Track Web Vitals
  private static trackWebVital(name: string, value: number, rating: string): void {
    this.track('web_vital', {
      name,
      value: Math.round(value),
      rating,
    });
  }

  // Helper Methods
  private static getContentType(): string {
    const path = window.location.pathname;
    if (path.includes('/services')) return 'services';
    if (path.includes('/blog')) return 'blog';
    if (path.includes('/about')) return 'about';
    if (path.includes('/contact')) return 'contact';
    if (path.includes('/booking')) return 'booking';
    if (path.includes('/shop')) return 'shop';
    return 'other';
  }

  private static inferSourceFromReferrer(): void {
    if (!document.referrer) {
      this.recordTouchPoint({
        source: 'direct',
        medium: 'none',
        campaign: 'none',
        timestamp: Date.now(),
        page: window.location.href,
        referrer: '',
      });
      return;
    }

    try {
      const referrerDomain = new URL(document.referrer).hostname;
      let source = 'referral';
      let medium = 'referral';

      if (referrerDomain.includes('google')) {
        source = 'google';
        medium = 'organic';
      } else if (referrerDomain.includes('facebook')) {
        source = 'facebook';
        medium = 'social';
      } else if (referrerDomain.includes('instagram')) {
        source = 'instagram';
        medium = 'social';
      } else if (referrerDomain.includes('twitter') || referrerDomain.includes('t.co')) {
        source = 'twitter';
        medium = 'social';
      } else if (referrerDomain.includes('linkedin')) {
        source = 'linkedin';
        medium = 'social';
      }

      this.recordTouchPoint({
        source,
        medium,
        campaign: 'none',
        timestamp: Date.now(),
        page: window.location.href,
        referrer: document.referrer,
      });
    } catch {
      this.recordTouchPoint({
        source: 'referral',
        medium: 'referral',
        campaign: 'none',
        timestamp: Date.now(),
        page: window.location.href,
        referrer: document.referrer,
      });
    }
  }

  private static recordTouchPoint(touchPoint: any): void {
    const touchPoints = this.getTouchPoints();
    touchPoints.push(touchPoint);

    // Keep only last 10 touch points within attribution window
    const windowStart = Date.now() - (ANALYTICS_CONFIG.ATTRIBUTION.WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const filteredTouchPoints = touchPoints
      .filter(tp => tp.timestamp > windowStart)
      .slice(-10);

    localStorage.setItem('attribution_touch_points', JSON.stringify(filteredTouchPoints));
  }

  private static getTouchPoints(): any[] {
    try {
      const stored = localStorage.getItem('attribution_touch_points');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Public API Methods
  static track(event: string, properties: Record<string, any> = {}): void {
    if (!this.initialized || typeof window === 'undefined') return;

    const enrichedProperties = {
      ...properties,
      timestamp: Date.now(),
      page_location: window.location.href,
      page_title: document.title,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      user_type: this.getUserType(),
      session_id: this.getSessionId(),
    };

    // Send to GA4
    if (window.gtag) {
      window.gtag('event', event, enrichedProperties);
    }

    // Send to GTM
    if (window.dataLayer) {
      window.dataLayer.push({
        event,
        ...enrichedProperties,
      });
    }

    // Queue for custom analytics
    this.queueEvent(event, enrichedProperties);

    // Debug logging
    if (ANALYTICS_CONFIG.GA4.DEBUG_MODE) {
      console.log('Analytics Event:', event, enrichedProperties);
    }
  }

  static trackPageView(data?: any): void {
    const pageData = {
      page_title: data?.page_title || document.title,
      page_location: data?.page_location || window.location.href,
      page_referrer: data?.page_referrer || document.referrer,
      content_group: this.getContentType(),
      user_type: this.getUserType(),
    };

    this.track('page_view', pageData);
  }

  // A/B Testing Framework
  static getABTestVariant(testName: string, variants: string[], trafficSplit?: number[]): string {
    const userId = this.getUserId();
    const assignmentKey = `${testName}_${userId}`;
    
    // Check existing assignment
    if (this.abTestAssignments.has(assignmentKey)) {
      return this.abTestAssignments.get(assignmentKey)!;
    }

    // Generate new assignment
    const hash = this.hashString(assignmentKey);
    const normalizedHash = hash / 0xffffffff; // Normalize to 0-1
    
    let cumulativeWeight = 0;
    const weights = trafficSplit || variants.map(() => 1 / variants.length);
    
    for (let i = 0; i < variants.length; i++) {
      cumulativeWeight += weights[i];
      if (normalizedHash <= cumulativeWeight) {
        const variant = variants[i];
        this.abTestAssignments.set(assignmentKey, variant);
        this.saveABTestAssignments();
        
        // Track assignment
        this.track('ab_test_assignment', {
          test_name: testName,
          variant,
          user_id_hash: this.hashString(userId).toString(16),
        });
        
        return variant;
      }
    }
    
    // Fallback
    const fallback = variants[0];
    this.abTestAssignments.set(assignmentKey, fallback);
    return fallback;
  }

  // Utility Methods
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private static getUserId(): string {
    let userId = localStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private static getUserType(): string {
    const isReturning = localStorage.getItem('returning_visitor');
    if (!isReturning) {
      localStorage.setItem('returning_visitor', 'true');
      return 'new';
    }
    return 'returning';
  }

  private static queueEvent(event: string, properties: Record<string, any>): void {
    this.queue.push({ event, properties });
    
    if (this.queue.length >= ANALYTICS_CONFIG.CUSTOM.BATCH_SIZE) {
      this.flush();
    } else {
      this.saveQueueToStorage();
    }
  }

  private static scheduleFlush(): void {
    if (this.batchTimeout) return;

    this.batchTimeout = setTimeout(() => {
      this.flush();
    }, ANALYTICS_CONFIG.CUSTOM.FLUSH_INTERVAL);
  }

  private static async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];
    this.clearQueueFromStorage();

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      await fetch(ANALYTICS_CONFIG.CUSTOM.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });

      if (ANALYTICS_CONFIG.GA4.DEBUG_MODE) {
        console.log(`Flushed ${events.length} analytics events`);
      }
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue events on failure
      this.queue.unshift(...events);
      this.saveQueueToStorage();
    }

    this.scheduleFlush();
  }

  private static saveQueueToStorage(): void {
    try {
      localStorage.setItem(ANALYTICS_CONFIG.CUSTOM.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('Failed to save analytics queue:', error);
    }
  }

  private static loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(ANALYTICS_CONFIG.CUSTOM.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics queue:', error);
      this.clearQueueFromStorage();
    }
  }

  private static clearQueueFromStorage(): void {
    localStorage.removeItem(ANALYTICS_CONFIG.CUSTOM.STORAGE_KEY);
  }

  private static saveABTestAssignments(): void {
    try {
      const assignments = Object.fromEntries(this.abTestAssignments);
      localStorage.setItem(ANALYTICS_CONFIG.AB_TESTING.STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.warn('Failed to save A/B test assignments:', error);
    }
  }

  private static loadABTestAssignments(): void {
    try {
      const stored = localStorage.getItem(ANALYTICS_CONFIG.AB_TESTING.STORAGE_KEY);
      if (stored) {
        const assignments = JSON.parse(stored);
        this.abTestAssignments = new Map(Object.entries(assignments));
      }
    } catch (error) {
      console.warn('Failed to load A/B test assignments:', error);
    }
  }
}

// Legacy initialization function (enhanced)
export function initializeAnalytics(): void {
  AnalyticsManager.initialize();
}

// Track page views
export function trackPageView(url: string, title?: string): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag && ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: url,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Page view tracked', { url, title });
  }
}

// Track checkout steps
export function trackCheckoutStep(
  step: number,
  stepName: string,
  cart: Cart,
  additionalData?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  const items = cart.items.map(item => ({
    item_id: item.productId,
    item_name: `Product ${item.productId}`,
    quantity: item.quantity,
    price: item.price,
    item_variant: item.selectedVariants ? Object.values(item.selectedVariants).join(', ') : undefined,
  }));

  // Google Analytics Enhanced Ecommerce
  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: cart.currency,
      value: cart.total,
      items,
      checkout_step: step,
      checkout_option: stepName,
      ...additionalData,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: cart.total,
      currency: cart.currency,
      num_items: cart.items.length,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Checkout step tracked', { 
      step, 
      stepName, 
      value: cart.total,
      items: cart.items.length 
    });
  }
}

// Track add to cart
export function trackAddToCart(item: CartItem, cartTotal: number): void {
  if (typeof window === 'undefined') return;

  const analyticsItem = {
    item_id: item.productId,
    item_name: `Product ${item.productId}`,
    quantity: item.quantity,
    price: item.price,
    value: item.totalPrice,
    item_variant: item.selectedVariants ? Object.values(item.selectedVariants).join(', ') : undefined,
  };

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: item.totalPrice,
      items: [analyticsItem],
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      value: item.totalPrice,
      currency: 'USD',
      content_type: 'product',
      content_ids: [item.productId],
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Add to cart tracked', analyticsItem);
  }
}

// Track remove from cart
export function trackRemoveFromCart(item: CartItem): void {
  if (typeof window === 'undefined') return;

  const analyticsItem = {
    item_id: item.productId,
    item_name: `Product ${item.productId}`,
    quantity: item.quantity,
    price: item.price,
    value: item.totalPrice,
  };

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'USD',
      value: item.totalPrice,
      items: [analyticsItem],
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Remove from cart tracked', analyticsItem);
  }
}

// Track view cart
export function trackViewCart(cart: Cart): void {
  if (typeof window === 'undefined') return;

  const items = cart.items.map(item => ({
    item_id: item.productId,
    item_name: `Product ${item.productId}`,
    quantity: item.quantity,
    price: item.price,
    value: item.totalPrice,
  }));

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'view_cart', {
      currency: cart.currency,
      value: cart.total,
      items,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: View cart tracked', { value: cart.total, items: items.length });
  }
}

// Track purchase completion
export function trackPurchase(order: Order): void {
  if (typeof window === 'undefined') return;

  const items = order.items.map(item => ({
    item_id: item.productId,
    item_name: item.productTitle,
    quantity: item.quantity,
    price: item.price,
    value: item.totalPrice,
    item_variant: item.variantTitle,
  }));

  // Google Analytics Enhanced Ecommerce
  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: order.orderNumber,
      value: order.total,
      currency: order.currency,
      tax: order.tax,
      shipping: order.shipping,
      items,
    });
  }

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: order.total,
      currency: order.currency,
      content_type: 'product',
      content_ids: order.items.map(item => item.productId),
      num_items: order.items.length,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Purchase tracked', { 
      orderId: order.orderNumber,
      value: order.total,
      items: items.length 
    });
  }
}

// Track shipping selection
export function trackShippingSelection(
  shippingMethod: string,
  shippingCost: number,
  cartValue: number
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'select_shipping', {
      shipping_tier: shippingMethod,
      value: cartValue,
      currency: 'USD',
      shipping_cost: shippingCost,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Shipping selection tracked', { 
      method: shippingMethod,
      cost: shippingCost 
    });
  }
}

// Track payment method selection
export function trackPaymentMethodSelection(paymentMethod: string, cartValue: number): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'select_payment_method', {
      payment_type: paymentMethod,
      value: cartValue,
      currency: 'USD',
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Payment method selection tracked', { method: paymentMethod });
  }
}

// Track form completion
export function trackFormCompletion(
  formName: string,
  step: string,
  additionalData?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'form_submit', {
      form_name: formName,
      form_step: step,
      ...additionalData,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Form completion tracked', { formName, step });
  }
}

// Track checkout errors
export function trackCheckoutError(
  errorType: string,
  errorMessage: string,
  step: string,
  additionalData?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: `Checkout Error: ${errorType} - ${errorMessage}`,
      fatal: false,
      checkout_step: step,
      error_type: errorType,
      ...additionalData,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Checkout error tracked', { 
      errorType, 
      errorMessage, 
      step 
    });
  }
}

// Track user engagement
export function trackEngagement(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Engagement tracked', { action, category, label, value });
  }
}

// Track conversion funnel
export function trackConversionFunnel(
  funnelStep: string,
  funnelName: string,
  additionalData?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'conversion_funnel', {
      funnel_name: funnelName,
      funnel_step: funnelStep,
      ...additionalData,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Conversion funnel tracked', { funnelStep, funnelName });
  }
}

// A/B Test tracking
export function trackABTest(
  testName: string,
  variant: string,
  additionalData?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'ab_test_view', {
      test_name: testName,
      variant_name: variant,
      ...additionalData,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: A/B test tracked', { testName, variant });
  }
}

// Performance tracking
export function trackPerformance(
  metric: string,
  value: number,
  unit: string = 'ms'
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'timing_complete', {
      name: metric,
      value: value,
      unit: unit,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Performance metric tracked', { metric, value, unit });
  }
}

// Track custom events
export function trackCustomEvent(
  eventName: string,
  parameters: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, parameters);
  }

  // Facebook Pixel (if it's a commerce event)
  if (window.fbq && parameters.value && parameters.currency) {
    window.fbq('trackCustom', eventName, {
      value: parameters.value,
      currency: parameters.currency,
    });
  }

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Analytics: Custom event tracked', { eventName, parameters });
  }
}