'use client';

import { StructuredDataGenerator } from '../lib/seo';

interface StructuredDataProps {
  data: any;
  type: 'organization' | 'website' | 'service' | 'article' | 'review' | 'breadcrumbs' | 'faq' | 'video' | 'localbusiness';
}

export function StructuredData({ data, type }: StructuredDataProps) {
  let structuredData: any;

  switch (type) {
    case 'organization':
      structuredData = StructuredDataGenerator.generateOrganization();
      break;
    case 'website':
      structuredData = StructuredDataGenerator.generateWebsite();
      break;
    case 'service':
      structuredData = StructuredDataGenerator.generateService(data);
      break;
    case 'article':
      structuredData = StructuredDataGenerator.generateArticle(data);
      break;
    case 'review':
      structuredData = StructuredDataGenerator.generateReview(data);
      break;
    case 'breadcrumbs':
      structuredData = StructuredDataGenerator.generateBreadcrumbs(data);
      break;
    case 'faq':
      structuredData = StructuredDataGenerator.generateFAQ(data);
      break;
    case 'video':
      structuredData = StructuredDataGenerator.generateVideo(data);
      break;
    case 'localbusiness':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': 'https://nycayenmoore.com#localbusiness',
        name: 'Nycayen Moore Hair Artistry',
        image: 'https://nycayenmoore.com/images/studio.jpg',
        telephone: '+1-555-NYC-HAIR',
        email: 'info@nycayenmoore.com',
        url: 'https://nycayenmoore.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '123 Fashion Avenue',
          addressLocality: 'New York',
          addressRegion: 'NY',
          postalCode: '10001',
          addressCountry: 'US',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 40.7505,
          longitude: -73.9934,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday'],
            opens: '09:00',
            closes: '18:00',
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Friday', 'Saturday'],
            opens: '09:00',
            closes: '20:00',
          },
        ],
        priceRange: '$$$',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: 4.9,
          reviewCount: 247,
          bestRating: 5,
          worstRating: 1,
        },
        serviceArea: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 40.7505,
            longitude: -73.9934,
          },
          geoRadius: '50000',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Hair Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Hair Cut & Styling',
                description: 'Professional hair cutting and styling services',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Hair Color',
                description: 'Expert hair coloring and highlighting services',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Custom Wig Design',
                description: 'Bespoke wig design and fitting services',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Bridal Hair Styling',
                description: 'Wedding and special event hair styling',
              },
            },
          ],
        },
        ...data,
      };
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Specific components for common use cases
export function OrganizationStructuredData() {
  return <StructuredData type="organization" data={{}} />;
}

export function WebsiteStructuredData() {
  return <StructuredData type="website" data={{}} />;
}

export function LocalBusinessStructuredData() {
  return <StructuredData type="localbusiness" data={{}} />;
}

export function ServiceStructuredData({ service }: { service: any }) {
  return <StructuredData type="service" data={service} />;
}

export function ArticleStructuredData({ article }: { article: any }) {
  return <StructuredData type="article" data={article} />;
}

export function ReviewStructuredData({ review }: { review: any }) {
  return <StructuredData type="review" data={review} />;
}

export function BreadcrumbsStructuredData({ items }: { items: { name: string; url: string }[] }) {
  return <StructuredData type="breadcrumbs" data={items} />;
}

export function FAQStructuredData({ questions }: { questions: { question: string; answer: string }[] }) {
  return <StructuredData type="faq" data={questions} />;
}

export function VideoStructuredData({ video }: { video: any }) {
  return <StructuredData type="video" data={video} />;
}