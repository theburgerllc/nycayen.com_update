"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { InstagramFeedProps, InstagramMedia } from '../types';
import { useInstagramFeed } from '../hooks/useInstagramFeed';
import { useInstagramLightbox } from '../hooks/useInstagramLightbox';
import { InstagramPost } from './InstagramPost';
import { InstagramLightbox } from './InstagramLightbox';
import { InstagramFeedSkeleton } from './InstagramFeedSkeleton';
import { InstagramError as InstagramErrorComponent } from './InstagramError';
import { trackInstagramEngagement } from '../lib/analytics';
import { Loader2, RefreshCw, Grid, List } from 'lucide-react';

export function InstagramFeed({
  maxPosts = 25,
  showCaptions = true,
  showLightbox = true,
  gridColumns = 3,
  aspectRatio = 'square',
  className = '',
  onMediaClick,
  onError,
  onLoad,
}: InstagramFeedProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { 
    data, 
    loading, 
    error, 
    refetch, 
    refresh, 
    hasMore, 
    loadMore 
  } = useInstagramFeed({
    maxPosts,
    onError,
    onSuccess: onLoad,
  });

  const lightbox = useInstagramLightbox(data || [], {
    enableKeyboard: true,
    enableSwipe: true,
    preloadNext: 2,
  });

  const handleMediaClick = useCallback((media: InstagramMedia, index: number) => {
    // Track engagement
    trackInstagramEngagement({
      type: 'click',
      mediaId: media.id,
      mediaType: media.media_type,
      timestamp: new Date(),
      customProperties: {
        source: 'feed',
        position: index,
      },
    });

    // Custom click handler
    onMediaClick?.(media, index);

    // Open lightbox if enabled
    if (showLightbox) {
      lightbox.open(index);
    }
  }, [onMediaClick, showLightbox, lightbox]);

  const gridClasses = useMemo(() => {
    const baseClasses = 'grid gap-1 sm:gap-2 md:gap-4';
    
    if (viewMode === 'grid') {
      const columnClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-2 sm:grid-cols-3',
        4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
        5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
        6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
      };
      
      return `${baseClasses} ${columnClasses[gridColumns as keyof typeof columnClasses] || columnClasses[3]}`;
    }
    
    return `${baseClasses} grid-cols-1 max-w-2xl mx-auto`;
  }, [viewMode, gridColumns]);

  if (loading && !data) {
    return (
      <div className={`instagram-feed ${className}`}>
        <InstagramFeedSkeleton 
          columns={gridColumns} 
          count={12} 
          aspectRatio={aspectRatio}
        />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={`instagram-feed ${className}`}>
        <InstagramErrorComponent
          error={error}
          onRetry={refetch}
          showDetails={process.env.NODE_ENV === 'development'}
        />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`instagram-feed ${className}`}>
        <EmptyState onRefresh={refresh} />
      </div>
    );
  }

  return (
    <div className={`instagram-feed ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Instagram Feed
          </h2>
          <a
            href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'nycayenmoore'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#D4A574] hover:text-[#B8956A] font-medium"
            aria-label="View full Instagram profile"
          >
            @{process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'nycayenmoore'}
          </a>
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="hidden sm:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feed grid/list */}
      <div className={gridClasses}>
        {data.map((media, index) => (
          <InstagramPost
            key={media.id}
            media={media}
            index={index}
            showCaption={showCaptions && viewMode === 'list'}
            showCounts={true}
            onClick={handleMediaClick}
            className={`instagram-post ${viewMode === 'list' ? 'instagram-post--list' : ''}`}
            loading="lazy"
            priority={index < 6} // Prioritize first 6 images
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-[#D4A574] text-white font-medium rounded-lg hover:bg-[#B8956A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Loading...' : 'Load More'}</span>
          </button>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <InstagramLightbox
          media={data}
          initialIndex={lightbox.currentIndex}
          isOpen={lightbox.isOpen}
          onClose={lightbox.close}
          onNext={lightbox.next}
          onPrevious={lightbox.previous}
          showCaptions={showCaptions}
          showCounts={true}
          enableKeyboard={true}
          enableSwipe={true}
        />
      )}
    </div>
  );
}

// Empty state component
function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Grid className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Instagram posts found
      </h3>
      <p className="text-gray-500 mb-6">
        We couldn't load any Instagram posts at the moment.
      </p>
      <button
        onClick={onRefresh}
        className="px-4 py-2 bg-[#D4A574] text-white font-medium rounded-lg hover:bg-[#B8956A] transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}