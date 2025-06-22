"use client";

import { Suspense } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe';
import { useShop } from '../shop/context/ShopContext';
import { CheckoutFlow } from './components/CheckoutFlow';
import { redirect } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, cartCount } = useShop();

  // Redirect if no items in cart
  if (cartCount === 0) {
    redirect('/shop');
  }

  const stripePromise = getStripe();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-gray-600 mt-2">Complete your purchase securely</p>
          </header>

          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A574]"></div>
              </div>
            }
          >
            <Elements 
              stripe={stripePromise}
              options={{
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#D4A574',
                    colorBackground: '#ffffff',
                    colorText: '#1f2937',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  },
                },
                clientSecret: undefined, // Will be set when payment intent is created
              }}
            >
              <CheckoutFlow cart={cart} />
            </Elements>
          </Suspense>
        </div>
      </div>
    </main>
  );
}