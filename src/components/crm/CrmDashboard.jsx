import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Mail,
  Phone,
  Target,
  Crown,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  Heart,
  Shield
} from 'lucide-react';
import useBusinessTypeCRM from '../../hooks/useBusinessTypeCRM';
import Customer360View from './Customer360View';

const CrmDashboard = () => {
  const { businessType, extensions, isPharmacy, isRestaurant, isRental, isRetail } = useBusinessTypeCRM();
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Get business-type-specific styling
  const getBusinessTypeStyling = () => {
    switch (businessType) {
      case 'pharmacy':
        return { color: 'green', icon: Heart, label: 'Pharmacy CRM' };
      case 'restaurant':
        return { color: 'orange', icon: Clock, label: 'Restaurant CRM' };
      case 'rental':
        return { color: 'blue', icon: Calendar, label: 'Rental CRM' };
      case 'retail':
        return { color: 'purple', icon: Target, label: 'Retail CRM' };
      default:
        return { color: 'blue', icon: Target, label: 'CRM Dashboard' };
    }
  };

  const businessStyling = getBusinessTypeStyling();

  return (
    <div className="crm-unified-dashboard">
      {/* Unified CRM Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <div className={`p-3 bg-${businessStyling.color}-100 rounded-xl`}>
            <businessStyling.icon className={`h-8 w-8 text-${businessStyling.color}-600`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{businessStyling.label}</h1>
            <p className="text-gray-600">
              Unified Customer Relationship Management •
              <span className={`font-medium text-${businessStyling.color}-600 ml-2`}>
                {businessType?.toUpperCase()} Mode
              </span>
            </p>
          </div>
        </div>

        {/* Business-Type Extensions Preview */}
        {extensions.tabs && extensions.tabs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              This business type includes additional CRM features:
            </h3>
            <div className="flex flex-wrap gap-2">
              {extensions.tabs?.map((tab) => (
                <span
                  key={tab}
                  className={`px-3 py-1 bg-${businessStyling.color}-100 text-${businessStyling.color}-700 rounded-full text-sm font-medium`}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Customer 360 Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden">
            <Customer360View
              customerId={selectedCustomer}
              onClose={() => setSelectedCustomer(null)}
            />
          </div>
        </div>
      )}

      {/* Enhanced Business-Type Dashboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <businessStyling.icon className={`h-5 w-5 mr-2 text-${businessStyling.color}-500`} />
          {businessType?.toUpperCase()} CRM Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {extensions.tabs?.slice(0, 6).map((tab, index) => (
            <div
              key={tab}
              className={`p-4 bg-${businessStyling.color}-50 border border-${businessStyling.color}-200 rounded-lg`}
            >
              <h4 className="font-medium text-gray-900">{tab}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {tab === 'Clinical Profile' ? 'Allergies, medications, vitals' :
                 tab === 'Prescriptions' ? 'Rx management & history' :
                 tab === 'Refill Reminders' ? 'Automated SMS/Whatsapp' :
                 tab === 'Medication History' ? 'Complete drug timeline' :
                 'Industry-specific features'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions for CRM */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedCustomer('demo-customer')}
            className={`flex flex-col items-center p-4 border-2 border-dashed rounded-lg hover:border-${businessStyling.color}-500 hover:bg-${businessStyling.color}-50 transition-colors`}
          >
            <Users className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">View Customer 360</span>
          </button>

          {isPharmacy && (
            <button className={`flex flex-col items-center p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors`}>
              <Calendar className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">Schedule Refills</span>
            </button>
          )}

          <button className={`flex flex-col items-center p-4 border-2 border-dashed rounded-lg hover:border-${businessStyling.color}-500 hover:bg-${businessStyling.color}-50 transition-colors`}>
            <Mail className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Send Campaign</span>
          </button>

          <button className={`flex flex-col items-center p-4 border-2 border-dashed rounded-lg hover:border-${businessStyling.color}-500 hover:bg-${businessStyling.color}-50 transition-colors`}>
            <Target className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-700">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrmDashboard;
