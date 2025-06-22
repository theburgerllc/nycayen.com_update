"use client";

import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { Cart } from '../../shop/types';
import { CheckoutData } from '../../shop/types';
import { useShop } from '../../shop/context/ShopContext';
import { ChevronLeft, CreditCard, Shield, Lock, Truck } from 'lucide-react';

interface PaymentFormProps {
  clientSecret: string | null;
  customerInfo: Partial<CheckoutData>;
  shippingMethod: string | null;
  cart: Cart;
  onPrev: () => void;
  isProcessing: boolean;
  errors: { [key: string]: string };
  onError: (field: string, message: string) => void;
}

export function PaymentForm({
  clientSecret,
  customerInfo,
  shippingMethod,
  cart,
  onPrev,
  isProcessing,
  errors,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useShop();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  // Clear payment errors when component mounts
  useEffect(() => {
    setPaymentError(null);
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setPaymentError('Payment system not initialized. Please refresh and try again.');
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setPaymentError(submitError.message || 'Please check your payment information');
        setIsLoading(false);
        return;
      }

      // Create order record before payment
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          customerInfo,
          shippingMethod,
          paymentIntentId: clientSecret.split('_secret_')[0],
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const { order } = await orderResponse.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/processing?order_id=${order.id}`,
          receipt_email: customerInfo.email,
          shipping: customerInfo.shippingAddress ? {
            name: `${customerInfo.shippingAddress.firstName} ${customerInfo.shippingAddress.lastName}`,
            address: {
              line1: customerInfo.shippingAddress.address1,
              line2: customerInfo.shippingAddress.address2 || '',
              city: customerInfo.shippingAddress.city,
              state: customerInfo.shippingAddress.state,
              postal_code: customerInfo.shippingAddress.zipCode,
              country: customerInfo.shippingAddress.country,
            },
          } : undefined,
        },
        redirect: 'if_required',
      });

      if (error) {
        // Payment failed
        setPaymentError(error.message || 'Payment failed. Please try again.');
        
        // Update order status
        await fetch(`/api/orders/${order.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'failed',
            paymentError: error.message,
          }),
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        await clearCart();
        
        // Update order status
        await fetch(`/api/orders/${order.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'paid',
            paymentIntentId: paymentIntent.id,
          }),
        });

        // Track conversion
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'purchase', {
            transaction_id: order.orderNumber,
            value: cart.total,
            currency: cart.currency,
            items: cart.items.map(item => ({
              item_id: item.productId,
              item_name: `Product ${item.productId}`,
              quantity: item.quantity,
              price: item.price,
            })),
          });
        }

        // Redirect to success page
        router.push(`/checkout/success?order_id=${order.id}`);
      } else {
        // Payment requires additional action (3D Secure, etc.)
        router.push(`/checkout/processing?order_id=${order.id}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Payment</h3>
          <button
            onClick={onPrev}
            className="flex items-center text-[#D4A574] hover:text-[#B8956A] text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Shipping
          </button>
        </div>

        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A574]"></div>
          <span className="ml-3 text-gray-600">Initializing secure payment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Payment</h3>
        <button
          onClick={onPrev}
          className="flex items-center text-[#D4A574] hover:text-[#B8956A] text-sm font-medium"
          disabled={isLoading}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Shipping
        </button>
      </div>

      {/* Security badges */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2 text-green-600" />
            SSL Encrypted
          </div>
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-2 text-green-600" />
            PCI Compliant
          </div>
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2 text-green-600" />
            Secure Payments
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Element */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Method
          </h4>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <PaymentElement
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
              }}
            />
          </div>
        </div>

        {/* Save payment method */}
        {customerInfo.createAccount && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="savePayment"
              checked={savePaymentMethod}
              onChange={(e) => setSavePaymentMethod(e.target.checked)}
              className="h-4 w-4 text-[#D4A574] focus:ring-[#D4A574] border-gray-300 rounded"
            />
            <label htmlFor="savePayment" className="ml-2 text-sm text-gray-700">
              Save payment method for future purchases
            </label>
          </div>
        )}

        {/* Billing Address */}
        {customerInfo.sameAsShipping === false && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900">Billing Address</h4>
            <div className="border border-gray-200 rounded-lg p-4">
              <AddressElement 
                options={{
                  mode: 'billing',
                  allowedCountries: ['US', 'CA'],
                }}
              />
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">
                {cart.shipping === 0 ? 'Free' : `$${cart.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${cart.tax.toFixed(2)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${cart.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Terms and conditions */}
        <div className="text-sm text-gray-600">
          <p>
            By clicking "Complete Order", you agree to our{' '}
            <a href="/terms" className="text-[#D4A574] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#D4A574] hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Error Display */}
        {(paymentError || errors.payment) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              {paymentError || errors.payment}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onPrev}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          <button
            type="submit"
            disabled={!stripe || isLoading || isProcessing}
            className="px-8 py-3 bg-[#D4A574] text-white font-medium rounded-md hover:bg-[#B8956A] focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Complete Order - ${cart.total.toFixed(2)}
              </>
            )}
          </button>
        </div>

        {/* Payment powered by Stripe */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Payments secured by{' '}
            <a 
              href="https://stripe.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#635BFF] hover:underline font-medium"
            >
              Stripe
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}