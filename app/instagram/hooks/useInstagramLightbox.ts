"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  InstagramMedia, 
  UseInstagramLightboxOptions, 
  UseInstagramLightboxReturn 
} from '../types';

export function useInstagramLightbox(
  media: InstagramMedia[],
  options: UseInstagramLightboxOptions = {}
): UseInstagramLightboxReturn {
  const {
    enableKeyboard = true,
    enableSwipe = true,
    autoPlay = false,
    preloadNext = 2,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const preloadedImages = useRef<Set<string>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const open = useCallback((index: number) => {
    if (index >= 0 && index < media.length) {
      setCurrentIndex(index);
      setIsOpen(true);
      setIsLoading(true);
      setIsPlaying(autoPlay);
    }
  }, [media.length, autoPlay]);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const next = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsLoading(true);
    }
  }, [currentIndex, media.length]);

  const previous = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsLoading(true);
    }
  }, [currentIndex]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < media.length && index !== currentIndex) {
      setCurrentIndex(index);
      setIsLoading(true);
    }
  }, [currentIndex, media.length]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Preload images for better performance
  const preloadImage = useCallback((url: string) => {
    if (preloadedImages.current.has(url)) return;

    const img = new Image();
    img.onload = () => {
      preloadedImages.current.add(url);
    };
    img.onerror = () => {
      console.warn('Failed to preload image:', url);
    };
    img.src = url;
  }, []);

  // Preload adjacent images when index changes
  useEffect(() => {
    if (!isOpen || !media.length) return;

    const currentMedia = media[currentIndex];
    if (currentMedia) {
      // Preload current image
      preloadImage(currentMedia.media_url);

      // Preload next images
      for (let i = 1; i <= preloadNext; i++) {
        const nextIndex = currentIndex + i;
        if (nextIndex < media.length) {
          preloadImage(media[nextIndex].media_url);
        }
      }

      // Preload previous images
      for (let i = 1; i <= preloadNext; i++) {
        const prevIndex = currentIndex - i;
        if (prevIndex >= 0) {
          preloadImage(media[prevIndex].media_url);
        }
      }
    }
  }, [currentIndex, isOpen, media, preloadNext, preloadImage]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard || !isOpen) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          close();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          previous();
          break;
        case 'ArrowRight':
          event.preventDefault();
          next();
          break;
        case ' ':
          event.preventDefault();
          if (media[currentIndex]?.media_type === 'VIDEO') {
            togglePlay();
          }
          break;
        case 'Home':
          event.preventDefault();
          goTo(0);
          break;
        case 'End':
          event.preventDefault();
          goTo(media.length - 1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [enableKeyboard, isOpen, close, previous, next, togglePlay, goTo, media, currentIndex]);

  // Touch/swipe handling
  useEffect(() => {
    if (!enableSwipe || !isOpen) return;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        touchStartX.current = event.touches[0].clientX;
        touchStartY.current = event.touches[0].clientY;
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (
        touchStartX.current === null || 
        touchStartY.current === null || 
        event.changedTouches.length !== 1
      ) {
        return;
      }

      const touchEndX = event.changedTouches[0].clientX;
      const touchEndY = event.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;
      
      // Check if horizontal swipe is dominant
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        event.preventDefault();
        
        if (deltaX > 0) {
          previous(); // Swipe right - go to previous
        } else {
          next(); // Swipe left - go to next
        }
      }
      
      // Check for vertical swipe to close
      if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 100) {
        event.preventDefault();
        close();
      }

      touchStartX.current = null;
      touchStartY.current = null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      // Prevent default scrolling behavior when swiping
      if (touchStartX.current !== null && touchStartY.current !== null) {
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        const deltaX = Math.abs(touchX - touchStartX.current);
        const deltaY = Math.abs(touchY - touchStartY.current);
        
        if (deltaX > deltaY) {
          event.preventDefault();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [enableSwipe, isOpen, previous, next, close]);

  // Body scroll lock when lightbox is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Handle media load events
  const handleMediaLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleMediaError = useCallback(() => {
    setIsLoading(false);
    console.error('Failed to load media:', media[currentIndex]?.media_url);
  }, [media, currentIndex]);

  // Auto-advance for videos when they end (if autoPlay is enabled)
  const handleVideoEnd = useCallback(() => {
    if (autoPlay && currentIndex < media.length - 1) {
      next();
    }
  }, [autoPlay, currentIndex, media.length, next]);

  return {
    currentIndex,
    isOpen,
    isLoading,
    isPlaying,
    open,
    close,
    next,
    previous,
    goTo,
    togglePlay,
    // Additional utility methods for components
    handlers: {
      onMediaLoad: handleMediaLoad,
      onMediaError: handleMediaError,
      onVideoEnd: handleVideoEnd,
    },
    // State helpers
    canGoNext: currentIndex < media.length - 1,
    canGoPrevious: currentIndex > 0,
    currentMedia: media[currentIndex] || null,
    totalCount: media.length,
  };
}