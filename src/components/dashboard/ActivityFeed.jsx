import React from 'react';
import {
  Clock,
  DollarSign,
  Package,
  Users,
  ChefHat,
  Pill,
  Store,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Truck,
  CreditCard,
  Star
} from 'lucide-react';

const ActivityFeed = ({ activities, loading }) => {
  const getActivityIcon = (activity) => {
    const icons = {
      sale: ShoppingCart,
      inventory: Package,
      customer: Users,
      delivery: Truck,
      payment: CreditCard,
      loyalty: Star,
      alert: AlertTriangle,
      trend: TrendingUp
    };
    return icons[activity.type] || Clock;
  };

  const getActivityColor = (activity) => {
    const colors = {
      sale: 'bg-green-100 text-green-800',
      inventory: 'bg-blue-100 text-blue-800',
      customer: 'bg-purple-100 text-purple-800',
      delivery: 'bg-orange-100 text-orange-800',
      payment: 'bg-red-100 text-red-800',
      loyalty: 'bg-yellow-100 text-yellow-800',
      alert: 'bg-red-100 text-red-800',
      trend: 'bg-teal-100 text-teal-800'
    };
    return colors[activity.type] || 'bg-gray-100 text-gray-800';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now - activityTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Activity Feed</h2>
          <div className="animate-pulse">
            <div className="w-12 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Clock className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Activity Feed</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 font-medium">LIVE</span>
        </div>
      </div>

      {activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.slice(0, 8).map((activity, index) => {
            const IconComp = getActivityIcon(activity);
            const timeAgo = formatTimeAgo(new Date(Date.now() - index * 5 * 60 * 1000)); // Mock timestamps

            return (
              <div key={activity.id || index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${getActivityColor(activity)} flex-shrink-0`}>
                  <IconComp className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.user}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {activity.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {timeAgo}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.action}
                  </p>
                  {activity.amount && (
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {activity.amount}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No recent activities</p>
        </div>
      )}

      {/* View More Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800">
          View All Activities →
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
