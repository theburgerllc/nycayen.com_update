import { getAllBlogPosts, getBlogPostBySlug } from '../lib/mdx';
import Fuse from 'fuse.js';
import { 
  BlogPost, 
  BlogCategory, 
  BlogTag, 
  BlogSearchResult, 
  BlogFilterOptions, 
  BlogSortOptions, 
  PaginationOptions, 
  BlogListResponse,
  SocialShareOptions,
  AnalyticsEvent
} from '../types';

export function getAllPosts(): BlogPost[] {
  return getAllBlogPosts();
}

export function getPostBySlug(slug: string): BlogPost | null {
  return getBlogPostBySlug(slug);
}

export function getFeaturedPosts(limit: number = 3): BlogPost[] {
  return getAllPosts()
    .filter(post => post.featured)
    .slice(0, limit);
}

export function getRelatedPosts(currentPost: BlogPost, limit: number = 3): BlogPost[] {
  const allPosts = getAllPosts().filter(post => post.slug !== currentPost.slug);
  
  const relatedPosts = allPosts.filter(post => 
    post.category === currentPost.category || 
    post.tags.some(tag => currentPost.tags.includes(tag))
  );
  
  return relatedPosts.slice(0, limit);
}

export function getAllCategories(): BlogCategory[] {
  const posts = getAllPosts();
  const categoryMap = new Map<string, number>();
  
  posts.forEach(post => {
    const count = categoryMap.get(post.category) || 0;
    categoryMap.set(post.category, count + 1);
  });
  
  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    slug: slugify(name),
    name,
    description: `${count} posts in ${name}`,
    count,
  }));
}

export function getAllTags(): BlogTag[] {
  const posts = getAllPosts();
  const tagMap = new Map<string, number>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => {
      const count = tagMap.get(tag) || 0;
      tagMap.set(tag, count + 1);
    });
  });
  
  return Array.from(tagMap.entries()).map(([name, count]) => ({
    slug: slugify(name),
    name,
    count,
  }));
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter(post => 
    slugify(post.category) === category
  );
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter(post => 
    post.tags.some(postTag => slugify(postTag) === tag)
  );
}

export function searchPosts(query: string, options?: { threshold?: number }): BlogSearchResult[] {
  const posts = getAllPosts();
  const fuse = new Fuse(posts, {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'description', weight: 2 },
      { name: 'content', weight: 1 },
      { name: 'tags', weight: 2 },
      { name: 'category', weight: 1.5 },
    ],
    threshold: options?.threshold || 0.3,
    includeMatches: true,
    includeScore: true,
  });
  
  const results = fuse.search(query);
  
  return results.map(result => ({
    post: result.item,
    score: 1 - (result.score || 0),
    matches: result.matches?.reduce((acc, match) => {
      const key = match.key as keyof BlogSearchResult['matches'];
      if (key && match.indices) {
        acc[key] = match.indices.map(([start, end]) => 
          match.value?.slice(start, end + 1) || ''
        );
      }
      return acc;
    }, {} as BlogSearchResult['matches']) || {},
  }));
}

export function filterPosts(
  posts: BlogPost[], 
  filters: BlogFilterOptions
): BlogPost[] {
  let filteredPosts = [...posts];
  
  if (filters.category) {
    filteredPosts = filteredPosts.filter(post => 
      slugify(post.category) === filters.category
    );
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filteredPosts = filteredPosts.filter(post =>
      filters.tags!.some(tag => 
        post.tags.some(postTag => slugify(postTag) === tag)
      )
    );
  }
  
  if (filters.author) {
    filteredPosts = filteredPosts.filter(post =>
      slugify(post.author.name) === filters.author
    );
  }
  
  if (filters.featured !== undefined) {
    filteredPosts = filteredPosts.filter(post => post.featured === filters.featured);
  }
  
  if (filters.dateRange) {
    filteredPosts = filteredPosts.filter(post => {
      const postDate = new Date(post.publishedAt);
      return postDate >= filters.dateRange!.start && postDate <= filters.dateRange!.end;
    });
  }
  
  return filteredPosts;
}

export function sortPosts(posts: BlogPost[], sort: BlogSortOptions): BlogPost[] {
  const sortedPosts = [...posts];
  
  sortedPosts.sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sort.field) {
      case 'publishedAt':
        aValue = new Date(a.publishedAt).getTime();
        bValue = new Date(b.publishedAt).getTime();
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'readingTime':
        aValue = a.readingTime;
        bValue = b.readingTime;
        break;
      case 'popularity':
        aValue = 0;
        bValue = 0;
        break;
      default:
        return 0;
    }
    
    if (sort.direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
  
  return sortedPosts;
}

export function paginatePosts(
  posts: BlogPost[], 
  pagination: PaginationOptions
): BlogListResponse {
  const totalCount = posts.length;
  const totalPages = Math.ceil(totalCount / pagination.limit);
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedPosts = posts.slice(startIndex, endIndex);
  
  return {
    posts: paginatedPosts,
    totalCount,
    totalPages,
    currentPage: pagination.page,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function formatDate(date: Date, format: 'short' | 'long' | 'iso' = 'long'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    case 'iso':
      return date.toISOString();
    default:
      return date.toLocaleDateString();
  }
}

export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length).trim() + suffix;
}

export function generateExcerpt(content: string, maxLength: number = 160): string {
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  
  return truncateText(cleanContent, maxLength);
}

export function getSocialShareUrl(platform: string, options: SocialShareOptions): string {
  const encodedUrl = encodeURIComponent(options.url);
  const encodedTitle = encodeURIComponent(options.title);
  const encodedDescription = encodeURIComponent(options.description);
  
  const baseUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };
  
  return baseUrls[platform as keyof typeof baseUrls] || '';
}

export function trackAnalyticsEvent(event: AnalyticsEvent): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.customParameters,
    });
  }
}

export function generateStructuredData(post: BlogPost, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: `${siteUrl}${post.coverImage.src}`,
    datePublished: post.publishedAt.toISOString(),
    dateModified: (post.updatedAt || post.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
      ...(post.author.bio && { description: post.author.bio }),
      ...(post.author.avatar && { image: post.author.avatar }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nycayen Hair Artistry',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}${post.url}`,
    },
    wordCount: post.wordCount,
    articleSection: post.category,
    keywords: post.tags.join(', '),
  };
}

export function generateOGImage(title: string, category: string): string {
  const params = new URLSearchParams({
    title,
    category,
  });
  
  return `/api/og?${params.toString()}`;
}