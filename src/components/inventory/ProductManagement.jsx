import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useBusinessType } from '../../hooks/useBusinessType';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CategoryInput from './CategoryInput';
import ImportExportDialog from '../ImportExportDialog';
import SmartUnitSuggestions from './SmartUnitSuggestions';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Package,
  DollarSign,
  Hash,
  Barcode,
  Calendar,
  MapPin,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  Copy,
  Archive,
  Tag,
  Layers,
  TrendingUp,
  Store,
  Clock,
  Star
} from 'lucide-react';

const ProductManagement = ({ openAddForm = false }) => {
  const { businessType } = useBusinessType();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [importExportMode, setImportExportMode] = useState('import'); // 'import' or 'export'

  // Advanced filtering
  const [filters, setFilters] = useState({
    category: '',
    supplier: '',
    type: '',
    status: 'active',
    stockStatus: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Business-specific categories
  const getBusinessCategories = () => {
    if (!businessType || businessType.code === 'retail') {
      return [
        { value: 'beverages', label: 'Beverages' },
        { value: 'dairy', label: 'Dairy' },
        { value: 'bakery', label: 'Bakery' },
        { value: 'produce', label: 'Produce' },
        { value: 'pantry', label: 'Pantry' },
        { value: 'frozen', label: 'Frozen' },
        { value: 'specialty', label: 'Specialty' }
      ];
    }

    switch (businessType.code) {
      case 'restaurant':
        return [
          { value: 'ingredients', label: 'Ingredients' },
          { value: 'kitchen-supplies', label: 'Kitchen Supplies' },
          { value: 'tableware', label: 'Tableware' },
          { value: 'beverages', label: 'Beverages' },
          { value: 'bakery', label: 'Bakery' },
          { value: 'produce', label: 'Produce' },
          { value: 'dairy', label: 'Dairy' },
          { value: 'pantry', label: 'Pantry' }
        ];
      case 'repair':
        return [
          { value: 'parts', label: 'Parts' },
          { value: 'tools', label: 'Tools' },
          { value: 'equipment', label: 'Equipment' },
          { value: 'consumables', label: 'Consumables' },
          { value: 'safety-gear', label: 'Safety Gear' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'hardware', label: 'Hardware' }
        ];
      case 'pharmacy':
        return [
          { value: 'medications', label: 'Medications' },
          { value: 'medical-supplies', label: 'Medical Supplies' },
          { value: 'otc-products', label: 'OTC Products' },
          { value: 'controlled-substances', label: 'Controlled Substances' },
          { value: 'vitamins', label: 'Vitamins' }
        ];
      case 'rental':
        return [
          { value: 'equipment', label: 'Equipment' },
          { value: 'tools', label: 'Tools' },
          { value: 'safety-gear', label: 'Safety Gear' },
          { value: 'accessories', label: 'Accessories' },
          { value: 'heavy-machinery', label: 'Heavy Machinery' },
          { value: 'power-tools', label: 'Power Tools' }
        ];
      default:
        return [
          { value: 'beverages', label: 'Beverages' },
          { value: 'dairy', label: 'Dairy' },
          { value: 'bakery', label: 'Bakery' },
          { value: 'produce', label: 'Produce' },
          { value: 'pantry', label: 'Pantry' },
          { value: 'frozen', label: 'Frozen' },
          { value: 'specialty', label: 'Specialty' }
        ];
    }
  };

  const businessCategories = getBusinessCategories();

  // Product form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    barcode: '',
    sku: '',
    type: 'unit',
    category: '',
    cost: 0,
    price: 0,
    stockQty: 0,
    minStockLevel: 10,
    expiryDate: '',
    location: '',
    supplierId: '',
    warehouseLocation: '',
    reorderPoint: 10,
    idealStock: 0,
    conversionRate: 1.0,
    unitOfMeasure: 'each',
    minOrderQty: 1.0,
    alternateUnit: '',
    alternateUnitConversionRate: 1.0,
    isActive: true,
    imageUrl: '',
    prepTime: 0
  });

  // Refs for debounced search
  const searchTimeoutRef = useRef(null);

  // Load initial data
  useEffect(() => {
    loadProducts();
    loadSuppliers();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  // Enhanced product search with debouncing
  const performProductSearch = useCallback(async (query) => {
    if (!query.trim()) {
      loadProducts();
      return;
    }

    try {
      const results = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      setProducts(results || []);
    } catch (error) {
      console.error('Product search failed:', error);
      toast.error('Product search failed');
    }
  }, []);

  // Debounced product search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performProductSearch(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, performProductSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || formData.price <= 0) {
      toast.error('Please fill in all required fields (Name, Price)');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
        toast.success('Product updated successfully!');
      } else {
        await api.createProduct(productData);
        toast.success('Product created successfully!');
      }

      await loadProducts();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      barcode: product.barcode || '',
      sku: product.sku || '',
      type: product.type || 'unit',
      category: product.category || '',
      cost: product.cost || 0,
      price: product.price || 0,
      stockQty: product.stockQty || 0,
      minStockLevel: product.minStockLevel || 10,
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
      location: product.location || '',
      supplierId: product.supplierId ? product.supplierId.toString() : '',
      warehouseLocation: product.warehouseLocation || '',
      reorderPoint: product.reorderPoint || 10,
      idealStock: product.idealStock || 0,
      conversionRate: product.conversionRate || 1.0,
      unitOfMeasure: product.unitOfMeasure || 'each',
      minOrderQty: product.minOrderQty || 1.0,
      alternateUnit: product.alternateUnit || '',
      alternateUnitConversionRate: product.alternateUnitConversionRate || 1.0,
      isActive: product.isActive ?? true
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteProduct(productId);
      toast.success('Product deleted successfully!');
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      return;
    }

    try {
      setLoading(true);
      // Delete selected products
      await Promise.all(selectedProducts.map(id => api.deleteProduct(id)));
      toast.success(`${selectedProducts.length} products deleted successfully!`);
      setSelectedProducts([]);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      toast.error('Failed to delete some products');
    } finally {
      setLoading(false);
    }
  };

  // Import/Export handlers
  const handleImport = async (data, options) => {
    try {
      setLoading(true);

      // Process the imported data
      const processedData = data.map(item => ({
        name: item.name,
        description: item.description || '',
        barcode: item.barcode || '',
        sku: item.sku || '',
        type: item.type || 'unit',
        category: item.category || '',
        cost: parseFloat(item.costPrice || item.cost) || 0,
        price: parseFloat(item.price) || 0,
        stockQty: parseInt(item.stockQty) || 0,
        minStockLevel: parseInt(item.minStockLevel) || 10,
        location: item.location || '',
        supplierId: item.supplierId || null,
        warehouseLocation: item.warehouseLocation || '',
        reorderPoint: parseInt(item.reorderPoint) || 10,
        idealStock: parseInt(item.idealStock) || 0,
        conversionRate: parseFloat(item.conversionRate) || 1.0,
        isActive: item.isActive !== undefined ? item.isActive : true
      }));

      // Create products in batches to avoid overwhelming the API
      const batchSize = 10;
      let successCount = 0;

      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize);
        try {
          await Promise.all(batch.map(product => api.createProduct(product)));
          successCount += batch.length;
        } catch (batchError) {
          console.error('Batch import error:', batchError);
          // Continue with next batch even if one fails
        }
      }

      await loadProducts();
      toast.success(`Successfully imported ${successCount} products!`);

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setShowImportExport(true);
    setImportExportMode('export');
  };

  const handleImportClick = () => {
    setShowImportExport(true);
    setImportExportMode('import');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      barcode: '',
      sku: '',
      type: 'unit',
      category: '',
      cost: 0,
      price: 0,
      stockQty: 0,
      minStockLevel: 10,
      expiryDate: '',
      location: '',
      supplierId: '',
      warehouseLocation: '',
      reorderPoint: 10,
      idealStock: 0,
      conversionRate: 1.0,
      unitOfMeasure: 'each',
      minOrderQty: 1.0,
      alternateUnit: '',
      alternateUnitConversionRate: 1.0,
      isActive: true,
      imageUrl: '',
      prepTime: 0
    });
    setEditingProduct(null);
  };

  // Filtered and sorted products
  const filteredProducts = products
    .filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.supplier && product.supplier !== filters.supplier) return false;
      if (filters.type && product.type !== filters.type) return false;
      if (filters.status === 'active' && !product.isActive) return false;
      if (filters.status === 'inactive' && product.isActive) return false;

      if (filters.stockStatus === 'low-stock' && product.stockQty >= product.minStockLevel) return false;
      if (filters.stockStatus === 'out-of-stock' && product.stockQty > 0) return false;
      if (filters.stockStatus === 'in-stock' && product.stockQty <= 0) return false;

      return true;
    })
    .sort((a, b) => {
      let aVal = a[filters.sortBy];
      let bVal = b[filters.sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const getStockStatus = (product) => {
    if (product.stockQty === 0) return 'out-of-stock';
    if (product.stockQty <= product.minStockLevel) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'out-of-stock': return 'text-red-600 bg-red-100';
      case 'low-stock': return 'text-orange-600 bg-orange-100';
      case 'in-stock': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete product catalog management with multi-unit support
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleImportClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
          >
            <Upload size={20} />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Search & Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search products by name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-4 top-3.5 text-gray-400">
            <Search className="h-5 w-5" />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {businessCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="unit">Unit</option>
                <option value="pack">Pack</option>
                <option value="wholesale">Wholesale</option>
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
                <option value="price">Price</option>
                <option value="stockQty">Stock Level</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedProducts([])}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id]);
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku || 'N/A'} • Barcode: {product.barcode || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        ${product.price?.toFixed(2) || '0.00'}
                      </div>
                      {product.cost > 0 && (
                        <div className="text-xs text-gray-500">
                          Cost: ${product.cost.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stockQty || 0}</div>
                      <div className="text-xs text-gray-500">
                        Min: {product.minStockLevel || 10}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.supplier || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(stockStatus)}`}>
                        {stockStatus === 'out-of-stock' ? 'Out of Stock' :
                         stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.values(filters).some(v => v) ? 'Try adjusting your search or filters.' : 'Get started by adding your first product.'}
            </p>
            {!searchTerm && !Object.values(filters).some(v => v) && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Add Product
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {editingProduct ? 'Update product information' : 'Create a new product in your catalog'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Tag className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Required</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                        placeholder="Enter product name..."
                        required
                      />
                      <Package className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">This will be displayed to customers</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Describe your product..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional detailed description</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Barcode</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Scan or enter barcode..."
                      />
                      <Barcode className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter SKU..."
                      />
                      <Hash className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    >
                      <option value="unit">Unit - Individual items</option>
                      <option value="pack">Pack - Multiple items bundled</option>
                      <option value="wholesale">Wholesale - Bulk quantities</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <CategoryInput
                      value={formData.category}
                      onChange={(value) => setFormData({ ...formData, category: value })}
                      placeholder="Select or create category..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Type to create a new category</p>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Pricing & Units</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Required</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Price</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 pl-8 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="0.00"
                      />
                      <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your purchase cost</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Selling Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 pl-8 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="0.00"
                        required
                      />
                      <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Price customers pay</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Conversion Rate</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.conversionRate}
                        onChange={(e) => setFormData({ ...formData, conversionRate: parseFloat(e.target.value) || 1.0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="1.0"
                        min="0.01"
                      />
                      <Layers className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Units per pack/wholesale</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit of Measure</label>
                    <select
                      value={formData.unitOfMeasure}
                      onChange={(e) => setFormData({ ...formData, unitOfMeasure: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                    >
                      <option value="each">Each</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="lb">Pound (lb)</option>
                      <option value="oz">Ounce (oz)</option>
                      <option value="L">Liter (L)</option>
                      <option value="mL">Milliliter (mL)</option>
                      <option value="cm">Centimeter (cm)</option>
                      <option value="m">Meter (m)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Measurement unit for this product</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Order Qty</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.minOrderQty}
                        onChange={(e) => setFormData({ ...formData, minOrderQty: parseFloat(e.target.value) || 1.0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="1.0"
                        min="0.01"
                      />
                      <span className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 text-sm">
                        {formData.unitOfMeasure}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum quantity per sale</p>
                  </div>

                  {/* Smart Unit Suggestions */}
                  {formData.unitOfMeasure && formData.unitOfMeasure !== 'each' && (
                    <div className="md:col-span-3">
                      <SmartUnitSuggestions
                        primaryUnit={formData.unitOfMeasure}
                        currentAlternateUnit={formData.alternateUnit}
                        onSuggestionSelect={(suggestion) => {
                          setFormData({
                            ...formData,
                            alternateUnit: suggestion.unit,
                            alternateUnitConversionRate: suggestion.conversionRate
                          });
                        }}
                        industry={businessType?.code}
                        className="mb-4"
                      />
                    </div>
                  )}

                  {/* Alternate Unit Fields */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alternate Unit</label>
                    <select
                      value={formData.alternateUnit || ''}
                      onChange={(e) => setFormData({ ...formData, alternateUnit: e.target.value || null })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                    >
                      <option value="">None</option>
                      <option value="each">Each</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="lb">Pound (lb)</option>
                      <option value="oz">Ounce (oz)</option>
                      <option value="L">Liter (L)</option>
                      <option value="mL">Milliliter (mL)</option>
                      <option value="cm">Centimeter (cm)</option>
                      <option value="m">Meter (m)</option>
                      <option value="ft">Foot (ft)</option>
                      <option value="in">Inch (in)</option>
                      <option value="yd">Yard (yd)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Alternate measurement unit (optional)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Conversion Rate</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.alternateUnitConversionRate}
                        onChange={(e) => setFormData({ ...formData, alternateUnitConversionRate: parseFloat(e.target.value) || 1.0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="1.0"
                        min="0.0001"
                      />
                      <span className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 text-sm">
                        1 {formData.unitOfMeasure} = {formData.alternateUnitConversionRate} {formData.alternateUnit}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Conversion from primary to alternate unit</p>
                  </div>
                </div>

                {/* Profit Margin Display */}
                {formData.cost > 0 && formData.price > 0 && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Profit Margin:</span>
                      <span className={`text-sm font-bold ${
                        ((formData.price - formData.cost) / formData.cost * 100) >= 20 ? 'text-green-600' :
                        ((formData.price - formData.cost) / formData.cost * 100) >= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {((formData.price - formData.cost) / formData.cost * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">Profit per unit:</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${(formData.price - formData.cost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Inventory Section */}
              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Inventory Management</h3>
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Optional</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stock</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.stockQty}
                        onChange={(e) => setFormData({ ...formData, stockQty: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="0"
                      />
                      <Package className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Units currently in stock</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Stock Level</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.minStockLevel}
                        onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 10 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="10"
                      />
                      <AlertTriangle className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Low stock alert threshold</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reorder Point</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.reorderPoint}
                        onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 10 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="10"
                      />
                      <Clock className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">When to reorder</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ideal Stock</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.idealStock}
                        onChange={(e) => setFormData({ ...formData, idealStock: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="0"
                      />
                      <Star className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Target stock level</p>
                  </div>
                </div>

                {/* Stock Status Preview */}
                {formData.stockQty !== undefined && formData.minStockLevel !== undefined && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Stock Status Preview:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        formData.stockQty === 0 ? 'text-red-600 bg-red-100' :
                        formData.stockQty <= formData.minStockLevel ? 'text-orange-600 bg-orange-100' :
                        'text-green-600 bg-green-100'
                      }`}>
                        {formData.stockQty === 0 ? 'Out of Stock' :
                         formData.stockQty <= formData.minStockLevel ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Supplier & Location Section */}
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Store className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Supplier & Location</h3>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Optional</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                    <div className="relative">
                      <select
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white"
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                      <Building className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Link to existing supplier</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder="Aisle A, Shelf 3, Bin 12"
                      />
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Physical location in store</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      />
                      <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">For perishable items</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Warehouse Location</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.warehouseLocation}
                        onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                        className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder="WH-A-01-05"
                      />
                      <Building className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Warehouse storage code</p>
                  </div>
                </div>
              </div>

              {/* Restaurant-Specific Section */}
              {businessType?.code === 'restaurant' && (
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Store className="h-5 w-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Restaurant Details</h3>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Restaurant Only</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Preparation Time (minutes)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.prepTime}
                          onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="15"
                          min="0"
                        />
                        <Clock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Time to prepare this item</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                      <div className="relative">
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="https://example.com/image.jpg"
                        />
                        <Upload className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">URL to product image for menu display</p>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {formData.imageUrl && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Image Preview</label>
                      <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5LjkgMTlIMTQuMUMxNS4xIDE5IDE2IDE4LjEgMTYgMTdWNFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEwIDZDOS4zIDYgOC42IDYuMyA4LjYgN0w4LjYgMTdDOS4zIDE3LjcgMTAgMTcuNyAxMCAxN1oiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-between items-center pt-6 border-t">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Active Product</span>
                </label>

                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import/Export Dialog */}
      {showImportExport && (
        <ImportExportDialog
          isOpen={showImportExport}
          onClose={() => setShowImportExport(false)}
          onImport={handleImport}
          onExport={handleExport}
          type="products"
          currentData={products}
        />
      )}
    </div>
  );
};

export default ProductManagement;
