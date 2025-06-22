"use client";
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Filter, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { products, categories } from './data/products';
import { Product, ProductFilters } from './types';
import ProductGrid from './components/ProductGrid';
import ProductFiltersPanel from './components/ProductFiltersPanel';
import ProductSearch from './components/ProductSearch';
import { ShopProvider } from './context/ShopContext';

export default function ShopPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const productsPerPage = 12;

  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    brands: [],
    tags: [],
    priceRange: { min: 0, max: 1000 },
    inStock: undefined,
    onSale: undefined,
    rating: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
    search: '',
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        product.brand?.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(product =>
        product.categories.some(cat => filters.categories!.includes(cat))
      );
    }

    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product =>
        product.brand && filters.brands!.includes(product.brand)
      );
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product =>
        product.price >= filters.priceRange!.min &&
        product.price <= filters.priceRange!.max
      );
    }

    // Stock filter
    if (filters.inStock !== undefined) {
      filtered = filtered.filter(product =>
        filters.inStock ? product.stock > 0 : product.stock === 0
      );
    }

    // Sale filter
    if (filters.onSale !== undefined) {
      filtered = filtered.filter(product =>
        filters.onSale ? product.isOnSale : !product.isOnSale
      );
    }

    // Rating filter
    if (filters.rating !== undefined) {
      filtered = filtered.filter(product =>
        product.averageRating && product.averageRating >= filters.rating!
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'created':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updated':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        case 'popularity':
          aValue = a.totalSold || 0;
          bValue = b.totalSold || 0;
          break;
        case 'rating':
          aValue = a.averageRating || 0;
          bValue = b.averageRating || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFiltersChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: newSortOrder,
    }));
  };

  return (
    <ShopProvider>
      <div className="min-h-screen bg-gradient-to-b from-black to-stone-900">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-playfair text-white mb-4">
              Nycayen Professional Shop
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover our curated collection of premium hair care products, styling tools, 
              and luxury accessories for the ultimate hair experience.
            </p>
          </motion.div>

          {/* Search and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="w-full lg:w-96">
                <ProductSearch
                  value={filters.search || ''}
                  onChange={(search) => setFilters(prev => ({ ...prev, search }))}
                  placeholder="Search products..."
                />
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      setFilters(prev => ({
                        ...prev,
                        sortBy: sortBy as any,
                        sortOrder: sortOrder as 'asc' | 'desc',
                      }));
                    }}
                    className="glass px-4 py-2 rounded-lg text-white bg-transparent border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="name-asc" className="bg-gray-800">Name A-Z</option>
                    <option value="name-desc" className="bg-gray-800">Name Z-A</option>
                    <option value="price-asc" className="bg-gray-800">Price Low-High</option>
                    <option value="price-desc" className="bg-gray-800">Price High-Low</option>
                    <option value="created-desc" className="bg-gray-800">Newest First</option>
                    <option value="popularity-desc" className="bg-gray-800">Most Popular</option>
                    <option value="rating-desc" className="bg-gray-800">Highest Rated</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex glass rounded-lg p-1">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded transition-colors ${
                      view === 'grid'
                        ? 'bg-amber-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    aria-label="Grid view"
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded transition-colors ${
                      view === 'list'
                        ? 'bg-amber-500 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    aria-label="List view"
                  >
                    <List size={20} />
                  </button>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showFilters
                      ? 'bg-amber-500 text-white'
                      : 'glass text-gray-300 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal size={20} />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setFilters(prev => ({ ...prev, categories: [] }))}
                className={`px-4 py-2 rounded-full transition-colors ${
                  !filters.categories || filters.categories.length === 0
                    ? 'bg-amber-500 text-white'
                    : 'glass text-gray-300 hover:text-white'
                }`}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    const isSelected = filters.categories?.includes(category.slug);
                    if (isSelected) {
                      setFilters(prev => ({
                        ...prev,
                        categories: prev.categories?.filter(c => c !== category.slug) || [],
                      }));
                    } else {
                      setFilters(prev => ({
                        ...prev,
                        categories: [...(prev.categories || []), category.slug],
                      }));
                    }
                  }}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    filters.categories?.includes(category.slug)
                      ? 'bg-amber-500 text-white'
                      : 'glass text-gray-300 hover:text-white'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-70">
                    ({category.productCount})
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-80"
              >
                <ProductFiltersPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  products={products}
                  onClose={() => setShowFilters(false)}
                />
              </motion.aside>
            )}

            {/* Product Grid */}
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-1"
            >
              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-300">
                  Showing {paginatedProducts.length} of {filteredProducts.length} products
                  {filters.search && (
                    <span className="ml-2">
                      for "<span className="text-amber-400">{filters.search}</span>"
                    </span>
                  )}
                </p>
              </div>

              <ProductGrid
                products={paginatedProducts}
                loading={isLoading}
                view={view}
                onViewChange={setView}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                pagination={{
                  page: currentPage,
                  totalPages,
                  totalProducts: filteredProducts.length,
                  onPageChange: handlePageChange,
                }}
              />
            </motion.main>
          </div>
        </div>
      </div>
    </ShopProvider>
  );
}