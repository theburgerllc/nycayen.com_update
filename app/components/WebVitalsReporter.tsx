'use client';

import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB, onINP } from 'web-vitals';

type MetricName = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';

interface Metric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

interface WebVitalsReporterProps {
  onMetric?: (metric: Metric) => void;
  debug?: boolean;
}

const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: Metric) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      custom_map: {
        metric_rating: metric.rating,
        metric_delta: metric.delta,
      },
    });
  }

  // Send to custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType,
      }),
    }).catch(console.error);
  }
}

function logMetric(metric: Metric, debug: boolean) {
  if (debug) {
    const color = metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red';
    console.log(
      `%c${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
}

export default function WebVitalsReporter({ onMetric, debug = false }: WebVitalsReporterProps) {
  useEffect(() => {
    function handleMetric(metric: Metric) {
      logMetric(metric, debug);
      sendToAnalytics(metric);
      onMetric?.(metric);
    }

    // Core Web Vitals
    getCLS((metric) => {
      handleMetric({
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    getFID((metric) => {
      handleMetric({
        name: 'FID',
        value: metric.value,
        rating: getRating('FID', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    getLCP((metric) => {
      handleMetric({
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    // Additional metrics
    getFCP((metric) => {
      handleMetric({
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    getTTFB((metric) => {
      handleMetric({
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    // Interaction to Next Paint (replaces FID in some contexts)
    onINP((metric) => {
      handleMetric({
        name: 'INP',
        value: metric.value,
        rating: getRating('INP', metric.value),
        delta: metric.delta,
        id: metric.id,
      });
    });

    // Performance Observer for custom metrics
    if ('PerformanceObserver' in window) {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.navigationStart;
            const loadComplete = navEntry.loadEventEnd - navEntry.navigationStart;
            
            if (debug) {
              console.log(`DOM Content Loaded: ${domContentLoaded.toFixed(2)}ms`);
              console.log(`Load Complete: ${loadComplete.toFixed(2)}ms`);
            }
          }
        });
      });

      navObserver.observe({ entryTypes: ['navigation'] });

      // Observe resource timing for slow resources
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.duration > 1000) { // Resources taking more than 1s
            if (debug) {
              console.warn(`Slow resource: ${resourceEntry.name} took ${resourceEntry.duration.toFixed(2)}ms`);
            }
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });

      return () => {
        navObserver.disconnect();
        resourceObserver.disconnect();
      };
    }
  }, [onMetric, debug]);

  return null;
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private marks: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasurement(name: string): void {
    if (typeof window === 'undefined') return;
    
    const startTime = performance.now();
    this.marks.set(name, startTime);
    performance.mark(`${name}-start`);
  }

  endMeasurement(name: string): number | null {
    if (typeof window === 'undefined') return null;
    
    const startTime = this.marks.get(name);
    if (!startTime) return null;

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.metrics.set(name, duration);
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    return duration;
  }

  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics.entries());
  }

  reportCustomMetric(name: string, value: number, unit = 'ms'): void {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'custom_metric', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value),
        custom_map: { unit },
      });
    }
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  return {
    startMeasurement: monitor.startMeasurement.bind(monitor),
    endMeasurement: monitor.endMeasurement.bind(monitor),
    getMetric: monitor.getMetric.bind(monitor),
    getAllMetrics: monitor.getAllMetrics.bind(monitor),
    reportCustomMetric: monitor.reportCustomMetric.bind(monitor),
  };
}