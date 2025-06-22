"use client";

import { InstagramAnalyticsEvent, InstagramEngagementMetrics } from '../types';

// Analytics configuration
const ANALYTICS_CONFIG = {
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  FB_PIXEL_ID: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  DEBUG: process.env.NODE_ENV === 'development',
  BATCH_SIZE: 10,
  FLUSH_INTERVAL: 30000, // 30 seconds
};

// Event queue for batching
let eventQueue: InstagramAnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

// Storage for engagement metrics
const engagementMetrics = new Map<string, InstagramEngagementMetrics>();

// Track Instagram engagement events
export function trackInstagramEngagement(event: Omit<InstagramAnalyticsEvent, 'userAgent' | 'referrer'>) {
  const fullEvent: InstagramAnalyticsEvent = {
    ...event,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    referrer: typeof window !== 'undefined' ? document.referrer : '',
  };

  // Add to queue
  eventQueue.push(fullEvent);

  // Update local metrics
  updateEngagementMetrics(fullEvent);

  // Send to analytics platforms
  sendToAnalyticsPlatforms(fullEvent);

  // Log in development
  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Instagram Analytics Event:', fullEvent);
  }

  // Batch processing
  scheduleFlush();
}

// Send events to analytics platforms
function sendToAnalyticsPlatforms(event: InstagramAnalyticsEvent) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag && ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    const gaEvent = convertToGAEvent(event);
    window.gtag('event', gaEvent.name, gaEvent.parameters);
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq && ANALYTICS_CONFIG.FB_PIXEL_ID) {
    const fbEvent = convertToFBEvent(event);
    if (fbEvent) {
      window.fbq('trackCustom', fbEvent.name, fbEvent.parameters);
    }
  }

  // Custom analytics endpoint
  sendToCustomEndpoint(event);
}

// Convert to Google Analytics event format
function convertToGAEvent(event: InstagramAnalyticsEvent) {
  const baseParams = {
    content_type: 'instagram_media',
    content_id: event.mediaId,
    media_type: event.mediaType,
    timestamp: event.timestamp.toISOString(),
    ...event.customProperties,
  };

  switch (event.type) {
    case 'view':
      return {
        name: 'instagram_media_view',
        parameters: {
          ...baseParams,
          engagement_time_msec: event.duration || 0,
        },
      };

    case 'click':
      return {
        name: 'instagram_media_click',
        parameters: {
          ...baseParams,
          click_action: event.customProperties?.action || 'media_click',
        },
      };

    case 'share':
      return {
        name: 'share',
        parameters: {
          ...baseParams,
          method: event.customProperties?.method || 'unknown',
          content_type: 'instagram_post',
        },
      };

    case 'play':
      return {
        name: 'instagram_video_play',
        parameters: {
          ...baseParams,
          video_current_time: event.position || 0,
        },
      };

    case 'pause':
      return {
        name: 'instagram_video_pause',
        parameters: {
          ...baseParams,
          video_current_time: event.position || 0,
          video_duration: event.duration || 0,
        },
      };

    case 'zoom':
      return {
        name: 'instagram_image_zoom',
        parameters: baseParams,
      };

    default:
      return {
        name: 'instagram_engagement',
        parameters: {
          ...baseParams,
          event_type: event.type,
        },
      };
  }
}

// Convert to Facebook Pixel event format
function convertToFBEvent(event: InstagramAnalyticsEvent) {
  const baseParams = {
    content_type: 'instagram_media',
    content_id: event.mediaId,
    content_category: event.mediaType,
    custom_data: {
      media_type: event.mediaType,
      timestamp: event.timestamp.toISOString(),
      ...event.customProperties,
    },
  };

  switch (event.type) {
    case 'view':
      return {
        name: 'ViewContent',
        parameters: baseParams,
      };

    case 'click':
      return {
        name: 'ClickButton',
        parameters: {
          ...baseParams,
          button_text: event.customProperties?.action || 'media_click',
        },
      };

    case 'share':
      return {
        name: 'Share',
        parameters: baseParams,
      };

    case 'play':
      return {
        name: 'VideoPlay',
        parameters: baseParams,
      };

    default:
      return null; // Don't track other events in FB Pixel
  }
}

// Send to custom analytics endpoint
async function sendToCustomEndpoint(event: InstagramAnalyticsEvent) {
  try {
    await fetch('/api/analytics/instagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    if (ANALYTICS_CONFIG.DEBUG) {
      console.warn('Failed to send Instagram analytics event:', error);
    }
  }
}

// Update local engagement metrics
function updateEngagementMetrics(event: InstagramAnalyticsEvent) {
  const existing = engagementMetrics.get(event.mediaId) || {
    mediaId: event.mediaId,
    views: 0,
    clicks: 0,
    shares: 0,
    avgViewDuration: 0,
    engagementRate: 0,
    lastUpdated: new Date(),
  };

  switch (event.type) {
    case 'view':
      existing.views += 1;
      if (event.duration) {
        existing.avgViewDuration = 
          (existing.avgViewDuration * (existing.views - 1) + event.duration) / existing.views;
      }
      break;

    case 'click':
      existing.clicks += 1;
      break;

    case 'share':
      existing.shares += 1;
      break;
  }

  // Calculate engagement rate
  existing.engagementRate = existing.views > 0 
    ? ((existing.clicks + existing.shares) / existing.views) * 100 
    : 0;

  existing.lastUpdated = new Date();
  engagementMetrics.set(event.mediaId, existing);
}

// Schedule batch flush
function scheduleFlush() {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
  }

  // Flush immediately if queue is full
  if (eventQueue.length >= ANALYTICS_CONFIG.BATCH_SIZE) {
    flushEvents();
    return;
  }

  // Schedule flush
  flushTimeout = setTimeout(() => {
    flushEvents();
  }, ANALYTICS_CONFIG.FLUSH_INTERVAL);
}

// Flush events to server
async function flushEvents() {
  if (eventQueue.length === 0) return;

  const eventsToFlush = [...eventQueue];
  eventQueue = [];

  try {
    await fetch('/api/analytics/instagram/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: eventsToFlush }),
    });

    if (ANALYTICS_CONFIG.DEBUG) {
      console.log(`Flushed ${eventsToFlush.length} Instagram analytics events`);
    }
  } catch (error) {
    if (ANALYTICS_CONFIG.DEBUG) {
      console.warn('Failed to flush Instagram analytics events:', error);
    }
    // Re-add events to queue for retry
    eventQueue.unshift(...eventsToFlush);
  }

  flushTimeout = null;
}

// Get engagement metrics for a media item
export function getEngagementMetrics(mediaId: string): InstagramEngagementMetrics | null {
  return engagementMetrics.get(mediaId) || null;
}

// Get all engagement metrics
export function getAllEngagementMetrics(): InstagramEngagementMetrics[] {
  return Array.from(engagementMetrics.values());
}

// Clear engagement metrics
export function clearEngagementMetrics(mediaId?: string) {
  if (mediaId) {
    engagementMetrics.delete(mediaId);
  } else {
    engagementMetrics.clear();
  }
}

// Track Instagram feed performance
export function trackFeedPerformance(metrics: {
  loadTime: number;
  itemCount: number;
  cacheHitRate: number;
  apiResponseTime?: number;
  errors?: number;
}) {
  const event: InstagramAnalyticsEvent = {
    type: 'view',
    mediaId: 'feed_performance',
    mediaType: 'IMAGE', // Placeholder
    timestamp: new Date(),
    customProperties: {
      event_category: 'performance',
      load_time: metrics.loadTime,
      item_count: metrics.itemCount,
      cache_hit_rate: metrics.cacheHitRate,
      api_response_time: metrics.apiResponseTime,
      error_count: metrics.errors || 0,
    },
  };

  trackInstagramEngagement(event);
}

// Track user engagement patterns
export function trackEngagementPattern(pattern: {
  sessionDuration: number;
  itemsViewed: number;
  itemsClicked: number;
  itemsShared: number;
  scrollDepth: number;
}) {
  const event: InstagramAnalyticsEvent = {
    type: 'view',
    mediaId: 'engagement_pattern',
    mediaType: 'IMAGE', // Placeholder
    timestamp: new Date(),
    customProperties: {
      event_category: 'engagement_pattern',
      session_duration: pattern.sessionDuration,
      items_viewed: pattern.itemsViewed,
      items_clicked: pattern.itemsClicked,
      items_shared: pattern.itemsShared,
      scroll_depth: pattern.scrollDepth,
      engagement_rate: pattern.itemsViewed > 0 
        ? ((pattern.itemsClicked + pattern.itemsShared) / pattern.itemsViewed) * 100 
        : 0,
    },
  };

  trackInstagramEngagement(event);
}

// Initialize analytics tracking
export function initializeInstagramAnalytics() {
  if (typeof window === 'undefined') return;

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents(); // Flush events when page becomes hidden
    }
  });

  // Track page unload
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery
      const data = JSON.stringify({ events: eventQueue });
      navigator.sendBeacon('/api/analytics/instagram/batch', data);
    }
  });

  // Schedule periodic cleanup of old metrics
  setInterval(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [mediaId, metrics] of engagementMetrics.entries()) {
      if (metrics.lastUpdated < oneHourAgo) {
        engagementMetrics.delete(mediaId);
      }
    }
  }, 15 * 60 * 1000); // Clean up every 15 minutes

  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('Instagram Analytics initialized');
  }
}

// Export for global window access (for debugging)
if (typeof window !== 'undefined') {
  (window as any).instagramAnalytics = {
    trackInstagramEngagement,
    getEngagementMetrics,
    getAllEngagementMetrics,
    clearEngagementMetrics,
    flushEvents,
    eventQueue: () => eventQueue,
    metricsCount: () => engagementMetrics.size,
  };
}