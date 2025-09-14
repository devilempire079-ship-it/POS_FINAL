import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Refs for debounced search
  const searchTimeoutRef = useRef(null);
  const productSearchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    supplierId: '',
    orderNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    notes: '',
    items: []
  });

  const [itemForm, setItemForm] = useState({
    productId: '',
    quantity: 1,
    unitCost: 0
  });

  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Mock data
  useEffect(() => {
    const fetchData = () => {
      setSuppliers([
        { id: 1, name: 'Global Coffee Co', email: 'orders@globalcoffee.com' },
        { id: 2, name: 'Farm Fresh Dairy', email: 'sales@farmfreshdairy.com' },
        { id: 3, name: 'Local Bakery Co', email: 'orders@localbakery.com' }
      ]);

      setProducts([
        { id: 1, name: 'Premium Coffee', supplierId: 1, cost: 8.50 },
        { id: 2, name: 'Organic Milk 1L', supplierId: 2, cost: 2.25 },
        { id: 3, name: 'Whole Wheat Bread', supplierId: 3, cost: 1.75 }
      ]);

      setOrders([
        {
          id: 1,
          orderNumber: 'PO-2025-001',
          supplierId: 1,
          supplierName: 'Global Coffee Co',
          status: 'draft',
          orderDate: new Date('2025-09-01'),
          expectedDate: new Date('2025-09-05'),
          totalAmount: 212.50,
          taxAmount: 17.00,
          discount: 0,
          notes: 'Urgent order needed',
          createdBy: 'Manager',
          totalItems: 2,
          items: [
            { id: 1, productId: 1, productName: 'Premium Coffee', quantity: 25, unitCost: 8.50, totalCost: 212.50 }
          ]
        },
        {
          id: 2,
          orderNumber: 'PO-2025-002',
          supplierId: 2,
          supplierName: 'Farm Fresh Dairy',
          status: 'approved',
          orderDate: new Date('2025-08-28'),
          expectedDate: new Date('2025-09-02'),
          totalAmount: 450.00,
          taxAmount: 36.00,
          discount: 10.00,
          notes: 'Weekly dairy order',
          createdBy: 'Manager',
          totalItems: 3,
          items: [
            { id: 2, productId: 2, productName: 'Organic Milk 1L', quantity: 30, unitCost: 2.25, totalCost: 67.50 },
            { id: 3, productId: 3, productName: 'Whole Wheat Bread', quantity: 50, unitCost: 1.75, totalCost: 87.50 }
          ]
        }
      ]);
    };

    fetchData();
  }, []);

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(orders.length + 1).padStart(3, '0');
    return `PO-${year}-${month}${sequence}`;
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0);
    const taxRate = 0.08; // 8% tax
    const taxAmount = subtotal * taxRate;
    return { subtotal, taxAmount, grandTotal: subtotal + taxAmount };
  };

  const handleAddItem = () => {
    if (!itemForm.productId || itemForm.quantity <= 0 || itemForm.unitCost <= 0) {
      alert('Please fill in all item details');
      return;
    }

    const product = products.find(p => p.id.toString() === itemForm.productId);
    const newItem = {
      id: Date.now(),
      productId: itemForm.productId,
      productName: product.name,
      quantity: itemForm.quantity,
      unitCost: itemForm.unitCost,
      totalCost: itemForm.quantity * itemForm.unitCost
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });

    setItemForm({
      productId: '',
      quantity: 1,
      unitCost: 0
    });
  };

  const handleRemoveItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplierId || formData.items.length === 0) {
      alert('Please select a supplier and add at least one item');
      return;
    }

    setLoading(true);
    try {
      const supplier = suppliers.find(s => s.id.toString() === formData.supplierId);
      const { subtotal, taxAmount } = calculateTotals(formData.items);

      const orderData = {
        id: editingOrder ? editingOrder.id : Date.now(),
        orderNumber: formData.orderNumber || generateOrderNumber(),
        supplierId: formData.supplierId,
        supplierName: supplier.name,
        status: 'draft',
        orderDate: new Date(formData.orderDate),
        expectedDate: formData.expectedDate ? new Date(formData.expectedDate) : null,
        totalAmount: subtotal,
        taxAmount,
        discount: 0,
        notes: formData.notes,
        createdBy: 'Current User',
        totalItems: formData.items.length,
        items: formData.items
      };

      if (editingOrder) {
        setOrders(orders.map(o => o.id === editingOrder.id ? orderData : o));
        alert('Purchase order updated successfully!');
      } else {
        setOrders([...orders, orderData]);
        alert('Purchase order created successfully!');
      }

      // Reset form
      setFormData({
        supplierId: '',
        orderNumber: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDate: '',
        notes: '',
        items: []
      });
      setEditingOrder(null);
      setShowForm(false);

    } catch (error) {
      alert('Error saving purchase order. Please try again.');
    }
    setLoading(false);
  };

  const handleApprove = (orderId) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'approved' }
        : order
    ));
    alert('Purchase order approved successfully!');
  };

  const handleReceive = (orderId) => {
    // This would typically open a receiving interface
    alert(`Redirecting to receiving interface for PO #${orders.find(o => o.id === orderId)?.orderNumber}`);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      supplierId: order.supplierId.toString(),
      orderNumber: order.orderNumber,
      orderDate: order.orderDate.toISOString().split('T')[0],
      expectedDate: order.expectedDate ? order.expectedDate.toISOString().split('T')[0] : '',
      notes: order.notes || '',
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId.toString(),
        productName: item.productName,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost
      }))
    });
    setShowForm(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-gray-400" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'received': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Enhanced product search with debouncing
  const performProductSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setProductSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const results = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=10`);
      setProductSearchResults(results);
    } catch (error) {
      console.error('Product search failed:', error);
      toast.error('Product search failed');
      setProductSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounced product search
  useEffect(() => {
    if (productSearchTimeoutRef.current) {
      clearTimeout(productSearchTimeoutRef.current);
    }

    const debounceDelay = productSearchTerm.length > 2 ? 100 : 200;

    productSearchTimeoutRef.current = setTimeout(() => {
      performProductSearch(productSearchTerm);
    }, debounceDelay);

    return () => {
      if (productSearchTimeoutRef.current) {
        clearTimeout(productSearchTimeoutRef.current);
      }
    };
  }, [productSearchTerm, performProductSearch]);

  // Handle product selection from search
  const handleProductSelect = (product) => {
    setItemForm({
      productId: product.id.toString(),
      quantity: 1,
      unitCost: product.price || 0
    });
    setProductSearchTerm('');
    setProductSearchResults([]);
    setShowProductSearch(false);
  };

  // Available products for selected supplier
  const availableProducts = products.filter(p => p.supplierId.toString() === formData.supplierId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingOrder(null);
            setFormData({
              supplierId: '',
              orderNumber: '',
              orderDate: new Date().toISOString().split('T')[0],
              expectedDate: '',
              notes: '',
              items: []
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Order</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by PO number or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="received">Received</option>
          </select>
        </div>
      </div>

      {/* Order Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier *</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Number</label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    placeholder={generateOrderNumber()}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Date</label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Delivery</label>
                  <input
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Add Items */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Order Items</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value);
                        setShowProductSearch(true);
                      }}
                      onFocus={() => setShowProductSearch(true)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      disabled={!formData.supplierId}
                    />
                    {searchLoading && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}

                    {/* Enhanced Product Search Results */}
                    {showProductSearch && productSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                        {productSearchResults.map((product) => (
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
                    {itemForm.productId && !showProductSearch && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-800">
                          Selected: {products.find(p => p.id.toString() === itemForm.productId)?.name || 'Product'}
                        </p>
                      </div>
                    )}
                  </div>

                  <input
                    type="number"
                    placeholder="Quantity"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                    className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />

                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Unit Cost"
                      value={itemForm.unitCost}
                      onChange={(e) => setItemForm({ ...itemForm, unitCost: parseFloat(e.target.value) || 0 })}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {formData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="ml-4 text-sm text-gray-600">
                          Qty: {item.quantity} × ${item.unitCost.toFixed(2)} = ${item.totalCost.toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium mb-2">Order Summary</h4>
                {formData.items.length > 0 && (
                  <div className="text-sm space-y-1">
                    <div>Items: {formData.items.length}</div>
                    <div>Subtotal: ${calculateTotals(formData.items).subtotal.toFixed(2)}</div>
                    <div>Tax: ${calculateTotals(formData.items).taxAmount.toFixed(2)}</div>
                    <div className="font-semibold">
                      Total: ${calculateTotals(formData.items).grandTotal.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingOrder(null);
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
                    {loading ? 'Saving...' : (editingOrder ? 'Update' : 'Create')} Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{order.totalItems} items</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.supplierName}</div>
                    <div className="text-sm text-gray-500">{order.createdBy}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${(order.totalAmount + order.taxAmount - order.discount).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Tax: ${order.taxAmount.toFixed(2)}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Expected: {order.expectedDate ? order.expectedDate.toLocaleDateString() : 'Not set'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Ordered: {order.orderDate.toLocaleDateString()}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => setViewingOrder(order)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {order.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleEdit(order)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Order"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleApprove(order.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Order"
                        >
                          <Send size={16} />
                        </button>
                      </>
                    )}
                    {order.status === 'approved' && (
                      <button
                        onClick={() => handleReceive(order.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Receive Goods"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Send className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No purchase orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first purchase order.'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{viewingOrder.orderNumber}</h2>
              {getStatusBadge(viewingOrder.status)}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Supplier</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingOrder.supplierName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Order Date</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingOrder.orderDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Expected Delivery</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewingOrder.expectedDate ? viewingOrder.expectedDate.toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    ${(viewingOrder.totalAmount + viewingOrder.taxAmount - viewingOrder.discount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Order Items</h3>
                <div className="space-y-2">
                  {viewingOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="ml-4 text-sm text-gray-600">Qty: {item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">${item.unitCost.toFixed(2)} each</span>
                        <p className="font-medium">${item.totalCost.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {viewingOrder.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Notes</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingOrder.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                {viewingOrder.status === 'approved' && (
                  <button
                    onClick={() => {
                      setViewingOrder(null);
                      handleReceive(viewingOrder.id);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Receive Goods
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
