# Instagram Feed Integration

A comprehensive, engaging Instagram feed integration for nycayen.com built with Next.js 14, TypeScript, and the Instagram Basic Display API.

## Features

### 🎨 **Rich Media Display**
- **Grid Layout**: Responsive grid with customizable columns (1-6)
- **Hover Effects**: Smooth animations and engagement stats overlay
- **Video Support**: Video thumbnails with play indicators
- **Carousel Detection**: Visual indicators for multi-media posts
- **High-Quality Images**: Progressive loading and optimization

### 🔍 **Lightbox Functionality**
- **Full-Screen Viewing**: Immersive media experience
- **Video Playback**: Native video controls with play/pause/mute
- **Image Zoom**: Pinch-to-zoom and zoom controls (1x-3x)
- **Navigation**: Keyboard arrows, swipe gestures, and buttons
- **Caption Display**: Full captions with engagement metrics
- **Download & Share**: Direct media download and native sharing

### 📱 **Mobile-First Design**
- **Touch Gestures**: Swipe navigation and pinch-zoom
- **Responsive Grid**: Adaptive columns based on screen size
- **Touch-Friendly**: Large tap targets and smooth interactions
- **Orientation Support**: Landscape and portrait optimized

### ⚡ **Performance Optimization**
- **Lazy Loading**: Images load only when visible
- **Progressive Enhancement**: Works without JavaScript
- **CDN Ready**: Optimized for content delivery networks
- **Bundle Splitting**: Code-split for optimal loading
- **Caching Strategy**: Multi-level caching (memory + localStorage)

### 🛡️ **Error Handling & Fallbacks**
- **Graceful Degradation**: Static content when API fails
- **Error Boundaries**: Component-level error isolation
- **Retry Logic**: Automatic retry with exponential backoff
- **Offline Support**: Cached content display
- **Loading States**: Skeleton screens and progress indicators

### 📊 **Analytics & Tracking**
- **Engagement Metrics**: Views, clicks, shares tracking
- **Performance Monitoring**: Load times and error rates
- **User Behavior**: Interaction patterns and preferences
- **Google Analytics**: Enhanced ecommerce events
- **Facebook Pixel**: Social media conversion tracking

### ♿ **Accessibility Features**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Focus Management**: Proper focus indicators and trapping
- **High Contrast**: Support for reduced motion preferences
- **Alt Text**: Automatic and manual image descriptions

## Installation & Setup

### 1. **Environment Configuration**

Add these variables to your `.env.local` file:

```env
# Instagram Basic Display API
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token
INSTAGRAM_USER_ID=your_instagram_user_id
NEXT_PUBLIC_INSTAGRAM_HANDLE=nycayenmoore

# Configuration
INSTAGRAM_TOKEN_REFRESH_THRESHOLD=604800  # 7 days
INSTAGRAM_CACHE_DURATION=3600             # 1 hour
INSTAGRAM_MAX_POSTS=50
INSTAGRAM_RATE_LIMIT_PER_HOUR=200

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id
```

### 2. **Instagram App Setup**

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Instagram Basic Display product
3. Configure OAuth redirect URIs
4. Generate a long-lived access token
5. Set up webhook endpoints (optional)

### 3. **API Routes**

The integration includes these API endpoints:

- `GET /api/instagram/feed` - Fetch Instagram posts
- `POST /api/instagram/refresh` - Refresh access token
- `GET /api/instagram/refresh` - Check API status

## Usage

### **Basic Integration**

```tsx
import { InstagramIntegration } from '@/app/instagram/components/InstagramIntegration';

export function MyComponent() {
  return (
    <InstagramIntegration
      maxPosts={12}
      gridColumns={3}
      showCaptions={true}
      showLightbox={true}
      aspectRatio="square"
      enableFallback={true}
      enableAnalytics={true}
    />
  );
}
```

### **Pre-configured Variations**

```tsx
import { 
  InstagramFeedMini,
  InstagramFeedGallery,
  InstagramFeedFull,
  InstagramWidget 
} from '@/app/instagram/components/InstagramIntegration';

// Mini feed (6 posts, no captions)
<InstagramFeedMini maxPosts={6} />

// Gallery view (12 posts, 4 columns)
<InstagramFeedGallery maxPosts={12} />

// Full feed (25 posts with captions)
<InstagramFeedFull maxPosts={25} />

// Sidebar widget (4 posts, 2 columns)
<InstagramWidget maxPosts={4} />
```

### **Custom Hook Usage**

```tsx
import { useInstagramFeed } from '@/app/instagram/hooks/useInstagramFeed';

function CustomFeed() {
  const { data, loading, error, refresh, loadMore, hasMore } = useInstagramFeed({
    maxPosts: 20,
    refreshInterval: 300, // 5 minutes
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map(post => (
        <div key={post.id}>{post.caption}</div>
      ))}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

### **Lightbox Integration**

```tsx
import { useInstagramLightbox } from '@/app/instagram/hooks/useInstagramLightbox';

function CustomLightbox({ media }: { media: InstagramMedia[] }) {
  const lightbox = useInstagramLightbox(media, {
    enableKeyboard: true,
    enableSwipe: true,
    preloadNext: 2,
  });

  return (
    <div>
      {media.map((item, index) => (
        <img
          key={item.id}
          src={item.media_url}
          onClick={() => lightbox.open(index)}
          alt={item.caption}
        />
      ))}
      
      {lightbox.isOpen && (
        <div className="lightbox">
          {/* Your custom lightbox UI */}
        </div>
      )}
    </div>
  );
}
```

## Customization

### **Styling**

The components use Tailwind CSS classes that match your design system:

```css
/* Custom Instagram styles */
.instagram-post {
  @apply transition-transform duration-300 hover:scale-105;
}

.instagram-lightbox {
  backdrop-filter: blur(8px);
}

.instagram-error {
  @apply max-w-lg mx-auto;
}
```

### **Content Filtering**

```tsx
// Filter by category
<InstagramIntegration
  maxPosts={12}
  onLoad={(media) => {
    // Custom filtering logic
    return media.filter(post => post.category === 'hairstyles');
  }}
/>
```

### **Custom Analytics**

```tsx
import { trackInstagramEngagement } from '@/app/instagram/lib/analytics';

// Track custom events
trackInstagramEngagement({
  type: 'view',
  mediaId: 'post_123',
  mediaType: 'IMAGE',
  timestamp: new Date(),
  customProperties: {
    source: 'homepage',
    campaign: 'winter_2024',
  },
});
```

## API Reference

### **Components**

#### `InstagramIntegration`
Main component with error boundaries and fallbacks.

**Props:**
- `maxPosts?: number` (default: 25)
- `showCaptions?: boolean` (default: true)
- `showLightbox?: boolean` (default: true)
- `gridColumns?: number` (default: 3)
- `aspectRatio?: 'square' | 'original'` (default: 'square')
- `enableFallback?: boolean` (default: true)
- `enableAnalytics?: boolean` (default: true)

#### `InstagramFeed`
Core feed component without error handling.

#### `InstagramLightbox`
Full-featured lightbox with media controls.

#### `InstagramPost`
Individual post component with hover effects.

### **Hooks**

#### `useInstagramFeed(options)`
Fetches and manages Instagram feed data.

**Returns:**
- `data: InstagramMedia[] | null`
- `loading: boolean`
- `error: InstagramError | null`
- `refetch: () => Promise<void>`
- `refresh: () => Promise<void>`
- `hasMore: boolean`
- `loadMore: () => Promise<void>`

#### `useInstagramLightbox(media, options)`
Manages lightbox state and interactions.

**Returns:**
- `currentIndex: number`
- `isOpen: boolean`
- `isLoading: boolean`
- `isPlaying: boolean`
- `open: (index: number) => void`
- `close: () => void`
- `next: () => void`
- `previous: () => void`

## Performance

### **Optimization Strategies**

1. **Image Optimization**
   - Next.js Image component with automatic optimization
   - Progressive loading with blur placeholders
   - Responsive image sizes for different viewports

2. **Caching Strategy**
   - Memory cache for immediate access
   - localStorage for browser persistence
   - API response caching with TTL

3. **Bundle Optimization**
   - Dynamic imports for lightbox components
   - Tree-shaking unused features
   - Code splitting by route

4. **Network Optimization**
   - Request batching and deduplication
   - Preloading adjacent images in lightbox
   - CDN integration for media files

### **Performance Metrics**

Monitor these key metrics:

- **Load Time**: Time to first meaningful paint
- **Cache Hit Rate**: Percentage of cached responses
- **Error Rate**: Failed API requests per hour
- **Engagement Rate**: User interactions per view

## Security

### **Data Protection**
- No sensitive data stored in localStorage
- API keys secured server-side only
- Input sanitization for user-generated content
- CORS protection for API endpoints

### **Rate Limiting**
- Instagram API rate limits respected
- Exponential backoff for failed requests
- Request queuing during high traffic

### **Error Handling**
- Graceful degradation for API failures
- User-friendly error messages
- Automatic retry with fallback content

## Troubleshooting

### **Common Issues**

1. **"Instagram API rate limit exceeded"**
   - Wait for rate limit reset (usually 1 hour)
   - Reduce refresh frequency
   - Check for excessive API calls

2. **"Failed to load Instagram posts"**
   - Verify environment variables
   - Check Instagram app permissions
   - Test API connectivity

3. **"Images not loading"**
   - Check CORS configuration
   - Verify image URLs are accessible
   - Enable fallback images

4. **"Lightbox not opening"**
   - Check for JavaScript errors
   - Verify component imports
   - Test on different browsers

### **Development Tips**

1. **Testing with Mock Data**
   ```tsx
   // Use fallback component for development
   <InstagramFallback maxPosts={6} reason="api_error" />
   ```

2. **Debug Mode**
   ```tsx
   // Enable console logging
   process.env.NODE_ENV = 'development';
   ```

3. **Error Monitoring**
   ```tsx
   // Custom error handler
   <InstagramIntegration
     onError={(error) => {
       console.error('Instagram error:', error);
       // Send to error tracking service
     }}
   />
   ```

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Mobile 88+
- **Features**: ES2020, IntersectionObserver, Fetch API
- **Polyfills**: Automatic polyfills for missing features

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update documentation
4. Test on multiple devices
5. Check accessibility compliance

## License

This Instagram integration is part of the nycayen.com project and follows the same licensing terms.