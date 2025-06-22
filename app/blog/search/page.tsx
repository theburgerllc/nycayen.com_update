import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from '../components/SearchResults';
import { SearchResultsSkeleton } from '../components/SearchResultsSkeleton';

export const metadata: Metadata = {
  title: 'Search | Hair Artistry Blog',
  description: 'Search through our collection of hair artistry tips, trends, and insights.',
  robots: {
    index: false,
    follow: true,
  },
};

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1', 10);

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
            <span className="text-purple-600 font-medium">Search</span>
          </nav>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Search Results
          </h1>
          
          {query && (
            <p className="text-xl text-gray-600">
              Results for "<span className="font-semibold text-purple-600">{query}</span>"
            </p>
          )}
        </header>

        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults query={query} page={page} />
        </Suspense>
      </div>
    </div>
  );
}