import { getAllBlogPosts, getBlogPostBySlug, BlogPost } from '../lib/mdx';

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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Define default categories
export const DEFAULT_CATEGORIES = [
  {
    slug: 'hair-care',
    name: 'Hair Care',
    description: 'Essential tips and techniques for maintaining healthy, beautiful hair',
    count: 0,
  },
  {
    slug: 'styling-tips',
    name: 'Styling Tips',
    description: 'Professional styling techniques and everyday hair tips',
    count: 0,
  },
  {
    slug: 'trends',
    name: 'Trends',
    description: 'Latest hair trends and seasonal style inspirations',
    count: 0,
  },
  {
    slug: 'tutorials',
    name: 'Tutorials',
    description: 'Step-by-step guides for achieving salon-quality results at home',
    count: 0,
  },
  {
    slug: 'wigs',
    name: 'Wig Design',
    description: 'Custom wig design, styling, and maintenance guides',
    count: 0,
  },
];

export function getAllCategories() {
  const posts = getAllPosts();
  const categoryMap = new Map();
  
  // Initialize with default categories
  DEFAULT_CATEGORIES.forEach(cat => {
    categoryMap.set(cat.slug, { ...cat, count: 0 });
  });
  
  // Count posts for each category
  posts.forEach(post => {
    const categorySlug = slugify(post.category);
    if (categoryMap.has(categorySlug)) {
      const category = categoryMap.get(categorySlug);
      category.count++;
    } else {
      // Add unknown categories
      categoryMap.set(categorySlug, {
        slug: categorySlug,
        name: post.category,
        description: `Posts about ${post.category.toLowerCase()}`,
        count: 1,
      });
    }
  });
  
  return Array.from(categoryMap.values());
}

export function getCategoryBySlug(slug: string) {
  const categories = getAllCategories();
  return categories.find(cat => cat.slug === slug) || null;
}

export function getAllTags() {
  const posts = getAllPosts();
  const tags = posts.flatMap(post => post.tags);
  return Array.from(new Set(tags));
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

export function formatDate(date: Date | string, format: 'short' | 'long' | 'iso' = 'long'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    case 'iso':
      return dateObj.toISOString();
    default:
      return dateObj.toLocaleDateString();
  }
}

export function searchPosts(query: string): BlogPost[] {
  const posts = getAllPosts();
  const lowercaseQuery = query.toLowerCase();
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.description.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    post.category.toLowerCase().includes(lowercaseQuery)
  );
}

export function sortPosts(posts: BlogPost[], field: string = 'date', direction: 'asc' | 'desc' = 'desc'): BlogPost[] {
  return [...posts].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (field) {
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
}

export function paginatePosts(posts: BlogPost[], page: number = 1, limit: number = 10) {
  const totalCount = posts.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = posts.slice(startIndex, endIndex);
  
  return {
    posts: paginatedPosts,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function filterPosts(posts: BlogPost[], filters: any): BlogPost[] {
  let filteredPosts = [...posts];
  
  if (filters.category) {
    filteredPosts = filteredPosts.filter(post => 
      slugify(post.category) === filters.category
    );
  }
  
  if (filters.tags && filters.tags.length > 0) {
    filteredPosts = filteredPosts.filter(post =>
      filters.tags.some((tag: string) => 
        post.tags.some(postTag => slugify(postTag) === tag)
      )
    );
  }
  
  if (filters.featured !== undefined) {
    filteredPosts = filteredPosts.filter(post => post.featured === filters.featured);
  }
  
  return filteredPosts;
}

export function getSocialShareUrl(platform: string, options: { url: string; title: string; description: string }): string {
  const encodedUrl = encodeURIComponent(options.url);
  const encodedTitle = encodeURIComponent(options.title);
  const encodedDescription = encodeURIComponent(options.description);
  
  const baseUrls: Record<string, string> = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`,
  };
  
  return baseUrls[platform] || '';
}

export function generateStructuredData(post: BlogPost, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.author.image,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
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
      '@id': `${siteUrl}/blog/${post.slug}`,
    },
    wordCount: post.readingTime.words,
    articleSection: post.category,
    keywords: post.tags.join(', '),
  };
}