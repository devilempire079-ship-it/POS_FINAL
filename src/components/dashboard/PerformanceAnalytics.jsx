import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Calendar,
  DollarSign,
  Users,
  ShoppingCart
} from 'lucide-react';

const PerformanceAnalytics = ({ hourlyData, metrics, loading }) => {
  const [timeRange, setTimeRange] = useState('today');

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Analytics</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-lg"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generate mock hourly data for demonstration
  const sampleHourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    sales: Math.floor(Math.random() * 3000) + 500,
    transactions: Math.floor(Math.random() * 20) + 5,
    customers: Math.floor(Math.random() * 15) + 3
  }));

  // Sample performance metrics
  const performanceMetrics = [
    {
      title: 'Peak Sales Hour',
      value: '7 PM',
      change: '+15%',
      icon: Clock,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Busiest Day',
      value: 'Friday',
      change: '+25%',
      icon: Calendar,
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Avg Transaction',
      value: '$86.21',
      change: '+3.2%',
      icon: DollarSign,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Customer Peak',
      value: '12-2 PM',
      change: '+8%',
      icon: Users,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const maxSales = Math.max(...sampleHourlyData.map(d => d.sales));
  const totalSales = sampleHourlyData.reduce((sum, d) => sum + d.sales, 0);
  const avgHourlySales = totalSales / 24;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Performance Analytics</h2>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['today', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales Chart */}
        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Sales Performance</h3>

            <div className="flex items-end space-x-2 h-48 mb-4">
              {sampleHourlyData.map((data, index) => {
                const height = (data.sales / maxSales) * 100;
                const isPeak = data.sales === maxSales;
                const formattedHour = data.hour === 0 ? '12AM' :
                                    data.hour < 12 ? `${data.hour}AM` :
                                    data.hour === 12 ? '12PM' :
                                    `${data.hour - 12}PM`;

                return (
                  <div key={index} className="flex flex-col items-center flex-1 group">
                    <div className="relative w-full flex justify-center">
                      <div
                        className={`w-full max-w-[20px] rounded-t transition-all duration-300 ${
                          isPeak ? 'bg-blue-600' : 'bg-blue-400 group-hover:bg-blue-500'
                        }`}
                        style={{ height: `${height}%` }}
                      >
                        {isPeak && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{formattedHour}</span>
                    <span className="text-xs font-medium text-gray-700">
                      ${data.sales.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-500">Total Sales</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${totalSales.toLocaleString()}
                </div>
                <div className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Average per Hour</div>
                <div className="text-lg font-semibold text-gray-900">
                  ${avgHourlySales.toFixed(0).toLocaleString()}
                </div>
                <div className="text-xs text-blue-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Peak at 7 PM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-4">
          {performanceMetrics.map((metric, index) => {
            const IconComp = metric.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${metric.color} mr-3`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {metric.title}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {metric.value}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {metric.change}
                    </div>
                    <div className="text-xs text-gray-500">vs yesterday</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Growth Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Growth Summary</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Revenue</span>
                <span className="text-sm font-medium text-green-600">+15.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Transactions</span>
                <span className="text-sm font-medium text-blue-600">+8.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Customers</span>
                <span className="text-sm font-medium text-purple-600">+12.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
