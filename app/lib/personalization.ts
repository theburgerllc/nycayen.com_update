// Advanced Personalization and Behavioral Targeting System
'use client';

import { z } from 'zod';

// Types and Interfaces
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  demographics: {
    age?: number;
    location?: string;
    timezone?: string;
  };
  preferences: {
    hairType?: 'curly' | 'straight' | 'wavy' | 'coily';
    hairLength?: 'short' | 'medium' | 'long';
    concerns?: string[];
    serviceInterests?: string[];
    priceRange?: 'budget' | 'mid-range' | 'luxury';
    communicationFrequency?: 'daily' | 'weekly' | 'monthly';
  };
  behavior: {
    pageViews: PageView[];
    emailEngagement: EmailEngagement[];
    bookings: Booking[];
    purchases: Purchase[];
  };
  segments: string[];
  lifetimeValue: number;
  lastActivity: Date;
  createdAt: Date;
}

export interface PageView {
  url: string;
  title: string;
  timestamp: Date;
  duration: number;
  source: string;
  device: 'mobile' | 'tablet' | 'desktop';
}

export interface EmailEngagement {
  campaignId: string;
  action: 'sent' | 'opened' | 'clicked' | 'unsubscribed';
  timestamp: Date;
  element?: string; // For click tracking
}

export interface Booking {
  id: string;
  serviceType: string;
  date: Date;
  amount: number;
  status: 'completed' | 'cancelled' | 'no-show';
}

export interface Purchase {
  id: string;
  items: PurchaseItem[];
  total: number;
  date: Date;
  channel: 'online' | 'in-store';
}

export interface PurchaseItem {
  productId: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

export interface PersonalizationRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
  type: 'content' | 'email' | 'offer' | 'popup';
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'exists' | 'not_exists';
  value: any;
  segment?: string;
}

export interface RuleAction {
  type: 'show_content' | 'hide_content' | 'send_email' | 'apply_discount' | 'redirect' | 'track_event';
  parameters: Record<string, any>;
}

// Personalization Engine
export class PersonalizationEngine {
  private userProfiles: Map<string, UserProfile> = new Map();
  private rules: PersonalizationRule[] = [];
  private segments: Map<string, RuleCondition[]> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeSegments();
  }

  // Initialize default personalization rules
  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'first-time-visitor',
        name: 'First Time Visitor Welcome',
        conditions: [
          { field: 'pageViews.length', operator: 'equals', value: 1 }
        ],
        actions: [
          {
            type: 'show_content',
            parameters: {
              contentId: 'welcome-banner',
              message: 'Welcome! Get 15% off your first service',
            }
          }
        ],
        priority: 10,
        enabled: true,
        type: 'content',
      },
      {
        id: 'returning-visitor-no-booking',
        name: 'Returning Visitor Without Booking',
        conditions: [
          { field: 'pageViews.length', operator: 'greater_than', value: 3 },
          { field: 'bookings.length', operator: 'equals', value: 0 }
        ],
        actions: [
          {
            type: 'show_content',
            parameters: {
              contentId: 'booking-incentive',
              message: 'Ready to book? Get a free consultation!',
            }
          }
        ],
        priority: 8,
        enabled: true,
        type: 'content',
      },
      {
        id: 'high-value-customer',
        name: 'High Value Customer Rewards',
        conditions: [
          { field: 'lifetimeValue', operator: 'greater_than', value: 500 }
        ],
        actions: [
          {
            type: 'apply_discount',
            parameters: {
              discountType: 'percentage',
              value: 20,
              message: 'VIP 20% discount - Thank you for your loyalty!',
            }
          }
        ],
        priority: 9,
        enabled: true,
        type: 'offer',
      },
      {
        id: 'curly-hair-specialist',
        name: 'Curly Hair Content',
        conditions: [
          { field: 'preferences.hairType', operator: 'equals', value: 'curly' }
        ],
        actions: [
          {
            type: 'show_content',
            parameters: {
              contentId: 'curly-hair-tips',
              contentType: 'blog-recommendation',
            }
          }
        ],
        priority: 5,
        enabled: true,
        type: 'content',
      },
      {
        id: 'abandoned-cart-recovery',
        name: 'Cart Abandonment Follow-up',
        conditions: [
          { field: 'lastActivity', operator: 'less_than', value: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          { field: 'cartItems.length', operator: 'greater_than', value: 0 }
        ],
        actions: [
          {
            type: 'send_email',
            parameters: {
              templateId: 'cart-abandonment',
              delay: 60, // minutes
            }
          }
        ],
        priority: 7,
        enabled: true,
        type: 'email',
      },
    ];
  }

  // Initialize user segments
  private initializeSegments() {
    this.segments.set('new-subscribers', [
      { field: 'createdAt', operator: 'greater_than', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    ]);

    this.segments.set('high-engagement', [
      { field: 'emailEngagement.opened.length', operator: 'greater_than', value: 10 },
      { field: 'pageViews.length', operator: 'greater_than', value: 20 }
    ]);

    this.segments.set('vip-customers', [
      { field: 'lifetimeValue', operator: 'greater_than', value: 1000 },
      { field: 'bookings.length', operator: 'greater_than', value: 5 }
    ]);

    this.segments.set('at-risk', [
      { field: 'lastActivity', operator: 'less_than', value: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      { field: 'bookings.length', operator: 'greater_than', value: 0 }
    ]);

    this.segments.set('color-enthusiasts', [
      { field: 'preferences.serviceInterests', operator: 'contains', value: 'Hair Color' },
      { field: 'bookings.serviceType', operator: 'contains', value: 'color' }
    ]);
  }

  // Track user behavior
  async trackBehavior(userId: string, event: string, data: any): Promise<void> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = await this.createUserProfile(userId, data);
    }

    switch (event) {
      case 'page_view':
        profile.behavior.pageViews.push({
          url: data.url,
          title: data.title,
          timestamp: new Date(),
          duration: data.duration || 0,
          source: data.source || 'direct',
          device: data.device || 'desktop',
        });
        break;

      case 'email_engagement':
        profile.behavior.emailEngagement.push({
          campaignId: data.campaignId,
          action: data.action,
          timestamp: new Date(),
          element: data.element,
        });
        break;

      case 'booking_created':
        profile.behavior.bookings.push({
          id: data.bookingId,
          serviceType: data.serviceType,
          date: new Date(data.date),
          amount: data.amount,
          status: 'completed',
        });
        profile.lifetimeValue += data.amount;
        break;

      case 'purchase':
        profile.behavior.purchases.push({
          id: data.purchaseId,
          items: data.items,
          total: data.total,
          date: new Date(),
          channel: data.channel || 'online',
        });
        profile.lifetimeValue += data.total;
        break;
    }

    profile.lastActivity = new Date();
    profile.segments = this.calculateSegments(profile);
    this.userProfiles.set(userId, profile);

    // Store in database
    await this.saveUserProfile(profile);

    // Check for triggered actions
    await this.evaluateRules(profile);
  }

  // Create new user profile
  private async createUserProfile(userId: string, initialData: any): Promise<UserProfile> {
    const profile: UserProfile = {
      id: userId,
      email: initialData.email || '',
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      demographics: {
        age: initialData.age,
        location: initialData.location,
        timezone: initialData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      preferences: {
        hairType: initialData.hairType,
        hairLength: initialData.hairLength,
        concerns: initialData.concerns || [],
        serviceInterests: initialData.serviceInterests || [],
        priceRange: initialData.priceRange,
        communicationFrequency: initialData.communicationFrequency || 'weekly',
      },
      behavior: {
        pageViews: [],
        emailEngagement: [],
        bookings: [],
        purchases: [],
      },
      segments: [],
      lifetimeValue: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  // Calculate user segments
  private calculateSegments(profile: UserProfile): string[] {
    const segments: string[] = [];

    this.segments.forEach((conditions, segmentName) => {
      if (this.evaluateConditions(profile, conditions)) {
        segments.push(segmentName);
      }
    });

    return segments;
  }

  // Evaluate personalization rules
  private async evaluateRules(profile: UserProfile): Promise<void> {
    const applicableRules = this.rules
      .filter(rule => rule.enabled)
      .filter(rule => this.evaluateConditions(profile, rule.conditions))
      .sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      await this.executeActions(profile, rule.actions);
    }
  }

  // Evaluate rule conditions
  private evaluateConditions(profile: UserProfile, conditions: RuleCondition[]): boolean {
    return conditions.every(condition => {
      const value = this.getValueFromProfile(profile, condition.field);
      return this.evaluateCondition(value, condition.operator, condition.value);
    });
  }

  // Get value from user profile by field path
  private getValueFromProfile(profile: UserProfile, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value: any = profile;

    for (const part of parts) {
      if (value == null) return null;
      
      if (part.includes('[') && part.includes(']')) {
        // Handle array access like "pageViews[0].url"
        const [arrayField, indexStr] = part.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        value = value[arrayField]?.[index];
      } else if (part === 'length' && Array.isArray(value)) {
        return value.length;
      } else {
        value = value[part];
      }
    }

    return value;
  }

  // Evaluate single condition
  private evaluateCondition(actualValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue;
      case 'not_equals':
        return actualValue !== expectedValue;
      case 'contains':
        return Array.isArray(actualValue) 
          ? actualValue.includes(expectedValue)
          : String(actualValue).includes(String(expectedValue));
      case 'greater_than':
        return Number(actualValue) > Number(expectedValue);
      case 'less_than':
        return Number(actualValue) < Number(expectedValue);
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
      case 'exists':
        return actualValue != null;
      case 'not_exists':
        return actualValue == null;
      default:
        return false;
    }
  }

  // Execute rule actions
  private async executeActions(profile: UserProfile, actions: RuleAction[]): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(profile, action);
      } catch (error) {
        console.error('Failed to execute action:', action, error);
      }
    }
  }

  // Execute single action
  private async executeAction(profile: UserProfile, action: RuleAction): Promise<void> {
    switch (action.type) {
      case 'show_content':
        await this.showPersonalizedContent(profile, action.parameters);
        break;
      case 'send_email':
        await this.sendPersonalizedEmail(profile, action.parameters);
        break;
      case 'apply_discount':
        await this.applyPersonalizedDiscount(profile, action.parameters);
        break;
      case 'track_event':
        await this.trackPersonalizationEvent(profile, action.parameters);
        break;
    }
  }

  // Show personalized content
  private async showPersonalizedContent(profile: UserProfile, parameters: any): Promise<void> {
    const contentEvent = new CustomEvent('personalized-content', {
      detail: {
        userId: profile.id,
        contentId: parameters.contentId,
        message: parameters.message,
        contentType: parameters.contentType,
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(contentEvent);
    }
  }

  // Send personalized email
  private async sendPersonalizedEmail(profile: UserProfile, parameters: any): Promise<void> {
    const emailData = {
      to: profile.email,
      templateId: parameters.templateId,
      delay: parameters.delay || 0,
      personalization: {
        firstName: profile.firstName,
        preferences: profile.preferences,
        segments: profile.segments,
        lifetimeValue: profile.lifetimeValue,
      },
    };

    fetch('/api/email/personalized-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    }).catch(console.error);
  }

  // Apply personalized discount
  private async applyPersonalizedDiscount(profile: UserProfile, parameters: any): Promise<void> {
    const discountEvent = new CustomEvent('personalized-discount', {
      detail: {
        userId: profile.id,
        discountType: parameters.discountType,
        value: parameters.value,
        message: parameters.message,
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(discountEvent);
    }
  }

  // Track personalization event
  private async trackPersonalizationEvent(profile: UserProfile, parameters: any): Promise<void> {
    fetch('/api/analytics/personalization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: profile.id,
        event: parameters.event,
        properties: parameters.properties,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }

  // Save user profile to database
  private async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await fetch('/api/personalization/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  // Public API methods
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      try {
        const response = await fetch(`/api/personalization/profile?userId=${userId}`);
        if (response.ok) {
          profile = await response.json();
          this.userProfiles.set(userId, profile);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }

    return profile || null;
  }

  async getPersonalizedContent(userId: string, context: any = {}): Promise<any> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;

    // Generate personalized content based on profile and context
    return {
      recommendations: this.generateRecommendations(profile, context),
      offers: this.generateOffers(profile, context),
      content: this.generateContent(profile, context),
    };
  }

  private generateRecommendations(profile: UserProfile, context: any): any[] {
    const recommendations = [];

    // Service recommendations based on hair type and interests
    if (profile.preferences.hairType === 'curly') {
      recommendations.push({
        type: 'service',
        title: 'Curly Hair Specialist Treatment',
        description: 'Perfect for your curly hair type',
        priority: 9,
      });
    }

    // Product recommendations based on purchase history
    if (profile.behavior.purchases.length > 0) {
      recommendations.push({
        type: 'product',
        title: 'Recommended Hair Care Products',
        description: 'Based on your previous purchases',
        priority: 7,
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private generateOffers(profile: UserProfile, context: any): any[] {
    const offers = [];

    // VIP customer offers
    if (profile.segments.includes('vip-customers')) {
      offers.push({
        type: 'discount',
        title: 'VIP 20% Off',
        description: 'Exclusive discount for our valued customers',
        value: 20,
        code: 'VIP20',
      });
    }

    // First-time booking offer
    if (profile.behavior.bookings.length === 0) {
      offers.push({
        type: 'service',
        title: 'Free Consultation',
        description: 'Complimentary consultation with your first booking',
        value: 'free',
      });
    }

    return offers;
  }

  private generateContent(profile: UserProfile, context: any): any[] {
    const content = [];

    // Hair care tips based on preferences
    if (profile.preferences.concerns?.includes('damage')) {
      content.push({
        type: 'article',
        title: 'Hair Repair and Recovery Tips',
        url: '/blog/hair-repair-guide',
        relevance: 'high',
      });
    }

    return content;
  }

  // Segment management
  addSegment(name: string, conditions: RuleCondition[]): void {
    this.segments.set(name, conditions);
    
    // Recalculate all user segments
    this.userProfiles.forEach(profile => {
      profile.segments = this.calculateSegments(profile);
    });
  }

  removeSegment(name: string): void {
    this.segments.delete(name);
  }

  // Rule management
  addRule(rule: PersonalizationRule): void {
    this.rules.push(rule);
  }

  updateRule(ruleId: string, updates: Partial<PersonalizationRule>): void {
    const index = this.rules.findIndex(rule => rule.id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
    }
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(rule => rule.id !== ruleId);
  }

  getRules(): PersonalizationRule[] {
    return [...this.rules];
  }

  getSegments(): Map<string, RuleCondition[]> {
    return new Map(this.segments);
  }
}

// Dynamic Content Renderer
export class DynamicContentRenderer {
  private personalization: PersonalizationEngine;

  constructor(personalizationEngine: PersonalizationEngine) {
    this.personalization = personalizationEngine;
  }

  async renderPersonalizedContent(userId: string, contentId: string, defaultContent: any): Promise<any> {
    const personalizedData = await this.personalization.getPersonalizedContent(userId, { contentId });
    
    if (!personalizedData) return defaultContent;

    // Merge personalized data with default content
    return {
      ...defaultContent,
      ...personalizedData,
      personalized: true,
    };
  }

  async renderPersonalizedEmail(userId: string, templateId: string, baseData: any): Promise<any> {
    const profile = await this.personalization.getUserProfile(userId);
    
    if (!profile) return baseData;

    return {
      ...baseData,
      firstName: profile.firstName || 'Valued Customer',
      personalizedSubject: this.generatePersonalizedSubject(profile, baseData.subject),
      recommendations: this.personalization.generateRecommendations(profile, { templateId }),
      offers: this.personalization.generateOffers(profile, { templateId }),
    };
  }

  private generatePersonalizedSubject(profile: UserProfile, baseSubject: string): string {
    if (profile.firstName) {
      return `${profile.firstName}, ${baseSubject.toLowerCase()}`;
    }

    if (profile.segments.includes('vip-customers')) {
      return `VIP Exclusive: ${baseSubject}`;
    }

    return baseSubject;
  }
}

// Global instances
export const personalization = new PersonalizationEngine();
export const dynamicContent = new DynamicContentRenderer(personalization);

// React hook for personalization
export function usePersonalization(userId?: string) {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [personalizedContent, setPersonalizedContent] = React.useState<any>(null);

  React.useEffect(() => {
    if (userId) {
      personalization.getUserProfile(userId).then(setProfile);
    }
  }, [userId]);

  React.useEffect(() => {
    if (userId) {
      personalization.getPersonalizedContent(userId).then(setPersonalizedContent);
    }
  }, [userId, profile]);

  const trackBehavior = React.useCallback((event: string, data: any) => {
    if (userId) {
      personalization.trackBehavior(userId, event, data);
    }
  }, [userId]);

  return {
    profile,
    personalizedContent,
    trackBehavior,
    isPersonalized: !!profile,
  };
}

// React import
import React from 'react';