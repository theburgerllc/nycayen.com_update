export interface BusinessConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[]; // 0-6, where 0 is Sunday
  depositPercentage: number;
  cancellationHours: number;
}

export interface BookingConfig {
  maxAdvanceDays: number;
  minAdvanceHours: number;
  timeSlotInterval: number; // in minutes
  bufferBetweenBookings: number; // in minutes
  enableSmsNotifications: boolean;
  enableCalendarSync: boolean;
  enablePaymentSplit: boolean;
  enableBookingReminders: boolean;
}

export interface FeatureFlags {
  enableMultipleStaff: boolean;
  enableServicePackages: boolean;
  enableAddOns: boolean;
  enableWaitlist: boolean;
  enableRescheduling: boolean;
  enableOnlinePayment: boolean;
  enableDepositOnly: boolean;
}

// Default business configuration
export const businessConfig: BusinessConfig = {
  name: 'Nycayen Moore Hair Artistry',
  address: 'Manhattan, New York, NY',
  phone: process.env.BUSINESS_PHONE || '+1 (555) 123-4567',
  email: process.env.EMAIL_FROM_ADDRESS || 'bookings@nycayenmoore.com',
  timezone: process.env.BUSINESS_TIMEZONE || 'America/New_York',
  workingHours: {
    start: '09:00',
    end: '19:00',
  },
  workingDays: [2, 3, 4, 5, 6], // Tuesday to Saturday
  depositPercentage: parseInt(process.env.BOOKING_DEPOSIT_PERCENTAGE || '30'),
  cancellationHours: parseInt(process.env.CANCELLATION_HOURS || '24'),
};

// Default booking configuration
export const bookingConfig: BookingConfig = {
  maxAdvanceDays: 90,
  minAdvanceHours: 2,
  timeSlotInterval: 30,
  bufferBetweenBookings: 15,
  enableSmsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
  enableCalendarSync: process.env.ENABLE_CALENDAR_SYNC === 'true',
  enablePaymentSplit: process.env.ENABLE_PAYMENT_SPLIT === 'true',
  enableBookingReminders: process.env.ENABLE_BOOKING_REMINDERS === 'true',
};

// Feature flags
export const featureFlags: FeatureFlags = {
  enableMultipleStaff: false, // Set to true when multiple staff members are available
  enableServicePackages: true,
  enableAddOns: true,
  enableWaitlist: false,
  enableRescheduling: true,
  enableOnlinePayment: true,
  enableDepositOnly: true,
};

// Stripe configuration
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  currency: 'usd',
  country: 'US',
};

// Analytics configuration
export const analyticsConfig = {
  gtag: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  facebookPixel: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '',
};

// Email templates configuration
export const emailConfig = {
  confirmationTemplate: 'booking-confirmation',
  reminderTemplate: 'booking-reminder',
  cancellationTemplate: 'booking-cancellation',
  reschedulingTemplate: 'booking-rescheduling',
};

// SMS templates configuration
export const smsConfig = {
  confirmationMessage: 'Your appointment with Nycayen Moore is confirmed for {date} at {time}. Confirmation #: {confirmation}',
  reminderMessage: 'Reminder: You have an appointment tomorrow at {time} with Nycayen Moore. Location: {address}',
  cancellationMessage: 'Your appointment with Nycayen Moore on {date} has been cancelled. Booking #: {confirmation}',
};

// Accessibility configuration
export const a11yConfig = {
  announceStepChanges: true,
  announceFormErrors: true,
  announceSelections: true,
  announceLoadingStates: true,
  enableKeyboardNavigation: true,
  enableFocusTrapping: true,
  enableScreenReaderSupport: true,
};

// API endpoints configuration
export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  endpoints: {
    availability: '/api/booking/availability',
    create: '/api/booking/create',
    confirm: '/api/booking/confirm',
    cancel: '/api/booking/cancel',
    reschedule: '/api/booking/reschedule',
    payment: '/api/booking/payment',
  },
};