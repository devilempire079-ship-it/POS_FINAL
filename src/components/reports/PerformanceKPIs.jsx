import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Calendar
} from 'lucide-react';

const PerformanceKPIs = () => {
  const [kpis, setKpis] = useState([]);
  const [timeRange, setTimeRange] = useState('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock KPI data with different ranges
    const mockKPIs = [
      {
        id: 'sales-velocity',
        title: 'Sales Velocity',
        icon: TrendingUp,
        color: 'blue',
        current: 1423.67,
        target: 1500,
        unit: 'units/day',
        change: 8.2,
        trend: 'up',
        category: 'sales',
        trendData: [1200, 1320, 1380, 1410, 1423, 1420, 1423]
      },
      {
        id: 'inventory-turnover',
        title: 'Inventory Turnover',
        icon: Package,
        color: 'green',
        current: 8.7,
        target: 10.0,
        unit: 'ratio',
        change: -2.3,
        trend: 'down',
        category: 'inventory',
        trendData: [8.2, 8.4, 8.6, 8.8, 8.6, 8.7, 8.7]
      },
      {
        id: 'customer-acquisition',
        title: 'Customer Acquisition',
        icon: Users,
        color: 'purple',
        current: 42,
        target: 50,
        unit: 'new/month',
        change: 16.7,
        trend: 'up',
        category: 'customer',
        trendData: [35, 38, 40, 42, 41, 43, 42]
      },
      {
        id: 'profit-margin',
        title: 'Profit Margin',
        icon: DollarSign,
        color: 'emerald',
        current: 28.4,
        target: 30.0,
        unit: 'percentage',
        change: 1.4,
        trend: 'up',
        category: 'financial',
        trendData: [27.8, 28.2, 27.9, 28.1, 28.3, 28.4, 28.4]
      },
      {
        id: 'avg-order-value',
        title: 'Avg Order Value',
        icon: ShoppingCart,
        color: 'orange',
        current: 34.78,
        target: 35.00,
        unit: 'dollars',
        change: 2.8,
        trend: 'up',
        category: 'sales',
        trendData: [33.2, 33.8, 34.1, 34.3, 34.5, 34.7, 34.78]
      },
      {
        id: 'response-time',
        title: 'Response Time',
        icon: Zap,
        color: 'red',
        current: 0.12,
        target: 0.15,
        unit: 'seconds',
        change: -8.0,
        trend: 'up',
        category: 'performance',
        trendData: [0.14, 0.13, 0.12, 0.11, 0.12, 0.12, 0.12]
      }
    ];

    setTimeout(() => {
      setKpis(mockKPIs);
      setLoading(false);
    }, 800);
  }, [timeRange]);

  const getKPIColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getBackgroundColor = (color) => {
    const gradients = {
      blue: 'from-blue-600 to-blue-700',
      green: 'from-green-600 to-green-700',
      purple: 'from-purple-600 to-purple-700',
      emerald: 'from-emerald-600 to-emerald-700',
      orange: 'from-orange-600 to-orange-700',
      red: 'from-red-600 to-red-700'
    };
    return gradients[color] || 'from-gray-600 to-gray-700';
  };

  const getBadgeColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[color] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p className="mt-4 text-gray-600">Loading KPI data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            📊 Performance KPIs
          </h1>
          <p className="text-xl text-gray-600 mt-2">Monitor your business performance indicators</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="custom-input"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
            <option value="quarterly">Quarterly View</option>
          </select>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time updates</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const percentage = Math.min((kpi.current / kpi.target) * 100, 100);
          const isPositive = kpi.change >= 0;

          return (
            <div key={kpi.id} className="card-modern hover-lift relative overflow-hidden">
              {/* Color accent */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getBackgroundColor(kpi.color)}`}></div>

              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-3 bg-gradient-to-br ${getBackgroundColor(kpi.color)} rounded-xl shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{kpi.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{timeRange} metrics</p>
                    </div>
                  </div>

                  {/* Trend indicator */}
                  <div className={`p-2 rounded-xl ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isPositive ?
                      <TrendingUp className="h-5 w-5 text-green-600" /> :
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    }
                  </div>
                </div>

                {/* Main KPI Value */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {kpi.current.toFixed(1)}
                    {kpi.unit === 'percentage' && '%'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {kpi.unit} • Target: {isPositive ? '+' : ''}{kpi.change}%
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${percentage > 80 ? 'bg-green-500' : percentage > 65 ? 'bg-blue-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Target Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Target: {kpi.target}</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${kpi.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}% vs last period
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Overview */}
        <div className="card-elevated">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-modern">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Performance Overview</h3>
                <p className="text-gray-600">Key metrics summary</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-green-800">On Target</span>
                </div>
                <span className="text-2xl font-bold text-green-800">
                  {kpis.filter(k => k.current >= k.target * 0.9).length}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-semibold text-yellow-800">Near Target</span>
                </div>
                <span className="text-2xl font-bold text-yellow-800">
                  {kpis.filter(k => k.current >= k.target * 0.8 && k.current < k.target * 0.9).length}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-red-800">Needs Attention</span>
                </div>
                <span className="text-2xl font-bold text-red-800">
                  {kpis.filter(k => k.current < k.target * 0.8).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="card-elevated">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-modern">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Recommended Actions</h3>
                <p className="text-gray-600">AI-powered insights</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Optimize Inventory Turnover</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Implement automated reorder alerts to maintain optimal stock levels and improve turnover ratio.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-start space-x-3">
                  <ShoppingCart className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900">Boost Average Order Value</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Introduce Bundle offers and personalized recommendations to increase customer spending.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Enhance Customer Acquisition</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Focus on digital marketing campaigns targeting high-value customer segments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="card-elevated">
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed KPI Trends</h3>

          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KPI Metric
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kpis.map((kpi) => {
                  const percentage = (kpi.current / kpi.target) * 100;
                  let statusColor = 'badge-danger';
                  let statusText = 'Critical';

                  if (percentage >= 90) {
                    statusColor = 'badge-success';
                    statusText = 'Excellent';
                  } else if (percentage >= 80) {
                    statusColor = 'badge-warning';
                    statusText = 'Good';
                  } else if (percentage >= 70) {
                    statusColor = 'badge-info';
                    statusText = 'Fair';
                  }

                  return (
                    <tr key={kpi.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{kpi.title}</div>
                        <div className="text-sm text-gray-600">{kpi.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-gray-900">
                          {kpi.current.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">{kpi.target.toFixed(1)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpi.change >= 0 ? '+' : ''}{kpi.change}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={statusColor}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {kpi.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                          )}
                          <span className="text-sm text-gray-600 capitalize">
                            {kpi.trend === 'up' ? 'Improving' : 'Declining'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceKPIs;
