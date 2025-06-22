import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { subscriberSchema, generateSubscriberId, generateConfirmationToken } from '@/lib/email-marketing';

// Mailchimp API integration
async function addToMailchimp(subscriber: any) {
  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER_PREFIX) {
    console.warn('Mailchimp configuration missing, storing locally only');
    return { success: true, id: generateSubscriberId() };
  }

  const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
  
  const mailchimpData = {
    email_address: subscriber.email,
    status: 'pending', // Will require confirmation
    merge_fields: {
      FNAME: subscriber.firstName || '',
      LNAME: subscriber.lastName || '',
      PHONE: subscriber.phone || '',
      SOURCE: subscriber.source,
    },
    interests: subscriber.interests.reduce((acc: any, interest: string) => {
      // Map interests to Mailchimp interest IDs (would need to be configured)
      const interestId = getMailchimpInterestId(interest);
      if (interestId) acc[interestId] = true;
      return acc;
    }, {}),
    tags: subscriber.tags || [],
    marketing_permissions: [
      {
        marketing_permission_id: 'newsletter',
        enabled: subscriber.preferences.newsletter,
      },
      {
        marketing_permission_id: 'promotions',
        enabled: subscriber.preferences.promotions,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailchimpData),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.title === 'Member Exists') {
        return { success: true, id: result.id, existing: true };
      }
      throw new Error(result.detail || 'Mailchimp API error');
    }

    return { success: true, id: result.id };
  } catch (error) {
    console.error('Mailchimp error:', error);
    throw error;
  }
}

// ConvertFlow integration (alternative/additional)
async function addToConvertFlow(subscriber: any) {
  const CONVERTFLOW_API_KEY = process.env.CONVERTFLOW_API_KEY;
  
  if (!CONVERTFLOW_API_KEY) {
    return { success: true, id: generateSubscriberId() };
  }

  try {
    const response = await fetch('https://api.convertflow.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONVERTFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: subscriber.email,
        first_name: subscriber.firstName,
        last_name: subscriber.lastName,
        phone: subscriber.phone,
        custom_fields: {
          source: subscriber.source,
          interests: subscriber.interests.join(','),
          gdpr_consent: subscriber.gdprConsent,
          marketing_consent: subscriber.marketingConsent,
        },
        tags: subscriber.tags || [],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'ConvertFlow API error');
    }

    return { success: true, id: result.id };
  } catch (error) {
    console.error('ConvertFlow error:', error);
    throw error;
  }
}

// Database storage (backup/primary storage)
async function storeSubscriber(subscriber: any) {
  // In a real application, this would store to your database
  // For now, we'll simulate with local storage concepts
  
  const subscriberId = generateSubscriberId();
  const confirmationToken = generateConfirmationToken();
  
  const subscriberRecord = {
    id: subscriberId,
    ...subscriber,
    status: 'pending',
    confirmationToken,
    subscribedAt: new Date().toISOString(),
    customFields: {
      ipAddress: subscriber.ipAddress,
      userAgent: subscriber.userAgent,
      referrer: subscriber.referrer,
    },
  };

  // Store subscriber data (replace with actual database)
  console.log('Storing subscriber:', subscriberRecord);
  
  return { success: true, id: subscriberId, confirmationToken };
}

// Send confirmation email
async function sendConfirmationEmail(subscriber: any, confirmationToken: string) {
  const confirmationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/email/confirm?token=${confirmationToken}`;
  
  const emailData = {
    to: subscriber.email,
    subject: 'Please confirm your subscription - Nycayen Hair Artistry',
    template: 'confirmation',
    data: {
      firstName: subscriber.firstName || 'Beauty Lover',
      confirmationUrl,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/email/unsubscribe?token=${confirmationToken}`,
    },
  };

  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Failed to send confirmation email');
    }

    return { success: true };
  } catch (error) {
    console.error('Confirmation email error:', error);
    throw error;
  }
}

function getMailchimpInterestId(interest: string): string | null {
  // Map your interest categories to Mailchimp interest IDs
  const interestMap: Record<string, string> = {
    'Hair Cuts & Styling': process.env.MAILCHIMP_INTEREST_CUTS || '',
    'Hair Color': process.env.MAILCHIMP_INTEREST_COLOR || '',
    'Wig Design': process.env.MAILCHIMP_INTEREST_WIGS || '',
    'Bridal Services': process.env.MAILCHIMP_INTEREST_BRIDAL || '',
    // Add more mappings as needed
  };

  return interestMap[interest] || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Add request metadata
    const subscriberData = {
      ...body,
      ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      referrer: request.headers.get('referer') || 'direct',
    };

    // Validate input
    const validatedData = subscriberSchema.parse(subscriberData);

    // Store in database first
    const dbResult = await storeSubscriber(validatedData);
    
    if (!dbResult.success) {
      throw new Error('Failed to store subscriber');
    }

    // Add to email service providers
    const results = await Promise.allSettled([
      addToMailchimp(validatedData),
      addToConvertFlow(validatedData),
    ]);

    // Check if at least one integration succeeded
    const hasSuccess = results.some(result => 
      result.status === 'fulfilled' && result.value.success
    );

    if (!hasSuccess) {
      console.warn('All email integrations failed, but subscriber stored locally');
    }

    // Send confirmation email
    try {
      await sendConfirmationEmail(validatedData, dbResult.confirmationToken!);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't fail the subscription if email sending fails
    }

    // Track subscription analytics
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'email_subscription',
        properties: {
          source: validatedData.source,
          interests: validatedData.interests,
          hasGdprConsent: validatedData.gdprConsent,
          hasMarketingConsent: validatedData.marketingConsent,
        },
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      id: dbResult.id,
      message: 'Subscription successful! Please check your email to confirm.',
    });

  } catch (error) {
    console.error('Subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Subscription failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for subscription status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  try {
    // Check subscription status (replace with actual database query)
    const status = 'pending'; // Would come from database
    
    return NextResponse.json({
      email,
      status,
      subscribedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}