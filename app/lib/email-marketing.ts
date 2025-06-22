// Email Marketing and Lead Generation System
'use client';

import { z } from 'zod';

// Types and Interfaces
export interface EmailSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  interests: string[];
  source: 'popup' | 'footer' | 'inline' | 'lead-magnet' | 'checkout';
  status: 'pending' | 'confirmed' | 'unsubscribed' | 'bounced';
  gdprConsent: boolean;
  marketingConsent: boolean;
  preferences: EmailPreferences;
  subscribedAt: Date;
  confirmedAt?: Date;
  lastEmailAt?: Date;
  tags: string[];
  customFields: Record<string, any>;
}

export interface EmailPreferences {
  newsletter: boolean;
  promotions: boolean;
  bookingReminders: boolean;
  serviceUpdates: boolean;
  vipOffers: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface EmailCampaign {
  id: string;
  name: string;
  type: 'newsletter' | 'promotional' | 'transactional' | 'automation';
  subject: string;
  content: string;
  segments: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  analytics: CampaignAnalytics;
}

export interface CampaignAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  bounceRate: number;
}

// Validation Schemas
export const subscriberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  interests: z.array(z.string()).default([]),
  source: z.enum(['popup', 'footer', 'inline', 'lead-magnet', 'checkout']),
  gdprConsent: z.boolean().refine(val => val === true, 'GDPR consent is required'),
  marketingConsent: z.boolean(),
  preferences: z.object({
    newsletter: z.boolean().default(true),
    promotions: z.boolean().default(true),
    bookingReminders: z.boolean().default(true),
    serviceUpdates: z.boolean().default(true),
    vipOffers: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  }).default({}),
});

export type SubscriberInput = z.infer<typeof subscriberSchema>;

// Email Marketing Service Class
export class EmailMarketingService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    this.apiKey = process.env.MAILCHIMP_API_KEY || '';
  }

  // Newsletter Subscription
  async subscribe(data: SubscriberInput): Promise<{ success: boolean; subscriberId?: string; error?: string }> {
    try {
      const validatedData = subscriberSchema.parse(data);
      
      const response = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Subscription failed');
      }

      // Track subscription event
      this.trackEvent('newsletter_subscribe', {
        source: data.source,
        interests: data.interests,
        hasConsent: data.gdprConsent,
      });

      return { success: true, subscriberId: result.id };
    } catch (error) {
      console.error('Subscription error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Double Opt-in Confirmation
  async confirmSubscription(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/email/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Confirmation failed');
      }

      this.trackEvent('newsletter_confirmed', { token });

      return { success: true };
    } catch (error) {
      console.error('Confirmation error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Update Preferences
  async updatePreferences(subscriberId: string, preferences: Partial<EmailPreferences>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/email/preferences/${subscriberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update preferences');
      }

      this.trackEvent('preferences_updated', { subscriberId, preferences });

      return { success: true };
    } catch (error) {
      console.error('Preferences update error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Unsubscribe
  async unsubscribe(subscriberId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriberId, reason }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unsubscribe failed');
      }

      this.trackEvent('newsletter_unsubscribe', { subscriberId, reason });

      return { success: true };
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Segmentation
  async getSubscriberSegment(criteria: {
    interests?: string[];
    source?: string;
    lastActiveAfter?: Date;
    tags?: string[];
  }): Promise<EmailSubscriber[]> {
    try {
      const response = await fetch('/api/email/segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get segment');
      }

      return result.subscribers;
    } catch (error) {
      console.error('Segmentation error:', error);
      return [];
    }
  }

  // Campaign Analytics
  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics | null> {
    try {
      const response = await fetch(`/api/email/campaigns/${campaignId}/analytics`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get analytics');
      }

      return result.analytics;
    } catch (error) {
      console.error('Analytics error:', error);
      return null;
    }
  }

  // Event Tracking
  private trackEvent(eventName: string, properties: Record<string, any>) {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', eventName, {
        event_category: 'Email Marketing',
        event_label: properties.source || 'unknown',
        custom_map: properties,
      });
    }

    // Send to custom analytics
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }
}

// Lead Magnet Service
export class LeadMagnetService {
  async downloadGuide(guideType: string, email: string): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const response = await fetch('/api/lead-magnets/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guideType, email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Download failed');
      }

      return { success: true, downloadUrl: result.downloadUrl };
    } catch (error) {
      console.error('Lead magnet error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async requestVIPAccess(email: string, preferences: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/lead-magnets/vip-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, preferences }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'VIP access request failed');
      }

      return { success: true };
    } catch (error) {
      console.error('VIP access error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// A/B Testing Service
export class ABTestingService {
  private tests: Map<string, any> = new Map();

  createTest(testName: string, variants: string[], weights?: number[]): void {
    const normalizedWeights = weights || variants.map(() => 1 / variants.length);
    
    this.tests.set(testName, {
      variants,
      weights: normalizedWeights,
      results: new Map(),
    });
  }

  getVariant(testName: string, userId: string): string {
    const test = this.tests.get(testName);
    if (!test) return 'control';

    // Deterministic assignment based on user ID
    const hash = this.hashString(userId + testName);
    const random = (hash % 1000) / 1000;

    let cumulativeWeight = 0;
    for (let i = 0; i < test.variants.length; i++) {
      cumulativeWeight += test.weights[i];
      if (random <= cumulativeWeight) {
        return test.variants[i];
      }
    }

    return test.variants[0];
  }

  trackConversion(testName: string, variant: string, userId: string): void {
    const test = this.tests.get(testName);
    if (!test) return;

    if (!test.results.has(variant)) {
      test.results.set(variant, { views: 0, conversions: 0 });
    }

    const variantResults = test.results.get(variant);
    variantResults.conversions += 1;

    // Send to analytics
    fetch('/api/analytics/ab-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testName,
        variant,
        userId,
        event: 'conversion',
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }

  trackView(testName: string, variant: string, userId: string): void {
    const test = this.tests.get(testName);
    if (!test) return;

    if (!test.results.has(variant)) {
      test.results.set(variant, { views: 0, conversions: 0 });
    }

    const variantResults = test.results.get(variant);
    variantResults.views += 1;

    // Send to analytics
    fetch('/api/analytics/ab-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        testName,
        variant,
        userId,
        event: 'view',
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }

  getTestResults(testName: string): any {
    const test = this.tests.get(testName);
    if (!test) return null;

    const results: any = {};
    test.results.forEach((data: any, variant: string) => {
      results[variant] = {
        views: data.views,
        conversions: data.conversions,
        conversionRate: data.views > 0 ? data.conversions / data.views : 0,
      };
    });

    return results;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Global instances
export const emailMarketing = new EmailMarketingService();
export const leadMagnets = new LeadMagnetService();
export const abTesting = new ABTestingService();

// Utility functions
export function generateSubscriberId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConfirmationToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

// Interest categories for segmentation
export const INTEREST_CATEGORIES = [
  'Hair Cuts & Styling',
  'Hair Color',
  'Wig Design',
  'Bridal Services',
  'Special Events',
  'Hair Care Tips',
  'Product Recommendations',
  'Exclusive Offers',
  'VIP Services',
  'Beauty Trends',
] as const;

export type InterestCategory = typeof INTEREST_CATEGORIES[number];