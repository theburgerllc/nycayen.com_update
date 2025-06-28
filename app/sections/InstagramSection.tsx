"use client";

import React, { Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Instagram, Eye, Heart, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { InstagramCarousel } from '../instagram/components/InstagramCarousel';
import { InstagramFeedSkeleton } from '../instagram/components/InstagramFeedSkeleton';
import { InstagramErrorBoundary } from '../instagram/components/InstagramErrorBoundary';
import { InstagramMedia } from '../instagram/types';

interface InstagramSectionProps {
  posts?: InstagramMedia[];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  maxPosts?: number;
  autoPlay?: boolean;
  className?: string;
}

// Fallback Instagram data for when API is unavailable
const fallbackInstagramData: InstagramMedia[] = Array.from({ length: 12 }, (_, i) => ({
  id: `fallback_${i + 1}`,
  media_type: i % 3 === 0 ? 'VIDEO' : i % 4 === 0 ? 'CAROUSEL_ALBUM' : 'IMAGE',
  media_url: `https://picsum.photos/600/600?random=${i + 100}&blur=1`,
  thumbnail_url: `https://picsum.photos/150/150?random=${i + 100}`,
  caption: `✨ Beautiful hair transformation #${i + 1} at NYC Ayen Hair Studio! 
  
Professional styling and color artistry that brings out your natural beauty. Book your consultation today! 

#HairTransformation #NYCHair #HairArtistry #Beauty #Salon #HairGoals #CustomWigs #HairColor #HairCuts #LuxuryHair`,
  permalink: `https://instagram.com/p/mock_${i + 1}`,
  timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  username: 'nycayenmoore',
  like_count: Math.floor(Math.random() * 500) + 150,
  comments_count: Math.floor(Math.random() * 50) + 10,
  is_featured: i < 4,
  category: i % 3 === 0 ? 'transformations' : i % 3 === 1 ? 'styling' : 'color',
  tags: ['hair', 'beauty', 'transformation', 'nyc', 'salon'],
}));

export default function InstagramSection({
  posts = fallbackInstagramData,
  title = "Follow Our Journey",
  subtitle = "Get inspired by our latest transformations and behind-the-scenes moments",
  showHeader = true,
  maxPosts = 9,
  autoPlay = true,
  className = '',
}: InstagramSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // Use the provided posts or fallback data
  const instagramPosts = posts.slice(0, maxPosts);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: prefersReducedMotion ? 0 : 30,
      scale: prefersReducedMotion ? 1 : 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const sparkleVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: {
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut",
      },
    },
  };

  const handleInstagramClick = () => {
    window.open('https://instagram.com/nycayenmoore', '_blank', 'noopener,noreferrer');
  };

  return (
    <section 
      id="instagram" 
      className={`py-20 bg-gradient-to-br from-gray-50 via-white to-amber-50/30 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {showHeader && (
          <motion.div
            variants={headerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-16 relative"
          >
            {/* Decorative sparkles */}
            {!prefersReducedMotion && (
              <>
                <motion.div
                  variants={sparkleVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute -top-4 left-1/4 text-amber-400"
                >
                  <Sparkles size={20} />
                </motion.div>
                <motion.div
                  variants={sparkleVariants}
                  initial="initial"
                  animate="animate"
                  style={{ animationDelay: "1s" }}
                  className="absolute -top-2 right-1/4 text-amber-300"
                >
                  <Sparkles size={16} />
                </motion.div>
              </>
            )}

            {/* Section Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.2, 
                duration: 0.6,
                type: "spring",
                stiffness: 150 
              }}
              viewport={{ once: true }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-playfair text-gray-900">
                {title}
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              {subtitle}
            </motion.p>

            {/* Social Proof Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-8 flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>2.5K+ Likes weekly</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span>500+ Comments</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span>50K+ Views monthly</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Instagram Feed Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <InstagramErrorBoundary>
            <Suspense fallback={<InstagramFeedSkeleton />}>
              <motion.div variants={itemVariants}>
                <InstagramCarousel
                  data={instagramPosts}
                  autoPlay={autoPlay}
                  autoPlayInterval={5000}
                  showControls={true}
                  showIndicators={true}
                  showCaptions={true}
                  showStats={true}
                  enableSwipe={true}
                  enableLightbox={true}
                  itemsPerView={3}
                  spacing={16}
                  className="mb-8"
                  onMediaClick={(media, index) => {
                    // Track engagement
                    console.log('Instagram media clicked:', media.id, index);
                  }}
                />
              </motion.div>
            </Suspense>
          </InstagramErrorBoundary>

          {/* Call to Action */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-12"
          >
            <motion.button
              onClick={handleInstagramClick}
              whileHover={{ 
                scale: prefersReducedMotion ? 1 : 1.05,
                y: prefersReducedMotion ? 0 : -2,
              }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5" />
              <span>Follow @nycayenmoore</span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: "easeInOut" 
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </motion.span>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-4 text-gray-500 text-sm"
            >
              Join 10K+ followers for daily hair inspiration and exclusive tips
            </motion.p>
          </motion.div>

          {/* Featured Hashtags */}
          <motion.div
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <div className="flex flex-wrap justify-center gap-2">
              {[
                '#HairTransformation',
                '#NYCHair', 
                '#HairArtistry',
                '#CustomWigs',
                '#LuxuryHair',
                '#HairGoals'
              ].map((hashtag, index) => (
                <motion.span
                  key={hashtag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: prefersReducedMotion ? 1 : 1.05,
                    color: '#f59e0b' 
                  }}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full hover:bg-amber-100 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    window.open(`https://instagram.com/explore/tags/${hashtag.slice(1)}/`, '_blank');
                  }}
                >
                  {hashtag}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Enhanced loading component for Instagram section
export function InstagramSectionSkeleton() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Skeleton */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-48 h-12 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-96 h-6 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
          <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>

        {/* Carousel Skeleton */}
        <div className="relative">
          <div className="aspect-square md:aspect-[4/3] bg-gray-200 rounded-xl animate-pulse mb-4" />
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* CTA Skeleton */}
        <div className="text-center mt-12">
          <div className="w-48 h-12 bg-gray-200 rounded-full animate-pulse mx-auto mb-4" />
          <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>
      </div>
    </section>
  );
}