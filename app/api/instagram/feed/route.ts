import { NextRequest, NextResponse } from 'next/server';
import { getInstagramAPI } from '../../../instagram/lib/api';
import { instagramCache, CacheKeyManager } from '../../../instagram/lib/cache';
import { InstagramMedia, InstagramError } from '../../../instagram/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 50);
    const after = searchParams.get('after') || undefined;
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const nocache = searchParams.get('nocache') === 'true';

    const userId = process.env.INSTAGRAM_USER_ID;
    if (!userId) {
      return NextResponse.json(
        { error: 'Instagram configuration not found' },
        { status: 500 }
      );
    }

    // Generate cache key
    const cacheKey = CacheKeyManager.createFeedKey(userId, limit);
    
    // Try to get from cache first (unless nocache is specified)
    if (!nocache) {
      try {
        const cached = await instagramCache.getOrFetch(
          cacheKey,
          async () => null,
          0 // Don't cache if null
        );
        
        if (cached) {
          let filteredData = cached;
          
          // Apply filters
          if (category) {
            filteredData = filteredData.filter(media => media.category === category);
          }
          
          if (featured) {
            filteredData = filteredData.filter((media: any) => media.is_featured);
          }
          
          return NextResponse.json({
            data: filteredData.slice(0, limit),
            cached: true,
            timestamp: Date.now(),
            source: 'cache',
          });
        }
      } catch (cacheError) {
        console.warn('Cache error:', cacheError);
      }
    }

    // Fetch fresh data from Instagram API
    const api = getInstagramAPI();
    const response = await api.getMedia(limit, after);
    
    // Apply content processing and filtering
    let processedData = response.data.map((media: any) => processMediaForClient(media));
    
    // Apply featured content logic
    processedData = await applyFeaturedContent(processedData);
    
    // Apply category filtering if specified
    if (category) {
      processedData = processedData.filter(media => media.category === category);
    }
    
    if (featured) {
      processedData = processedData.filter(media => media.is_featured);
    }

    // Cache the results using the cache utility
    instagramCache.cache.set(cacheKey, processedData);
    
    // Add CORS headers for frontend access
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    });

    return NextResponse.json({
      data: processedData,
      cached: false,
      timestamp: Date.now(),
      source: 'api',
      pagination: response.paging,
    }, { headers });

  } catch (error) {
    console.error('Instagram feed API error:', error);
    
    // Return fallback mock data for development/demo
    const limitValue = limit;
    const fallbackData = Array.from({ length: Math.min(limitValue, 12) }, (_, i) => ({
      id: `mock_${i + 1}`,
      media_type: 'IMAGE',
      media_url: `https://picsum.photos/400/400?random=${i + 1}`,
      thumbnail_url: `https://picsum.photos/150/150?random=${i + 1}`,
      caption: `Beautiful hair transformation #${i + 1} - NYC Ayen Hair Artistry`,
      permalink: `https://instagram.com/p/mock_${i + 1}`,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      username: 'nycayenmoore',
      is_featured: i < 3,
      category: i % 2 === 0 ? 'before_after' : 'styling',
      likes_count: Math.floor(Math.random() * 500) + 50,
      comments_count: Math.floor(Math.random() * 50) + 5,
    }));

    return NextResponse.json({
      data: fallbackData,
      cached: false,
      timestamp: Date.now(),
      source: 'fallback',
      error: 'Instagram API unavailable, showing demo content',
    });
  }
}

// Process media for client consumption
function processMediaForClient(media: InstagramMedia): InstagramMedia {
  return {
    ...media,
    // Ensure safe URLs
    media_url: media.media_url,
    thumbnail_url: media.thumbnail_url || media.media_url,
    // Add computed fields
    caption: media.caption || '',
    short_caption: media.caption ? truncateCaption(media.caption) : undefined,
    formatted_date: formatDate(media.timestamp),
    engagement_score: calculateEngagementScore(media),
  };
}

// Apply featured content logic
async function applyFeaturedContent(media: InstagramMedia[]): Promise<InstagramMedia[]> {
  // This could be enhanced to read from a database or CMS
  // For now, we'll use simple rules
  
  return media.map(item => {
    // Mark as featured based on engagement or recency
    const isRecent = new Date(item.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const hasHighEngagement = (item.like_count || 0) > 100 || (item.comments_count || 0) > 10;
    
    return {
      ...item,
      is_featured: isRecent && hasHighEngagement,
    };
  });
}

// Utility functions
function truncateCaption(caption: string, maxLength: number = 150): string {
  if (caption.length <= maxLength) return caption;
  
  const truncated = caption.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateEngagementScore(media: InstagramMedia): number {
  const likes = media.like_count || 0;
  const comments = media.comments_count || 0;
  
  // Simple engagement score calculation
  // Comments are weighted more heavily than likes
  return likes + (comments * 5);
}