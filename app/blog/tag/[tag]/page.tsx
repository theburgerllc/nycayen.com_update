import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogGrid } from '../../components/BlogGrid';
import { getAllTags, getPostsByTag, slugify } from '../../utils';

interface TagPageProps {
  params: {
    tag: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
  };
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map(tag => ({
    tag: tag.slug,
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tags = getAllTags();
  const tag = tags.find(t => t.slug === params.tag);
  
  if (!tag) {
    return {
      title: 'Tag Not Found',
    };
  }

  return {
    title: `#${tag.name} | Hair Artistry Blog`,
    description: `Explore all posts tagged with ${tag.name}. Discover hair artistry tips, trends, and insights.`,
    openGraph: {
      title: `#${tag.name} | Hair Artistry Blog`,
      description: `Explore all posts tagged with ${tag.name}. Discover hair artistry tips, trends, and insights.`,
      type: 'website',
      url: `/blog/tag/${tag.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `#${tag.name} | Hair Artistry Blog`,
      description: `Explore all posts tagged with ${tag.name}. Discover hair artistry tips, trends, and insights.`,
    },
  };
}

export default function TagPage({ params, searchParams }: TagPageProps) {
  const tags = getAllTags();
  const tag = tags.find(t => t.slug === params.tag);
  
  if (!tag) {
    notFound();
  }

  const posts = getPostsByTag(params.tag);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <nav className="mb-6">
            <a 
              href="/blog" 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Blog
            </a>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-purple-600 font-medium">#{tag.name}</span>
          </nav>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            #{tag.name}
          </h1>
          
          <p className="text-gray-500">
            {tag.count} {tag.count === 1 ? 'post' : 'posts'} tagged with {tag.name}
          </p>
        </header>

        <BlogGrid 
          posts={posts}
          searchParams={searchParams}
          showFilters={false}
        />
      </div>
    </div>
  );
}