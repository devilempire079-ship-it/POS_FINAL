import React, { useState, useEffect, useRef } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  Timer,
  User,
  Bell,
  Play,
  Filter,
  Search,
  Users,
  Utensils,
  Coffee,
  Pizza,
  Salad,
  Beef,
  Fish,
  Wifi,
  WifiOff,
  UserCheck,
  CookingPot,
  Settings,
  Plus,
  Minus
} from 'lucide-react';
import { useBusinessType } from '../../hooks/useBusinessType';
import { useKitchenOrders } from '../../hooks/KitchenOrdersContext';
import useWebSocket from '../../hooks/useWebSocket';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const KitchenDisplay = () => {
  const { businessType } = useBusinessType();
  const isRestaurant = businessType?.code === 'restaurant';

  // Use enhanced kitchen orders context
  const {
    orders,
    updateItemStatus,
    markOrderComplete,
    markOrderBeingPrepared,
    assignItemToCook,
    startPreparingItem,
    getUrgentOrders,
    getPendingItemsCount,
    getReadyItemsCount,
    getItemsByCook,
    getItemsByStation,
    getPreparationStats,
    getNextItemsToAssign,
    addOrder,
    kitchenStaff,
    preparationStations,
    itemStatuses
  } = useKitchenOrders();

  // WebSocket integration
  const { isConnected, connectionStatus, sendMessage } = useWebSocket();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const audioRef = useRef(null);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket message listener for real-time order updates
  useEffect(() => {
    const handleWebSocketMessage = (event) => {
      const message = event.detail;

      if (message.type === 'KITCHEN_ORDER') {
        console.log('🍽️ New kitchen order received:', message.data);

        // Add the order to the kitchen display
        const orderData = {
          id: message.data.orderId,
          tableNumber: message.data.tableNumber,
          server: message.data.server || 'Server',
          terminalId: message.data.terminalId,
          items: message.data.items || [],
          priority: message.data.priority || 'normal',
          orderTime: new Date(message.data.timestamp),
          status: 'active'
        };

        addOrder(orderData);

        // Play notification sound for new orders
        playSound('new_order');

        // Show notification
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'new_order',
          message: `New order from Table ${message.data.tableNumber}`,
          timestamp: new Date()
        }]);
      }
    };

    // Add event listener for WebSocket messages
    window.addEventListener('websocket-message', handleWebSocketMessage);

    return () => {
      window.removeEventListener('websocket-message', handleWebSocketMessage);
    };
  }, [addOrder]);

  // Simple sound notification system
  const playSound = (type) => {
    if (!soundEnabled) return;
    // Simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(type === 'urgent' ? 800 : 600, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  };



  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'preparing': 'bg-blue-100 text-blue-800 border-blue-300',
      'ready': 'bg-green-100 text-green-800 border-green-300',
      'completed': 'bg-gray-100 text-gray-800 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'normal': 'bg-blue-100 text-blue-800',
      'low': 'bg-gray-100 text-gray-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTimeElapsed = (orderTime) => {
    const now = new Date();
    const elapsed = Math.floor((now - orderTime) / (1000 * 60)); // minutes
    return elapsed;
  };



  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return getUrgentOrders().some(u => u.id === order.id);
    if (filter === 'pending') return order.items.some(item => item.status === 'pending');
    if (filter === 'ready') return order.items.some(item => item.status === 'ready');

    // Handle lane-specific filters
    if (filter.startsWith('lane_')) {
      const laneNumber = filter.replace('lane_', '');
      return order.orderType === 'drive_thru' && order.driveThruLane === laneNumber;
    }

    return true;
  });

  const urgentOrders = getUrgentOrders();

  // Get preparation statistics
  const prepStats = getPreparationStats();
  const nextItemsToAssign = getNextItemsToAssign();

  // Handle item assignment
  const handleAssignItem = (orderId, itemId) => {
    setSelectedItem({ orderId, itemId });
  };

  const handleCookAssignment = (cookId, stationId) => {
    if (selectedItem) {
      assignItemToCook(selectedItem.orderId, selectedItem.itemId, cookId, stationId);
      setSelectedItem(null);
    }
  };

  const handleStartPreparing = (orderId, itemId) => {
    startPreparingItem(orderId, itemId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center text-2xl">
                <ChefHat className="w-8 h-8 mr-3 text-orange-600" />
                Enhanced Kitchen Display System
              </CardTitle>
              <p className="text-gray-600 mt-2">Advanced preparation tracking with staff assignment</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Current Time</div>
                <div className="text-lg font-semibold">{currentTime.toLocaleTimeString()}</div>
              </div>

              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-600" />
                )}
                <div className="text-sm">
                  <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {connectionStatus}
                  </div>
                </div>
              </div>

              {urgentOrders.length > 0 && (
                <Badge variant="destructive" className="px-3 py-1">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {urgentOrders.length} Urgent
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          <TabsTrigger value="assignment">Assignment ({nextItemsToAssign.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff View</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setFilter('all')}
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                >
                  All Orders ({orders.length})
                </Button>
                <Button
                  onClick={() => setFilter('urgent')}
                  variant={filter === 'urgent' ? 'destructive' : 'outline'}
                  size="sm"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Urgent ({urgentOrders.length})
                </Button>
                <Button
                  onClick={() => setFilter('pending')}
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  className={filter === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                >
                  Pending Items
                </Button>
                <Button
                  onClick={() => setFilter('ready')}
                  variant={filter === 'ready' ? 'default' : 'outline'}
                  size="sm"
                  className={filter === 'ready' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Ready to Serve
                </Button>

                {/* LANE FILTERS FOR DRIVE-THRU ORDERS */}
                {orders.some(order => order.orderType === 'drive_thru' && order.driveThruLane) && (
                  <>
                    <div className="w-px h-6 bg-gray-300 mx-2"></div>
                    <span className="text-sm font-medium text-gray-700 mr-2">Lanes:</span>
                    {[...new Set(orders.filter(order => order.orderType === 'drive_thru' && order.driveThruLane).map(order => order.driveThruLane))].map(lane => (
                      <Button
                        key={lane}
                        onClick={() => setFilter(`lane_${lane}`)}
                        variant={filter === `lane_${lane}` ? 'default' : 'outline'}
                        size="sm"
                        className={filter === `lane_${lane}` ? 'bg-orange-600 hover:bg-orange-700' : ''}
                      >
                        🅿️ Lane {lane}
                      </Button>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map(order => {
              const elapsed = getTimeElapsed(order.orderTime);
              const isUrgent = elapsed > 10 && order.items.some(item => item.status === 'pending');

              return (
                <Card
                  key={order.id}
                  className={`transition-all duration-300 hover:shadow-xl ${
                    isUrgent ? 'border-red-500 bg-red-50 shadow-red-200' :
                    order.status === 'being_prepared' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {/* Order Header */}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                        {/* Order Type Display */}
                        {order.orderType === 'dine_in' && `Table #${order.tableNumber}`}
                        {order.orderType === 'counter' && 'Counter Service'}
                        {order.orderType === 'drive_thru' && `Drive-Thru Order`}
                        {order.orderType === 'takeout' && 'Takeout Order'}
                        {order.platform && ` (${order.platform.toUpperCase()})`}

                        {/* Order Type Badge */}
                        <Badge
                          variant={
                            order.orderType === 'drive_thru' ? 'destructive' :
                            order.orderType === 'counter' ? 'default' :
                            order.orderType === 'takeout' ? 'secondary' : 'outline'
                          }
                          className="text-xs ml-2"
                        >
                          {order.orderType === 'dine_in' && '🍽️ DINE-IN'}
                          {order.orderType === 'counter' && '🏪 COUNTER'}
                          {order.orderType === 'drive_thru' && '🚗 DRIVE-THRU'}
                          {order.orderType === 'takeout' && '🥡 TAKEOUT'}
                        </Badge>

                        {/* PROMINENT LANE NUMBER BADGE */}
                        {order.orderType === 'drive_thru' && order.driveThruLane && (
                          <Badge className="bg-orange-600 text-white px-3 py-1 text-sm font-bold ml-2 animate-pulse">
                            🅿️ LANE {order.driveThruLane}
                          </Badge>
                        )}

                          {/* Quick Service Indicator */}
                          {order.isQuickService && (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                              ⚡ QSR
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <User className="w-4 h-4 mr-1" />
                          {order.server}
                        </div>

                        {/* Order Details */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {order.estimatedPrepTime && (
                            <span>⏱️ Est. {order.estimatedPrepTime}min</span>
                          )}
                          {order.driveThruLane && (
                            <span>🅿️ Lane {order.driveThruLane}</span>
                          )}
                          {order.customerName && (
                            <span>👤 {order.customerName}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={order.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {order.priority.toUpperCase()}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {elapsed} min ago
                        </div>
                      </div>
                    </div>
                    {isUrgent && (
                      <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-md">
                        <div className="flex items-center text-red-800 text-sm font-medium">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          URGENT - Over 10 minutes
                        </div>
                      </div>
                    )}
                    {order.status === 'being_prepared' && (
                      <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded-md">
                        <div className="flex items-center text-blue-800 text-sm font-medium">
                          <CookingPot className="w-4 h-4 mr-2" />
                          Being Prepared
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  {/* Order Items */}
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {order.items.map(item => {
                        const statusInfo = itemStatuses[item.status];
                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${statusInfo?.color || 'border-gray-300 bg-gray-50'}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {item.quantity}x {item.name}
                                </h4>
                                {item.notes && (
                                  <p className="text-sm text-gray-600 mt-1 italic">{item.notes}</p>
                                )}
                                {item.assignedCook && (
                                  <div className="flex items-center text-sm text-purple-600 mt-1">
                                    <User className="w-4 h-4 mr-1" />
                                    {item.assignedCook} • {item.assignedStationName}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${statusInfo?.color || ''}`}
                                >
                                  {statusInfo?.icon} {statusInfo?.label}
                                </Badge>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Timer className="w-4 h-4 mr-1" />
                                  {item.prepTime}min
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2 mt-3">
                              {item.status === 'ordered' && (
                                <>
                                  <Button
                                    onClick={() => handleAssignItem(order.id, item.id)}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                                    size="sm"
                                  >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Assign Cook
                                  </Button>
                                  <Button
                                    onClick={() => updateItemStatus(order.id, item.id, 'preparing')}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
                                  </Button>
                                </>
                              )}
                              {item.status === 'assigned' && (
                                <Button
                                  onClick={() => handleStartPreparing(order.id, item.id)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  size="sm"
                                >
                                  <CookingPot className="w-4 h-4 mr-2" />
                                  Start Cooking
                                </Button>
                              )}
                              {item.status === 'being_prepared' && (
                                <Button
                                  onClick={() => updateItemStatus(order.id, item.id, 'ready')}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  size="sm"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark Ready
                                </Button>
                              )}
                              {item.status === 'ready' && (
                                <Button
                                  onClick={() => updateItemStatus(order.id, item.id, 'completed')}
                                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                                  size="sm"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Served
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Actions */}
                    <div className="flex space-x-3 mt-6 pt-4 border-t">
                      {order.status === 'active' && (
                        <Button
                          onClick={() => markOrderBeingPrepared(order.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <CookingPot className="w-4 h-4 mr-2" />
                          Start Order
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => markOrderComplete(order.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Complete Order
                      </Button>
                    </div>

                    {/* LANE PICKUP BANNER FOR DRIVE-THRU ORDERS */}
                    {order.orderType === 'drive_thru' && order.driveThruLane && (
                      <div className="mt-4 bg-orange-500 text-white p-3 rounded-lg font-bold text-center animate-pulse">
                        🚗 PREPARE FOR LANE {order.driveThruLane} PICKUP 🚗
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Assignment Tab */}
        <TabsContent value="assignment" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-6 h-6 mr-3 text-purple-600" />
                Item Assignment Queue
              </CardTitle>
              <p className="text-gray-600">Assign items to cooks and stations</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nextItemsToAssign.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No items waiting for assignment
                  </div>
                ) : (
                  nextItemsToAssign.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-bold text-gray-600">#{index + 1}</div>
                        <div>
                          <h4 className="font-semibold">{item.quantity}x {item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Table {item.tableNumber} • {item.orderElapsed} min ago
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {kitchenStaff.map(cook => (
                          <Button
                            key={cook.id}
                            onClick={() => assignItemToCook(item.orderId, item.id, cook.id, cook.station.toLowerCase().replace(' ', ''))}
                            variant="outline"
                            size="sm"
                            className={cook.color}
                          >
                            {cook.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff View Tab */}
        <TabsContent value="staff" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kitchenStaff.map(cook => {
              const cookItems = getItemsByCook(cook.id);
              const activeItems = cookItems.filter(item => ['assigned', 'being_prepared'].includes(item.status));

              return (
                <Card key={cook.id} className={cook.color}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <User className="w-5 h-5 mr-2" />
                      {cook.name}
                    </CardTitle>
                    <p className="text-sm opacity-80">{cook.station}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{activeItems.length}</div>
                        <div className="text-sm opacity-80">Active Items</div>
                      </div>

                      {activeItems.length > 0 && (
                        <div className="space-y-2">
                          {activeItems.slice(0, 3).map(item => (
                            <div key={item.id} className="text-sm bg-white bg-opacity-50 p-2 rounded">
                              <div className="font-medium">{item.quantity}x {item.name}</div>
                              <div className="text-xs opacity-70">
                                Table {item.tableNumber} • {itemStatuses[item.status]?.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Stations Tab */}
        <TabsContent value="stations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(preparationStations).map(([stationId, station]) => {
              const stationItems = getItemsByStation(stationId);
              const activeItems = stationItems.filter(item => ['assigned', 'being_prepared'].includes(item.status));

              return (
                <Card key={stationId} className={station.color}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <span className="text-xl mr-2">{station.icon}</span>
                      {station.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{activeItems.length}</div>
                        <div className="text-sm opacity-80">Active Items</div>
                      </div>

                      {activeItems.length > 0 && (
                        <div className="space-y-2">
                          {activeItems.slice(0, 4).map(item => (
                            <div key={item.id} className="text-sm bg-white bg-opacity-50 p-2 rounded">
                              <div className="font-medium">{item.quantity}x {item.name}</div>
                              <div className="text-xs opacity-70">
                                {item.assignedCook} • {itemStatuses[item.status]?.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{orders.length}</div>
              <div className="text-xs text-gray-600 font-medium">Active Orders</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{prepStats.assignedItems}</div>
              <div className="text-xs text-gray-600 font-medium">Assigned</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">{prepStats.beingPreparedItems}</div>
              <div className="text-xs text-gray-600 font-medium">Being Prepared</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{prepStats.readyItems}</div>
              <div className="text-xs text-gray-600 font-medium">Ready</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{nextItemsToAssign.length}</div>
              <div className="text-xs text-gray-600 font-medium">To Assign</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{urgentOrders.length}</div>
              <div className="text-xs text-gray-600 font-medium">Urgent</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cook Assignment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Assign Cook & Station</CardTitle>
              <p className="text-sm text-gray-600">Choose a cook and station for this item</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kitchenStaff.map(cook => (
                  <div key={cook.id} className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleCookAssignment(cook.id, 'grill')}
                      className={`${cook.color} border`}
                      variant="outline"
                    >
                      {cook.name} - Grill
                    </Button>
                    <Button
                      onClick={() => handleCookAssignment(cook.id, 'salad')}
                      className={`${cook.color} border`}
                      variant="outline"
                    >
                      {cook.name} - Salad
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button
                  onClick={() => setSelectedItem(null)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Order #{selectedOrder.id}
                    {selectedOrder.orderType === 'dine_in' && ` - Table #${selectedOrder.tableNumber}`}
                    {selectedOrder.orderType === 'counter' && ' - Counter Service'}
                    {selectedOrder.orderType === 'drive_thru' && ' - Drive-Thru Order'}
                    {selectedOrder.orderType === 'takeout' && ' - Takeout Order'}

                    {/* PROMINENT LANE BADGE IN MODAL */}
                    {selectedOrder.orderType === 'drive_thru' && selectedOrder.driveThruLane && (
                      <Badge className="bg-orange-600 text-white px-4 py-2 text-lg font-bold animate-pulse">
                        🚗 LANE {selectedOrder.driveThruLane}
                      </Badge>
                    )}

                    {selectedOrder.platform && (
                      <Badge variant="outline" className="ml-2">
                        {selectedOrder.platform.toUpperCase()}
                      </Badge>
                    )}
                  </CardTitle>

                  {/* LANE PICKUP REMINDER IN MODAL */}
                  {selectedOrder.orderType === 'drive_thru' && selectedOrder.driveThruLane && (
                    <div className="mt-3 bg-orange-100 border border-orange-300 rounded-lg p-3">
                      <div className="flex items-center text-orange-800 font-bold text-center">
                        🚗 PREPARE FOR LANE {selectedOrder.driveThruLane} PICKUP 🚗
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setSelectedOrder(null)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Server</label>
                  <p className="text-gray-900 font-medium">{selectedOrder.server}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Time</label>
                  <p className="text-gray-900 font-medium">{selectedOrder.orderTime.toLocaleTimeString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Elapsed Time</label>
                  <p className="text-gray-900 font-medium">{getTimeElapsed(selectedOrder.orderTime)} minutes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <Badge variant={selectedOrder.status === 'being_prepared' ? 'default' : 'secondary'}>
                    {selectedOrder.status === 'being_prepared' ? 'Being Prepared' : selectedOrder.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg">Order Items</h4>
                {selectedOrder.items.map(item => {
                  const statusInfo = itemStatuses[item.status];
                  return (
                    <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{item.quantity}x {item.name}</h5>
                        {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
                        {item.assignedCook && (
                          <p className="text-sm text-purple-600 mt-1">
                            👨‍🍳 {item.assignedCook} • {item.assignedStationName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600 text-right">
                          <div>{item.prepTime}min prep</div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusInfo?.color || ''}`}
                        >
                          {statusInfo?.icon} {statusInfo?.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                <Button
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    markOrderComplete(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Mark All Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplay;
