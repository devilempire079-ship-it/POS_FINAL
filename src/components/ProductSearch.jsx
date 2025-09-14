import React, { useState } from 'react';
import { Input } from './ui/input.jsx';
import { Button } from './ui/button.tsx';
import { Plus, Search } from 'lucide-react';

const mockProducts = [
  { id: '1', name: 'Apple iPhone 15', price: 999.99 },
  { id: '2', name: 'Samsung Galaxy S24', price: 799.99 },
  { id: '3', name: 'MacBook Air M3', price: 1299.99 },
  { id: '4', name: 'iPad Pro', price: 1099.99 },
  { id: '5', name: 'AirPods Pro', price: 249.99 },
  { id: '6', name: 'Dell Monitor', price: 299.99 },
  { id: '7', name: 'Wireless Mouse', price: 29.99 },
  { id: '8', name: 'Mechanical Keyboard', price: 89.99 },
];

export function ProductSearch({ onAddProduct }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowResults(true);
    } else {
      setFilteredProducts([]);
      setShowResults(false);
    }
  };

  const handleAddProduct = (product) => {
    onAddProduct({ ...product, quantity: 1 });
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {showResults && filteredProducts.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                onClick={() => handleAddProduct(product)}
              >
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-gray-500">${product.price.toFixed(2)}</p>
                </div>
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          {searchTerm ? (
            showResults && filteredProducts.length === 0 ? (
              <p>No products found</p>
            ) : null
          ) : (
            <div>
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Start typing to search for products</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
