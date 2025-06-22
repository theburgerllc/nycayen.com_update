# Nycayen Moore Hair Artistry - Booking System

A comprehensive, conversion-optimized booking system built with Next.js, React Hook Form, Zod validation, and Stripe payments.

## Features

### 🎯 **Conversion-Optimized Flow**
- 5-step guided booking process
- Visual service cards with pricing
- Service comparison and package deals
- Real-time price calculations
- Progress indicators with step navigation

### 📅 **Advanced Scheduling**
- Calendar integration with real-time availability
- Time zone handling (America/New_York)
- Blackout dates management
- Buffer time between appointments
- Staff member selection support

### 💳 **Payment Processing**
- Stripe integration for secure payments
- Full payment or deposit options (30% default)
- Multiple payment methods support
- Payment confirmation and receipts

### ♿ **Accessibility (WCAG 2.1 AA)**
- Screen reader compatible
- Keyboard navigation support
- Skip links for navigation
- High contrast mode support
- Reduced motion preferences
- ARIA labels and landmarks
- Focus management

### 📊 **Analytics & Tracking**
- Google Analytics integration
- Conversion funnel tracking
- Error tracking and monitoring
- Form validation analytics
- User behavior insights

### 📱 **Mobile-Responsive**
- Optimized for all device sizes
- Touch-friendly interfaces
- Progressive enhancement
- Smooth transitions and animations

## Booking Flow Structure

### Step 1: Service Selection
- **Individual Services**: Browse all available services with detailed descriptions
- **Service Packages**: Curated combinations with savings
- **Comparison Tool**: Real-time summary of selections
- **Features**: Visual cards, pricing display, duration estimates

### Step 2: Date & Time Selection  
- **Calendar View**: Interactive date picker with availability
- **Time Slots**: Real-time availability checking
- **Staff Selection**: Choose your preferred stylist
- **Business Hours**: Tuesday-Saturday, 9:00 AM - 7:00 PM

### Step 3: Customer Information
- **Personal Details**: Name, email, phone validation
- **Communication Preferences**: Email, phone, or SMS
- **Special Requests**: Additional notes and requirements
- **Terms & Conditions**: Privacy policy acceptance

### Step 4: Add-ons & Extras
- **Personalized Recommendations**: Based on selected services
- **Categories**: Hair Care, Styling, Treatments
- **Quantity Selection**: Multiple add-ons support
- **Upselling**: Smart suggestions for enhanced experience

### Step 5: Payment & Confirmation
- **Booking Summary**: Complete service and pricing review
- **Payment Options**: Full payment or 30% deposit
- **Stripe Integration**: Secure payment processing
- **Confirmation**: Email and SMS notifications

## Technical Implementation

### Architecture
```
app/booking/
├── components/           # React components
│   ├── BookingFlow.tsx  # Main container
│   ├── ProgressIndicator.tsx
│   ├── ErrorBoundary.tsx
│   └── steps/           # Individual step components
├── hooks/               # Custom React hooks
│   └── useBookingState.ts
├── types/               # TypeScript definitions
├── data/                # Service data and configurations
├── utils/               # Utility functions
│   ├── accessibility.ts
│   └── analytics.ts
├── config/              # Configuration files
└── page.tsx            # Main booking page
```

### State Management
- **Custom Hook**: `useBookingState` for centralized state
- **localStorage**: Automatic form data persistence
- **Real-time Updates**: Instant price and duration calculations
- **Validation**: Zod schemas for type-safe validation

### Form Handling
- **React Hook Form**: Optimized form performance
- **Validation**: Real-time with Zod schemas
- **Error Handling**: User-friendly error messages
- **Auto-save**: Form data persistence between steps

## Configuration

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# Stripe Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email Service (for confirmations)
EMAIL_SERVICE_API_KEY=your_email_service_key
EMAIL_FROM_ADDRESS=bookings@nycayenmoore.com

# Business Configuration
BUSINESS_TIMEZONE=America/New_York
BOOKING_DEPOSIT_PERCENTAGE=30
CANCELLATION_HOURS=24

# Feature Flags
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_PAYMENT_SPLIT=true
```

### Business Configuration
Edit `app/booking/config/booking-config.ts`:

```typescript
export const businessConfig = {
  name: 'Nycayen Moore Hair Artistry',
  workingHours: { start: '09:00', end: '19:00' },
  workingDays: [2, 3, 4, 5, 6], // Tue-Sat
  depositPercentage: 30,
  cancellationHours: 24,
};
```

## Services & Pricing

### Available Services
1. **Precision Cut** - $85 (60 min)
2. **Color Artistry** - $120 (120 min)
3. **Custom Wig Design** - $200 (90 min)
4. **Bridal Hair Styling** - $150 (90 min)
5. **Balayage Highlights** - $180 (150 min)
6. **Keratin Smoothing** - $250 (180 min)

### Service Packages
- **Complete Hair Makeover**: Cut + Color ($185, save $20)
- **Bridal Beauty Package**: Styling + Cut ($215, save $20)
- **Luxury Experience**: Cut + Balayage + Keratin ($465, save $50)

### Add-ons
- Deep Conditioning Treatment - $35 (20 min)
- Scalp Massage - $25 (15 min)
- Hair Gloss Treatment - $45 (30 min)
- Personal Styling Lesson - $60 (30 min)
- Extension Application - $75 (45 min)
- Eyebrow Shaping - $40 (20 min)

## Accessibility Features

### WCAG 2.1 AA Compliance
- ✅ **Screen Reader Support**: Proper ARIA labels and landmarks
- ✅ **Keyboard Navigation**: Full functionality without mouse
- ✅ **Color Contrast**: Meets AA standards (4.5:1 minimum)
- ✅ **Focus Management**: Visible focus indicators
- ✅ **Responsive Text**: Scalable up to 200% without loss of function
- ✅ **Error Identification**: Clear error messages and instructions

### Implementation Details
- Skip links for quick navigation
- Progress indicators with ARIA attributes
- Form validation with screen reader announcements
- High contrast mode support
- Reduced motion preferences respected
- Focus trapping in modal contexts

## Analytics & Tracking

### Conversion Funnel
Track user progress through booking steps:
1. **Step Entry**: Track when users start each step
2. **Step Completion**: Monitor successful step completions
3. **Drop-off Points**: Identify where users abandon the flow
4. **Final Conversion**: Track completed bookings

### Key Metrics
- Booking completion rate
- Average time per step
- Most popular services
- Payment method preferences
- Mobile vs desktop usage

### Events Tracked
```typescript
// Step progression
BookingAnalytics.trackStepStart('services');
BookingAnalytics.trackStepComplete('services', { serviceCount: 2 });

// Conversions
BookingAnalytics.trackBookingComplete(bookingId, totalValue, paymentMethod);

// Errors
BookingAnalytics.trackError('payment', errorMessage);
```

## Error Handling

### Error Boundary
- Catches and handles React component errors
- Provides user-friendly error messages
- Offers recovery options (retry, contact support)
- Logs errors for debugging

### Form Validation
- Real-time validation with immediate feedback
- Field-level and form-level validation
- Custom error messages for better UX
- Accessibility-compliant error handling

### Payment Errors
- Stripe error handling and user feedback
- Retry mechanisms for failed payments
- Clear error messages and next steps
- Fallback contact options

## Testing

### Accessibility Testing
```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/react

# Run accessibility audits
npm run test:a11y
```

### Form Validation Testing
- Test all validation scenarios
- Verify error message clarity
- Check screen reader compatibility
- Validate keyboard navigation

### Payment Testing
- Use Stripe test cards
- Test both success and failure scenarios
- Verify confirmation emails
- Check payment amount calculations

## Performance Optimization

### Loading States
- Skeleton loaders for better perceived performance
- Progressive loading of form sections
- Optimistic UI updates where appropriate

### Code Splitting
- Lazy loading of booking steps
- Dynamic imports for heavy components
- Optimized bundle size

### Caching
- localStorage for form data persistence
- Service worker for offline capability
- API response caching where appropriate

## Deployment

### Build Process
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

### Environment Setup
1. Configure environment variables
2. Set up Stripe webhooks
3. Configure email service
4. Test booking flow end-to-end

### Monitoring
- Set up error tracking (Sentry, etc.)
- Configure analytics (Google Analytics)
- Monitor performance metrics
- Set up uptime monitoring

## Support & Maintenance

### Regular Updates
- Review and update service pricing
- Monitor booking completion rates
- Update availability calendar
- Review customer feedback

### Security
- Regular security audits
- PCI compliance for payments
- Data protection measures
- Regular dependency updates

### Documentation
- Keep service descriptions current
- Update screenshots and guides
- Maintain API documentation
- Update accessibility features

## Contact & Support

For technical support or questions about the booking system:
- **Email**: support@nycayenmoore.com
- **Phone**: +1 (555) 123-4567
- **Emergency**: Use contact form on website

---

Built with ❤️ for Nycayen Moore Hair Artistry | © 2024