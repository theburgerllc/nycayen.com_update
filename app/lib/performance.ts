// app/lib/performance.ts
"use client";

import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

export interface VitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, VitalsMetric> = new Map();
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeWebVitals();
    this.initializeResourceObserver();
    this.initializeLongTaskObserver();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeWebVitals() {
    // Core Web Vitals monitoring
    getCLS(this.onVitalMetric.bind(this), true);
    getFCP(this.onVitalMetric.bind(this), true);
    getFID(this.onVitalMetric.bind(this), true);
    getLCP(this.onVitalMetric.bind(this), true);
    getTTFB(this.onVitalMetric.bind(this), true);
  }

  private onVitalMetric(metric: VitalsMetric) {
    this.metrics.set(metric.name, metric);
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(metric);
    }

    // Log performance issues
    if (metric.rating === 'poor') {
      console.warn(`Poor ${metric.name} performance:`, metric.value);
      this.logPerformanceIssue(metric);
    }
  }

  private initializeResourceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.analyzeResourceTiming(entry as PerformanceResourceTiming);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Failed to initialize resource observer:', error);
    }
  }

  private initializeLongTaskObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn('Long task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            });
          }
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Failed to initialize long task observer:', error);
    }
  }

  private analyzeResourceTiming(entry: PerformanceResourceTiming) {
    const { name, duration, transferSize, encodedBodySize } = entry;

    // Flag slow resources
    if (duration > 1000) {
      console.warn('Slow resource detected:', {
        url: name,
        duration: Math.round(duration),
        size: transferSize
      });
    }

    // Flag large resources
    if (transferSize > 500000) { // 500KB
      console.warn('Large resource detected:', {
        url: name,
        transferSize: Math.round(transferSize / 1024) + 'KB',
        encodedSize: Math.round(encodedBodySize / 1024) + 'KB'
      });
    }
  }

  private sendToAnalytics(metric: VitalsMetric) {
    // Send to Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_map: {
          metric_rating: metric.rating,
          metric_delta: metric.delta
        }
      });
    }

    // Send to Vercel Analytics
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', 'web-vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id
      });
    }
  }

  private logPerformanceIssue(metric: VitalsMetric) {
    const issue = {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : null
    };

    // Store in session storage for debugging
    const issues = JSON.parse(sessionStorage.getItem('performance-issues') || '[]');
    issues.push(issue);
    sessionStorage.setItem('performance-issues', JSON.stringify(issues.slice(-10))); // Keep last 10
  }

  public getMetrics(): Map<string, VitalsMetric> {
    return this.metrics;
  }

  public getMetric(name: string): VitalsMetric | undefined {
    return this.metrics.get(name);
  }

  public isPerformanceGood(): boolean {
    const criticalMetrics = ['LCP', 'FID', 'CLS'];
    return criticalMetrics.every(metric => {
      const vitalsMetric = this.metrics.get(metric);
      return !vitalsMetric || vitalsMetric.rating !== 'poor';
    });
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Resource hints utilities
export class ResourceOptimizer {
  private static preloadedResources = new Set<string>();

  public static preloadResource(href: string, as: string, type?: string) {
    if (typeof document === 'undefined' || this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;
    
    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  public static prefetchResource(href: string) {
    if (typeof document === 'undefined' || this.preloadedResources.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    
    document.head.appendChild(link);
    this.preloadedResources.add(href);
  }

  public static preconnectToDomain(href: string, crossorigin = false) {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    if (crossorigin) link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
  }

  public static initializeCriticalResourceHints() {
    // Preconnect to external domains
    this.preconnectToDomain('https://fonts.googleapis.com');
    this.preconnectToDomain('https://fonts.gstatic.com', true);
    this.preconnectToDomain('https://www.google-analytics.com');
    this.preconnectToDomain('https://vitals.vercel-analytics.com');

    // Preload critical fonts
    this.preloadResource(
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap',
      'style'
    );
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Initialize all performance utilities
  PerformanceMonitor.getInstance();
  ResourceOptimizer.initializeCriticalResourceHints();

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        ResourceOptimizer.initializeCriticalResourceHints();
      }, 100);
    });
  } else {
    setTimeout(() => {
      ResourceOptimizer.initializeCriticalResourceHints();
    }, 100);
  }
}

export default PerformanceMonitor;