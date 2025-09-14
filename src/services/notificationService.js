// Server notification service for restaurant POS system
// Handles browser notifications, sound alerts, and server communication

class NotificationService {
  constructor() {
    this.notifications = [];
    this.soundEnabled = true;
    this.browserNotificationsEnabled = true;
    this.audioContext = null;
  }

  // Initialize notification service
  async init() {
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Initialize audio context for sound notifications
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.log('Audio not supported');
    }

    console.log('🔔 Notification service initialized');
  }

  // Send notification when item becomes ready
  async notifyItemReady(orderData, itemData) {
    const notification = {
      id: `item-ready-${itemData.id}-${Date.now()}`,
      type: 'ITEM_READY',
      title: `${itemData.name} Ready for Table ${orderData.tableNumber}`,
      body: `Pick up from ${itemData.pickupLocation}`,
      icon: '/favicon.ico',
      data: {
        orderId: orderData.id,
        itemId: itemData.id,
        tableNumber: orderData.tableNumber,
        timestamp: new Date()
      },
      urgent: false,
      sound: 'ready'
    };

    await this.sendNotification(notification);
  }

  // Send notification for new orders
  async notifyNewOrder(orderData) {
    const notification = {
      id: `new-order-${orderData.id}-${Date.now()}`,
      type: 'NEW_ORDER',
      title: `New Order for Table ${orderData.tableNumber}`,
      body: `${orderData.items.length} items ordered`,
      icon: '/favicon.ico',
      data: {
        orderId: orderData.id,
        tableNumber: orderData.tableNumber,
        itemCount: orderData.items.length,
        timestamp: new Date()
      },
      urgent: true,
      sound: 'new_order'
    };

    await this.sendNotification(notification);
  }

  // Send notification for urgent orders
  async notifyUrgentOrder(orderData) {
    const notification = {
      id: `urgent-order-${orderData.id}-${Date.now()}`,
      type: 'URGENT_ORDER',
      title: `URGENT: Table ${orderData.tableNumber} Over 10 Minutes`,
      body: `${orderData.items.filter(i => i.status === 'pending').length} items still pending`,
      icon: '/favicon.ico',
      data: {
        orderId: orderData.id,
        tableNumber: orderData.tableNumber,
        timestamp: new Date()
      },
      urgent: true,
      sound: 'urgent'
    };

    await this.sendNotification(notification);
  }

  // Send notification for order completion
  async notifyOrderComplete(orderData) {
    const notification = {
      id: `order-complete-${orderData.id}-${Date.now()}`,
      type: 'ORDER_COMPLETE',
      title: `Order Complete: Table ${orderData.tableNumber}`,
      body: `All items served`,
      icon: '/favicon.ico',
      data: {
        orderId: orderData.id,
        tableNumber: orderData.tableNumber,
        timestamp: new Date()
      },
      urgent: false,
      sound: 'complete'
    };

    await this.sendNotification(notification);
  }

  // Core notification sending method
  async sendNotification(notification) {
    // Add to internal notifications array
    this.notifications.unshift(notification);

    // Limit to last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    // Send browser notification
    if (this.browserNotificationsEnabled && 'Notification' in window) {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          tag: notification.id,
          requireInteraction: notification.urgent,
          silent: !this.soundEnabled
        });

        // Auto-close non-urgent notifications after 5 seconds
        if (!notification.urgent) {
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        }

        // Handle click
        browserNotification.onclick = () => {
          // Focus window and navigate to relevant section
          window.focus();
          this.handleNotificationClick(notification);
          browserNotification.close();
        };

      } catch (error) {
        console.log('Browser notification failed:', error);
      }
    }

    // Play sound
    if (this.soundEnabled) {
      this.playSound(notification.sound);
    }

    // Dispatch custom event for React components
    window.dispatchEvent(new CustomEvent('server-notification', {
      detail: notification
    }));

    console.log('🔔 Server notification sent:', notification.title);
  }

  // Handle notification click
  handleNotificationClick(notification) {
    // Navigate to relevant section based on notification type
    switch (notification.type) {
      case 'ITEM_READY':
        // Could navigate to pickup section or highlight ready items
        console.log('Navigate to pickup section for table', notification.data.tableNumber);
        break;
      case 'NEW_ORDER':
        // Could navigate to order details
        console.log('Navigate to order details for table', notification.data.tableNumber);
        break;
      case 'URGENT_ORDER':
        // Could navigate to urgent orders section
        console.log('Navigate to urgent orders for table', notification.data.tableNumber);
        break;
      default:
        console.log('Notification clicked:', notification);
    }
  }

  // Play notification sound
  async playSound(type) {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Different frequencies for different notification types
      const frequencies = {
        'ready': 800,
        'new_order': 600,
        'urgent': 1000,
        'complete': 400
      };

      oscillator.frequency.setValueAtTime(frequencies[type] || 600, this.audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);

    } catch (error) {
      console.log('Sound playback failed:', error);
    }
  }

  // Get all notifications
  getNotifications() {
    return this.notifications;
  }

  // Clear notifications
  clearNotifications() {
    this.notifications = [];
  }

  // Mark notification as read
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Settings
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
  }

  setBrowserNotificationsEnabled(enabled) {
    this.browserNotificationsEnabled = enabled;
  }

  // Get unread count
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Initialize on module load
if (typeof window !== 'undefined') {
  notificationService.init();
}

export default notificationService;
