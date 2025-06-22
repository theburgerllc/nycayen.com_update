"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { InstagramPostProps, InstagramMedia } from '../types';
import { Heart, MessageCircle, Play, Eye } from 'lucide-react';
import { trackInstagramEngagement } from '../lib/analytics';

export function InstagramPost({
  media,
  index,
  showCaption = false,
  showCounts = true,
  onClick,
  className = '',
  loading = 'lazy',
  priority = false,
}: InstagramPostProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection observer for view tracking
  useEffect(() => {
    if (elementRef.current && typeof window !== 'undefined') {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isInView) {
              setIsInView(true);
              
              // Track view event
              trackInstagramEngagement({
                type: 'view',
                mediaId: media.id,
                mediaType: media.media_type,
                timestamp: new Date(),
                customProperties: {
                  position: index,
                  source: 'feed',
                },
              });
            }
          });
        },
        {
          threshold: 0.5, // Trigger when 50% of the element is visible
          rootMargin: '50px',
        }
      );

      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [media.id, media.media_type, index, isInView]);

  const handleClick = useCallback(() => {
    onClick?.(media, index);
  }, [onClick, media, index]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageFailed(true);
    console.warn('Failed to load Instagram image:', media.media_url);
  }, [media.media_url]);

  const formatCount = useCallback((count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  }, []);

  const formatDate = useCallback((timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const getImageSrc = useCallback(() => {
    if (media.media_type === 'VIDEO' && media.thumbnail_url) {
      return media.thumbnail_url;
    }
    return media.media_url;
  }, [media]);

  if (imageFailed) {
    return (
      <div 
        ref={elementRef}
        className={`instagram-post instagram-post--failed ${className}`}
      >
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Failed to load</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={elementRef}
      className={`instagram-post group cursor-pointer ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Instagram post: ${media.caption ? media.caption.substring(0, 100) + '...' : 'View post'}`}
    >
      {/* Image/Video thumbnail container */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        {/* Loading skeleton */}
        {!imageLoaded && !imageFailed && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Main image */}
        <Image
          src={getImageSrc()}
          alt={media.caption || 'Instagram post'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={loading}
          priority={priority}
        />

        {/* Video play indicator */}
        {media.media_type === 'VIDEO' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3 group-hover:bg-black/70 transition-colors">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
        )}

        {/* Carousel indicator */}
        {media.media_type === 'CAROUSEL_ALBUM' && (
          <div className="absolute top-2 right-2">
            <div className="bg-black/50 rounded-full p-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="w-2 h-2 bg-white/50 rounded-full" />
                <div className="w-2 h-2 bg-white/50 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Hover overlay with engagement stats */}
        {showCounts && (media.like_count !== undefined || media.comments_count !== undefined) && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center space-x-4 text-white">
              {media.like_count !== undefined && (
                <div className="flex items-center space-x-1">
                  <Heart className="w-5 h-5 fill-current" />
                  <span className="font-medium">{formatCount(media.like_count)}</span>
                </div>
              )}
              {media.comments_count !== undefined && (
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span className="font-medium">{formatCount(media.comments_count)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Featured badge */}
        {media.is_featured && (
          <div className="absolute top-2 left-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Featured
            </div>
          </div>
        )}
      </div>

      {/* Caption and metadata (for list view) */}
      {showCaption && (
        <div className="mt-3 space-y-2">
          {/* Post metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formatDate(media.timestamp)}</span>
            {showCounts && (
              <div className="flex items-center space-x-3">
                {media.like_count !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{formatCount(media.like_count)}</span>
                  </div>
                )}
                {media.comments_count !== undefined && (
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{formatCount(media.comments_count)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Caption */}
          {media.caption && (
            <div className="text-sm text-gray-800">
              <p className="line-clamp-3">{media.caption}</p>
            </div>
          )}

          {/* Tags */}
          {media.tags && media.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {media.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-xs text-[#D4A574] hover:text-[#B8956A] cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
              {media.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{media.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}