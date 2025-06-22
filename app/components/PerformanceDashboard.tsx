'use client';

import { useState, useEffect, useCallback } from 'react';
import { PerformanceMonitor, usePerformanceMonitor } from './WebVitalsReporter';

interface PerformanceMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  inp: number | null;
}

interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
}

interface PerformanceDashboardProps {
  isVisible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function PerformanceDashboard({ 
  isVisible = false, 
  position = 'bottom-right' 
}: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null,
  });
  
  const [resources, setResources] = useState<ResourceTiming[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const monitor = usePerformanceMonitor();

  const handleMetricUpdate = useCallback((metric: any) => {
    setMetrics(prev => ({
      ...prev,
      [metric.name.toLowerCase()]: metric.value,
    }));
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Collect resource timing data
    const collectResourceTimings = () => {
      if (!('performance' in window)) return;

      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const resourceData = resourceEntries
        .filter(entry => entry.duration > 0)
        .map(entry => ({
          name: entry.name.split('/').pop() || entry.name,
          duration: Math.round(entry.duration),
          size: entry.transferSize || 0,
          type: getResourceType(entry.name),
        }))
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10);

      setResources(resourceData);
    };

    collectResourceTimings();

    // Update resource timings periodically
    const interval = setInterval(collectResourceTimings, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const getResourceType = (url: string): string => {
    if (url.match(/\.(js|jsx|ts|tsx)$/)) return 'script';
    if (url.match(/\.(css|scss|sass)$/)) return 'style';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  };

  const getMetricColor = (name: string, value: number | null): string => {
    if (value === null) return 'text-gray-400';

    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
      inp: { good: 200, poor: 500 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'text-gray-400';

    if (value <= threshold.good) return 'text-green-500';
    if (value <= threshold.poor) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatValue = (name: string, value: number): string => {
    if (name === 'cls') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  const getResourceTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      script: 'bg-blue-100 text-blue-800',
      style: 'bg-purple-100 text-purple-800',
      image: 'bg-green-100 text-green-800',
      font: 'bg-orange-100 text-orange-800',
      api: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 bg-white shadow-lg rounded-lg border max-w-sm`}>
      <div className="p-3 border-b bg-gray-50 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold text-sm text-gray-900">Performance</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(metrics).map(([name, value]) => (
            <div key={name} className="flex justify-between">
              <span className="text-gray-600 uppercase">{name}:</span>
              <span className={getMetricColor(name, value)}>
                {value !== null ? formatValue(name, value) : '—'}
              </span>
            </div>
          ))}
        </div>

        {isExpanded && (
          <>
            <div className="mt-4 pt-3 border-t">
              <h4 className="font-medium text-xs text-gray-900 mb-2">Slow Resources</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <span
                        className={`px-1 py-0.5 rounded text-xs font-medium ${getResourceTypeColor(resource.type)}`}
                      >
                        {resource.type}
                      </span>
                      <span className="truncate text-gray-600" title={resource.name}>
                        {resource.name}
                      </span>
                    </div>
                    <span className="text-red-600 font-medium">
                      {resource.duration}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between text-xs">
                <button
                  onClick={() => {
                    if ('performance' in window) {
                      performance.mark('user-interaction');
                      console.log('Performance mark set');
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Mark
                </button>
                <button
                  onClick={() => {
                    console.log('Performance Metrics:', metrics);
                    console.log('Resource Timings:', resources);
                  }}
                  className="text-green-600 hover:text-green-800"
                >
                  Log
                </button>
                <button
                  onClick={() => {
                    if ('performance' in window) {
                      performance.clearMarks();
                      performance.clearMeasures();
                    }
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Performance testing utilities
export class PerformanceTester {
  private results: Map<string, number[]> = new Map();

  async testPageLoad(url: string, iterations = 3): Promise<{
    averageLoadTime: number;
    averageFCP: number;
    averageLCP: number;
    results: Array<{ loadTime: number; fcp: number; lcp: number }>;
  }> {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // Simulate page navigation
      await new Promise(resolve => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.onload = () => {
          const loadTime = performance.now() - startTime;
          
          // Get performance metrics from iframe
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow && 'performance' in iframeWindow) {
            const nav = iframeWindow.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const fcp = nav.responseStart - nav.navigationStart;
            const lcp = nav.loadEventEnd - nav.navigationStart;
            
            results.push({ loadTime, fcp, lcp });
          }
          
          document.body.removeChild(iframe);
          resolve(void 0);
        };
        
        iframe.src = url;
        document.body.appendChild(iframe);
      });
    }

    const averageLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;
    const averageFCP = results.reduce((sum, r) => sum + r.fcp, 0) / results.length;
    const averageLCP = results.reduce((sum, r) => sum + r.lcp, 0) / results.length;

    return {
      averageLoadTime,
      averageFCP,
      averageLCP,
      results,
    };
  }

  measureFunction<T extends (...args: any[]) => any>(
    name: string,
    fn: T,
    iterations = 100
  ): { averageTime: number; results: number[] } {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      fn();
      const end = performance.now();
      results.push(end - start);
    }

    const averageTime = results.reduce((sum, time) => sum + time, 0) / results.length;
    this.results.set(name, results);

    return { averageTime, results };
  }

  async testAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    name: string,
    fn: T,
    iterations = 10
  ): Promise<{ averageTime: number; results: number[] }> {
    const results = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      results.push(end - start);
    }

    const averageTime = results.reduce((sum, time) => sum + time, 0) / results.length;
    this.results.set(name, results);

    return { averageTime, results };
  }

  getResults(name: string): number[] | undefined {
    return this.results.get(name);
  }

  getAllResults(): Record<string, number[]> {
    return Object.fromEntries(this.results.entries());
  }

  generateReport(): string {
    let report = 'Performance Test Report\n';
    report += '========================\n\n';

    this.results.forEach((times, name) => {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      const p95 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

      report += `${name}:\n`;
      report += `  Average: ${avg.toFixed(2)}ms\n`;
      report += `  Min: ${min.toFixed(2)}ms\n`;
      report += `  Max: ${max.toFixed(2)}ms\n`;
      report += `  95th percentile: ${p95.toFixed(2)}ms\n`;
      report += `  Iterations: ${times.length}\n\n`;
    });

    return report;
  }
}

// Global performance tester instance
export const performanceTester = new PerformanceTester();