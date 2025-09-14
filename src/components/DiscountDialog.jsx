import React, { useState, useEffect } from 'react';
import {
  Percent,
  DollarSign,
  X,
  Check,
  Calculator,
  Tag
} from 'lucide-react';

const DiscountDialog = ({
  item,
  currentDiscount = 0,
  onApply,
  onClose,
  type = 'item' // 'item' or 'invoice'
}) => {
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(item?.price || 0);

  const itemPrice = item?.price || 0;
  const itemQuantity = item?.quantity || 1;
  const subtotal = itemPrice * itemQuantity;

  // Predefined discount reasons
  const discountReasons = [
    'Loyalty Program',
    'Employee Discount',
    'Bulk Purchase',
    'Damaged Goods',
    'Manager Approval',
    'Seasonal Sale',
    'Clearance',
    'VIP Customer',
    'First Time Customer',
    'Custom'
  ];

  // Quick discount presets
  const quickDiscounts = [
    { label: '5%', value: 5, type: 'percentage' },
    { label: '10%', value: 10, type: 'percentage' },
    { label: '15%', value: 15, type: 'percentage' },
    { label: '20%', value: 20, type: 'percentage' },
    { label: '25%', value: 25, type: 'percentage' },
    { label: '$1', value: 1, type: 'fixed' },
    { label: '$2', value: 2, type: 'fixed' },
    { label: '$5', value: 5, type: 'fixed' },
    { label: '$10', value: 10, type: 'fixed' }
  ];

  // Calculate discount when values change
  useEffect(() => {
    const value = parseFloat(discountValue) || 0;
    let discount = 0;

    if (discountType === 'percentage') {
      discount = (subtotal * value) / 100;
    } else {
      discount = Math.min(value * itemQuantity, subtotal); // Fixed amount per item
    }

    setCalculatedDiscount(discount);
    setFinalPrice(subtotal - discount);
  }, [discountValue, discountType, subtotal, itemQuantity]);

  const handleQuickDiscount = (preset) => {
    setDiscountType(preset.type);
    setDiscountValue(preset.value.toString());
  };

  const handleApply = () => {
    if (calculatedDiscount > 0) {
      onApply({
        type: discountType,
        value: parseFloat(discountValue),
        amount: calculatedDiscount,
        reason: discountReason,
        itemId: item?.id
      });
    }
  };

  const handleClear = () => {
    setDiscountValue('');
    setCalculatedDiscount(0);
    setFinalPrice(subtotal);
    setDiscountReason('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {type === 'item' ? 'Item Discount' : 'Invoice Discount'}
                </h3>
                <p className="text-green-100 text-sm">
                  {item?.name || 'Apply discount'}
                </p>
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
          {/* Item Summary */}
          {item && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="text-lg font-bold text-gray-900">
                  ${item.price.toFixed(2)} × {item.quantity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Discount Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDiscountType('percentage')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  discountType === 'percentage'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Percent className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Percentage</div>
              </button>

              <button
                onClick={() => setDiscountType('fixed')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  discountType === 'fixed'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="h-5 w-5 mx-auto mb-1" />
                <div className="text-sm font-medium">Fixed Amount</div>
              </button>
            </div>
          </div>

          {/* Discount Value Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Discount Value
            </label>
            <div className="relative">
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '10' : '5.00'}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                min="0"
                step={discountType === 'percentage' ? '1' : '0.01'}
              />
              <div className="absolute right-3 top-3.5 text-gray-500">
                {discountType === 'percentage' ? '%' : '$'}
              </div>
            </div>
          </div>

          {/* Quick Discount Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Quick Discounts
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickDiscounts.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickDiscount(preset)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors touch-manipulation"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Discount Reason */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <select
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select reason...</option>
              {discountReasons.map((reason, index) => (
                <option key={index} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* Discount Summary */}
          {calculatedDiscount > 0 && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h5 className="font-semibold text-gray-900 mb-3">Discount Summary</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">
                    -${calculatedDiscount.toFixed(2)}
                    {discountType === 'percentage' && (
                      <span className="text-sm ml-1">({discountValue}%)</span>
                    )}
                  </span>
                </div>
                <div className="border-t border-green-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Final Price:</span>
                  <span className="font-bold text-lg text-green-600">
                    ${finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClear}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors touch-manipulation"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={calculatedDiscount === 0}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center space-x-2"
            >
              <Check className="h-5 w-5" />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountDialog;
