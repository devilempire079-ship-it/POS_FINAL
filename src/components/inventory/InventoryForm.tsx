import React, { useState, useEffect } from 'react';
import { useInventoryBusinessType, useInventoryConditionalRender } from '../../hooks/useInventoryBusinessType';

interface InventoryFormProps {
  product?: any;
  onSave: (product: any) => Promise<void>;
  onCancel?: () => void;
}

const InventoryForm = ({ product, onSave, onCancel }: InventoryFormProps) => {
  const { config } = useInventoryBusinessType();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    category: '',
    cost: 0,
    price: 0,
    stockQty: 0,
    minStockLevel: 10,
    metadata: {} // Store business-specific attributes
  });

  // Dynamic fields based on business type
  const basicFields = [
    { key: 'name', label: 'Product Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'barcode', label: 'Barcode', type: 'text' },
    { key: 'sku', label: 'SKU', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'cost', label: 'Cost Price', type: 'number' },
    { key: 'price', label: 'Sale Price', type: 'number', required: true },
    { key: 'stockQty', label: 'Initial Stock', type: 'number' },
    { key: 'minStockLevel', label: 'Min Stock Level', type: 'number' }
  ];

  // Special fields for pharmacy
  const pharmacyFields = [
    { key: 'batchNo', label: 'Batch Number', type: 'text', field: 'Batch No' },
    { key: 'expiryDate', label: 'Expiry Date', type: 'date', field: 'Expiry Date' },
    { key: 'controlledSubstances', label: 'Is Controlled Substance', type: 'checkbox', field: 'Controlled Substances' },
    { key: 'deaNumber', label: 'DEA Number', type: 'text', field: 'DEA Number' },
    { key: 'temperatureRange', label: 'Storage Temperature', type: 'text', field: 'Temperature Range' },
    { key: 'storageConditions', label: 'Storage Conditions', type: 'text', field: 'Storage Conditions' }
  ];

  // Special fields for restaurant
  const restaurantFields = [
    { key: 'recipeLink', label: 'Recipe Link/ID', type: 'text', field: 'Recipe Link' },
    { key: 'parLevels', label: 'Par Level', type: 'number', field: 'Par Levels' },
    { key: 'yieldPercentage', label: 'Yield %', type: 'number', field: 'Yield %' },
    { key: 'foodCostPercentage', label: 'Food Cost %', type: 'number', field: 'Food Cost %' },
    { key: 'storageTemp', label: 'Storage Temperature', type: 'text', field: 'Storage Temp' },
    { key: 'allergenInfo', label: 'Allergen Information', type: 'textarea', field: 'Allergen Information' }
  ];

  // Special fields for rental
  const rentalFields = [
    { key: 'serialNos', label: 'Serial Numbers', type: 'textarea', field: 'Serial Nos' },
    { key: 'conditionStatus', label: 'Condition Status', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'], field: 'Condition Status' },
    { key: 'rentalRates', label: 'Daily Rental Rate', type: 'number', field: 'Rental Rates' },
    { key: 'insuranceValue', label: 'Insurance Value', type: 'number', field: 'Insurance Value' },
    { key: 'cleaningSchedule', label: 'Cleaning Interval (days)', type: 'number', field: 'Cleaning Schedule' },
    { key: 'lastMaintenance', label: 'Last Maintenance Date', type: 'date', field: 'Last Maintenance' }
  ];

  // Special fields for retail
  const retailFields = [
    { key: 'warrantyPeriod', label: 'Warranty Period (months)', type: 'number', field: 'Warranty Period' },
    { key: 'supplierReturns', label: 'Supplier Return Policy', type: 'text', field: 'Supplier Returns' },
    { key: 'displayLocation', label: 'Display Location', type: 'text', field: 'Display Location' },
    { key: 'variantSizes', label: 'Available Sizes', type: 'text', field: 'Variant Sizes' },
    { key: 'seasonalGrouping', label: 'Seasonal Group', type: 'text', field: 'Seasonal Grouping' },
    { key: 'customerReturns', label: 'Customer Return Policy', type: 'text', field: 'Customer Returns' }
  ];

  // Load product data on edit
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        barcode: product.barcode || '',
        sku: product.sku || '',
        category: product.category || '',
        cost: product.cost || 0,
        price: product.price || 0,
        stockQty: product.stockQty || 0,
        minStockLevel: product.minStockLevel || 10,
        metadata: product.metadata || {}
      });
    }
  }, [product]);

  const handleFieldChange = (key: string, value: any) => {
    if (config.fields.some(fieldName => fieldName.includes(key))) {
      // This is a special field - store in metadata
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [key]: value
        }
      }));
    } else {
      // Regular field
      setFormData(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const getFieldValue = (key: string) => {
    if (config.fields.some(fieldName => fieldName.includes(key))) {
      return formData.metadata[key] || '';
    }
    return formData[key];
  };

  const renderField = (field: any, isConditional = false) => {
    if (isConditional) {
      // Check if this conditional field is supported by current business type
      if (!config.fields.includes(field.field)) return null;
    }

    const value = getFieldValue(field.key);

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.key} className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select...</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.key} className="flex items-center">
            <input
              id={field.key}
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={field.key} className="ml-2 text-sm font-medium text-gray-700">
              {field.label}
            </label>
          </div>
        );

      default:
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={field.required}
            />
          </div>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <form onSubmit={handleSubmit} className="p-6">
        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {basicFields.map(field => renderField(field))}
        </div>

        {/* Pharmacy Fields */}
        {config.fields.some(f => pharmacyFields.some(pf => pf.field === f)) && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              🏥 Pharmacy-Specific Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pharmacyFields.map(field => renderField(field, true))}
            </div>
          </div>
        )}

        {/* Restaurant Fields */}
        {config.fields.some(f => restaurantFields.some(rf => rf.field === f)) && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              🍽️ Restaurant-Specific Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurantFields.map(field => renderField(field, true))}
            </div>
          </div>
        )}

        {/* Rental Fields */}
        {config.fields.some(f => rentalFields.some(rf => rf.field === f)) && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              🏠 Rental-Specific Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rentalFields.map(field => renderField(field, true))}
            </div>
          </div>
        )}

        {/* Retail Fields */}
        {config.fields.some(f => retailFields.some(rf => rf.field === f)) && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              🛍️ Retail-Specific Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {retailFields.map(field => renderField(field, true))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
