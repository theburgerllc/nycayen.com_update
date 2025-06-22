// Analytics Tracking API Route
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Security } from '@/app/lib/security';

// Event tracking schema
const TrackingEventSchema = z.object({
  events: z.array(z.object({
    event: z.string(),
    properties: z.record(z.any()),
  })),
});

// Rate limiting for analytics
const RATE_LIMIT_CONFIG = {
  requests: 50,
  windowMs: 60000, // 1 minute
};

export async function POST(request: NextRequest) {
  try {
    // Get client IP and user agent
    const clientIP = Security.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Apply rate limiting
    const rateLimitKey = Security.createRateLimitKey('analytics', clientIP);
    const rateLimit = Security.rateLimit(rateLimitKey, RATE_LIMIT_CONFIG);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.requests.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Validate request body
    const body = await request.json();
    const validated = TrackingEventSchema.parse(body);

    // Process events
    const processedEvents = validated.events.map(event => ({
      ...event,
      metadata: {
        timestamp: new Date().toISOString(),
        ip: clientIP,
        userAgent,
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
      },
    }));

    // Here you would typically:
    // 1. Store events in your database
    // 2. Send to external analytics services
    // 3. Process for real-time dashboards

    // For now, we'll log and simulate storage
    console.log('Analytics events received:', {
      count: processedEvents.length,
      events: processedEvents.map(e => ({ event: e.event, timestamp: e.metadata.timestamp })),
    });

    // Simulate processing each event
    for (const event of processedEvents) {
      await processAnalyticsEvent(event);
    }

    return NextResponse.json({
      success: true,
      processed: processedEvents.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Process individual analytics events
async function processAnalyticsEvent(event: any) {
  const { event: eventName, properties, metadata } = event;

  try {
    switch (eventName) {
      case 'page_view':
        await processPageView(properties, metadata);
        break;
      
      case 'booking_initiated':
      case 'booking_completed':
        await processBookingEvent(eventName, properties, metadata);
        break;
      
      case 'purchase':
        await processPurchaseEvent(properties, metadata);
        break;
      
      case 'newsletter_signup':
        await processLeadEvent('newsletter', properties, metadata);
        break;
      
      case 'contact_form':
        await processLeadEvent('contact', properties, metadata);
        break;
      
      case 'web_vital':
        await processPerformanceEvent(properties, metadata);
        break;
      
      case 'error':
        await processErrorEvent(properties, metadata);
        break;
      
      default:
        await processGenericEvent(eventName, properties, metadata);
    }
  } catch (error) {
    console.error(`Failed to process ${eventName} event:`, error);
  }
}

// Specific event processors
async function processPageView(properties: any, metadata: any) {
  // Track page views, popular pages, user paths
  console.log('Page view:', {
    page: properties.page_location,
    title: properties.page_title,
    user_type: properties.user_type,
    timestamp: metadata.timestamp,
  });

  // You would store this in your database:
  // await db.pageViews.create({
  //   url: properties.page_location,
  //   title: properties.page_title,
  //   userType: properties.user_type,
  //   sessionId: properties.session_id,
  //   timestamp: metadata.timestamp,
  //   ip: metadata.ip,
  //   userAgent: metadata.userAgent,
  // });
}

async function processBookingEvent(eventName: string, properties: any, metadata: any) {
  console.log('Booking event:', {
    event: eventName,
    service: properties.service_type,
    value: properties.value || properties.estimated_value,
    timestamp: metadata.timestamp,
  });

  // Track booking funnel, conversion rates, popular services
  // await db.bookingEvents.create({
  //   event: eventName,
  //   serviceType: properties.service_type,
  //   serviceCategory: properties.service_category,
  //   value: properties.value || properties.estimated_value,
  //   timestamp: metadata.timestamp,
  //   sessionId: properties.session_id,
  // });
}

async function processPurchaseEvent(properties: any, metadata: any) {
  console.log('Purchase event:', {
    transactionId: properties.transaction_id,
    value: properties.value,
    items: properties.items?.length || 0,
    timestamp: metadata.timestamp,
  });

  // Track revenue, popular products, customer lifetime value
  // await db.purchases.create({
  //   transactionId: properties.transaction_id,
  //   value: properties.value,
  //   currency: properties.currency,
  //   items: properties.items,
  //   timestamp: metadata.timestamp,
  //   sessionId: properties.session_id,
  // });
}

async function processLeadEvent(type: string, properties: any, metadata: any) {
  console.log('Lead event:', {
    type,
    source: properties.source,
    timestamp: metadata.timestamp,
  });

  // Track lead generation, conversion sources
  // await db.leads.create({
  //   type,
  //   source: properties.source,
  //   formId: properties.form_id,
  //   timestamp: metadata.timestamp,
  //   sessionId: properties.session_id,
  // });
}

async function processPerformanceEvent(properties: any, metadata: any) {
  console.log('Performance event:', {
    metric: properties.name,
    value: properties.value,
    rating: properties.rating,
    timestamp: metadata.timestamp,
  });

  // Track Core Web Vitals, page performance
  // await db.performance.create({
  //   metric: properties.name,
  //   value: properties.value,
  //   rating: properties.rating,
  //   url: properties.page_location,
  //   timestamp: metadata.timestamp,
  // });
}

async function processErrorEvent(properties: any, metadata: any) {
  console.error('Client error:', {
    message: properties.message,
    stack: properties.stack,
    url: properties.page_location,
    timestamp: metadata.timestamp,
  });

  // Track client-side errors for debugging
  // await db.errors.create({
  //   message: properties.message,
  //   stack: properties.stack,
  //   url: properties.page_location,
  //   userAgent: metadata.userAgent,
  //   timestamp: metadata.timestamp,
  // });
}

async function processGenericEvent(eventName: string, properties: any, metadata: any) {
  console.log('Generic event:', {
    event: eventName,
    properties: Object.keys(properties),
    timestamp: metadata.timestamp,
  });

  // Store generic events for analysis
  // await db.events.create({
  //   event: eventName,
  //   properties,
  //   timestamp: metadata.timestamp,
  //   sessionId: properties.session_id,
  // });
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}