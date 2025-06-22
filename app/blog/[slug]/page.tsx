import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMDXComponent } from 'next-contentlayer/hooks';
import { allBlogPosts } from 'contentlayer/generated';
import { BlogPostHeader } from '../components/BlogPostHeader';
import { BlogPostContent } from '../components/BlogPostContent';
import { BlogPostSidebar } from '../components/BlogPostSidebar';
import { RelatedPosts } from '../components/RelatedPosts';
import { SocialShare } from '../components/SocialShare';
import { getPostBySlug, getRelatedPosts, generateStructuredData } from '../utils';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return allBlogPosts
    .filter(post => !post.draft)
    .map(post => ({
      slug: post.slug,
    }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const seoTitle = post.seo?.title || post.title;
  const seoDescription = post.seo?.description || post.description;
  const seoKeywords = post.seo?.keywords || post.tags;
  const canonicalUrl = post.seo?.canonicalUrl || `/blog/${post.slug}`;

  return {
    title: `${seoTitle} | Nycayen Hair Artistry Blog`,
    description: seoDescription,
    keywords: seoKeywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      url: canonicalUrl,
      images: [
        {
          url: post.coverImage.src,
          width: post.coverImage.width || 1200,
          height: post.coverImage.height || 630,
          alt: post.coverImage.alt,
        },
      ],
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: (post.updatedAt || post.publishedAt).toISOString(),
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [post.coverImage.src],
      creator: post.author.social?.twitter ? `@${post.author.social.twitter}` : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  const MDXContent = getMDXComponent(post.body.code);
  const relatedPosts = getRelatedPosts(post);
  const structuredData = generateStructuredData(post, process.env.NEXT_PUBLIC_SITE_URL || 'https://nycayen.com');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <article className="min-h-screen bg-white">
        <BlogPostHeader post={post} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <BlogPostContent>
                  <MDXContent />
                </BlogPostContent>
                
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <SocialShare 
                    url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`}
                    title={post.title}
                    description={post.description}
                    image={post.coverImage.src}
                    hashtags={post.tags}
                  />
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <BlogPostSidebar post={post} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <RelatedPosts posts={relatedPosts} />
          </div>
        </div>
      </article>
    </>
  );
}