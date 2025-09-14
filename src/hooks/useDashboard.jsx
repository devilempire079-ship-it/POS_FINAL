import { useState } from 'react';

export const useDashboardData = () => {
  const { businessType } = { businessType: 'restaurant' }; // Simplified for now

  // Static data to avoid API calls
  const metrics = {
    sales: {
      today: { value: '$12,450', change: '+12%', changeValue: 1245, trend: 'up' },
      thisWeek: { value: '$89,230', change: '+8%', changeValue: 6780, trend: 'up' },
      monthly: { value: '$345,650', change: '+15%', changeValue: 45320, trend: 'up' },
      target: { current: '$45,980', target: '$50,000', percentage: 92 }
    },
    transactions: {
      today: 145,
      thisWeek: 1024,
      monthly: 4250,
      averageTicket: 86.21,
      peakHour: { hour: '7 PM', transactions: 45 }
    },
    customers: {
      todayUnique: 89,
      repeatCustomerRate: 78.5,
      newCustomers: 23,
      loyaltyTierUpgrades: 5,
      surveysCompleted: 34
    },
    inventory: {
      lowStockItems: 24,
      outOfStock: 3,
      restockNeeded: 12,
      expiringSoon: 8
    },
    operations: {
      activeStaff: 12,
      totalStaff: 15,
      averageServiceTime: '4.2 min',
      customerSatisfaction: 4.7,
      pendingOrders: { online: 7, delivery: 3, kitchen: 8 }
    }
  };

  const alerts = [
    {
      id: 'low-stock-alert',
      type: 'warning',
      priority: 'high',
      title: 'Low Stock Alert',
      message: '23 items are below reorder point',
      timestamp: new Date(Date.now() - 300000),
      actionable: true,
      action: '/inventory/reorders',
      dismissed: false
    },
    {
      id: 'staff-schedule',
      type: 'info',
      priority: 'medium',
      title: 'Shift Change',
      message: 'Maria ends shift in 30 minutes',
      timestamp: new Date(Date.now() - 1800000),
      actionable: false,
      dismissed: false
    }
  ];

  const activities = [
    {
      id: 1,
      type: 'sale',
      user: 'John Doe',
      action: 'Large order completed',
      amount: '$210.25',
      time: '2 minutes ago',
      icon: '💰'
    },
    {
      id: 2,
      type: 'inventory',
      user: 'System',
      action: 'Restock alert triggered',
      amount: 'Hot Sauce - 6 bottles',
      time: '5 minutes ago',
      icon: '📦'
    }
  ];

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    sales: Math.floor(Math.random() * 3000) + 500,
    transactions: Math.floor(Math.random() * 20) + 5
  }));

  const businessWidgets = [
    {
      title: 'Table Management',
      type: 'restaurant-tables',
      data: { occupied: 8, total: 12, percentage: 67 },
      priority: 'high'
    },
    {
      title: 'Kitchen Status',
      type: 'restaurant-kitchen',
      data: { pending: 8, preparing: 12, ready: 3, averagePrepTime: '18 min' },
      priority: 'high'
    }
  ];

  return {
    loading: false,
    error: null,
    lastUpdate: new Date(),
    retryCount: 0,
    metrics,
    alerts,
    activities,
    hourlyData,
    businessWidgets,
    refreshData: () => console.log('Refresh called'),
    dismissAlert: (alertId) => console.log('Dismiss alert:', alertId),
    formatCurrency: (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount),
    formatNumber: (num) => new Intl.NumberFormat().format(num)
  };
};

export default useDashboardData;
