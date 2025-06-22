"use client";

// Analytics tracking utilities for booking flow
export interface BookingAnalyticsEvent {
  event: string;
  step?: string;
  service_count?: number;
  total_value?: number;
  duration?: number;
  payment_method?: string;
  error_message?: string;
}

export class BookingAnalytics {
  private static gtag = (typeof window !== 'undefined' && window.gtag) || null;

  static trackEvent(eventData: BookingAnalyticsEvent) {
    if (this.gtag) {
      this.gtag('event', eventData.event, {
        custom_parameter_1: eventData.step,
        custom_parameter_2: eventData.service_count,
        value: eventData.total_value,
        currency: 'USD',
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Booking Analytics:', eventData);
    }
  }

  static trackStepStart(step: string) {
    this.trackEvent({
      event: 'booking_step_start',
      step,
    });
  }

  static trackStepComplete(step: string, data?: Partial<BookingAnalyticsEvent>) {
    this.trackEvent({
      event: 'booking_step_complete',
      step,
      ...data,
    });
  }

  static trackServiceSelection(serviceCount: number, totalValue: number) {
    this.trackEvent({
      event: 'booking_services_selected',
      service_count: serviceCount,
      total_value: totalValue,
    });
  }

  static trackDateTimeSelection(duration: number) {
    this.trackEvent({
      event: 'booking_datetime_selected',
      duration,
    });
  }

  static trackAddOnsSelection(addOnCount: number, addOnValue: number) {
    this.trackEvent({
      event: 'booking_addons_selected',
      service_count: addOnCount,
      total_value: addOnValue,
    });
  }

  static trackPaymentStart(paymentMethod: string, totalValue: number) {
    this.trackEvent({
      event: 'booking_payment_start',
      payment_method: paymentMethod,
      total_value: totalValue,
    });
  }

  static trackBookingComplete(bookingId: string, totalValue: number, paymentMethod: string) {
    this.trackEvent({
      event: 'booking_complete',
      total_value: totalValue,
      payment_method: paymentMethod,
    });

    if (this.gtag) {
      this.gtag('event', 'purchase', {
        transaction_id: bookingId,
        value: totalValue,
        currency: 'USD',
        items: [{
          item_id: 'hair_service',
          item_name: 'Hair Service Booking',
          category: 'Hair Services',
          quantity: 1,
          price: totalValue,
        }],
      });
    }
  }

  static trackError(step: string, errorMessage: string) {
    this.trackEvent({
      event: 'booking_error',
      step,
      error_message: errorMessage,
    });

    if (this.gtag) {
      this.gtag('event', 'exception', {
        description: `Booking Error - ${step}: ${errorMessage}`,
        fatal: false,
      });
    }
  }

  static trackFormValidationError(step: string, fieldName: string, errorMessage: string) {
    this.trackEvent({
      event: 'booking_validation_error',
      step,
      error_message: `${fieldName}: ${errorMessage}`,
    });
  }

  static trackFunnelDrop(fromStep: string, toStep: string) {
    this.trackEvent({
      event: 'booking_funnel_drop',
      step: `${fromStep}_to_${toStep}`,
    });
  }
}