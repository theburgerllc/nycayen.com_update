import { 
  InstagramMedia, 
  InstagramAPIResponse, 
  InstagramToken, 
  InstagramUser, 
  InstagramError,
  InstagramConfig,
  RateLimitInfo 
} from '../types';

export class InstagramAPI {
  private config: InstagramConfig;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor() {
    this.config = {
      appId: process.env.INSTAGRAM_APP_ID!,
      appSecret: process.env.INSTAGRAM_APP_SECRET!,
      accessToken: process.env.INSTAGRAM_ACCESS_TOKEN!,
      userId: process.env.INSTAGRAM_USER_ID!,
      refreshThreshold: parseInt(process.env.INSTAGRAM_TOKEN_REFRESH_THRESHOLD || '604800'),
      cacheDuration: parseInt(process.env.INSTAGRAM_CACHE_DURATION || '3600'),
      maxPosts: parseInt(process.env.INSTAGRAM_MAX_POSTS || '50'),
      rateLimitPerHour: parseInt(process.env.INSTAGRAM_RATE_LIMIT_PER_HOUR || '200'),
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    const required = ['appId', 'appSecret', 'accessToken', 'userId'];
    const missing = required.filter(key => !this.config[key as keyof InstagramConfig]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required Instagram configuration: ${missing.join(', ')}`);
    }
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // Check rate limits
    if (!await this.checkRateLimit()) {
      throw this.createError(
        'RATE_LIMIT_ERROR',
        'Instagram API rate limit exceeded',
        { resetTime: this.rateLimitInfo?.resetTime }
      );
    }

    const url = new URL(endpoint, 'https://graph.instagram.com/');
    
    // Add default parameters
    const defaultParams = {
      access_token: this.config.accessToken,
    };

    Object.entries({ ...defaultParams, ...params }).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Nycayen-Hair-Artistry/1.0',
        },
      });

      // Update rate limit info from headers
      this.updateRateLimitInfo(response);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createError(
          'API_ERROR',
          errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
          { status: response.status, errorData }
        );
      }

      const data = await response.json();
      this.recordRequest();
      
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'InstagramError') {
        throw error;
      }
      
      throw this.createError(
        'NETWORK_ERROR',
        `Failed to fetch from Instagram API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error }
      );
    }
  }

  private createError(
    type: InstagramError['type'],
    message: string,
    details?: Record<string, any>
  ): InstagramError {
    const error: InstagramError = {
      code: type,
      message,
      type,
      details,
      timestamp: new Date(),
    };
    
    // Add custom error property to make it identifiable
    (error as any).name = 'InstagramError';
    
    return error;
  }

  private async checkRateLimit(): Promise<boolean> {
    if (!this.rateLimitInfo) return true;
    
    const now = new Date();
    if (now > this.rateLimitInfo.resetTime) {
      // Reset rate limit window
      this.rateLimitInfo.remaining = this.config.rateLimitPerHour;
      this.rateLimitInfo.windowStart = now;
      this.rateLimitInfo.resetTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    }
    
    return this.rateLimitInfo.remaining > 0;
  }

  private updateRateLimitInfo(response: Response): void {
    const remaining = response.headers.get('x-app-usage');
    const resetTime = response.headers.get('x-app-usage-reset-time');
    
    if (remaining && resetTime) {
      try {
        const usage = JSON.parse(remaining);
        this.rateLimitInfo = {
          limit: this.config.rateLimitPerHour,
          remaining: Math.max(0, this.config.rateLimitPerHour - (usage.total_time || 0)),
          resetTime: new Date(parseInt(resetTime) * 1000),
          windowStart: new Date(),
        };
      } catch (error) {
        console.warn('Failed to parse Instagram rate limit headers:', error);
      }
    }
  }

  private recordRequest(): void {
    if (this.rateLimitInfo) {
      this.rateLimitInfo.remaining = Math.max(0, this.rateLimitInfo.remaining - 1);
    }
  }

  public async getUserInfo(): Promise<InstagramUser> {
    try {
      const data = await this.makeRequest<InstagramUser>(`/${this.config.userId}`, {
        fields: 'id,username,account_type,media_count',
      });
      
      return data;
    } catch (error) {
      throw this.createError(
        'API_ERROR',
        'Failed to fetch user information',
        { originalError: error }
      );
    }
  }

  public async getMedia(limit: number = 25, after?: string): Promise<InstagramAPIResponse> {
    try {
      const params: Record<string, any> = {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username',
        limit: Math.min(limit, this.config.maxPosts),
      };
      
      if (after) {
        params.after = after;
      }
      
      const data = await this.makeRequest<InstagramAPIResponse>(
        `/${this.config.userId}/media`,
        params
      );
      
      // Process and enhance media data
      data.data = data.data.map(this.processMediaItem.bind(this));
      
      return data;
    } catch (error) {
      throw this.createError(
        'API_ERROR',
        'Failed to fetch Instagram media',
        { originalError: error }
      );
    }
  }

  public async getMediaDetails(mediaId: string): Promise<InstagramMedia> {
    try {
      const data = await this.makeRequest<InstagramMedia>(`/${mediaId}`, {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,like_count,comments_count',
      });
      
      return this.processMediaItem(data);
    } catch (error) {
      throw this.createError(
        'API_ERROR',
        `Failed to fetch media details for ${mediaId}`,
        { mediaId, originalError: error }
      );
    }
  }

  public async getCarouselChildren(mediaId: string): Promise<InstagramMedia[]> {
    try {
      const data = await this.makeRequest<{ data: InstagramMedia[] }>(`/${mediaId}/children`, {
        fields: 'id,media_type,media_url,thumbnail_url',
      });
      
      return data.data.map(this.processMediaItem.bind(this));
    } catch (error) {
      throw this.createError(
        'API_ERROR',
        `Failed to fetch carousel children for ${mediaId}`,
        { mediaId, originalError: error }
      );
    }
  }

  private processMediaItem(media: InstagramMedia): InstagramMedia {
    // Extract hashtags from caption
    const hashtags = this.extractHashtags(media.caption);
    
    // Categorize content
    const category = this.categorizeContent(media, hashtags);
    
    return {
      ...media,
      tags: hashtags,
      category,
      // Add default values for missing optional fields
      like_count: media.like_count || 0,
      comments_count: media.comments_count || 0,
      is_featured: false,
    };
  }

  private extractHashtags(caption?: string): string[] {
    if (!caption) return [];
    
    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    const matches = caption.match(hashtagRegex);
    
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
  }

  private categorizeContent(media: InstagramMedia, hashtags: string[]): string {
    // Define category rules based on hashtags and content
    const categoryRules = {
      'hairstyles': ['hairstyles', 'haircut', 'hairstyle', 'style', 'styling'],
      'wigs': ['wig', 'wigs', 'lacefront', 'closure', 'frontal'],
      'color': ['color', 'highlight', 'lowlight', 'balayage', 'ombre'],
      'extensions': ['extensions', 'weave', 'bundles', 'hair'],
      'braids': ['braids', 'braiding', 'protective', 'twist'],
      'natural': ['natural', 'curls', 'texture', 'coils'],
      'bridal': ['bridal', 'wedding', 'bride', 'special'],
      'tutorials': ['tutorial', 'howto', 'tips', 'diy'],
      'products': ['products', 'review', 'recommend', 'favorite'],
      'behind-the-scenes': ['bts', 'process', 'work', 'salon'],
    };
    
    for (const [category, keywords] of Object.entries(categoryRules)) {
      if (keywords.some(keyword => 
        hashtags.includes(keyword) || 
        media.caption?.toLowerCase().includes(keyword)
      )) {
        return category;
      }
    }
    
    return 'general';
  }

  public async refreshAccessToken(): Promise<InstagramToken> {
    try {
      const response = await fetch('https://graph.instagram.com/refresh_access_token', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'ig_refresh_token',
          access_token: this.config.accessToken,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to refresh token');
      }
      
      const tokenData = await response.json();
      
      // Update stored token (in production, save to database)
      this.config.accessToken = tokenData.access_token;
      
      return {
        ...tokenData,
        created_at: Date.now(),
        user_id: this.config.userId,
      };
    } catch (error) {
      throw this.createError(
        'API_ERROR',
        'Failed to refresh Instagram access token',
        { originalError: error }
      );
    }
  }

  public getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.getUserInfo();
      return true;
    } catch (error) {
      console.error('Instagram API connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
let instagramAPI: InstagramAPI;

export function getInstagramAPI(): InstagramAPI {
  if (!instagramAPI) {
    instagramAPI = new InstagramAPI();
  }
  return instagramAPI;
}