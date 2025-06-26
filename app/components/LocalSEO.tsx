'use client';

import { LocalBusinessStructuredData, FAQStructuredData, ReviewStructuredData } from './StructuredData';

interface BusinessHours {
  [key: string]: string;
}

interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
  verified?: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

interface LocalSEOProps {
  businessName?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone?: string;
  email?: string;
  hours?: BusinessHours;
  socialProfiles?: string[];
  reviews?: Review[];
  faqs?: FAQ[];
  services?: string[];
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
}

export default function LocalSEO({
  businessName = 'Nycayen Moore Hair Artistry',
  address = {
    street: '123 Fashion Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
  },
  phone = '+1-555-NYC-HAIR',
  email = 'info@nycayenmoore.com',
  hours = {
    monday: '09:00-18:00',
    tuesday: '09:00-18:00',
    wednesday: '09:00-18:00',
    thursday: '09:00-20:00',
    friday: '09:00-20:00',
    saturday: '08:00-18:00',
    sunday: 'CLOSED',
  },
  socialProfiles = [
    'https://www.instagram.com/nycayenmoore',
    'https://www.facebook.com/nycayenmoore',
    'https://www.tiktok.com/@nycayenmoore',
  ],
  reviews = [],
  faqs = [],
  services = [
    'Hair Cuts & Styling',
    'Hair Color & Highlights',
    'Custom Wig Design',
    'Bridal Hair Styling',
    'Hair Extensions',
    'Hair Treatments',
  ],
  priceRange = '$$$',
  rating = 4.9,
  reviewCount = 247,
}: LocalSEOProps) {
  
  // Generate comprehensive local business structured data
  const localBusinessData = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': 'https://nycayenmoore.com#localbusiness',
    name: businessName,
    image: 'https://nycayenmoore.com/images/studio.jpg',
    telephone: phone,
    email: email,
    url: 'https://nycayenmoore.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zip,
      addressCountry: address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.7505, // NYC coordinates - replace with actual
      longitude: -73.9934,
    },
    openingHoursSpecification: Object.entries(hours).map(([day, hoursStr]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1),
      opens: hoursStr === 'CLOSED' ? null : hoursStr.split('-')[0],
      closes: hoursStr === 'CLOSED' ? null : hoursStr.split('-')[1],
    })),
    priceRange,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    sameAs: socialProfiles,
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 40.7505,
        longitude: -73.9934,
      },
      geoRadius: '50000', // 50km radius
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Hair Services',
      itemListElement: services.map((service, index) => ({
        '@type': 'Offer',
        position: index + 1,
        itemOffered: {
          '@type': 'Service',
          name: service,
          provider: {
            '@type': 'HairSalon',
            name: businessName,
          },
        },
      })),
    },
    paymentAccepted: 'Cash, Credit Card, Debit Card, Apple Pay, Google Pay',
    currenciesAccepted: 'USD',
    areaServed: [
      {
        '@type': 'City',
        name: 'New York City',
        sameAs: 'https://en.wikipedia.org/wiki/New_York_City',
      },
      {
        '@type': 'State',
        name: 'New York',
        sameAs: 'https://en.wikipedia.org/wiki/New_York_(state)',
      },
    ],
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'WiFi',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Parking',
        value: true,
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Wheelchair Accessible',
        value: true,
      },
    ],
  };

  // Default FAQs if none provided
  const defaultFAQs: FAQ[] = [
    {
      question: 'What services do you offer?',
      answer: 'We offer a full range of hair services including cuts, color, custom wig design, bridal styling, extensions, and treatments. Our specialty is luxury hair artistry and custom wig design.',
    },
    {
      question: 'How far in advance should I book?',
      answer: 'We recommend booking 2-3 weeks in advance, especially for special events like weddings. However, we do accept same-day appointments based on availability.',
    },
    {
      question: 'Do you offer consultations?',
      answer: 'Yes! We offer complimentary consultations for all services. This allows us to understand your vision and recommend the best approach for your hair goals.',
    },
    {
      question: 'What are your hours?',
      answer: `We're open ${Object.entries(hours).map(([day, hrs]) => `${day}: ${hrs}`).join(', ')}. We also offer evening and weekend appointments by special arrangement.`,
    },
    {
      question: 'Do you use organic/natural products?',
      answer: 'Yes, we use high-quality, professional-grade products including organic and natural options. We can discuss product preferences during your consultation.',
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'We require 24-hour notice for cancellations or rescheduling. Late cancellations may be subject to a fee.',
    },
  ];

  // Default reviews if none provided
  const defaultReviews: Review[] = [
    {
      author: 'Sarah M.',
      rating: 5,
      text: 'Absolutely incredible! Nycayen transformed my hair beyond my wildest dreams. The attention to detail and artistry is unmatched in NYC.',
      date: '2024-01-15',
      verified: true,
    },
    {
      author: 'Jennifer L.',
      rating: 5,
      text: 'Best hair experience of my life! The custom wig design service is phenomenal. Highly recommend for anyone looking for luxury hair artistry.',
      date: '2024-01-10',
      verified: true,
    },
    {
      author: 'Michelle R.',
      rating: 5,
      text: 'Perfect for my wedding day! The bridal styling was flawless and lasted all night. Professional, talented, and so friendly.',
      date: '2024-01-05',
      verified: true,
    },
  ];

  const activeFAQs = faqs.length > 0 ? faqs : defaultFAQs;
  const activeReviews = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <>
      {/* Local Business Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />

      {/* FAQ Structured Data */}
      <FAQStructuredData questions={activeFAQs} />

      {/* Individual Review Structured Data */}
      {activeReviews.map((review, index) => (
        <ReviewStructuredData key={index} review={review} />
      ))}

      {/* Professional Service Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            '@id': 'https://nycayenmoore.com#professionalservice',
            name: businessName,
            description: 'Luxury hair artistry, custom wig design, and professional styling services in New York City',
            provider: {
              '@id': 'https://nycayenmoore.com#localbusiness',
            },
            areaServed: {
              '@type': 'City',
              name: 'New York City',
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Professional Hair Services',
              itemListElement: services.map((service, index) => ({
                '@type': 'Offer',
                position: index + 1,
                itemOffered: {
                  '@type': 'Service',
                  name: service,
                  serviceType: 'Hair Service',
                },
              })),
            },
          }),
        }}
      />

      {/* Beauty Salon Specific Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BeautySalon',
            '@id': 'https://nycayenmoore.com#beautysalon',
            name: businessName,
            description: 'Premier beauty salon specializing in luxury hair artistry and custom wig design',
            image: 'https://nycayenmoore.com/images/salon-interior.jpg',
            address: localBusinessData.address,
            telephone: phone,
            url: 'https://nycayenmoore.com',
            openingHoursSpecification: localBusinessData.openingHoursSpecification,
            geo: localBusinessData.geo,
            priceRange,
            aggregateRating: localBusinessData.aggregateRating,
            sameAs: socialProfiles,
            makesOffer: services.map((service) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: service,
                category: 'Beauty Service',
              },
              seller: {
                '@id': 'https://nycayenmoore.com#localbusiness',
              },
            })),
          }),
        }}
      />

      {/* Organization Structured Data for Brand Recognition */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': 'https://nycayenmoore.com#organization',
            name: businessName,
            url: 'https://nycayenmoore.com',
            logo: 'https://nycayenmoore.com/images/logo.png',
            image: 'https://nycayenmoore.com/images/brand-hero.jpg',
            description: 'Luxury hair artistry and custom wig design studio in New York City',
            foundingDate: '2012',
            founder: {
              '@type': 'Person',
              name: 'Nycayen Moore',
              jobTitle: 'Master Hair Stylist & Wig Artist',
              description: 'Award-winning hair stylist with over 12 years of experience in luxury hair artistry',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: phone,
              contactType: 'customer service',
              email: email,
              availableLanguage: ['English', 'Spanish'],
            },
            sameAs: socialProfiles,
            address: localBusinessData.address,
            hasCredential: [
              {
                '@type': 'EducationalOccupationalCredential',
                credentialCategory: 'Professional Certification',
                name: 'Licensed Cosmetologist',
                recognizedBy: {
                  '@type': 'Organization',
                  name: 'New York State Department of State',
                },
              },
            ],
          }),
        }}
      />

      {/* Event Structured Data for Special Promotions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Event',
            '@id': 'https://nycayenmoore.com#bridal-season-2024',
            name: 'Bridal Season Hair Styling',
            description: 'Expert bridal hair styling services for your special day',
            startDate: '2024-05-01',
            endDate: '2024-10-31',
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: {
              '@id': 'https://nycayenmoore.com#localbusiness',
            },
            organizer: {
              '@id': 'https://nycayenmoore.com#organization',
            },
            offers: {
              '@type': 'Offer',
              name: 'Bridal Hair Styling Package',
              description: 'Complete bridal hair styling including trial and wedding day service',
              price: '350',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />
    </>
  );
}

// Component for embedding Google My Business reviews
export function GoogleMyBusinessReviews({ placeId }: { placeId?: string }) {
  return (
    <div className="google-reviews">
      {/* This would integrate with Google Places API to show real reviews */}
      <div className="text-center text-gray-500 py-8">
        <p>Google My Business reviews integration would go here</p>
        <p className="text-sm">Place ID: {placeId || 'Configure your Google Places ID'}</p>
      </div>
    </div>
  );
}

// Component for local business information display
export function LocalBusinessInfo({
  businessName = 'Nycayen Moore Hair Artistry',
  address,
  phone = '+1-555-NYC-HAIR',
  email = 'info@nycayenmoore.com',
  hours,
}: Partial<LocalSEOProps>) {
  const defaultHours = {
    monday: '09:00-18:00',
    tuesday: '09:00-18:00', 
    wednesday: '09:00-18:00',
    thursday: '09:00-20:00',
    friday: '09:00-20:00',
    saturday: '08:00-18:00',
    sunday: 'CLOSED',
  };

  const businessHours = hours || defaultHours;
  const businessAddress = address || {
    street: '123 Fashion Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
  };

  return (
    <div className="local-business-info bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">{businessName}</h3>
      
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <span className="text-gray-500">📍</span>
          <div>
            <p className="font-medium">Address</p>
            <p className="text-gray-600">
              {businessAddress.street}<br />
              {businessAddress.city}, {businessAddress.state} {businessAddress.zip}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <span className="text-gray-500">📞</span>
          <div>
            <p className="font-medium">Phone</p>
            <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
              {phone}
            </a>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <span className="text-gray-500">✉️</span>
          <div>
            <p className="font-medium">Email</p>
            <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
              {email}
            </a>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <span className="text-gray-500">🕒</span>
          <div>
            <p className="font-medium">Hours</p>
            <div className="text-gray-600 space-y-1">
              {Object.entries(businessHours).map(([day, hrs]) => (
                <div key={day} className="flex justify-between">
                  <span className="capitalize">{day}:</span>
                  <span className={hrs === 'CLOSED' ? 'text-red-500' : ''}>
                    {hrs === 'CLOSED' ? 'Closed' : hrs}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}