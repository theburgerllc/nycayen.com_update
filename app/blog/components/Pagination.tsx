'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function Pagination({ currentPage, totalPages, hasNextPage, hasPreviousPage }: PaginationProps) {
  const getPageUrl = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    return url.toString();
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center space-x-2" aria-label="Pagination">
      <a
        href={hasPreviousPage ? getPageUrl(currentPage - 1) : '#'}
        className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
          hasPreviousPage
            ? 'text-gray-700 bg-white hover:bg-gray-50 hover:text-purple-600'
            : 'text-gray-400 bg-gray-100 cursor-not-allowed'
        }`}
        aria-disabled={!hasPreviousPage}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="ml-1">Previous</span>
      </a>

      <div className="flex items-center space-x-1">
        {getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="px-3 py-2 text-gray-500 text-sm font-medium"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <a
              key={pageNumber}
              href={getPageUrl(pageNumber)}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                isCurrentPage
                  ? 'border-purple-500 bg-purple-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-purple-600'
              }`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </a>
          );
        })}
      </div>

      <a
        href={hasNextPage ? getPageUrl(currentPage + 1) : '#'}
        className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
          hasNextPage
            ? 'text-gray-700 bg-white hover:bg-gray-50 hover:text-purple-600'
            : 'text-gray-400 bg-gray-100 cursor-not-allowed'
        }`}
        aria-disabled={!hasNextPage}
      >
        <span className="mr-1">Next</span>
        <ChevronRight className="w-4 h-4" />
      </a>
    </nav>
  );
}