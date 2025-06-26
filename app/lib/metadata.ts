import { Metadata } from 'next';
import { SEO_CONFIG, MetadataGenerator, StructuredDataGenerator } from './seo';

export interface PageMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  noindex?: boolean;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  category?: string;
}

export function generateMetadata(page: PageMetadata): Metadata {
  return MetadataGenerator.generatePageMetadata(page);
}

export function generateServiceMetadata(service: {
  name: string;
  description: string;
  price?: number;
  duration?: number;
  category: string;
  image?: string;
}): Metadata {
  return MetadataGenerator.generateServiceMetadata(service);
}

export function generateArticleMetadata(article: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  tags: string[];
  image: string;
  readingTime: number;
  category: string;
}): Metadata {
  return MetadataGenerator.generateArticleMetadata(article);
}

export function generateStructuredData(type: string, data: any): string {
  switch (type) {
    case 'organization':
      return JSON.stringify(StructuredDataGenerator.generateOrganization());
    case 'website':
      return JSON.stringify(StructuredDataGenerator.generateWebsite());
    case 'service':
      return JSON.stringify(StructuredDataGenerator.generateService(data));
    case 'article':
      return JSON.stringify(StructuredDataGenerator.generateArticle(data));
    case 'review':
      return JSON.stringify(StructuredDataGenerator.generateReview(data));
    case 'breadcrumbs':
      return JSON.stringify(StructuredDataGenerator.generateBreadcrumbs(data));
    case 'faq':
      return JSON.stringify(StructuredDataGenerator.generateFAQ(data));
    case 'video':
      return JSON.stringify(StructuredDataGenerator.generateVideo(data));
    default:
      return '{}';
  }
}

// Pre-built metadata for common pages
export const DEFAULT_METADATA = {
  home: generateMetadata({
    title: 'Luxury Hair Artistry & Custom Wig Design in NYC',
    description: 'Transform your beauty vision with Nycayen Moore\'s expert hair artistry, custom wig design, and bridal styling services in NYC. Book your luxury experience today.',
    keywords: ['hair stylist NYC', 'luxury hair salon', 'custom wigs', 'bridal hair', 'hair color specialist'],
    type: 'website'
  }),

  services: generateMetadata({
    title: 'Professional Hair Services - Cuts, Color & Custom Wigs',
    description: 'Discover our full range of luxury hair services including precision cuts, expert color, custom wig design, and bridal styling in NYC.',
    keywords: ['hair services NYC', 'hair cuts', 'hair color', 'custom wigs', 'bridal styling'],
    type: 'service'
  }),

  about: generateMetadata({
    title: 'About Nycayen Moore - Master Hair Stylist & Wig Artist',
    description: 'Meet Nycayen Moore, NYC\'s premier hair stylist with 12+ years of experience in luxury hair artistry, custom wig design, and bridal styling.',
    keywords: ['Nycayen Moore', 'hair stylist biography', 'NYC hair artist', 'wig designer'],
    type: 'person'
  }),

  contact: generateMetadata({
    title: 'Contact & Book Your Appointment',
    description: 'Ready to transform your look? Contact Nycayen Moore Hair Artistry to book your luxury hair styling appointment in NYC.',
    keywords: ['book appointment', 'contact hair stylist', 'NYC hair salon contact'],
    type: 'contact'
  }),

  booking: generateMetadata({
    title: 'Book Your Hair Appointment Online',
    description: 'Schedule your luxury hair styling appointment with Nycayen Moore. Choose from cuts, color, styling, or custom wig consultations.',
    keywords: ['book hair appointment', 'online booking', 'hair salon appointment'],
    type: 'booking'
  }),

  blog: generateMetadata({
    title: 'Hair Care Tips & Style Inspiration Blog',
    description: 'Get the latest hair care tips, styling inspiration, and industry insights from NYC\'s premier hair artistry blog.',
    keywords: ['hair care tips', 'hair styling blog', 'hair inspiration', 'beauty blog'],
    type: 'blog'
  }),

  shop: generateMetadata({
    title: 'Premium Hair Care Products & Accessories',
    description: 'Shop curated hair care products, styling tools, and luxury accessories recommended by professional hair stylists.',
    keywords: ['hair products', 'professional hair care', 'styling tools', 'hair accessories'],
    type: 'product'
  })
};