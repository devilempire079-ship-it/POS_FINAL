import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create the context
const OnlineOrdersContext = createContext();

// Custom hook to use the online orders context
export const useOnlineOrders = () => {
  const context = useContext(OnlineOrdersContext);
  if (!context) {
    throw new Error('useOnlineOrders must be used within an OnlineOrdersProvider');
  }
  return context;
};

// Provider component
export const OnlineOrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    // Try to load from localStorage first
    const savedOrders = localStorage.getItem('onlineOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('onlineOrders', JSON.stringify(orders));
  }, [orders]);

  // Platform configurations
  const platformConfig = {
    'uber-eats': {
      name: 'Uber Eats',
      color: 'bg-black text-white',
      icon: '🚗',
      priority: 'high',
      webhookUrl: process.env.UBER_EATS_WEBHOOK_URL
    },
    'doordash': {
      name: 'DoorDash',
      color: 'bg-pink-600 text-white',
      icon: '🏃',
      priority: 'high',
      webhookUrl: process.env.DOORDASH_WEBHOOK_URL
    },
    'grubhub': {
      name: 'Grubhub',
      color: 'bg-orange-500 text-white',
      icon: '🍔',
      priority: 'normal',
      webhookUrl: process.env.GRUBHUB_WEBHOOK_URL
    },
    'website': {
      name: 'Website',
      color: 'bg-blue-600 text-white',
      icon: '🌐',
      priority: 'normal',
      webhookUrl: null
    },
    'phone': {
      name: 'Phone',
      color: 'bg-green-600 text-white',
      icon: '📞',
      priority: 'normal',
      webhookUrl: null
    }
  };

  // Order status configurations
  const orderStatuses = {
    'received': { label: 'Received', color: 'bg-gray-100', icon: '📨' },
    'confirmed': { label: 'Confirmed', color: 'bg-blue-100', icon: '✅' },
    'preparing': { label: 'Preparing', color: 'bg-orange-100', icon: '🔥' },
    'ready': { label: 'Ready for Pickup', color: 'bg-green-100', icon: '📦' },
    'picked_up': { label: 'Picked Up', color: 'bg-blue-100', icon: '🚚' },
    'delivered': { label: 'Delivered', color: 'bg-purple-100', icon: '🏠' },
    'cancelled': { label: 'Cancelled', color: 'bg-red-100', icon: '❌' }
  };

  // Create online order from API data
  const createOnlineOrder = useCallback((orderData) => {
    try {
      setLoading(true);

      const newOrder = {
        id: orderData.id || Date.now(),
        externalOrderId: orderData.externalOrderId,
        platform: orderData.platform,
        orderType: orderData.orderType || 'takeout',
        customerInfo: orderData.customerInfo || {},
        items: orderData.items || [],
        deliveryAddress: orderData.deliveryAddress,
        estimatedPickupTime: orderData.estimatedPickupTime ? new Date(orderData.estimatedPickupTime) : null,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime ? new Date(orderData.estimatedDeliveryTime) : null,
        specialInstructions: orderData.specialInstructions || '',
        paymentMethod: orderData.paymentMethod || 'online',
        totalAmount: orderData.totalAmount || 0,
        status: orderData.status || 'received',
        createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
        updatedAt: new Date(),
        terminalId: orderData.terminalId,
        priority: orderData.priority || 'normal',
        kitchenOrderId: null, // Will be set when sent to kitchen
        notificationsSent: []
      };

      setOrders(prev => [...prev, newOrder]);
      console.log(`📱 Online order #${newOrder.id} created from ${newOrder.platform}`);

      return { success: true, order: newOrder };
    } catch (err) {
      console.error('Failed to create online order: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback((orderId, newStatus, additionalData = {}) => {
    try {
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updatedOrder = {
            ...order,
            status: newStatus,
            updatedAt: new Date(),
            ...additionalData
          };

          // Send notification to platform if needed
          if (newStatus === 'ready' || newStatus === 'picked_up' || newStatus === 'delivered') {
            sendPlatformNotification(updatedOrder);
          }

          return updatedOrder;
        }
        return order;
      }));

      console.log(`📱 Online order #${orderId} status updated to ${newStatus}`);
      return { success: true };
    } catch (err) {
      console.error('Failed to update order status: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Send notification to platform (webhook or API call)
  const sendPlatformNotification = useCallback(async (order) => {
    try {
      const platform = platformConfig[order.platform];
      if (!platform || !platform.webhookUrl) {
        console.log(`No webhook configured for ${order.platform}`);
        return;
      }

      const notificationData = {
        orderId: order.externalOrderId,
        status: order.status,
        timestamp: new Date(),
        estimatedPickupTime: order.estimatedPickupTime,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      };

      // In a real implementation, this would make an HTTP request to the platform
      console.log(`📤 Sending ${order.status} notification to ${platform.name}:`, notificationData);

      // Mark notification as sent
      setOrders(prev => prev.map(o =>
        o.id === order.id
          ? {
              ...o,
              notificationsSent: [...(o.notificationsSent || []), {
                type: order.status,
                sentAt: new Date(),
                platform: order.platform
              }]
            }
          : o
      ));

    } catch (error) {
      console.error('Failed to send platform notification:', error);
    }
  }, [platformConfig]);

  // Get order by ID
  const getOrderById = useCallback((id) => {
    return orders.find(order => order.id === id) || null;
  }, [orders]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Get orders by platform
  const getOrdersByPlatform = useCallback((platform) => {
    return orders.filter(order => order.platform === platform);
  }, [orders]);

  // Get urgent orders (overdue for pickup/delivery)
  const getUrgentOrders = useCallback(() => {
    const now = new Date();
    return orders.filter(order => {
      if (order.status !== 'confirmed' && order.status !== 'preparing' && order.status !== 'ready') {
        return false;
      }

      const estimatedTime = order.estimatedPickupTime || order.estimatedDeliveryTime;
      if (!estimatedTime) return false;

      const timeDiff = (now - new Date(estimatedTime)) / (1000 * 60); // minutes
      return timeDiff > 5; // Over 5 minutes late
    });
  }, [orders]);

  // Get pending orders (received but not confirmed)
  const getPendingOrders = useCallback(() => {
    return orders.filter(order => order.status === 'received');
  }, [orders]);

  // Get active orders (confirmed, preparing, ready)
  const getActiveOrders = useCallback(() => {
    return orders.filter(order =>
      ['confirmed', 'preparing', 'ready'].includes(order.status)
    );
  }, [orders]);

  // Confirm order (mark as confirmed)
  const confirmOrder = useCallback((orderId) => {
    return updateOrderStatus(orderId, 'confirmed');
  }, [updateOrderStatus]);

  // Mark order as preparing
  const startPreparingOrder = useCallback((orderId) => {
    return updateOrderStatus(orderId, 'preparing', {
      preparationStartedAt: new Date()
    });
  }, [updateOrderStatus]);

  // Mark order as ready
  const markOrderReady = useCallback((orderId) => {
    return updateOrderStatus(orderId, 'ready', {
      readyAt: new Date()
    });
  }, [updateOrderStatus]);

  // Mark order as picked up
  const markOrderPickedUp = useCallback((orderId, driverName = null) => {
    return updateOrderStatus(orderId, 'picked_up', {
      pickedUpAt: new Date(),
      pickedUpBy: driverName
    });
  }, [updateOrderStatus]);

  // Mark order as delivered
  const markOrderDelivered = useCallback((orderId, driverName = null) => {
    return updateOrderStatus(orderId, 'delivered', {
      deliveredAt: new Date(),
      deliveredBy: driverName
    });
  }, [updateOrderStatus]);

  // Cancel order
  const cancelOrder = useCallback((orderId, reason = '') => {
    return updateOrderStatus(orderId, 'cancelled', {
      cancelledAt: new Date(),
      cancellationReason: reason
    });
  }, [updateOrderStatus]);

  // Link order to kitchen order
  const linkToKitchenOrder = useCallback((orderId, kitchenOrderId) => {
    try {
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, kitchenOrderId, updatedAt: new Date() }
          : order
      ));

      console.log(`🔗 Online order #${orderId} linked to kitchen order #${kitchenOrderId}`);
      return { success: true };
    } catch (err) {
      console.error('Failed to link order to kitchen: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Get order statistics
  const getOrderStats = useCallback(() => {
    const totalOrders = orders.length;
    const pendingOrders = getPendingOrders().length;
    const activeOrders = getActiveOrders().length;
    const completedOrders = orders.filter(o => ['picked_up', 'delivered'].includes(o.status)).length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    const platformStats = {};
    orders.forEach(order => {
      if (!platformStats[order.platform]) {
        platformStats[order.platform] = 0;
      }
      platformStats[order.platform]++;
    });

    return {
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      platformStats
    };
  }, [orders, getPendingOrders, getActiveOrders]);

  // Clear completed orders (cleanup)
  const clearCompletedOrders = useCallback(() => {
    try {
      setOrders(prev => prev.filter(order =>
        !['picked_up', 'delivered', 'cancelled'].includes(order.status)
      ));
      console.log('Completed online orders cleared');
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
      localStorage.removeItem('onlineOrders');
      console.log('All online orders reset');
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
    loading,
    error,
    platformConfig,
    orderStatuses,

    // Order management
    createOnlineOrder,
    updateOrderStatus,
    confirmOrder,
    startPreparingOrder,
    markOrderReady,
    markOrderPickedUp,
    markOrderDelivered,
    cancelOrder,
    linkToKitchenOrder,

    // Queries
    getOrderById,
    getOrdersByStatus,
    getOrdersByPlatform,
    getPendingOrders,
    getActiveOrders,
    getUrgentOrders,
    getOrderStats,

    // Utilities
    clearCompletedOrders,
    resetOrders,
    setError,
    clearError: () => setError(null)
  };

  return (
    <OnlineOrdersContext.Provider value={value}>
      {children}
    </OnlineOrdersContext.Provider>
  );
};
