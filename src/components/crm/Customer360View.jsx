import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Gift,
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Navigation,
  Activity
} from 'lucide-react';
import useBusinessTypeCRM from '../../hooks/useBusinessTypeCRM';
import RefillScheduler from './pharmacy/RefillScheduler';
import ClinicalProfile from './pharmacy/ClinicalProfile';
import CrmDashboard from './CrmDashboard';
import api from '../../services/api';

const Customer360View = ({ customerId, onClose }) => {
  const { businessType, extensions, isPharmacy, loading: typeLoading } = useBusinessTypeCRM();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/customers/${customerId}`);

      // Get full 360 data including sales, loyalty, etc.
      const [salesHistory, loyaltyData] = await Promise.all([
        api.get(`/sales?customerId=${customerId}&limit=10`),
        api.get(`/loyalty/transactions?customerId=${customerId}&limit=5`)
      ]);

      setCustomer({
        ...data,
        salesHistory: salesHistory.data,
        loyalty: loyaltyData.data
      });

      // Generate recent activity from various sources
      const activity = [
        ...(data.loyaltyTransactions || []).map(tx => ({
          id: `loyalty-${tx.id}`,
          type: 'loyalty',
          message: `${tx.type === 'earned' ? 'Earned' : 'Redeemed'} ${Math.abs(tx.points)} points`,
          timestamp: new Date(tx.createdAt),
          icon: Gift,
          color: 'purple'
        })),
        ...(salesHistory.data || []).slice(0, 5).map(sale => ({
          id: `sale-${sale.id}`,
          type: 'purchase',
          message: `Purchased items worth $${sale.totalAmount}`,
          timestamp: new Date(sale.date),
          icon: ShoppingBag,
          color: 'green'
        }))
      ].sort((a, b) => b.timestamp - a.timestamp);

      setRecentActivity(activity);

    } catch (error) {
      console.error('Failed to load customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (typeLoading || loading) {
    return (
      <div className="customer-360-view-loading flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Loading customer data...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-360-view-error text-center p-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Not Found</h3>
        <p className="text-gray-600">Unable to load customer information.</p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  // Define core tabs (available to all business types)
  const coreTabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      content: <ProfileTab customer={customer} />
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: DollarSign,
      content: <TransactionsTab customer={customer} />
    },
    {
      id: 'loyalty',
      label: 'Loyalty & Rewards',
      icon: Gift,
      content: <LoyaltyTab customer={customer} />
    },
    {
      id: 'activity',
      label: 'Activity Timeline',
      icon: Activity,
      content: <ActivityTab activities={recentActivity} />
    }
  ];

  // Add business-type-specific tabs
  const businessSpecificTabs = [];

  if (isPharmacy) {
    businessSpecificTabs.push(
      {
        id: 'clinical-profile',
        label: 'Clinical Profile',
        icon: UserIcon,
        content: (
          <ClinicalProfile
            customer={customer}
            onProfileUpdated={(profile) => {
              console.log('Clinical profile updated:', profile);
              // Refresh customer data if needed
            }}
          />
        )
      },
      {
        id: 'prescriptions',
        label: 'Prescriptions',
        icon: CheckCircle,
        content: (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Prescription History</h3>
            <p className="text-gray-600">Detailed prescription tracking coming soon...</p>
          </div>
        )
      },
      {
        id: 'refill-reminders',
        label: 'Refill Scheduler',
        icon: Clock,
        content: (
          <RefillScheduler
            customer={customer}
            onRefillScheduled={(prescription, channel, remindDate) => {
              console.log('Refill scheduled:', prescription, channel, remindDate);
              // Add to activity timeline
            }}
          />
        )
      }
    );
  }

  // Future tabs for other business types can be added here
  // if (isRestaurant) { ... }
  // if (isRental) { ... }
  // if (isRetail) { ... }

  const allTabs = [...coreTabs, ...businessSpecificTabs];

  const activeTabData = allTabs.find(tab => tab.id === activeTab) || allTabs[0];

  return (
    <div className="customer-360-view h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {customer.firstName} {customer.lastName}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                {customer.email || 'No email'}
              </span>
              <span className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {customer.phone || 'No phone'}
              </span>
              {customer.loyaltyTier && (
                <span className="flex items-center text-purple-600 font-medium">
                  <Gift className="h-4 w-4 mr-1" />
                  {customer.loyaltyTier.name} Tier • {customer.loyaltyPoints || 0} points
                </span>
              )}
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
            Customer Details
          </h3>

          {/* Key Stats */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="text-sm font-semibold text-gray-900">
                {customer.salesHistory?.length || 0}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lifetime Value</span>
              <span className="text-sm font-semibold text-green-600">
                ${customer.totalSpent?.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Order Value</span>
              <span className="text-sm font-semibold text-blue-600">
                ${customer.averageOrderValue?.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Visit</span>
              <span className="text-sm font-semibold text-gray-900">
                {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-2">
              Quick Actions
            </h4>

            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Mail className="h-4 w-4" />
              <span>Send Email</span>
            </button>

            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="h-4 w-4" />
              <span>Send SMS</span>
            </button>

            <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Calendar className="h-4 w-4" />
              <span>Create Appointment</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <nav className="flex space-x-1 overflow-x-auto">
              {allTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTabData?.content || (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Content Not Available</h3>
                <p className="text-gray-600">This feature is coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Core Tab Components
const ProfileTab = ({ customer }) => (
  <div className="space-y-6">
    {/* Contact Information */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
        Contact Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{customer.email || 'Not provided'}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{customer.phone || 'Not provided'}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <span className="text-sm">
            {customer.dateOfBirth ? new Date(customer.dateOfBirth).toLocaleDateString() : 'Not provided'}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
          <span className="text-sm">
            {new Date(customer.registrationDate || customer.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>

    {/* Preferences & Settings */}
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Payment Method</label>
          <span className="text-sm capitalize">
            {customer.preferredPaymentMethod || 'Not specified'}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
          <span className="text-sm capitalize">
            {customer.customerType || 'Regular'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const TransactionsTab = ({ customer }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <DollarSign className="h-5 w-5 mr-2 text-green-500" />
      Transaction History
    </h3>

    {(!customer.salesHistory || customer.salesHistory.length === 0) ? (
      <div className="text-center py-8 text-gray-500">
        <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No transactions found</p>
      </div>
    ) : (
      <div className="space-y-3">
        {customer.salesHistory.map((sale) => (
          <div key={sale.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Order #{sale.id.substring(0, 8)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(sale.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  ${sale.totalAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 capitalize">
                  {sale.paymentType?.replace('_', ' ') || 'Unknown'}
                </p>
              </div>
            </div>

            {sale.note && (
              <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {sale.note}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const LoyaltyTab = ({ customer }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Gift className="h-5 w-5 mr-2 text-purple-500" />
      Loyalty Program
    </h3>

    {/* Current Tier & Points */}
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {customer.loyaltyPoints || 0}
          </div>
          <div className="text-sm text-gray-600">Current Points</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {customer.loyaltyTier?.name || 'Basic'}
          </div>
          <div className="text-sm text-gray-600">Current Tier</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {customer.totalOrders || 0}
          </div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
      </div>
    </div>

    {/* Loyalty Transactions */}
    <div className="bg-white rounded-lg shadow p-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">Recent Points Activity</h4>

      <div className="space-y-3">
        {(!customer.loyaltyTransactions || customer.loyaltyTransactions.length === 0) ? (
          <p className="text-gray-500 italic">No loyalty activity yet</p>
        ) : (
          customer.loyaltyTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {tx.type === 'earned' ? 'Earned' : 'Redeemed'} {Math.abs(tx.points)} points
                </p>
                <p className="text-sm text-gray-600">{tx.reason}</p>
                <p className="text-xs text-gray-500">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                tx.type === 'earned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {tx.type}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const ActivityTab = ({ activities }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Activity className="h-5 w-5 mr-2 text-blue-500" />
      Activity Timeline
    </h3>

    {activities.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No recent activity</p>
      </div>
    ) : (
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className={`p-2 rounded-full bg-${activity.color}-100 flex-shrink-0`}>
                <Icon className={`h-4 w-4 text-${activity.color}-600`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.message}</p>
                <p className="text-sm text-gray-600">
                  {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export default Customer360View;
