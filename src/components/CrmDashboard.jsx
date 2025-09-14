import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CrmDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [topCustomers, setTopCustomers] = useState([]);
  const [recentCommunications, setRecentCommunications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, customerData, communicationsData] = await Promise.all([
        api.getCustomerAnalytics(),
        api.getCustomers({ limit: 10, sortBy: 'totalSpent', sortOrder: 'desc' }),
        api.getCustomerCommunications(1) // Recent communications for client 1 as example
      ]);

      setAnalytics(analyticsData.data);
      setTopCustomers(customerData.customers || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-2xl">Loading CRM Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">📊 CRM Dashboard</h1>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Add New Customer
        </button>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-800">{analytics.overview.totalCustomers}</div>
            <div className="text-blue-600 font-medium">Total Customers</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-800">${analytics.overview.totalRevenue.toFixed(2)}</div>
            <div className="text-green-600 font-medium">Total Revenue</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-yellow-800">${analytics.overview.averageOrderValue.toFixed(2)}</div>
            <div className="text-yellow-600 font-medium">Avg Order Value</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-800">{analytics.overview.averageLoyaltyPoints.toFixed(1)}</div>
            <div className="text-purple-600 font-medium">Avg Loyalty Points</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <div className="text-3xl font-bold text-indigo-800">{analytics.overview.retentionRate.toFixed(1)}%</div>
            <div className="text-indigo-600 font-medium">Retention Rate</div>
          </div>
        </div>
      )}

      {/* Customer Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">👥 Customer Types</h2>
          {analytics?.customerTypes && (
            <div className="space-y-3">
              {analytics.customerTypes.map((type) => (
                <div key={type.type} className="flex justify-between items-center">
                  <span className="capitalize font-medium">{type.type} Customers</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{
                          width: `${(type.count / analytics.overview.totalCustomers) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="font-bold">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">⭐ Top Customers</h2>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.id} className="flex justify-between items-center border-b pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full text-white font-bold bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                      <div className="text-sm text-gray-500">{customer.totalOrders} orders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${customer.totalSpent.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{customer.loyaltyPoints} pts</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No customers found</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-purple-600 text-white p-6 rounded-lg font-semibold text-lg hover:bg-purple-700 touch-action-manipulation">
          👥 Manage Customers
        </button>
        <button className="bg-green-600 text-white p-6 rounded-lg font-semibold text-lg hover:bg-green-700 touch-action-manipulation">
          🎁 Loyalty Programs
        </button>
        <button className="bg-blue-600 text-white p-6 rounded-lg font-semibold text-lg hover:bg-blue-700 touch-action-manipulation">
          📧 Send Communications
        </button>
        <button className="bg-orange-600 text-white p-6 rounded-lg font-semibold text-lg hover:bg-orange-700 touch-action-manipulation">
          📊 Advanced Reports
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">🕐 Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="text-green-600">💰</div>
            <div>
              <div className="font-medium">New sale completed</div>
              <div className="text-sm text-gray-500">$45.99 - John Smith</div>
            </div>
            <div className="text-sm text-gray-500 ml-auto">2 hours ago</div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-600">👤</div>
            <div>
              <div className="font-medium">New customer registered</div>
              <div className="text-sm text-gray-500">Sarah Johnson joined the loyalty program</div>
            </div>
            <div className="text-sm text-gray-500 ml-auto">1 day ago</div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="text-purple-600">🎁</div>
            <div>
              <div className="font-medium">Loyalty points redeemed</div>
              <div className="text-sm text-gray-500">50 points for $2.50 discount</div>
            </div>
            <div className="text-sm text-gray-500 ml-auto">2 days ago</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrmDashboard;
