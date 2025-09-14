import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  CheckCircle,
  X,
  Clock,
  AlertTriangle,
  ChefHat,
  Utensils,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import notificationService from '../../services/notificationService';

const ServerNotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    setNotifications(notificationService.getNotifications());
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  // Listen for new notifications
  useEffect(() => {
    const handleNotification = (event) => {
      const newNotification = event.detail;
      setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
      setUnreadCount(notificationService.getUnreadCount());
    };

    window.addEventListener('server-notification', handleNotification);

    return () => {
      window.removeEventListener('server-notification', handleNotification);
    };
  }, []);

  // Mark notification as read
  const markAsRead = (notificationId) => {
    notificationService.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(notificationService.getUnreadCount());
  };

  // Clear all notifications
  const clearAll = () => {
    notificationService.clearNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    notificationService.handleNotificationClick(notification);
  };

  // Toggle sound
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    notificationService.setSoundEnabled(newState);
  };

  // Toggle browser notifications
  const toggleBrowserNotifications = () => {
    const newState = !browserNotificationsEnabled;
    setBrowserNotificationsEnabled(newState);
    notificationService.setBrowserNotificationsEnabled(newState);
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ITEM_READY':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'NEW_ORDER':
        return <ChefHat className="w-5 h-5 text-blue-600" />;
      case 'URGENT_ORDER':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'ORDER_COMPLETE':
        return <Utensils className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get notification color
  const getNotificationColor = (type, urgent) => {
    if (urgent) return 'border-red-300 bg-red-50';
    switch (type) {
      case 'ITEM_READY':
        return 'border-green-300 bg-green-50';
      case 'NEW_ORDER':
        return 'border-blue-300 bg-blue-50';
      case 'URGENT_ORDER':
        return 'border-red-300 bg-red-50';
      case 'ORDER_COMPLETE':
        return 'border-purple-300 bg-purple-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000 / 60); // minutes

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return time.toLocaleDateString();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            {unreadCount > 0 ? (
              <BellRing className="w-5 h-5 mr-2 text-red-600" />
            ) : (
              <Bell className="w-5 h-5 mr-2 text-gray-600" />
            )}
            Server Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-green-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm">Sound Notifications</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSound}
              >
                {soundEnabled ? 'On' : 'Off'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Browser Notifications</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleBrowserNotifications}
              >
                {browserNotificationsEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">
              You'll receive alerts for new orders and ready items
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  getNotificationColor(notification.type, notification.urgent)
                } ${!notification.read ? 'ring-2 ring-blue-300' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {getNotificationIcon(notification.type)}
                    <span className="font-medium text-sm">
                      Table {notification.data.tableNumber}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">
                      {formatTime(notification.data.timestamp)}
                    </span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>

                <h4 className="font-semibold text-sm mb-1">
                  {notification.title}
                </h4>

                <p className="text-sm text-gray-600 mb-2">
                  {notification.body}
                </p>

                {notification.type === 'ITEM_READY' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-700 font-medium">
                      Ready for pickup
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                    >
                      Mark Picked Up
                    </Button>
                  </div>
                )}

                {notification.type === 'NEW_ORDER' && (
                  <div className="text-xs text-blue-700">
                    {notification.data.itemCount} items ordered
                  </div>
                )}

                {notification.type === 'URGENT_ORDER' && (
                  <div className="text-xs text-red-700 font-medium">
                    ⚠️ Requires immediate attention
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer with quick actions */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{notifications.length} total notifications</span>
            <span>{unreadCount} unread</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServerNotificationCenter;
