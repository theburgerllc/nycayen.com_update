import { NextRequest, NextResponse } from 'next/server';
import { getInstagramAPI } from '../../../instagram/lib/api';
import { instagramCache } from '../../../instagram/lib/cache';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify authorization (in production, add proper auth)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.INSTAGRAM_REFRESH_TOKEN || 'instagram-refresh-secret';
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const api = getInstagramAPI();
    
    // Refresh the access token
    const newToken = await api.refreshAccessToken();
    
    // Clear all cached data to force fresh fetch
    instagramCache.cleanup();
    
    // Test the new token by fetching user info
    const userInfo = await api.getUserInfo();
    
    return NextResponse.json({
      message: 'Instagram token refreshed successfully',
      tokenInfo: {
        expires_in: newToken.expires_in,
        created_at: newToken.created_at,
        user_id: newToken.user_id,
      },
      userInfo: {
        username: userInfo.username,
        account_type: userInfo.account_type,
        media_count: userInfo.media_count,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Instagram token refresh error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh Instagram token',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const api = getInstagramAPI();
    
    // Get current token status and rate limit info
    const rateLimitInfo = api.getRateLimitInfo();
    const isConnected = await api.testConnection();
    
    return NextResponse.json({
      connected: isConnected,
      rateLimit: rateLimitInfo ? {
        remaining: rateLimitInfo.remaining,
        resetTime: rateLimitInfo.resetTime,
        limit: rateLimitInfo.limit,
      } : null,
      cacheStats: instagramCache.getStats(),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Instagram status check error:', error);
    
    return NextResponse.json(
      { 
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}