"use client";
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductGridProps } from '../types';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products,
  loading = false,
  view,
  onViewChange,
  filters,
  onFiltersChange,
  pagination,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={`grid gap-6 ${
        view === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glass rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-700" />
            <div className="p-6 space-y-3">
              <div className="h-4 bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-700 rounded w-1/2" />
              <div className="h-6 bg-gray-700 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="glass rounded-xl p-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
          <p className="text-gray-300 mb-6">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
          <button
            onClick={() => onFiltersChange({
              categories: [],
              brands: [],
              tags: [],
              priceRange: { min: 0, max: 1000 },
              search: '',
              sortBy: 'name',
              sortOrder: 'asc',
            })}
            className="bg-amber-500 hover:bg-amber-400 text-white px-6 py-2 rounded-full transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Grid */}
      <div className={`grid gap-6 ${
        view === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ProductCard
              product={product}
              view={view}
              showQuickAdd={true}
              showCompare={false}
            />
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-2 mt-12"
        >
          <button
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="flex items-center px-4 py-2 glass rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="ml-1 hidden sm:inline">Previous</span>
          </button>

          <div className="flex space-x-1">
            {/* First page */}
            {pagination.page > 3 && (
              <>
                <button
                  onClick={() => pagination.onPageChange(1)}
                  className="px-3 py-2 glass rounded text-gray-300 hover:text-white transition-colors"
                >
                  1
                </button>
                {pagination.page > 4 && (
                  <span className="px-3 py-2 text-gray-500">...</span>
                )}
              </>
            )}

            {/* Page numbers around current page */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              if (pageNum < 1 || pageNum > pagination.totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`px-3 py-2 rounded transition-colors ${
                    pageNum === pagination.page
                      ? 'bg-amber-500 text-white'
                      : 'glass text-gray-300 hover:text-white'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Last page */}
            {pagination.page < pagination.totalPages - 2 && (
              <>
                {pagination.page < pagination.totalPages - 3 && (
                  <span className="px-3 py-2 text-gray-500">...</span>
                )}
                <button
                  onClick={() => pagination.onPageChange(pagination.totalPages)}
                  className="px-3 py-2 glass rounded text-gray-300 hover:text-white transition-colors"
                >
                  {pagination.totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="flex items-center px-4 py-2 glass rounded-lg text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="mr-1 hidden sm:inline">Next</span>
            <ChevronRight size={20} />
          </button>
        </motion.div>
      )}

      {/* Results Summary */}
      {pagination && (
        <div className="text-center text-gray-400 text-sm">
          Showing {((pagination.page - 1) * 12) + 1} to{' '}
          {Math.min(pagination.page * 12, pagination.totalProducts)} of{' '}
          {pagination.totalProducts} products
        </div>
      )}
    </div>
  );
}