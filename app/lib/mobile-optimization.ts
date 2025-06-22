'use client';

import { useEffect, useState, useCallback } from 'react';

// Device detection utilities
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  pixelRatio: number;
  screenSize: { width: number; height: number };
  orientation: 'portrait' | 'landscape';
}

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouchDevice: false,
      isIOS: false,
      isAndroid: false,
      pixelRatio: 1,
      screenSize: { width: 1024, height: 768 },
      orientation: 'landscape',
    };
  }

  const userAgent = navigator.userAgent;
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isAndroid: /Android/.test(userAgent),
    pixelRatio: window.devicePixelRatio || 1,
    screenSize: { width, height },
    orientation: width > height ? 'landscape' : 'portrait',
  };
}

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(getDeviceInfo());
    };

    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Touch gesture utilities
export interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  threshold?: number;
}

export function useTouchGestures(options: TouchGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    threshold = 50,
  } = options;

  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [initialDistance, setInitialDistance] = useState<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });

    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialDistance(distance);
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Handle swipe gestures
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    } else {
      // Handle tap gestures
      const now = Date.now();
      const timeDiff = now - lastTap;

      if (timeDiff < 300 && timeDiff > 0) {
        onDoubleTap?.();
      } else {
        onTap?.();
      }

      setLastTap(now);
    }

    setTouchStart(null);
  }, [touchStart, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, lastTap]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistance > 0) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = currentDistance / initialDistance;
      onPinch?.(scale);
    }
  }, [initialDistance, onPinch]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
}

// Performance optimization for mobile
export function optimizeForMobile() {
  if (typeof window === 'undefined') return;

  const deviceInfo = getDeviceInfo();

  // Reduce animations on low-end devices
  if (deviceInfo.isMobile && window.navigator.hardwareConcurrency <= 4) {
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    document.documentElement.classList.add('reduce-motion');
  }

  // Optimize for touch
  if (deviceInfo.isTouchDevice) {
    document.documentElement.classList.add('touch-device');
    
    // Increase tap targets
    const style = document.createElement('style');
    style.textContent = `
      .touch-device button,
      .touch-device a,
      .touch-device [role="button"] {
        min-height: 44px;
        min-width: 44px;
      }
    `;
    document.head.appendChild(style);
  }

  // Battery optimization
  if ('getBattery' in navigator) {
    (navigator as any).getBattery().then((battery: any) => {
      if (battery.level < 0.2 || !battery.charging) {
        document.documentElement.classList.add('low-battery');
        
        // Reduce non-essential features
        const style = document.createElement('style');
        style.textContent = `
          .low-battery * {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
          }
          .low-battery video {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    });
  }

  // Memory optimization
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    const memoryRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    if (memoryRatio > 0.8) {
      document.documentElement.classList.add('low-memory');
      console.warn('Low memory detected, optimizing performance');
    }
  }
}

// Viewport utilities
export function useViewportSize() {
  const [size, setSize] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  });

  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}

// Safe area utilities for iOS
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
      });
    };

    updateSafeArea();
    window.addEventListener('orientationchange', updateSafeArea);
    return () => window.removeEventListener('orientationchange', updateSafeArea);
  }, []);

  return safeArea;
}

// Mobile-specific image optimization
export function getMobileImageSrc(baseSrc: string, deviceInfo: DeviceInfo): string {
  const { isMobile, pixelRatio, screenSize } = deviceInfo;
  
  if (!isMobile) return baseSrc;

  const maxWidth = Math.min(screenSize.width * pixelRatio, 800);
  
  // If using Cloudinary or similar service
  if (baseSrc.includes('cloudinary.com')) {
    return baseSrc.replace('/upload/', `/upload/w_${maxWidth},f_auto,q_auto/`);
  }

  // If using Next.js Image optimization
  if (baseSrc.startsWith('/_next/image')) {
    const url = new URL(baseSrc, window.location.origin);
    url.searchParams.set('w', maxWidth.toString());
    url.searchParams.set('q', '75');
    return url.toString();
  }

  return baseSrc;
}

// Network-aware loading
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState(() => {
    if (typeof navigator === 'undefined') {
      return { online: true, effectiveType: '4g' };
    }
    
    return {
      online: navigator.onLine,
      effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
    };
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setNetworkStatus(prev => ({
        ...prev,
        online: navigator.onLine,
      }));
    };

    const updateConnectionStatus = () => {
      if ('connection' in navigator) {
        setNetworkStatus(prev => ({
          ...prev,
          effectiveType: (navigator as any).connection.effectiveType,
        }));
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', updateConnectionStatus);
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', updateConnectionStatus);
      }
    };
  }, []);

  return networkStatus;
}

// Mobile-specific CSS utilities
export function injectMobileCSS() {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.id = 'mobile-optimizations';
  style.textContent = `
    /* Safe area support */
    :root {
      --sat: env(safe-area-inset-top);
      --sar: env(safe-area-inset-right);
      --sab: env(safe-area-inset-bottom);
      --sal: env(safe-area-inset-left);
    }

    /* Touch-friendly interactions */
    .touch-device {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }

    .touch-device button,
    .touch-device a,
    .touch-device [role="button"] {
      touch-action: manipulation;
    }

    /* Reduce motion for performance */
    .reduce-motion * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    /* Low battery optimizations */
    .low-battery {
      filter: contrast(0.8) brightness(0.9);
    }

    /* Responsive font sizes */
    @media (max-width: 640px) {
      html {
        font-size: 14px;
      }
    }

    /* Mobile-specific scrolling */
    @media (max-width: 768px) {
      body {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
    }
  `;

  // Only inject if not already present
  if (!document.getElementById('mobile-optimizations')) {
    document.head.appendChild(style);
  }
}