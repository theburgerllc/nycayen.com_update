"use client";

import { useState, useEffect } from 'react';
import { ShippingAddress } from '../../shop/types';
import { ChevronLeft, Truck, Clock, MapPin, Shield } from 'lucide-react';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ReactNode;
  popular?: boolean;
}

interface ShippingOptionsProps {
  selectedMethod: string | null;
  onMethodSelect: (method: string) => void;
  onNext: () => void;
  onPrev: () => void;
  cartTotal: number;
  shippingAddress?: ShippingAddress;
  errors: { [key: string]: string };
  onError: (field: string, message: string) => void;
}

export function ShippingOptions({
  selectedMethod,
  onMethodSelect,
  onNext,
  onPrev,
  cartTotal,
  shippingAddress,
  errors,
  onError,
}: ShippingOptionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shippingRates, setShippingRates] = useState<ShippingOption[]>([]);

  const freeShippingThreshold = 100;
  const qualifiesForFreeShipping = cartTotal >= freeShippingThreshold;

  // Default shipping options
  const defaultShippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Delivered in 5-7 business days',
      price: qualifiesForFreeShipping ? 0 : 10,
      estimatedDays: '5-7 business days',
      icon: <Truck className="w-5 h-5" />,
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: 'Delivered in 2-3 business days',
      price: 25,
      estimatedDays: '2-3 business days',
      icon: <Clock className="w-5 h-5" />,
      popular: true,
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Delivered next business day by 3 PM',
      price: 45,
      estimatedDays: '1 business day',
      icon: <Shield className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    fetchShippingRates();
  }, [shippingAddress, cartTotal]);

  const fetchShippingRates = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call to get shipping rates
      // In a real app, you'd call your shipping provider's API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, use default options with dynamic free shipping
      const rates = defaultShippingOptions.map(option => ({
        ...option,
        price: option.id === 'standard' && qualifiesForFreeShipping ? 0 : option.price,
      }));
      
      setShippingRates(rates);
      
      // Auto-select standard shipping if it's free
      if (qualifiesForFreeShipping && !selectedMethod) {
        onMethodSelect('standard');
      }
    } catch (error) {
      onError('shipping', 'Failed to load shipping options. Please try again.');
      setShippingRates(defaultShippingOptions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedMethod) {
      onError('shipping', 'Please select a shipping method');
      return;
    }
    onNext();
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'FREE' : `$${price.toFixed(2)}`;
  };

  const getEstimatedDeliveryDate = (days: string) => {
    const today = new Date();
    const [min, max] = days.split('-').map(d => parseInt(d.replace(/\D/g, '')));
    const minDate = new Date(today);
    const maxDate = new Date(today);
    
    minDate.setDate(today.getDate() + min);
    maxDate.setDate(today.getDate() + (max || min));
    
    const formatDate = (date: Date) => 
      date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    
    if (min === max || !max) {
      return formatDate(minDate);
    }
    
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Shipping Method</h3>
        <button
          onClick={onPrev}
          className="flex items-center text-[#D4A574] hover:text-[#B8956A] text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Information
        </button>
      </div>

      {/* Shipping Address Summary */}
      {shippingAddress && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Shipping to:
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {shippingAddress.firstName} {shippingAddress.lastName}
                <br />
                {shippingAddress.address1}
                {shippingAddress.address2 && <>, {shippingAddress.address2}</>}
                <br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                <br />
                {shippingAddress.country}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Free Shipping Banner */}
      {qualifiesForFreeShipping && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">
                🎉 You qualify for free standard shipping!
              </p>
              <p className="text-sm text-green-600">
                Your order total of ${cartTotal.toFixed(2)} is over our ${freeShippingThreshold} free shipping threshold.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Options */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          shippingRates.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedMethod === option.id
                  ? 'border-[#D4A574] bg-[#D4A574]/5'
                  : 'border-gray-200 hover:border-gray-300'
              } ${option.popular ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}
              onClick={() => onMethodSelect(option.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="shipping"
                    value={option.id}
                    checked={selectedMethod === option.id}
                    onChange={() => onMethodSelect(option.id)}
                    className="h-4 w-4 text-[#D4A574] focus:ring-[#D4A574] border-gray-300"
                  />
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-600">
                      {option.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {option.name}
                        </p>
                        {option.popular && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Popular
                          </span>
                        )}
                        {option.price === 0 && option.id === 'standard' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Free
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Estimated delivery: {getEstimatedDeliveryDate(option.estimatedDays)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    option.price === 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {formatPrice(option.price)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Need it faster? */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Need it faster?</h4>
        <p className="text-sm text-blue-800">
          Express and overnight shipping options ensure your hair products arrive when you need them most.
          Perfect for special events or last-minute touch-ups!
        </p>
      </div>

      {/* Error Display */}
      {errors.shipping && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{errors.shipping}</p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedMethod || isLoading}
          className="px-8 py-3 bg-[#D4A574] text-white font-medium rounded-md hover:bg-[#B8956A] focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}