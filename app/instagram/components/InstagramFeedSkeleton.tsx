"use client";

import React from 'react';

interface InstagramFeedSkeletonProps {
  columns?: number;
  count?: number;
  aspectRatio?: 'square' | 'original';
  className?: string;
}

export function InstagramFeedSkeleton({
  columns = 3,
  count = 12,
  aspectRatio = 'square',
  className = '',
}: InstagramFeedSkeletonProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <SkeletonItem key={index} aspectRatio={aspectRatio} />
  ));

  return (
    <div className={`instagram-feed-skeleton ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <div className="h-7 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className={`grid gap-1 sm:gap-2 md:gap-4 ${gridClasses[columns as keyof typeof gridClasses] || gridClasses[3]}`}>
        {skeletonItems}
      </div>

      {/* Load more button skeleton */}
      <div className="flex justify-center mt-6 sm:mt-8">
        <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonItem({ aspectRatio }: { aspectRatio: 'square' | 'original' }) {
  return (
    <div className="instagram-post-skeleton">
      {/* Image skeleton */}
      <div className={`${aspectRatio === 'square' ? 'aspect-square' : 'aspect-[4/5]'} bg-gray-200 rounded-lg animate-pulse relative overflow-hidden`}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        
        {/* Overlay elements skeleton */}
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
        </div>
        
        <div className="absolute bottom-2 left-2 flex space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
          <div className="w-8 h-4 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// CSS for shimmer animation (add to globals.css)
export const shimmerCSS = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
`;