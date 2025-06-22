"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Heart, 
  ArrowLeft, 
  Truck,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ShopProvider } from '../context/ShopContext';
import { getProductById } from '../data/products';

function CartPageContent() {
  const { 
    cart, 
    cartItems, 
    cartCount, 
    cartTotal,
    updateCartItem, 
    removeFromCart, 
    clearCart,
    addToWishlist,
    applyCoupon,
    isLoading 
  } = useShop();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

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

  const handleMoveToWishlist = async (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      await addToWishlist(item.productId, item.selectedVariants);
      await removeFromCart(itemId);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      setCouponLoading(true);
      const success = await applyCoupon(couponCode.trim());
      setCouponLoading(false);
      if (success) {
        setCouponCode('');
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-stone-900 pt-28">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="glass rounded-xl p-12">
              <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-6" />
              <h2 className="text-2xl font-playfair text-white mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-300 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-stone-900 pt-28">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-playfair text-white mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-300">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Link
            href="/shop"
            className="flex items-center space-x-2 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Continue Shopping</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => {
              const product = getProductById(item.productId);
              if (!product) return null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-xl p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <Link
                            href={`/shop/product/${product.slug}`}
                            className="text-white font-semibold hover:text-amber-400 transition-colors line-clamp-2"
                          >
                            {product.name}
                          </Link>
                          {product.brand && (
                            <p className="text-gray-400 text-sm mt-1">{product.brand}</p>
                          )}
                          
                          {/* Variants */}
                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                            <div className="mt-2 space-y-1">
                              {Object.entries(item.selectedVariants).map(([groupId, variantId]) => {
                                const group = product.variants?.find(g => g.id === groupId);
                                const variant = group?.variants.find(v => v.id === variantId);
                                return group && variant ? (
                                  <div key={groupId} className="text-gray-400 text-sm">
                                    {group.name}: {variant.name}
                                  </div>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors ml-4"
                          aria-label="Remove item"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-600 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isLoading}
                              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-3 py-2 text-white font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= product.stock || isLoading}
                              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <button
                            onClick={() => handleMoveToWishlist(item.id)}
                            className="flex items-center space-x-1 text-gray-400 hover:text-amber-400 transition-colors text-sm"
                          >
                            <Heart size={16} />
                            <span>Save for later</span>
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-semibold text-amber-400">
                            {formatPrice(item.totalPrice)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-gray-400 text-sm">
                              {formatPrice(item.price)} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Clear Cart */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end pt-4"
            >
              <button
                onClick={clearCart}
                className="text-gray-400 hover:text-red-400 transition-colors text-sm"
              >
                Clear entire cart
              </button>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Coupon Code */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Promo Code
              </h3>
              <form onSubmit={handleApplyCoupon} className="space-y-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!couponCode.trim() || couponLoading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {couponLoading ? 'Applying...' : 'Apply Code'}
                </button>
              </form>
              
              {cart?.couponCode && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between text-green-400 text-sm">
                    <span>Code "{cart.couponCode}" applied</span>
                    <span>-{formatPrice(cart.discount)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Subtotal</span>
                  <span className="text-white">{formatPrice(cart?.subtotal || 0)}</span>
                </div>
                
                {cart?.discount && cart.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Discount</span>
                    <span className="text-green-400">-{formatPrice(cart.discount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="text-white">
                    {cart?.subtotal && cart.subtotal >= 50 ? 'Free' : formatPrice(cart?.shipping || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Tax</span>
                  <span className="text-white">{formatPrice(cart?.tax || 0)}</span>
                </div>
                
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-xl font-bold text-amber-400">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Indicator */}
              {cart?.subtotal && cart.subtotal < 50 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="text-amber-400 text-sm text-center">
                    Add {formatPrice(50 - cart.subtotal)} more for free shipping
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <div className="mt-6 space-y-3">
                <Link
                  href="/shop/checkout"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard size={20} />
                  <span>Proceed to Checkout</span>
                </Link>
                
                <div className="text-center text-gray-400 text-xs">
                  Secure checkout powered by Stripe
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="glass rounded-xl p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Free Shipping</div>
                    <div className="text-gray-400 text-xs">On orders over $50</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-white text-sm font-medium">Secure Payment</div>
                    <div className="text-gray-400 text-xs">SSL encrypted checkout</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-white text-sm font-medium">30-Day Returns</div>
                    <div className="text-gray-400 text-xs">Hassle-free returns</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ShopProvider>
      <CartPageContent />
    </ShopProvider>
  );
}