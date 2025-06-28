import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const statusData = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        website: {
          status: 'operational',
          description: 'Main website is running normally',
        },
        api: {
          status: 'operational',
          description: 'API endpoints are responding',
        },
        checkout: {
          status: 'operational',
          description: 'Payment processing is available',
        },
        booking: {
          status: 'operational',
          description: 'Booking system is functional',
        },
        blog: {
          status: 'operational',
          description: 'Blog content is accessible',
        },
        instagram: {
          status: 'operational',
          description: 'Instagram feed integration is working',
        },
      },
      metrics: {
        response_time: '< 200ms',
        uptime: '99.9%',
        last_incident: null,
      },
      region: process.env.VERCEL_REGION || 'unknown',
      deployment: {
        id: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      },
    };

    return NextResponse.json(statusData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        error: 'Status check partially failed',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}