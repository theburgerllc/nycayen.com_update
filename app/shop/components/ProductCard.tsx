"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye, 
  Zap,
  Badge,
  Truck
} from 'lucide-react';
import { ProductCardProps } from '../types';
import { useShop } from '../context/ShopContext';

export default function ProductCard({ 
  product, 
  view = 'grid', 
  showQuickAdd = true, 
  showCompare = false,
  className = '' 
}: ProductCardProps) {
  const { addToCart, addToWishlist, isInWishlist, isLoading } = useShop();
  const [imageLoading, setImageLoading] = useState(true);
  const [hoveredImage, setHoveredImage] = useState(0);

  const isWishlisted = isInWishlist(product.id);
  const mainImage = product.images[hoveredImage] || product.images[0];
  const hasMultipleImages = product.images.length > 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock > 0) {
      await addToCart(product.id, 1);
      
      // Analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'add_to_cart', {
          currency: 'USD',
          value: product.price,
          items: [{
            item_id: product.id,
            item_name: product.name,
            category: product.categories[0],
            quantity: 1,
            price: product.price,
          }],
        });
      }
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    await addToWishlist(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (view === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={`glass rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}
      >
        <Link href={`/shop/product/${product.slug}`}>
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative w-full sm:w-64 h-64 group">
              <Image
                src={mainImage.url}
                alt={mainImage.alt}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 640px) 100vw, 256px"
              />
              
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-700 animate-pulse" />
              )}

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
                    <Star size={12} />
                    Featured
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleAddToWishlist}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isWishlisted
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-800 hover:bg-red-500 hover:text-white'
                    }`}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                  <Link
                    href={`/shop/product/${product.slug}`}
                    className="w-10 h-10 bg-white/90 text-gray-800 rounded-full flex items-center justify-center hover:bg-amber-500 hover:text-white transition-colors"
                    aria-label="Quick view"
                  >
                    <Eye size={18} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h3>
                  {product.brand && (
                    <p className="text-gray-400 text-sm mb-2">{product.brand}</p>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-amber-400">
                    {formatPrice(product.price)}
                  </div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="text-sm text-gray-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </div>
                  )}
                </div>
              </div>

              {product.shortDescription && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {product.shortDescription}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Rating */}
                  {product.averageRating && (
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < Math.floor(product.averageRating!)
                                ? 'text-amber-400 fill-current'
                                : 'text-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        ({product.reviewCount})
                      </span>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="flex items-center space-x-1 text-sm">
                    {product.stock > 0 ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-400">In Stock</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-red-400">Out of Stock</span>
                      </>
                    )}
                  </div>
                </div>

                {showQuickAdd && (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isLoading}
                    className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full transition-colors"
                  >
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`glass rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group ${className}`}
    >
      <Link href={`/shop/product/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={mainImage.url}
            alt={mainImage.alt}
            fill
            className={`object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-700 animate-pulse" />
          )}

          {/* Image Navigation Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex space-x-1">
                {product.images.slice(0, 4).map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setHoveredImage(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === hoveredImage ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

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
                <Star size={12} />
                Featured
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAddToWishlist}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-800 hover:bg-red-500 hover:text-white'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Quick Add Button */}
          {showQuickAdd && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isLoading}
                className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Add to cart"
              >
                <ShoppingCart size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2">
            {product.brand && (
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                {product.brand}
              </p>
            )}
            <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>

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

          {/* Price */}
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

            {/* Stock Indicator */}
            <div className="text-xs">
              {product.stock > 0 ? (
                <span className="text-green-400">In Stock</span>
              ) : (
                <span className="text-red-400">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}