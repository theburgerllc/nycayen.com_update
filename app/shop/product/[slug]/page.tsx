"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Truck,
  Shield,
  RotateCcw,
  Share2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { getProductBySlug, products } from '../../data/products';
import { useShop } from '../../context/ShopContext';
import { ShopProvider } from '../../context/ShopContext';
import { Product } from '../../types';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

function ProductPageContent({ params }: ProductPageProps) {
  const { addToCart, addToWishlist, isInWishlist, isLoading } = useShop();
  const [product, setProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  useEffect(() => {
    const foundProduct = getProductBySlug(params.slug);
    if (!foundProduct) {
      notFound();
    }
    setProduct(foundProduct);
  }, [params.slug]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-stone-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500" />
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id, selectedVariants);
  const relatedProducts = products.filter(p => 
    p.id !== product.id && 
    p.categories.some(cat => product.categories.includes(cat))
  ).slice(0, 4);

  const handleAddToCart = async () => {
    if (product.stock > 0) {
      await addToCart(product.id, quantity, selectedVariants);
    }
  };

  const handleAddToWishlist = async () => {
    await addToWishlist(product.id, selectedVariants);
  };

  const handleVariantChange = (groupId: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [groupId]: variantId,
    }));
  };

  const canAddToCart = product.stock > 0 && 
    (!product.variants || product.variants.every(group => 
      !group.required || selectedVariants[group.id]
    ));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-stone-900">
      <div className="container mx-auto px-6 py-8 pt-28">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-gray-400 mb-8"
        >
          <Link href="/shop" className="hover:text-amber-400 transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="capitalize">
            {product.categories[0]?.replace('-', ' ')}
          </span>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square glass rounded-xl overflow-hidden group">
              <Image
                src={product.images[currentImageIndex].url}
                alt={product.images[currentImageIndex].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev === product.images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isOnSale && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -{product.discountPercentage}% OFF
                  </div>
                )}
                {product.featured && (
                  <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star size={14} />
                    Featured
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                      index === currentImageIndex
                        ? 'ring-2 ring-amber-500'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Brand and Name */}
            <div>
              {product.brand && (
                <p className="text-amber-400 text-sm uppercase tracking-wide mb-2">
                  {product.brand}
                </p>
              )}
              <h1 className="text-3xl font-playfair text-white mb-4">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {product.averageRating && (
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`${
                        i < Math.floor(product.averageRating!)
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-300">
                  {product.averageRating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-amber-400">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {product.isOnSale && (
                <p className="text-green-400 text-sm">
                  You save {formatPrice((product.comparePrice || 0) - product.price)}
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Variants */}
            {product.variants && product.variants.map((group) => (
              <div key={group.id} className="space-y-3">
                <label className="block text-white font-medium">
                  {group.name}
                  {group.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                
                {group.type === 'color' ? (
                  <div className="flex flex-wrap gap-2">
                    {group.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => handleVariantChange(group.id, variant.id)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedVariants[group.id] === variant.id
                            ? 'border-amber-500 scale-110'
                            : 'border-gray-600 hover:border-amber-400'
                        }`}
                        style={{ backgroundColor: variant.value }}
                        title={variant.name}
                      />
                    ))}
                  </div>
                ) : (
                  <select
                    value={selectedVariants[group.id] || ''}
                    onChange={(e) => handleVariantChange(group.id, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select {group.name}</option>
                    {group.variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name} {variant.price && `(+${formatPrice(variant.price)})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block text-white font-medium">Quantity</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-600 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-400 hover:text-white transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-3 text-white font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 text-gray-400 hover:text-white transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="text-gray-400 text-sm">
                  {product.stock > 0 ? (
                    <span>{product.stock} in stock</span>
                  ) : (
                    <span className="text-red-400">Out of stock</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || isLoading}
                  className="flex-1 flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg font-semibold transition-colors"
                >
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
                
                <button
                  onClick={handleAddToWishlist}
                  className={`px-6 py-4 rounded-lg border-2 transition-colors ${
                    isWishlisted
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className="flex space-x-4 text-sm">
                <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <Truck className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Secure Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">30-Day Returns</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-8 mb-16"
        >
          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b border-white/10 mb-8">
            {[
              { key: 'description', label: 'Description' },
              { key: 'reviews', label: 'Reviews' },
              { key: 'shipping', label: 'Shipping & Returns' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-4 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="text-gray-300">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p className="leading-relaxed">{product.description}</p>
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {product.tags.map((tag: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check size={16} className="text-amber-400 flex-shrink-0" />
                          <span className="capitalize">{tag.replace('-', ' ')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">No reviews yet</h4>
                <p className="text-gray-400">Be the first to review this product</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-semibold mb-3">Shipping Information</h4>
                  <ul className="space-y-2">
                    <li>• Free standard shipping on orders over $50</li>
                    <li>• Express shipping available for $15</li>
                    <li>• Orders ship within 1-2 business days</li>
                    <li>• Delivery time: 3-7 business days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-3">Returns & Exchanges</h4>
                  <ul className="space-y-2">
                    <li>• 30-day return policy</li>
                    <li>• Items must be unused and in original packaging</li>
                    <li>• Free return shipping for exchanges</li>
                    <li>• Refunds processed within 5-7 business days</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-playfair text-white mb-8 text-center">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/shop/product/${relatedProduct.slug}`}
                  className="glass rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={relatedProduct.images[0].url}
                      alt={relatedProduct.images[0].alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-amber-400 font-bold">
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <ShopProvider>
      <ProductPageContent params={params} />
    </ShopProvider>
  );
}