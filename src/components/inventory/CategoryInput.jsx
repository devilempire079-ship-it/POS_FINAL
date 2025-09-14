import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X } from 'lucide-react';

const CategoryInput = ({ value, onChange, categories = [], placeholder = "Select or type category..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Default categories if none provided
  const defaultCategories = [
    'Beverages',
    'Dairy',
    'Bakery',
    'Produce',
    'Pantry',
    'Frozen',
    'Specialty',
    'Snacks',
    'Household',
    'Personal Care'
  ];

  const allCategories = categories.length > 0 ? categories : defaultCategories;

  // Filter categories based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allCategories.filter(cat =>
        cat.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCategories(filtered);

      // Check if input exactly matches any category
      const exactMatch = allCategories.some(cat =>
        cat.toLowerCase() === inputValue.toLowerCase()
      );
      setShowNewCategory(!exactMatch && inputValue.trim().length > 0);
    } else {
      setFilteredCategories(allCategories);
      setShowNewCategory(false);
    }
  }, [inputValue, allCategories]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);

    // Call onChange with the new value
    onChange(newValue);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setInputValue(category);
    setIsOpen(false);
    onChange(category);
  };

  // Handle creating new category
  const handleCreateNewCategory = () => {
    setInputValue(inputValue.trim());
    setIsOpen(false);
    onChange(inputValue.trim());
  };

  // Handle clearing input
  const handleClear = () => {
    setInputValue('');
    setIsOpen(false);
    onChange('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if current input is a new category
  const isNewCategory = inputValue.trim() &&
    !allCategories.some(cat => cat.toLowerCase() === inputValue.toLowerCase());

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />

        {/* Dropdown Toggle & Clear Buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* New Category Indicator */}
      {isNewCategory && (
        <div className="mt-1 flex items-center text-sm text-blue-600">
          <Plus size={14} className="mr-1" />
          <span>Creating new category: "{inputValue}"</span>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Existing Categories */}
          {filteredCategories.length > 0 && (
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                Existing Categories
              </div>
              {filteredCategories.map((category, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{category}</span>
                    {category.toLowerCase() === inputValue.toLowerCase() && (
                      <span className="text-blue-600 text-sm">Current</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Create New Category */}
          {showNewCategory && (
            <div className="border-t border-gray-200">
              <button
                type="button"
                onClick={handleCreateNewCategory}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
              >
                <div className="flex items-center text-blue-600">
                  <Plus size={16} className="mr-2" />
                  <span>Create "{inputValue}"</span>
                </div>
              </button>
            </div>
          )}

          {/* No Results */}
          {filteredCategories.length === 0 && !showNewCategory && inputValue.trim() && (
            <div className="px-4 py-3 text-gray-500 text-center">
              No categories found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryInput;
