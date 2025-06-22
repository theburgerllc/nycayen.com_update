"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock } from 'lucide-react';
import { searchProducts } from '../data/products';
import { Product } from '../types';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ProductSearch({ value, onChange, placeholder = "Search products..." }: ProductSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to load recent searches:', error);
        }
      }
    }
  }, []);

  // Update suggestions when value changes
  useEffect(() => {
    if (value.length >= 2) {
      const results = searchProducts(value).slice(0, 6);
      setSuggestions(results);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const saveRecentSearch = (searchTerm: string) => {
    if (searchTerm.trim().length < 2) return;

    const newRecentSearches = [
      searchTerm,
      ...recentSearches.filter(term => term !== searchTerm)
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('recent_searches', JSON.stringify(newRecentSearches));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + (value.length < 2 ? recentSearches.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (value.length >= 2 && highlightedIndex < suggestions.length) {
            // Navigate to product
            const product = suggestions[highlightedIndex];
            window.location.href = `/shop/product/${product.slug}`;
          } else if (value.length < 2) {
            // Use recent search
            const searchTerm = recentSearches[highlightedIndex];
            onChange(searchTerm);
            saveRecentSearch(searchTerm);
          }
        } else if (value.trim()) {
          saveRecentSearch(value);
        }
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (product: Product) => {
    saveRecentSearch(value);
    window.location.href = `/shop/product/${product.slug}`;
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    onChange(searchTerm);
    saveRecentSearch(searchTerm);
    setIsOpen(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('recent_searches');
    }
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          autoComplete="off"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-white/10 overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {/* Search Suggestions */}
            {value.length >= 2 && suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs text-gray-400 uppercase tracking-wide px-3 py-2">
                  Products
                </div>
                {suggestions.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      index === highlightedIndex
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {product.brand} • ${product.price}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {value.length < 2 && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Recent Searches
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((searchTerm, index) => (
                  <button
                    key={searchTerm}
                    onClick={() => handleRecentSearchClick(searchTerm)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      index === highlightedIndex
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="flex-1 truncate">{searchTerm}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {value.length >= 2 && suggestions.length === 0 && (
              <div className="p-6 text-center text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No products found for "{value}"</div>
                <div className="text-xs mt-1">Try adjusting your search terms</div>
              </div>
            )}

            {/* Empty State */}
            {value.length < 2 && recentSearches.length === 0 && (
              <div className="p-6 text-center text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">Start typing to search products</div>
                <div className="text-xs mt-1">Search by name, brand, or category</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}