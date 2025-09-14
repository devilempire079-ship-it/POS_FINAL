import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Minus,
  Package,
  Box,
  ShoppingCart,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

const EnhancedQuantityDialog = ({ product, onClose, onSubmit }) => {
  const [quantity, setQuantity] = useState(1);
  const [unitType, setUnitType] = useState('unit');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef(null);

  // Calculate totals based on unit type and conversion rate
  const conversionRate = product?.conversionRate || 1;
  const unitPrice = product?.price || 0;
  const minOrderQty = product?.minOrderQty || 1;
  const unitOfMeasure = product?.unitOfMeasure || 'each';

  const getTotalUnits = () => {
    switch (unitType) {
      case 'unit':
        return quantity;
      case 'pack':
        return quantity * conversionRate;
      case 'wholesale':
        return quantity * conversionRate;
      default:
        return quantity;
    }
  };

  const getTotalPrice = () => {
    return getTotalUnits() * unitPrice;
  };

  const getUnitLabel = () => {
    switch (unitType) {
      case 'unit':
        return 'Units';
      case 'pack':
        return 'Packs';
      case 'wholesale':
        return 'Wholesale Units';
      default:
        return 'Units';
    }
  };

  const getMaxQuantity = () => {
    const stockQty = product?.stockQty || 0;
    switch (unitType) {
      case 'unit':
        return stockQty;
      case 'pack':
      case 'wholesale':
        return Math.floor(stockQty / conversionRate);
      default:
        return stockQty;
    }
  };

  useEffect(() => {
    // Focus the input when dialog opens
    if (inputRef.current && !showAdvanced) {
      inputRef.current.focus();
    }

    // Handle keyboard events
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !showAdvanced) {
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showAdvanced]);

  // Reset quantity when unit type changes
  useEffect(() => {
    setQuantity(1);
  }, [unitType]);

  const handleSubmit = () => {
    const totalUnits = getTotalUnits();
    if (totalUnits > 0 && totalUnits <= (product?.stockQty || 0)) {
      onSubmit(totalUnits, unitType);
    }
  };

  const handleQuantityChange = (value) => {
    const numValue = parseInt(value, 10);
    const maxQty = getMaxQuantity();

    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxQty) {
      // Ensure quantity is a multiple of minOrderQty
      const adjustedValue = Math.round(numValue / minOrderQty) * minOrderQty;
      setQuantity(adjustedValue);
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
    handleQuantityChange(value);
  };

  const increment = () => {
    const maxQty = getMaxQuantity();
    setQuantity(prev => prev < maxQty ? prev + 1 : prev);
  };

  const decrement = () => {
    setQuantity(prev => prev > 0 ? prev - 1 : 0);
  };

  const quickSelectQuantity = (qty) => {
    const maxQty = getMaxQuantity();
    setQuantity(Math.min(qty, maxQty));
  };

  const maxQty = getMaxQuantity();
  const totalUnits = getTotalUnits();
  const totalPrice = getTotalPrice();
  const isOutOfStock = maxQty === 0;
  const isLowStock = maxQty > 0 && maxQty <= 5;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add to Cart</h3>
                <p className="text-blue-100 text-sm">{product?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-900 text-lg">{product?.name}</h4>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">${unitPrice.toFixed(2)}</div>
                <div className="text-sm text-gray-500">per unit</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-1 text-sm ${
                  isOutOfStock ? 'text-red-600' :
                  isLowStock ? 'text-orange-600' : 'text-green-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isOutOfStock ? 'bg-red-500' :
                    isLowStock ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <span>
                    {isOutOfStock ? 'Out of Stock' :
                     isLowStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {product?.stockQty || 0} units available
                </span>
              </div>
              <span className="text-sm text-gray-500">{product?.sku || 'No SKU'}</span>
            </div>
          </div>

          {/* Unit Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Unit Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setUnitType('unit')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  unitType === 'unit'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Package className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Unit</div>
                <div className="text-xs text-gray-500">Individual</div>
              </button>

              <button
                onClick={() => setUnitType('pack')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  unitType === 'pack'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Box className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Pack</div>
                <div className="text-xs text-gray-500">{conversionRate} units</div>
              </button>

              <button
                onClick={() => setUnitType('wholesale')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  unitType === 'wholesale'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ShoppingCart className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Wholesale</div>
                <div className="text-xs text-gray-500">{conversionRate} units</div>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Quantity ({getUnitLabel()})
            </label>

            <div className="flex items-center space-x-3">
              <button
                onClick={decrement}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                disabled={quantity <= 0}
              >
                <Minus className="h-5 w-5" />
              </button>

              <input
                ref={inputRef}
                type="number"
                min="0"
                max={maxQty}
                value={quantity}
                onChange={handleInputChange}
                onFocus={(e) => e.target.select()}
                className="flex-1 text-center text-2xl font-bold py-3 px-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isOutOfStock}
              />

              <button
                onClick={increment}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                disabled={quantity >= maxQty || isOutOfStock}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Quantity Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[1, 2, 5, 10, 20].map(qty => (
                <button
                  key={qty}
                  onClick={() => quickSelectQuantity(qty)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors touch-manipulation"
                  disabled={qty > maxQty || isOutOfStock}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-gray-900 mb-3">Order Summary</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity} {getUnitLabel().toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Units:</span>
                <span className="font-medium">{totalUnits} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Price:</span>
                <span className="font-medium">${unitPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total Price:</span>
                <span className="font-bold text-lg text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Stock Warning */}
          {isOutOfStock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">Out of Stock</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                This product is currently out of stock and cannot be added to the cart.
              </p>
            </div>
          )}

          {isLowStock && !isOutOfStock && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-orange-800 font-medium">Low Stock Warning</span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Only {maxQty} {getUnitLabel().toLowerCase()} available.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={totalUnits === 0 || isOutOfStock}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center space-x-2"
            >
              <Check className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Advanced Options Toggle */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h6 className="font-medium text-gray-900 mb-2">Advanced Options</h6>
              <div className="space-y-2 text-sm text-gray-600">
                <div>Conversion Rate: {conversionRate} units per pack/wholesale</div>
                <div>Stock Level: {product?.stockQty || 0} units</div>
                <div>Reorder Point: {product?.reorderPoint || 10} units</div>
                <div>Last Restocked: {product?.lastRestocked ? new Date(product.lastRestocked).toLocaleDateString() : 'Never'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuantityDialog;
