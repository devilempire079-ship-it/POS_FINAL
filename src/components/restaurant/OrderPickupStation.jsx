import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Table,
  ChefHat,
  Timer,
  Volume2,
  VolumeX,
  RefreshCw,
  Truck,
  Utensils
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useKitchenOrders } from '../../hooks/KitchenOrdersContext';

const OrderPickupStation = () => {
  const { orders, updateItemStatus } = useKitchenOrders();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastNotificationTime, setLastNotificationTime] = useState(null);
  const audioRef = useRef(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get ready orders (items that are ready for pickup)
  const getReadyOrders = () => {
    const readyOrders = [];
    orders.forEach(order => {
      const readyItems = order.items.filter(item => item.status === 'ready');
      if (readyItems.length > 0) {
        readyOrders.push({
          ...order,
          readyItems,
          readyCount: readyItems.length,
          totalItems: order.items.length,
          readyTime: Math.min(...readyItems.map(item => item.startTime ? new Date(item.startTime).getTime() : Date.now())),
          pickupTime: null
        });
      }
    });
    return readyOrders.sort((a, b) => a.readyTime - b.readyTime); // Oldest first
  };

  // Get orders that have been ready for more than 5 minutes
  const getOverdueOrders = () => {
    const now = new Date();
    return getReadyOrders().filter(order => {
      const readyDuration = (now - new Date(order.readyTime)) / (1000 * 60); // minutes
      return readyDuration > 5;
    });
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);

      setLastNotificationTime(new Date());
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Mark order as picked up
  const markOrderPickedUp = (orderId, itemId) => {
    updateItemStatus(orderId, itemId, 'completed');
  };

  // Mark all items in order as picked up
  const markAllItemsPickedUp = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.items.forEach(item => {
        if (item.status === 'ready') {
          updateItemStatus(orderId, item.id, 'completed');
        }
      });
    }
  };

  // Calculate time since order became ready
  const getTimeSinceReady = (readyTime) => {
    const now = new Date();
    const diff = now - new Date(readyTime);
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const readyOrders = getReadyOrders();
  const overdueOrders = getOverdueOrders();

  // Auto-play sound when new orders become ready
  useEffect(() => {
    if (readyOrders.length > 0 && (!lastNotificationTime || (new Date() - lastNotificationTime) > 30000)) {
      playNotificationSound();
    }
  }, [readyOrders.length, lastNotificationTime]);

  const ReadyOrderCard = ({ order }) => {
    const timeSinceReady = getTimeSinceReady(order.readyTime);
    const isOverdue = (new Date() - new Date(order.readyTime)) / (1000 * 60) > 5;

    return (
      <Card className={`transition-all duration-300 hover:shadow-xl ${
        isOverdue ? 'border-red-500 bg-red-50 shadow-red-200' : 'border-green-500 bg-green-50 shadow-green-200'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Table className="w-5 h-5 mr-2 text-blue-600" />
                Table {order.tableNumber}
              </CardTitle>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <User className="w-4 h-4 mr-1" />
                {order.server}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={`${
                isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              } border`}>
                <Clock className="w-3 h-3 mr-1" />
                Ready {timeSinceReady}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  OVERDUE
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {order.readyCount} of {order.totalItems} items ready
              </span>
              <span className="font-medium text-green-600">
                {Math.round((order.readyCount / order.totalItems) * 100)}% complete
              </span>
            </div>

            {/* Ready Items */}
            <div className="space-y-2">
              {order.readyItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900">
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-600 mt-1 italic">{item.notes}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => markOrderPickedUp(order.id, item.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    Pick Up
                  </Button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2 border-t">
              <Button
                onClick={() => markAllItemsPickedUp(order.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Utensils className="w-4 h-4 mr-2" />
                Pick Up All Items
              </Button>
              <Button
                onClick={() => {/* Handle call kitchen */}}
                variant="outline"
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <ChefHat className="w-4 h-4 mr-1" />
                Call Kitchen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const StatsCard = () => {
    const totalReadyItems = readyOrders.reduce((sum, order) => sum + order.readyCount, 0);
    const avgWaitTime = readyOrders.length > 0
      ? readyOrders.reduce((sum, order) => sum + (new Date() - new Date(order.readyTime)) / (1000 * 60), 0) / readyOrders.length
      : 0;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{readyOrders.length}</div>
            <div className="text-sm text-gray-600">Orders Ready</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalReadyItems}</div>
            <div className="text-sm text-gray-600">Items Ready</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{overdueOrders.length}</div>
            <div className="text-sm text-gray-600">Overdue Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{avgWaitTime.toFixed(1)}m</div>
            <div className="text-sm text-gray-600">Avg Wait Time</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Bell className="w-8 h-8 mr-3 text-green-600" />
            Order Pickup Station
          </h1>
          <p className="text-gray-600 mt-2">Ready orders waiting for server pickup</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Time</div>
            <div className="text-lg font-semibold">{currentTime.toLocaleTimeString()}</div>
          </div>
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="sm"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 mr-2" />
            ) : (
              <VolumeX className="w-4 h-4 mr-2" />
            )}
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCard />

      {/* Urgent Orders Alert */}
      {overdueOrders.length > 0 && (
        <Card className="mb-6 border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">Urgent: Orders Waiting Too Long</h3>
                <p className="text-red-600 text-sm">
                  {overdueOrders.length} order{overdueOrders.length > 1 ? 's' : ''} ha{overdueOrders.length > 1 ? 've' : 's'} been ready for more than 5 minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ready Orders */}
      {readyOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders ready for pickup</h3>
            <p className="text-gray-500">Ready orders will appear here automatically</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {readyOrders.map(order => (
            <ReadyOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Notification Settings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Sound Notifications</div>
                <div className="text-sm text-gray-600">Play sound when orders are ready</div>
              </div>
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant={soundEnabled ? 'default' : 'outline'}
                size="sm"
              >
                {soundEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Auto Refresh</div>
                <div className="text-sm text-gray-600">Automatically refresh order status</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Always On</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">Overdue Alerts</div>
                  <div className="text-sm text-gray-600">Highlight orders waiting {'>'}5 minutes</div>
              </div>
              <Badge className="bg-red-100 text-red-800">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => {/* Handle refresh */}}
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
            >
              <RefreshCw className="w-6 h-6 mb-2" />
              <span className="text-sm">Refresh Orders</span>
            </Button>

            <Button
              onClick={() => {/* Handle print pickup list */}}
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
            >
              <Timer className="w-6 h-6 mb-2" />
              <span className="text-sm">Print List</span>
            </Button>

            <Button
              onClick={() => {/* Handle call kitchen */}}
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
            >
              <ChefHat className="w-6 h-6 mb-2" />
              <span className="text-sm">Call Kitchen</span>
            </Button>

            <Button
              onClick={() => {/* Handle view history */}}
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
            >
              <Clock className="w-6 h-6 mb-2" />
              <span className="text-sm">View History</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderPickupStation;
