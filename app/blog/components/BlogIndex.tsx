'use client';

import { useState, useMemo } from 'react';
import { BlogPost, BlogCategory, BlogTag, BlogSortOptions } from '../types';
import { FeaturedPosts } from './FeaturedPosts';
import { BlogGrid } from './BlogGrid';
import { BlogFilters } from './BlogFilters';
import { BlogSearch } from './BlogSearch';
import { filterPosts, sortPosts, getFeaturedPosts } from '../utils';

interface BlogIndexProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  tags: BlogTag[];
  searchParams: {
    page?: string;
    category?: string;
    tag?: string;
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
  };
}

export function BlogIndex({ posts, categories, tags, searchParams }: BlogIndexProps) {
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.tag ? [searchParams.tag] : []
  );
  const [sortOption, setSortOption] = useState<BlogSortOptions>({
    field: (searchParams.sort as any) || 'publishedAt',
    direction: (searchParams.direction as 'asc' | 'desc') || 'desc',
  });

  const featuredPosts = useMemo(() => getFeaturedPosts(3), []);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    if (searchQuery) {
      filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    filtered = filterPosts(filtered, {
      category: selectedCategory || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });

    return sortPosts(filtered, sortOption);
  }, [posts, searchQuery, selectedCategory, selectedTags, sortOption]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('search', query);
    } else {
      url.searchParams.delete('search');
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    const url = new URL(window.location.href);
    if (category) {
      url.searchParams.set('category', category);
    } else {
      url.searchParams.delete('category');
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleTagFilter = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    const url = new URL(window.location.href);
    if (newTags.length > 0) {
      url.searchParams.set('tag', newTags.join(','));
    } else {
      url.searchParams.delete('tag');
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleSort = (sort: BlogSortOptions) => {
    setSortOption(sort);
    const url = new URL(window.location.href);
    url.searchParams.set('sort', sort.field);
    url.searchParams.set('direction', sort.direction);
    window.history.pushState({}, '', url.toString());
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedTags([]);
    setSortOption({ field: 'publishedAt', direction: 'desc' });
    const url = new URL(window.location.href);
    url.searchParams.delete('search');
    url.searchParams.delete('category');
    url.searchParams.delete('tag');
    url.searchParams.delete('sort');
    url.searchParams.delete('direction');
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="space-y-16">
      {featuredPosts.length > 0 && !searchQuery && !selectedCategory && selectedTags.length === 0 && (
        <FeaturedPosts posts={featuredPosts} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <BlogSearch
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search posts..."
            />
            
            <BlogFilters
              categories={categories}
              tags={tags}
              selectedCategory={selectedCategory}
              selectedTags={selectedTags}
              sortOption={sortOption}
              onCategoryChange={handleCategoryFilter}
              onTagChange={handleTagFilter}
              onSortChange={handleSort}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Search Results (${filteredAndSortedPosts.length})` : 
               selectedCategory ? `${categories.find(c => c.slug === selectedCategory)?.name} Posts` :
               selectedTags.length > 0 ? `Tagged Posts (${filteredAndSortedPosts.length})` :
               'All Posts'}
            </h2>
            
            {(searchQuery || selectedCategory || selectedTags.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          <BlogGrid 
            posts={filteredAndSortedPosts}
            searchParams={searchParams}
            showFilters={false}
          />
        </div>
      </div>
    </div>
  );
}