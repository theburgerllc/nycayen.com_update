'use client';

import { useMemo } from 'react';
import { BlogPost, BlogSortOptions, PaginationOptions } from '../types';
import { BlogCard } from './BlogCard';
import { Pagination } from './Pagination';
import { paginatePosts, sortPosts } from '../utils';

interface BlogGridProps {
  posts: BlogPost[];
  searchParams: {
    page?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
  };
  showFilters?: boolean;
  postsPerPage?: number;
}

export function BlogGrid({ 
  posts, 
  searchParams, 
  showFilters = true,
  postsPerPage = 12 
}: BlogGridProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const sortOption: BlogSortOptions = {
    field: (searchParams.sort as any) || 'publishedAt',
    direction: (searchParams.direction as 'asc' | 'desc') || 'desc',
  };

  const paginatedData = useMemo(() => {
    const sortedPosts = sortPosts(posts, sortOption);
    return paginatePosts(sortedPosts, { page: currentPage, limit: postsPerPage });
  }, [posts, sortOption, currentPage, postsPerPage]);

  if (posts.length === 0) {
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-600">
            We couldn't find any posts matching your criteria. Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showFilters && (
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <p className="text-sm text-gray-600">
            Showing {paginatedData.posts.length} of {paginatedData.totalCount} posts
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedData.posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      {paginatedData.totalPages > 1 && (
        <Pagination
          currentPage={paginatedData.currentPage}
          totalPages={paginatedData.totalPages}
          hasNextPage={paginatedData.hasNextPage}
          hasPreviousPage={paginatedData.hasPreviousPage}
        />
      )}
    </div>
  );
}