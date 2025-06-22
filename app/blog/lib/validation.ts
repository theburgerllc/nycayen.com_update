import { z } from 'zod';
import { BlogPostFrontmatterSchema } from '../types';

export function validateBlogPost(frontmatter: unknown): { 
  success: boolean; 
  data?: any; 
  errors?: string[] 
} {
  try {
    const validatedData = BlogPostFrontmatterSchema.parse(frontmatter);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

export const BlogCommentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  comment: z.string().min(1, 'Comment is required').max(1000, 'Comment too long'),
  postSlug: z.string().min(1, 'Post slug is required'),
  parentId: z.string().optional(),
});

export type BlogCommentInput = z.infer<typeof BlogCommentSchema>;

export const NewsletterSubscriptionSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  preferences: z.object({
    frequency: z.enum(['weekly', 'monthly']).default('weekly'),
    categories: z.array(z.string()).default([]),
  }).optional(),
});

export type NewsletterSubscriptionInput = z.infer<typeof NewsletterSubscriptionSchema>;

export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function validateImageUrl(url: string): boolean {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(url);
  } catch {
    return false;
  }
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.getTime() > 0;
}

export function validateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function validateWordCount(content: string): number {
  return content.split(/\s+/).filter(word => word.length > 0).length;
}

export function validateTags(tags: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (tags.length === 0) {
    errors.push('At least one tag is required');
  }
  
  if (tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }
  
  tags.forEach((tag, index) => {
    if (tag.length < 2) {
      errors.push(`Tag ${index + 1} must be at least 2 characters long`);
    }
    if (tag.length > 50) {
      errors.push(`Tag ${index + 1} must be less than 50 characters long`);
    }
    if (!/^[a-zA-Z0-9\s-]+$/.test(tag)) {
      errors.push(`Tag ${index + 1} contains invalid characters`);
    }
  });
  
  const duplicates = tags.filter((tag, index) => tags.indexOf(tag) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate tags found: ${duplicates.join(', ')}`);
  }
  
  return { valid: errors.length === 0, errors };
}

export function validateCategory(category: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }
  
  if (category.length < 2) {
    errors.push('Category must be at least 2 characters long');
  }
  
  if (category.length > 100) {
    errors.push('Category must be less than 100 characters long');
  }
  
  if (!/^[a-zA-Z0-9\s-]+$/.test(category)) {
    errors.push('Category contains invalid characters');
  }
  
  return { valid: errors.length === 0, errors };
}