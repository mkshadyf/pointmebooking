import React, { useState } from 'react';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  categories?: string[];
  onCategorySelect?: (category: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, categories, onCategorySelect }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (onCategorySelect) {
      onCategorySelect(value);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <input
        type="text"
        value={query}
        onChange={handleSearchChange}
        placeholder="Search services..."
        className="border rounded-md p-2"
      />
      {categories && (
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="border rounded-md p-2"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
