import React, { useState, useEffect } from 'react';

const InventoryDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    pendingOrders: 0,
    recentMovements: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchInventoryMetrics = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setMetrics({
            totalProducts: 10,
            lowStockItems: 3,
            outOfStockItems: 0,
            totalValue: 2457.50,
            pendingOrders: 2,
            recentMovements: [
              { id: 1, product: 'Premium Coffee', type: 'OUT', quantity: 5, reason: 'Sale', timestamp: new Date() },
              { id: 2, product: 'Organic Milk 1L', type: 'IN', quantity: 10, reason: 'Restock', timestamp: new Date(Date.now() - 3600000) },
              { id: 3, product: 'Whole Wheat Bread', type: 'OUT', quantity: 2, reason: 'Sale', timestamp: new Date(Date.now() - 7200000) }
            ]
          });
          setLoading(false);
          setLastUpdated(new Date());
        }, 1000);
      } catch (error) {
        console.error('Error fetching inventory metrics:', error);
        setLoading(false);
      }
    };

    fetchInventoryMetrics();
  }, []);

  const MetricCard = ({ title, value, subtitle, color, icon }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3>
          <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-50')}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const RecentMovements = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {metrics.recentMovements.map((movement) => (
          <div key={movement.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{movement.product}</p>
              <p className="text-sm text-gray-600">{movement.reason}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                movement.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
              </span>
              <span className="text-sm text-gray-500">
                {movement.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts}
          subtitle="Active inventory items"
          color="border-l-blue-500"
          icon="📦"
        />

        <MetricCard
          title="Low Stock Items"
          value={metrics.lowStockItems}
          subtitle="Items below minimum level"
          color="border-l-yellow-500"
          icon="⚠️"
        />

        <MetricCard
          title="Out of Stock"
          value={metrics.outOfStockItems}
          subtitle="Items with zero stock"
          color="border-l-red-500"
          icon="❌"
        />

        <MetricCard
          title="Total Value"
          value={`$${metrics.totalValue.toFixed(2)}`}
          subtitle="Current inventory value"
          color="border-l-green-500"
          icon="💰"
        />

        <MetricCard
          title="Pending Orders"
          value={metrics.pendingOrders}
          subtitle="Purchase orders waiting"
          color="border-l-purple-500"
          icon="📋"
        />

        <MetricCard
          title="Stock Alerts"
          value="--"
          subtitle="Live monitoring active"
          color="border-l-indigo-500"
          icon="🏠"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMovements />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
              Generate Stock Report
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200">
              Check Low Stock Alerts
            </button>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200">
              View Purchase Orders
            </button>
            <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200">
              Warehouse Management
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
