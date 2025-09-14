import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  Users,
  ChefHat,
  Clock,
  Plus,
  Minus,
  Search,
  ShoppingCart,
  CreditCard,
  Receipt,
  Split,
  CheckCircle,
  AlertCircle,
  Table,
  Utensils,
  Bell,
  MessageSquare,
  X,
  FileText,
  Edit3,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useBusinessType } from '../../../hooks/useBusinessType';
import { useTableContext } from '../../../hooks/TableContext';
import { useOrderManagement } from '../../../hooks/OrderManagementContext';
import { useKitchenOrders } from '../../../hooks/KitchenOrdersContext';
import { ProductSearchAndCart } from '../../ProductSearchAndCart';
import SeatAllocationDialog from '../../SeatAllocationDialog';
import EnhancedPaymentScreen from '../../restaurant/EnhancedPaymentScreen';
import OrderModificationDialog from '../../restaurant/OrderModificationDialog';
import TableAssistanceDialog from '../../restaurant/TableAssistanceDialog';
import QSRShortcutsPanel from './QSRShortcutsPanel';
import DriveThruLaneManager from '../../restaurant/DriveThruLaneManager';
import api from '../../../services/api';

const menuCategories = [
  { id: 'appetizers', name: 'Appetizers', icon: '🥗', color: 'bg-green-100 text-green-800' },
  { id: 'mains', name: 'Main Courses', icon: '🍖', color: 'bg-orange-100 text-orange-800' },
  { id: 'desserts', name: 'Desserts', icon: '🍰', color: 'bg-pink-100 text-pink-800' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', color: 'bg-blue-100 text-blue-800' },
];

const RestaurantSalesScreen = memo(() => {
  const { user } = useAuth();
  const { businessType, getCurrentSubtype, hasFeature, isSubtype } = useBusinessType();
  const isRestaurant = businessType?.code === 'restaurant';
  const isQuickService = isSubtype('quick_service');
  const isFineDining = isSubtype('fine_dining');
  const isCasual = isSubtype('casual');
  const hasTables = hasFeature('tables');
  const currentSubtype = getCurrentSubtype();

  const { tables, updateTableStatus, allocateSeats } = useTableContext();
  const { addOrder, orders, getOrderById, cancelOrder: cancelKitchenOrder } = useKitchenOrders();
  const { cancelOrder: cancelOrderManagement } = useOrderManagement();

  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('appetizers');
  const [orderType, setOrderType] = useState('counter');
  const [showPayment, setShowPayment] = useState(false);
  const [orderSentToKitchen, setOrderSentToKitchen] = useState(false);
  const [showTableRequest, setShowTableRequest] = useState(false);
  const [showSeatAllocation, setShowSeatAllocation] = useState(false);
  // New feature: Seat allocation mode toggle
  const [autoAllocateSeats, setAutoAllocateSeats] = useState(true);

  // Order modification states
  const [showOrderModification, setShowOrderModification] = useState(false);
  const [selectedOccupiedOrder, setSelectedOccupiedOrder] = useState(null);
  const [confirmOccupiedOrderOpen, setConfirmOccupiedOrderOpen] = useState(false);
  const [showOccupiedOrderMode] = useState(false);

  // Drive-thru lane management state
  const [driveThruLanes, setDriveThruLanes] = useState([
    { id: 'lane1', name: 'Lane 1', status: 'available', currentOrder: null },
    { id: 'lane2', name: 'Lane 2', status: 'available', currentOrder: null },
    { id: 'express', name: 'Express Lane', status: 'available', currentOrder: null }
  ]);

  // QSR Dynamic Layout state
  const [recentOrders, setRecentOrders] = useState([
    { id: 1, items: [{ name: 'Big Mac' }, { name: 'Fries' }], total: 8.99, orderType: 'counter', timeAgo: '5 min ago' },
    { id: 2, items: [{ name: 'Chicken Nuggets' }, { name: 'Coca Cola' }], total: 7.99, orderType: 'drive_thru', timeAgo: '12 min ago' }
  ]);

  const menuItems = useMemo(() => ({
    appetizers: [
      { id: 1, name: 'Caesar Salad', price: 12.99, category: 'appetizers', prepTime: 5 },
      { id: 2, name: 'Buffalo Wings', price: 14.99, category: 'appetizers', prepTime: 8 },
      { id: 3, name: 'Mozzarella Sticks', price: 9.99, category: 'appetizers', prepTime: 6 },
      { id: 4, name: 'Spinach & Artichoke Dip', price: 11.99, category: 'appetizers', prepTime: 7 },
      { id: 5, name: 'Loaded Potato Skins', price: 13.99, category: 'appetizers', prepTime: 10 },
      { id: 6, name: 'Calamari Rings', price: 15.99, category: 'appetizers', prepTime: 8 },
      { id: 7, name: 'Nachos Supreme', price: 16.99, category: 'appetizers', prepTime: 9 },
      { id: 8, name: 'Bruschetta', price: 10.99, category: 'appetizers', prepTime: 4 },
    ],
    mains: [
      { id: 9, name: 'Big Mac', price: 5.99, category: 'mains', prepTime: 3 },
      { id: 10, name: 'Chicken Nuggets', price: 4.99, category: 'mains', prepTime: 4 },
      { id: 11, name: 'Grilled Salmon', price: 24.99, category: 'mains', prepTime: 15 },
      { id: 12, name: 'Ribeye Steak', price: 32.99, category: 'mains', prepTime: 18 },
      { id: 13, name: 'Chicken Parmesan', price: 19.99, category: 'mains', prepTime: 12 },
      { id: 14, name: 'Vegetarian Pasta', price: 16.99, category: 'mains', prepTime: 10 },
      { id: 15, name: 'Fish & Chips', price: 17.99, category: 'mains', prepTime: 11 },
      { id: 16, name: 'BBQ Ribs', price: 26.99, category: 'mains', prepTime: 20 },
      { id: 17, name: 'Chicken Caesar Wrap', price: 13.99, category: 'mains', prepTime: 6 },
      { id: 18, name: 'Beef Burger', price: 14.99, category: 'mains', prepTime: 8 },
      { id: 19, name: 'Margherita Pizza', price: 18.99, category: 'mains', prepTime: 12 },
      { id: 20, name: 'Chicken Stir Fry', price: 15.99, category: 'mains', prepTime: 9 },
    ],
    desserts: [
      { id: 21, name: 'Ice Cream Cone', price: 1.49, category: 'desserts', prepTime: 1 },
      { id: 22, name: 'Chocolate Lava Cake', price: 8.99, category: 'desserts', prepTime: 8 },
      { id: 23, name: 'Tiramisu', price: 7.99, category: 'desserts', prepTime: 3 },
      { id: 24, name: 'Cheesecake', price: 6.99, category: 'desserts', prepTime: 2 },
      { id: 25, name: 'Apple Pie', price: 5.99, category: 'desserts', prepTime: 4 },
      { id: 26, name: 'Brownie Sundae', price: 9.99, category: 'desserts', prepTime: 5 },
      { id: 27, name: 'Fruit Salad', price: 7.49, category: 'desserts', prepTime: 3 },
      { id: 28, name: 'Milkshake', price: 6.49, category: 'desserts', prepTime: 2 },
    ],
    beverages: [
      { id: 29, name: 'Coca Cola', price: 1.99, category: 'beverages', prepTime: 1 },
      { id: 30, name: 'Coffee', price: 1.79, category: 'beverages', prepTime: 1 },
      { id: 31, name: 'House Wine', price: 8.99, category: 'beverages', prepTime: 1 },
      { id: 32, name: 'Craft Beer', price: 6.99, category: 'beverages', prepTime: 1 },
      { id: 33, name: 'Fresh Orange Juice', price: 4.99, category: 'beverages', prepTime: 1 },
      { id: 34, name: 'Iced Tea', price: 2.99, category: 'beverages', prepTime: 1 },
      { id: 35, name: 'Hot Chocolate', price: 3.99, category: 'beverages', prepTime: 2 },
      { id: 36, name: 'Smoothie', price: 5.99, category: 'beverages', prepTime: 3 },
      { id: 37, name: 'Mineral Water', price: 2.49, category: 'beverages', prepTime: 1 },
      { id: 38, name: 'Lemonade', price: 3.49, category: 'beverages', prepTime: 1 },
    ],
  }), []);

  const addToOrder = useCallback((item) => {
    if (isQuickService && !currentOrder) {
      setCurrentOrder({
        id: Date.now(),
        orderType: orderType,
        serviceType: 'quick_service',
        terminalId: 'QSR-' + Date.now(),
        startTime: new Date().toLocaleTimeString(),
        server: user?.name || 'QSR Server'
      });
    }

    setOrderItems(prevItems => {
      const existingItem = prevItems.find(orderItem => orderItem.id === item.id);
      if (existingItem) {
        return prevItems.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1, modifiers: [], specialInstructions: '' }];
      }
    });
  }, [currentOrder, isQuickService, orderType, user?.name]);

  const processPayment = useCallback(() => {
    setShowPayment(true);
  }, []);

  // Drive-thru lane management functions
  const updateLaneStatus = useCallback((laneId, newStatus) => {
    setDriveThruLanes(prev => prev.map(lane =>
      lane.id === laneId
        ? { ...lane, status: newStatus, currentOrder: newStatus === 'available' ? null : lane.currentOrder }
        : lane
    ));
  }, []);

  const assignOrderToLane = useCallback((laneId, orderId) => {
    setDriveThruLanes(prev => prev.map(lane =>
      lane.id === laneId
        ? { ...lane, status: 'busy', currentOrder: orderId }
        : lane
    ));

    // Update current order with lane assignment
    if (currentOrder) {
      setCurrentOrder(prev => ({
        ...prev,
        assignedLane: laneId,
        laneAssignmentTime: new Date().toLocaleTimeString()
      }));
    }

    alert(`Order #${orderId} assigned to ${driveThruLanes.find(l => l.id === laneId)?.name}`);
  }, [currentOrder, driveThruLanes]);

  // Find order associated with an occupied table
  const findOrderByTable = useCallback((tableId) => {
    return orders.find(order =>
      order.status === 'active' &&
      (order.tableId === tableId || String(order.tableId) === String(tableId))
    );
  }, [orders]);

  // Handle occupied table click with confirmation
  const handleOccupiedTableClick = useCallback((table) => {
    const associatedOrder = findOrderByTable(table.id);
    if (!associatedOrder) {
      alert('No active order found for this table.');
      return;
    }

    setSelectedOccupiedOrder(associatedOrder);
    setConfirmOccupiedOrderOpen(true);
  }, [findOrderByTable]);

  // Confirm and open order modification dialog
  const confirmOccupiedOrderModification = useCallback(() => {
    console.log('View Order clicked - selectedOccupiedOrder:', selectedOccupiedOrder);
    if (selectedOccupiedOrder) {
      console.log('Setting showOrderModification to true');
      setShowOrderModification(true);
      setConfirmOccupiedOrderOpen(false);
    } else {
      console.error('No selectedOccupiedOrder found');
      alert('Error: No order selected to view');
    }
  }, [selectedOccupiedOrder]);

  // Close occupied order modification
  const closeOccupiedOrderModification = useCallback(() => {
    setShowOrderModification(false);
    setSelectedOccupiedOrder(null);
    setShowOccupiedOrderMode(false);
  }, []);

  // Table management functions
  const selectTable = useCallback((table) => {
    if (selectedTable?.id === table.id) {
      // Deselect if already selected - release table if it was available
      if (selectedTable.status === 'available') {
        updateTableStatus(selectedTable.id, 'available', 0); // Release to available
      }
      setSelectedTable(null);
    } else {
      // Handle occupied tables differently
      if (table.status === 'occupied' && !isQuickService) {
        handleOccupiedTableClick(table);
        return;
      }

      // Allow selecting any table (including reserved)
      // If changing tables, release the old table if it was available
      if (selectedTable && selectedTable.status === 'available') {
        updateTableStatus(selectedTable.id, 'available', 0); // Release old table
      }

      // Select new table
      setSelectedTable(table);

      if (!currentOrder && !isQuickService) {
        setCurrentOrder({
          id: Date.now(),
          tableId: table.id,
          tableNumber: table.number,
          startTime: new Date().toLocaleTimeString(),
          server: user?.name || 'Server'
        });
      }

      // Apply seat allocation only for available tables (don't change reserved table status)
      if (table.status === 'available') {
        if (autoAllocateSeats) {
          // Auto-allocate all seats: change status to occupied and mark all seats taken
          updateTableStatus(table.id, 'occupied', table.capacity);
          allocateSeats(table.id, table.capacity, table.capacity);
        } else {
          // Manual allocation: open seat dialog
          setShowSeatAllocation(true);
        }
      }
      // Reserved tables stay selected without status change
    }
  }, [selectedTable, currentOrder, isQuickService, user?.name, autoAllocateSeats, updateTableStatus, allocateSeats, handleOccupiedTableClick]);

  const deselectTable = useCallback(() => {
    setSelectedTable(null);
  }, []);

  if (showPayment) {
    return (
      <EnhancedPaymentScreen
        tableId={selectedTable?.id}
        onClose={() => setShowPayment(false)}
        onPaymentComplete={(order) => {
          console.log('Payment completed for order:', order);
          setShowPayment(false);
          setSelectedTable(null);
          setCurrentOrder(null);
          setOrderItems([]);
        }}
      />
    );
  }

  // Order modification handler functions
  const handleOrderModify = useCallback((itemId, updates) => {
    if (selectedOccupiedOrder) {
      // Find the order and update the item
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOccupiedOrder.id) {
          const updatedItems = order.items.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
          );
          return { ...order, items: updatedItems };
        }
        return order;
      });

      // Update the selected occupied order state
      const updatedOrder = orders.find(order => order.id === selectedOccupiedOrder.id);
      if (updatedOrder) {
        const updatedItems = updatedOrder.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        );
        setSelectedOccupiedOrder({ ...updatedOrder, items: updatedItems });
      }
    }
  }, [selectedOccupiedOrder, orders]);

  const handleRemoveOrderItem = useCallback((itemId) => {
    if (selectedOccupiedOrder) {
      setSelectedOccupiedOrder(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    }
  }, [selectedOccupiedOrder]);

  const handleAddOrderItem = useCallback((item) => {
    if (selectedOccupiedOrder) {
      const newItem = {
        id: Date.now(),
        name: item.name,
        price: item.price,
        quantity: 1,
        prepTime: item.prepTime,
        category: item.category,
        status: 'ordered'
      };

      setSelectedOccupiedOrder(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  }, [selectedOccupiedOrder]);

  const handleCancelOccupiedOrder = useCallback((orderId, reason) => {
    if (selectedOccupiedOrder && String(selectedOccupiedOrder.id) === String(orderId)) {
      // Cancel the order and release the table
      updateTableStatus(selectedOccupiedOrder.tableId, 'available', 0);
      cancelKitchenOrder(orderId);

      closeOccupiedOrderModification();
      alert('Order cancelled and table released to available status.');
    }
  }, [selectedOccupiedOrder, updateTableStatus, cancelKitchenOrder, closeOccupiedOrderModification]);

  const handleSendOrderModifications = useCallback((orderId, modifications, note) => {
    console.log('Sending modifications:', { orderId, modifications, note });
    // Here you'd handle sending modifications to kitchen and updating the order
    alert('Order modifications sent to kitchen successfully!');
    closeOccupiedOrderModification();
  }, [closeOccupiedOrderModification]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Utensils className="w-6 h-6 mr-2 text-orange-600" />
              Restaurant POS
            </h1>
            <p className="text-gray-600">Server: {user?.name}</p>
            {businessType && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm">{businessType.icon}</span>
                <span className="text-sm font-medium text-orange-600">
                  {businessType.name} Mode
                </span>
                {currentSubtype && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    {currentSubtype === 'fine_dining' ? 'Fine Dining' :
                     currentSubtype === 'casual' ? 'Casual Dining' :
                     currentSubtype === 'quick_service' ? 'Quick Service' :
                     currentSubtype}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isQuickService && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Order Type:</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="counter">Counter Service</option>
                  <option value="drive_thru">Drive-Thru</option>
                  <option value="takeout">Takeout</option>
                </select>
              </div>
            )}
            <div className="text-sm text-gray-600">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Dynamic Layout for QSR - Three Panel System */}
        {isQuickService ? (
          <>
            {/* Menu Panel - Dynamic width based on cart state */}
            <div className={`bg-white p-4 transition-all duration-500 ease-in-out ${
              orderItems.length === 0 ? 'flex-1' : hasTables ? 'w-1/2' : 'w-3/4'
            }`}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Menu</h2>
                <div className="flex space-x-2 overflow-x-auto">
                  {menuCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
                        activeCategory === category.id
                          ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {menuItems[activeCategory]?.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addToOrder(item)}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-orange-300 transition-all text-left relative group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">{item.name}</h3>
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                        <Clock className="w-3 h-3 inline mr-0.5" />
                        {item.prepTime}min
                      </span>
                    </div>
                    <p className="text-base font-bold text-orange-600 leading-tight">${item.price.toFixed(2)}</p>
                    <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      Click to add
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Panel - Dynamic visibility and width */}
            <div className={`bg-gray-50 border-l border-gray-200 flex flex-col transition-all duration-500 ease-in-out ${
              orderItems.length === 0 ? 'w-0 opacity-0 overflow-hidden' : hasTables ? 'w-1/4' : 'w-1/4'
            }`}>
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Order</h2>
                  {currentOrder && (
                    <span className="text-sm text-gray-600">
                      <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {currentOrder.orderType?.replace('_', ' ') || 'Counter Service'}
                      </span>
                    </span>
                  )}
                </div>
                {currentOrder && (
                  <div className="text-sm text-gray-600">
                    <div>Started: {currentOrder.startTime}</div>
                    <div>Server: {currentOrder.server}</div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {orderItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No items in order</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Start ordering by clicking menu items
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map(item => (
                      <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                            </div>
                            <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                          </div>
                          <button
                            onClick={() => {
                              setOrderItems(prev => prev.filter(i => i.id !== item.id));
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => {
                                setOrderItems(prev => prev.map(i =>
                                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                                ));
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-bold text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {orderItems.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%):</span>
                      <span>${(orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${(orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.08).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {!orderSentToKitchen ? (
                      <button
                        onClick={() => {
                          if (orderItems.length === 0) {
                            alert('Please add items to the order before sending to kitchen.');
                            return;
                          }

                          // Send order to kitchen
                          const orderData = {
                            tableNumber: selectedTable?.number || 'Counter',
                            tableId: selectedTable?.id,
                            server: user?.name || 'Server',
                            orderType: orderType,
                            items: orderItems.map(item => ({
                              name: item.name,
                              quantity: item.quantity,
                              price: item.price,
                              prepTime: item.prepTime || 10,
                              category: item.category || 'mains',
                              specialInstructions: item.specialInstructions || ''
                            })),
                            priority: isQuickService ? 'high' : 'normal',
                            estimatedPrepTime: orderItems.reduce((sum, item) => sum + (item.prepTime || 10), 0)
                          };

                          const result = addOrder(orderData);

                          if (result.success) {
                            setOrderSentToKitchen(true);
                            alert(`Order sent to kitchen successfully! Order #${result.order.id}`);
                          } else {
                            alert('Failed to send order to kitchen. Please try again.');
                          }
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      >
                        <ChefHat className="w-4 h-4 mr-2" />
                        Send to Kitchen
                      </button>
                    ) : (
                      <div className="w-full bg-green-100 text-green-800 py-2 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Order Sent to Kitchen
                      </div>
                    )}

                    <button
                      onClick={processPayment}
                      disabled={!orderSentToKitchen}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                          // Cancel in KitchenOrdersContext if there are items sent to kitchen
                          if (currentOrder?.id) {
                            const kitchenOrder = getOrderById(currentOrder.id);
                            if (kitchenOrder) {
                              cancelKitchenOrder(kitchenOrder.id);
                            }
                          }

                          // Release associated table by changing status to available
                          if (selectedTable) {
                            updateTableStatus(selectedTable.id, 'available', 0);
                          }

                          // Clear local state
                          setOrderItems([]);
                          setCurrentOrder(null);
                          setOrderSentToKitchen(false);
                          setSelectedTable(null);

                          alert('Order cancelled successfully!');
                        }
                      }}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* QSR Shortcuts Panel - Always visible */}
            <div className="w-1/5 bg-gradient-to-br from-blue-50 to-indigo-50 border-l border-blue-200">
              <QSRShortcutsPanel
                onAddItem={addToOrder}
                orderItems={orderItems}
                recentOrders={recentOrders}
              />
            </div>

            {/* Drive-Thru Lane Management - Only when drive-thru is selected */}
            {orderType === 'drive_thru' && (
              <DriveThruLaneManager
                lanes={driveThruLanes}
                onLaneUpdate={updateLaneStatus}
                onOrderAssign={assignOrderToLane}
                currentOrder={currentOrder}
                orderType={orderType}
              />
            )}
          </>
        ) : (
          <>
            {/* Traditional Layout for Table-based Restaurants */}
            {/* LEFT PANEL: Table Management */}
            <div className="w-1/4 bg-white border-r border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <Table className="w-5 h-5 mr-2" />
                  Tables
                </h2>
                <button
                  onClick={() => setShowTableRequest(true)}
                  className="p-2 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors"
                  title="Request table assistance"
                >
                  <Bell className="w-4 h-4 text-orange-600" />
                </button>
              </div>

              {/* Table Statistics & Seat Allocation Toggle */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {tables.filter(t => t.status === 'available').length}
                    </div>
                    <div className="text-xs text-gray-600">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {tables.filter(t => t.status === 'occupied').length}
                    </div>
                    <div className="text-xs text-gray-600">Occupied</div>
                  </div>
                </div>
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-600">
                    Total Seats: {tables.reduce((sum, t) => sum + t.capacity, 0)}
                  </div>
                </div>

                {/* Seat Allocation Mode Toggle */}
                <div className="flex items-center justify-center space-x-2 p-2 bg-white rounded-lg border border-gray-200">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">Auto-allocate seats:</span>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoAllocateSeats}
                      onChange={(e) => setAutoAllocateSeats(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-xs text-gray-600">
                      {autoAllocateSeats ? '👥 All seats' : '🎯 Custom allocation'}
                    </span>
                  </label>
                </div>
                <div className="text-xs text-gray-500 text-center mt-1">
                  {autoAllocateSeats ? 'Click table = occupy ALL seats' : 'Click table = choose seats to occupy'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {tables.map(table => {
                  const availableSeats = table.availableSeats !== undefined ? table.availableSeats : table.capacity;
                  const occupiedSeats = table.occupiedSeats || 0;

                  return (
                    <button
                      key={table.id}
                      onClick={() => selectTable(table)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (selectedTable?.id === table.id && !orderSentToKitchen) {
                          deselectTable();
                        }
                      }}
                      className={`p-3 rounded-lg border-2 text-center transition-all relative ${
                        selectedTable?.id === table.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : table.status === 'available'
                          ? 'border-green-300 bg-green-50 hover:bg-green-100 hover:shadow-sm cursor-pointer'
                          : table.status === 'occupied'
                          ? 'border-red-300 bg-red-50 hover:bg-red-100 hover:shadow-sm cursor-pointer'
                          : 'border-yellow-300 bg-yellow-50 cursor-pointer'
                      }`}
                      title={selectedTable?.id === table.id && !orderSentToKitchen ? 'Right-click to deselect table' : ''}
                    >
                      <div className="text-lg font-bold">
                        {typeof table.number === 'string' ? table.number : `T${table.number}`}
                      </div>
                      <div className="text-sm font-semibold text-green-600 mb-1">
                        {availableSeats} seats free
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        <Users className="w-3 h-3 inline mr-1" />
                        {table.capacity} total
                      </div>
                      <div className={`text-xs px-2 py-1 rounded font-medium ${
                        table.status === 'available' ? 'bg-green-200 text-green-800' :
                        table.status === 'occupied' ? 'bg-red-200 text-red-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {table.status}
                        {occupiedSeats > 0 && ` (${occupiedSeats})`}
                      </div>
                      {table.status === 'available' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTable(table);
                            setShowSeatAllocation(true);
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Quick seat allocation"
                        >
                          <Users className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedTable && (
                <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-blue-800">Table {typeof selectedTable.number === 'string' ? selectedTable.number : `T${selectedTable.number}`}</h3>
                      <p className="text-sm text-blue-600">Capacity: {selectedTable.capacity}</p>
                      <p className="text-sm text-blue-600">Available: {selectedTable.availableSeats || selectedTable.capacity} seats</p>
                    </div>
                    <button
                      onClick={() => setShowSeatAllocation(true)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Allocate Seats
                    </button>
                  </div>
                  <div className="text-xs text-blue-600">
                    Status: {selectedTable.status}
                    {selectedTable.occupiedSeats > 0 && ` (${selectedTable.occupiedSeats} occupied)`}
                  </div>
                </div>
              )}
            </div>

            {/* CENTER PANEL: Menu */}
            <div className="w-1/2 bg-white p-4">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Menu</h2>
                <div className="flex space-x-2 overflow-x-auto">
                  {menuCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap ${
                        activeCategory === category.id
                          ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {menuItems[activeCategory]?.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addToOrder(item)}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-orange-300 transition-all text-left relative group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">{item.name}</h3>
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                        <Clock className="w-3 h-3 inline mr-0.5" />
                        {item.prepTime}min
                      </span>
                    </div>
                    <p className="text-base font-bold text-orange-600 leading-tight">${item.price.toFixed(2)}</p>
                    <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      Click to add
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT PANEL: Order/Cart */}
            <div className="w-1/4 bg-gray-50 border-l border-gray-200 flex flex-col">
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Order</h2>
                  {selectedTable && (
                    <span className="text-sm text-gray-600">
                      Table {typeof selectedTable.number === 'string' ? selectedTable.number : `T${selectedTable.number}`}
                    </span>
                  )}
                </div>
                {currentOrder && (
                  <div className="text-sm text-gray-600">
                    <div>Started: {currentOrder.startTime}</div>
                    <div>Server: {currentOrder.server}</div>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {orderItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No items in order</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Select a table and add items
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map(item => (
                      <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                            </div>
                            <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                          </div>
                          <button
                            onClick={() => {
                              setOrderItems(prev => prev.filter(i => i.id !== item.id));
                            }}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => {
                                setOrderItems(prev => prev.map(i =>
                                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                                ));
                              }}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-bold text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {orderItems.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-white">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%):</span>
                      <span>${(orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${(orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.08).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {!orderSentToKitchen ? (
                      <button
                        onClick={() => {
                          if (orderItems.length === 0) {
                            alert('Please add items to the order before sending to kitchen.');
                            return;
                          }

                          // Calculate totals
                          const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                          const tax = subtotal * 0.08;
                          const total = subtotal + tax;

                          // Send order to kitchen
                          const orderData = {
                            tableNumber: selectedTable?.number || 'Counter',
                            tableId: selectedTable?.id,
                            server: user?.name || 'Server',
                            orderType: 'dine_in',
                            items: orderItems.map(item => ({
                              name: item.name,
                              quantity: item.quantity,
                              price: item.price,
                              prepTime: item.prepTime || 10,
                              category: item.category || 'mains',
                              specialInstructions: item.specialInstructions || ''
                            })),
                            priority: 'normal',
                            estimatedPrepTime: orderItems.reduce((sum, item) => sum + (item.prepTime || 10), 0),
                            total: total
                          };

                          const result = addOrder(orderData);

                          if (result.success) {
                            // Create sale transaction in addition to kitchen order
                            try {
                              const saleData = {
                                items: orderItems.map(item => ({
                                  productId: item.id,
                                  productName: item.name,
                                  quantity: item.quantity,
                                  unitPrice: item.price,
                                  totalPrice: item.price * item.quantity
                                })),
                                subtotal: subtotal,
                                tax: tax,
                                totalAmount: total,
                                paymentMethod: null, // To be set during payment
                                customerId: currentOrder?.customerId || null,
                                tableId: selectedTable?.id || null,
                                serverId: user?.id || null,
                                serverName: user?.name || 'Server',
                                orderId: result.order.id,
                                saleType: isQuickService ? 'quick_service' : 'dine_in',
                                businessType: 'restaurant'
                              };

                              api.createSale(saleData);
                              console.log('Sale transaction created for order:', result.order.id);
                            } catch (saleError) {
                              console.error('Failed to create sale transaction:', saleError);
                              // Don't block kitchen order if sale creation fails
                            }

                            setOrderSentToKitchen(true);
                            alert(`Order sent to kitchen successfully! Order #${result.order.id}`);
                          } else {
                            alert('Failed to send order to kitchen. Please try again.');
                          }
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      >
                        <ChefHat className="w-4 h-4 mr-2" />
                        Send to Kitchen
                      </button>
                    ) : (
                      <div className="w-full bg-green-100 text-green-800 py-2 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Order Sent to Kitchen
                      </div>
                    )}

                    <button
                      onClick={processPayment}
                      disabled={!orderSentToKitchen}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                          // Cancel in KitchenOrdersContext if there are items sent to kitchen
                          if (currentOrder?.id) {
                            const kitchenOrder = getOrderById(currentOrder.id);
                            if (kitchenOrder) {
                              cancelKitchenOrder(kitchenOrder.id);
                            }
                          }

                          // Release associated table by changing status to available
                          if (selectedTable) {
                            updateTableStatus(selectedTable.id, 'available', 0);
                          }

                          // Clear local state
                          setOrderItems([]);
                          setCurrentOrder(null);
                          setOrderSentToKitchen(false);
                          setSelectedTable(null);

                          alert('Order cancelled successfully!');
                        }
                      }}
                      className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog for Occupied Table Orders */}
      {confirmOccupiedOrderOpen && selectedOccupiedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Edit3 className="w-6 h-6 mr-3 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Modify Order - Table {selectedOccupiedOrder.tableNumber}
                </h3>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-3">
                  <div><strong>Order #:</strong> {selectedOccupiedOrder.id}</div>
                  <div><strong>Started:</strong> {new Date(selectedOccupiedOrder.orderTime).toLocaleTimeString()}</div>
                  <div><strong>Items:</strong> {selectedOccupiedOrder.items.length}</div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    This table has an active order. Do you want to view and modify this order?
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    Changes will need to be sent to the kitchen for approval.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmOccupiedOrderOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmOccupiedOrderModification}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Modification Dialog */}
      {showOrderModification && selectedOccupiedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <OrderModificationDialog
                order={{
                  id: selectedOccupiedOrder.id,
                  tableNumber: selectedOccupiedOrder.tableNumber,
                  server: selectedOccupiedOrder.server,
                  orderType: 'dine_in',
                  createdAt: selectedOccupiedOrder.orderTime
                }}
                orderItems={selectedOccupiedOrder.items || []}
                onClose={closeOccupiedOrderModification}
                onModifyItem={handleOrderModify}
                onRemoveItem={handleRemoveOrderItem}
                onAddItem={handleAddOrderItem}
                onCancelOrder={handleCancelOccupiedOrder}
                onSendModification={handleSendOrderModifications}
                kitchenStatus={'connected'}
                menuItems={menuItems}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table Assistance Request Dialog */}
      {showTableRequest && (
        <TableAssistanceDialog
          selectedTable={selectedTable}
          user={user}
          onClose={() => setShowTableRequest(false)}
          onRequestSubmitted={(request) => {
            console.log('Assistance request submitted:', request);
            setShowTableRequest(false);
          }}
        />
      )}
    </div>
  );
});

export default RestaurantSalesScreen;
