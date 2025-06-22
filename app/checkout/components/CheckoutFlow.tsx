"use client";

import { useState, useEffect } from 'react';
import { Cart } from '../../shop/types';
import { OrderSummary } from './OrderSummary';
import { CustomerInformation } from './CustomerInformation';
import { ShippingOptions } from './ShippingOptions';
import { PaymentForm } from './PaymentForm';
import { ProgressIndicator } from './ProgressIndicator';
import { useShop } from '../../shop/context/ShopContext';
import { CheckoutData } from '../../shop/types';

interface CheckoutFlowProps {
  cart: Cart | null;
}

export type CheckoutStep = 'information' | 'shipping' | 'payment';

export interface CheckoutState {
  step: CheckoutStep;
  customerInfo: Partial<CheckoutData>;
  shippingMethod: string | null;
  paymentMethod: string | null;
  clientSecret: string | null;
  isProcessing: boolean;
  errors: { [key: string]: string };
}

export function CheckoutFlow({ cart }: CheckoutFlowProps) {
  const { cartTotal, error: shopError } = useShop();
  
  const [state, setState] = useState<CheckoutState>({
    step: 'information',
    customerInfo: {},
    shippingMethod: null,
    paymentMethod: null,
    clientSecret: null,
    isProcessing: false,
    errors: {},
  });

  const steps = [
    { id: 'information', name: 'Information', completed: false },
    { id: 'shipping', name: 'Shipping', completed: false },
    { id: 'payment', name: 'Payment', completed: false },
  ];

  // Update step completion status
  const updatedSteps = steps.map(step => ({
    ...step,
    completed: 
      (step.id === 'information' && Object.keys(state.customerInfo).length > 0) ||
      (step.id === 'shipping' && state.shippingMethod !== null) ||
      (step.id === 'payment' && state.paymentMethod !== null),
  }));

  const currentStepIndex = steps.findIndex(step => step.id === state.step);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setState(prev => ({
        ...prev,
        step: steps[currentStepIndex + 1].id as CheckoutStep,
        errors: {},
      }));
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setState(prev => ({
        ...prev,
        step: steps[currentStepIndex - 1].id as CheckoutStep,
        errors: {},
      }));
    }
  };

  const updateCustomerInfo = (info: Partial<CheckoutData>) => {
    setState(prev => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, ...info },
    }));
  };

  const updateShippingMethod = (method: string) => {
    setState(prev => ({
      ...prev,
      shippingMethod: method,
    }));
  };

  const updatePaymentMethod = (method: string) => {
    setState(prev => ({
      ...prev,
      paymentMethod: method,
    }));
  };

  const setError = (field: string, message: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: message },
    }));
  };

  const clearError = (field: string) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return { ...prev, errors: newErrors };
    });
  };

  // Create payment intent when reaching payment step
  useEffect(() => {
    if (state.step === 'payment' && !state.clientSecret && cart) {
      createPaymentIntent();
    }
  }, [state.step, cart]);

  const createPaymentIntent = async () => {
    if (!cart) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const response = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cart.total,
          currency: cart.currency.toLowerCase(),
          metadata: {
            cartId: cart.id,
            customerEmail: state.customerInfo.email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      setState(prev => ({ ...prev, clientSecret }));
    } catch (error) {
      setError('payment', 'Failed to initialize payment. Please try again.');
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  if (!cart) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-600 mt-2">Add items to your cart to continue</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Checkout Flow */}
      <div className="lg:col-span-7">
        <ProgressIndicator 
          steps={updatedSteps} 
          currentStep={state.step} 
        />

        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          {state.step === 'information' && (
            <CustomerInformation
              data={state.customerInfo}
              onUpdate={updateCustomerInfo}
              onNext={nextStep}
              errors={state.errors}
              onError={setError}
              onClearError={clearError}
            />
          )}

          {state.step === 'shipping' && (
            <ShippingOptions
              selectedMethod={state.shippingMethod}
              onMethodSelect={updateShippingMethod}
              onNext={nextStep}
              onPrev={prevStep}
              cartTotal={cartTotal}
              shippingAddress={state.customerInfo.shippingAddress}
              errors={state.errors}
              onError={setError}
            />
          )}

          {state.step === 'payment' && (
            <PaymentForm
              clientSecret={state.clientSecret}
              customerInfo={state.customerInfo}
              shippingMethod={state.shippingMethod}
              cart={cart}
              onPrev={prevStep}
              isProcessing={state.isProcessing}
              errors={state.errors}
              onError={setError}
            />
          )}
        </div>

        {/* Error Display */}
        {(shopError || Object.keys(state.errors).length > 0) && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800">
              {shopError && <p>{shopError}</p>}
              {Object.values(state.errors).map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-5">
        <div className="sticky top-8">
          <OrderSummary 
            cart={cart} 
            shippingMethod={state.shippingMethod}
          />
        </div>
      </div>
    </div>
  );
}