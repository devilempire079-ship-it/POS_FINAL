import { useState } from 'react';
import { getUnifiedConfig } from '../../configs/inventory/unifiedConfigs';

interface UnifiedInventoryFormProps {
  businessType?: string;
  onSave?: (data: any) => void;
}

export function UnifiedInventoryForm({
  businessType = 'retail',
  onSave
}: UnifiedInventoryFormProps) {
  const [formData, setFormData] = useState({});

  // Get unified config for current business type
  const config = getUnifiedConfig(businessType);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(formData);
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 rounded-lg shadow-lg ${config.ui.theme}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-4">
          {config.businessType.toUpperCase()} Inventory Management
        </h2>
        <p className="text-sm text-center opacity-75">
          Dynamic form powered by unified config system
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Name - always shown */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product name"
            onChange={(e) => handleInputChange('productName', e.target.value)}
          />
        </div>

        {/* Dynamic fields based on business type config */}
        {config.ui.fields.map(field => {
          const labels: Record<string, string> = {
            'Batch No': 'DEA Batch Number',
            'Expiry Date': 'Expiration Date',
            'Manufacturer': 'Manufacturer',
            'Prescription Required': 'Prescription Required',
            'Controlled Substance Flag': 'DEA Controlled Substance',
            'Ingredient Type': 'Ingredient Category',
            'Recipe Mapping': 'Recipe Association',
            'Storage Temperature': 'Storage Temperature (°F)',
            'Supplier Notes': 'Supplier Preferences',
            'Asset Condition': 'Asset Condition',
            'Rental Rate': 'Daily Rental Rate ($)',
            'Contract ID': 'Rental Contract ID',
            'Deposit Amount': 'Security Deposit ($)',
            'Maintenance Schedule': 'Maintenance Schedule',
            'Variant Options': 'Size/Color/Style Variants',
            'Barcode/UPC': 'Barcode/UPC Code',
            'Warranty Period': 'Warranty Period (months)',
            'Discount Eligibility': 'Eligible for Discounts',
            'Bundle Pack': 'Bundle/Package Options'
          };

          const renderInput = () => {
            if (field === 'Expiry Date') {
              return (
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                />
              );
            }

            if (field === 'Prescription Required' || field === 'Controlled Substance Flag') {
              return (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleInputChange(field.toLowerCase().replace(/\s+/g, ''), e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              );
            }

            if (field === 'Storage Temperature') {
              return (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleInputChange('storageTemperature', e.target.value)}
                >
                  <option value="">Select temperature...</option>
                  <option value="-10">Freezer (-10°F)</option>
                  <option value="35">Refrigerator (35°F)</option>
                  <option value="70">Pantry (70°F)</option>
                </select>
              );
            }

            return (
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${field.toLowerCase()}`}
                onChange={(e) => handleInputChange(field.toLowerCase().replace(/\s+/g, ''), e.target.value)}
              />
            );
          };

          return (
            <div key={field}>
              <label className="block text-sm font-medium mb-2">
                {labels[field] || field}
              </label>
              {renderInput()}
            </div>
          );
        })}

        {/* Category selection from config */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleInputChange('category', e.target.value)}
          >
            <option value="">Select category...</option>
            {config.ui.defaultCategories.map(category => (
              <option key={category} value={category.toLowerCase().replace(/\s+/g, '_')}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save {config.businessType.charAt(0).toUpperCase() + config.businessType.slice(1)} Inventory Item
          </button>
        </div>

        {/* Debug info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-md text-xs">
          <h4 className="font-semibold mb-2">Live Config Data (for debugging):</h4>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify({
              businessType: config.businessType,
              uiFieldsCount: config.ui.fields.length,
              backendWorkflowsCount: config.workflows.length,
              currentTheme: config.ui.theme
            }, null, 2)}
          </pre>
        </div>
      </form>
    </div>
  );
}
