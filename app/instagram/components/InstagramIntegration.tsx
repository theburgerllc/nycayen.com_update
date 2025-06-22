"use client";

import React, { Suspense, useState } from 'react';
import { InstagramErrorBoundary } from './InstagramErrorBoundary';
import { InstagramFeed } from './InstagramFeed';
import { InstagramFallback } from './InstagramFallback';
import { InstagramFeedSkeleton } from './InstagramFeedSkeleton';
import { initializeInstagramAnalytics } from '../lib/analytics';

interface InstagramIntegrationProps {
  maxPosts?: number;
  showCaptions?: boolean;
  showLightbox?: boolean;
  gridColumns?: number;
  aspectRatio?: 'square' | 'original';
  className?: string;
  enableFallback?: boolean;
  enableAnalytics?: boolean;
  title?: string;
  description?: string;
}

export function InstagramIntegration({
  maxPosts = 25,
  showCaptions = true,
  showLightbox = true,
  gridColumns = 3,
  aspectRatio = 'square',
  className = '',
  enableFallback = true,
  enableAnalytics = true,
  title = 'Follow Our Journey',
  description = 'See our latest hair transformations and styling inspiration',
}: InstagramIntegrationProps) {
  const [showFallback, setShowFallback] = useState(false);

  // Initialize analytics on mount
  React.useEffect(() => {
    if (enableAnalytics) {
      initializeInstagramAnalytics();
    }
  }, [enableAnalytics]);

  const handleError = (error: any) => {
    console.error('Instagram feed error:', error);
    if (enableFallback) {
      setShowFallback(true);
    }
  };

  const handleLoad = (data: any) => {
    // Reset fallback state if feed loads successfully
    if (showFallback) {
      setShowFallback(false);
    }
  };

  // Show fallback immediately if requested
  if (showFallback && enableFallback) {
    return (
      <section className={`instagram-integration ${className}`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>
        <InstagramFallback 
          maxPosts={Math.min(maxPosts, 12)} 
          showHeader={false}
          reason="api_error"
        />
      </section>
    );
  }

  return (
    <section className={`instagram-integration ${className}`}>
      {/* Section header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Instagram feed with error boundary and suspense */}
      <InstagramErrorBoundary
        onError={handleError}
        fallback={
          enableFallback ? (
            <InstagramFallback 
              maxPosts={Math.min(maxPosts, 12)} 
              showHeader={false}
              reason="api_error"
            />
          ) : undefined
        }
      >
        <Suspense
          fallback={
            <InstagramFeedSkeleton
              columns={gridColumns}
              count={Math.min(maxPosts, 12)}
              aspectRatio={aspectRatio}
            />
          }
        >
          <InstagramFeed
            maxPosts={maxPosts}
            showCaptions={showCaptions}
            showLightbox={showLightbox}
            gridColumns={gridColumns}
            aspectRatio={aspectRatio}
            onError={handleError}
            onLoad={handleLoad}
          />
        </Suspense>
      </InstagramErrorBoundary>
    </section>
  );
}

// Pre-configured variations for different use cases
export const InstagramFeedMini = (props: Partial<InstagramIntegrationProps>) => (
  <InstagramIntegration
    maxPosts={6}
    gridColumns={3}
    showCaptions={false}
    showLightbox={true}
    title="Latest Posts"
    description="Follow us on Instagram for daily inspiration"
    {...props}
  />
);

export const InstagramFeedGallery = (props: Partial<InstagramIntegrationProps>) => (
  <InstagramIntegration
    maxPosts={12}
    gridColumns={4}
    showCaptions={false}
    showLightbox={true}
    aspectRatio="square"
    title="Instagram Gallery"
    description="Explore our portfolio of stunning hair transformations"
    {...props}
  />
);

export const InstagramFeedFull = (props: Partial<InstagramIntegrationProps>) => (
  <InstagramIntegration
    maxPosts={25}
    gridColumns={3}
    showCaptions={true}
    showLightbox={true}
    title="Follow Our Journey"
    description="See our latest work, behind-the-scenes content, and hair inspiration"
    {...props}
  />
);

// Widget version for sidebar or small spaces
export const InstagramWidget = ({ 
  className = '',
  maxPosts = 4,
  ...props 
}: Partial<InstagramIntegrationProps>) => (
  <div className={`instagram-widget bg-white rounded-lg shadow-sm border p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Instagram</h3>
      <a
        href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'nycayenmoore'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#D4A574] hover:text-[#B8956A] text-sm font-medium"
      >
        Follow Us
      </a>
    </div>
    
    <InstagramIntegration
      maxPosts={maxPosts}
      gridColumns={2}
      showCaptions={false}
      showLightbox={true}
      enableFallback={true}
      title=""
      description=""
      {...props}
    />
  </div>
);