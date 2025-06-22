// Email Automation System
'use client';

import { z } from 'zod';

// Types and Interfaces
export interface EmailAutomation {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  status: 'active' | 'paused' | 'draft';
  emails: AutomationEmail[];
  analytics: AutomationAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationTrigger {
  type: 'signup' | 'abandoned_cart' | 'booking_reminder' | 'post_service' | 'birthday' | 'anniversary' | 'inactive_user';
  conditions?: TriggerCondition[];
  delay?: number; // minutes
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in_last_days';
  value: any;
}

export interface AutomationEmail {
  id: string;
  order: number;
  delay: number; // minutes after trigger or previous email
  subject: string;
  templateId: string;
  personalizedContent: Record<string, any>;
  conditions?: EmailCondition[];
  analytics: EmailAnalytics;
}

export interface EmailCondition {
  field: string;
  operator: string;
  value: any;
}

export interface EmailAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  conversions: number;
  revenue?: number;
}

export interface AutomationAnalytics {
  totalSubscribers: number;
  activeSubscribers: number;
  completedJourney: number;
  dropoffPoints: Record<string, number>;
  averageEngagement: number;
  totalRevenue: number;
  roi: number;
}

// Email Template System
export interface EmailTemplate {
  id: string;
  name: string;
  type: 'welcome' | 'promotional' | 'transactional' | 'newsletter' | 'reminder';
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  thumbnailUrl?: string;
}

// Automation Management Class
export class EmailAutomationService {
  private automations: Map<string, EmailAutomation> = new Map();

  constructor() {
    this.initializeDefaultAutomations();
  }

  // Initialize default automation sequences
  private initializeDefaultAutomations() {
    this.automations.set('welcome-series', this.createWelcomeSeries());
    this.automations.set('abandoned-cart', this.createAbandonedCartSequence());
    this.automations.set('booking-reminder', this.createBookingReminderSequence());
    this.automations.set('post-service', this.createPostServiceSequence());
    this.automations.set('birthday-campaign', this.createBirthdayCampaign());
    this.automations.set('win-back', this.createWinBackCampaign());
  }

  // Welcome Series Automation
  private createWelcomeSeries(): EmailAutomation {
    return {
      id: 'welcome-series',
      name: 'Welcome Series',
      trigger: {
        type: 'signup',
        delay: 0,
      },
      status: 'active',
      emails: [
        {
          id: 'welcome-1',
          order: 1,
          delay: 0, // Immediate
          subject: 'Welcome to Nycayen Hair Artistry! 🎉',
          templateId: 'welcome-template',
          personalizedContent: {
            welcomeOffer: '15% off first service',
            contentType: 'welcome',
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'welcome-2',
          order: 2,
          delay: 1440, // 24 hours
          subject: 'Your Hair Journey Starts Here ✨',
          templateId: 'hair-guide-template',
          personalizedContent: {
            guideUrl: '/guides/hair-care-basics',
            contentType: 'educational',
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'welcome-3',
          order: 3,
          delay: 4320, // 3 days
          subject: 'Meet Your Hair Stylist 💫',
          templateId: 'stylist-intro-template',
          personalizedContent: {
            stylistBio: true,
            portfolioLink: '/portfolio',
            contentType: 'introduction',
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'welcome-4',
          order: 4,
          delay: 10080, // 7 days
          subject: 'Ready for Your First Appointment? 📅',
          templateId: 'booking-cta-template',
          personalizedContent: {
            bookingUrl: '/booking',
            specialOffer: 'Free consultation',
            contentType: 'conversion',
          },
          conditions: [
            {
              field: 'hasBooked',
              operator: 'equals',
              value: false,
            },
          ],
          analytics: this.createEmptyAnalytics(),
        },
      ],
      analytics: this.createEmptyAutomationAnalytics(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Abandoned Cart Sequence
  private createAbandonedCartSequence(): EmailAutomation {
    return {
      id: 'abandoned-cart',
      name: 'Abandoned Cart Recovery',
      trigger: {
        type: 'abandoned_cart',
        delay: 60, // 1 hour after abandonment
        conditions: [
          {
            field: 'cartValue',
            operator: 'greater_than',
            value: 0,
          },
        ],
      },
      status: 'active',
      emails: [
        {
          id: 'cart-reminder-1',
          order: 1,
          delay: 60, // 1 hour
          subject: 'You left something beautiful behind... 💄',
          templateId: 'cart-reminder-template',
          personalizedContent: {
            cartItems: true,
            discountCode: 'COMEBACK10',
            urgency: 'low',
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'cart-reminder-2',
          order: 2,
          delay: 1440, // 24 hours
          subject: 'Still thinking? Here\'s 15% off! 🎁',
          templateId: 'cart-discount-template',
          personalizedContent: {
            cartItems: true,
            discountCode: 'COMEBACK15',
            urgency: 'medium',
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'cart-reminder-3',
          order: 3,
          delay: 4320, // 3 days
          subject: 'Last chance for your beauty items! ⏰',
          templateId: 'cart-final-template',
          personalizedContent: {
            cartItems: true,
            discountCode: 'LASTCHANCE20',
            urgency: 'high',
          },
          analytics: this.createEmptyAnalytics(),
        },
      ],
      analytics: this.createEmptyAutomationAnalytics(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Booking Reminder Sequence
  private createBookingReminderSequence(): EmailAutomation {
    return {
      id: 'booking-reminder',
      name: 'Booking Reminders',
      trigger: {
        type: 'booking_reminder',
        delay: 0,
      },
      status: 'active',
      emails: [
        {
          id: 'booking-confirmation',
          order: 1,
          delay: 0, // Immediate
          subject: 'Booking Confirmed! We can\'t wait to see you ✨',
          templateId: 'booking-confirmation-template',
          personalizedContent: {
            appointmentDetails: true,
            preparationTips: true,
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'pre-appointment-1',
          order: 2,
          delay: 10080, // 7 days before
          subject: 'Your appointment is coming up! 📅',
          templateId: 'pre-appointment-template',
          personalizedContent: {
            appointmentDetails: true,
            locationInfo: true,
            preparationGuide: true,
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'pre-appointment-2',
          order: 3,
          delay: 1440, // 24 hours before
          subject: 'See you tomorrow! Final reminders 💫',
          templateId: 'final-reminder-template',
          personalizedContent: {
            appointmentDetails: true,
            contactInfo: true,
            lastMinuteTips: true,
          },
          analytics: this.createEmptyAnalytics(),
        },
      ],
      analytics: this.createEmptyAutomationAnalytics(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Post-Service Follow-up
  private createPostServiceSequence(): EmailAutomation {
    return {
      id: 'post-service',
      name: 'Post-Service Follow-up',
      trigger: {
        type: 'post_service',
        delay: 1440, // 24 hours after service
      },
      status: 'active',
      emails: [
        {
          id: 'service-followup-1',
          order: 1,
          delay: 1440, // 24 hours
          subject: 'How does your new look feel? 💖',
          templateId: 'post-service-template',
          personalizedContent: {
            serviceDetails: true,
            careInstructions: true,
            reviewRequest: true,
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'service-followup-2',
          order: 2,
          delay: 10080, // 7 days
          subject: 'Loving your hair? Share the love! ⭐',
          templateId: 'review-request-template',
          personalizedContent: {
            reviewLinks: true,
            socialMedia: true,
            referralOffer: true,
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'service-followup-3',
          order: 3,
          delay: 43200, // 30 days
          subject: 'Time for a touch-up? 💅',
          templateId: 'rebooking-template',
          personalizedContent: {
            serviceHistory: true,
            recommendedServices: true,
            bookingLink: true,
          },
          analytics: this.createEmptyAnalytics(),
        },
      ],
      analytics: this.createEmptyAutomationAnalytics(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Birthday Campaign
  private createBirthdayCampaign(): EmailAutomation {
    return {
      id: 'birthday-campaign',
      name: 'Birthday Special',
      trigger: {
        type: 'birthday',
        delay: 0,
        conditions: [
          {
            field: 'hasBirthdate',
            operator: 'equals',
            value: true,
          },
        ],
      },
      status: 'active',
      emails: [
        {
          id: 'birthday-email',
          order: 1,
          delay: 0, // On birthday
          subject: 'Happy Birthday! Your special gift awaits 🎂',
          templateId: 'birthday-template',
          personalizedContent: {
            birthdayOffer: '25% off any service',
            validUntil: '30 days',
            personalMessage: true,
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'birthday-reminder',
          order: 2,
          delay: 20160, // 14 days later
          subject: 'Don\'t miss your birthday treat! 🎁',
          templateId: 'birthday-reminder-template',
          personalizedContent: {
            remainingDays: true,
            bookingUrgency: true,
          },
          conditions: [
            {
              field: 'hasUsedBirthdayOffer',
              operator: 'equals',
              value: false,
            },
          ],
          analytics: this.createEmptyAnalytics(),
        },
      ],
      analytics: this.createEmptyAutomationAnalytics(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Win-back Campaign
  private createWinBackCampaign(): EmailAutomation {
    return {
      id: 'win-back',
      name: 'Win Back Inactive Users',
      trigger: {
        type: 'inactive_user',
        delay: 0,
        conditions: [
          {
            field: 'lastActivity',
            operator: 'in_last_days',
            value: 90,
          },
          {
            field: 'totalBookings',
            operator: 'greater_than',
            value: 0,
          },
        ],
      },
      status: 'active',
      emails: [
        {
          id: 'winback-1',
          order: 1,
          delay: 0,
          subject: 'We miss you! Come back for 20% off 💔',
          templateId: 'winback-template',
          personalizedContent: {
            lastVisit: true,
            specialOffer: '20% off next service',
            newServices: true,
          },
          analytics: this.createEmptyAnalytics(),
        },
        {
          id: 'winback-2',
          order: 2,
          delay: 10080, // 7 days
          subject: 'Your hair misses us too... 30% off inside! 💸',
          templateId: 'winback-final-template',
          personalizedContent: {
            finalOffer: '30% off any service',
            testimonials: true,
            newWork: true,
          },
          conditions: [
            {
              field: 'hasBooked',
              operator: 'equals',
              value: false,
            },
          ],
          analytics: this.createEmptyAnalytics(),
        },
      ],
      analytics: this.createEmptyAutomationAnalytics(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Automation Management Methods
  async triggerAutomation(automationId: string, subscriberId: string, triggerData?: any): Promise<boolean> {
    const automation = this.automations.get(automationId);
    if (!automation || automation.status !== 'active') {
      return false;
    }

    try {
      // Create automation instance for subscriber
      const automationInstance = {
        automationId,
        subscriberId,
        status: 'active',
        currentStep: 0,
        triggerData,
        startedAt: new Date(),
        emails: automation.emails.map(email => ({
          ...email,
          scheduledAt: new Date(Date.now() + email.delay * 60 * 1000),
          status: 'scheduled',
        })),
      };

      // Store automation instance (replace with database)
      await this.storeAutomationInstance(automationInstance);

      // Schedule first email
      await this.scheduleNextEmail(automationInstance);

      return true;
    } catch (error) {
      console.error('Failed to trigger automation:', error);
      return false;
    }
  }

  async processScheduledEmails(): Promise<void> {
    try {
      // Get all scheduled emails that are ready to send
      const readyEmails = await this.getReadyEmails();

      for (const emailInstance of readyEmails) {
        await this.sendAutomationEmail(emailInstance);
      }
    } catch (error) {
      console.error('Failed to process scheduled emails:', error);
    }
  }

  private async storeAutomationInstance(instance: any): Promise<void> {
    // Replace with actual database storage
    console.log('Storing automation instance:', instance);
  }

  private async scheduleNextEmail(instance: any): Promise<void> {
    // Replace with actual email scheduling
    console.log('Scheduling next email:', instance);
  }

  private async getReadyEmails(): Promise<any[]> {
    // Replace with actual database query
    return [];
  }

  private async sendAutomationEmail(emailInstance: any): Promise<void> {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailInstance.subscriberEmail,
          subject: emailInstance.subject,
          template: emailInstance.templateId,
          data: emailInstance.personalizedContent,
          automationId: emailInstance.automationId,
          emailId: emailInstance.id,
        }),
      });

      if (response.ok) {
        await this.updateEmailStatus(emailInstance.id, 'sent');
      } else {
        await this.updateEmailStatus(emailInstance.id, 'failed');
      }
    } catch (error) {
      console.error('Failed to send automation email:', error);
      await this.updateEmailStatus(emailInstance.id, 'failed');
    }
  }

  private async updateEmailStatus(emailId: string, status: string): Promise<void> {
    // Replace with actual database update
    console.log('Updating email status:', emailId, status);
  }

  private createEmptyAnalytics(): EmailAnalytics {
    return {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      unsubscribed: 0,
      bounced: 0,
      conversions: 0,
      revenue: 0,
    };
  }

  private createEmptyAutomationAnalytics(): AutomationAnalytics {
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      completedJourney: 0,
      dropoffPoints: {},
      averageEngagement: 0,
      totalRevenue: 0,
      roi: 0,
    };
  }

  // Public API methods
  getAutomation(id: string): EmailAutomation | undefined {
    return this.automations.get(id);
  }

  getAllAutomations(): EmailAutomation[] {
    return Array.from(this.automations.values());
  }

  async pauseAutomation(id: string): Promise<boolean> {
    const automation = this.automations.get(id);
    if (automation) {
      automation.status = 'paused';
      return true;
    }
    return false;
  }

  async resumeAutomation(id: string): Promise<boolean> {
    const automation = this.automations.get(id);
    if (automation) {
      automation.status = 'active';
      return true;
    }
    return false;
  }
}

// Behavioral Trigger Service
export class BehavioralTriggerService {
  async trackUserBehavior(userId: string, event: string, properties: any): Promise<void> {
    // Track user behavior for triggering automations
    const behaviorData = {
      userId,
      event,
      properties,
      timestamp: new Date(),
    };

    // Store behavior (replace with database)
    console.log('Tracking behavior:', behaviorData);

    // Check for automation triggers
    await this.checkTriggers(userId, event, properties);
  }

  private async checkTriggers(userId: string, event: string, properties: any): Promise<void> {
    const automationService = new EmailAutomationService();

    switch (event) {
      case 'cart_abandoned':
        await automationService.triggerAutomation('abandoned-cart', userId, properties);
        break;
      case 'booking_created':
        await automationService.triggerAutomation('booking-reminder', userId, properties);
        break;
      case 'service_completed':
        await automationService.triggerAutomation('post-service', userId, properties);
        break;
      case 'user_inactive':
        await automationService.triggerAutomation('win-back', userId, properties);
        break;
    }
  }
}

// Global instances
export const emailAutomation = new EmailAutomationService();
export const behavioralTriggers = new BehavioralTriggerService();