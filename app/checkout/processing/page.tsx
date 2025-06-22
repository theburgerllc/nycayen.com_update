"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStripe } from '@stripe/react-stripe-js';
import { Loader2, Clock, CreditCard, Shield } from 'lucide-react';

function ProcessingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stripe = useStripe();
  
  const orderId = searchParams.get('order_id');
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const redirectStatus = searchParams.get('redirect_status');
  
  const [status, setStatus] = useState<'processing' | 'requires_action' | 'succeeded' | 'failed'>('processing');
  const [message, setMessage] = useState('Processing your payment...');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Update timer every second
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stripe && paymentIntentClientSecret) {
      handlePaymentResult();
    } else if (orderId) {
      // Check order status periodically
      checkOrderStatus();
    }
  }, [stripe, paymentIntentClientSecret, orderId]);

  const handlePaymentResult = async () => {
    if (!stripe || !paymentIntentClientSecret) return;

    try {
      const { error, paymentIntent } = await stripe.retrievePaymentIntent(paymentIntentClientSecret);

      if (error) {
        setStatus('failed');
        setMessage('Payment failed. Please try again.');
        setTimeout(() => {
          router.push(`/checkout/error?error=${error.code}&order_id=${orderId}`);
        }, 2000);
        return;
      }

      if (paymentIntent) {
        switch (paymentIntent.status) {
          case 'succeeded':
            setStatus('succeeded');
            setMessage('Payment successful! Redirecting to confirmation...');
            
            // Update order status
            if (orderId) {
              await updateOrderStatus(orderId, 'paid', paymentIntent.id);
            }
            
            setTimeout(() => {
              router.push(`/checkout/success?order_id=${orderId}`);
            }, 2000);
            break;

          case 'processing':
            setStatus('processing');
            setMessage('Your payment is being processed. Please wait...');
            // Continue polling
            setTimeout(() => handlePaymentResult(), 3000);
            break;

          case 'requires_payment_method':
          case 'requires_confirmation':
            setStatus('failed');
            setMessage('Payment requires additional steps. Redirecting...');
            setTimeout(() => {
              router.push(`/checkout?order_id=${orderId}`);
            }, 2000);
            break;

          case 'canceled':
            setStatus('failed');
            setMessage('Payment was canceled. Redirecting...');
            setTimeout(() => {
              router.push(`/checkout/error?error=payment_canceled&order_id=${orderId}`);
            }, 2000);
            break;

          default:
            setStatus('requires_action');
            setMessage('Additional authentication may be required...');
            setTimeout(() => handlePaymentResult(), 2000);
            break;
        }
      }
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      setStatus('failed');
      setMessage('An error occurred while processing your payment.');
      setTimeout(() => {
        router.push(`/checkout/error?error=processing_error&order_id=${orderId}`);
      }, 2000);
    }
  };

  const checkOrderStatus = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/status`);
      if (!response.ok) {
        throw new Error('Failed to check order status');
      }

      const { order } = await response.json();
      
      switch (order.paymentStatus) {
        case 'paid':
          setStatus('succeeded');
          setMessage('Payment confirmed! Redirecting...');
          setTimeout(() => {
            router.push(`/checkout/success?order_id=${orderId}`);
          }, 2000);
          break;

        case 'failed':
          setStatus('failed');
          setMessage('Payment failed. Redirecting...');
          setTimeout(() => {
            router.push(`/checkout/error?error=payment_failed&order_id=${orderId}`);
          }, 2000);
          break;

        case 'pending':
        default:
          // Continue checking
          setTimeout(() => checkOrderStatus(), 3000);
          break;
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      // Continue checking after a delay
      setTimeout(() => checkOrderStatus(), 5000);
    }
  };

  const updateOrderStatus = async (orderIdToUpdate: string, paymentStatus: string, paymentIntentId?: string) => {
    try {
      await fetch(`/api/orders/${orderIdToUpdate}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentStatus,
          paymentIntentId,
        }),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'succeeded':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'requires_action':
        return 'text-yellow-600';
      default:
        return 'text-[#D4A574]';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-8 h-8 animate-spin" />;
      case 'requires_action':
        return <Shield className="w-8 h-8" />;
      case 'succeeded':
        return <CreditCard className="w-8 h-8" />;
      case 'failed':
        return <CreditCard className="w-8 h-8" />;
      default:
        return <Clock className="w-8 h-8" />;
    }
  };

  // Timeout after 5 minutes
  useEffect(() => {
    if (timeElapsed >= 300) { // 5 minutes
      setStatus('failed');
      setMessage('Payment processing timed out. Please try again.');
      setTimeout(() => {
        router.push(`/checkout/error?error=timeout&order_id=${orderId}`);
      }, 2000);
    }
  }, [timeElapsed, orderId, router]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center space-y-6">
          {/* Status Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
            status === 'succeeded' ? 'bg-green-100' :
            status === 'failed' ? 'bg-red-100' :
            status === 'requires_action' ? 'bg-yellow-100' :
            'bg-blue-100'
          }`}>
            <div className={getStatusColor()}>
              {getStatusIcon()}
            </div>
          </div>

          {/* Status Message */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === 'processing' && 'Processing Payment'}
              {status === 'requires_action' && 'Authentication Required'}
              {status === 'succeeded' && 'Payment Successful'}
              {status === 'failed' && 'Payment Failed'}
            </h1>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Progress Indicator */}
          {status === 'processing' && (
            <div className="space-y-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#D4A574] h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((timeElapsed / 30) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                Processing time: {formatTime(timeElapsed)}
              </p>
            </div>
          )}

          {/* Order Information */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Order ID</p>
                <p className="text-gray-600 font-mono">{orderId}</p>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900 mb-1">Secure Processing</p>
                <p className="text-xs text-blue-700">
                  Your payment is being processed securely. Please do not close this window or navigate away.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Instructions */}
          {status === 'requires_action' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-900 mb-1">Action Required</p>
                <p className="text-xs text-yellow-700">
                  Your bank may require additional verification. Please check for any pop-ups or notifications from your banking app.
                </p>
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          {timeElapsed > 60 && status === 'processing' && (
            <div className="text-left bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Taking longer than expected?</p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Check for browser pop-up blockers</li>
                <li>Ensure your internet connection is stable</li>
                <li>Your bank may require additional verification</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CheckoutProcessingPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A574]"></div>
        </div>
      }
    >
      <ProcessingContent />
    </Suspense>
  );
}