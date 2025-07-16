import React, { useState } from 'react';
import { Filter } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Filtrar por categoria</h2>
      </div>
      
      {/* Desktop Filter */}
      <div className="hidden sm:flex items-center space-x-2">
        <button
          onClick={() => onCategoryChange('Todos')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            selectedCategory === 'Todos'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Mobile Filter */}
      <div className="sm:hidden w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg"
        >
          <span>{selectedCategory}</span>
          <Filter className="h-4 w-4" />
        </button>
        
        {isOpen && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <button
              onClick={() => {
                onCategoryChange('Todos');
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                selectedCategory === 'Todos' ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onCategoryChange(category);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                  selectedCategory === category ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;