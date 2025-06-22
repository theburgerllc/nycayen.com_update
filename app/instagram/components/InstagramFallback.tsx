"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Grid, ExternalLink, Heart, MessageCircle, Play } from 'lucide-react';

interface InstagramFallbackProps {
  className?: string;
  showHeader?: boolean;
  maxPosts?: number;
  reason?: 'api_error' | 'network_error' | 'rate_limit' | 'maintenance';
}

// Static fallback content - replace with your actual recent posts
const FALLBACK_POSTS = [
  {
    id: '1',
    image: '/images/instagram-fallback/post-1.jpg',
    caption: 'Beautiful hair transformation ✨ #hairstyling #transformation',
    likes: 245,
    comments: 18,
    timestamp: '2024-01-15T10:30:00Z',
    isVideo: false,
    permalink: 'https://instagram.com/p/example1',
  },
  {
    id: '2',
    image: '/images/instagram-fallback/post-2.jpg',
    caption: 'Stunning protective styles for natural hair 💫 #protectivestyles #naturalhair',
    likes: 189,
    comments: 22,
    timestamp: '2024-01-14T15:45:00Z',
    isVideo: true,
    permalink: 'https://instagram.com/p/example2',
  },
  {
    id: '3',
    image: '/images/instagram-fallback/post-3.jpg',
    caption: 'Color consultation and highlights ✨ Book your appointment! #haircolor',
    likes: 312,
    comments: 35,
    timestamp: '2024-01-13T09:20:00Z',
    isVideo: false,
    permalink: 'https://instagram.com/p/example3',
  },
  {
    id: '4',
    image: '/images/instagram-fallback/post-4.jpg',
    caption: 'Bridal hair perfection 👰‍♀️ #bridalhair #wedding',
    likes: 278,
    comments: 41,
    timestamp: '2024-01-12T12:15:00Z',
    isVideo: false,
    permalink: 'https://instagram.com/p/example4',
  },
  {
    id: '5',
    image: '/images/instagram-fallback/post-5.jpg',
    caption: 'Lace front wig installation tutorial 💄 #wiginstall #lacefront',
    likes: 156,
    comments: 28,
    timestamp: '2024-01-11T16:30:00Z',
    isVideo: true,
    permalink: 'https://instagram.com/p/example5',
  },
  {
    id: '6',
    image: '/images/instagram-fallback/post-6.jpg',
    caption: 'Behind the scenes at the salon 🎬 #bts #salonlife',
    likes: 198,
    comments: 15,
    timestamp: '2024-01-10T11:45:00Z',
    isVideo: false,
    permalink: 'https://instagram.com/p/example6',
  },
];

export function InstagramFallback({
  className = '',
  showHeader = true,
  maxPosts = 6,
  reason = 'api_error',
}: InstagramFallbackProps) {
  const [posts] = useState(FALLBACK_POSTS.slice(0, maxPosts));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getReasonMessage = () => {
    switch (reason) {
      case 'network_error':
        return 'Unable to connect to Instagram. Showing recent posts.';
      case 'rate_limit':
        return 'Instagram rate limit reached. Showing cached posts.';
      case 'maintenance':
        return 'Instagram is temporarily unavailable. Showing recent posts.';
      default:
        return 'Instagram feed temporarily unavailable. Showing recent posts.';
    }
  };

  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  };

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!mounted) {
    // Prevent hydration issues
    return (
      <div className={`instagram-fallback ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: maxPosts }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`instagram-fallback ${className}`}>
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Instagram Feed
            </h2>
            <a
              href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'nycayenmoore'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-[#D4A574] hover:text-[#B8956A] text-sm font-medium transition-colors"
            >
              <span>@{process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'nycayenmoore'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          {/* Status message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-sm flex items-center">
              <Grid className="w-4 h-4 mr-2" />
              {getReasonMessage()}
            </p>
          </div>
        </div>
      )}

      {/* Fallback posts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 md:gap-4">
        {posts.map((post) => (
          <FallbackPost key={post.id} post={post} />
        ))}
      </div>

      {/* Call to action */}
      <div className="mt-6 text-center">
        <a
          href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'nycayenmoore'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
        >
          <span>View Full Instagram Profile</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>
          These are cached posts from our Instagram feed. 
          <a
            href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'nycayenmoore'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D4A574] hover:text-[#B8956A] ml-1"
          >
            Visit Instagram for the latest updates.
          </a>
        </p>
      </div>
    </div>
  );
}

// Individual fallback post component
function FallbackPost({ post }: { post: typeof FALLBACK_POSTS[0] }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageFailed(true);

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 block"
      aria-label={`Instagram post: ${post.caption}`}
    >
      {/* Image */}
      {!imageFailed ? (
        <Image
          src={post.image}
          alt={post.caption}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        // Fallback gradient
        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
          <Grid className="w-8 h-8 text-white/70" />
        </div>
      )}

      {/* Loading state */}
      {!imageLoaded && !imageFailed && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Video indicator */}
      {post.isVideo && (
        <div className="absolute top-2 right-2">
          <div className="bg-black/60 rounded-full p-1.5">
            <Play className="w-4 h-4 text-white fill-current" />
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex items-center space-x-4 text-white">
          <div className="flex items-center space-x-1">
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-medium">{post.likes}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-5 h-5 fill-current" />
            <span className="font-medium">{post.comments}</span>
          </div>
        </div>
      </div>

      {/* Cached indicator */}
      <div className="absolute bottom-2 left-2">
        <div className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          Cached
        </div>
      </div>
    </a>
  );
}