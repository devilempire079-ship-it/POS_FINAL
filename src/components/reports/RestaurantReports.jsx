import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  ChefHat,
  Calendar,
  Target,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useBusinessType } from '../../hooks/useBusinessType';

const RestaurantReports = () => {
  const { businessType } = useBusinessType();
  const isRestaurant = businessType?.code === 'restaurant';

  const [timeRange, setTimeRange] = useState('today');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock data for restaurant analytics
  const [analytics, setAnalytics] = useState({
    tableAnalytics: {
      totalTables: 12,
      occupiedTables: 8,
      averageOccupancy: 75,
      peakHours: '6-8 PM',
      averageTurnover: 45, // minutes
      revenuePerTable: 125.50
    },
    menuPerformance: {
      topItems: [
        { name: 'Grilled Salmon', orders: 24, revenue: 724.80, profit: 289.92 },
        { name: 'Ribeye Steak', orders: 18, revenue: 576.00, profit: 230.40 },
        { name: 'Caesar Salad', orders: 32, revenue: 384.00, profit: 153.60 },
        { name: 'Chicken Parmesan', orders: 15, revenue: 285.00, profit: 114.00 },
        { name: 'Tiramisu', orders: 20, revenue: 160.00, profit: 64.00 }
      ],
      totalOrders: 156,
      averageOrderValue: 42.50,
      popularCategories: ['Mains', 'Appetizers', 'Desserts']
    },
    staffPerformance: {
      servers: [
        { name: 'John Doe', tables: 12, orders: 45, revenue: 1912.50, rating: 4.8 },
        { name: 'Jane Smith', tables: 10, orders: 38, revenue: 1615.00, rating: 4.9 },
        { name: 'Mike Johnson', tables: 8, orders: 32, revenue: 1360.00, rating: 4.7 },
        { name: 'Sarah Wilson', tables: 9, orders: 41, revenue: 1742.50, rating: 4.6 }
      ],
      kitchenStaff: [
        { name: 'Chef Marco', prepTime: 12, orders: 89, efficiency: 95 },
        { name: 'Chef Lisa', prepTime: 15, orders: 67, efficiency: 92 }
      ]
    },
    hourlyData: [
      { hour: '11 AM', tables: 3, revenue: 127.50 },
      { hour: '12 PM', tables: 6, revenue: 255.00 },
      { hour: '1 PM', tables: 8, revenue: 340.00 },
      { hour: '2 PM', tables: 7, revenue: 297.50 },
      { hour: '3 PM', tables: 5, revenue: 212.50 },
      { hour: '4 PM', tables: 4, revenue: 170.00 },
      { hour: '5 PM', tables: 6, revenue: 255.00 },
      { hour: '6 PM', tables: 10, revenue: 425.00 },
      { hour: '7 PM', tables: 12, revenue: 510.00 },
      { hour: '8 PM', tables: 11, revenue: 467.50 },
      { hour: '9 PM', tables: 8, revenue: 340.00 },
      { hour: '10 PM', tables: 4, revenue: 170.00 }
    ]
  });

  // Only show if restaurant business type
  if (!isRestaurant) {
    return null;
  }

  const getOccupancyColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.8) return 'text-green-600 bg-green-100';
    if (rating >= 4.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-orange-600" />
            Restaurant Analytics
          </h1>
          <p className="text-gray-600">Comprehensive restaurant performance insights</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Table Occupancy</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.tableAnalytics.averageOccupancy}%</p>
            </div>
            <div className={`p-3 rounded-full ${getOccupancyColor(analytics.tableAnalytics.averageOccupancy)}`}>
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-600">Peak Hours:</span>
              <span className="ml-2 font-medium text-gray-900">{analytics.tableAnalytics.peakHours}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.menuPerformance.averageOrderValue}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-600">Total Orders:</span>
              <span className="ml-2 font-medium text-gray-900">{analytics.menuPerformance.totalOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue per Table</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.tableAnalytics.revenuePerTable}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-600">Table Turnover:</span>
              <span className="ml-2 font-medium text-gray-900">{analytics.tableAnalytics.averageTurnover}min</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tables</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.tableAnalytics.occupiedTables}/{analytics.tableAnalytics.totalTables}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-600">Utilization:</span>
              <span className="ml-2 font-medium text-gray-900">
                {((analytics.tableAnalytics.occupiedTables / analytics.tableAnalytics.totalTables) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Performance Chart */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Hourly Performance</h2>
          <p className="text-sm text-gray-600">Table occupancy and revenue by hour</p>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end space-x-2">
            {analytics.hourlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(data.tables / 12) * 200}px` }}
                ></div>
                <div className="mt-2 text-xs text-gray-600">{data.hour}</div>
                <div className="text-xs font-medium text-gray-900">{data.tables} tables</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Menu Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="w-5 h-5 mr-2 text-orange-600" />
              Top Menu Items
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.menuPerformance.topItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${item.revenue}</div>
                    <div className="text-sm text-green-600">+${item.profit} profit</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Server Performance
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.staffPerformance.servers.map((server, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {server.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{server.name}</h3>
                      <p className="text-sm text-gray-600">{server.tables} tables served</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${server.revenue}</div>
                    <div className={`text-sm px-2 py-1 rounded ${getPerformanceColor(server.rating)}`}>
                      ⭐ {server.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Kitchen Performance */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ChefHat className="w-5 h-5 mr-2 text-red-600" />
            Kitchen Performance
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.staffPerformance.kitchenStaff.map((staff, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{staff.name}</h3>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {staff.efficiency}% efficiency
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Avg Prep Time:</span>
                    <div className="font-medium text-gray-900">{staff.prepTime} min</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Orders Today:</span>
                    <div className="font-medium text-gray-900">{staff.orders}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts & Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Peak Performance</h4>
            <p className="text-sm text-gray-600">
              Your busiest hours are {analytics.tableAnalytics.peakHours}.
              Consider staffing adjustments during these times.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Menu Optimization</h4>
            <p className="text-sm text-gray-600">
              {analytics.menuPerformance.topItems[0].name} is your best-selling item.
              Consider featuring it more prominently.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Staff Excellence</h4>
            <p className="text-sm text-gray-600">
              {analytics.staffPerformance.servers[0].name} leads with {analytics.staffPerformance.servers[0].rating}⭐ rating.
              Great performance!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantReports;
