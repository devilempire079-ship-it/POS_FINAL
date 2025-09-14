import React, { useState } from 'react';
import {
  Settings,
  Eye,
  EyeOff,
  GripVertical,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Clock,
  BarChart3
} from 'lucide-react';

const WidgetGrid = ({ businessType, metrics, formatCurrency, formatNumber }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [widgetVisibility, setWidgetVisibility] = useState({
    revenueTrend: true,
    customerInsights: true,
    inventoryAlerts: true,
    performanceComparison: true,
    timeAnalytics: true,
    businessSpecific: true
  });

  const sampleWidgets = [
    {
      id: 'revenueTrend',
      title: 'Revenue Trend',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800',
      component: 'RevenueTrendWidget',
      data: {
        chart: 'line',
        points: [12000, 15800, 14200, 18600, 16200, 18900, 21100]
      }
    },
    {
      id: 'customerInsights',
      title: 'Customer Insights',
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      component: 'CustomerInsightsWidget',
      data: {
        newCustomers: 23,
        repeatRate: '78.5%',
        avgSatisfaction: 4.7
      }
    },
    {
      id: 'inventoryAlerts',
      title: 'Inventory Alerts',
      icon: Package,
      color: 'bg-yellow-100 text-yellow-800',
      component: 'InventoryAlertsWidget',
      data: {
        lowStock: 24,
        outOfStock: 3,
        criticalItems: ['Hot Sauce', 'Pasta', 'Tomatoes']
      }
    },
    {
      id: 'performanceComparison',
      title: 'Performance Comparison',
      icon: BarChart3,
      color: 'bg-purple-100 text-purple-800',
      component: 'PerformanceComparisonWidget',
      data: {
        thisMonth: '$345,650',
        lastMonth: '$312,480',
        change: '+10.6%'
      }
    },
    {
      id: 'timeAnalytics',
      title: 'Time Analytics',
      icon: Clock,
      color: 'bg-orange-100 text-orange-800',
      component: 'TimeAnalyticsWidget',
      data: {
        peakHours: '7-9 PM',
        slowestHours: '2-4 AM',
        avgTransactionTime: '4.2 min'
      }
    },
    {
      id: 'businessSpecific',
      title: `${businessType === 'restaurant' ? 'Kitchen' :
               businessType === 'pharmacy' ? 'Prescription' :
               businessType === 'retail' ? 'Category' : 'Business'} Performance`,
      icon: businessType === 'restaurant' ? TrendingUp :
            businessType === 'pharmacy' ? DollarSign :
            businessType === 'retail' ? Package : BarChart3,
      color: 'bg-indigo-100 text-indigo-800',
      component: 'BusinessSpecificWidget',
      data: getBusinessSpecificData(businessType)
    }
  ];

  function getBusinessSpecificData(type) {
    switch (type) {
      case 'restaurant':
        return {
          status: 'Excellent',
          metrics: [
            { label: 'Orders per Hour', value: '45', change: '+12%' },
            { label: 'Avg Food Cost', value: '$12.50', change: '-5%' },
            { label: 'Staff Efficiency', value: '98%', change: '+3%' }
          ]
        };
      case 'pharmacy':
        return {
          status: 'Good',
          metrics: [
            { label: 'Avg Filling Time', value: '4.2 min', change: '+8%' },
            { label: 'Insurance Claims', value: '94%', change: '+2%' },
            { label: 'Customer Retention', value: '87%', change: '+5%' }
          ]
        };
      case 'retail':
        return {
          status: 'Stable',
          metrics: [
            { label: 'Conversion Rate', value: '67%', change: '+8%' },
            { label: 'Avg Basket Size', value: '$67.50', change: '+5%' },
            { label: 'Return Rate', value: '2.1%', change: '-12%' }
          ]
        };
      default:
        return {
          status: 'Monitoring',
          metrics: [
            { label: 'Active Users', value: '1,423', change: '+15%' },
            { label: 'System Health', value: '99.9%', change: '0%' },
            { label: 'Response Time', value: '0.8s', change: '-10%' }
          ]
        };
    }
  }

  const toggleWidgetVisibility = (widgetId) => {
    setWidgetVisibility(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

  const WidgetComponent = ({ widget }) => {
    const IconComp = widget.icon;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-48">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${widget.color} mr-3`}>
              <IconComp className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {widget.id === 'revenueTrend' && (
          <div className="h-24">
            <div className="flex items-end space-x-2 h-full">
              {widget.data.points.map((point, index) => {
                const height = (point / 22000) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="bg-green-400 rounded-t w-full"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>+18%</span>
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                This Week
              </span>
            </div>
          </div>
        )}

        {widget.id === 'customerInsights' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">New Customers</span>
              <span className="text-sm font-medium">{widget.data.newCustomers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Repeat Rate</span>
              <span className="text-sm font-medium">{widget.data.repeatRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Satisfaction</span>
              <span className="text-sm font-medium flex items-center">
                <span className="text-yellow-400 mr-1">★★★★★</span>
                {widget.data.avgSatisfaction}
              </span>
            </div>
          </div>
        )}

        {(widget.id === 'inventoryAlerts' || widget.id === 'performanceComparison') && (
          <div className="space-y-2">
            {widget.id === 'inventoryAlerts' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Low Stock Items</span>
                  <span className="text-sm font-medium text-yellow-600">{widget.data.lowStock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Out of Stock</span>
                  <span className="text-sm font-medium text-red-600">{widget.data.outOfStock}</span>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-gray-600">Critical Items:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {widget.data.criticalItems.map((item, i) => (
                      <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">This Month</span>
                  <span className="text-sm font-medium">{widget.data.thisMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Last Month</span>
                  <span className="text-sm font-medium">{widget.data.lastMonth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Change</span>
                  <span className="text-sm font-medium text-green-600">{widget.data.change}</span>
                </div>
              </>
            )}
          </div>
        )}

        {widget.id === 'timeAnalytics' && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Peak Hours</span>
              <span className="text-sm font-medium">{widget.data.peakHours}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Slowest Hours</span>
              <span className="text-sm font-medium">{widget.data.slowestHours}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Avg Transaction</span>
              <span className="text-sm font-medium">{widget.data.avgTransactionTime}</span>
            </div>
          </div>
        )}

        {widget.id === 'businessSpecific' && (
          <div>
            <div className="mb-2">
              <span className="text-xs text-gray-600">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                widget.data.status === 'Excellent' ? 'bg-green-100 text-green-800' :
                widget.data.status === 'Good' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {widget.data.status}
              </span>
            </div>
            <div className="space-y-2">
              {widget.data.metrics.map((metric, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-xs text-gray-600">{metric.label}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">{metric.value}</span>
                    <span className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Customizable Widgets</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Widget Visibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleWidgets.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <widget.icon className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{widget.title}</span>
                </div>
                <button
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className={`p-1 rounded-full transition-colors ${
                    widgetVisibility[widget.id]
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {widgetVisibility[widget.id] ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleWidgets
          .filter(widget => widgetVisibility[widget.id])
          .map((widget) => (
            <WidgetComponent key={widget.id} widget={widget} />
          ))}
      </div>
    </div>
  );
};

export default WidgetGrid;
