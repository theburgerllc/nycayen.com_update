import { getPlaiceholder } from 'plaiceholder';

// Default blur placeholder data URL
const DEFAULT_BLUR_PLACEHOLDER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  blur?: boolean;
  placeholder?: boolean;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  className?: string;
  blurDataURL?: string;
  placeholder?: 'blur' | 'empty';
}

/**
 * Generates a blur placeholder for an image
 */
export async function generateBlurPlaceholder(imageSrc: string): Promise<string> {
  try {
    if (imageSrc.startsWith('data:')) {
      return DEFAULT_BLUR_PLACEHOLDER;
    }

    // For external images, return default blur
    if (imageSrc.startsWith('http')) {
      return DEFAULT_BLUR_PLACEHOLDER;
    }

    // For local images, we could implement plaiceholder
    // but for now return default to avoid build-time dependencies
    return DEFAULT_BLUR_PLACEHOLDER;
  } catch (error) {
    console.warn('Failed to generate blur placeholder:', error);
    return DEFAULT_BLUR_PLACEHOLDER;
  }
}

/**
 * Optimizes image props for performance
 */
export function optimizeImageProps(
  src: string,
  alt: string,
  config: ImageOptimizationConfig = {}
): OptimizedImageProps {
  const {
    quality = 85,
    format = 'auto',
    blur = true,
    placeholder = true,
  } = config;

  const optimizedProps: OptimizedImageProps = {
    src,
    alt,
    ...(blur && placeholder && {
      placeholder: 'blur' as const,
      blurDataURL: DEFAULT_BLUR_PLACEHOLDER,
    }),
  };

  return optimizedProps;
}

/**
 * Generates responsive image sizes based on breakpoints
 */
export function generateResponsiveSizes(breakpoints: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  wide?: string;
}): string {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw',
    wide = '25vw',
  } = breakpoints;

  return `(max-width: 640px) ${mobile}, (max-width: 1024px) ${tablet}, (max-width: 1536px) ${desktop}, ${wide}`;
}

/**
 * Preloads critical images for better performance
 */
export function preloadImage(src: string, as: 'image' = 'image'): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Creates intersection observer for lazy loading
 */
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
}

/**
 * Image loading states
 */
export type ImageLoadingState = 'loading' | 'loaded' | 'error';

/**
 * Hook for managing image loading state
 */
export function useImageLoadingState(src: string) {
  const [loadingState, setLoadingState] = React.useState<ImageLoadingState>('loading');

  React.useEffect(() => {
    if (!src) return;

    setLoadingState('loading');
    
    const img = new Image();
    img.onload = () => setLoadingState('loaded');
    img.onerror = () => setLoadingState('error');
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return loadingState;
}

// React import for the hook
import React from 'react';

/**
 * Performance monitoring for images
 */
export interface ImagePerformanceMetrics {
  loadTime: number;
  size: { width: number; height: number };
  format: string;
  compressed: boolean;
}

export function trackImagePerformance(
  src: string,
  onMetrics?: (metrics: ImagePerformanceMetrics) => void
): void {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();
  const img = new Image();

  img.onload = () => {
    const loadTime = performance.now() - startTime;
    const metrics: ImagePerformanceMetrics = {
      loadTime,
      size: { width: img.naturalWidth, height: img.naturalHeight },
      format: src.split('.').pop()?.toLowerCase() || 'unknown',
      compressed: src.includes('webp') || src.includes('avif'),
    };

    onMetrics?.(metrics);

    // Report to analytics if available
    if ('gtag' in window) {
      (window as any).gtag('event', 'image_load', {
        custom_parameter_1: loadTime,
        custom_parameter_2: metrics.format,
      });
    }
  };

  img.src = src;
}