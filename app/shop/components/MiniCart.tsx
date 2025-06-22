"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, X, Plus, Minus, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getProductById } from '../data/products';

interface MiniCartProps {
  className?: string;
}

export default function MiniCart({ className = '' }: MiniCartProps) {
  const { 
    cartItems, 
    cartCount, 
    cartTotal,
    isCartOpen, 
    setIsCartOpen,
    updateCartItem,
    removeFromCart,
    isLoading 
  } = useShop();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  if (!mounted) {
    return (
      <button className={`relative p-2 text-white hover:text-amber-400 transition-colors ${className}`}>
        <ShoppingCart size={24} />
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Cart Toggle Button */}
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className="relative p-2 text-white hover:text-amber-400 transition-colors"
        aria-label="Toggle cart"
      >
        <ShoppingCart size={24} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </button>

      {/* Cart Dropdown */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop (mobile only) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: -10 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] glass rounded-xl border border-white/10 z-50 max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">
                  Shopping Cart ({cartCount})
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items */}
              {cartItems.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Your cart is empty</p>
                  <Link
                    href="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="inline-block bg-amber-500 hover:bg-amber-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="max-h-96 overflow-y-auto">
                    {cartItems.map((item) => {
                      const product = getProductById(item.productId);
                      if (!product) return null;

                      return (
                        <div key={item.id} className="p-4 border-b border-white/10 last:border-b-0">
                          <div className="flex gap-3">
                            {/* Product Image */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={product.images[0].url}
                                alt={product.images[0].alt}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/shop/product/${product.slug}`}
                                onClick={() => setIsCartOpen(false)}
                                className="text-white font-medium hover:text-amber-400 transition-colors line-clamp-2 text-sm"
                              >
                                {product.name}
                              </Link>
                              
                              {/* Variants */}
                              {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                <div className="mt-1">
                                  {Object.entries(item.selectedVariants).map(([groupId, variantId]) => {
                                    const group = product.variants?.find(g => g.id === groupId);
                                    const variant = group?.variants.find(v => v.id === variantId);
                                    return group && variant ? (
                                      <div key={groupId} className="text-gray-400 text-xs">
                                        {group.name}: {variant.name}
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1 || isLoading}
                                    className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="w-8 text-center text-white text-sm font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    disabled={item.quantity >= product.stock || isLoading}
                                    className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                {/* Price and Remove */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-amber-400 font-medium text-sm">
                                    {formatPrice(item.totalPrice)}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="text-gray-400 hover:text-red-400 transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-white/10">
                    {/* Total */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white font-medium">Total:</span>
                      <span className="text-xl font-bold text-amber-400">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Link
                        href="/shop/cart"
                        onClick={() => setIsCartOpen(false)}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        View Cart
                      </Link>
                      <Link
                        href="/shop/checkout"
                        onClick={() => setIsCartOpen(false)}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>Checkout</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>

                    {/* Free Shipping Indicator */}
                    {cartTotal < 50 && (
                      <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-center">
                        <span className="text-amber-400 text-xs">
                          Add {formatPrice(50 - cartTotal)} more for free shipping
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}