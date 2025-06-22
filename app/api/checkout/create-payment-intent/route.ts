import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../lib/stripe';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'usd', metadata = {} } = body;

    // Input validation
    if (!amount || amount < 50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Invalid amount. Minimum amount is $0.50' },
        { status: 400 }
      );
    }

    if (amount > 999999) { // Maximum $9,999.99
      return NextResponse.json(
        { error: 'Amount exceeds maximum limit' },
        { status: 400 }
      );
    }

    // Rate limiting check (basic implementation)
    const headersList = headers();
    const clientIP = headersList.get('x-forwarded-for') || 'unknown';
    
    // In production, implement proper rate limiting with Redis or similar
    // For now, we'll add the IP to metadata for tracking
    const enhancedMetadata = {
      ...metadata,
      client_ip: clientIP,
      created_via: 'nycayen_checkout',
      timestamp: new Date().toISOString(),
    };

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: enhancedMetadata,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Disable redirects for better UX
      },
      capture_method: 'automatic',
      confirmation_method: 'automatic',
      // Enable 3D Secure when required
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    });

    // Log successful payment intent creation (in production, use proper logging)
    console.log(`Payment intent created: ${paymentIntent.id} for amount: $${amount}`);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('Error creating payment intent:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: 'Your card was declined.' },
        { status: 400 }
      );
    } else if (error.type === 'StripeRateLimitError') {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    } else if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Invalid payment request.' },
        { status: 400 }
      );
    } else if (error.type === 'StripeAPIError') {
      return NextResponse.json(
        { error: 'Payment processing temporarily unavailable.' },
        { status: 503 }
      );
    } else if (error.type === 'StripeConnectionError') {
      return NextResponse.json(
        { error: 'Network error. Please try again.' },
        { status: 503 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}