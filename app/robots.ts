// Dynamic Robots.txt Generation
import { MetadataRoute } from 'next';
import { SEO_CONFIG } from './lib/seo';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || SEO_CONFIG.SITE.URL;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Block everything in non-production environments
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/checkout/',
          '/booking/processing/',
          '/booking/success/',
          '/shop/cart/',
          '/shop/checkout/',
          '/search/',
          '/*.json$',
          '/*?*',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
      // Allow specific crawlers for images
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/', '/gallery/'],
        disallow: '/admin/',
      },
      // Social media crawlers
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}