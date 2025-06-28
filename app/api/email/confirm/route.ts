import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Confirmation token required' }, { status: 400 });
    }

    // Verify and update subscriber status in database
    const result = await confirmSubscription(token);

    if (!result.success || !result.subscriber) {
      return NextResponse.json({ error: result.error || 'Invalid subscription result' }, { status: 400 });
    }

    // Update in email service providers
    await Promise.allSettled([
      updateMailchimpStatus(result.subscriber.email, 'subscribed'),
      updateConvertFlowStatus(result.subscriber.id, 'confirmed'),
    ]);

    // Send welcome email
    await sendWelcomeEmail(result.subscriber);

    // Track confirmation
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'email_confirmed',
        properties: {
          subscriberId: result.subscriber.id,
          source: result.subscriber.source,
        },
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully! Welcome to our community.',
    });

  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json(
      { error: 'Confirmation failed' },
      { status: 500 }
    );
  }
}

async function confirmSubscription(token: string) {
  // In a real application, this would query your database
  // For now, we'll simulate the process
  
  try {
    // Verify token and get subscriber
    const subscriber = await getSubscriberByToken(token);
    
    if (!subscriber) {
      return { success: false, error: 'Invalid or expired token' };
    }

    if (subscriber.status === 'confirmed') {
      return { success: false, error: 'Email already confirmed' };
    }

    // Update status to confirmed
    await updateSubscriberStatus(subscriber.id, 'confirmed');

    return {
      success: true,
      subscriber: {
        ...subscriber,
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Database confirmation error:', error);
    return { success: false, error: 'Database error' };
  }
}

async function getSubscriberByToken(token: string) {
  // Replace with actual database query
  console.log('Getting subscriber by token:', token);
  
  // Simulated subscriber data
  return {
    id: 'sub_123',
    email: 'user@example.com',
    firstName: 'John',
    status: 'pending',
    source: 'popup',
    interests: ['Hair Cuts & Styling'],
    subscribedAt: new Date().toISOString(),
  };
}

async function updateSubscriberStatus(subscriberId: string, status: string) {
  // Replace with actual database update
  console.log('Updating subscriber status:', subscriberId, status);
  return true;
}

async function updateMailchimpStatus(email: string, status: string) {
  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!MAILCHIMP_API_KEY) return;

  try {
    const crypto = await import('crypto');
    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');

    const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Mailchimp update failed');
    }

    console.log('Mailchimp status updated successfully');
  } catch (error) {
    console.error('Mailchimp update error:', error);
  }
}

async function updateConvertFlowStatus(subscriberId: string, status: string) {
  const CONVERTFLOW_API_KEY = process.env.CONVERTFLOW_API_KEY;
  
  if (!CONVERTFLOW_API_KEY) return;

  try {
    const response = await fetch(`https://api.convertflow.com/v1/subscribers/${subscriberId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CONVERTFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        custom_fields: { status },
      }),
    });

    if (!response.ok) {
      throw new Error('ConvertFlow update failed');
    }

    console.log('ConvertFlow status updated successfully');
  } catch (error) {
    console.error('ConvertFlow update error:', error);
  }
}

async function sendWelcomeEmail(subscriber: any) {
  const emailData = {
    to: subscriber.email,
    subject: 'Welcome to Nycayen Hair Artistry! 🎉',
    template: 'welcome',
    data: {
      firstName: subscriber.firstName || 'Beauty Lover',
      interests: subscriber.interests,
      source: subscriber.source,
      preferencesUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/email/preferences?id=${subscriber.id}`,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/email/unsubscribe?id=${subscriber.id}`,
    },
  };

  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Failed to send welcome email');
    }

    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Welcome email error:', error);
    // Don't fail the confirmation if welcome email fails
  }
}