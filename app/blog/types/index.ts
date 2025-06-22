import { z } from 'zod';

export const BlogPostFrontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  publishedAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)).optional(),
  author: z.object({
    name: z.string(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    social: z.object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
    }).optional(),
  }),
  category: z.string(),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  coverImage: z.object({
    src: z.string(),
    alt: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    canonicalUrl: z.string().optional(),
  }).optional(),
  readingTime: z.number().optional(),
  wordCount: z.number().optional(),
});

export type BlogPostFrontmatter = z.infer<typeof BlogPostFrontmatterSchema>;

export interface BlogPost {
  slug: string;
  url: string;
  title: string;
  description: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: Author;
  category: string;
  tags: string[];
  featured: boolean;
  draft: boolean;
  coverImage: CoverImage;
  seo?: SEOMetadata;
  readingTime: number;
  wordCount: number;
  content: string;
  excerpt: string;
  tableOfContents: TableOfContentsItem[];
}

export interface Author {
  name: string;
  bio?: string;
  avatar?: string;
  social?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface CoverImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  count: number;
}

export interface BlogTag {
  slug: string;
  name: string;
  count: number;
}

export interface BlogSearchResult {
  post: BlogPost;
  score: number;
  matches: {
    title?: string[];
    description?: string[];
    content?: string[];
    tags?: string[];
  };
}

export interface BlogFilterOptions {
  category?: string;
  tags?: string[];
  author?: string;
  featured?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface BlogSortOptions {
  field: 'publishedAt' | 'title' | 'readingTime' | 'popularity';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface BlogListResponse {
  posts: BlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BlogConfig {
  postsPerPage: number;
  featuredPostsCount: number;
  relatedPostsCount: number;
  excerptLength: number;
  enableComments: boolean;
  enableNewsletter: boolean;
  enableSocialSharing: boolean;
  enableSearch: boolean;
  enableAnalytics: boolean;
}

export interface SocialShareOptions {
  url: string;
  title: string;
  description: string;
  image?: string;
  hashtags?: string[];
}

export interface CommentSystem {
  provider: 'disqus' | 'utterances' | 'giscus' | 'custom';
  config: Record<string, any>;
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}

export interface NewsletterSubscription {
  email: string;
  name?: string;
  preferences?: {
    frequency: 'weekly' | 'monthly';
    categories?: string[];
  };
}

export interface BlogSitemap {
  posts: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }>;
}

export interface RSSFeed {
  title: string;
  description: string;
  link: string;
  lastBuildDate: Date;
  items: Array<{
    title: string;
    description: string;
    link: string;
    pubDate: Date;
    author: string;
    category: string;
    guid: string;
  }>;
}