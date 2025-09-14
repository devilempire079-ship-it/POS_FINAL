import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProducts } from '../../hooks/useProducts';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Package,
  AlertTriangle,
  TrendingUp,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  Settings
} from 'lucide-react';

const StockManagement = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [stockByLocation, setStockByLocation] = useState({});
  const [transferForm, setTransferForm] = useState({
    productId: '',
    fromLocationId: '',
    toLocationId: '',
    quantity: 0,
    reason: ''
  });
  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: '',
    locationId: '',
    adjustmentType: 'increase',
    quantity: 0,
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [bulkAdjustments, setBulkAdjustments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Advanced filtering and sorting
  const [filters, setFilters] = useState({
    category: '',
    supplier: '',
    stockStatus: '', // in-stock, low-stock, out-of-stock
    sortBy: 'name',
    sortOrder: 'asc',
    showFilters: false
  });
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Refs for debounced search
  const searchTimeoutRef = useRef(null);

  // Enhanced product search with debouncing
  const performProductSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=10`);
      setSearchResults(results);
    } catch (error) {
      console.error('Product search failed:', error);
      toast.error('Product search failed');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced product search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const debounceDelay = searchTerm.length > 2 ? 100 : 200;

    searchTimeoutRef.current = setTimeout(() => {
      performProductSearch(searchTerm);
    }, debounceDelay);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, performProductSearch]);

  // Handle product selection from search
  const handleProductSelect = (product) => {
    setAdjustmentForm({
      ...adjustmentForm,
      productId: product.id.toString()
    });
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Mock products data - replace with actual API
  useEffect(() => {
    const fetchProducts = async () => {
        // Mock locations
        setLocations([
          { id: 1, name: 'Main Warehouse', type: 'warehouse', address: '123 Main St' },
          { id: 2, name: 'Store Front', type: 'store', address: '456 Shop Ave' },
          { id: 3, name: 'Back Stock Room', type: 'storeroom', address: '123 Main St, Rear' }
        ]);

        setProducts([
          { id: 1, name: 'Premium Coffee', minStock: 10, supplier: 'Global Coffee Co', totalStock: 150,
            stockByLocation: { 1: 100, 2: 35, 3: 15 } }, // Warehouse: 100, Store: 35, Back Room: 15
          { id: 2, name: 'Organic Milk 1L', minStock: 8, supplier: 'Farm Fresh Dairy', totalStock: 60,
            stockByLocation: { 1: 40, 2: 15, 3: 5 } }, // Warehouse: 40, Store: 15, Back Room: 5
          { id: 3, name: 'Whole Wheat Bread', minStock: 5, supplier: 'Local Bakery Co', totalStock: 45,
            stockByLocation: { 1: 20, 2: 20, 3: 5 } }, // Warehouse: 20, Store: 20, Back Room: 5
          { id: 4, name: 'Premium Chocolate Pack', minStock: 3, supplier: 'Chocolate Heaven', totalStock: 25,
            stockByLocation: { 1: 15, 2: 8, 3: 2 } }, // Warehouse: 15, Store: 8, Back Room: 2
          { id: 5, name: 'Organic Bananas', minStock: 20, supplier: 'Organic Farms', totalStock: 200,
            stockByLocation: { 1: 150, 2: 40, 3: 10 } } // Warehouse: 150, Store: 40, Back Room: 10
        ]);

        // Mock recent adjustments
        setAdjustments([
          { id: 1, product: 'Premium Coffee', type: 'increase', quantity: 10, reason: 'Rcpt#001', date: new Date(), performedBy: 'Admin', location: 'Main Warehouse' },
          { id: 2, product: 'Organic Milk 1L', type: 'decrease', quantity: 5, reason: 'Loss/Damaged', date: new Date(Date.now() - 86400000), performedBy: 'Manager', location: 'Store Front' },
          { id: 3, product: 'Whole Wheat Bread', type: 'transfer', quantity: 20, reason: 'Stock Transfer to Store', date: new Date(Date.now() - 172800000), performedBy: 'Admin', location: 'Main Warehouse → Store Front' }
        ]);
    };

    fetchProducts();
  }, []);

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!adjustmentForm.productId || !adjustmentForm.reason || adjustmentForm.quantity <= 0) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const product = products.find(p => p.id.toString() === adjustmentForm.productId);
      const newAdjustment = {
        id: adjustments.length + 1,
        product: product.name,
        type: adjustmentForm.adjustmentType,
        quantity: adjustmentForm.quantity,
        reason: adjustmentForm.reason,
        date: new Date(),
        performedBy: 'Current User',
        notes: adjustmentForm.notes
      };

      setAdjustments([newAdjustment, ...adjustments]);

      // Reset form
      setAdjustmentForm({
        productId: '',
        adjustmentType: 'increase',
        quantity: 0,
        reason: '',
        notes: ''
      });

      alert('Stock adjustment completed successfully!');
    } catch (error) {
      alert('Error adjusting stock. Please try again.');
    }
    setLoading(false);
  };

  const handleBulkAdjustment = async () => {
    if (bulkAdjustments.length === 0) {
      alert('No adjustments to process');
      return;
    }

    setLoading(true);
    try {
      // Simulate bulk processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const processedAdjustments = bulkAdjustments.map(adj => ({
        id: adjustments.length + adj.id,
        product: products.find(p => p.id === adj.productId)?.name || 'Unknown',
        type: adj.type,
        quantity: adj.quantity,
        reason: adj.reason,
        date: new Date(),
        performedBy: 'Bulk Process'
      }));

      setAdjustments([...processedAdjustments, ...adjustments]);
      setBulkAdjustments([]);

      alert(`Successfully processed ${bulkAdjustments.length} stock adjustments!`);
    } catch (error) {
      alert('Error processing bulk adjustments. Please try again.');
    }
    setLoading(false);
  };

  const addBulkAdjustment = () => {
    const newBulkAdjust = {
      id: Date.now(),
      productId: selectedProduct?.id || '',
      type: 'increase',
      quantity: 0,
      reason: ''
    };
    setBulkAdjustments([...bulkAdjustments, newBulkAdjust]);
  };

  const updateBulkAdjustment = (index, field, value) => {
    const updated = [...bulkAdjustments];
    updated[index][field] = value;
    setBulkAdjustments(updated);
  };

  const removeBulkAdjustment = (index) => {
    setBulkAdjustments(bulkAdjustments.filter((_, i) => i !== index));
  };

  const StockLevelIndicator = ({ current, minimum }) => {
    const ratio = current / minimum;
    let color = 'red-500';
    let status = 'Low';

    if (ratio >= 2) {
      color = 'green-500';
      status = 'Good';
    } else if (ratio >= 1.5) {
      color = 'yellow-500';
      status = 'Medium';
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${color} text-white`}>
        {status}
      </span>
    );
  };

  // Calculate dashboard metrics
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * 10), 0); // Mock pricing
  const pendingAdjustments = bulkAdjustments.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
            <Download className="h-4 w-4 inline mr-2" />
            Export Report
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200">
            <Plus className="h-4 w-4 inline mr-2" />
            Quick Adjust
          </button>
        </div>
      </div>

      {/* Real-Time Stock Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-xs text-green-600 mt-1">↗️ +2 this week</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
              <p className="text-xs text-orange-600 mt-1">⚠️ Needs attention</p>
            </div>
          </div>
        </div>

        {/* Stock Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toFixed(2)}</p>
              <p className="text-xs text-green-600 mt-1">↗️ +12% this month</p>
            </div>
          </div>
        </div>

        {/* Pending Adjustments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Adjustments</p>
              <p className="text-2xl font-bold text-gray-900">{pendingAdjustments}</p>
              <p className="text-xs text-purple-600 mt-1">Ready to process</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts Section */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            Stock Alerts
          </h3>
          <div className="space-y-3">
            {outOfStockCount > 0 && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    {outOfStockCount} product{outOfStockCount > 1 ? 's' : ''} out of stock
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Immediate restocking required
                  </p>
                </div>
                <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                  View Details
                </button>
              </div>
            )}

            {lowStockCount > 0 && (
              <div className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    {lowStockCount} product{lowStockCount > 1 ? 's' : ''} low on stock
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    Consider reordering soon
                  </p>
                </div>
                <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200">
                  View Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Product Search & Filters</h3>
          <button
            onClick={() => setFilters({...filters, showFilters: !filters.showFilters})}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            {filters.showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search products for stock adjustment..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-4 top-3.5 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          {searchLoading && (
            <div className="absolute right-4 top-3.5">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {filters.showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="beverages">Beverages</option>
                <option value="dairy">Dairy</option>
                <option value="bakery">Bakery</option>
                <option value="snacks">Snacks</option>
                <option value="produce">Produce</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select
                value={filters.supplier}
                onChange={(e) => setFilters({...filters, supplier: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Suppliers</option>
                <option value="Global Coffee Co">Global Coffee Co</option>
                <option value="Farm Fresh Dairy">Farm Fresh Dairy</option>
                <option value="Local Bakery Co">Local Bakery Co</option>
                <option value="Chocolate Heaven">Chocolate Heaven</option>
                <option value="Organic Farms">Organic Farms</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select
                value={filters.stockStatus}
                onChange={(e) => setFilters({...filters, stockStatus: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name</option>
                <option value="currentStock">Stock Level</option>
                <option value="supplier">Supplier</option>
                <option value="minStock">Min Stock</option>
              </select>
            </div>
          </div>
        )}

        {/* Enhanced Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto mt-2">
            {searchResults.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">ID: {product.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">${product.price?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stockQty || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Product Display */}
        {adjustmentForm.productId && !showSearchResults && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-800">
              Selected: {products.find(p => p.id.toString() === adjustmentForm.productId)?.name || 'Product'}
            </p>
          </div>
        )}
      </div>

      {/* Single Adjustment Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Adjustment</h2>
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product</label>
              <select
                value={adjustmentForm.productId}
                onChange={(e) => setAdjustmentForm({...adjustmentForm, productId: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Current: {product.currentStock}, Min: {product.minStock})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Adjustment Type</label>
              <select
                value={adjustmentForm.adjustmentType}
                onChange={(e) => setAdjustmentForm({...adjustmentForm, adjustmentType: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="increase">Increase Stock (+)</option>
                <option value="decrease">Decrease Stock (-)</option>
                <option value="set">Set to Specific Value</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity {adjustmentForm.adjustmentType !== 'set' ? '(±)' : ''}
              </label>
              <input
                type="number"
                value={adjustmentForm.quantity}
                onChange={(e) => setAdjustmentForm({...adjustmentForm, quantity: parseInt(e.target.value) || 0})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <select
                value={adjustmentForm.reason}
                onChange={(e) => setAdjustmentForm({...adjustmentForm, reason: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Reason</option>
                <option value="Restock">Restock</option>
                <option value="Loss/Damaged">Loss/Damaged</option>
                <option value="Return">Return</option>
                <option value="Correction">Correction</option>
                <option value="Physical Count">Physical Count</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              value={adjustmentForm.notes}
              onChange={(e) => setAdjustmentForm({...adjustmentForm, notes: e.target.value})}
              rows="2"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition duration-200"
          >
            {loading ? 'Processing...' : 'Adjust Stock'}
          </button>
        </form>
      </div>

      {/* Bulk Operations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Bulk Stock Adjustments</h2>

        <div className="space-y-4">
          <button
            onClick={addBulkAdjustment}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
          >
            Add Adjustment
          </button>

          <div className="space-y-2">
            {bulkAdjustments.map((adj, index) => (
              <div key={adj.id} className="flex items-center space-x-3 p-3 border rounded-md">
                <select
                  value={adj.productId}
                  onChange={(e) => updateBulkAdjustment(index, 'productId', e.target.value)}
                  className="flex-1 border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>

                <select
                  value={adj.type}
                  onChange={(e) => updateBulkAdjustment(index, 'type', e.target.value)}
                  className="w-32 border-gray-300 rounded-md shadow-sm"
                >
                  <option value="increase">+</option>
                  <option value="decrease">-</option>
                  <option value="set">=</option>
                </select>

                <input
                  type="number"
                  value={adj.quantity}
                  onChange={(e) => updateBulkAdjustment(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-24 border-gray-300 rounded-md shadow-sm"
                  min="0"
                  required
                />

                <input
                  type="text"
                  placeholder="Reason"
                  value={adj.reason}
                  onChange={(e) => updateBulkAdjustment(index, 'reason', e.target.value)}
                  className="flex-1 border-gray-300 rounded-md shadow-sm"
                  required
                />

                <button
                  onClick={() => removeBulkAdjustment(index)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {bulkAdjustments.length > 0 && (
            <button
              onClick={handleBulkAdjustment}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 transition duration-200"
            >
              {loading ? 'Processing...' : `Process ${bulkAdjustments.length} Adjustments`}
            </button>
          )}
        </div>
      </div>

      {/* Recent Adjustments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Adjustments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adjustments.map((adj) => (
                <tr key={adj.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adj.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                      adj.type === 'increase' ? 'bg-green-100 text-green-800' :
                      adj.type === 'decrease' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {adj.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adj.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adj.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {adj.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{adj.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
