import { Metadata } from 'next';
import { Suspense } from 'react';
import { BlogIndex } from './components/BlogIndex';
import { BlogIndexSkeleton } from './components/BlogIndexSkeleton';
import { getAllPosts, getAllCategories, getAllTags } from './utils';

export const metadata: Metadata = {
  title: 'Blog | Nycayen Hair Artistry',
  description: 'Discover the latest trends, tips, and insights from NYC\'s premier hair artistry and wig design expert.',
  openGraph: {
    title: 'Blog | Nycayen Hair Artistry',
    description: 'Discover the latest trends, tips, and insights from NYC\'s premier hair artistry and wig design expert.',
    type: 'website',
    url: '/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Nycayen Hair Artistry',
    description: 'Discover the latest trends, tips, and insights from NYC\'s premier hair artistry and wig design expert.',
  },
};

interface BlogPageProps {
  searchParams: {
    page?: string;
    category?: string;
    tag?: string;
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
  };
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  const posts = getAllPosts();
  const categories = getAllCategories();
  const tags = getAllTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Hair Artistry Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the latest trends, professional tips, and behind-the-scenes insights 
            from NYC's premier hair artistry and luxury wig design studio.
          </p>
        </header>

        <Suspense fallback={<BlogIndexSkeleton />}>
          <BlogIndex
            posts={posts}
            categories={categories}
            tags={tags}
            searchParams={searchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}