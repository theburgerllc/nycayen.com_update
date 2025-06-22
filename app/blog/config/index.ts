import { BlogConfig } from '../types';

export const BLOG_CONFIG: BlogConfig = {
  postsPerPage: 12,
  featuredPostsCount: 3,
  relatedPostsCount: 3,
  excerptLength: 160,
  enableComments: true,
  enableNewsletter: true,
  enableSocialSharing: true,
  enableSearch: true,
  enableAnalytics: true,
};

export const SITE_CONFIG = {
  name: 'Nycayen Hair Artistry',
  description: 'NYC\'s premier hair artistry and luxury wig design studio',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nycayen.com',
  ogImage: '/og-image.jpg',
  links: {
    instagram: 'https://instagram.com/nycayen',
    twitter: 'https://twitter.com/nycayen',
    linkedin: 'https://linkedin.com/company/nycayen',
  },
};

export const AUTHOR_CONFIG = {
  name: 'Nycayen Moore',
  bio: 'Master hair artist and luxury wig designer based in New York City. Specializing in custom hair solutions and avant-garde styling.',
  avatar: '/images/author-avatar.jpg',
  social: {
    instagram: 'nycayen',
    twitter: 'nycayen',
    linkedin: 'nycayen-moore',
  },
};

export const NAVIGATION_CONFIG = {
  mainNav: [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/#services' },
    { name: 'Portfolio', href: '/#portfolio' },
    { name: 'Blog', href: '/blog' },
    { name: 'Shop', href: '/shop' },
    { name: 'Book Now', href: '/booking' },
  ],
  blogNav: [
    { name: 'All Posts', href: '/blog' },
    { name: 'Hair Care', href: '/blog/category/hair-care' },
    { name: 'Styling Tips', href: '/blog/category/styling-tips' },
    { name: 'Trends', href: '/blog/category/trends' },
    { name: 'Tutorials', href: '/blog/category/tutorials' },
  ],
};

export const SEO_CONFIG = {
  defaultTitle: 'Nycayen Hair Artistry Blog',
  titleTemplate: '%s | Nycayen Hair Artistry',
  defaultDescription: 'Discover the latest hair trends, styling tips, and professional insights from NYC\'s premier hair artistry studio.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://nycayen.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nycayen.com',
    siteName: 'Nycayen Hair Artistry',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nycayen Hair Artistry',
      },
    ],
  },
  twitter: {
    handle: '@nycayen',
    site: '@nycayen',
    cardType: 'summary_large_image',
  },
};