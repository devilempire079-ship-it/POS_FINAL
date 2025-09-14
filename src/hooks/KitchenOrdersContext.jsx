import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

// Create the context
const KitchenOrdersContext = createContext();

// Custom hook to use the kitchen orders context
export const useKitchenOrders = () => {
  const context = useContext(KitchenOrdersContext);
  if (!context) {
    throw new Error('useKitchenOrders must be used within a KitchenOrdersProvider');
  }
  return context;
};

// Provider component
export const KitchenOrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    // Try to load from localStorage first
    const savedOrders = localStorage.getItem('kitchenOrders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('kitchenOrders', JSON.stringify(orders));
  }, [orders]);

  // Course sequencing configuration
  const courseConfig = {
    appetizers: { sequence: 1, priority: 'high', timing: 'immediate', color: 'bg-green-100' },
    mains: { sequence: 2, priority: 'normal', timing: 'after_appetizers', color: 'bg-orange-100' },
    desserts: { sequence: 3, priority: 'low', timing: 'after_mains', color: 'bg-pink-100' },
    beverages: { sequence: 4, priority: 'high', timing: 'throughout', color: 'bg-blue-100' }
  };

  // Enhanced item status system with preparation tracking
  const itemStatuses = {
    'ordered': { label: 'Ordered', color: 'bg-gray-100', icon: '📝' },
    'queued': { label: 'In Queue', color: 'bg-yellow-100', icon: '⏳' },
    'assigned': { label: 'Assigned', color: 'bg-purple-100', icon: '👨‍🍳' },
    'being_prepared': { label: 'Being Prepared', color: 'bg-orange-100', icon: '🔥' },
    'ready': { label: 'Ready for Pickup', color: 'bg-green-100', icon: '✅' },
    'picked_up': { label: 'Picked Up', color: 'bg-blue-100', icon: '🚚' },
    'served': { label: 'Served', color: 'bg-purple-100', icon: '🍽️' },
    'completed': { label: 'Completed', color: 'bg-gray-100', icon: '✓' }
  };

  // Kitchen staff configuration
  const kitchenStaff = [
    { id: 'cook1', name: 'Chef Maria', station: 'Grill Station', color: 'bg-red-100' },
    { id: 'cook2', name: 'Chef Carlos', station: 'Salad Station', color: 'bg-green-100' },
    { id: 'cook3', name: 'Chef Anna', station: 'Dessert Station', color: 'bg-pink-100' },
    { id: 'cook4', name: 'Chef David', station: 'Hot Station', color: 'bg-orange-100' }
  ];

  // Preparation stations
  const preparationStations = {
    'grill': { name: 'Grill Station', color: 'bg-red-100', icon: '🔥' },
    'salad': { name: 'Salad Station', color: 'bg-green-100', icon: '🥗' },
    'dessert': { name: 'Dessert Station', color: 'bg-pink-100', icon: '🍰' },
    'hot': { name: 'Hot Station', color: 'bg-orange-100', icon: '🍳' },
    'bar': { name: 'Bar Station', color: 'bg-blue-100', icon: '🍸' }
  };

  // Add new order from sales screen with enhanced tracking
  const addOrder = useCallback((orderData) => {
    try {
      setLoading(true);

      // Group items by course for sequencing
      const itemsByCourse = orderData.items.reduce((acc, item) => {
        const course = item.category || 'mains';
        if (!acc[course]) acc[course] = [];
        acc[course].push(item);
        return acc;
      }, {});

      // Determine order type and priority based on service model
      const orderType = orderData.orderType || 'dine_in';
      const isQuickService = orderType === 'counter' || orderType === 'drive_thru';
      const basePriority = isQuickService ? 'high' : 'normal';

      // Assign drive-through lane if applicable
      let assignedLane = null;
      if (orderType === 'drive_thru') {
        assignedLane = assignDriveThruLane();
      }

      const newOrder = {
        id: Date.now(),
        tableNumber: orderData.tableNumber,
        tableId: orderData.tableId,
        server: orderData.server,
        items: orderData.items.map(item => ({
          id: Date.now() + Math.random(),
          name: item.name,
          quantity: item.quantity,
          prepTime: item.prepTime || (isQuickService ? 8 : 10), // Faster prep for QSR
          status: 'ordered', // Enhanced status
          notes: item.specialInstructions || '',
          startTime: null,
          readyTime: null,
          pickedUpTime: null,
          servedTime: null,
          priority: item.priority || basePriority,
          price: item.price,
          category: item.category || 'mains',
          course: courseConfig[item.category] || courseConfig.mains,
          pickupLocation: getPickupLocation(item.category, orderType),
          preparationStation: getPreparationStation(item.category, orderType)
        })),
        itemsByCourse,
        orderTime: new Date(),
        priority: basePriority,
        course: orderData.course || 'main',
        status: 'active',
        courseProgress: {
          appetizers: { completed: false, served: false },
          mains: { completed: false, served: false },
          desserts: { completed: false, served: false },
          beverages: { completed: false, served: false }
        },
        // Enhanced order type fields
        orderType: orderType,
        isQuickService: isQuickService,
        driveThruLane: assignedLane,
        estimatedPrepTime: calculateEstimatedPrepTime(orderData.items, orderType),
        // Online order fields
        platform: orderData.platform,
        externalOrderId: orderData.externalOrderId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        estimatedPickupTime: orderData.estimatedPickupTime,
        estimatedDeliveryTime: orderData.estimatedDeliveryTime
      };

      setOrders(prev => [...prev, newOrder]);

      const orderTypeLabel = getOrderTypeLabel(newOrder);
      console.log(`Order #${newOrder.id} sent to kitchen for ${orderTypeLabel}`);

      // Send notification for new order
      notificationService.notifyNewOrder(newOrder);

      return { success: true, order: newOrder };
    } catch (err) {
      console.error('Failed to add order: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to determine pickup location
  const getPickupLocation = (category, orderType = 'dine_in') => {
    // For quick service, adjust pickup locations
    if (orderType === 'counter' || orderType === 'drive_thru') {
      const qsrLocations = {
        appetizers: 'Counter Pickup',
        mains: 'Counter Pickup',
        desserts: 'Counter Pickup',
        beverages: 'Counter Pickup'
      };
      return qsrLocations[category] || 'Counter Pickup';
    }

    // Traditional restaurant pickup locations
    const locations = {
      appetizers: 'Cold Station',
      mains: 'Hot Station',
      desserts: 'Dessert Station',
      beverages: 'Bar Station'
    };
    return locations[category] || 'Hot Station';
  };

  // Helper function to determine preparation station
  const getPreparationStation = (category, orderType = 'dine_in') => {
    // For quick service, optimize station assignments
    if (orderType === 'counter' || orderType === 'drive_thru') {
      const qsrStations = {
        appetizers: 'Quick Prep',
        mains: 'Fast Grill',
        desserts: 'Quick Dessert',
        beverages: 'Quick Bar'
      };
      return qsrStations[category] || 'Quick Prep';
    }

    // Traditional restaurant preparation stations
    const stations = {
      appetizers: 'Salad Station',
      mains: 'Grill Station',
      desserts: 'Pastry Station',
      beverages: 'Bar Station'
    };
    return stations[category] || 'Main Kitchen';
  };

  // Drive-through lane management
  const driveThruLanes = [
    { id: 'lane1', name: 'Lane 1', status: 'available' },
    { id: 'lane2', name: 'Lane 2', status: 'available' },
    { id: 'express', name: 'Express Lane', status: 'available' }
  ];

  const assignDriveThruLane = () => {
    const availableLanes = driveThruLanes.filter(lane => lane.status === 'available');
    if (availableLanes.length === 0) return null;

    // Simple round-robin assignment
    const assignedLane = availableLanes[0];
    assignedLane.status = 'occupied';
    return assignedLane.id;
  };

  // Calculate estimated preparation time
  const calculateEstimatedPrepTime = (items, orderType) => {
    const baseTime = orderType === 'counter' || orderType === 'drive_thru' ? 8 : 10;
    const totalTime = items.reduce((sum, item) => sum + (item.prepTime || baseTime), 0);
    return Math.max(totalTime, baseTime); // Minimum prep time
  };

  // Get order type label for display
  const getOrderTypeLabel = (order) => {
    if (order.orderType === 'dine_in') {
      return `Table ${order.tableNumber}`;
    } else if (order.orderType === 'counter') {
      return 'Counter Service';
    } else if (order.orderType === 'drive_thru') {
      return `Drive-Thru ${order.driveThruLane || 'Lane'}`;
    } else if (order.orderType === 'takeout') {
      return 'Takeout Order';
    } else if (order.platform) {
      return `${order.platform.toUpperCase()} Order`;
    }
    return 'Walk-in Order';
  };

  // Enhanced item status update with detailed tracking
  const updateItemStatus = useCallback((orderId, itemId, newStatus, additionalData = {}) => {
    try {
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => {
            if (item.id === itemId) {
              const updatedItem = {
                ...item,
                status: newStatus,
                ...additionalData
              };

              // Set timestamps based on status
              if (newStatus === 'being_prepared' && !item.startTime) {
                updatedItem.startTime = new Date();
              } else if (newStatus === 'ready' && !item.readyTime) {
                updatedItem.readyTime = new Date();
                // Send notification when item becomes ready
                const currentOrder = orders.find(o => o.id === orderId);
                if (currentOrder) {
                  notificationService.notifyItemReady(currentOrder, updatedItem);
                }
              } else if (newStatus === 'picked_up' && !item.pickedUpTime) {
                updatedItem.pickedUpTime = new Date();
              } else if (newStatus === 'served' && !item.servedTime) {
                updatedItem.servedTime = new Date();
              }

              return updatedItem;
            }
            return item;
          });

          // Update course progress
          const courseProgress = { ...order.courseProgress };
          const item = updatedItems.find(i => i.id === itemId);
          if (item && item.category) {
            const course = item.category;
            if (courseProgress[course]) {
              const courseItems = updatedItems.filter(i => i.category === course);
              const allCompleted = courseItems.every(i => i.status === 'served' || i.status === 'completed');
              const allServed = courseItems.every(i => i.status === 'served' || i.status === 'completed');

              courseProgress[course] = {
                completed: allCompleted,
                served: allServed
              };
            }
          }

          return {
            ...order,
            items: updatedItems,
            courseProgress
          };
        }
        return order;
      }));

      console.log(`Order #${orderId} item status updated to ${newStatus}`);
      return { success: true };
    } catch (err) {
      console.error('Failed to update item status: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Mark item as picked up by server
  const markItemPickedUp = useCallback((orderId, itemId, serverName) => {
    return updateItemStatus(orderId, itemId, 'picked_up', {
      pickedUpBy: serverName,
      pickedUpTime: new Date()
    });
  }, [updateItemStatus]);

  // Mark item as served to customer
  const markItemServed = useCallback((orderId, itemId, serverName) => {
    return updateItemStatus(orderId, itemId, 'served', {
      servedBy: serverName,
      servedTime: new Date()
    });
  }, [updateItemStatus]);

  // Get items by status
  const getItemsByStatus = useCallback((status) => {
    const items = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.status === status) {
          items.push({
            ...item,
            orderId: order.id,
            tableNumber: order.tableNumber,
            server: order.server,
            orderTime: order.orderTime
          });
        }
      });
    });
    return items;
  }, [orders]);

  // Get course progress for an order
  const getCourseProgress = useCallback((orderId) => {
    const order = orders.find(o => o.id === orderId);
    return order ? order.courseProgress : null;
  }, [orders]);

  // Get next course to prepare
  const getNextCourse = useCallback((orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const progress = order.courseProgress;

    // Check if appetizers are done and mains can start
    if (progress.appetizers.served && !progress.mains.completed) {
      return 'mains';
    }

    // Check if mains are done and desserts can start
    if (progress.mains.served && !progress.desserts.completed) {
      return 'desserts';
    }

    return null;
  }, [orders]);

  // Get all active orders
  const getActiveOrders = useCallback(() => {
    return orders.filter(order => order.status === 'active');
  }, [orders]);

  // Get order by ID
  const getOrderById = useCallback((id) => {
    return orders.find(order => order.id === id) || null;
  }, [orders]);

  // Get urgent orders (over 10 minutes old with pending items)
  const getUrgentOrders = useCallback(() => {
    return orders.filter(order => {
      if (order.status !== 'active') return false;

      const elapsed = Math.floor((new Date() - new Date(order.orderTime)) / (1000 * 60));
      const hasPendingItems = order.items.some(item => item.status === 'pending');
      return elapsed > 10 && hasPendingItems;
    });
  }, [orders]);

  // Get pending items count
  const getPendingItemsCount = useCallback(() => {
    return orders.reduce((sum, order) => {
      if (order.status === 'active') {
        return sum + order.items.filter(item => item.status === 'pending').length;
      }
      return sum;
    }, 0);
  }, [orders]);

  // Get ready items count
  const getReadyItemsCount = useCallback(() => {
    return orders.reduce((sum, order) => {
      if (order.status === 'active') {
        return sum + order.items.filter(item => item.status === 'ready').length;
      }
      return sum;
    }, 0);
  }, [orders]);

  // Clear completed orders (cleanup function)
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

  // Reset all orders (for testing/debugging)
  const resetOrders = useCallback(() => {
    try {
      setOrders([]);
      localStorage.removeItem('kitchenOrders');
      console.log('All kitchen orders reset');
      return { success: true };
    } catch (err) {
      console.error('Failed to reset orders: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Cancel order and mark items as cancelled
  const cancelOrder = useCallback((orderId) => {
    try {
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          // Mark all items as cancelled
          const cancelledItems = order.items.map(item => ({
            ...item,
            status: 'cancelled',
            cancelledTime: new Date()
          }));

          return {
            ...order,
            items: cancelledItems,
            status: 'cancelled',
            cancelledTime: new Date()
          };
        }
        return order;
      }));

      console.log(`Order #${orderId} cancelled successfully`);
      return { success: true };
    } catch (err) {
      console.error('Failed to cancel order: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Mark order as complete (all items served)
  const markOrderComplete = useCallback((orderId) => {
    try {
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          // Mark all items as completed
          const completedItems = order.items.map(item => ({
            ...item,
            status: 'completed',
            completedTime: new Date()
          }));

          return {
            ...order,
            items: completedItems,
            status: 'completed',
            completedTime: new Date(),
            courseProgress: {
              appetizers: { completed: true, served: true },
              mains: { completed: true, served: true },
              desserts: { completed: true, served: true },
              beverages: { completed: true, served: true }
            }
          };
        }
        return order;
      }));

      // Send notification for order completion
      const completedOrder = orders.find(o => o.id === orderId);
      if (completedOrder) {
        notificationService.notifyOrderComplete(completedOrder);
      }

      console.log(`Order #${orderId} marked as complete`);
      return { success: true };
    } catch (err) {
      console.error('Failed to complete order: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Get order statistics
  const getOrderStats = useCallback(() => {
    const activeOrders = orders.filter(o => o.status === 'active').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalItems = orders.reduce((sum, order) => sum + order.items.length, 0);
    const pendingItems = getPendingItemsCount();
    const readyItems = getReadyItemsCount();
    const urgentOrders = getUrgentOrders().length;

    return {
      activeOrders,
      completedOrders,
      totalItems,
      pendingItems,
      readyItems,
      urgentOrders
    };
  }, [orders, getPendingItemsCount, getReadyItemsCount, getUrgentOrders]);

  // Assign item to specific cook/station
  const assignItemToCook = useCallback((orderId, itemId, cookId, stationId) => {
    try {
      const cook = kitchenStaff.find(c => c.id === cookId);
      const station = preparationStations[stationId];

      if (!cook) {
        throw new Error('Cook not found');
      }

      if (!station) {
        throw new Error('Station not found');
      }

      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                status: 'assigned',
                assignedTo: cookId,
                assignedCook: cook.name,
                assignedStation: stationId,
                assignedStationName: station.name,
                assignedAt: new Date()
              };
            }
            return item;
          });

          return {
            ...order,
            items: updatedItems
          };
        }
        return order;
      }));

      console.log(`Item #${itemId} assigned to ${cook.name} at ${station.name}`);
      return { success: true };
    } catch (err) {
      console.error('Failed to assign item to cook: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [kitchenStaff, preparationStations]);

  // Start preparing an assigned item
  const startPreparingItem = useCallback((orderId, itemId) => {
    try {
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => {
            if (item.id === itemId) {
              return {
                ...item,
                status: 'being_prepared',
                preparationStartedAt: new Date()
              };
            }
            return item;
          });

          return {
            ...order,
            items: updatedItems
          };
        }
        return order;
      }));

      console.log(`Started preparing item #${itemId} in order #${orderId}`);
      return { success: true };
    } catch (err) {
      console.error('Failed to start preparing item: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Mark order as being prepared (order-level status)
  const markOrderBeingPrepared = useCallback((orderId) => {
    try {
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'being_prepared',
            preparationStartedAt: new Date()
          };
        }
        return order;
      }));

      console.log(`Order #${orderId} marked as being prepared`);
      return { success: true };
    } catch (err) {
      console.error('Failed to mark order as being prepared: ' + err.message);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Get items assigned to a specific cook
  const getItemsByCook = useCallback((cookId) => {
    const items = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.assignedTo === cookId) {
          items.push({
            ...item,
            orderId: order.id,
            tableNumber: order.tableNumber,
            orderTime: order.orderTime,
            orderPriority: order.priority
          });
        }
      });
    });
    return items;
  }, [orders]);

  // Get items by station
  const getItemsByStation = useCallback((stationId) => {
    const items = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.assignedStation === stationId) {
          items.push({
            ...item,
            orderId: order.id,
            tableNumber: order.tableNumber,
            orderTime: order.orderTime,
            orderPriority: order.priority
          });
        }
      });
    });
    return items;
  }, [orders]);

  // Get preparation statistics
  const getPreparationStats = useCallback(() => {
    const stats = {
      totalItems: 0,
      assignedItems: 0,
      beingPreparedItems: 0,
      readyItems: 0,
      cookWorkload: {},
      stationWorkload: {}
    };

    orders.forEach(order => {
      if (order.status === 'active' || order.status === 'being_prepared') {
        order.items.forEach(item => {
          stats.totalItems++;

          if (item.status === 'assigned') stats.assignedItems++;
          if (item.status === 'being_prepared') stats.beingPreparedItems++;
          if (item.status === 'ready') stats.readyItems++;

          // Track cook workload
          if (item.assignedTo) {
            if (!stats.cookWorkload[item.assignedTo]) {
              stats.cookWorkload[item.assignedTo] = 0;
            }
            stats.cookWorkload[item.assignedTo]++;
          }

          // Track station workload
          if (item.assignedStation) {
            if (!stats.stationWorkload[item.assignedStation]) {
              stats.stationWorkload[item.assignedStation] = 0;
            }
            stats.stationWorkload[item.assignedStation]++;
          }
        });
      }
    });

    return stats;
  }, [orders]);

  // Get next items to assign (prioritized queue)
  const getNextItemsToAssign = useCallback(() => {
    const unassignedItems = [];

    orders.forEach(order => {
      if (order.status === 'active' || order.status === 'being_prepared') {
        order.items.forEach(item => {
          if (item.status === 'ordered' || item.status === 'queued') {
            unassignedItems.push({
              ...item,
              orderId: order.id,
              tableNumber: order.tableNumber,
              orderTime: order.orderTime,
              orderPriority: order.priority,
              orderElapsed: Math.floor((new Date() - order.orderTime) / (1000 * 60))
            });
          }
        });
      }
    });

    // Sort by priority and elapsed time
    return unassignedItems.sort((a, b) => {
      // High priority first
      if (a.orderPriority === 'high' && b.orderPriority !== 'high') return -1;
      if (b.orderPriority === 'high' && a.orderPriority !== 'high') return 1;

      // Then by elapsed time (longer waiting first)
      return b.orderElapsed - a.orderElapsed;
    });
  }, [orders]);

  const value = {
    // State
    orders,
    loading,
    error,
    courseConfig,
    itemStatuses,
    kitchenStaff,
    preparationStations,

    // Order management
    addOrder,
    updateItemStatus,
    markOrderComplete,
    markOrderBeingPrepared,
    cancelOrder,

    // Item management
    markItemPickedUp,
    markItemServed,
    getItemsByStatus,
    assignItemToCook,
    startPreparingItem,

    // Course management
    getCourseProgress,
    getNextCourse,

    // Queries
    getActiveOrders,
    getOrderById,
    getUrgentOrders,
    getPendingItemsCount,
    getReadyItemsCount,
    getItemsByCook,
    getItemsByStation,
    getPreparationStats,
    getNextItemsToAssign,

    // Utilities
    clearCompletedOrders,
    resetOrders,
    getOrderStats,
    setError,
    clearError: () => setError(null)
  };

  return (
    <KitchenOrdersContext.Provider value={value}>
      {children}
    </KitchenOrdersContext.Provider>
  );
};
