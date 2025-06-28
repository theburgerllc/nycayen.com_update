"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Heart, MessageCircle, ExternalLink, Eye, Expand } from 'lucide-react';
import Image from 'next/image';
import { InstagramMedia } from '../types';
import { useInstagramLightbox } from '../hooks/useInstagramLightbox';
import { trackInstagramEngagement } from '../lib/analytics';

interface InstagramCarouselProps {
  data: InstagramMedia[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  showCaptions?: boolean;
  showStats?: boolean;
  enableSwipe?: boolean;
  enableLightbox?: boolean;
  className?: string;
  itemsPerView?: number;
  spacing?: number;
  onMediaClick?: (media: InstagramMedia, index: number) => void;
  onSlideChange?: (index: number) => void;
}

export function InstagramCarousel({
  data,
  autoPlay = true,
  autoPlayInterval = 4000,
  showControls = true,
  showIndicators = true,
  showCaptions = true,
  showStats = true,
  enableSwipe = true,
  enableLightbox = true,
  className = '',
  itemsPerView = 1,
  spacing = 16,
  onMediaClick,
  onSlideChange,
}: InstagramCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const prefersReducedMotion = useReducedMotion();
  
  const lightbox = useInstagramLightbox(data, {
    enableKeyboard: true,
    enableSwipe: true,
    preloadNext: 2,
  });

  const totalSlides = Math.max(0, data.length - itemsPerView + 1);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !isHovered && data.length > 1 && !prefersReducedMotion) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, autoPlayInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isHovered, currentIndex, autoPlayInterval, data.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      onSlideChange?.(currentIndex + 1);
    } else {
      // Loop back to start
      setDirection(1);
      setCurrentIndex(0);
      onSlideChange?.(0);
    }
  }, [currentIndex, totalSlides, onSlideChange]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
      onSlideChange?.(currentIndex - 1);
    } else {
      // Loop to end
      setDirection(-1);
      setCurrentIndex(totalSlides - 1);
      onSlideChange?.(totalSlides - 1);
    }
  }, [currentIndex, totalSlides, onSlideChange]);

  const goToSlide = useCallback((index: number) => {
    if (index !== currentIndex && index >= 0 && index < totalSlides) {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      onSlideChange?.(index);
    }
  }, [currentIndex, totalSlides, onSlideChange]);

  const handleMediaClick = useCallback((media: InstagramMedia, index: number) => {
    trackInstagramEngagement({
      type: 'click',
      mediaId: media.id,
      mediaType: media.media_type,
      position: index,
    });

    if (enableLightbox) {
      lightbox.open(index);
    }
    
    onMediaClick?.(media, index);
  }, [enableLightbox, lightbox, onMediaClick]);

  const handlePan = useCallback((event: any, info: PanInfo) => {
    if (!enableSwipe) return;
    
    const swipeThreshold = 50;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  }, [enableSwipe, handleNext, handlePrev]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    trackInstagramEngagement({
      type: isPlaying ? 'pause' : 'play',
      mediaId: data[currentIndex]?.id,
    });
  }, [isPlaying, data, currentIndex]);

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.95,
    }),
    center: {
      x: '0%',
      opacity: 1,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.3 : 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      transition: {
        duration: prefersReducedMotion ? 0.2 : 0.4,
      },
    }),
  };

  const overlayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
  };

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-96 text-gray-500 ${className}`}>
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No Instagram posts available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Main Carousel Container */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-black"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square md:aspect-[4/3]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
              drag={enableSwipe ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handlePan}
            >
              <div 
                className={`grid gap-${spacing/4}`}
                style={{
                  gridTemplateColumns: `repeat(${itemsPerView}, 1fr)`,
                  gap: `${spacing}px`,
                }}
              >
                {data.slice(currentIndex, currentIndex + itemsPerView).map((media, index) => (
                  <InstagramCarouselItem
                    key={media.id}
                    media={media}
                    index={currentIndex + index}
                    showCaptions={showCaptions}
                    showStats={showStats}
                    onClick={() => handleMediaClick(media, currentIndex + index)}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Loading State Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          {showControls && data.length > itemsPerView && (
            <>
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.8)' }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:text-amber-400 transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.8)' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:text-amber-400 transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </motion.button>
            </>
          )}

          {/* Play/Pause Control */}
          {autoPlay && data.length > 1 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlayPause}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:text-amber-400 transition-colors z-10"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </motion.button>
          )}

          {/* Expand/Lightbox Button */}
          {enableLightbox && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => lightbox.open(currentIndex)}
              className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:text-amber-400 transition-colors z-10"
              aria-label="View in lightbox"
            >
              <Expand size={20} />
            </motion.button>
          )}
        </div>

        {/* Indicators */}
        {showIndicators && totalSlides > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-amber-400 w-8'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {autoPlay && isPlaying && !isHovered && !prefersReducedMotion && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-amber-400 z-10"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ 
              duration: autoPlayInterval / 1000,
              ease: 'linear',
              repeat: Infinity,
            }}
          />
        )}
      </motion.div>

      {/* Thumbnails Strip */}
      {data.length > 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {data.map((media, index) => (
            <motion.button
              key={media.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToSlide(Math.floor(index / itemsPerView))}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                index >= currentIndex && index < currentIndex + itemsPerView
                  ? 'border-amber-400 shadow-lg'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <Image
                src={media.thumbnail_url || media.media_url}
                alt={`Instagram post ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Lightbox */}
      {lightbox.isOpen && (
        <lightbox.LightboxComponent />
      )}
    </div>
  );
}

// Individual carousel item component
interface InstagramCarouselItemProps {
  media: InstagramMedia;
  index: number;
  showCaptions: boolean;
  showStats: boolean;
  onClick: () => void;
}

function InstagramCarouselItem({
  media,
  index,
  showCaptions,
  showStats,
  onClick,
}: InstagramCarouselItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-full h-full cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Image
        src={media.media_url}
        alt={media.caption || `Instagram post ${index + 1}`}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Overlay on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
          >
            {/* Stats */}
            {showStats && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute bottom-4 left-4 flex items-center gap-4 text-white text-sm"
              >
                {media.like_count && (
                  <div className="flex items-center gap-1">
                    <Heart size={16} />
                    <span>{media.like_count.toLocaleString()}</span>
                  </div>
                )}
                {media.comments_count && (
                  <div className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    <span>{media.comments_count.toLocaleString()}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* External link */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-4 right-4"
            >
              <a
                href={media.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-black/50 rounded-full text-white hover:text-amber-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
                aria-label="View on Instagram"
              >
                <ExternalLink size={16} />
              </a>
            </motion.div>

            {/* Caption */}
            {showCaptions && media.caption && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="absolute bottom-4 right-4 max-w-xs"
              >
                <p className="text-white text-sm line-clamp-3 bg-black/50 p-2 rounded">
                  {media.caption}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media type indicator */}
      {media.media_type === 'VIDEO' && (
        <div className="absolute top-4 left-4 p-1 bg-black/70 rounded text-white">
          <Play size={16} />
        </div>
      )}
      {media.media_type === 'CAROUSEL_ALBUM' && (
        <div className="absolute top-4 left-4 p-1 bg-black/70 rounded text-white">
          <Grid size={16} />
        </div>
      )}
    </motion.div>
  );
}