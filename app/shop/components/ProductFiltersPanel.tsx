"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Star, DollarSign, Package, Tag, Palette } from 'lucide-react';
import { ProductFilters, Product } from '../types';

interface ProductFiltersPanelProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  products: Product[];
  onClose?: () => void;
}

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, icon, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <div className="flex items-center space-x-2 text-white font-medium">
          {icon}
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="pb-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export default function ProductFiltersPanel({
  filters,
  onFiltersChange,
  products,
  onClose
}: ProductFiltersPanelProps) {
  // Extract unique values from products
  const availableCategories = Array.from(new Set(products.flatMap(p => p.categories)));
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))) as string[];
  const availableTags = Array.from(new Set(products.flatMap(p => p.tags)));
  const priceRange = {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price))
  };

  const updateFilter = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = (key: 'categories' | 'brands' | 'tags', value: string) => {
    const currentValues = filters[key] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFilter(key, newValues);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      brands: [],
      tags: [],
      priceRange: { min: priceRange.min, max: priceRange.max },
      inStock: undefined,
      onSale: undefined,
      rating: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      search: '',
    });
  };

  const hasActiveFilters = 
    (filters.categories && filters.categories.length > 0) ||
    (filters.brands && filters.brands.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    filters.inStock !== undefined ||
    filters.onSale !== undefined ||
    filters.rating !== undefined ||
    (filters.priceRange && (
      filters.priceRange.min !== priceRange.min || 
      filters.priceRange.max !== priceRange.max
    ));

  return (
    <div className="glass rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Filters</span>
        </h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        icon={<DollarSign className="w-4 h-4" />}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Min</label>
              <input
                type="number"
                value={filters.priceRange?.min || priceRange.min}
                onChange={(e) => updateFilter('priceRange', {
                  ...filters.priceRange,
                  min: Number(e.target.value)
                })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                min={priceRange.min}
                max={priceRange.max}
              />
            </div>
            <div className="text-gray-400 pt-6">-</div>
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-1">Max</label>
              <input
                type="number"
                value={filters.priceRange?.max || priceRange.max}
                onChange={(e) => updateFilter('priceRange', {
                  ...filters.priceRange,
                  max: Number(e.target.value)
                })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                min={priceRange.min}
                max={priceRange.max}
              />
            </div>
          </div>
          
          {/* Price Range Slider */}
          <div className="px-1">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.priceRange?.max || priceRange.max}
              onChange={(e) => updateFilter('priceRange', {
                min: filters.priceRange?.min || priceRange.min,
                max: Number(e.target.value)
              })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${
                  ((filters.priceRange?.max || priceRange.max) - priceRange.min) / 
                  (priceRange.max - priceRange.min) * 100
                }%, #374151 ${
                  ((filters.priceRange?.max || priceRange.max) - priceRange.min) / 
                  (priceRange.max - priceRange.min) * 100
                }%, #374151 100%)`
              }}
            />
          </div>
        </div>
      </FilterSection>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <FilterSection
          title="Categories"
          icon={<Tag className="w-4 h-4" />}
        >
          <div className="space-y-2">
            {availableCategories.map((category) => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(category) || false}
                  onChange={() => toggleArrayFilter('categories', category)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  filters.categories?.includes(category)
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-gray-500'
                }`}>
                  {filters.categories?.includes(category) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-300 capitalize">
                  {category.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Brands */}
      {availableBrands.length > 0 && (
        <FilterSection
          title="Brands"
          icon={<Palette className="w-4 h-4" />}
        >
          <div className="space-y-2">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brands?.includes(brand) || false}
                  onChange={() => toggleArrayFilter('brands', brand)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  filters.brands?.includes(brand)
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-gray-500'
                }`}>
                  {filters.brands?.includes(brand) && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-300">{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating */}
      <FilterSection
        title="Customer Rating"
        icon={<Star className="w-4 h-4" />}
      >
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => updateFilter('rating', rating)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                filters.rating === rating
                  ? 'border-amber-500 bg-amber-500'
                  : 'border-gray-500'
              }`}>
                {filters.rating === rating && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i < rating
                          ? 'text-amber-400 fill-current'
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-300 text-sm">& up</span>
              </div>
            </label>
          ))}
          {filters.rating && (
            <button
              onClick={() => updateFilter('rating', undefined)}
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
            >
              Clear rating filter
            </button>
          )}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection
        title="Availability"
        icon={<Package className="w-4 h-4" />}
      >
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock === true}
              onChange={(e) => updateFilter('inStock', e.target.checked ? true : undefined)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              filters.inStock === true
                ? 'border-amber-500 bg-amber-500'
                : 'border-gray-500'
            }`}>
              {filters.inStock === true && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-gray-300">In Stock Only</span>
          </label>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onSale === true}
              onChange={(e) => updateFilter('onSale', e.target.checked ? true : undefined)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
              filters.onSale === true
                ? 'border-amber-500 bg-amber-500'
                : 'border-gray-500'
            }`}>
              {filters.onSale === true && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-gray-300">On Sale</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
}