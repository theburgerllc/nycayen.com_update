"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, RefreshCw, ArrowLeft, Mail, Phone } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const orderId = searchParams.get('order_id');
  const paymentIntentId = searchParams.get('payment_intent');
  
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const errorMessages: { [key: string]: { title: string; description: string; canRetry: boolean } } = {
    'card_declined': {
      title: 'Card Declined',
      description: 'Your card was declined. Please try a different payment method or contact your bank.',
      canRetry: true,
    },
    'insufficient_funds': {
      title: 'Insufficient Funds',
      description: 'Your card has insufficient funds. Please try a different payment method.',
      canRetry: true,
    },
    'expired_card': {
      title: 'Expired Card',
      description: 'Your card has expired. Please use a different payment method.',
      canRetry: true,
    },
    'incorrect_cvc': {
      title: 'Invalid Security Code',
      description: 'The security code on your card is incorrect. Please check and try again.',
      canRetry: true,
    },
    'processing_error': {
      title: 'Processing Error',
      description: 'There was an error processing your payment. Please try again.',
      canRetry: true,
    },
    'authentication_required': {
      title: 'Authentication Required',
      description: 'Your bank requires additional authentication. Please try again and complete the verification.',
      canRetry: true,
    },
    'payment_failed': {
      title: 'Payment Failed',
      description: 'Your payment could not be processed. Please try again or use a different payment method.',
      canRetry: true,
    },
    'network_error': {
      title: 'Network Error',
      description: 'There was a connection issue. Please check your internet connection and try again.',
      canRetry: true,
    },
    'order_creation_failed': {
      title: 'Order Creation Failed',
      description: 'We encountered an issue creating your order. Please contact support for assistance.',
      canRetry: false,
    },
    'inventory_error': {
      title: 'Inventory Issue',
      description: 'Some items in your cart are no longer available. Please review your cart and try again.',
      canRetry: false,
    },
    'default': {
      title: 'Payment Error',
      description: 'An unexpected error occurred during checkout. Please try again or contact support.',
      canRetry: true,
    },
  };

  const currentError = errorMessages[error || 'default'] || errorMessages.default;

  const handleRetry = async () => {
    if (retryAttempts >= 3) {
      return;
    }

    setIsRetrying(true);
    setRetryAttempts(prev => prev + 1);

    // Simulate retry delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (orderId) {
      // Redirect back to checkout with order context
      window.location.href = `/checkout?retry=true&order_id=${orderId}`;
    } else {
      // Redirect to checkout
      window.location.href = '/checkout';
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Payment Error - Order ${orderId || 'Unknown'}`);
    const body = encodeURIComponent(
      `Hi,\n\nI encountered a payment error during checkout:\n\nError: ${error}\nOrder ID: ${orderId || 'N/A'}\nPayment Intent: ${paymentIntentId || 'N/A'}\n\nPlease help me resolve this issue.\n\nThanks!`
    );
    window.location.href = `mailto:support@nycayenmoore.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentError.title}</h1>
            <p className="text-lg text-gray-600">
              {currentError.description}
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">What happened?</h2>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm">
                  <p className="font-medium text-red-800 mb-1">Error Details:</p>
                  <p className="text-red-700">{currentError.description}</p>
                  {error && (
                    <p className="text-red-600 text-xs mt-2">Error Code: {error}</p>
                  )}
                </div>
              </div>

              {orderId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">Order Information:</p>
                    <p className="text-blue-700">Order ID: {orderId}</p>
                    <p className="text-blue-600 text-xs mt-1">
                      Your order was created but payment failed. You can retry payment or contact support.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {currentError.canRetry && retryAttempts < 3 && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full flex items-center justify-center px-6 py-3 bg-[#D4A574] text-white font-medium rounded-md hover:bg-[#B8956A] focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again {retryAttempts > 0 && `(${3 - retryAttempts} attempts left)`}
                  </>
                )}
              </button>
            )}

            {retryAttempts >= 3 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">
                  You've reached the maximum number of retry attempts. Please contact support for assistance.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/checkout"
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Checkout
              </Link>

              <button
                onClick={handleContactSupport}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </button>
            </div>

            <Link
              href="/shop"
              className="block w-full text-center px-6 py-3 text-[#D4A574] font-medium hover:text-[#B8956A] focus:outline-none"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Common Solutions:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Verify your card information is correct</li>
                  <li>Check that your card has sufficient funds</li>
                  <li>Try a different payment method</li>
                  <li>Contact your bank if the card continues to be declined</li>
                  <li>Ensure your billing address matches your card statement</li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Customer Support:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Email: support@nycayenmoore.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>Phone: (555) 123-4567</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Available Monday-Friday, 9AM-6PM EST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutErrorPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A574]"></div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}