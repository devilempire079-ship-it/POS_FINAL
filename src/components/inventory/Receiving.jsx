import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertTriangle, Clock, Search, Filter } from 'lucide-react';

const Receiving = () => {
  const [pendingReceipts, setPendingReceipts] = useState([]);
  const [processingReceipt, setProcessingReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qualityItems, setQualityItems] = useState([]);
  const [receiptForm, setReceiptForm] = useState({
    receiptNumber: '',
    receivedDate: new Date().toISOString().split('T')[0],
    receivedBy: '',
    items: [],
    notes: ''
  });

  // Mock data for testing
  useEffect(() => {
    const mockReceipts = [
      {
        id: 1,
        poNumber: 'PO-2025-001',
        receiptNumber: 'RC-2025-001',
        supplierName: 'Global Coffee Co',
        status: 'pending',
        orderDate: new Date('2025-09-01'),
        expectedDate: new Date('2025-09-05'),
        receivedDate: null,
        totalItems: 2,
        totalValue: 212.50,
        items: [
          {
            id: 1,
            productId: 1,
            productName: 'Premium Coffee',
            orderedQuantity: 25,
            receivedQuantity: 0,
            unitCost: 8.50,
            condition: 'pending',
            expiryDate: null,
            notes: ''
          }
        ]
      },
      {
        id: 2,
        poNumber: 'PO-2025-002',
        receiptNumber: 'RC-2025-002',
        supplierName: 'Farm Fresh Dairy',
        status: 'partial',
        orderDate: new Date('2025-08-28'),
        expectedDate: new Date('2025-09-02'),
        receivedDate: new Date('2025-09-01'),
        totalItems: 3,
        totalValue: 450.00,
        items: [
          {
            id: 2,
            productId: 2,
            productName: 'Organic Milk 1L',
            orderedQuantity: 30,
            receivedQuantity: 30,
            unitCost: 2.25,
            condition: 'good',
            expiryDate: new Date('2025-09-15'),
            notes: 'Received in good condition'
          },
          {
            id: 3,
            productId: 3,
            productName: 'Whole Wheat Bread',
            orderedQuantity: 50,
            receivedQuantity: 45,
            unitCost: 1.75,
            condition: 'good',
            expiryDate: new Date('2025-09-08'),
            notes: '5 pieces damaged during transport'
          }
        ]
      },
      {
        id: 3,
        poNumber: 'PO-2025-003',
        receiptNumber: 'RC-2025-003',
        supplierName: 'Local Bakery Co',
        status: 'partial',
        orderDate: new Date('2025-08-30'),
        expectedDate: new Date('2025-09-03'),
        receivedDate: new Date('2025-09-02'),
        totalItems: 1,
        totalValue: 175.00,
        items: [
          {
            id: 4,
            productId: 4,
            productName: 'Sourdough Bread Loaf',
            orderedQuantity: 100,
            receivedQuantity: 98,
            unitCost: 1.75,
            condition: 'good',
            expiryDate: new Date('2025-09-10'),
            notes: '2 loaves received damaged'
          }
        ]
      }
    ];

    setPendingReceipts(mockReceipts);
  }, []);

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const sequence = String(pendingReceipts.length + 1).padStart(3, '0');
    return `RC-${year}-${month}${sequence}`;
  };

  const handleProcessReceipt = (receipt) => {
    setProcessingReceipt(receipt);
    setQualityItems(receipt.items.map(item => ({ ...item, qualityChecked: false })));
    setReceiptForm({
      receiptNumber: receipt.receiptNumber || generateReceiptNumber(),
      receivedDate: new Date().toISOString().split('T')[0],
      receivedBy: 'Current User',
      items: receipt.items.map(item => ({ ...item, receivedQuantity: item.orderedQuantity, condition: 'good' })),
      notes: ''
    });
  };

  const handleQualityCheck = (itemIndex, field, value) => {
    const updatedItems = [...qualityItems];
    updatedItems[itemIndex][field] = value;
    setQualityItems(updatedItems);
  };

  const handleItemUpdate = (index, field, value) => {
    const updatedItems = [...receiptForm.items];
    updatedItems[index][field] = value;

    if (field === 'receivedQuantity' || field === 'unitCost') {
      const item = updatedItems[index];
      item.totalCost = item.receivedQuantity * item.unitCost;
    }

    setReceiptForm({
      ...receiptForm,
      items: updatedItems
    });
  };

  const handleSubmitReceipt = () => {
    // Validate that all items have been received with quantities
    const hasValidQuantities = receiptForm.items.every(item => item.receivedQuantity > 0);
    if (!hasValidQuantities) {
      alert('Please enter valid received quantities for all items');
      return;
    }

    // Here you would save the receipt data
    setPendingReceipts(pendingReceipts.map(receipt =>
      receipt.id === processingReceipt.id
        ? {
            ...receipt,
            status: 'completed',
            receivedDate: new Date(receiptForm.receivedDate),
            receivedBy: receiptForm.receivedBy,
            receiptNumber: receiptForm.receiptNumber,
            items: receiptForm.items
          }
        : receipt
    ));

    alert('Receipt processed successfully! Inventory updated.');
    setProcessingReceipt(null);
    setQualityItems([]);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getConditionBadge = (condition) => {
    const styles = {
      good: 'bg-green-100 text-green-800',
      damaged: 'bg-red-100 text-red-800',
      expired: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[condition] || 'bg-gray-100 text-gray-800'}`}>
        {condition.charAt(0).toUpperCase() + condition.slice(1)}
      </span>
    );
  };

  const filteredReceipts = pendingReceipts.filter(receipt => {
    const matchesSearch = receipt.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTotalReceivedValue = (items) => {
    return items.filter(item => item.receivedQuantity > 0).reduce((total, item) => total + (item.receivedQuantity * item.unitCost), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Goods Receiving</h1>
        <div className="text-sm text-gray-500">
          {pendingReceipts.filter(r => r.status !== 'completed').length} pending receipts
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by PO # or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Process Receipt Modal */}
      {processingReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Process Receipt - {processingReceipt.poNumber}
              </h2>
              {getStatusBadge(processingReceipt.status)}
            </div>

            <div className="space-y-6">
              {/* Receipt Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Receipt Number</label>
                  <input
                    type="text"
                    value={receiptForm.receiptNumber}
                    onChange={(e) => setReceiptForm({...receiptForm, receiptNumber: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Received Date</label>
                  <input
                    type="date"
                    value={receiptForm.receivedDate}
                    onChange={(e) => setReceiptForm({...receiptForm, receivedDate: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Received By</label>
                  <input
                    type="text"
                    value={receiptForm.receivedBy}
                    onChange={(e) => setReceiptForm({...receiptForm, receivedBy: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Supplier Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Supplier Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Supplier:</span>
                    <p className="text-sm text-gray-900">{processingReceipt.supplierName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Order Date:</span>
                    <p className="text-sm text-gray-900">{processingReceipt.orderDate.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {receiptForm.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.orderedQuantity}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.receivedQuantity}
                            onChange={(e) => handleItemUpdate(index, 'receivedQuantity', parseInt(e.target.value) || 0)}
                            className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="0"
                            max={item.orderedQuantity}
                          />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) => handleItemUpdate(index, 'unitCost', parseFloat(e.target.value) || 0)}
                            className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min="0"
                            step="0.01"
                          />
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ${(item.receivedQuantity * item.unitCost).toFixed(2)}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={item.condition}
                            onChange={(e) => handleItemUpdate(index, 'condition', e.target.value)}
                            className="w-24 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="good">Good</option>
                            <option value="damaged">Damaged</option>
                            <option value="defective">Defective</option>
                            <option value="expired">Expired</option>
                            <option value="partial">Partial Damage</option>
                            <option value="returned">Returned</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="date"
                            value={item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleItemUpdate(index, 'expiryDate', e.target.value ? new Date(e.target.value) : null)}
                            className="w-32 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </td>

                        <td className="px-6 py-4">
                          <textarea
                            value={item.notes || ''}
                            onChange={(e) => handleItemUpdate(index, 'notes', e.target.value)}
                            rows="1"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Quality notes..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                        Total Value:
                      </td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">
                        ${getTotalReceivedValue(receiptForm.items).toFixed(2)}
                      </td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Receipt Notes</label>
                <textarea
                  value={receiptForm.notes}
                  onChange={(e) => setReceiptForm({...receiptForm, notes: e.target.value})}
                  rows="3"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="General notes about the receipt..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setProcessingReceipt(null);
                    setQualityItems([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReceipt}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <CheckCircle size={20} />
                  <span>Complete Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO # / Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{receipt.poNumber}</div>
                    <div className="text-sm text-gray-500">
                      Receipt: {receipt.receiptNumber || 'Pending'}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{receipt.supplierName}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {getStatusBadge(receipt.status)}
                      {receipt.status === 'pending' && (
                        <span className="text-xs text-red-600">
                          Expected: {receipt.expectedDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {receipt.items.length} items
                    </div>
                    <div className="text-sm text-gray-500">
                      {receipt.items.filter(item => item.receivedQuantity > 0).length} received
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${getTotalReceivedValue(receipt.items).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      of ${receipt.totalValue.toFixed(2)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Order: {receipt.orderDate.toLocaleDateString()}
                    </div>
                    {receipt.receivedDate && (
                      <div className="text-sm text-gray-500">
                        Received: {receipt.receivedDate.toLocaleDateString()}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {receipt.status !== 'completed' && (
                      <button
                        onClick={() => handleProcessReceipt(receipt)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md"
                      >
                        Process Receipt
                      </button>
                    )}
                    {receipt.status === 'completed' && (
                      <CheckCircle className="inline text-green-600 h-5 w-5" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReceipts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              All purchase orders have been received or try adjusting your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receiving;
