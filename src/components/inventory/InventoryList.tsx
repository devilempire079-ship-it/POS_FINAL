import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash, Plus, Eye, BarChart3 } from 'lucide-react';
import { useInventoryBusinessType } from '../../hooks/useInventoryBusinessType';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  stockQty: number;
  minStockLevel: number;
  price: number;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface InventoryListProps {
  onItemSelect?: (item: InventoryItem) => void;
  onItemEdit?: (item: InventoryItem) => void;
  onItemDelete?: (item: InventoryItem) => void;
  onCreateNew?: () => void;
}

const InventoryList = ({ onItemSelect, onItemEdit, onItemDelete, onCreateNew }: InventoryListProps) => {
  const { config } = useInventoryBusinessType();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState(20);

  // Simulated data - replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      const mockItems: InventoryItem[] = [
        {
          id: 1,
          name: 'Aspirin 81mg',
          sku: 'MED-ASP-81',
          category: 'Pain Relief',
          stockQty: 150,
          minStockLevel: 20,
          price: 12.99,
          createdAt: '2025-01-01',
          metadata: {
            batchNo: 'BAT001',
            expiryDate: '2026-01-01',
            controlledSubstances: false,
            deaNumber: null,
            temperatureRange: 'Room temperature',
            storageConditions: 'Keep in dry place'
          }
        },
        {
          id: 2,
          name: 'Band-Aids Mixed',
          sku: 'FIRST-101',
          category: 'First Aid',
          stockQty: 75,
          minStockLevel: 10,
          price: 4.99,
          createdAt: '2025-01-02',
          metadata: {
            retailSpecific: {
              warrantyPeriod: 0,
              supplierReturns: '90 days',
              displayLocation: 'Counter display',
              variantSizes: 'Small, Medium, Large',
              seasonalGrouping: 'Year-round',
              customerReturns: 'Acceptable'
            }
          }
        }
      ];
      setItems(mockItems);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const categories = [...new Set(items.map(item => item.category))];

  const getStockStatus = (qty: number, minLevel: number) => {
    if (qty === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (qty <= minLevel) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const getSpecialFieldDisplay = (item: InventoryItem, fieldName: string) => {
    if (!item.metadata) return null;

    // Handle nested structures (like retail.fields)
    if (item.metadata[fieldName]) {
      const value = item.metadata[fieldName];
      return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
    }

    return item.metadata[fieldName] ? String(item.metadata[fieldName]) : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${config.theme}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            📦 Inventory Management
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredItems.length} items • {config.fields.length} custom fields for your business type
          </p>
        </div>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="flex items-center text-sm text-gray-600">
          <BarChart3 className="w-4 h-4 mr-2" />
          {items.reduce((sum, item) => sum + item.stockQty, 0)} total units in stock
        </div>
      </div>

      {/* Special Fields Indicator */}
      {config.fields.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">This inventory includes {config.fields.length} {config.fields.length === 1 ? 'special field' : 'special fields'} for your business type:</h4>
          <div className="flex flex-wrap gap-2">
            {config.fields.map((field, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>

              {/* Dynamic Special Fields Header */}
              {config.fields.slice(0, 2).map(field => (
                <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {field}
                </th>
              ))}
              {config.fields.length > 2 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  +{config.fields.length - 2} More
                </th>
              )}

              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedItems.map(item => {
              const stockStatus = getStockStatus(item.stockQty, item.minStockLevel);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                      {item.stockQty}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      Min: {item.minStockLevel}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.price.toFixed(2)}
                  </td>

                  {/* Dynamic Special Fields */}
                  {config.fields.slice(0, 2).map(field => (
                    <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getSpecialFieldDisplay(item, field.toLowerCase().replace(/ /g, '')) || getSpecialFieldDisplay(item, field) || '-'}
                      {field === 'Expiry Date' && getSpecialFieldDisplay(item, 'expiryDate') && (
                        <div className="text-xs text-red-500">
                          {new Date(getSpecialFieldDisplay(item, 'expiryDate')!) < new Date() ? 'Expired' : 'Valid'}
                        </div>
                      )}
                    </td>
                  ))}
                  {config.fields.length > 2 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {config.fields.length - 2} fields
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {onItemSelect && (
                        <button
                          onClick={() => onItemSelect(item)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onItemEdit && (
                        <button
                          onClick={() => onItemEdit(item)}
                          className="text-green-600 hover:text-green-900 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onItemDelete && (
                        <button
                          onClick={() => onItemDelete(item)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, filteredItems.length)} of {filteredItems.length} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-gray-700">
            Page {page} of {Math.ceil(filteredItems.length / pageSize)}
          </span>
          <button
            onClick={() => setPage(prev => prev + 1)}
            disabled={page === Math.ceil(filteredItems.length / pageSize)}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
