'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { AnalyticsTracker } from '../lib/analytics';

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void;
  trackPageView: (data?: any) => void;
  getABTestVariant: (testName: string, variants: string[], trafficSplit?: number[]) => string;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // Analytics initialization handled in AnalyticsTracker
  }, []);

  const analytics = AnalyticsTracker.getInstance();
  
  const contextValue: AnalyticsContextType = {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    getABTestVariant: () => 'default', // Simple fallback
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
      {/* GTM NoScript fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID || 'GTM-XXXXXXX'}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </AnalyticsContext.Provider>
  );
}