import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CustomerQuickSearch = ({ onCustomerSelect, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    const searchCustomers = async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        setIsSearching(true);
        const results = await api.searchCustomers(query);
        setSearchResults(results.customers || []);
        setShowResults(true);
      } catch (error) {
        console.error('Customer search error:', error);
        toast.error('Failed to search customers');
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(() => searchCustomers(searchTerm), 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleCustomerSelect = (customer) => {
    onCustomerSelect(customer);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleCreateNew = () => {
    onCreateNew();
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && searchResults.length > 0) {
      // Set focus to first result
      const firstResult = document.querySelector('.customer-result');
      if (firstResult) firstResult.focus();
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search customers by name, email, or phone..."
              className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
              autoFocus
            />
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-4 bg-green-600 text-lg font-semibold text-white rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 touch-action-manipulation min-h-[60px]s"
          >
            ➕ New Customer
          </button>
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <span className="font-medium">Keyboard shortcuts:</span> ↑↓ to navigate • Enter to select • Esc to close
        </div>
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {searchResults.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleCustomerSelect(customer)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.email || customer.phone}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.customerType} • {customer.totalOrders} orders • ${customer.totalSpent}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {customer.loyaltyPoints} pts
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.customerType === 'vip' ? '👑' :
                       customer.customerType === 'wholesale' ? '🏪' : '👤'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-4 py-3 text-center text-gray-500">
            Searching customers...
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && searchResults.length === 0 && !isSearching && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-4 py-3 text-center">
            <div className="text-gray-500 mb-2">No customers found</div>
            <button
              onClick={handleCreateNew}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Create new customer instead?
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerQuickSearch;
