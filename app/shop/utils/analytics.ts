"use client";

// Shop Analytics utilities
export interface ShopAnalyticsEvent {
  event: string;
  productId?: string;
  productName?: string;
  productCategory?: string;
  productPrice?: number;
  quantity?: number;
  cartTotal?: number;
  searchTerm?: string;
  filterType?: string;
  filterValue?: string;
  couponCode?: string;
  orderId?: string;
  revenue?: number;
  customProperties?: { [key: string]: any };
}

export class ShopAnalytics {
  private static gtag = (typeof window !== 'undefined' && window.gtag) || null;

  static trackEvent(eventData: ShopAnalyticsEvent) {
    // Google Analytics tracking
    if (this.gtag) {
      this.gtag('event', eventData.event, {
        custom_parameter_1: eventData.productCategory,
        custom_parameter_2: eventData.searchTerm,
        value: eventData.revenue || eventData.productPrice || eventData.cartTotal,
        currency: 'USD',
        ...eventData.customProperties,
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🛒 Shop Analytics:', eventData);
    }

    // Custom analytics service (extend as needed)
    this.sendToCustomAnalytics(eventData);
  }

  private static sendToCustomAnalytics(eventData: ShopAnalyticsEvent) {
    // Example: Send to custom analytics service
    if (typeof window !== 'undefined') {
      try {
        // You can integrate with services like Mixpanel, Amplitude, etc.
        fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...eventData,
            timestamp: new Date().toISOString(),
            sessionId: sessionStorage.getItem('session_id'),
            userId: localStorage.getItem('user_id'),
          }),
        }).catch(error => {
          console.warn('Failed to send custom analytics:', error);
        });
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    }
  }

  // Product Events
  static trackProductView(productId: string, productName: string, productCategory: string, productPrice: number) {
    this.trackEvent({
      event: 'view_item',
      productId,
      productName,
      productCategory,
      productPrice,
    });

    // Enhanced ecommerce tracking
    if (this.gtag) {
      this.gtag('event', 'view_item', {
        currency: 'USD',
        value: productPrice,
        items: [{
          item_id: productId,
          item_name: productName,
          category: productCategory,
          price: productPrice,
          quantity: 1,
        }],
      });
    }
  }

  static trackAddToCart(productId: string, productName: string, productCategory: string, productPrice: number, quantity: number = 1) {
    const totalValue = productPrice * quantity;
    
    this.trackEvent({
      event: 'add_to_cart',
      productId,
      productName,
      productCategory,
      productPrice,
      quantity,
      revenue: totalValue,
    });

    if (this.gtag) {
      this.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: totalValue,
        items: [{
          item_id: productId,
          item_name: productName,
          category: productCategory,
          price: productPrice,
          quantity: quantity,
        }],
      });
    }
  }

  static trackRemoveFromCart(productId: string, productName: string, productCategory: string, productPrice: number, quantity: number = 1) {
    const totalValue = productPrice * quantity;
    
    this.trackEvent({
      event: 'remove_from_cart',
      productId,
      productName,
      productCategory,
      productPrice,
      quantity,
      revenue: totalValue,
    });

    if (this.gtag) {
      this.gtag('event', 'remove_from_cart', {
        currency: 'USD',
        value: totalValue,
        items: [{
          item_id: productId,
          item_name: productName,
          category: productCategory,
          price: productPrice,
          quantity: quantity,
        }],
      });
    }
  }

  static trackAddToWishlist(productId: string, productName: string, productCategory: string, productPrice: number) {
    this.trackEvent({
      event: 'add_to_wishlist',
      productId,
      productName,
      productCategory,
      productPrice,
    });

    if (this.gtag) {
      this.gtag('event', 'add_to_wishlist', {
        currency: 'USD',
        value: productPrice,
        items: [{
          item_id: productId,
          item_name: productName,
          category: productCategory,
          price: productPrice,
          quantity: 1,
        }],
      });
    }
  }

  // Search and Filter Events
  static trackSearch(searchTerm: string, resultCount: number = 0) {
    this.trackEvent({
      event: 'search',
      searchTerm,
      customProperties: {
        search_term: searchTerm,
        result_count: resultCount,
      },
    });

    if (this.gtag) {
      this.gtag('event', 'search', {
        search_term: searchTerm,
        result_count: resultCount,
      });
    }
  }

  static trackFilter(filterType: string, filterValue: string, resultCount: number = 0) {
    this.trackEvent({
      event: 'filter_products',
      filterType,
      filterValue,
      customProperties: {
        filter_type: filterType,
        filter_value: filterValue,
        result_count: resultCount,
      },
    });
  }

  static trackSort(sortBy: string, sortOrder: string) {
    this.trackEvent({
      event: 'sort_products',
      customProperties: {
        sort_by: sortBy,
        sort_order: sortOrder,
      },
    });
  }

  // Cart Events
  static trackViewCart(cartTotal: number, itemCount: number) {
    this.trackEvent({
      event: 'view_cart',
      cartTotal,
      customProperties: {
        cart_total: cartTotal,
        item_count: itemCount,
      },
    });

    if (this.gtag) {
      this.gtag('event', 'view_cart', {
        currency: 'USD',
        value: cartTotal,
      });
    }
  }

  static trackBeginCheckout(cartTotal: number, cartItems: any[]) {
    this.trackEvent({
      event: 'begin_checkout',
      cartTotal,
      customProperties: {
        cart_total: cartTotal,
        item_count: cartItems.length,
      },
    });

    if (this.gtag) {
      this.gtag('event', 'begin_checkout', {
        currency: 'USD',
        value: cartTotal,
        items: cartItems.map((item, index) => ({
          item_id: item.productId,
          item_name: item.productName || `Item ${index + 1}`,
          category: item.productCategory || 'Unknown',
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }
  }

  static trackPurchase(orderId: string, revenue: number, tax: number, shipping: number, cartItems: any[]) {
    this.trackEvent({
      event: 'purchase',
      orderId,
      revenue,
      customProperties: {
        transaction_id: orderId,
        value: revenue,
        tax: tax,
        shipping: shipping,
        currency: 'USD',
      },
    });

    if (this.gtag) {
      this.gtag('event', 'purchase', {
        transaction_id: orderId,
        value: revenue,
        tax: tax,
        shipping: shipping,
        currency: 'USD',
        items: cartItems.map((item, index) => ({
          item_id: item.productId,
          item_name: item.productName || `Item ${index + 1}`,
          category: item.productCategory || 'Unknown',
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }
  }

  // Promotional Events
  static trackCouponUsage(couponCode: string, discount: number, cartTotal: number) {
    this.trackEvent({
      event: 'coupon_applied',
      couponCode,
      cartTotal,
      customProperties: {
        coupon_code: couponCode,
        discount_amount: discount,
        cart_total: cartTotal,
      },
    });
  }

  static trackPromoView(promoId: string, promoName: string) {
    this.trackEvent({
      event: 'view_promotion',
      customProperties: {
        promotion_id: promoId,
        promotion_name: promoName,
      },
    });

    if (this.gtag) {
      this.gtag('event', 'view_promotion', {
        promotion_id: promoId,
        promotion_name: promoName,
      });
    }
  }

  // User Behavior Events
  static trackPageView(pageName: string, pageCategory?: string) {
    this.trackEvent({
      event: 'page_view',
      customProperties: {
        page_title: pageName,
        page_category: pageCategory,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
      },
    });

    if (this.gtag) {
      this.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
        page_title: pageName,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
      });
    }
  }

  static trackUserEngagement(action: string, category: string, label?: string, value?: number) {
    this.trackEvent({
      event: 'user_engagement',
      customProperties: {
        engagement_action: action,
        engagement_category: category,
        engagement_label: label,
        engagement_value: value,
      },
    });

    if (this.gtag) {
      this.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }

  // Error Tracking
  static trackError(errorType: string, errorMessage: string, errorLocation?: string) {
    this.trackEvent({
      event: 'shop_error',
      customProperties: {
        error_type: errorType,
        error_message: errorMessage,
        error_location: errorLocation,
      },
    });

    if (this.gtag) {
      this.gtag('event', 'exception', {
        description: `${errorType}: ${errorMessage}`,
        fatal: false,
      });
    }
  }

  // Performance Tracking
  static trackTiming(category: string, variable: string, time: number, label?: string) {
    this.trackEvent({
      event: 'timing_complete',
      customProperties: {
        timing_category: category,
        timing_variable: variable,
        timing_value: time,
        timing_label: label,
      },
    });

    if (this.gtag) {
      this.gtag('event', 'timing_complete', {
        name: variable,
        value: time,
        event_category: category,
        event_label: label,
      });
    }
  }

  // Conversion Funnel Tracking
  static trackFunnelStep(funnelName: string, stepName: string, stepNumber: number, value?: number) {
    this.trackEvent({
      event: 'funnel_step',
      customProperties: {
        funnel_name: funnelName,
        step_name: stepName,
        step_number: stepNumber,
        value: value,
      },
    });
  }

  static trackConversion(conversionType: string, conversionValue: number, conversionCurrency: string = 'USD') {
    this.trackEvent({
      event: 'conversion',
      revenue: conversionValue,
      customProperties: {
        conversion_type: conversionType,
        conversion_value: conversionValue,
        conversion_currency: conversionCurrency,
      },
    });

    if (this.gtag) {
      this.gtag('event', 'conversion', {
        value: conversionValue,
        currency: conversionCurrency,
      });
    }
  }
}

// Utility function to track page views automatically
export function useShopAnalytics() {
  const trackPageView = (pageName: string, pageCategory?: string) => {
    ShopAnalytics.trackPageView(pageName, pageCategory);
  };

  const trackProductView = (productId: string, productName: string, productCategory: string, productPrice: number) => {
    ShopAnalytics.trackProductView(productId, productName, productCategory, productPrice);
  };

  const trackAddToCart = (productId: string, productName: string, productCategory: string, productPrice: number, quantity?: number) => {
    ShopAnalytics.trackAddToCart(productId, productName, productCategory, productPrice, quantity);
  };

  const trackSearch = (searchTerm: string, resultCount?: number) => {
    ShopAnalytics.trackSearch(searchTerm, resultCount);
  };

  return {
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackSearch,
    ShopAnalytics,
  };
}