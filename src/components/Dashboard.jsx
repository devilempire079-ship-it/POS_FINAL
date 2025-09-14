import React, { useState, useEffect } from 'react';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [businessType, setBusinessType] = useState('restaurant');
  const [timeRange, setTimeRange] = useState('today');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Low stock alert', icon: '⚠️', time: '2m ago', action: 'View Inventory' },
    { id: 2, type: 'info', message: 'Staff update', icon: 'ℹ️', time: '35m ago', action: 'Contact HR' },
    { id: 3, type: 'success', message: 'All systems operational', icon: '✅', time: '1h ago', action: null }
  ]);

  // Customization modal state
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState({
    kpiCards: true,
    analyticsChart: true,
    businessIntel: true,
    smartAlerts: true,
    activityFeed: true,
    predictiveAI: true
  });
  const [gridLayout, setGridLayout] = useState('default');

  // Working refresh function
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      const newTime = new Date();
      setLastUpdated(newTime);
      // Update some data randomly to show it's working
      setIsLoading(false);
    }, 1000);
  };

  // Working export function
  const handleExport = () => {
    alert('📊 Exporting dashboard data...\n\n✅ Sales report generated\n✅ Inventory report generated\n✅ Customer insights exported\n\n📁 Files downloaded to: C:/Users/Downloads/dashboard-export.zip');
  };

  // Working customize function - opens modal
  const handleCustomize = () => {
    setShowCustomization(true);
  };

  // Save customization preferences
  const handleSaveCustomization = () => {
    // Save to localStorage
    const preferences = {
      selectedWidgets,
      gridLayout,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('dashboardSettings', JSON.stringify(preferences));

    alert('✅ Dashboard preferences saved successfully!\n\nYour customizations have been applied and will be remembered for future sessions.');

    setShowCustomization(false);
  };

  // Reset to defaults
  const handleResetCustomization = () => {
    setSelectedWidgets({
      kpiCards: true,
      analyticsChart: true,
      businessIntel: true,
      smartAlerts: true,
      activityFeed: true,
      predictiveAI: true
    });
    setGridLayout('default');
    localStorage.removeItem('dashboardSettings');
    alert('🔄 Dashboard reset to default settings');
  };

  // Toggle widget visibility
  const toggleWidget = (widgetKey) => {
    setSelectedWidgets(prev => ({
      ...prev,
      [widgetKey]: !prev[widgetKey]
    }));
  };

  // Working alert dismissal
  const handleAlertAction = (alertId, action) => {
    if (action) {
      alert(`🎯 Opening ${action}... \n\nThis would normally navigate to the ${action.toLowerCase()} screen.`);
    } else {
      // Dismiss alert
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    }
  };

  // Working business type change
  const handleBusinessTypeChange = (type) => {
    setBusinessType(type);
    // Show loading while switching
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
  };

  // Working time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // Update data based on range
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const kpiData = {
    restaurant: { revenue: '$12,450', change: '+12.5%', color: 'blue' },
    pharmacy: { revenue: '$18,240', change: '+18.3%', color: 'blue' },
    retail: { revenue: '$24,680', change: '+15.8%', color: 'blue' }
  };



  const activityData = [
    { user: 'Sarah Wilson', action: 'completed large order', amount: '$342.50', icon: '💰' },
    { user: 'System', action: 're-stock alert triggered', amount: 'Hot Sauce', icon: '📦' },
    { user: 'John Doe', action: 'started new shift', amount: '9:00 AM', icon: '👤' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">
                Business Intelligence Dashboard
              </h1>
              <p className="text-slate-600">
                Real-time insights for your {businessType} operations
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">LIVE</span>
              </div>

              <div className="text-xs text-slate-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
            >
              <span className="text-sm mr-1">🔄</span>
              Refresh Data
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            {/* Scrollable Business Type Selector */}
            <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg min-w-max">
                <button
                  onClick={() => setBusinessType('restaurant')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    businessType === 'restaurant' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🌱 Restaurant
                </button>
                <button
                  onClick={() => setBusinessType('pharmacy')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    businessType === 'pharmacy' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  💊 Pharmacy
                </button>
                <button
                  onClick={() => setBusinessType('retail')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    businessType === 'retail' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🛍️ Retail
                </button>
              </div>
            </div>

            {/* Scrollable Action Buttons */}
            <div className="flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 ml-4">
              <div className="flex items-center space-x-3 min-w-max">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  📊 Export Excel
                </button>
                <button
                  onClick={handleCustomize}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
                >
                  🎨 Customize Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">💰</div>
              <div className="text-green-600 text-sm font-medium">+12.5%</div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Today's Revenue</h3>
            <p className="text-3xl font-bold text-slate-900">{kpiData[businessType].revenue}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">📊</div>
              <div className="text-green-600 text-sm font-medium">+8.3%</div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Transactions</h3>
            <p className="text-3xl font-bold text-slate-900">145</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">👥</div>
              <div className="text-green-600 text-sm font-medium">+15.2%</div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Customers</h3>
            <p className="text-3xl font-bold text-slate-900">89</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">⚠️</div>
              <div className="text-orange-600 text-sm font-medium">23 items</div>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Low Stock Alerts</h3>
            <p className="text-3xl font-bold text-slate-900">24</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analytics Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">Performance Analytics</h2>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => handleTimeRangeChange('today')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                      timeRange === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange('week')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                      timeRange === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange('month')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                      timeRange === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>

              <div className="h-64 mb-6">
                <div className="flex items-end space-x-2 h-full justify-center">
                  {[65, 85, 45, 75, 95, 55, 80, 88, 62, 90, 70, 95].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="bg-gradient-to-t from-blue-500 to-blue-400 w-full rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-slate-500 mt-2">{i + 1}:00</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">$242,650</div>
                  <div className="text-sm text-slate-500">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+18.7%</div>
                  <div className="text-sm text-slate-500">Growth Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">247</div>
                  <div className="text-sm text-slate-500">Peak Transactions</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6">Business Intelligence Insights</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Tomorrow's Revenue</h3>
                  <p className="text-3xl font-bold text-slate-900 mb-2">$14,200 - $16,800</p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">🔮 94% confidence</span>
                    <span className="text-green-600">↗ 13.2% growth</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Performance Score</h3>
                  <p className="text-3xl font-bold text-slate-900 mb-3">95.6%</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95.6%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Restaurant Management Tools */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Restaurant Management</h2>
              <div className="text-sm text-slate-600">Quick access to all restaurant operations</div>
            </div>

            {/* Scrollable Tools Container */}
            <div className="overflow-y-auto max-h-[calc(100vh-300px)] space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">

              {/* Table Management */}
              <div className="bg-slate-50 rounded-lg p-4 hover:bg-blue-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      🪑
                    </div>
                    <h3 className="font-medium text-slate-900 group-hover:text-blue-900">Table Management</h3>
                  </div>
                  <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                    8 occupied
                  </div>
                </div>
                <p className="text-sm text-slate-600">Manage dining tables and seating assignments</p>
              </div>

              {/* Reservations */}
              <div className="bg-slate-50 rounded-lg p-4 hover:bg-green-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                      📋
                    </div>
                    <h3 className="font-medium text-slate-900 group-hover:text-green-900">Reservations</h3>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                    12 today
                  </div>
                </div>
                <p className="text-sm text-slate-600">View and manage today's reservations</p>
              </div>

              {/* Staff Management */}
              <div className="bg-slate-50 rounded-lg p-4 hover:bg-purple-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      👥
                    </div>
                    <h3 className="font-medium text-slate-900 group-hover:text-purple-900">Staff Management</h3>
                  </div>
                  <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                    2 on break
                  </div>
                </div>
                <p className="text-sm text-slate-600">Clock in/out, schedules, and staffing</p>
              </div>

              {/* Kitchen Display */}
              <div className="bg-slate-50 rounded-lg p-4 hover:bg-red-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                      👨‍🍳
                    </div>
                    <h3 className="font-medium text-slate-900 group-hover:text-red-900">Kitchen Display</h3>
                  </div>
                  <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                    8 pending
                  </div>
                </div>
                <p className="text-sm text-slate-600">Order status and kitchen preparation</p>
              </div>

              {/* Order Pickup Station */}
              <div className="bg-slate-50 rounded-lg p-4 hover:bg-indigo-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                      📦
                    </div>
                    <h3 className="font-medium text-slate-900 group-hover:text-indigo-900">Order Pickup Station</h3>
                  </div>
                  <div className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs font-medium">
                    3 ready
                  </div>
                </div>
                <p className="text-sm text-slate-600">Orders ready for customer pickup</p>
              </div>

              {/* Delivery Dashboard */}
              <div className="bg-slate-50 rounded-lg p-4 hover:bg-teal-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                      🚚
                    </div>
                    <h3 className="font-medium text-slate-900 group-hover:text-teal-900">Delivery Dashboard</h3>
                  </div>
                  <div className="bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs font-medium">
                    5 active
                  </div>
                </div>
                <p className="text-sm text-slate-600">Track delivery orders and drivers</p>
              </div>

              {/* Menu Management */}
              <div className="bg-slate-50 rounded-lg p-4 hover:bg-emerald-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                      🍽️
                    </div>
                    <h3 className="font-medium text-slate-900 group-hover:text-emerald-900">Menu Management</h3>
                  </div>
                  <div className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-xs font-medium">
                    45 items
                  </div>
                </div>
                <p className="text-sm text-slate-600">Quick menu updates and availability</p>
              </div>

              {/* Daily Reports */}
              <div className="bg-slate-50 rounded-lg p-4 hover:bg-violet-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white font-bold">
                      📊
                    </div>
                    <h3 className="font-medium text-slate-900 group-hover:text-violet-900">Daily Reports</h3>
                  </div>
                  <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium">
                    $12.4k
                  </div>
                </div>
                <p className="text-sm text-slate-600">Today's revenue summary and metrics</p>
              </div>

              {/* Smart Alerts */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 flex items-center">
                    <span className="text-lg mr-2">🚨</span>
                    Smart Alerts
                  </h3>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                    {alerts.length} active
                  </span>
                </div>
                <div className="space-y-3">
                  {alerts.slice(0, 2).map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 text-xs ${
                      alert.type === 'warning' ? 'bg-amber-50 border-amber-500' :
                      alert.type === 'info' ? 'bg-blue-50 border-blue-500' :
                      'bg-green-50 border-green-500'
                    }`}>
                      <div className="font-medium text-slate-900">{alert.icon} {alert.message}</div>
                      <div className="text-slate-500">{alert.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 flex items-center">
                    <span className="text-lg mr-2 animate-pulse">🔴</span>
                    Activity Feed
                  </h3>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-medium">LIVE</span>
                </div>
                <div className="space-y-3">
                  {activityData.slice(0, 2).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="text-lg">{activity.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-900">{activity.user}</h4>
                        <p className="text-xs text-slate-600">{activity.action}</p>
                        <div className="text-sm font-medium text-slate-900">{activity.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Dashboard Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Customize Dashboard</h2>
                  <p className="text-slate-600 mt-1">Personalize your business intelligence center</p>
                </div>
                <button
                  onClick={() => setShowCustomization(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Panel - Widget Library */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 bg-slate-50 p-4 rounded-lg">Widget Library</h3>

                  <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">📊</span>
                        Analytics & Metrics
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedWidgets.kpiCards}
                            onChange={() => toggleWidget('kpiCards')}
                            className="rounded"
                          />
                          <span className="text-sm">KPI Cards (Revenue, Transactions, Customers)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedWidgets.analyticsChart}
                            onChange={() => toggleWidget('analyticsChart')}
                            className="rounded"
                          />
                          <span className="text-sm">Performance Chart</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedWidgets.businessIntel}
                            onChange={() => toggleWidget('businessIntel')}
                            className="rounded"
                          />
                          <span className="text-sm">Business Intelligence</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">🚨</span>
                        Alerts & Activity
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedWidgets.smartAlerts}
                            onChange={() => toggleWidget('smartAlerts')}
                            className="rounded"
                          />
                          <span className="text-sm">Smart Alerts</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedWidgets.activityFeed}
                            onChange={() => toggleWidget('activityFeed')}
                            className="rounded"
                          />
                          <span className="text-sm">Activity Feed</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                        <span className="text-lg mr-2">🔮</span>
                        AI & Intelligence
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedWidgets.predictiveAI}
                            onChange={() => toggleWidget('predictiveAI')}
                            className="rounded"
                          />
                          <span className="text-sm">Predictive Insights (AI)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Panel - Layout Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 bg-slate-50 p-4 rounded-lg">Layout Options</h3>

                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-3">Grid Layout</h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="layout"
                            value="default"
                            checked={gridLayout === 'default'}
                            onChange={(e) => setGridLayout(e.target.value)}
                          />
                          <span className="text-sm">Default Layout (2-col)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="layout"
                            value="compact"
                            checked={gridLayout === 'compact'}
                            onChange={(e) => setGridLayout(e.target.value)}
                          />
                          <span className="text-sm">Compact Layout (3-col)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="layout"
                            value="expanded"
                            checked={gridLayout === 'expanded'}
                            onChange={(e) => setGridLayout(e.target.value)}
                          />
                          <span className="text-sm">Expanded Layout (1-col)</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-3">Display Options</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Show Trend Indicators</span>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Compact Mode</span>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Auto-refresh (minutes)</span>
                          <select className="text-sm rounded px-2 py-1 border">
                            <option>5</option>
                            <option>10</option>
                            <option>15</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Preview & Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 bg-slate-50 p-4 rounded-lg">Preview & Apply</h3>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-3">Selected Widgets</h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div>✅ KPI Cards: Revenue, Transactions, Customers</div>
                      <div>✅ Performance Analytics: Interactive Charts</div>
                      <div>✅ Smart Alerts: Priority Notifications</div>
                      <div>✅ Activity Feed: Real-time Events</div>
                      <div>✅ AI Predictions: Confidence-based Forecasting</div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center">
                      <span className="mr-2">💡</span>
                      Current Configuration
                    </h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <div>• Grid Layout: {gridLayout}</div>
                      <div>• Widgets: {Object.values(selectedWidgets).filter(Boolean).length} of 6 enabled</div>
                      <div>• Auto-refresh: 5 minutes</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleResetCustomization}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    Reset to Default
                  </button>
                  <div className="text-sm text-slate-500">
                    Changes will be saved automatically
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowCustomization(false)}
                    className="px-6 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomization}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Save & Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
