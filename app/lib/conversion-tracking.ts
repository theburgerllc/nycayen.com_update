'use client';

import { AnalyticsManager } from './analytics';

export interface ConversionEvent {
  event: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  items?: ConversionItem[];
  booking_id?: string;
  service_type?: string;
  form_id?: string;
  source?: string;
  campaign?: string;
  [key: string]: any;
}

export interface ConversionItem {
  item_id: string;
  item_name: string;
  item_category: string;
  quantity: number;
  price: number;
}

export class ConversionTracker {
  // Booking Conversions
  static trackBookingInitiated(data: {
    service_type: string;
    service_category: string;
    estimated_value: number;
    preferred_date?: string;
    source?: string;
  }) {
    const event: ConversionEvent = {
      event: 'booking_initiated',
      value: data.estimated_value,
      currency: 'USD',
      service_type: data.service_type,
      service_category: data.service_category,
      preferred_date: data.preferred_date,
      source: data.source || 'website',
    };

    this.trackConversion(event);

    // Track funnel step
    this.trackFunnelStep('booking', 1, 'initiated', {
      service_type: data.service_type,
      estimated_value: data.estimated_value,
    });
  }

  static trackBookingStepCompleted(data: {
    step: number;
    step_name: string;
    service_type: string;
    estimated_value: number;
  }) {
    const event: ConversionEvent = {
      event: 'booking_step_completed',
      value: data.estimated_value,
      currency: 'USD',
      step: data.step,
      step_name: data.step_name,
      service_type: data.service_type,
    };

    this.trackConversion(event);
    this.trackFunnelStep('booking', data.step, data.step_name, {
      service_type: data.service_type,
      estimated_value: data.estimated_value,
    });
  }

  static trackBookingCompleted(data: {
    booking_id: string;
    service_type: string;
    service_category: string;
    value: number;
    appointment_date: string;
    duration_minutes: number;
    stylist?: string;
    customer_type?: 'new' | 'returning';
    payment_method?: string;
  }) {
    const event: ConversionEvent = {
      event: 'booking_completed',
      transaction_id: data.booking_id,
      value: data.value,
      currency: 'USD',
      booking_id: data.booking_id,
      service_type: data.service_type,
      service_category: data.service_category,
      appointment_date: data.appointment_date,
      duration_minutes: data.duration_minutes,
      stylist: data.stylist,
      customer_type: data.customer_type,
      payment_method: data.payment_method,
    };

    this.trackConversion(event);

    // Track as purchase for GA4
    this.trackPurchase({
      transaction_id: data.booking_id,
      value: data.value,
      currency: 'USD',
      items: [{
        item_id: data.service_type,
        item_name: data.service_type,
        item_category: data.service_category,
        quantity: 1,
        price: data.value,
      }],
    });

    // Complete funnel
    this.trackFunnelStep('booking', 99, 'completed', {
      booking_id: data.booking_id,
      value: data.value,
    });
  }

  // E-commerce Conversions
  static trackPurchase(data: {
    transaction_id: string;
    value: number;
    currency: string;
    items: ConversionItem[];
    coupon?: string;
    payment_method?: string;
    shipping?: number;
    tax?: number;
  }) {
    const event: ConversionEvent = {
      event: 'purchase',
      transaction_id: data.transaction_id,
      value: data.value,
      currency: data.currency,
      items: data.items,
      coupon: data.coupon,
      payment_method: data.payment_method,
      shipping: data.shipping,
      tax: data.tax,
    };

    this.trackConversion(event);

    // Facebook Pixel purchase
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: data.value,
        currency: data.currency,
        content_type: 'product',
        content_ids: data.items.map(item => item.item_id),
        num_items: data.items.reduce((sum, item) => sum + item.quantity, 0),
      });
    }
  }

  static trackAddToCart(data: {
    item_id: string;
    item_name: string;
    item_category: string;
    quantity: number;
    price: number;
    value: number;
  }) {
    const event: ConversionEvent = {
      event: 'add_to_cart',
      currency: 'USD',
      value: data.value,
      items: [{
        item_id: data.item_id,
        item_name: data.item_name,
        item_category: data.item_category,
        quantity: data.quantity,
        price: data.price,
      }],
    };

    this.trackConversion(event);

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        value: data.value,
        currency: 'USD',
        content_type: 'product',
        content_ids: [data.item_id],
      });
    }
  }

  static trackRemoveFromCart(data: {
    item_id: string;
    item_name: string;
    item_category: string;
    quantity: number;
    price: number;
    value: number;
  }) {
    const event: ConversionEvent = {
      event: 'remove_from_cart',
      currency: 'USD',
      value: data.value,
      items: [{
        item_id: data.item_id,
        item_name: data.item_name,
        item_category: data.item_category,
        quantity: data.quantity,
        price: data.price,
      }],
    };

    this.trackConversion(event);
  }

  static trackBeginCheckout(data: {
    value: number;
    currency: string;
    items: ConversionItem[];
  }) {
    const event: ConversionEvent = {
      event: 'begin_checkout',
      value: data.value,
      currency: data.currency,
      items: data.items,
    };

    this.trackConversion(event);

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: data.value,
        currency: data.currency,
        num_items: data.items.reduce((sum, item) => sum + item.quantity, 0),
      });
    }
  }

  // Lead Generation Conversions
  static trackNewsletterSignup(data: {
    source: string;
    list_type?: string;
    interests?: string[];
  }) {
    const event: ConversionEvent = {
      event: 'newsletter_signup',
      source: data.source,
      list_type: data.list_type || 'general',
      interests: data.interests,
    };

    this.trackConversion(event);

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Subscribe', {
        content_name: 'Newsletter',
      });
    }
  }

  static trackContactFormSubmission(data: {
    form_id: string;
    form_name: string;
    source: string;
    inquiry_type: string;
    estimated_value?: number;
  }) {
    const event: ConversionEvent = {
      event: 'contact_form_submit',
      form_id: data.form_id,
      form_name: data.form_name,
      source: data.source,
      inquiry_type: data.inquiry_type,
      value: data.estimated_value,
      currency: data.estimated_value ? 'USD' : undefined,
    };

    this.trackConversion(event);

    // Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', {
        content_name: data.form_name,
        content_category: data.inquiry_type,
      });
    }
  }

  static trackPhoneCallClick(data: {
    phone_number: string;
    source: string;
    page: string;
  }) {
    const event: ConversionEvent = {
      event: 'phone_call_click',
      phone_number: data.phone_number,
      source: data.source,
      page: data.page,
    };

    this.trackConversion(event);
  }

  // User Engagement Conversions
  static trackVideoEngagement(data: {
    video_title: string;
    video_duration: number;
    video_current_time: number;
    video_percent: number;
    action: 'play' | 'pause' | 'complete' | '25%' | '50%' | '75%';
  }) {
    const event: ConversionEvent = {
      event: 'video_engagement',
      video_title: data.video_title,
      video_duration: data.video_duration,
      video_current_time: data.video_current_time,
      video_percent: data.video_percent,
      action: data.action,
    };

    this.trackConversion(event);
  }

  static trackSocialShare(data: {
    platform: string;
    content_type: string;
    content_id: string;
    url: string;
  }) {
    const event: ConversionEvent = {
      event: 'social_share',
      platform: data.platform,
      content_type: data.content_type,
      content_id: data.content_id,
      url: data.url,
    };

    this.trackConversion(event);
  }

  static trackDownload(data: {
    file_name: string;
    file_type: string;
    file_size?: number;
    source: string;
  }) {
    const event: ConversionEvent = {
      event: 'file_download',
      file_name: data.file_name,
      file_type: data.file_type,
      file_size: data.file_size,
      source: data.source,
    };

    this.trackConversion(event);
  }

  // Utility Methods
  private static trackConversion(event: ConversionEvent) {
    // Send to Analytics Manager
    AnalyticsManager.track(event.event, event);

    // Send to Google Analytics directly
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event, event);
    }

    // Send to GTM Data Layer
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: event.event,
        ...event,
      });
    }

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Conversion tracked:', event);
    }
  }

  private static trackFunnelStep(
    funnel_name: string,
    step: number,
    step_name: string,
    additional_data: Record<string, any> = {}
  ) {
    const event: ConversionEvent = {
      event: 'funnel_step',
      funnel_name,
      funnel_step: step,
      step_name,
      ...additional_data,
    };

    this.trackConversion(event);
  }

  // Attribution Helper
  static getAttributionData(): Record<string, any> {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_content: urlParams.get('utm_content'),
      utm_term: urlParams.get('utm_term'),
      referrer: document.referrer,
      landing_page: window.location.href,
    };
  }

  // Customer Journey Tracking
  static trackCustomerJourneyStep(data: {
    journey_name: string;
    step: number;
    step_name: string;
    customer_type?: 'new' | 'returning';
    value?: number;
  }) {
    const event: ConversionEvent = {
      event: 'customer_journey_step',
      journey_name: data.journey_name,
      journey_step: data.step,
      step_name: data.step_name,
      customer_type: data.customer_type,
      value: data.value,
      currency: data.value ? 'USD' : undefined,
      ...this.getAttributionData(),
    };

    this.trackConversion(event);
  }

  // Goal Completion
  static trackGoalCompletion(data: {
    goal_name: string;
    goal_value?: number;
    goal_category: string;
    completion_time?: number;
  }) {
    const event: ConversionEvent = {
      event: 'goal_completion',
      goal_name: data.goal_name,
      goal_value: data.goal_value,
      goal_category: data.goal_category,
      completion_time: data.completion_time,
      value: data.goal_value,
      currency: data.goal_value ? 'USD' : undefined,
    };

    this.trackConversion(event);
  }
}

// React Hooks for easy integration
export function useConversionTracking() {
  return {
    trackBookingInitiated: ConversionTracker.trackBookingInitiated,
    trackBookingStepCompleted: ConversionTracker.trackBookingStepCompleted,
    trackBookingCompleted: ConversionTracker.trackBookingCompleted,
    trackPurchase: ConversionTracker.trackPurchase,
    trackAddToCart: ConversionTracker.trackAddToCart,
    trackRemoveFromCart: ConversionTracker.trackRemoveFromCart,
    trackBeginCheckout: ConversionTracker.trackBeginCheckout,
    trackNewsletterSignup: ConversionTracker.trackNewsletterSignup,
    trackContactFormSubmission: ConversionTracker.trackContactFormSubmission,
    trackPhoneCallClick: ConversionTracker.trackPhoneCallClick,
    trackVideoEngagement: ConversionTracker.trackVideoEngagement,
    trackSocialShare: ConversionTracker.trackSocialShare,
    trackDownload: ConversionTracker.trackDownload,
    trackCustomerJourneyStep: ConversionTracker.trackCustomerJourneyStep,
    trackGoalCompletion: ConversionTracker.trackGoalCompletion,
  };
}