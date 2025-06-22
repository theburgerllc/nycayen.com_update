import { loadStripe, Stripe } from '@stripe/stripe-js';

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Server-side Stripe instance (for API routes)
import StripeSDK from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new StripeSDK(stripeSecretKey, {
  apiVersion: '2025-05-28.basil',
});

// Stripe webhook secret
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper function to format currency
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100); // Stripe amounts are in cents
};

// Helper function to convert dollars to cents
export const toCents = (amount: number): number => {
  return Math.round(amount * 100);
};

// Helper function to convert cents to dollars
export const toDollars = (amount: number): number => {
  return amount / 100;
};