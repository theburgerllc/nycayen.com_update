"use client";

import { useState } from 'react';
import { Cart } from '../../shop/types';
import { formatCurrency } from '../../lib/stripe';
import { useShop } from '../../shop/context/ShopContext';
import { Minus, Plus, X, Tag } from 'lucide-react';
import Image from 'next/image';

interface OrderSummaryProps {
  cart: Cart;
  shippingMethod?: string | null;
}

interface ShippingRates {
  [key: string]: {
    name: string;
    price: number;
    estimatedDays: string;
  };
}

const shippingRates: ShippingRates = {
  standard: { name: 'Standard Shipping', price: 10, estimatedDays: '5-7 business days' },
  express: { name: 'Express Shipping', price: 25, estimatedDays: '2-3 business days' },
  overnight: { name: 'Overnight Shipping', price: 45, estimatedDays: '1 business day' },
};

export function OrderSummary({ cart, shippingMethod }: OrderSummaryProps) {
  const { updateCartItem, removeFromCart, applyCoupon } = useShop();
  const [showItems, setShowItems] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const selectedShipping = shippingMethod ? shippingRates[shippingMethod] : null;
  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  
  // Calculate totals
  const subtotal = cart.subtotal;
  const tax = cart.tax;
  const discount = cart.discount;
  const total = subtotal + tax + shippingCost - discount;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsCouponLoading(true);
    setCouponError('');
    
    try {
      const success = await applyCoupon(couponCode.trim());
      if (success) {
        setCouponCode('');
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch (error) {
      setCouponError('Failed to apply coupon');
    } finally {
      setIsCouponLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Order Summary Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          <button
            onClick={() => setShowItems(!showItems)}
            className="text-[#D4A574] hover:text-[#B8956A] text-sm font-medium"
          >
            {showItems ? 'Hide' : 'Show'} items ({cart.items.length})
          </button>
        </div>
      </div>

      {/* Cart Items */}
      {showItems && (
        <div className="p-6 border-b max-h-80 overflow-y-auto">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                {/* Product Image */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src="/api/placeholder/48/48" // Replace with actual product image
                    alt="Product"
                    fill
                    className="object-cover rounded-md"
                  />
                  <div className="absolute -top-2 -right-2 bg-[#D4A574] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    Product {item.productId}
                  </h4>
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.selectedVariants).map(([key, value]) => 
                        `${key}: ${value}`
                      ).join(', ')}
                    </p>
                  )}
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center mt-2 space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="p-1 rounded-md hover:bg-gray-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 rounded-md hover:bg-red-100 text-red-600 ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-sm font-medium text-gray-900">
                  ${item.totalPrice.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coupon Code */}
      <div className="p-6 border-b">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Promo Code
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isCouponLoading || !couponCode.trim()}
              className="px-4 py-2 bg-[#D4A574] text-white text-sm font-medium rounded-md hover:bg-[#B8956A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCouponLoading ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {couponError && (
            <p className="text-red-600 text-xs">{couponError}</p>
          )}
          {cart.couponCode && (
            <p className="text-green-600 text-xs">
              Coupon "{cart.couponCode}" applied! You saved ${discount.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Order Totals */}
      <div className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          
          {selectedShipping && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{selectedShipping.name}</span>
              <span className="text-gray-900">
                {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">${tax.toFixed(2)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Free Shipping Threshold */}
        {subtotal < 100 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Add ${(100 - subtotal).toFixed(2)} more to qualify for free shipping!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}