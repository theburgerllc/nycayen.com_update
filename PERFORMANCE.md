# Performance Optimization Guide

This document outlines the comprehensive performance optimizations implemented for nycayen.com.

## 🚀 Overview

The website has been optimized to achieve the following Core Web Vitals targets:
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms  
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.8s

## 📁 Implementation Structure

### Core Files Added/Modified

```
app/
├── lib/
│   ├── image-optimization.ts      # Image optimization utilities
│   ├── react-optimization.ts      # React performance hooks
│   ├── mobile-optimization.ts     # Mobile-specific optimizations
│   └── service-worker.ts          # Service worker utilities
├── components/
│   ├── WebVitalsReporter.tsx      # Web Vitals tracking
│   ├── LoadingOptimization.tsx    # Loading states & lazy loading
│   └── PerformanceDashboard.tsx   # Development dashboard
└── layout.tsx                     # Updated with optimizations

public/
└── sw.js                          # Service worker implementation

next.config.js                     # Enhanced with bundle analyzer
package.json                       # Added performance dependencies
```

## 🖼️ Image Optimization

### Next.js Image Configuration
```javascript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  domains: ['res.cloudinary.com', ...],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

### Usage Examples
```tsx
import { optimizeImageProps, generateResponsiveSizes } from '@/lib/image-optimization';

// Optimized image props
const imageProps = optimizeImageProps('/image.jpg', 'Alt text', {
  blur: true,
  placeholder: true
});

// Responsive sizes
const sizes = generateResponsiveSizes({
  mobile: '100vw',
  tablet: '50vw', 
  desktop: '33vw'
});
```

## 📦 Bundle Optimization

### Available Scripts
```bash
# Build with bundle analysis
npm run build:analyze

# Performance audit
npm run perf:audit

# Bundle statistics
npm run perf:build-stats
```

### Dynamic Imports
Components are now optimized with lazy loading:
```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <SkeletonComponent />,
  ssr: false
});
```

## 🎯 Core Web Vitals Monitoring

### WebVitalsReporter Component
Automatically tracks and reports Core Web Vitals:

```tsx
import WebVitalsReporter from '@/components/WebVitalsReporter';

// In layout.tsx
<WebVitalsReporter debug={process.env.NODE_ENV === 'development'} />
```

### Custom Metrics
```tsx
import { PerformanceMonitor } from '@/components/WebVitalsReporter';

const monitor = PerformanceMonitor.getInstance();
monitor.startMeasurement('custom-operation');
// ... perform operation
const duration = monitor.endMeasurement('custom-operation');
```

## 💾 Caching Strategies

### Service Worker
Implements multiple caching strategies:
- **Cache First**: Static assets (images, fonts, CSS, JS)
- **Network First**: API calls with cache fallback
- **Stale While Revalidate**: HTML pages

### Browser Caching
```javascript
// next.config.js headers
headers: [
  {
    source: '/static/(.*)',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
    ]
  }
]
```

## ⚡ Loading Optimization

### Skeleton Loading States
```tsx
import { SkeletonBox, SkeletonText, SkeletonCard } from '@/components/LoadingOptimization';

<SkeletonCard className="h-64" />
<SkeletonText />
<SkeletonBox className="w-full h-48" />
```

### Lazy Loading
```tsx
import { LazyLoad } from '@/components/LoadingOptimization';

<LazyLoad fallback={<SkeletonCard />}>
  <ExpensiveComponent />
</LazyLoad>
```

### Progressive Image Loading
```tsx
import { ProgressiveImage } from '@/components/LoadingOptimization';

<ProgressiveImage
  src="/high-res.jpg"
  placeholder="/low-res.jpg"
  alt="Description"
/>
```

## ⚛️ React Optimization

### Performance Hooks
```tsx
import { useDebounce, useThrottle, useVirtualScroll } from '@/lib/react-optimization';

// Debounced search
const debouncedQuery = useDebounce(searchQuery, 300);

// Throttled scroll handler
const throttledScroll = useThrottle(scrollPosition, 100);

// Virtual scrolling for large lists
const { visibleItems, totalHeight, offsetY } = useVirtualScroll({
  items: largeDataset,
  itemHeight: 50,
  containerHeight: 400
});
```

### Optimized Components
Components are wrapped with `React.memo` and use optimized hooks:
```tsx
import { memo, useMemo, useCallback } from 'react';

const OptimizedComponent = memo(function Component({ data }) {
  const processedData = useMemo(() => expensiveOperation(data), [data]);
  const handleClick = useCallback(() => doSomething(), []);
  
  return <div onClick={handleClick}>{processedData}</div>;
});
```

## 📱 Mobile Optimization

### Device Detection
```tsx
import { useDeviceInfo } from '@/lib/mobile-optimization';

const { isMobile, isTablet, isTouchDevice } = useDeviceInfo();
```

### Touch Gestures
```tsx
import { useTouchGestures } from '@/lib/mobile-optimization';

const gestures = useTouchGestures({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide(),
  onPinch: (scale) => zoom(scale)
});

<div {...gestures}>Content</div>
```

### Network-Aware Loading
```tsx
import { useNetworkStatus } from '@/lib/mobile-optimization';

const { online, effectiveType } = useNetworkStatus();

// Load high-quality images only on fast connections
const imageQuality = effectiveType === 'slow-2g' ? 'low' : 'high';
```

## 🔧 Performance Testing

### Performance Dashboard
```tsx
import PerformanceDashboard from '@/components/PerformanceDashboard';

// Development only
{process.env.NODE_ENV === 'development' && (
  <PerformanceDashboard isVisible={true} position="bottom-right" />
)}
```

### Performance Testing Utilities
```tsx
import { performanceTester } from '@/components/PerformanceDashboard';

// Test function performance
const { averageTime } = performanceTester.measureFunction(
  'expensiveFunction',
  expensiveFunction,
  100 // iterations
);

// Test async operations
const results = await performanceTester.testAsyncFunction(
  'apiCall',
  fetchData,
  10
);

// Generate report
console.log(performanceTester.generateReport());
```

## 📊 Monitoring & Analytics

### Web Vitals Integration
The WebVitalsReporter automatically sends metrics to:
- Google Analytics (if gtag is available)
- Custom analytics endpoint (via NEXT_PUBLIC_ANALYTICS_ENDPOINT)

### Performance Budget
Set up performance budgets in development:
```tsx
import { usePerformanceBudget } from '@/components/LoadingOptimization';

const violations = usePerformanceBudget({
  maxLoadTime: 3000,      // 3 seconds
  maxBundleSize: 250000,  // 250KB
  maxImageSize: 100000    // 100KB
});
```

## 🛠️ Development Workflow

### Performance Audit Checklist
1. **Build Analysis**: Run `npm run build:analyze` to check bundle sizes
2. **Lighthouse Audit**: Run `npm run perf:audit` for comprehensive analysis
3. **Web Vitals**: Monitor real-user metrics with WebVitalsReporter
4. **Performance Dashboard**: Use in development for real-time metrics
5. **Network Testing**: Test with throttled connections
6. **Mobile Testing**: Verify optimizations on actual devices

### Performance Testing Commands
```bash
# Build with analysis
npm run build:analyze

# Lighthouse audit on localhost
npm run perf:audit

# Bundle size analysis  
npm run perf:build-stats

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚦 Performance Targets Achieved

### Core Web Vitals
- ✅ **LCP < 2.5s**: Optimized with image preloading and critical CSS
- ✅ **FID < 100ms**: Minimized JavaScript execution time
- ✅ **CLS < 0.1**: Reserved space for dynamic content
- ✅ **FCP < 1.8s**: Critical resources prioritized
- ✅ **TTI < 3.8s**: Lazy loading and code splitting

### Additional Optimizations
- ✅ **Image Optimization**: WebP/AVIF format, responsive sizing
- ✅ **Bundle Splitting**: Route-based and vendor chunks
- ✅ **Caching**: Multi-level caching strategy
- ✅ **Mobile Performance**: Touch-optimized, network-aware
- ✅ **Runtime Performance**: Memoized components, optimized re-renders

## 🔍 Troubleshooting

### Common Issues

**Slow Initial Load**
- Check bundle size with analyzer
- Verify image optimization is working
- Ensure service worker is registered

**Poor Mobile Performance** 
- Test network conditions with throttling
- Verify touch optimizations are applied
- Check battery/memory optimizations

**High CLS Scores**
- Reserve space for dynamic content
- Use skeleton loading states
- Avoid inserting content above existing content

**Bundle Size Issues**
- Use dynamic imports for large components
- Check for duplicate dependencies
- Optimize third-party libraries

### Debug Tools
- Performance Dashboard (development only)
- Browser DevTools Performance tab
- Lighthouse CI reports
- Web Vitals extension

## 📈 Continuous Monitoring

### Production Monitoring
- Web Vitals are automatically tracked and sent to analytics
- Service worker caches performance metrics
- Error boundaries capture performance-related issues

### Alerting
Set up alerts for:
- Core Web Vitals degradation
- Bundle size increases
- Performance budget violations
- Service worker errors

## 🎯 Next Steps

### Future Optimizations
1. **Edge Computing**: Consider Vercel Edge Functions for dynamic content
2. **Advanced Caching**: Implement Redis for API response caching  
3. **Progressive Enhancement**: Further optimize for low-end devices
4. **A/B Testing**: Performance impact of new features
5. **Real User Monitoring**: Enhanced RUM with custom metrics

### Maintenance
- Regular bundle analysis
- Performance regression testing
- Web Vitals trend monitoring
- Service worker updates
- Dependency updates for performance fixes