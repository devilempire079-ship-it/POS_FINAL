import React, { useState, useEffect, useRef } from 'react';

const QuantityDialog = ({ product, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input when dialog opens
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Handle keyboard events
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = () => {
    if (quantity > 0) {
      onSubmit(quantity);
    }
  };

  const handleQuantityChange = (value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantity(numValue);
    } else if (value === '') {
      setQuantity(0);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity(0);
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0) {
      setQuantity(numValue);
    }
  };

  const increment = () => {
    setQuantity(prev => prev + 1);
  };

  const decrement = () => {
    setQuantity(prev => prev > 0 ? prev - 1 : 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Enter Quantity</h3>
        </div>
        
        <div className="p-6">
          {product && (
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                <span className="font-semibold">${product.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Stock: {product.stockQty} available</p>
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-4 py-2 bg-gray-200 rounded-l-md hover:bg-gray-300 focus:outline-none"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                ref={inputRef}
                type="number"
                id="quantity"
                min="0"
                value={quantity}
                onChange={handleInputChange}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-2 border-t border-b border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter quantity"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-4 py-2 bg-gray-200 rounded-r-md hover:bg-gray-300 focus:outline-none"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantityDialog;
