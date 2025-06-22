'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';

// Skeleton loading components
interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function SkeletonBox({ className = '', animate = true }: SkeletonProps) {
  return (
    <div 
      className={`bg-gray-300 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
      aria-label="Loading..."
    />
  );
}

export function SkeletonText({ className = '', animate = true }: SkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className={`h-4 bg-gray-300 rounded ${animate ? 'animate-pulse' : ''}`} />
      <div className={`h-4 bg-gray-300 rounded w-3/4 ${animate ? 'animate-pulse' : ''}`} />
    </div>
  );
}

export function SkeletonCard({ className = '', animate = true }: SkeletonProps) {
  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <SkeletonBox className={`h-48 mb-4 ${animate ? 'animate-pulse' : ''}`} />
      <SkeletonText animate={animate} />
    </div>
  );
}

// Intersection Observer Hook for Lazy Loading
interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { freezeOnceVisible = false, ...observerOptions } = options;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }

        if (freezeOnceVisible && hasIntersected) {
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...observerOptions,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasIntersected, freezeOnceVisible, observerOptions]);

  return { ref, isIntersecting, hasIntersected };
}

// Lazy Loading Component
interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function LazyLoad({ 
  children, 
  fallback = <SkeletonBox className="h-64" />, 
  className = '',
  threshold = 0.1,
  rootMargin = '50px'
}: LazyLoadProps) {
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold,
    rootMargin,
    freezeOnceVisible: true,
  });

  return (
    <div ref={ref} className={className}>
      {hasIntersected ? children : fallback}
    </div>
  );
}

// Progressive Image Loading
interface ProgressiveImageProps {
  src: string;
  placeholder?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function ProgressiveImage({
  src,
  placeholder,
  alt,
  className = '',
  onLoad,
  onError,
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad, onError]);

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-50'
          }`}
        />
      )}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// Resource Preloader
interface PreloadResource {
  href: string;
  as: 'style' | 'script' | 'font' | 'image';
  type?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}

export function useResourcePreloader(resources: PreloadResource[]) {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    resources.forEach(({ href, as, type, crossOrigin }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      
      if (type) link.type = type;
      if (crossOrigin) link.crossOrigin = crossOrigin;

      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources]);
}

// Performance Budget Monitor
interface PerformanceBudget {
  maxLoadTime?: number; // ms
  maxBundleSize?: number; // bytes
  maxImageSize?: number; // bytes
}

export function usePerformanceBudget(budget: PerformanceBudget) {
  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const newViolations: string[] = [];

      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const loadTime = navEntry.loadEventEnd - navEntry.navigationStart;
          
          if (budget.maxLoadTime && loadTime > budget.maxLoadTime) {
            newViolations.push(`Load time exceeded: ${loadTime}ms > ${budget.maxLoadTime}ms`);
          }
        }

        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          if (budget.maxBundleSize && 
              resourceEntry.name.includes('.js') && 
              resourceEntry.transferSize > budget.maxBundleSize) {
            newViolations.push(`Bundle size exceeded: ${resourceEntry.transferSize} bytes > ${budget.maxBundleSize} bytes`);
          }

          if (budget.maxImageSize && 
              /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(resourceEntry.name) &&
              resourceEntry.transferSize > budget.maxImageSize) {
            newViolations.push(`Image size exceeded: ${resourceEntry.transferSize} bytes > ${budget.maxImageSize} bytes`);
          }
        }
      });

      if (newViolations.length > 0) {
        setViolations(prev => [...prev, ...newViolations]);
      }
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => observer.disconnect();
  }, [budget]);

  return violations;
}

// Critical CSS Detection
export function detectCriticalCSS() {
  if (typeof window === 'undefined') return;

  const criticalElements = document.querySelectorAll('*');
  const criticalSelectors = new Set<string>();

  criticalElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const isAboveFold = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isAboveFold) {
      // Get computed styles for critical elements
      const computedStyle = window.getComputedStyle(element);
      const tagName = element.tagName.toLowerCase();
      const className = element.className;
      const id = element.id;

      if (id) criticalSelectors.add(`#${id}`);
      if (className) {
        className.split(' ').forEach(cls => {
          if (cls) criticalSelectors.add(`.${cls}`);
        });
      }
      criticalSelectors.add(tagName);
    }
  });

  console.log('Critical CSS selectors:', Array.from(criticalSelectors));
  return Array.from(criticalSelectors);
}

// Font Loading Optimization
export function optimizeFontLoading(fontFamilies: string[]) {
  useEffect(() => {
    if (!('fonts' in document)) return;

    const loadPromises = fontFamilies.map(async (family) => {
      try {
        await (document as any).fonts.load(`1rem ${family}`);
        console.log(`Font loaded: ${family}`);
      } catch (error) {
        console.warn(`Font loading failed: ${family}`, error);
      }
    });

    Promise.all(loadPromises).then(() => {
      console.log('All fonts loaded');
      document.documentElement.classList.add('fonts-loaded');
    });
  }, [fontFamilies]);
}