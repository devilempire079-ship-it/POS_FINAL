import React, { useState, useEffect } from 'react';
import {
  Pill,
  AlertTriangle,
  Shield,
  Clock,
  Package,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  FileText,
  Search,
  RefreshCw,
  Settings,
  Thermometer,
  TestTube
} from 'lucide-react';

const PharmacyDashboard = () => {
  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'received',
      description: 'Received Oxycodone 30mg, Lot #A458972',
      timestamp: '2 hours ago',
      critical: true
    },
    {
      id: 2,
      type: 'dispensed',
      description: 'Dispensed Metformin 500mg to John Smith',
      timestamp: '3 hours ago',
      critical: false
    },
    {
      id: 3,
      type: 'expiring',
      description: 'Insulin expiring in 7 days',
      timestamp: '1 day ago',
      critical: true
    },
    {
      id: 4,
      type: 'low-stock',
      description: 'Amoxicillin 500mg low stock',
      timestamp: '2 days ago',
      critical: true
    }
  ]);

  const [expiringDrugs] = useState([
    { name: 'Insulin Regular', daysUntilExpiry: 7, quantity: 45 },
    { name: 'Insulin NPH', daysUntilExpiry: 5, quantity: 23 },
    { name: 'Warfarin 5mg', daysUntilExpiry: 3, quantity: 67 },
    { name: 'Fentanyl Patches', daysUntilExpiry: 10, quantity: 12 }
  ]);

  const [lowStockDrugs] = useState([
    { name: 'Amoxicillin 500mg', currentStock: 5, minStock: 20 },
    { name: 'Lisinopril 10mg', currentStock: 3, minStock: 25 },
    { name: 'Metformin 1000mg', currentStock: 8, minStock: 30 },
    { name: 'Aspirin 81mg', currentStock: 12, minStock: 50 }
  ]);

  return (
    <div className="space-y-6">
      {/* Top Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">DEA Compliance</p>
              <p className="text-lg font-bold text-green-600">Active</p>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Temperature Control</p>
              <p className="text-lg font-bold text-blue-600">Normal</p>
            </div>
            <Thermometer className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Last Safety Audit</p>
              <p className="text-lg font-bold text-purple-600">2 days</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-800">Quality Checks</p>
              <p className="text-lg font-bold text-indigo-600">Passed</p>
            </div>
            <CheckCircle className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Alerts Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg border border-red-200">
            <div className="px-6 py-4 border-b border-red-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  Critical Pharmacy Alerts
                </h3>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Expiring Drugs Alert */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Clock className="w-6 h-6 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-red-800">Drugs Expiring Soon</h4>
                    <p className="text-red-700 text-sm mb-2">4 items require immediate attention</p>
                    <div className="space-y-2">
                      {expiringDrugs.slice(0, 3).map((drug, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                          <span className="text-sm font-medium">{drug.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              drug.daysUntilExpiry <= 3 ? 'bg-red-100 text-red-800' :
                              drug.daysUntilExpiry <= 7 ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {drug.daysUntilExpiry} days
                            </span>
                            <span className="text-sm font-medium">Qty: {drug.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-3 text-sm text-red-700 hover:text-red-900 font-medium">
                      Manage Expiring Drugs →
                    </button>
                  </div>
                </div>
              </div>

              {/* Low Stock Alert */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Package className="w-6 h-6 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-orange-800">Low Stock Alerts</h4>
                    <p className="text-orange-700 text-sm mb-2">4 medications below minimum stock levels</p>
                    <div className="space-y-2">
                      {lowStockDrugs.slice(0, 3).map((drug, index) => (
                        <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                          <span className="text-sm font-medium">{drug.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {drug.currentStock}/{drug.minStock}
                            </span>
                            <span className="text-sm text-red-600 font-medium">
                              {Math.round((drug.currentStock/drug.minStock)*100)}% of target
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-3 text-sm text-orange-700 hover:text-orange-900 font-medium">
                      Reorder Now →
                    </button>
                  </div>
                </div>
              </div>

              {/* Controlled Substances Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-800">Controlled Substances Due</h4>
                    <p className="text-blue-700 text-sm mb-2">DEA Form 222 submission due in 3 days</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>Schedule II: 3 items (45 units)</span>
                      <span>Schedule III: 5 items (120 units)</span>
                      <span>Schedule IV: 2 items (30 units)</span>
                    </div>
                    <button className="mt-3 text-sm text-blue-700 hover:text-blue-900 font-medium">
                      Prepare DEA Form 222 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 text-gray-600 mr-2" />
                Recent Activity
              </h3>
              <button className="text-gray-600 hover:text-gray-800">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`mt-1 w-3 h-3 rounded-full ${
                    activity.critical ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Full Activity Log →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button className="flex items-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
            <Pill className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Add Drug</span>
          </button>

          <button className="flex items-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <Search className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Lookup NDC</span>
          </button>

          <button className="flex items-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Check Expiry</span>
          </button>

          <button className="flex items-center space-x-2 p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">DEA Audit</span>
          </button>

          <button className="flex items-center space-x-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
            <TestTube className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Compounding</span>
          </button>

          <button className="flex items-center space-x-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Reports</span>
          </button>
        </div>
      </div>

      {/* Compliance Requirements */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold mb-2 flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              Pharmacy Compliance Dashboard
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">DEA License</span>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-lg font-bold">Valid</div>
              </div>

              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">State License</span>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-lg font-bold">Valid</div>
              </div>

              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Inspection</span>
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-lg font-bold">45 Days</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90 mb-2">Last Updated:</p>
            <p className="font-bold">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
