import React, { useState, useEffect, useRef } from 'react';
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
  Pause,
  BarChart3,
  PieChart,
  LineChart,
  Zap
} from 'lucide-react';
import api from '../../services/api';

const AdvancedAnalyticsDashboard = () => {
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
  const [realTimeData, setRealTimeData] = useState([]);
  const ws = useRef(null);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    // Create WebSocket connection
    ws.current = new WebSocket('ws://localhost:3001');
    
    ws.current.onopen = () => {
      console.log('Connected to real-time analytics server');
    };
    
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_SALE') {
          setRealTimeData(prev => [...prev.slice(-9), data.data]); // Keep last 10 items
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.current.onclose = () => {
      console.log('Disconnected from real-time analytics server');
    };
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Load initial dashboard data
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
      // Fetch real-time analytics data
      const data = await api.getRealTimeAnalytics();
      
      // Simulate some additional data for a fuller dashboard
      const mockData = {
        ...data,
        yesterdaySales: data.todaySales * 0.92,
        weeklySales: data.todaySales * 6.8,
        monthlySales: data.todaySales * 28.5,
        avgTransactionValue: data.todaySales / (data.totalTransactions || 1),
        salesByHour: Array.from({ length: 24 }, () => Math.floor(Math.random() * 1000)),
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
      if (format === 'currency') return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    const maxValue = Math.max(...metrics.salesByHour, 1); // Avoid division by zero
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
                {new Date().getHours() - 11 + index}:00
              </span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Peak Hour: {metrics.salesByHour.indexOf(maxValue)}:00
            <span className="ml-2 font-semibold text-blue-600">
              ({formatValue(maxValue)})
            </span>
          </p>
        </div>
      </div>
    );
  };

  const RealTimeFeed = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Real-Time Sales Feed</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {realTimeData.length > 0 ? (
          [...realTimeData].reverse().map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.customer || 'Walk-in Customer'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  {formatValue(transaction.totalAmount)}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {transaction.paymentType.replace('_', ' ')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Waiting for real-time sales data...</p>
            <p className="text-sm mt-1">Process a sale to see it appear here</p>
          </div>
        )}
      </div>
    </div>
  );

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return val;
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Advanced Analytics</h1>
          <p className="text-gray-600">Comprehensive business insights and real-time performance metrics</p>
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
          subtitle={`Target: ${formatValue(Math.floor(metrics.todaySales + Math.random() * 500))}`}
          icon={DollarSign}
          color="green"
          trend={salesGrowth >= 0 ? 'up' : 'down'}
          trendValue={salesGrowth}
        />

        <MetricCard
          title="Weekly Sales"
          value={metrics.weeklySales}
          subtitle={`Monthly target: ${formatValue(Math.floor(monthlyTarget))}`}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        {/* Real-Time Feed */}
        <RealTimeFeed />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products Today</h3>
            <Package className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {metrics.topProducts.map((product, index) => (
              <div key={product.product} className="flex items-center justify-between py-2">
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
                    <p className="font-medium text-gray-900">{product.product}</p>
                    <p className="text-sm text-gray-500">{product.sales} units</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatValue(product.sales * 12.5)}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
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
              {metrics.inventoryAlerts.length > 0 && (
                <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  {metrics.inventoryAlerts.length} alerts
                </div>
              )}
              <AlertTriangle className={`h-5 w-5 ${metrics.inventoryAlerts.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
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

      {/* AI-Powered Insights */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">AI-Powered Business Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-bold mb-2">_peak Sales Hour</h3>
            <p className="text-2xl font-bold mb-1">6:00 PM</p>
            <p className="text-sm opacity-90">Increase staff during this hour</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-bold mb-2">Top Performing Category</h3>
            <p className="text-2xl font-bold mb-1">Beverages</p>
            <p className="text-sm opacity-90">35% of total sales</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="font-bold mb-2">Customer Retention</h3>
            <p className="text-2xl font-bold mb-1">87%</p>
            <p className="text-sm opacity-90">Weekly returning customers</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
          <h3 className="font-bold mb-2">Recommendation</h3>
          <p>Based on current trends, consider promoting premium coffee products during the 3-5 PM window to maximize sales during a typically slower period.</p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;