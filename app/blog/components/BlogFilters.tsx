'use client';

import { useState } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
import { BlogCategory, BlogTag, BlogSortOptions } from '../types';

interface BlogFiltersProps {
  categories: BlogCategory[];
  tags: BlogTag[];
  selectedCategory: string;
  selectedTags: string[];
  sortOption: BlogSortOptions;
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
  onSortChange: (sort: BlogSortOptions) => void;
  onClearFilters: () => void;
}

export function BlogFilters({
  categories,
  tags,
  selectedCategory,
  selectedTags,
  sortOption,
  onCategoryChange,
  onTagChange,
  onSortChange,
  onClearFilters,
}: BlogFiltersProps) {
  const [showCategories, setShowCategories] = useState(true);
  const [showTags, setShowTags] = useState(true);
  const [showSort, setShowSort] = useState(true);

  const hasActiveFilters = selectedCategory || selectedTags.length > 0 || 
    (sortOption.field !== 'publishedAt' || sortOption.direction !== 'desc');

  const sortOptions = [
    { field: 'publishedAt' as const, direction: 'desc' as const, label: 'Latest First' },
    { field: 'publishedAt' as const, direction: 'asc' as const, label: 'Oldest First' },
    { field: 'title' as const, direction: 'asc' as const, label: 'Title A-Z' },
    { field: 'title' as const, direction: 'desc' as const, label: 'Title Z-A' },
    { field: 'readingTime' as const, direction: 'asc' as const, label: 'Quick Reads' },
    { field: 'readingTime' as const, direction: 'desc' as const, label: 'Long Reads' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Sort By</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSort ? 'rotate-180' : ''}`} />
          </button>
          {showSort && (
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <label key={`${option.field}-${option.direction}`} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sort"
                    checked={sortOption.field === option.field && sortOption.direction === option.direction}
                    onChange={() => onSortChange(option)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Categories</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
          </button>
          {showCategories && (
            <div className="space-y-2">
              <button
                onClick={() => onCategoryChange('')}
                className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  !selectedCategory 
                    ? 'bg-purple-100 text-purple-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => onCategoryChange(category.slug)}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === category.slug
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="text-xs text-gray-500">({category.count})</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => setShowTags(!showTags)}
            className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
          >
            <span>Tags</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showTags ? 'rotate-180' : ''}`} />
          </button>
          {showTags && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tags.slice(0, 20).map((tag) => (
                <label key={tag.slug} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.slug)}
                    onChange={() => onTagChange(tag.slug)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{tag.name}</span>
                  <span className="text-xs text-gray-500">({tag.count})</span>
                </label>
              ))}
              {tags.length > 20 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  Showing top 20 tags
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}