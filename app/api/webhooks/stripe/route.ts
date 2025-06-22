import { NextRequest, NextResponse } from 'next/server';
import { stripe, webhookSecret } from '../../../lib/stripe';
import { headers } from 'next/headers';

// Mock database - in production use actual database
const mockDatabase = {
  orders: new Map(),
  
  async updateOrderByPaymentIntent(paymentIntentId: string, updates: any) {
    // Find order by payment intent ID
    for (const [orderId, order] of this.orders.entries()) {
      if ((order as any).paymentReference === paymentIntentId) {
        const updated = {
          ...order,
          ...updates,
          updatedAt: new Date(),
        };
        this.orders.set(orderId, updated);
        return updated;
      }
    }
    return null;
  }
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  if (!signature) {
    console.error('Missing Stripe signature header');
    return NextResponse.json(
      { error: 'Missing signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`Received webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;

      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object);
        break;

      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        // Handle subscription payments if you add subscriptions
        console.log('Invoice payment succeeded:', event.data.object.id);
        break;

      case 'customer.subscription.deleted':
        // Handle subscription cancellations
        console.log('Subscription canceled:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  console.log(`Payment succeeded: ${paymentIntent.id}`);

  try {
    // Update order status
    const order = await mockDatabase.updateOrderByPaymentIntent(paymentIntent.id, {
      paymentStatus: 'paid',
      paymentMethod: paymentIntent.payment_method?.type || 'card',
      paymentReference: paymentIntent.id,
    });

    if (order) {
      console.log(`Order ${(order as any).orderNumber} marked as paid`);
      
      // In production, trigger:
      // 1. Send order confirmation email
      // 2. Update inventory
      // 3. Start fulfillment process
      // 4. Send to analytics/tracking
      // 5. Create customer account if requested
      
      // Mock fulfillment trigger
      setTimeout(async () => {
        await mockDatabase.updateOrderByPaymentIntent(paymentIntent.id, {
          fulfillmentStatus: 'processing',
        });
      }, 1000);
    }

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log(`Payment failed: ${paymentIntent.id}`);

  try {
    const failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
    
    // Update order status
    const order = await mockDatabase.updateOrderByPaymentIntent(paymentIntent.id, {
      paymentStatus: 'failed',
      notes: `Payment failed: ${failureReason}`,
    });

    if (order) {
      console.log(`Order ${(order as any).orderNumber} marked as payment failed`);
      
      // In production:
      // 1. Send payment failed email with retry link
      // 2. Release inventory hold
      // 3. Log for fraud detection
      // 4. Update customer communication
    }

  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

async function handlePaymentCanceled(paymentIntent: any) {
  console.log(`Payment canceled: ${paymentIntent.id}`);

  try {
    // Update order status
    const order = await mockDatabase.updateOrderByPaymentIntent(paymentIntent.id, {
      paymentStatus: 'failed',
      status: 'cancelled',
      cancelledAt: new Date(),
      notes: 'Payment was canceled by customer',
    });

    if (order) {
      console.log(`Order ${(order as any).orderNumber} canceled`);
      
      // In production:
      // 1. Release inventory
      // 2. Send cancellation confirmation
      // 3. Update analytics
    }

  } catch (error) {
    console.error('Error handling payment canceled:', error);
    throw error;
  }
}

async function handlePaymentRequiresAction(paymentIntent: any) {
  console.log(`Payment requires action: ${paymentIntent.id}`);

  try {
    // Update order with status indicating additional authentication needed
    const order = await mockDatabase.updateOrderByPaymentIntent(paymentIntent.id, {
      paymentStatus: 'pending',
      notes: 'Payment requires additional authentication (3D Secure)',
    });

    if (order) {
      console.log(`Order ${(order as any).orderNumber} awaiting payment authentication`);
      
      // In production:
      // 1. Send customer notification about authentication requirement
      // 2. Set timeout for payment completion
      // 3. Monitor for completion
    }

  } catch (error) {
    console.error('Error handling payment requires action:', error);
    throw error;
  }
}

async function handleChargeDispute(dispute: any) {
  console.log(`Charge dispute created: ${dispute.id}`);

  try {
    // Find the related payment intent and order
    const chargeId = dispute.charge;
    const paymentIntentId = dispute.payment_intent;

    if (paymentIntentId) {
      // Update order with dispute information
      const order = await mockDatabase.updateOrderByPaymentIntent(paymentIntentId, {
        notes: `Chargeback dispute created: ${dispute.id}. Reason: ${dispute.reason}`,
        tags: ['disputed'],
      });

      if (order) {
        console.log(`Order ${(order as any).orderNumber} has a dispute`);
        
        // In production:
        // 1. Notify customer service team
        // 2. Gather evidence for dispute response
        // 3. Pause any pending shipments
        // 4. Update customer records
      }
    }

  } catch (error) {
    console.error('Error handling charge dispute:', error);
    throw error;
  }
}

// Disable body parsing for webhooks
export const runtime = 'nodejs';
export const preferredRegion = 'auto';