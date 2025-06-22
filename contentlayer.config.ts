import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import readingTime from 'reading-time';
import { BlogPostFrontmatterSchema } from './app/blog/types';

const computedFields = {
  slug: {
    type: 'string',
    resolve: (doc: any) => doc._raw.flattenedPath.replace(/^blog\//, ''),
  },
  url: {
    type: 'string',
    resolve: (doc: any) => `/blog/${doc._raw.flattenedPath.replace(/^blog\//, '')}`,
  },
  readingTime: {
    type: 'number',
    resolve: (doc: any) => Math.ceil(readingTime(doc.body.raw).minutes),
  },
  wordCount: {
    type: 'number',
    resolve: (doc: any) => doc.body.raw.split(/\s+/).length,
  },
  excerpt: {
    type: 'string',
    resolve: (doc: any) => {
      const content = doc.body.raw;
      const excerptLength = 160;
      if (content.length <= excerptLength) return content;
      return content.slice(0, excerptLength).trim() + '...';
    },
  },
  tableOfContents: {
    type: 'json',
    resolve: (doc: any) => {
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      const headings: Array<{ id: string; text: string; level: number }> = [];
      let match;

      while ((match = headingRegex.exec(doc.body.raw)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        
        headings.push({ id, text, level });
      }

      return headings;
    },
  },
};

export const BlogPost = defineDocumentType(() => ({
  name: 'BlogPost',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    description: {
      type: 'string',
      required: true,
    },
    publishedAt: {
      type: 'date',
      required: true,
    },
    updatedAt: {
      type: 'date',
      required: false,
    },
    author: {
      type: 'nested',
      of: {
        name: { type: 'string', required: true },
        bio: { type: 'string', required: false },
        avatar: { type: 'string', required: false },
        social: {
          type: 'nested',
          of: {
            instagram: { type: 'string', required: false },
            twitter: { type: 'string', required: false },
            linkedin: { type: 'string', required: false },
          },
        },
      },
    },
    category: {
      type: 'string',
      required: true,
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      required: true,
    },
    featured: {
      type: 'boolean',
      default: false,
    },
    draft: {
      type: 'boolean',
      default: false,
    },
    coverImage: {
      type: 'nested',
      of: {
        src: { type: 'string', required: true },
        alt: { type: 'string', required: true },
        width: { type: 'number', required: false },
        height: { type: 'number', required: false },
      },
    },
    seo: {
      type: 'nested',
      of: {
        title: { type: 'string', required: false },
        description: { type: 'string', required: false },
        keywords: { type: 'list', of: { type: 'string' }, required: false },
        canonicalUrl: { type: 'string', required: false },
      },
    },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [BlogPost],
  mdx: {
    remarkPlugins: [remarkGfm, remarkToc],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            className: ['anchor'],
          },
        },
      ],
      rehypeHighlight,
    ],
  },
});