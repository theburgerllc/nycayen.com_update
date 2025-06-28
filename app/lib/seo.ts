// Comprehensive SEO System

import { z } from 'zod';

// SEO Configuration
export const SEO_CONFIG = {
  // Site Information
  SITE: {
    NAME: 'NYC Ayen Moore - Luxury Hair Artistry',
    DESCRIPTION: 'Premium hair artistry, custom wigs, and bridal styling in NYC. Elevate your beauty with expert hair color, cuts, and luxury wig designs.',
    URL: 'https://nycayenmoore.com',
    LOGO: '/images/logo.png',
    IMAGE: '/images/social-share.jpg',
    LOCALE: 'en_US',
    TYPE: 'website',
  },
  // Business Information
  BUSINESS: {
    NAME: 'NYC Ayen Moore Hair Studio',
    TYPE: 'HairSalon',
    ADDRESS: {
      STREET: '123 Fashion Avenue',
      CITY: 'New York',
      STATE: 'NY',
      ZIP: '10001',
      COUNTRY: 'US',
    },
    PHONE: '+1-555-NYC-HAIR',
    EMAIL: 'info@nycayenmoore.com',
    HOURS: {
      MONDAY: '09:00-18:00',
      TUESDAY: '09:00-18:00',
      WEDNESDAY: '09:00-18:00',
      THURSDAY: '09:00-20:00',
      FRIDAY: '09:00-20:00',
      SATURDAY: '08:00-18:00',
      SUNDAY: 'CLOSED',
    },
    SOCIAL: {
      INSTAGRAM: 'https://instagram.com/nycayenmoore',
      FACEBOOK: 'https://facebook.com/nycayenmoore',
      TIKTOK: 'https://tiktok.com/@nycayenmoore',
      YOUTUBE: 'https://youtube.com/@nycayenmoore',
    },
    PRICE_RANGE: '$$$',
    RATING: 4.9,
    REVIEW_COUNT: 247,
  },
  // SEO Settings
  SETTINGS: {
    ROBOTS: 'index,follow',
    CANONICAL_DOMAIN: 'nycayenmoore.com',
    DEFAULT_IMAGE: '/images/default-social.jpg',
    TWITTER_SITE: '@nycayenmoore',
    SITEMAP_URL: '/sitemap.xml',
    ROBOTS_URL: '/robots.txt',
  },
  // Content Limits
  LIMITS: {
    TITLE_MAX: 60,
    DESCRIPTION_MAX: 160,
    KEYWORDS_MAX: 10,
    ALT_TEXT_MAX: 125,
  },
};

// SEO Schemas
export const SEOSchemas = {
  metadata: z.object({
    title: z.string().min(1).max(SEO_CONFIG.LIMITS.TITLE_MAX),
    description: z.string().min(1).max(SEO_CONFIG.LIMITS.DESCRIPTION_MAX),
    keywords: z.array(z.string()).max(SEO_CONFIG.LIMITS.KEYWORDS_MAX).optional(),
    image: z.string().url().optional(),
    canonical: z.string().url().optional(),
    noindex: z.boolean().optional(),
    nofollow: z.boolean().optional(),
  }),

  article: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    publishedTime: z.string(),
    modifiedTime: z.string().optional(),
    tags: z.array(z.string()),
    image: z.string().url(),
    readingTime: z.number(),
    category: z.string(),
  }),

  service: z.object({
    name: z.string(),
    description: z.string(),
    price: z.number().optional(),
    duration: z.number().optional(),
    category: z.string(),
    image: z.string().url().optional(),
    availability: z.string().optional(),
  }),

  review: z.object({
    author: z.string(),
    rating: z.number().min(1).max(5),
    text: z.string(),
    date: z.string(),
    verified: z.boolean().optional(),
  }),
};

// Dynamic Metadata Generator
export class MetadataGenerator {
  static generatePageMetadata(page: {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string[];
    canonical?: string;
    noindex?: boolean;
    type?: string;
  }) {
    const title = page.title 
      ? `${page.title} | ${SEO_CONFIG.SITE.NAME}`
      : SEO_CONFIG.SITE.NAME;
    
    const description = page.description || SEO_CONFIG.SITE.DESCRIPTION;
    const image = page.image || SEO_CONFIG.SITE.IMAGE;
    const canonical = page.canonical || SEO_CONFIG.SITE.URL;
    
    return {
      title,
      description,
      keywords: page.keywords?.join(', '),
      robots: page.noindex ? 'noindex,nofollow' : SEO_CONFIG.SETTINGS.ROBOTS,
      canonical,
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: SEO_CONFIG.SITE.NAME,
        images: [{
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }],
        locale: SEO_CONFIG.SITE.LOCALE,
        type: page.type || 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
        creator: SEO_CONFIG.SETTINGS.TWITTER_SITE,
        site: SEO_CONFIG.SETTINGS.TWITTER_SITE,
      },
      alternates: {
        canonical,
      },
    };
  }

  static generateServiceMetadata(service: z.infer<typeof SEOSchemas.service>) {
    const title = `${service.name} - Professional Hair Services`;
    const description = service.description;
    const priceText = service.price ? ` Starting at $${service.price}` : '';
    
    return this.generatePageMetadata({
      title,
      description: `${description}${priceText}. Book your appointment today!`,
      keywords: [service.name, service.category, 'hair salon', 'NYC', 'professional'],
      image: service.image,
      type: 'service',
    });
  }

  static generateArticleMetadata(article: z.infer<typeof SEOSchemas.article>) {
    return {
      ...this.generatePageMetadata({
        title: article.title,
        description: article.description,
        keywords: article.tags,
        image: article.image,
        type: 'article',
      }),
      openGraph: {
        ...this.generatePageMetadata({}).openGraph,
        type: 'article',
        publishedTime: article.publishedTime,
        modifiedTime: article.modifiedTime,
        authors: [article.author],
        tags: article.tags,
      },
      other: {
        'article:author': article.author,
        'article:published_time': article.publishedTime,
        'article:modified_time': article.modifiedTime,
        'article:section': article.category,
        'article:tag': article.tags.join(','),
      },
    };
  }
}

// Structured Data (JSON-LD) Generator
export class StructuredDataGenerator {
  static generateOrganization() {
    return {
      '@context': 'https://schema.org',
      '@type': 'HairSalon',
      '@id': `${SEO_CONFIG.SITE.URL}#organization`,
      name: SEO_CONFIG.BUSINESS.NAME,
      url: SEO_CONFIG.SITE.URL,
      logo: `${SEO_CONFIG.SITE.URL}${SEO_CONFIG.SITE.LOGO}`,
      image: `${SEO_CONFIG.SITE.URL}${SEO_CONFIG.SITE.IMAGE}`,
      description: SEO_CONFIG.SITE.DESCRIPTION,
      telephone: SEO_CONFIG.BUSINESS.PHONE,
      email: SEO_CONFIG.BUSINESS.EMAIL,
      priceRange: SEO_CONFIG.BUSINESS.PRICE_RANGE,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SEO_CONFIG.BUSINESS.ADDRESS.STREET,
        addressLocality: SEO_CONFIG.BUSINESS.ADDRESS.CITY,
        addressRegion: SEO_CONFIG.BUSINESS.ADDRESS.STATE,
        postalCode: SEO_CONFIG.BUSINESS.ADDRESS.ZIP,
        addressCountry: SEO_CONFIG.BUSINESS.ADDRESS.COUNTRY,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.7505, // NYC coordinates
        longitude: -73.9934,
      },
      openingHoursSpecification: Object.entries(SEO_CONFIG.BUSINESS.HOURS).map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
        opens: hours === 'CLOSED' ? null : hours.split('-')[0],
        closes: hours === 'CLOSED' ? null : hours.split('-')[1],
      })),
      sameAs: Object.values(SEO_CONFIG.BUSINESS.SOCIAL),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: SEO_CONFIG.BUSINESS.RATING,
        reviewCount: SEO_CONFIG.BUSINESS.REVIEW_COUNT,
        bestRating: 5,
        worstRating: 1,
      },
    };
  }

  static generateWebsite() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SEO_CONFIG.SITE.URL}#website`,
      url: SEO_CONFIG.SITE.URL,
      name: SEO_CONFIG.SITE.NAME,
      description: SEO_CONFIG.SITE.DESCRIPTION,
      publisher: {
        '@id': `${SEO_CONFIG.SITE.URL}#organization`,
      },
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SEO_CONFIG.SITE.URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      ],
    };
  }

  static generateService(service: z.infer<typeof SEOSchemas.service>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: {
        '@id': `${SEO_CONFIG.SITE.URL}#organization`,
      },
      areaServed: {
        '@type': 'City',
        name: 'New York City',
      },
      ...(service.price && {
        offers: {
          '@type': 'Offer',
          price: service.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      }),
      ...(service.image && {
        image: service.image,
      }),
    };
  }

  static generateArticle(article: z.infer<typeof SEOSchemas.article>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: article.image,
      datePublished: article.publishedTime,
      dateModified: article.modifiedTime || article.publishedTime,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      publisher: {
        '@id': `${SEO_CONFIG.SITE.URL}#organization`,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': SEO_CONFIG.SITE.URL,
      },
      keywords: article.tags.join(', '),
      articleSection: article.category,
      wordCount: Math.ceil(article.readingTime * 200), // Estimate based on reading time
    };
  }

  static generateReview(review: z.infer<typeof SEOSchemas.review>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.text,
      datePublished: review.date,
      itemReviewed: {
        '@id': `${SEO_CONFIG.SITE.URL}#organization`,
      },
      ...(review.verified && {
        publisher: {
          '@type': 'Organization',
          name: 'Verified Review',
        },
      }),
    };
  }

  static generateBreadcrumbs(items: { name: string; url: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }

  static generateFAQ(questions: { question: string; answer: string }[]) {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map(qa => ({
        '@type': 'Question',
        name: qa.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: qa.answer,
        },
      })),
    };
  }

  static generateVideo(video: {
    name: string;
    description: string;
    thumbnailUrl: string;
    uploadDate: string;
    duration: string;
    contentUrl: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: video.name,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      uploadDate: video.uploadDate,
      duration: video.duration,
      contentUrl: video.contentUrl,
      embedUrl: video.contentUrl,
      publisher: {
        '@id': `${SEO_CONFIG.SITE.URL}#organization`,
      },
    };
  }
}

// Sitemap Generator
export class SitemapGenerator {
  static generateSitemap(pages: {
    url: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }[]) {
    const urls = pages.map(page => {
      const url = page.url.startsWith('http') ? page.url : `${SEO_CONFIG.SITE.URL}${page.url}`;
      return `
    <url>
      <loc>${url}</loc>
      ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
      ${page.changefreq ? `<changefreq>${page.changefreq}</changefreq>` : ''}
      ${page.priority ? `<priority>${page.priority}</priority>` : ''}
    </url>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
  }

  static generateRobotsTxt(options: {
    userAgent?: string;
    disallow?: string[];
    allow?: string[];
    crawlDelay?: number;
    sitemap?: string;
  } = {}) {
    const {
      userAgent = '*',
      disallow = ['/admin', '/api', '/_next'],
      allow = [],
      crawlDelay,
      sitemap = `${SEO_CONFIG.SITE.URL}/sitemap.xml`,
    } = options;

    let robotsTxt = `User-agent: ${userAgent}\n`;
    
    disallow.forEach(path => {
      robotsTxt += `Disallow: ${path}\n`;
    });
    
    allow.forEach(path => {
      robotsTxt += `Allow: ${path}\n`;
    });
    
    if (crawlDelay) {
      robotsTxt += `Crawl-delay: ${crawlDelay}\n`;
    }
    
    robotsTxt += `\nSitemap: ${sitemap}\n`;
    
    return robotsTxt;
  }
}

// SEO Analysis and Optimization
export class SEOAnalyzer {
  static analyzePage(content: {
    title: string;
    description: string;
    content: string;
    images: { src: string; alt?: string }[];
    links: { href: string; text: string; internal: boolean }[];
    headings: { level: number; text: string }[];
  }) {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Title analysis
    if (content.title.length > SEO_CONFIG.LIMITS.TITLE_MAX) {
      issues.push(`Title is too long (${content.title.length} chars, max ${SEO_CONFIG.LIMITS.TITLE_MAX})`);
    } else if (content.title.length < 30) {
      warnings.push('Title is quite short, consider adding more descriptive keywords');
    }

    // Description analysis
    if (content.description.length > SEO_CONFIG.LIMITS.DESCRIPTION_MAX) {
      issues.push(`Description is too long (${content.description.length} chars, max ${SEO_CONFIG.LIMITS.DESCRIPTION_MAX})`);
    } else if (content.description.length < 120) {
      warnings.push('Description is short, consider expanding with more details');
    }

    // Heading structure
    const h1Count = content.headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push('Missing H1 heading');
    } else if (h1Count > 1) {
      warnings.push('Multiple H1 headings found, consider using H2-H6 for subheadings');
    }

    // Image optimization
    const imagesWithoutAlt = content.images.filter(img => !img.alt || img.alt.trim() === '');
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    // Internal linking
    const internalLinks = content.links.filter(link => link.internal);
    const externalLinks = content.links.filter(link => !link.internal);
    
    if (internalLinks.length < 3) {
      recommendations.push('Consider adding more internal links to improve site navigation');
    }

    // Content length
    const wordCount = content.content.split(/\s+/).length;
    if (wordCount < 300) {
      warnings.push(`Content is quite short (${wordCount} words), consider expanding for better SEO`);
    }

    // Keyword density analysis
    const keywordDensity = this.analyzeKeywordDensity(content.content);
    const highDensityKeywords = Object.entries(keywordDensity).filter(([, density]) => density > 0.03);
    
    if (highDensityKeywords.length > 0) {
      warnings.push('Some keywords may be over-optimized, consider natural language variation');
    }

    return {
      score: this.calculateSEOScore(issues, warnings),
      issues,
      warnings,
      recommendations,
      stats: {
        titleLength: content.title.length,
        descriptionLength: content.description.length,
        wordCount,
        imageCount: content.images.length,
        imagesWithAlt: content.images.length - imagesWithoutAlt.length,
        internalLinks: internalLinks.length,
        externalLinks: externalLinks.length,
        h1Count,
        headingCount: content.headings.length,
      },
    };
  }

  private static analyzeKeywordDensity(content: string): Record<string, number> {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const totalWords = words.length;
    const wordCount: Record<string, number> = {};

    // Count word occurrences
    words.forEach(word => {
      if (word.length > 3) { // Only count significant words
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // Calculate density
    const density: Record<string, number> = {};
    Object.entries(wordCount).forEach(([word, count]) => {
      density[word] = count / totalWords;
    });

    return density;
  }

  private static calculateSEOScore(issues: string[], warnings: string[]): number {
    let score = 100;
    score -= issues.length * 10; // -10 points per issue
    score -= warnings.length * 5; // -5 points per warning
    return Math.max(0, score);
  }

  static generateKeywords(content: string, title: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    ]);

    const text = `${title} ${content}`.toLowerCase();
    const words = text.match(/\b\w+\b/g) || [];
    
    // Count significant words
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, SEO_CONFIG.LIMITS.KEYWORDS_MAX)
      .map(([word]) => word);
  }
}

// Local SEO Helper
export class LocalSEO {
  static generateLocalBusinessData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${SEO_CONFIG.SITE.URL}#localbusiness`,
      name: SEO_CONFIG.BUSINESS.NAME,
      image: `${SEO_CONFIG.SITE.URL}${SEO_CONFIG.SITE.IMAGE}`,
      telephone: SEO_CONFIG.BUSINESS.PHONE,
      email: SEO_CONFIG.BUSINESS.EMAIL,
      url: SEO_CONFIG.SITE.URL,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SEO_CONFIG.BUSINESS.ADDRESS.STREET,
        addressLocality: SEO_CONFIG.BUSINESS.ADDRESS.CITY,
        addressRegion: SEO_CONFIG.BUSINESS.ADDRESS.STATE,
        postalCode: SEO_CONFIG.BUSINESS.ADDRESS.ZIP,
        addressCountry: SEO_CONFIG.BUSINESS.ADDRESS.COUNTRY,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.7505,
        longitude: -73.9934,
      },
      openingHoursSpecification: Object.entries(SEO_CONFIG.BUSINESS.HOURS).map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
        opens: hours === 'CLOSED' ? null : hours.split('-')[0],
        closes: hours === 'CLOSED' ? null : hours.split('-')[1],
      })),
      priceRange: SEO_CONFIG.BUSINESS.PRICE_RANGE,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: SEO_CONFIG.BUSINESS.RATING,
        reviewCount: SEO_CONFIG.BUSINESS.REVIEW_COUNT,
      },
    };
  }

  static generateCitations() {
    return [
      {
        platform: 'Google My Business',
        url: 'https://business.google.com',
        importance: 'critical',
      },
      {
        platform: 'Yelp',
        url: 'https://yelp.com',
        importance: 'high',
      },
      {
        platform: 'Facebook',
        url: SEO_CONFIG.BUSINESS.SOCIAL.FACEBOOK,
        importance: 'high',
      },
      {
        platform: 'Foursquare',
        url: 'https://foursquare.com',
        importance: 'medium',
      },
      {
        platform: 'Yellow Pages',
        url: 'https://yellowpages.com',
        importance: 'medium',
      },
    ];
  }
}

// Performance Monitoring for SEO
export class SEOPerformanceMonitor {
  static trackSEOMetrics() {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals impact on SEO
    this.trackCoreWebVitals();
    
    // Track structured data errors
    this.trackStructuredDataErrors();
    
    // Track mobile usability
    this.trackMobileUsability();
    
    // Track page indexability
    this.trackIndexability();
  }

  private static trackCoreWebVitals() {
    // This would integrate with the performance monitoring from analytics
    // Track how Core Web Vitals affect search rankings
  }

  private static trackStructuredDataErrors() {
    // Monitor for structured data parsing errors
    if ('structuredClone' in window) {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach((script, index) => {
        try {
          JSON.parse(script.textContent || '');
        } catch (error) {
          console.error(`Structured data error in script ${index + 1}:`, error);
        }
      });
    }
  }

  private static trackMobileUsability() {
    const viewport = document.querySelector('meta[name="viewport"]');
    const isResponsive = viewport?.getAttribute('content')?.includes('width=device-width');
    
    if (!isResponsive) {
      console.warn('Missing or incorrect viewport meta tag for mobile SEO');
    }
  }

  private static trackIndexability() {
    const robots = document.querySelector('meta[name="robots"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
      console.warn('Missing canonical URL');
    }
    
    if (robots?.getAttribute('content')?.includes('noindex')) {
      console.info('Page set to noindex');
    }
  }
}

// Main SEO Manager
export const SEO = {
  Config: SEO_CONFIG,
  Schemas: SEOSchemas,
  Metadata: MetadataGenerator,
  StructuredData: StructuredDataGenerator,
  Sitemap: SitemapGenerator,
  Analyzer: SEOAnalyzer,
  Local: LocalSEO,
  Performance: SEOPerformanceMonitor,
};

export default SEO;