import React, { useState, useEffect } from 'react';
import {
  Activity,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Package,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';

const RealTimeDashboard = () => {
  const [metrics, setMetrics] = useState({
    todaySales: 0,
    yesterdaySales: 0,
    weeklySales: 0,
    monthlySales: 0,
    activeCustomers: 0,
    avgTransactionValue: 0,
    totalTransactions: 0,
    topProducts: [],
    salesByHour: [],
    stockAlertsCount: 0,
    recentTransactions: [],
    inventoryAlerts: []
  });

  const [timeRange, setTimeRange] = useState('today');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Mock real-time data
  useEffect(() => {
    loadDashboardData();

    let interval;
    if (autoRefresh) {
      interval = setInterval(loadDashboardData, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh, refreshInterval]);

  const loadDashboardData = async () => {
    setIsLoading(true);

    try {
      // Simulate API call with realistic data
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData = {
        todaySales: 2847.32,
        yesterdaySales: 2591.89,
        weeklySales: 18947.65,
        monthlySales: 78956.23,
        activeCustomers: 23,
        avgTransactionValue: 32.84,
        totalTransactions: 87,
        stockAlertsCount: 3,
        topProducts: [
          { name: 'Premium Coffee', sales: 145.67, quantity: 34 },
          { name: 'Organic Milk 1L', sales: 98.45, quantity: 29 },
          { name: 'Whole Wheat Bread', sales: 76.23, quantity: 18 },
          { name: 'Chocolate Heaven Pack', sales: 65.89, quantity: 12 },
          { name: 'Natural Honey Jar', sales: 54.12, quantity: 11 }
        ],
        salesByHour: [
          23.45, 45.67, 78.90, 123.45, 156.78, 189.23, 201.34, 256.78,
          289.45, 312.67, 334.23, 398.45, 412.56, 445.67, 467.89, 498.12,
          523.34, 567.89, 589.23, 612.45, 634.67, 689.45, 712.34, 734.56
        ],
        inventoryAlerts: [
          { product: 'Organic Milk 1L', current: 8, minimum: 10, location: 'B-2-01' },
          { product: 'Premium Coffee', current: 12, minimum: 15, location: 'A-1-01' },
          { product: 'Sourdough Bread Loaf', current: 5, minimum: 8, location: 'C-3-02' }
        ],
        recentTransactions: [
          {
            id: 'TXN-001',
            time: '10:45 AM',
            customer: 'Sarah Johnson',
            items: 4,
            total: 87.32,
            payment: 'Card'
          },
          {
            id: 'TXN-002',
            time: '10:42 AM',
            customer: 'Mike Davis',
            items: 2,
            total: 24.99,
            payment: 'Cash'
          },
          {
            id: 'TXN-003',
            time: '10:38 AM',
            customer: 'Jennifer Martinez',
            items: 6,
            total: 145.67,
            payment: 'Card'
          },
          {
            id: 'TXN-004',
            time: '10:35 AM',
            customer: 'Robert Miller',
            items: 3,
            total: 56.78,
            payment: 'Card'
          },
          {
            id: 'TXN-005',
            time: '10:30 AM',
            customer: 'Lisa Garcia',
            items: 1,
            total: 15.99,
            payment: 'Cash'
          }
        ]
      };

      setMetrics(mockData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const salesGrowth = ((metrics.todaySales - metrics.yesterdaySales) / metrics.yesterdaySales * 100).toFixed(1);
  const weeklyGrowth = (((metrics.todaySales + metrics.yesterdaySales) / 2 - (metrics.weeklySales / 7)) /
                        (metrics.weeklySales / 7) * 100).toFixed(1);
  const monthlyTarget = metrics.monthlySales * 1.1; // 10% growth target

  const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue, format = 'currency' }) => {
    const formatValue = (val) => {
      if (format === 'currency') return `$${val.toLocaleString()}`;
      if (format === 'number') return val.toLocaleString();
      if (format === 'percentage') return `${val}%`;
      return val;
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full bg-${color}-100`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-sm ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SalesChart = () => {
    const maxValue = Math.max(...metrics.salesByHour);
    const chartHeight = 200;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sales by Hour</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Activity className="h-4 w-4" />
            <span>Live Data</span>
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </div>
        </div>

        <div className="flex items-end space-x-1 h-48 mb-4">
          {metrics.salesByHour.slice(-12).map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300"
                style={{
                  height: `${(value / maxValue) * chartHeight}px`,
                  minHeight: '2px'
                }}
              />
              <span className="text-xs text-gray-500 mt-2">
                {new Date().getHours() - 11 + index + 1}:00
              </span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Peak Hour: {metrics.salesByHour.indexOf(maxValue)}:00
            <span className="ml-2 font-semibold text-blue-600">
              (${maxValue.toFixed(2)})
            </span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📈 Real-Time Dashboard</h1>
          <p className="text-gray-600">Live business metrics and performance indicators</p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{autoRefresh ? 'Auto' : 'Paused'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Refresh:</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              disabled={!autoRefresh}
            >
              <option value="15">15s</option>
              <option value="30">30s</option>
              <option value="60">1m</option>
              <option value="300">5m</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Today's Sales"
          value={metrics.todaySales}
          subtitle={`Target: $${Math.floor(metrics.todaySales + Math.random() * 500)}`}
          icon={DollarSign}
          color="green"
          trend={salesGrowth >= 0 ? 'up' : 'down'}
          trendValue={salesGrowth}
        />

        <MetricCard
          title="Weekly Sales"
          value={metrics.weeklySales}
          subtitle={`Monthly target: $${Math.floor(monthlyTarget)}`}
          icon={TrendingUp}
          color="blue"
          trend={weeklyGrowth >= 0 ? 'up' : 'down'}
          trendValue={weeklyGrowth}
        />

        <MetricCard
          title="Active Customers"
          value={metrics.activeCustomers}
          subtitle="People in store"
          icon={Users}
          color="purple"
          format="number"
        />

        <MetricCard
          title="Avg Transaction"
          value={metrics.avgTransactionValue}
          subtitle={`${metrics.totalTransactions} transactions today`}
          icon={ShoppingCart}
          color="orange"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <SalesChart />

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products Today</h3>
            <Package className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {metrics.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} units</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${product.sales.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {metrics.recentTransactions.map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.customer}</p>
                    <p className="text-sm text-gray-600">{transaction.items} items • {transaction.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${transaction.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 capitalize">{transaction.payment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
            <div className="flex items-center space-x-2">
              {metrics.stockAlertsCount > 0 && (
                <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {metrics.stockAlertsCount} alerts
                </div>
              )}
              <AlertTriangle className={`h-5 w-5 ${metrics.stockAlertsCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
          </div>

          <div className="space-y-4">
            {metrics.inventoryAlerts.length > 0 ? (
              metrics.inventoryAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{alert.product}</p>
                      <p className="text-sm text-gray-600">Location: {alert.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{alert.current}/{alert.minimum}</p>
                    <p className="text-xs text-gray-500">Stock/Min</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-600">All inventory levels optimal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">🚀 Performance Overview</h2>
          <p className="text-lg opacity-90">Today's business summary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              ${((metrics.todaySales / 100) * (metrics.yesterdaySales > 0 ? 100 : 50)).toFixed(0)}K
            </div>
            <div className="text-sm opacity-90">Revenue Target Progress</div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(metrics.todaySales / (metrics.yesterdaySales * 1.2)) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{metrics.totalTransactions}</div>
            <div className="text-sm opacity-90">Transactions Today</div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(metrics.totalTransactions / 120) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{metrics.activeCustomers}</div>
            <div className="text-sm opacity-90">Active Customers</div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(metrics.activeCustomers / 50) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
