// Instagram Basic Display API Types

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  username: string;
  // Calculated fields
  like_count?: number;
  comments_count?: number;
  is_featured?: boolean;
  tags?: string[];
  category?: string;
  // Additional computed fields
  short_caption?: string;
  formatted_date?: string;
  engagement_score?: number;
}

export interface InstagramCarouselChild {
  id: string;
  media_type: 'IMAGE' | 'VIDEO';
  media_url: string;
  thumbnail_url?: string;
}

export interface InstagramCarouselMedia extends InstagramMedia {
  media_type: 'CAROUSEL_ALBUM';
  children: {
    data: InstagramCarouselChild[];
  };
}

export interface InstagramAPIResponse {
  data: InstagramMedia[];
  paging: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

export interface InstagramToken {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  created_at: number;
  user_id: string;
}

export interface InstagramUser {
  id: string;
  username: string;
  account_type: 'BUSINESS' | 'CREATOR' | 'PERSONAL';
  media_count: number;
}

// Cache Types
export interface InstagramCacheEntry {
  data: InstagramMedia[];
  timestamp: number;
  expires_at: number;
}

export interface InstagramCacheManager {
  get(key: string): InstagramCacheEntry | null;
  set(key: string, data: InstagramMedia[], ttl?: number): void;
  clear(key?: string): void;
  isValid(key: string): boolean;
}

// Configuration Types
export interface InstagramConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  userId: string;
  refreshThreshold: number;
  cacheDuration: number;
  maxPosts: number;
  rateLimitPerHour: number;
}

// Feed Display Types
export interface InstagramFeedProps {
  maxPosts?: number;
  showCaptions?: boolean;
  showLightbox?: boolean;
  gridColumns?: number;
  aspectRatio?: 'square' | 'original';
  className?: string;
  onMediaClick?: (media: InstagramMedia, index: number) => void;
  onError?: (error: InstagramError) => void;
  onLoad?: (media: InstagramMedia[]) => void;
}

export interface InstagramPostProps {
  media: InstagramMedia;
  index: number;
  showCaption?: boolean;
  showCounts?: boolean;
  onClick?: (media: InstagramMedia, index: number) => void;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

// Lightbox Types
export interface InstagramLightboxProps {
  media: InstagramMedia[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showCaptions?: boolean;
  showCounts?: boolean;
  enableKeyboard?: boolean;
  enableSwipe?: boolean;
  className?: string;
}

export interface LightboxState {
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  isZoomed: boolean;
  zoomLevel: number;
  showControls: boolean;
}

// Error Types
export interface InstagramError {
  code: string;
  message: string;
  type: 'API_ERROR' | 'NETWORK_ERROR' | 'CACHE_ERROR' | 'VALIDATION_ERROR' | 'RATE_LIMIT_ERROR';
  details?: Record<string, any>;
  timestamp: Date;
}

export interface InstagramErrorBoundaryState {
  hasError: boolean;
  error?: InstagramError;
  errorInfo?: string;
}

// Analytics Types
export interface InstagramAnalyticsEvent {
  type: 'view' | 'click' | 'share' | 'like' | 'comment' | 'play' | 'pause' | 'zoom';
  mediaId: string;
  mediaType: InstagramMedia['media_type'];
  timestamp: Date;
  duration?: number;
  position?: number;
  userAgent?: string;
  referrer?: string;
  customProperties?: Record<string, any>;
}

export interface InstagramEngagementMetrics {
  mediaId: string;
  views: number;
  clicks: number;
  shares: number;
  avgViewDuration: number;
  engagementRate: number;
  lastUpdated: Date;
}

// Content Management Types
export interface ContentModerationRule {
  id: string;
  type: 'hashtag' | 'keyword' | 'user_mention' | 'content_type';
  value: string;
  action: 'include' | 'exclude' | 'flag';
  priority: number;
  isActive: boolean;
}

export interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  rules: ContentModerationRule[];
  isDefault?: boolean;
}

export interface FeaturedContent {
  mediaId: string;
  priority: number;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  isActive: boolean;
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  windowStart: Date;
}

export interface RateLimiter {
  checkLimit(): Promise<boolean>;
  getRemainingRequests(): number;
  getResetTime(): Date;
  recordRequest(): void;
}

// Hooks Types
export interface UseInstagramFeedOptions {
  maxPosts?: number;
  refreshInterval?: number;
  enableRealtime?: boolean;
  cacheKey?: string;
  onError?: (error: InstagramError) => void;
  onSuccess?: (data: InstagramMedia[]) => void;
}

export interface UseInstagramFeedReturn {
  data: InstagramMedia[] | null;
  loading: boolean;
  error: InstagramError | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export interface UseInstagramLightboxOptions {
  enableKeyboard?: boolean;
  enableSwipe?: boolean;
  autoPlay?: boolean;
  preloadNext?: number;
}

export interface UseInstagramLightboxReturn {
  currentIndex: number;
  isOpen: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  open: (index: number) => void;
  close: () => void;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
  togglePlay: () => void;
}

// Component State Types
export interface InstagramFeedState {
  media: InstagramMedia[];
  loading: boolean;
  error: InstagramError | null;
  hasMore: boolean;
  lastFetch: Date | null;
  cursor: string | null;
}

export interface InstagramPostState {
  loading: boolean;
  error: boolean;
  hasFailedToLoad: boolean;
  isInView: boolean;
  loadStartTime: number | null;
}

// API Response Error Types
export interface InstagramAPIError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

// Media Processing Types
export interface MediaProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  progressive?: boolean;
}

export interface ProcessedMedia {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
  webp?: string;
  dimensions: {
    width: number;
    height: number;
  };
}

// CDN Types
export interface CDNConfig {
  baseUrl: string;
  transformations: {
    thumbnail: string;
    medium: string;
    large: string;
  };
  cacheTTL: number;
}

// Accessibility Types
export interface AccessibilityOptions {
  altTextGeneration?: boolean;
  ariaLabels?: Record<string, string>;
  focusManagement?: boolean;
  announceChanges?: boolean;
  keyboardNavigation?: boolean;
}

// Performance Types
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  imageLoadTime: number;
  totalSize: number;
  cacheHitRate: number;
  apiResponseTime: number;
}

export interface LazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  placeholder?: 'blur' | 'skeleton' | 'none';
  fadeIn?: boolean;
  preloadNext?: number;
}

// Responsive Design Types
export interface ResponsiveBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ResponsiveGridConfig {
  breakpoints: ResponsiveBreakpoints;
  columns: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  gap: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Search and Filter Types
export interface InstagramSearchOptions {
  query?: string;
  hashtags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  mediaType?: InstagramMedia['media_type'][];
  sortBy?: 'timestamp' | 'engagement' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface InstagramFilterOptions {
  categories?: string[];
  featured?: boolean;
  minEngagement?: number;
  hasCaption?: boolean;
  customFilters?: Array<(media: InstagramMedia) => boolean>;
}