// Mock Google Analytics for testing
export const mockGtag = jest.fn()

// Mock Google Tag Manager
export const mockDataLayer = []

// Mock window analytics properties
Object.defineProperty(window, 'gtag', {
  writable: true,
  value: mockGtag,
})

Object.defineProperty(window, 'dataLayer', {
  writable: true,
  value: mockDataLayer,
})

// Mock Facebook Pixel
export const mockFbq = jest.fn()
Object.defineProperty(window, 'fbq', {
  writable: true,
  value: mockFbq,
})

// Mock Hotjar
export const mockHj = jest.fn()
Object.defineProperty(window, 'hj', {
  writable: true,
  value: mockHj,
})

// Mock Microsoft Clarity
export const mockClarity = jest.fn()
Object.defineProperty(window, 'clarity', {
  writable: true,
  value: mockClarity,
})

// Mock Analytics Manager
export const mockAnalyticsManager = {
  initialize: jest.fn(),
  track: jest.fn(),
  trackPageView: jest.fn(),
  getABTestVariant: jest.fn().mockReturnValue('control'),
}

// Mock Conversion Tracker
export const mockConversionTracker = {
  trackBookingInitiated: jest.fn(),
  trackBookingCompleted: jest.fn(),
  trackBookingStepCompleted: jest.fn(),
  trackPurchase: jest.fn(),
  trackAddToCart: jest.fn(),
  trackRemoveFromCart: jest.fn(),
  trackBeginCheckout: jest.fn(),
  trackNewsletterSignup: jest.fn(),
  trackContactFormSubmission: jest.fn(),
  trackPhoneCallClick: jest.fn(),
  trackVideoEngagement: jest.fn(),
  trackSocialShare: jest.fn(),
  trackDownload: jest.fn(),
  trackCustomerJourneyStep: jest.fn(),
  trackGoalCompletion: jest.fn(),
}

// Mock Performance Monitor
export const mockPerformanceMonitor = {
  startMeasurement: jest.fn(),
  endMeasurement: jest.fn().mockReturnValue(100),
  getMetric: jest.fn(),
  getAllMetrics: jest.fn().mockReturnValue({}),
  reportCustomMetric: jest.fn(),
}

// Mock Web Vitals
export const mockWebVitals = {
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
  onINP: jest.fn(),
}

// Analytics event helpers for testing
export const expectAnalyticsEvent = (eventName: string, properties?: any) => {
  expect(mockGtag).toHaveBeenCalledWith('event', eventName, properties)
}

export const expectDataLayerPush = (data: any) => {
  expect(mockDataLayer).toContainEqual(data)
}

export const expectFacebookPixelEvent = (eventName: string, properties?: any) => {
  expect(mockFbq).toHaveBeenCalledWith('track', eventName, properties)
}

export const expectHotjarEvent = (action: string, ...args: any[]) => {
  expect(mockHj).toHaveBeenCalledWith(action, ...args)
}

export const expectClarityEvent = (action: string, ...args: any[]) => {
  expect(mockClarity).toHaveBeenCalledWith(action, ...args)
}

// Mock A/B testing
export const mockABTest = (testName: string, variant: string) => {
  mockAnalyticsManager.getABTestVariant.mockReturnValue(variant)
}

// Mock conversion tracking events
export const mockBookingFlow = {
  initiated: (data: any) => mockConversionTracker.trackBookingInitiated(data),
  stepCompleted: (data: any) => mockConversionTracker.trackBookingStepCompleted(data),
  completed: (data: any) => mockConversionTracker.trackBookingCompleted(data),
}

export const mockEcommerceFlow = {
  addToCart: (data: any) => mockConversionTracker.trackAddToCart(data),
  beginCheckout: (data: any) => mockConversionTracker.trackBeginCheckout(data),
  purchase: (data: any) => mockConversionTracker.trackPurchase(data),
}

export const mockLeadGeneration = {
  newsletter: (data: any) => mockConversionTracker.trackNewsletterSignup(data),
  contact: (data: any) => mockConversionTracker.trackContactFormSubmission(data),
  phone: (data: any) => mockConversionTracker.trackPhoneCallClick(data),
}

// Performance testing helpers
export const mockPerformanceEntry = (name: string, duration: number, entryType = 'measure') => ({
  name,
  duration,
  entryType,
  startTime: Date.now(),
  toJSON: () => ({ name, duration, entryType }),
})

export const mockNavigationTiming = {
  domContentLoadedEventEnd: 1500,
  domContentLoadedEventStart: 1400,
  loadEventEnd: 2000,
  loadEventStart: 1900,
  navigationStart: 0,
  fetchStart: 100,
  responseEnd: 800,
  responseStart: 600,
}

// Reset all analytics mocks
export const resetAnalyticsMocks = () => {
  mockGtag.mockClear()
  mockFbq.mockClear()
  mockHj.mockClear()
  mockClarity.mockClear()
  mockDataLayer.length = 0
  
  Object.values(mockAnalyticsManager).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear()
    }
  })
  
  Object.values(mockConversionTracker).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear()
    }
  })
  
  Object.values(mockPerformanceMonitor).forEach(mock => {
    if (typeof mock === 'function') {
      mock.mockClear()
    }
  })
}

// Mock implementation of analytics hooks
jest.mock('@/app/components/AnalyticsProvider', () => ({
  useAnalytics: () => mockAnalyticsManager,
}))

jest.mock('@/app/lib/conversion-tracking', () => ({
  useConversionTracking: () => mockConversionTracker,
  ConversionTracker: mockConversionTracker,
}))

jest.mock('@/app/components/WebVitalsReporter', () => ({
  usePerformanceMonitor: () => mockPerformanceMonitor,
  PerformanceMonitor: {
    getInstance: () => mockPerformanceMonitor,
  },
}))

// Mock web-vitals library
jest.mock('web-vitals', () => mockWebVitals)