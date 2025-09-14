import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  Clock,
  Bell,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign
} from 'lucide-react';

const StockAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [alertFilter, setAlertFilter] = useState('all');
  const [settings, setSettings] = useState({
    lowStockThreshold: 10,
    expiryWarningDays: 30,
    autoReorderEnabled: true,
    emailNotifications: true,
    smsAlerts: false
  });

  // Mock alerts data
  useEffect(() => {
    const mockAlerts = [
      {
        id: 1,
        type: 'low_stock',
        priority: 'high',
        productName: 'Organic Milk 1L',
        currentStock: 5,
        minStock: 8,
        supplier: 'Farm Fresh Dairy',
        location: 'B-2-01',
        createdAt: new Date('2025-09-02T10:00:00'),
        acknowledged: false
      },
      {
        id: 2,
        type: 'expiring_soon',
        priority: 'medium',
        productName: 'Whole Wheat Bread',
        currentStock: 15,
        expiryDate: new Date('2025-09-15'),
        daysUntilExpiry: 13,
        supplier: 'Local Bakery Co',
        location: 'C-3-01',
        createdAt: new Date('2025-09-01T14:30:00'),
        acknowledged: false
      },
      {
        id: 3,
        type: 'out_of_stock',
        priority: 'critical',
        productName: 'Frozen Greek Yogurt',
        currentStock: 0,
        minStock: 2,
        supplier: 'Greek Yogurt Corp',
        location: 'F-6-01',
        createdAt: new Date('2025-08-30T09:15:00'),
        acknowledged: true
      },
      {
        id: 4,
        type: 'excess_stock',
        priority: 'low',
        productName: 'Organic Bananas',
        currentStock: 150,
        idealStock: 80,
        supplier: 'Organic Farms',
        location: 'E-5-01',
        createdAt: new Date('2025-08-28T16:45:00'),
        acknowledged: false
      },
      {
        id: 5,
        type: 'slow_moving',
        priority: 'medium',
        productName: 'Chocolate Heaven Pack',
        daysSinceLastSale: 30,
        lastSaleDate: new Date('2025-08-03'),
        supplier: 'Chocolate Heaven',
        location: 'D-4-01',
        createdAt: new Date('2025-09-01T11:20:00'),
        acknowledged: false
      }
    ];

    setAlerts(mockAlerts);
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'low_stock': return <TrendingDown className="h-5 w-5 text-orange-500" />;
      case 'expiring_soon': return <Clock className="h-5 w-5 text-red-500" />;
      case 'out_of_stock': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'excess_stock': return <Package className="h-5 w-5 text-blue-500" />;
      case 'slow_moving': return <Calendar className="h-5 w-5 text-yellow-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getAlertTypeName = (type) => {
    const names = {
      low_stock: 'Low Stock',
      expiring_soon: 'Expiring Soon',
      out_of_stock: 'Out of Stock',
      excess_stock: 'Excess Stock',
      slow_moving: 'Slow Moving'
    };
    return names[type] || type;
  };

  const handleAcknowledgeAlert = (alertId) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const filteredAlerts = alerts.filter(alert => {
    if (alertFilter === 'all') return true;
    if (alertFilter === 'unacknowledged') return !alert.acknowledged;
    if (alertFilter === 'critical') return alert.priority === 'critical' || alert.priority === 'high';
    return alert.type === alertFilter;
  });

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;
  const criticalAlertsCount = alerts.filter(alert => alert.priority === 'critical').length;

  const suggestReorder = (productName) => {
    alert(`Suggested reorder for ${productName}: Weekly consumption tracking recommended`);
  };

  const acknowledgeAll = () => {
    setAlerts(alerts.map(alert => ({ ...alert, acknowledged: true })));
    alert('All alerts acknowledged!');
  };

  const handleSettingChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: typeof settings[field] === 'boolean' ? !settings[field] : value
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Alerts & Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor inventory levels and receive automated alerts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {criticalAlertsCount > 0 && (
            <div className="flex items-center space-x-2 bg-red-100 px-3 py-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                {criticalAlertsCount} Critical Alert(s)
              </span>
            </div>
          )}
          {unacknowledgedCount > 0 && (
            <div className="flex items-center space-x-2 bg-orange-100 px-3 py-2 rounded-lg">
              <Bell className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                {unacknowledgedCount} New Alert(s)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.type === 'low_stock' && !a.acknowledged).length}
              </div>
              <div className="text-sm text-gray-600">Low Stock Items</div>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.type === 'expiring_soon' && !a.acknowledged).length}
              </div>
              <div className="text-sm text-gray-600">Expiring Soon</div>
            </div>
            <Clock className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.type === 'out_of_stock' && !a.acknowledged).length}
              </div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {unacknowledgedCount}
              </div>
              <div className="text-sm text-gray-600">Unacknowledged</div>
            </div>
            <Bell className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <select
              value={alertFilter}
              onChange={(e) => setAlertFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Alerts</option>
              <option value="unacknowledged">Unacknowledged</option>
              <option value="critical">Critical Priority</option>
              <option value="low_stock">Low Stock</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="excess_stock">Excess Stock</option>
            </select>

            <div className="flex items-center space-x-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={alertFilter === 'unacknowledged'}
                  onChange={() => setAlertFilter(alertFilter === 'unacknowledged' ? 'all' : 'unacknowledged')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show only unacknowledged</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={acknowledgeAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
              Acknowledge All
            </button>
            <button
              onClick={() => alert('Opening alert settings...')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200 flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-lg shadow border-l-4 ${
              alert.priority === 'critical' ? 'border-l-red-500' :
              alert.priority === 'high' ? 'border-l-orange-500' :
              alert.priority === 'medium' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            } ${!alert.acknowledged ? 'bg-yellow-50' : ''}`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {alert.productName}
                      </h3>
                      {getPriorityBadge(alert.priority)}
                      {!alert.acknowledged && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                      {alert.acknowledged && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Acknowledged
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-gray-600 mb-2">
                      {getAlertTypeName(alert.type)} • {alert.supplier}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      {alert.type === 'low_stock' && (
                        <>
                          <div>Current: <span className="font-medium text-red-600">{alert.currentStock}</span></div>
                          <div>Minimum: <span className="font-medium">{alert.minStock}</span></div>
                          <div>Location: <span className="font-medium">{alert.location}</span></div>
                          <div>Status: <span className="font-medium">Needs Restock</span></div>
                        </>
                      )}
                      {alert.type === 'expiring_soon' && (
                        <>
                          <div>Expires: <span className="font-medium text-red-600">{alert.expiryDate.toLocaleDateString()}</span></div>
                          <div>Days Left: <span className="font-medium">{alert.daysUntilExpiry}</span></div>
                          <div>Stock: <span className="font-medium">{alert.currentStock}</span></div>
                          <div>Location: <span className="font-medium">{alert.location}</span></div>
                        </>
                      )}
                      {alert.type === 'out_of_stock' && (
                        <>
                          <div>Current: <span className="font-medium text-red-600">0</span></div>
                          <div>Minimum: <span className="font-medium">{alert.minStock}</span></div>
                          <div>Location: <span className="font-medium">{alert.location}</span></div>
                          <div>Status: <span className="font-medium">Emergency Restock</span></div>
                        </>
                      )}
                      {alert.type === 'excess_stock' && (
                        <>
                          <div>Current: <span className="font-medium text-blue-600">{alert.currentStock}</span></div>
                          <div>Ideal: <span className="font-medium">{alert.idealStock}</span></div>
                          <div>Overage: <span className="font-medium">{alert.currentStock - alert.idealStock}</span></div>
                          <div>Location: <span className="font-medium">{alert.location}</span></div>
                        </>
                      )}
                      {alert.type === 'slow_moving' && (
                        <>
                          <div>Last Sale: <span className="font-medium">{alert.daysSinceLastSale} days ago</span></div>
                          <div>Last Date: <span className="font-medium">{alert.lastSaleDate.toLocaleDateString()}</span></div>
                          <div>Stock: <span className="font-medium">{alert.currentStock}</span></div>
                          <div>Location: <span className="font-medium">{alert.location}</span></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {alert.createdAt.toLocaleDateString()} {alert.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition duration-200"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => alert(`View ${alert.productName} details`)}
                    className="px-3 py-1 border border-gray-300 text-sm rounded hover:bg-gray-50 transition duration-200"
                  >
                    <Eye className="h-4 w-4 inline mr-1" />
                    View
                  </button>
                  {(alert.type === 'low_stock' || alert.type === 'out_of_stock') && (
                    <button
                      onClick={() => suggestReorder(alert.productName)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-200"
                    >
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900">All clear!</h3>
            <p className="text-sm text-gray-500">
              No alerts match your current filters. All systems are running smoothly.
            </p>
            {alertFilter !== 'all' && (
              <div className="mt-4">
                <button
                  onClick={() => setAlertFilter('all')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Show all alerts
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Alert Settings Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => handleSettingChange('lowStockThreshold', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Items below this trigger alerts</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Warning Days
            </label>
            <input
              type="number"
              value={settings.expiryWarningDays}
              onChange={(e) => handleSettingChange('expiryWarningDays', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Days before expiry to alert</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-Reorder
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoReorderEnabled}
                onChange={() => handleSettingChange('autoReorderEnabled')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Enable auto-reorder</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Automatically suggest reorders</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notifications
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleSettingChange('emailNotifications')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-xs">Email alerts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.smsAlerts}
                  onChange={() => handleSettingChange('smsAlerts')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-xs">SMS alerts</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockAlerts;
