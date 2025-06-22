import { z } from 'zod';

// Service types
export interface Service {
  id: string;
  title: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
  category: 'cut' | 'color' | 'wig' | 'bridal';
  image?: string;
}

export interface ServicePackage {
  id: string;
  title: string;
  services: string[];
  originalPrice: number;
  discountedPrice: number;
  savings: number;
  description: string;
}

export interface AddOn {
  id: string;
  title: string;
  price: number;
  description: string;
  duration: number;
  category: 'care' | 'styling' | 'treatment';
}

// Booking flow types
export type BookingStep = 'services' | 'datetime' | 'customer' | 'addons' | 'payment';

export interface TimeSlot {
  time: string;
  available: boolean;
  staffMember?: string;
}

// Form validation schemas
export const customerInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  specialRequests: z.string().optional(),
  preferredCommunication: z.enum(['email', 'phone', 'sms']),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  marketingConsent: z.boolean().optional(),
});

export const paymentSchema = z.object({
  paymentMethod: z.enum(['card', 'deposit']),
  depositAmount: z.number().optional(),
  savePaymentMethod: z.boolean().optional(),
});

export type CustomerInfo = z.infer<typeof customerInfoSchema>;
export type PaymentInfo = z.infer<typeof paymentSchema>;

// Booking state interface
export interface BookingState {
  currentStep: BookingStep;
  selectedServices: string[];
  selectedPackage?: string;
  selectedDate?: Date;
  selectedTime?: string;
  selectedStaff?: string;
  customerInfo?: CustomerInfo;
  selectedAddOns: string[];
  paymentInfo?: PaymentInfo;
  totalPrice: number;
  estimatedDuration: number;
  bookingId?: string;
}

// API response types
export interface BookingConfirmation {
  bookingId: string;
  confirmationNumber: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  emailSent: boolean;
  smsSent: boolean;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
  staffMembers: {
    id: string;
    name: string;
    specialties: string[];
  }[];
}