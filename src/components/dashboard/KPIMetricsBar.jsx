import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  UserCheck,
  Timer,
  ChefHat,
  Pill,
  Store,
  Clock
} from 'lucide-react';

const KPIMetricsBar = ({ metrics, formatCurrency, formatNumber, businessType, loading }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 p-6 mb-8 rounded-2xl shadow-xl">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4">
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getKpiIcon = () => {
    switch (businessType) {
      case 'restaurant':
        return <ChefHat className="h-6 w-6 text-white" />;
      case 'pharmacy':
        return <Pill className="h-6 w-6 text-white" />;
      case 'retail':
        return <Store className="h-6 w-6 text-white" />;
      default:
        return <DollarSign className="h-6 w-6 text-white" />;
    }
  };

  const getKPIs = () => {
    switch (businessType) {
      case 'restaurant':
        return [
          {
            title: "Today's Revenue",
            value: metrics.sales.today.value,
            change: metrics.sales.today.change,
            changeValue: metrics.sales.today.changeValue,
            icon: <DollarSign className="h-5 w-5" />,
            color: 'from-emerald-500 to-teal-600',
            trend: metrics.sales.today.trend
          },
          {
            title: 'Active Tables',
            value: `${metrics.operations.pendingOrders.kitchen}/12`,
            change: '+2',
            changeValue: 2,
            icon: <ChefHat className="h-5 w-5" />,
            color: 'from-orange-500 to-red-500',
            trend: 'up'
          },
          {
            title: 'Avg Service Time',
            value: metrics.operations.averageServiceTime,
            change: '-8%',
            changeValue: -0.34,
            icon: <Timer className="h-5 w-5" />,
            color: 'from-blue-500 to-cyan-500',
            trend: 'up'
          },
          {
            title: 'Kitchen Efficiency',
            value: '94%',
            change: '+3%',
            changeValue: 2.8,
            icon: <ShoppingCart className="h-5 w-5" />,
            color: 'from-purple-500 to-pink-500',
            trend: 'up'
          },
          {
            title: 'Customer Satisfaction',
            value: '4.7/5',
            change: '+6%',
            changeValue: 0.28,
            icon: <UserCheck className="h-5 w-5" />,
            color: 'from-green-500 to-emerald-600',
            trend: 'up'
          }
        ];

      case 'pharmacy':
        return [
          {
            title: "Today's Revenue",
            value: formatCurrency(15420),
            change: '+18%',
            changeValue: 2360,
            icon: <DollarSign className="h-5 w-5" />,
            color: 'from-blue-500 to-blue-700',
            trend: 'up'
          },
          {
            title: 'Prescriptions Filled',
            value: '87 Today',
            change: '+12',
            changeValue: 12,
            icon: <Pill className="h-5 w-5" />,
            color: 'from-green-500 to-teal-600',
            trend: 'up'
          },
          {
            title: 'Wait Time',
            value: '25 min',
            change: '-15%',
            changeValue: -5,
            icon: <Clock className="h-5 w-5" />,
            color: 'from-orange-500 to-red-500',
            trend: 'up'
          },
          {
            title: 'Insurance Approvals',
            value: '94%',
            change: '+7%',
            changeValue: 6,
            icon: <UserCheck className="h-5 w-5" />,
            color: 'from-purple-500 to-pink-500',
            trend: 'up'
          },
          {
            title: 'Refills Due',
            value: '18 Today',
            change: '-3',
            changeValue: -3,
            icon: <AlertTriangle className="h-5 w-5" />,
            color: 'from-yellow-500 to-orange-500',
            trend: 'up'
          }
        ];

      case 'retail':
        return [
          {
            title: "Today's Revenue",
            value: formatCurrency(18450),
            change: '+22%',
            changeValue: 3290,
            icon: <DollarSign className="h-5 w-5" />,
            color: 'from-purple-500 to-pink-600',
            trend: 'up'
          },
          {
            title: 'Unique Customers',
            value: formatNumber(metrics.customers.todayUnique),
            change: '+15%',
            changeValue: 11,
            icon: <Users className="h-5 w-5" />,
            color: 'from-blue-500 to-cyan-500',
            trend: 'up'
          },
          {
            title: 'Top Category',
            value: 'Electronics',
            change: '$3,450',
            changeValue: 3450,
            icon: <TrendingUp className="h-5 w-5" />,
            color: 'from-emerald-500 to-green-600',
            trend: 'up'
          },
          {
            title: 'Conversion Rate',
            value: '67%',
            change: '+5%',
            changeValue: 3,
            icon: <ShoppingCart className="h-5 w-5" />,
            color: 'from-orange-500 to-red-500',
            trend: 'up'
          },
          {
            title: 'Repeat Customers',
            value: `${metrics.customers.repeatCustomerRate}%`,
            change: '+2%',
            changeValue: 1.6,
            icon: <UserCheck className="h-5 w-5" />,
            color: 'from-indigo-500 to-purple-500',
            trend: 'up'
          }
        ];

      default:
        return [
          {
            title: "Today's Revenue",
            value: metrics.sales.today.value,
            change: metrics.sales.today.change,
            changeValue: metrics.sales.today.changeValue,
            icon: <DollarSign className="h-5 w-5" />,
            color: 'from-emerald-500 to-teal-600',
            trend: 'up'
          },
          {
            title: 'Transactions',
            value: formatNumber(metrics.transactions.today),
            change: `+${Math.floor(metrics.transactions.today * 0.08)}`,
            changeValue: Math.floor(metrics.transactions.today * 0.08),
            icon: <ShoppingCart className="h-5 w-5" />,
            color: 'from-blue-500 to-cyan-500',
            trend: 'up'
          },
          {
            title: 'Unique Customers',
            value: formatNumber(metrics.customers.todayUnique),
            change: `+${Math.floor(metrics.customers.todayUnique * 0.12)}`,
            changeValue: Math.floor(metrics.customers.todayUnique * 0.12),
            icon: <Users className="h-5 w-5" />,
            color: 'from-purple-500 to-pink-500',
            trend: 'up'
          },
          {
            title: 'Avg Ticket',
            value: formatCurrency(metrics.transactions.averageTicket),
            change: '+3.2%',
            changeValue: metrics.transactions.averageTicket * 0.032,
            icon: <TrendingUp className="h-5 w-5" />,
            color: 'from-orange-500 to-yellow-500',
            trend: 'up'
          },
          {
            title: 'Low Stock Items',
            value: formatNumber(metrics.inventory.lowStockItems),
            change: `+${Math.floor(metrics.inventory.lowStockItems * 0.15)}`,
            changeValue: Math.floor(metrics.inventory.lowStockItems * 0.15),
            icon: <AlertTriangle className="h-5 w-5" />,
            color: 'from-red-500 to-pink-600',
            trend: 'down'
          }
        ];
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 p-6 mb-8 rounded-2xl shadow-xl relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Header with business type indicator */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          {getKpiIcon()}
          <div>
            <h2 className="text-2xl font-bold text-white">Business Intelligence Dashboard</h2>
            <p className="text-blue-100 text-sm">Real-time metrics & insights</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-medium">LIVE</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
        {getKPIs().map((kpi, index) => (
          <div key={index} className={`bg-gradient-to-br ${kpi.color} rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-lg">
                {React.cloneElement(kpi.icon, { className: "h-4 w-4 text-white" })}
              </div>
              <div className={`flex items-center space-x-1 text-xs font-medium ${
                kpi.trend === 'up' ? 'text-green-200' : 'text-red-200'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{kpi.change}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-white/80 text-xs font-medium uppercase tracking-wide">
                {kpi.title}
              </p>
              <p className="text-2xl font-bold text-white">
                {kpi.value}
              </p>
              <div className={`text-xs font-medium ${
                kpi.trend === 'up' ? 'text-green-200' : 'text-red-200'
              }`}>
                {kpi.trend === 'up' ? '+' : ''}
                {typeof kpi.changeValue === 'number' && kpi.changeValue !== parseInt(kpi.changeValue)
                  ? kpi.changeValue.toFixed(2)
                  : kpi.changeValue} from yesterday
              </div>
            </div>

            {/* Mini sparkline effect */}
            <div className="mt-3 flex items-end space-x-1 h-4 opacity-60">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/40 rounded-sm flex-1"
                  style={{ height: `${Math.random() * 100}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Business Performance Indicator */}
      <div className="mt-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="text-white text-sm">
            <span className="font-medium">Performance Score:</span>
            <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
              {businessType === 'restaurant' ? '94/100' :
               businessType === 'pharmacy' ? '96/100' :
               businessType === 'retail' ? '92/100' : '89/100'}
            </span>
          </div>
          <div className="w-32 bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${businessType === 'restaurant' ? '94%' :
                                   businessType === 'pharmacy' ? '96%' :
                                   businessType === 'retail' ? '92%' : '89%'}` }}
            />
          </div>
        </div>

        <div className="text-white/70 text-xs">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default KPIMetricsBar;
