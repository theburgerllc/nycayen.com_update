'use client';

import { useMemo } from 'react';
import { BlogCard } from './BlogCard';
import { Pagination } from './Pagination';
import { searchPosts, paginatePosts } from '../utils';

interface SearchResultsProps {
  query: string;
  page: number;
}

export function SearchResults({ query, page }: SearchResultsProps) {
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchPosts(query);
  }, [query]);

  const paginatedResults = useMemo(() => {
    const posts = searchResults.map(result => result.post);
    return paginatePosts(posts, { page, limit: 12 });
  }, [searchResults, page]);

  if (!query.trim()) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter a search term</h3>
          <p className="text-gray-600">
            Start typing to search through our blog posts, categories, and tags.
          </p>
        </div>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-600">
            We couldn't find any posts matching "<span className="font-semibold">{query}</span>". 
            Try different keywords or browse our categories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <p className="text-sm text-gray-600">
          Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for "
          <span className="font-semibold text-purple-600">{query}</span>"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedResults.posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      {paginatedResults.totalPages > 1 && (
        <Pagination
          currentPage={paginatedResults.currentPage}
          totalPages={paginatedResults.totalPages}
          hasNextPage={paginatedResults.hasNextPage}
          hasPreviousPage={paginatedResults.hasPreviousPage}
        />
      )}
    </div>
  );
}