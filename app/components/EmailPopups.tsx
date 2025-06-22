'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Gift, Clock, TrendingUp } from 'lucide-react';
import NewsletterSignup from './NewsletterSignup';
import { abTesting } from '@/lib/email-marketing';

// Popup trigger types
type PopupTrigger = 'exit-intent' | 'time-based' | 'scroll-based' | 'page-specific' | 'manual';

interface PopupConfig {
  id: string;
  trigger: PopupTrigger;
  delay?: number; // for time-based (seconds)
  scrollPercentage?: number; // for scroll-based (0-100)
  pages?: string[]; // for page-specific
  frequency?: 'session' | 'daily' | 'weekly' | 'monthly'; // how often to show
  priority?: number; // higher number = higher priority
  enabled?: boolean;
  testVariants?: string[];
}

interface PopupState {
  isVisible: boolean;
  config: PopupConfig | null;
  variant?: string;
  userId: string;
}

// Popup configurations
const POPUP_CONFIGS: PopupConfig[] = [
  {
    id: 'exit-intent-offer',
    trigger: 'exit-intent',
    frequency: 'session',
    priority: 10,
    enabled: true,
    testVariants: ['15-percent-off', '20-percent-off', 'free-consultation'],
  },
  {
    id: 'time-based-newsletter',
    trigger: 'time-based',
    delay: 30,
    frequency: 'daily',
    priority: 5,
    enabled: true,
    testVariants: ['beauty-tips', 'exclusive-access'],
  },
  {
    id: 'scroll-engagement',
    trigger: 'scroll-based',
    scrollPercentage: 50,
    frequency: 'session',
    priority: 7,
    enabled: true,
  },
  {
    id: 'services-page-booking',
    trigger: 'page-specific',
    pages: ['/services', '/booking'],
    frequency: 'session',
    priority: 8,
    enabled: true,
  },
  {
    id: 'blog-content-upgrade',
    trigger: 'page-specific',
    pages: ['/blog'],
    scrollPercentage: 70,
    frequency: 'weekly',
    priority: 6,
    enabled: true,
  },
];

// Custom hook for popup management
function usePopupManager(): [PopupState, (config: PopupConfig, variant?: string) => void, () => void] {
  const [popupState, setPopupState] = useState<PopupState>({
    isVisible: false,
    config: null,
    userId: '',
  });

  useEffect(() => {
    // Generate or get user ID for consistent A/B testing
    let userId = localStorage.getItem('popup-user-id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('popup-user-id', userId);
    }
    setPopupState(prev => ({ ...prev, userId }));
  }, []);

  const showPopup = useCallback((config: PopupConfig, variant?: string) => {
    const userId = localStorage.getItem('popup-user-id') || '';
    
    // Check if popup should be shown based on frequency
    const lastShown = localStorage.getItem(`popup-${config.id}-last-shown`);
    if (lastShown && !shouldShowPopup(config.frequency || 'session', lastShown)) {
      return;
    }

    // Check if user has already converted on this popup
    const hasConverted = localStorage.getItem(`popup-${config.id}-converted`);
    if (hasConverted) {
      return;
    }

    // Get A/B test variant if available
    let selectedVariant = variant;
    if (config.testVariants && config.testVariants.length > 0) {
      selectedVariant = abTesting.getVariant(config.id, userId);
      abTesting.trackView(config.id, selectedVariant, userId);
    }

    setPopupState({
      isVisible: true,
      config,
      variant: selectedVariant,
      userId,
    });

    // Update last shown timestamp
    localStorage.setItem(`popup-${config.id}-last-shown`, Date.now().toString());
  }, []);

  const hidePopup = useCallback(() => {
    setPopupState(prev => ({ ...prev, isVisible: false, config: null }));
  }, []);

  return [popupState, showPopup, hidePopup];
}

// Main popup manager component
export default function EmailPopupManager() {
  const [popupState, showPopup, hidePopup] = usePopupManager();
  const [isExitIntentListening, setIsExitIntentListening] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const pageStartTime = useRef(Date.now());

  // Exit intent detection
  useEffect(() => {
    if (isExitIntentListening) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        const exitConfig = POPUP_CONFIGS.find(c => c.trigger === 'exit-intent' && c.enabled);
        if (exitConfig) {
          showPopup(exitConfig);
          setIsExitIntentListening(true);
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [isExitIntentListening, showPopup]);

  // Scroll percentage tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollPercentage(scrollPercent);

      // Check for scroll-based popups
      POPUP_CONFIGS.forEach(config => {
        if (
          config.trigger === 'scroll-based' &&
          config.enabled &&
          config.scrollPercentage &&
          scrollPercent >= config.scrollPercentage &&
          !popupState.isVisible
        ) {
          showPopup(config);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showPopup, popupState.isVisible]);

  // Time-based tracking
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const currentTime = Math.floor((Date.now() - pageStartTime.current) / 1000);
      setTimeOnPage(currentTime);

      // Check for time-based popups
      POPUP_CONFIGS.forEach(config => {
        if (
          config.trigger === 'time-based' &&
          config.enabled &&
          config.delay &&
          currentTime >= config.delay &&
          !popupState.isVisible
        ) {
          showPopup(config);
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showPopup, popupState.isVisible]);

  // Page-specific popup detection
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    POPUP_CONFIGS.forEach(config => {
      if (
        config.trigger === 'page-specific' &&
        config.enabled &&
        config.pages?.some(page => currentPath.includes(page)) &&
        !popupState.isVisible
      ) {
        // Delay page-specific popups slightly
        setTimeout(() => showPopup(config), 2000);
      }
    });
  }, [showPopup, popupState.isVisible]);

  const handlePopupSuccess = useCallback((subscriberId: string) => {
    if (popupState.config) {
      // Mark as converted
      localStorage.setItem(`popup-${popupState.config.id}-converted`, 'true');
      
      // Track conversion for A/B testing
      if (popupState.variant) {
        abTesting.trackConversion(popupState.config.id, popupState.variant, popupState.userId);
      }

      // Hide popup after short delay
      setTimeout(hidePopup, 2000);
    }
  }, [popupState, hidePopup]);

  if (!popupState.isVisible || !popupState.config) {
    return null;
  }

  return (
    <PopupRenderer
      config={popupState.config}
      variant={popupState.variant}
      onClose={hidePopup}
      onSuccess={handlePopupSuccess}
    />
  );
}

// Individual popup renderer
function PopupRenderer({
  config,
  variant,
  onClose,
  onSuccess,
}: {
  config: PopupConfig;
  variant?: string;
  onClose: () => void;
  onSuccess: (subscriberId: string) => void;
}) {
  const getPopupContent = () => {
    switch (config.id) {
      case 'exit-intent-offer':
        return getExitIntentContent(variant);
      case 'time-based-newsletter':
        return getTimeBasedContent(variant);
      case 'scroll-engagement':
        return getScrollEngagementContent();
      case 'services-page-booking':
        return getServicesPageContent();
      case 'blog-content-upgrade':
        return getBlogContentUpgrade();
      default:
        return getDefaultContent();
    }
  };

  const content = getPopupContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-w-md w-full max-h-90vh overflow-y-auto">
        <NewsletterSignup
          variant="popup"
          title={content.title}
          description={content.description}
          showInterests={content.showInterests}
          showName={content.showName}
          onSuccess={onSuccess}
          onClose={onClose}
          leadMagnet={content.leadMagnet}
        />
      </div>
    </div>
  );
}

// Content generators for different popup types
function getExitIntentContent(variant?: string) {
  switch (variant) {
    case '20-percent-off':
      return {
        title: '🎉 Wait! Get 20% Off Your First Service',
        description: 'Don\'t leave empty-handed! Get exclusive savings on your first appointment.',
        showInterests: false,
        showName: true,
      };
    case 'free-consultation':
      return {
        title: '💎 Free Style Consultation',
        description: 'Get a complimentary 15-minute style consultation with your first booking.',
        showInterests: true,
        showName: true,
      };
    default: // 15-percent-off
      return {
        title: '✨ Wait! Save 15% on Your First Visit',
        description: 'Join our VIP list and get exclusive savings plus beauty insider tips.',
        showInterests: false,
        showName: true,
      };
  }
}

function getTimeBasedContent(variant?: string) {
  switch (variant) {
    case 'exclusive-access':
      return {
        title: '👑 Get VIP Access',
        description: 'Join our exclusive community for early booking access and special perks.',
        showInterests: true,
        showName: true,
      };
    default: // beauty-tips
      return {
        title: '💄 Weekly Beauty Tips',
        description: 'Get professional beauty tips and hair care secrets delivered weekly.',
        showInterests: true,
        showName: false,
      };
  }
}

function getScrollEngagementContent() {
  return {
    title: '📚 Enjoying Our Content?',
    description: 'Get more beauty tips, tutorials, and exclusive offers in your inbox.',
    showInterests: true,
    showName: false,
  };
}

function getServicesPageContent() {
  return {
    title: '📅 Ready to Book?',
    description: 'Get booking reminders and exclusive member pricing on all services.',
    showInterests: false,
    showName: true,
  };
}

function getBlogContentUpgrade() {
  return {
    title: '📖 Download the Complete Guide',
    description: 'Get the full beauty guide with bonus tips not available on the blog.',
    showInterests: false,
    showName: true,
    leadMagnet: 'Complete Beauty Guide',
  };
}

function getDefaultContent() {
  return {
    title: '💌 Stay in the Loop',
    description: 'Join thousands of beauty lovers getting insider tips and exclusive offers.',
    showInterests: true,
    showName: false,
  };
}

// Utility functions
function shouldShowPopup(frequency: string, lastShownTimestamp: string): boolean {
  const lastShown = parseInt(lastShownTimestamp);
  const now = Date.now();
  const timeDiff = now - lastShown;

  switch (frequency) {
    case 'session':
      // Don't show again in same session (browser tab)
      return false;
    case 'daily':
      return timeDiff > 24 * 60 * 60 * 1000; // 24 hours
    case 'weekly':
      return timeDiff > 7 * 24 * 60 * 60 * 1000; // 7 days
    case 'monthly':
      return timeDiff > 30 * 24 * 60 * 60 * 1000; // 30 days
    default:
      return true;
  }
}

// A/B Testing configuration for popups
export function initializePopupABTests() {
  // Exit intent popup test
  abTesting.createTest('exit-intent-offer', [
    '15-percent-off',
    '20-percent-off', 
    'free-consultation'
  ], [0.4, 0.4, 0.2]);

  // Time-based popup test
  abTesting.createTest('time-based-newsletter', [
    'beauty-tips',
    'exclusive-access'
  ], [0.6, 0.4]);
}

// Manual popup trigger for specific scenarios
export function triggerManualPopup(popupId: string) {
  const config = POPUP_CONFIGS.find(c => c.id === popupId);
  if (config) {
    const event = new CustomEvent('manual-popup', { detail: config });
    window.dispatchEvent(event);
  }
}

// Analytics tracking for popup performance
export function trackPopupAnalytics() {
  // Track popup views and conversions
  const popupViews = parseInt(localStorage.getItem('popup-total-views') || '0');
  const popupConversions = parseInt(localStorage.getItem('popup-total-conversions') || '0');
  
  return {
    totalViews: popupViews,
    totalConversions: popupConversions,
    conversionRate: popupViews > 0 ? (popupConversions / popupViews) * 100 : 0,
    testResults: POPUP_CONFIGS.reduce((acc, config) => {
      if (config.testVariants) {
        acc[config.id] = abTesting.getTestResults(config.id);
      }
      return acc;
    }, {} as Record<string, any>),
  };
}