'use client';

import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  categories?: string[];
  onCategorySelect?: (category: string | null) => void;
  className?: string;
  darkMode?: boolean;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ 
  onSearch, 
  categories = [], 
  onCategorySelect,
  className = '',
  darkMode = false
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setShowCategories(false);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <div className={`relative w-full max-w-3xl mx-auto ${className}`}>
      <div className={`
        relative flex items-center bg-white rounded-full shadow-xl transition-all duration-200
        ${isFocused ? 'ring-2 ring-purple-400 shadow-purple-100' : ''}
        ${darkMode ? 'bg-gray-900 shadow-gray-900/10' : 'bg-white'}
      `}>
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search services..."
            className={`
              w-full px-6 py-4 pl-14 text-lg placeholder-gray-400 bg-transparent border-none 
              rounded-l-full focus:outline-none focus:ring-0
              ${darkMode ? 'text-white' : 'text-gray-900'}
            `}
          />
          <MagnifyingGlassIcon className={`
            absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6
            ${darkMode ? 'text-gray-400' : 'text-gray-400'}
          `} />
        </div>

        {categories.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowCategories(!showCategories)}
              className={`
                px-6 py-4 text-base font-medium border-l border-gray-200 
                hover:bg-gray-50 transition-colors rounded-r-full flex items-center gap-2
                ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}
                ${selectedCategory ? 'text-purple-500' : darkMode ? 'text-gray-300' : 'text-gray-700'}
              `}
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span className="hidden sm:inline">{selectedCategory || 'All Categories'}</span>
              <svg
                className={`h-4 w-4 transition-transform ${showCategories ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCategories && (
              <div className={`
                absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border py-2 z-50
                ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}
              `}>
                <div
                  className={`
                    px-4 py-2 text-sm cursor-pointer transition-colors
                    ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-purple-50'}
                    ${!selectedCategory 
                      ? darkMode 
                        ? 'text-purple-400 bg-gray-800' 
                        : 'text-purple-600 bg-purple-50/50'
                      : darkMode
                        ? 'text-gray-300'
                        : 'text-gray-700'
                    }
                  `}
                  onClick={() => handleCategorySelect(null)}
                >
                  All Categories
                </div>
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`
                      px-4 py-2 text-sm cursor-pointer transition-colors
                      ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-purple-50'}
                      ${selectedCategory === category
                        ? darkMode
                          ? 'text-purple-400 bg-gray-800'
                          : 'text-purple-600 bg-purple-50/50'
                        : darkMode
                          ? 'text-gray-300'
                          : 'text-gray-700'
                      }
                    `}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active filters */}
      {(query || selectedCategory) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {query && (
            <div className={`
              flex items-center gap-1 px-4 py-1.5 rounded-full transition-colors
              ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white/10 text-white/90'}
            `}>
              <span>Search: {query}</span>
              <button
                onClick={() => handleSearchChange('')}
                className={`
                  ml-1 rounded-full hover:bg-gray-700/20 p-1
                  ${darkMode ? 'hover:text-white' : 'hover:text-white'}
                `}
              >
                ×
              </button>
            </div>
          )}
          {selectedCategory && (
            <div className={`
              flex items-center gap-1 px-4 py-1.5 rounded-full transition-colors
              ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white/10 text-white/90'}
            `}>
              <span>Category: {selectedCategory}</span>
              <button
                onClick={() => handleCategorySelect(null)}
                className={`
                  ml-1 rounded-full hover:bg-gray-700/20 p-1
                  ${darkMode ? 'hover:text-white' : 'hover:text-white'}
                `}
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
