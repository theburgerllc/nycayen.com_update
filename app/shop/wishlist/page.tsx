"use client";
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, X, ArrowLeft, Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ShopProvider } from '../context/ShopContext';
import { getProductById } from '../data/products';

function WishlistPageContent() {
  const { 
    wishlistItems, 
    wishlistCount,
    removeFromWishlist, 
    addToCart,
    isLoading 
  } = useShop();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAddToCart = async (productId: string, selectedVariants?: { [key: string]: string }) => {
    await addToCart(productId, 1, selectedVariants);
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromWishlist(itemId);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-stone-900 pt-28">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <div className="glass rounded-xl p-12">
              <Heart className="w-16 h-16 text-gray-500 mx-auto mb-6" />
              <h2 className="text-2xl font-playfair text-white mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-gray-300 mb-8">
                Save your favorite products to your wishlist and shop them anytime.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Discover Products</span>
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
              My Wishlist
            </h1>
            <p className="text-gray-300">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved for later
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

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item, index) => {
            const product = getProductById(item.productId);
            if (!product) return null;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-square">
                  <Link href={`/shop/product/${product.slug}`}>
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </Link>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    aria-label="Remove from wishlist"
                  >
                    <X size={16} />
                  </button>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.isOnSale && (
                      <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        -{product.discountPercentage}% OFF
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Out of Stock
                      </div>
                    )}
                    {product.featured && (
                      <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star size={10} />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Quick Add to Cart */}
                  {product.stock > 0 && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleAddToCart(item.productId, item.selectedVariants)}
                        disabled={isLoading}
                        className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                      {product.brand}
                    </p>
                  )}

                  {/* Product Name */}
                  <Link href={`/shop/product/${product.slug}`}>
                    <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Variants */}
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <div className="mb-2 space-y-1">
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

                  {/* Rating */}
                  {product.averageRating && (
                    <div className="flex items-center space-x-1 mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={`${
                              i < Math.floor(product.averageRating!)
                                ? 'text-amber-400 fill-current'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-xs">
                        ({product.reviewCount})
                      </span>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-amber-400">
                        {formatPrice(product.price)}
                      </div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="text-sm text-gray-400 line-through">
                          {formatPrice(product.comparePrice)}
                        </div>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="text-xs">
                      {product.stock > 0 ? (
                        <span className="text-green-400">In Stock</span>
                      ) : (
                        <span className="text-red-400">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="mt-4">
                    {product.stock > 0 ? (
                      <button
                        onClick={() => handleAddToCart(item.productId, item.selectedVariants)}
                        disabled={isLoading}
                        className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart size={16} />
                        <span>Add to Cart</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-600 text-gray-400 py-2 rounded-lg font-medium cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}
                  </div>

                  {/* Added Date */}
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="glass rounded-xl p-8 max-w-md mx-auto">
            <Heart className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Keep Shopping
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Discover more amazing products to add to your wishlist
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              <span>Browse All Products</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ShopProvider>
      <WishlistPageContent />
    </ShopProvider>
  );
}