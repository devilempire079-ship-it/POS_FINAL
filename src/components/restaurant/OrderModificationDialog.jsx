import React, { useState, useEffect } from 'react';
import {
  Edit3,
  Trash2,
  Plus,
  Minus,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChefHat,
  MessageSquare,
  History,
  Save,
  Undo,
  ShoppingCart
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const OrderModificationDialog = ({
  order,
  orderItems,
  onClose,
  onModifyItem,
  onRemoveItem,
  onAddItem,
  onCancelOrder,
  onSendModification,
  kitchenStatus = 'connected',
  menuItems = {}
}) => {
  const [modifications, setModifications] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [modificationNote, setModificationNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('appetizers');
  const [isLockedForUser, setIsLockedForUser] = useState(false);
  const [modifyingUser, setModifyingUser] = useState(null);

// Track modifications made in this session
  const addModification = (type, itemId, details) => {
    const modification = {
      id: Date.now(),
      type, // 'quantity_change', 'item_removed', 'item_added', 'instruction_change'
      itemId,
      details,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    setModifications(prev => [...prev, modification]);
  };

  // Check if item can be modified based on its status
  const canModifyItem = (item) => {
    // Check if item has reached "being_prepared" status
    const beingPreparedStatuses = ['being_prepared', 'being prepared', 'preparing', 'cooking'];
    const itemStatus = (item.status || '').toLowerCase();

    return !beingPreparedStatuses.includes(itemStatus);
  };

  // Get modification status for an item
  const getItemModificationStatus = (itemId) => {
    const pendingMods = modifications.filter(m =>
      m.itemId === itemId && m.status === 'pending'
    );
    return pendingMods.length > 0 ? 'modified' : 'unchanged';
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity, currentItem) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId, currentItem);
    } else {
      onModifyItem(itemId, { quantity: newQuantity });
      addModification('quantity_change', itemId, {
        oldQuantity: currentItem.quantity,
        newQuantity,
        itemName: currentItem.name
      });
    }
  };

  // Handle item removal
  const handleRemoveItem = (itemId, item) => {
    onRemoveItem(itemId);
    addModification('item_removed', itemId, {
      itemName: item.name,
      quantity: item.quantity,
      price: item.price
    });
  };

  // Handle order cancellation
  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    onCancelOrder(order.id, cancelReason);
    setShowCancelDialog(false);
    onClose();
  };

  // Send modifications to kitchen
  const handleSendModifications = () => {
    if (modifications.length === 0) {
      alert('No modifications to send');
      return;
    }

    if (!modificationNote.trim()) {
      alert('Please add a note explaining the modifications');
      return;
    }

    onSendModification(order.id, modifications, modificationNote);
    setModifications([]);
    setModificationNote('');
    onClose();
  };

  // Undo modification
  const undoModification = (modificationId) => {
    setModifications(prev => prev.filter(m => m.id !== modificationId));
  };

  const ModificationItem = ({ item }) => {
    const canModify = canModifyItem(item);
    const modificationStatus = getItemModificationStatus(item.id);

    return (
      <div className={`p-4 border rounded-lg transition-all ${
        modificationStatus === 'modified'
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200'
      } ${!canModify ? 'opacity-60' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              {modificationStatus === 'modified' && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Modified
                </Badge>
              )}
              {!canModify && (
                <Badge variant="secondary" className="text-orange-600">
                  <ChefHat className="w-3 h-3 mr-1" />
                  In Preparation
                </Badge>
              )}
            </div>
            {item.notes && (
              <p className="text-sm text-gray-600 mt-1 italic">{item.notes}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span>${item.price.toFixed(2)} each</span>
              <span>Prep: {item.prepTime}min</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canModify ? (
              <>
                <Button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1, item)}
                  variant="outline"
                  size="sm"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>

                <span className="font-semibold min-w-[2rem] text-center">
                  {item.quantity}
                </span>

                <Button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1, item)}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>

                <Button
                  onClick={() => handleRemoveItem(item.id, item)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                Cannot Modify
              </Badge>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold">
            Subtotal: ${(item.price * item.quantity).toFixed(2)}
          </span>
          <span className="text-gray-600">
            Added: {new Date(item.addedAt).toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  const ModificationSummary = () => {
    const totalModifications = modifications.length;
    const itemsModified = new Set(modifications.map(m => m.itemId)).size;
    const itemsRemoved = modifications.filter(m => m.type === 'item_removed').length;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Modification Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalModifications}</div>
              <div className="text-sm text-gray-600">Total Changes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{itemsModified}</div>
              <div className="text-sm text-gray-600">Items Modified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{itemsRemoved}</div>
              <div className="text-sm text-gray-600">Items Removed</div>
            </div>
          </div>

          {modifications.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Pending Changes:</h4>
              {modifications.map(mod => (
                <div key={mod.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="text-sm">
                    <span className="font-medium capitalize">{mod.type.replace('_', ' ')}</span>
                    <span className="text-gray-600 ml-2">
                      {mod.details.itemName || 'Item'}
                    </span>
                  </div>
                  <Button
                    onClick={() => undoModification(mod.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!order) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No order selected for modification</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Edit3 className="w-6 h-6 mr-2" />
                Modify Order - Table {order.tableNumber}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={kitchenStatus === 'connected' ? 'success' : 'secondary'}>
                  <ChefHat className="w-3 h-3 mr-1" />
                  Kitchen: {kitchenStatus}
                </Badge>
                <Button onClick={onClose} variant="outline">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No items in order</p>
                  </div>
                ) : (
                  orderItems.map(item => (
                    <ModificationItem key={item.id} item={item} />
                  ))
                )}
              </CardContent>
            </Card>

            {/* Add New Item */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Item</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => setShowAddItemDialog(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item to Order
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Modification Panel */}
          <div className="space-y-4">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setShowHistory(!showHistory)}
                  variant="outline"
                  className="w-full"
                >
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>

                <Button
                  onClick={() => setShowCancelDialog(true)}
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              </CardContent>
            </Card>

            {/* Modification Note */}
            {modifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Modification Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={modificationNote}
                    onChange={(e) => setModificationNote(e.target.value)}
                    placeholder="Explain the modifications to the kitchen..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </CardContent>
              </Card>
            )}

            {/* Send Modifications */}
            {modifications.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    onClick={handleSendModifications}
                    className="w-full"
                    disabled={!modificationNote.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Send Modifications to Kitchen
                  </Button>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    {modifications.length} modification{modifications.length > 1 ? 's' : ''} pending
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modification Summary */}
        <ModificationSummary />
      </div>

      {/* Cancel Order Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Cancel Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation:
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Customer changed mind, food allergy, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowCancelDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Keep Order
                </Button>
                <Button
                  onClick={handleCancelOrder}
                  disabled={!cancelReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Cancel Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Item Dialog */}
      {showAddItemDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Add Item to Order</CardTitle>
              <Button
                onClick={() => setShowAddItemDialog(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Menu Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Category</h3>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {Object.keys(menuItems).map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
                        selectedCategory === category
                          ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items Grid */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Items
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {menuItems[selectedCategory]?.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onAddItem(item);
                        addModification('item_added', Date.now(), {
                          itemName: item.name,
                          quantity: 1,
                          price: item.price
                        });
                        setShowAddItemDialog(false);
                        setSelectedCategory('appetizers');
                      }}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-orange-300 transition-all text-left cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3 inline mr-0.5" />
                          {item.prepTime}min
                        </span>
                      </div>
                      <p className="text-base font-bold text-orange-600">
                        ${item.price.toFixed(2)}
                      </p>
                    </button>
                  )) || (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No items in this category</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  onClick={() => setShowAddItemDialog(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default OrderModificationDialog;
