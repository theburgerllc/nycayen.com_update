// MDX utilities to replace contentlayer functionality
import matter from 'gray-matter'
import readingTime from 'reading-time'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  featured: boolean
  author: {
    name: string
    image: string
  }
  readingTime: {
    text: string
    minutes: number
    time: number
    words: number
  }
  content: string
  excerpt: string
}

// Sample blog posts data (replace with CMS or database in production)
const samplePosts: BlogPost[] = [
  {
    slug: 'summer-hair-trends-2024',
    title: 'Summer Hair Trends 2024: Effortless Beach Waves',
    description: 'Discover the hottest summer hair trends for 2024, from beach waves to bold colors that will make you shine.',
    date: new Date('2024-06-15').toISOString(),
    category: 'Hair Trends',
    tags: ['summer', 'trends', 'beach waves', 'styling'],
    featured: true,
    author: {
      name: 'Nycayen Moore',
      image: '/images/nycayen-headshot.jpg'
    },
    readingTime: {
      text: '5 min read',
      minutes: 5,
      time: 300000,
      words: 1000
    },
    content: `Summer is here, and it's time to embrace effortless beach waves that capture the essence of sunny days and ocean breezes. This season's trends focus on natural textures, dimensional color, and low-maintenance styles that transition seamlessly from day to night.

## The Beach Wave Revolution

Beach waves aren't just for the beach anymore. This versatile style works for every occasion, from casual brunches to elegant evening events. The key is achieving that perfect tousled look that appears effortless but is carefully crafted.

### How to Create Perfect Beach Waves

1. Start with damp hair and apply a sea salt spray
2. Scrunch your hair gently to enhance natural texture
3. Use a diffuser on low heat to dry
4. Finish with a light hold hairspray

## Color Trends for Summer

This summer, we're seeing a shift toward sun-kissed highlights and dimensional color that mimics the natural lightening effect of summer sun.`,
    excerpt: 'Discover the hottest summer hair trends for 2024, from beach waves to bold colors that will make you shine this season.'
  },
  {
    slug: 'wig-maintenance-guide',
    title: 'The Complete Guide to Wig Care and Maintenance',
    description: 'Learn professional techniques for maintaining your wigs to ensure they look beautiful and last longer.',
    date: new Date('2024-05-20').toISOString(),
    category: 'Wig Care',
    tags: ['wigs', 'maintenance', 'care', 'styling'],
    featured: true,
    author: {
      name: 'Nycayen Moore',
      image: '/images/nycayen-headshot.jpg'
    },
    readingTime: {
      text: '8 min read',
      minutes: 8,
      time: 480000,
      words: 1600
    },
    content: `Proper wig care is essential for maintaining the beauty, longevity, and natural appearance of your investment. Whether you're wearing a human hair wig or a high-quality synthetic piece, following the right maintenance routine will keep it looking salon-fresh.

## Daily Care Routine

Your daily wig care routine should be gentle yet thorough. Start by storing your wig properly when not in use - a wig stand or mannequin head is ideal for maintaining the shape and preventing tangling.

### Brushing and Detangling

Always use a wide-tooth comb or wig brush specifically designed for your wig type. Start from the ends and work your way up to prevent damage and breakage.

## Washing Your Wig

Frequency depends on wear, but generally:
- Daily wear: Every 7-10 wears
- Occasional wear: Every 15-20 wears

### Step-by-Step Washing Process

1. Gently brush out any tangles
2. Fill a basin with cool water and wig shampoo
3. Soak for 5-10 minutes, gently swishing
4. Rinse thoroughly with cool water
5. Apply conditioner (for human hair wigs)
6. Rinse again and gently squeeze out excess water`,
    excerpt: 'Learn professional techniques for maintaining your wigs to ensure they look beautiful and last longer with proper care.'
  }
]

// Cache for blog posts
let cachedPosts: BlogPost[] | null = null

export function getAllBlogPosts(): BlogPost[] {
  if (cachedPosts) {
    return cachedPosts
  }

  // In a real application, this would fetch from a CMS, database, or file system
  // For now, return sample posts
  cachedPosts = samplePosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return cachedPosts
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getAllBlogPosts()
  return posts.find(post => post.slug === slug) || null
}

export function getFeaturedPosts(): BlogPost[] {
  const posts = getAllBlogPosts()
  return posts.filter(post => post.featured)
}

export function getPostsByCategory(category: string): BlogPost[] {
  const posts = getAllBlogPosts()
  return posts.filter(post => post.category.toLowerCase() === category.toLowerCase())
}

export function getPostsByTag(tag: string): BlogPost[] {
  const posts = getAllBlogPosts()
  return posts.filter(post => post.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
}

export function getAllCategories(): string[] {
  const posts = getAllBlogPosts()
  const categories = posts.map(post => post.category)
  return Array.from(new Set(categories))
}

export function getAllTags(): string[] {
  const posts = getAllBlogPosts()
  const tags = posts.flatMap(post => post.tags)
  return Array.from(new Set(tags))
}

export function searchPosts(query: string): BlogPost[] {
  const posts = getAllBlogPosts()
  const lowercaseQuery = query.toLowerCase()
  
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.description.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    post.category.toLowerCase().includes(lowercaseQuery)
  )
}

// Clear cache (useful for development)
export function clearCache(): void {
  cachedPosts = null
}