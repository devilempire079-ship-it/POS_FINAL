import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  Package,
  Users,
  ClipboardList,
  Truck,
  AlertTriangle,
  Settings,
  FileText,
  Search,
  Gift,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useBusinessType } from '../hooks/useBusinessType';

// Import our Phase 3 components
import InventoryDashboard from './inventory/InventoryDashboard';
import ProductManagement from './inventory/ProductManagement';
import StockManagement from './inventory/StockManagement';
import SupplierManagement from './inventory/SupplierManagement';
import PurchaseOrders from './inventory/PurchaseOrders';
import Receiving from './inventory/Receiving';
import OffersManagement from './inventory/OffersManagement';
import SupplierPayments from './inventory/SupplierPayments';

const InventoryScreen = () => {
  const location = useLocation();
  const { businessType } = useBusinessType();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Refs for debounced search
  const searchTimeoutRef = useRef(null);

  // Check for navigation state to open add product form
  const [shouldOpenAddProduct, setShouldOpenAddProduct] = useState(false);

  useEffect(() => {
    if (location.state?.openAddProduct) {
      setActiveTab('products');
      setShouldOpenAddProduct(true);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Enhanced product search with debouncing
  const performProductSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=20`);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Product search failed:', error);
      toast.error('Product search failed');
      setSearchResults([]);
      setShowSearchResults(false);
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
    // Navigate to products tab for full product management
    setActiveTab('products');
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);

    // The ProductManagement component will handle the selected product
  };

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      component: InventoryDashboard,
      description: 'Real-time inventory analytics and metrics'
    },
    {
      id: 'products',
      name: 'Products',
      icon: Package,
      component: ProductManagement,
      description: 'Manage product catalog with full CRUD operations'
    },
    {
      id: 'offers',
      name: 'Offers',
      icon: Gift,
      component: OffersManagement,
      description: 'Create and manage combo offers, discounts, and promotions'
    },
    {
      id: 'stock',
      name: 'Stock Management',
      icon: Package,
      component: StockManagement,
      description: 'Adjust stock levels and track movements'
    },
    {
      id: 'suppliers',
      name: 'Suppliers',
      icon: Users,
      component: SupplierManagement,
      description: 'Manage supplier profiles and relationships'
    },
    {
      id: 'supplier-payments',
      name: 'Supplier Payments',
      icon: DollarSign,
      component: SupplierPayments,
      description: 'Track and manage supplier payment processing'
    },
    {
      id: 'purchase-orders',
      name: 'Purchase Orders',
      icon: ClipboardList,
      component: PurchaseOrders,
      description: 'Create and manage purchase orders'
    },
    {
      id: 'receiving',
      name: 'Receiving',
      icon: Truck,
      component: Receiving,
      description: 'Process goods receipts and quality control'
    },
    {
      id: 'alerts',
      name: 'Stock Alerts',
      icon: AlertTriangle,
      component: () => <div className="text-center py-12"><AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-gray-500">Stock Alerts - Coming Soon</p></div>,
      description: 'Low stock and expiry notifications'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: FileText,
      component: () => <div className="text-center py-12"><FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-gray-500">Inventory Reports - Coming Soon</p></div>,
      description: 'Analytics and reporting dashboard'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      component: () => <div className="text-center py-12"><Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" /><p className="text-gray-500">Inventory Settings - Coming Soon</p></div>,
      description: 'Configure inventory preferences'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Enterprise-grade inventory control and supply chain management
          </p>
          {businessType && businessType.code !== 'retail' && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-lg">{businessType.icon}</span>
              <span className="text-sm font-medium text-blue-600">
                {businessType.name} Business Mode
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <span className="px-3 py-1 text-sm font-medium text-gray-700">Phase 3 Complete</span>
          <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-md">✓</span>
        </div>
      </div>

      {/* Global Product Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products across inventory..."
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

          {/* Enhanced Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto mt-2">
              {searchResults.map((product) => {
                const isLowStock = product.stockQty <= (product.minStockLevel || 10);
                const stockStatus = product.stockQty === 0 ? 'out-of-stock' :
                                  isLowStock ? 'low-stock' : 'in-stock';

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-800 truncate">{product.name}</p>
                          {product.type && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {product.type}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">ID: {product.id} • SKU: {product.sku || 'N/A'}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className={`flex items-center space-x-1 text-sm ${
                            stockStatus === 'out-of-stock' ? 'text-red-600' :
                            stockStatus === 'low-stock' ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              stockStatus === 'out-of-stock' ? 'bg-red-500' :
                              stockStatus === 'low-stock' ? 'bg-orange-500' : 'bg-green-500'
                            }`}></div>
                            <span>
                              {stockStatus === 'out-of-stock' ? 'Out of Stock' :
                               stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {product.category || 'Uncategorized'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-gray-800">${product.price?.toFixed(2) || '0.00'}</p>
                        <p className={`text-sm font-medium ${
                          stockStatus === 'out-of-stock' ? 'text-red-600' :
                          stockStatus === 'low-stock' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {product.stockQty || 0} units
                        </p>
                        <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductSelect(product);
                            }}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Could add quick stock adjustment here
                              toast.info('Quick stock adjustment coming soon');
                            }}
                            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Adjust
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Results Message */}
          {showSearchResults && searchTerm.length > 2 && searchResults.length === 0 && !searchLoading && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2">
              <div className="px-4 py-3 text-gray-500 text-center">
                No products found matching "{searchTerm}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <activeTabData.icon className="h-6 w-6" />
              <span>{activeTabData.name}</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">{activeTabData.description}</p>
          </div>

          <ActiveComponent />
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">1</div>
          <div className="text-sm text-gray-600">Warehouse</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">10</div>
          <div className="text-sm text-gray-600">Active Products</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">10</div>
          <div className="text-sm text-gray-600">Suppliers</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">--</div>
          <div className="text-sm text-gray-600">PO in Process</div>
        </div>
      </div>

      {/* Phase 3 Features Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🚀 Phase 3: Advanced Inventory Management</h3>
            <p className="text-sm opacity-90 mb-4">
              Complete supply chain management system with enterprise-grade features
            </p>
            <ul className="text-sm space-y-1 opacity-90">
              <li>✅ Real-time stock tracking and analytics</li>
              <li>✅ Supplier management and performance monitoring</li>
              <li>✅ Automated purchase order workflows</li>
              <li>✅ Quality control and goods receiving</li>
              <li>✅ Warehouse location management</li>
            </ul>
          </div>
          <div className="text-6xl opacity-10">
            📦
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryScreen;
