// app/components/OptimizedImage.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'eager' | 'lazy';
  unoptimized?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  style,
  onLoad,
  onError,
  loading = 'lazy',
  unoptimized = false,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Load 50px before coming into view
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate blur data URL if not provided
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple blur placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjNmNGY2Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTVlN2ViIi8+Cjwvc3ZnPgo=';
  };

  // Error fallback component
  const ErrorFallback = () => (
    <div 
      className={`bg-gray-200 flex items-center justify-center text-gray-500 text-sm ${className}`}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        minHeight: height ? `${height}px` : '200px',
        ...style
      }}
    >
      <div className="text-center">
        <svg 
          className="w-8 h-8 mx-auto mb-2 opacity-50" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
            clipRule="evenodd" 
          />
        </svg>
        <p>Image failed to load</p>
      </div>
    </div>
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <motion.div
      className={`bg-gray-200 animate-pulse ${className}`}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        minHeight: height ? `${height}px` : '200px',
        ...style
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
    </motion.div>
  );

  // Container dimensions
  const containerStyle = {
    width: fill ? '100%' : width,
    height: fill ? '100%' : height,
    position: fill ? 'relative' as const : undefined,
    ...style
  };

  if (hasError) {
    return <ErrorFallback />;
  }

  return (
    <div ref={imgRef} style={containerStyle} className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        {!isInView ? (
          <LoadingSkeleton key="skeleton" />
        ) : (
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={src}
              alt={alt}
              width={fill ? undefined : width}
              height={fill ? undefined : height}
              fill={fill}
              priority={priority}
              quality={quality}
              placeholder={placeholder}
              blurDataURL={placeholder === 'blur' ? getBlurDataURL() : undefined}
              sizes={sizes}
              loading={loading}
              unoptimized={unoptimized}
              onLoad={handleLoad}
              onError={handleError}
              className={`transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              } ${fill ? 'object-cover' : ''}`}
              style={{
                ...(fill ? { objectFit: 'cover' } : {}),
              }}
            />
            
            {/* Loading overlay */}
            <AnimatePresence>
              {!isLoaded && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-gray-200 animate-pulse"
                >
                  <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}