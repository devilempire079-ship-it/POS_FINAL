import React from 'react';
import {
  AlertTriangle,
  Info,
  X,
  CheckCircle,
  Clock,
  TrendingUp,
  Package,
  CreditCard,
  Users,
  ChefHat,
  Pill,
  Store
} from 'lucide-react';

const AlertSystem = ({ alerts, dismissAlert }) => {
  // Priority colors and icons mappings
  const getAlertConfig = (type, priority) => {
    const configs = {
      error: {
        icon: AlertTriangle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        buttonColor: 'bg-red-100 hover:bg-red-200'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        buttonColor: 'bg-yellow-100 hover:bg-yellow-200'
      },
      success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        buttonColor: 'bg-green-100 hover:bg-green-200'
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        buttonColor: 'bg-blue-100 hover:bg-blue-200'
      }
    };

    return configs[type] || configs.warning;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInMs = now - alertTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  const getBusinessIcon = (businessType) => {
    const businessIconMap = {
      restaurant: ChefHat,
      pharmacy: Pill,
      retail: Store
    };
    return businessIconMap[businessType] || AlertTriangle;
  };

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Alert Center</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 font-medium">LIVE</span>
        </div>
      </div>

      {/* Alert Count Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {alerts.filter(a => a.priority === 'high' && !a.dismissed).length}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">High Priority</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {alerts.filter(a => a.priority === 'medium' && !a.dismissed).length}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Medium</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {alerts.filter(a => a.type === 'info' && !a.dismissed).length}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Info</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {alerts.filter(a => a.type === 'success' && !a.dismissed).length}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Resolved</div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="space-y-4">
        {alerts
          .filter(alert => !alert.dismissed)
          .slice(0, 10) // Show only last 10 alerts
          .map((alert) => {
            const config = getAlertConfig(alert.type, alert.priority);
            const IconComp = config.icon;

            return (
              <div
                key={alert.id}
                className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <IconComp className={`h-5 w-5 ${config.textColor}`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-medium ${config.textColor}`}>
                          {alert.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(alert.priority)}`}>
                          {alert.priority}
                        </span>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className={`${config.buttonColor} p-1 rounded-full`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className={`mt-1 text-sm ${config.textColor} opacity-90`}>
                      {alert.message}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(alert.timestamp)}
                      </div>
                      {alert.actionable && (
                        <button className="text-xs font-medium text-blue-600 hover:text-blue-800 underline">
                          Fix Now →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Show "View All" button if there are more alerts */}
      {alerts.length > 5 && (
        <div className="mt-6 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
            View All Alerts →
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;
