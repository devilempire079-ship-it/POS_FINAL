import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create the context
const OrderManagementContext = createContext();

// Custom hook to use the order management context
export const useOrderManagement = () => {
  const context = useContext(OrderManagementContext);
  if (!context) {
    throw new Error('useOrderManagement must be used within an OrderManagementProvider');
  }
  return context;
};

// Provider component
export const OrderManagementProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    // Try to load from localStorage first
    const savedOrders = localStorage.getItem('restaurantOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('restaurantOrders', JSON.stringify(orders));
  }, [orders]);

  // Create new order for a table
  const createOrder = useCallback((tableId, tableNumber, serverName) => {
    try {
      setLoading(true);

      // Check if table already has an active order
      const existingOrder = orders.find(order =>
        order.tableId === tableId &&
        order.status === 'active'
      );

      if (existingOrder) {
        // Load existing order
        loadOrder(existingOrder.id);
        return { success: true, order: existingOrder, isExisting: true };
      }

      const newOrder = {
        id: Date.now(),
        tableId: tableId,
        tableNumber: tableNumber,
        server: serverName,
        status: 'active', // 'active', 'paid', 'completed', 'cancelled'
        items: [],
        rounds: [], // Track multiple rounds
        payments: [], // Track payment history
        discounts: [], // Track applied discounts
        createdAt: new Date(),
        updatedAt: new Date(),
        subtotal: 0,
        tax: 0,
        total: 0,
        tip: 0,
        finalTotal: 0
      };

      setOrders(prev => [...prev, newOrder]);
      setCurrentOrder(newOrder);
      setOrderItems([]);

      console.log(`Order #${newOrder.id} created for Table ${tableNumber}`);
      return { success: true, order: newOrder, isExisting: false };
    } catch (err) {
      console.error('Failed to create order: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [orders]);

  // Load existing order
  const loadOrder = useCallback((orderId) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      setCurrentOrder(order);
      setOrderItems(order.items || []);

      console.log(`Order #${orderId} loaded for Table ${order.tableNumber}`);
      return { success: true, order };
    } catch (err) {
      console.error('Failed to load order: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [orders]);

  // Get order by table ID
  const getOrderByTable = useCallback((tableId) => {
    return orders.find(order =>
      order.tableId === tableId &&
      order.status === 'active'
    ) || null;
  }, [orders]);

  // Get all orders for a table (including completed ones)
  const getOrderHistoryByTable = useCallback((tableId) => {
    return orders.filter(order => order.tableId === tableId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  // Add item to current order
  const addItemToOrder = useCallback((item, quantity = 1, notes = '') => {
    if (!currentOrder) {
      throw new Error('No active order');
    }

    try {
      const orderItem = {
        id: Date.now() + Math.random(),
        name: item.name,
        price: item.price,
        quantity: quantity,
        notes: notes,
        category: item.category,
        prepTime: item.prepTime,
        addedAt: new Date(),
        round: currentOrder.rounds.length + 1
      };

      const updatedItems = [...orderItems, orderItem];
      setOrderItems(updatedItems);

      // Update order in orders array
      const updatedOrder = {
        ...currentOrder,
        items: updatedItems,
        updatedAt: new Date()
      };

      setOrders(prev => prev.map(order =>
        order.id === currentOrder.id ? updatedOrder : order
      ));

      setCurrentOrder(updatedOrder);

      console.log(`Item "${item.name}" added to order #${currentOrder.id}`);
      return { success: true, item: orderItem };
    } catch (err) {
      console.error('Failed to add item: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [currentOrder, orderItems]);

  // Update item quantity
  const updateItemQuantity = useCallback((itemId, newQuantity) => {
    if (!currentOrder) {
      throw new Error('No active order');
    }

    try {
      if (newQuantity <= 0) {
        // Remove item
        const updatedItems = orderItems.filter(item => item.id !== itemId);
        setOrderItems(updatedItems);

        const updatedOrder = {
          ...currentOrder,
          items: updatedItems,
          updatedAt: new Date()
        };

        setOrders(prev => prev.map(order =>
          order.id === currentOrder.id ? updatedOrder : order
        ));

        setCurrentOrder(updatedOrder);
      } else {
        // Update quantity
        const updatedItems = orderItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );

        setOrderItems(updatedItems);

        const updatedOrder = {
          ...currentOrder,
          items: updatedItems,
          updatedAt: new Date()
        };

        setOrders(prev => prev.map(order =>
          order.id === currentOrder.id ? updatedOrder : order
        ));

        setCurrentOrder(updatedOrder);
      }

      return { success: true };
    } catch (err) {
      console.error('Failed to update item quantity: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [currentOrder, orderItems]);

  // Calculate order totals
  const calculateTotals = useCallback((items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, []);

  // Get current order totals
  const getCurrentTotals = useCallback(() => {
    return calculateTotals(orderItems);
  }, [orderItems, calculateTotals]);

  // Send order to kitchen
  const sendOrderToKitchen = useCallback(() => {
    if (!currentOrder || orderItems.length === 0) {
      throw new Error('No active order or items to send');
    }

    try {
      // Create new round
      const newRound = {
        id: Date.now(),
        items: [...orderItems],
        sentAt: new Date(),
        status: 'sent'
      };

      const updatedOrder = {
        ...currentOrder,
        rounds: [...currentOrder.rounds, newRound],
        updatedAt: new Date()
      };

      setOrders(prev => prev.map(order =>
        order.id === currentOrder.id ? updatedOrder : order
      ));

      setCurrentOrder(updatedOrder);

      // Clear current items (ready for next round)
      setOrderItems([]);

      console.log(`Order round sent to kitchen for Table ${currentOrder.tableNumber}`);
      return { success: true, round: newRound };
    } catch (err) {
      console.error('Failed to send order to kitchen: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [currentOrder, orderItems]);

  // Process payment
  const processPayment = useCallback((paymentMethod, amount, tip = 0) => {
    if (!currentOrder) {
      throw new Error('No active order');
    }

    try {
      const totals = getCurrentTotals();
      const finalAmount = totals.total + tip;

      const payment = {
        id: Date.now(),
        method: paymentMethod,
        amount: amount,
        tip: tip,
        finalAmount: finalAmount,
        processedAt: new Date(),
        status: 'completed'
      };

      const updatedOrder = {
        ...currentOrder,
        payments: [...currentOrder.payments, payment],
        tip: tip,
        finalTotal: finalAmount,
        status: 'paid',
        paidAt: new Date(),
        updatedAt: new Date()
      };

      setOrders(prev => prev.map(order =>
        order.id === currentOrder.id ? updatedOrder : order
      ));

      setCurrentOrder(updatedOrder);

      console.log(`Payment of $${finalAmount} processed for Table ${currentOrder.tableNumber}`);
      return { success: true, payment, order: updatedOrder };
    } catch (err) {
      console.error('Failed to process payment: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [currentOrder, getCurrentTotals]);

  // Complete order (after payment)
  const completeOrder = useCallback((tableId) => {
    try {
      const order = orders.find(o => o.tableId === tableId && o.status === 'paid');
      if (!order) {
        throw new Error('No paid order found for table');
      }

      const updatedOrder = {
        ...order,
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      };

      setOrders(prev => prev.map(o =>
        o.id === order.id ? updatedOrder : o
      ));

      // Clear current order if it's the one being completed
      if (currentOrder && currentOrder.id === order.id) {
        setCurrentOrder(null);
        setOrderItems([]);
      }

      console.log(`Order #${order.id} completed for Table ${order.tableNumber}`);
      return { success: true, order: updatedOrder };
    } catch (err) {
      console.error('Failed to complete order: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [orders, currentOrder]);

  // Get all active orders
  const getActiveOrders = useCallback(() => {
    return orders.filter(order => order.status === 'active');
  }, [orders]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Get order statistics
  const getOrderStats = useCallback(() => {
    const activeOrders = orders.filter(o => o.status === 'active').length;
    const paidOrders = orders.filter(o => o.status === 'paid').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders
      .filter(o => o.status === 'paid' || o.status === 'completed')
      .reduce((sum, order) => sum + (order.finalTotal || 0), 0);

    return {
      activeOrders,
      paidOrders,
      completedOrders,
      totalOrders: orders.length,
      totalRevenue
    };
  }, [orders]);

  // Cancel order and release associated table
  const cancelOrder = useCallback((orderId, updateTableStatus) => {
    try {
      setLoading(true);

      // Find the order to cancel
      const orderToCancel = orders.find(order => order.id === orderId);
      if (!orderToCancel) {
        throw new Error('Order not found');
      }

      // Update order status to cancelled
      const cancelledOrder = {
        ...orderToCancel,
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date()
      };

      setOrders(prev => prev.map(order =>
        order.id === orderId ? cancelledOrder : order
      ));

      // Release associated table if it exists
      if (orderToCancel.tableId && updateTableStatus) {
        try {
          // Change table status from occupied to available
          const result = updateTableStatus(orderToCancel.tableId, 'available', 0);
          if (result && result.success) {
            console.log(`Table ${orderToCancel.tableNumber} released after order cancellation`);
          }
        } catch (tableError) {
          console.error('Failed to release table:', tableError);
          // Don't fail the entire cancellation if table update fails
        }
      }

      console.log(`Order #${orderId} cancelled successfully`);
      return { success: true, order: cancelledOrder };
    } catch (err) {
      console.error('Failed to cancel order: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [orders]);

  // Clear completed orders (cleanup)
  const clearCompletedOrders = useCallback(() => {
    try {
      setOrders(prev => prev.filter(order => order.status !== 'completed'));
      console.log('Completed orders cleared');
      return { success: true };
    } catch (err) {
      console.error('Failed to clear completed orders: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Reset all orders (for testing)
  const resetOrders = useCallback(() => {
    try {
      setOrders([]);
      setCurrentOrder(null);
      setOrderItems([]);
      localStorage.removeItem('restaurantOrders');
      console.log('All orders reset');
      return { success: true };
    } catch (err) {
      console.error('Failed to reset orders: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const value = {
    // State
    orders,
    currentOrder,
    orderItems,
    loading,
    error,

    // Order management
    createOrder,
    loadOrder,
    getOrderByTable,
    getOrderHistoryByTable,
    cancelOrder,

    // Item management
    addItemToOrder,
    updateItemQuantity,

    // Calculations
    calculateTotals,
    getCurrentTotals,

    // Kitchen integration
    sendOrderToKitchen,

    // Payment processing
    processPayment,
    completeOrder,

    // Queries
    getActiveOrders,
    getOrdersByStatus,
    getOrderStats,

    // Utilities
    clearCompletedOrders,
    resetOrders,
    setError,
    clearError: () => setError(null)
  };

  return (
    <OrderManagementContext.Provider value={value}>
      {children}
    </OrderManagementContext.Provider>
  );
};
