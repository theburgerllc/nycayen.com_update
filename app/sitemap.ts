// Enhanced Dynamic Sitemap Generation
import { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories, getAllTags } from './blog/utils';
import { SEO_CONFIG } from './lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || SEO_CONFIG.SITE.URL;
  
  // Get dynamic content
  const posts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  // Main site pages (highest priority)
  const mainPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Service pages (high priority)
  const servicePages = [
    {
      url: `${baseUrl}/services/cuts`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/color`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/wigs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/bridal`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/extensions`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/treatments`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  // Shop pages
  const shopPages = [
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shop/hair-care`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shop/styling-tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shop/accessories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
  ];

  // Blog pages
  const blogPages = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ];

  // Information pages
  const infoPages = [
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    },
  ];

  // Legal pages (lower priority)
  const legalPages = [
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic blog posts
  const blogPosts = posts.map(post => ({
    url: `${baseUrl}${post.url}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic blog categories
  const categoryPages = categories.map(category => ({
    url: `${baseUrl}/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Dynamic blog tags
  const tagPages = tags.map(tag => ({
    url: `${baseUrl}/blog/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }));

  // Individual service pages (these would be dynamically generated)
  const individualServices = getIndividualServices().map(service => ({
    url: `${baseUrl}/services/${service.category}/${service.slug}`,
    lastModified: new Date(service.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Product pages (these would be dynamically generated)
  const productPages = getProducts().map(product => ({
    url: `${baseUrl}/shop/${product.category}/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  // Portfolio/gallery pages
  const portfolioPages = getPortfolioCategories().map(category => ({
    url: `${baseUrl}/gallery/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    ...mainPages,
    ...servicePages,
    ...shopPages,
    ...blogPages,
    ...infoPages,
    ...legalPages,
    ...blogPosts,
    ...categoryPages,
    ...tagPages,
    ...individualServices,
    ...productPages,
    ...portfolioPages,
  ];
}

// Helper functions to get dynamic content
// In a real application, these would fetch from your database/CMS
function getIndividualServices() {
  return [
    {
      slug: 'precision-cut',
      category: 'cuts',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      slug: 'balayage',
      category: 'color',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      slug: 'custom-wig',
      category: 'wigs',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      slug: 'bridal-updo',
      category: 'bridal',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];
}

function getProducts() {
  return [
    {
      slug: 'premium-shampoo',
      category: 'hair-care',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      slug: 'professional-blow-dryer',
      category: 'styling-tools',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      slug: 'silk-hair-ties',
      category: 'accessories',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];
}

function getPortfolioCategories() {
  return [
    { slug: 'cuts', name: 'Hair Cuts' },
    { slug: 'color', name: 'Hair Color' },
    { slug: 'wigs', name: 'Custom Wigs' },
    { slug: 'bridal', name: 'Bridal Styles' },
    { slug: 'before-after', name: 'Transformations' },
  ];
}