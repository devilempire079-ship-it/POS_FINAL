import React from 'react';
import {
  ChefHat,
  Pill,
  Store,
  Users,
  Package,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const BusinessTypeWidgets = ({ businessType, widgets, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Business Overview</h2>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const restaurantWidgets = [
    {
      title: 'Table Management',
      icon: ChefHat,
      color: 'bg-orange-100 text-orange-800',
      data: [
        { label: 'Occupied', value: '8/12 tables', status: 'normal' },
        { label: 'Avg Turnaround', value: '45 min', status: 'good' },
        { label: 'Peak Today', value: '11:00 - 14:00', status: 'info' }
      ],
      trend: '+12%'
    },
    {
      title: 'Kitchen Status',
      icon: ChefHat,
      color: 'bg-blue-100 text-blue-800',
      data: [
        { label: 'Orders Pending', value: '8 orders', status: 'warning' },
        { label: 'Avg Prep Time', value: '18 min', status: 'good' },
        { label: 'Late Orders', value: '1 today', status: 'normal' }
      ],
      trend: '-5%'
    },
    {
      title: 'Popular Items',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800',
      data: [
        { label: 'Fettuccine Alfredo', value: '23 orders', status: 'good' },
        { label: 'Grilled Salmon', value: '18 orders', status: 'good' },
        { label: 'Burger Combo', value: '15 orders', status: 'normal' }
      ],
      trend: '+15%'
    },
    {
      title: 'Staff Clocked In',
      icon: Users,
      color: 'bg-purple-100 text-purple-800',
      data: [
        { label: 'Servers', value: '6/8 present', status: 'normal' },
        { label: 'Kitchen Staff', value: '4/5 present', status: 'warning' },
        { label: 'Wait Time', value: '4.2 min', status: 'good' }
      ],
      trend: '98% on time'
    }
  ];

  const pharmacyWidgets = [
    {
      title: 'Prescription Status',
      icon: Pill,
      color: 'bg-blue-100 text-blue-800',
      data: [
        { label: 'Filled Today', value: '87 prescriptions', status: 'good' },
        { label: 'Pending Reviews', value: '12 items', status: 'warning' },
        { label: 'Wait Time', value: '25 min', status: 'normal' }
      ],
      trend: '+8%'
    },
    {
      title: 'Controlled Substances',
      icon: Package,
      color: 'bg-red-100 text-red-800',
      data: [
        { label: 'Monitored Items', value: '45 drugs', status: 'normal' },
        { label: 'Expiring Soon', value: '3 within 30 days', status: 'warning' },
        { label: 'Safety Compliance', value: '98%', status: 'good' }
      ],
      trend: '100% compliance'
    },
    {
      title: 'Insurance Claims',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      data: [
        { label: 'Pending Claims', value: '23', status: 'info' },
        { label: 'Approval Rate', value: '92%', status: 'good' },
        { label: 'Avg Processing', value: '7 min', status: 'good' }
      ],
      trend: '+3% approval'
    },
    {
      title: 'Patient Services',
      icon: Users,
      color: 'bg-purple-100 text-purple-800',
      data: [
        { label: 'Consultations Today', value: '34 allowed', status: 'good' },
        { label: 'Refill Requests', value: '18 pending', status: 'normal' },
        { label: 'Vaccination Today', value: '12 given', status: 'good' }
      ],
      trend: '+12%'
    }
  ];

  const retailWidgets = [
    {
      title: 'Category Performance',
      icon: Store,
      color: 'bg-blue-100 text-blue-800',
      data: [
        { label: 'Electronics', value: '$3,450 (+22%)', status: 'good' },
        { label: 'Clothing', value: '$2,890 (+8%)', status: 'good' },
        { label: 'Home Goods', value: '$1,950 (-3%)', status: 'warning' }
      ],
      trend: '+12.5%'
    },
    {
      title: 'Inventory Health',
      icon: Package,
      color: 'bg-orange-100 text-orange-800',
      data: [
        { label: 'Low Stock Items', value: '24', status: 'warning' },
        { label: 'Out of Stock', value: '3 items', status: 'critical' },
        { label: 'Restock Needed', value: '12SKU', status: 'warning' }
      ],
      trend: '-8%'
    },
    {
      title: 'Promotions',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800',
      data: [
        { label: 'Back to School', value: 'Active - 7d', status: 'good' },
        { label: 'Clearance Sale', value: '$12K generated', status: 'good' },
        { label: 'Next Promotion', value: 'Black Friday', status: 'normal' }
      ],
      trend: '+35% sales'
    },
    {
      title: 'Customer Flow',
      icon: Users,
      color: 'bg-purple-100 text-purple-800',
      data: [
        { label: 'Avg Basket Size', value: '$67.50', status: 'good' },
        { label: 'Peak Hours', value: '12-3 PM', status: 'info' },
        { label: 'Conversion Rate', value: '67%', status: 'good' }
      ],
      trend: '+5%'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      good: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600',
      normal: 'text-gray-600',
      info: 'text-blue-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getWidgets = () => {
    switch (businessType) {
      case 'restaurant':
        return restaurantWidgets;
      case 'pharmacy':
        return pharmacyWidgets;
      case 'retail':
        return retailWidgets;
      default:
        return restaurantWidgets; // fallback
    }
  };

  const businessTitle = {
    restaurant: 'Restaurant Operations',
    pharmacy: 'Pharmacy Operations',
    retail: 'Retail Operations'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {businessTitle[businessType] || 'Business Operations'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getWidgets().map((widget, index) => {
          const IconComp = widget.icon;
          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${widget.color}`}>
                  <IconComp className="h-5 w-5" />
                </div>
                {widget.trend && (
                  <span className="text-xs font-medium text-green-600">
                    {widget.trend}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {widget.title}
              </h3>

              <div className="space-y-2">
                {widget.data.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{item.label}</span>
                    <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessTypeWidgets;
