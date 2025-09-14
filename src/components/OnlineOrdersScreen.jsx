import React, { useState, useEffect } from 'react';
import { useOnlineOrders } from '../hooks/OnlineOrdersContext';
import { useKitchenOrders } from '../hooks/KitchenOrdersContext';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const OnlineOrdersScreen = () => {
  const {
    orders,
    loading,
    platformConfig,
    orderStatuses,
    confirmOrder,
    startPreparingOrder,
    markOrderReady,
    markOrderPickedUp,
    markOrderDelivered,
    cancelOrder,
    linkToKitchenOrder,
    getPendingOrders,
    getActiveOrders,
    getUrgentOrders
  } = useOnlineOrders();

  const { addOrder } = useKitchenOrders();

  const [selectedOrder, setSelectedOrder] = useState(null);

  const pendingOrders = getPendingOrders();
  const activeOrders = getActiveOrders();
  const urgentOrders = getUrgentOrders();

  // Handle order actions
  const handleConfirmOrder = async (orderId) => {
    await confirmOrder(orderId);
  };

  const handleSendToKitchen = async (order) => {
    try {
      // Create kitchen order from online order
      const kitchenOrderData = {
        tableNumber: `Online-${order.platform.toUpperCase()}`,
        server: `Online-${order.platform}`,
        items: order.items,
        priority: order.priority,
        orderType: 'online',
        platform: order.platform,
        externalOrderId: order.externalOrderId,
        customerName: order.customerInfo?.name,
        customerPhone: order.customerInfo?.phone,
        deliveryAddress: order.deliveryAddress,
        estimatedPickupTime: order.estimatedPickupTime,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      };

      const result = await addOrder(kitchenOrderData);

      if (result.success) {
        // Link online order to kitchen order
        await linkToKitchenOrder(order.id, result.order.id);
        // Update online order status
        await startPreparingOrder(order.id);
      }
    } catch (error) {
      console.error('Failed to send order to kitchen:', error);
    }
  };

  const handleMarkReady = async (orderId) => {
    await markOrderReady(orderId);
  };

  const handleMarkPickedUp = async (orderId) => {
    await markOrderPickedUp(orderId);
  };

  const handleMarkDelivered = async (orderId) => {
    await markOrderDelivered(orderId);
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      await cancelOrder(orderId, reason);
    }
  };

  const OrderCard = ({ order }) => {
    const platform = platformConfig[order.platform];
    const status = orderStatuses[order.status];

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className={`text-lg ${platform?.icon}`}></span>
                <span className={platform?.color}>
                  {platform?.name} #{order.externalOrderId}
                </span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                {order.customerInfo?.name} • {order.customerInfo?.phone}
              </p>
              <p className="text-sm text-gray-500">
                {order.orderType === 'delivery' ? '🚚 Delivery' : '🥡 Takeout'} •
                ${order.totalAmount?.toFixed(2)}
              </p>
            </div>
            <Badge className={status?.color}>
              {status?.icon} {status?.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="mb-4 p-2 bg-yellow-50 rounded">
              <p className="text-sm font-medium">Special Instructions:</p>
              <p className="text-sm">{order.specialInstructions}</p>
            </div>
          )}

          {order.deliveryAddress && (
            <div className="mb-4 p-2 bg-blue-50 rounded">
              <p className="text-sm font-medium">Delivery Address:</p>
              <p className="text-sm">{order.deliveryAddress}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {order.status === 'received' && (
              <Button
                onClick={() => handleConfirmOrder(order.id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirm Order
              </Button>
            )}

            {order.status === 'confirmed' && (
              <Button
                onClick={() => handleSendToKitchen(order)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Send to Kitchen
              </Button>
            )}

            {order.status === 'preparing' && (
              <Button
                onClick={() => handleMarkReady(order.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark Ready
              </Button>
            )}

            {order.status === 'ready' && order.orderType === 'takeout' && (
              <Button
                onClick={() => handleMarkPickedUp(order.id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Mark Picked Up
              </Button>
            )}

            {order.status === 'ready' && order.orderType === 'delivery' && (
              <Button
                onClick={() => handleMarkDelivered(order.id)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Mark Delivered
              </Button>
            )}

            {['received', 'confirmed', 'preparing'].includes(order.status) && (
              <Button
                onClick={() => handleCancelOrder(order.id)}
                variant="destructive"
              >
                Cancel Order
              </Button>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Ordered: {new Date(order.createdAt).toLocaleTimeString()}
            {order.estimatedPickupTime && (
              <span className="ml-2">
                Pickup: {new Date(order.estimatedPickupTime).toLocaleTimeString()}
              </span>
            )}
            {order.estimatedDeliveryTime && (
              <span className="ml-2">
                Delivery: {new Date(order.estimatedDeliveryTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading online orders...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Online Orders</h1>
        <div className="flex gap-4 text-sm">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Pending: {pendingOrders.length}
          </span>
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
            Active: {activeOrders.length}
          </span>
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
            Urgent: {urgentOrders.length}
          </span>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Pending ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="urgent">
            Urgent ({urgentOrders.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Orders ({orders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending orders
              </div>
            ) : (
              pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active orders
              </div>
            ) : (
              activeOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="urgent" className="mt-6">
          <div className="space-y-4">
            {urgentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No urgent orders
              </div>
            ) : (
              urgentOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders yet
              </div>
            ) : (
              orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnlineOrdersScreen;
