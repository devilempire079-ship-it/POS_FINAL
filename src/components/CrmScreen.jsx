import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Crown,
  Mail,
  TrendingUp
} from 'lucide-react';

import CustomerQuickSearch from './crm/CustomerQuickSearch';
import EnhancedCustomerCards from './crm/EnhancedCustomerCards';
import InsuranceManagement from './crm/pharmacy/InsuranceManagement';
import MedicalHistory from './crm/pharmacy/MedicalHistory';
import PriorAuthorization from './crm/pharmacy/PriorAuthorization';
import PatientDemographics from './crm/pharmacy/PatientDemographics';
import ClinicalProfile from './crm/pharmacy/ClinicalProfile';
import RefillScheduler from './crm/pharmacy/RefillScheduler';
import TierManagement from './crm/TierManagement';
import LoyaltyPointsDisplay from './crm/LoyaltyPointsDisplay';

const CrmScreen = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock customer data
  useEffect(() => {
    const mockCustomers = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        points: 250,
        spent: '$485.50'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1-555-0124',
        points: 1750,
        spent: '$1,234.75'
      },
      {
        id: 3,
        name: 'Mike Davis',
        email: 'mike.davis@email.com',
        phone: '+1-555-0125',
        points: 75,
        spent: '$124.20'
      }
    ];

    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CRM data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple CRM Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Customer Relationship Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your customer data and relationships</p>
          </div>
          <div className="flex space-x-3">
            <div className="text-center px-4 py-2 bg-green-100 rounded-lg">
              <div className="text-lg font-semibold text-green-800">
                {customers.filter(c => c.points > 500).length}
              </div>
              <div className="text-xs text-green-600">VIP Customers</div>
            </div>
            <div className="text-center px-4 py-2 bg-blue-100 rounded-lg">
              <div className="text-lg font-semibold text-blue-800">{customers.length}</div>
              <div className="text-xs text-blue-600">Total Customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Navigation */}
      <div className="bg-white border-b border-gray-200 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', active: activeTab === 'dashboard' },
            { id: 'customers', label: 'Customers', active: activeTab === 'customers' },
            { id: 'loyalty', label: 'Loyalty Program', active: activeTab === 'loyalty' },
            { id: 'communications', label: 'Communications', active: activeTab === 'communications' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab.active
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{customers.length}</div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{customers.filter(c => c.points > 500).length}</div>
                <div className="text-sm text-gray-600">VIP Customers</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{customers.reduce((sum, c) => sum + c.points, 0)}</div>
                <div className="text-sm text-gray-600">Total Loyalty Points</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  ${customers.reduce((sum, c) => sum + parseFloat(c.spent.replace('$', '').replace(',', '')), 0).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Revenue</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">VIP Customers</h3>
                <p className="text-sm text-gray-600">High-value customers requiring special attention</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customers.filter(c => c.points > 500).map(customer => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">{customer.points} points</div>
                        <div className="text-sm text-gray-600">{customer.spent}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Patient Management</h2>
                <p className="text-gray-600">Comprehensive patient profiles and clinical information</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Add Patient</span>
              </button>
            </div>

            {/* Enhanced Patient Cards - SAFE NEW VERSION ENABLED ✅ */}
            {customers.map((customer) => (
              <EnhancedCustomerCards
                key={customer.id}
                customer={customer || {}}
                onSelect={(selectedCustomer) => {
                  console.log('Selected patient:', selectedCustomer);
                }}
                onQuickAction={(action, patient) => {
                  console.log('Quick action:', action, 'for patient:', patient);
                }}
              />
            ))}
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Advanced Loyalty Management</h2>
                <p className="text-gray-600 mt-1">Configure loyalty tiers, track points, and manage customer rewards</p>
              </div>
              <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 shadow-lg">
                Export Loyalty Data
              </button>
            </div>

            {/* Live Points Display Demo using Sarah Johnson (VIP customer) */}
            <LoyaltyPointsDisplay
              customer={{
                id: 2,
                firstName: 'Sarah',
                lastName: 'Johnson',
                loyaltyPoints: 1750,
                loyaltyTier: 'Silver Elite',
                totalSpent: '$1,234.75'
              }}
              usedPoints={0}
              onPointsRedeemed={(amount, points) => {
                console.log('Points redeemed:', {amount, points});
                // Add to customer activity logs
              }}
            />

            {/* Enhanced Loyalty Management Section */}
            <div className="bg-white rounded-2xl shadow-xl">
              <TierManagement />
            </div>

            {/* Loyalty Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Monthly Active Users</h3>
                <p className="text-3xl font-bold text-purple-700">247</p>
                <span className="text-sm text-purple-600">+12% from last month</span>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Average Points Earned</h3>
                <p className="text-3xl font-bold text-blue-700">85.2</p>
                <span className="text-sm text-blue-600">per transaction</span>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Loyalty COHORT Retention</h3>
                <p className="text-3xl font-bold text-green-700">78%</p>
                <span className="text-sm text-green-600">90-day retention</span>
              </div>
            </div>

            {/* Customer Loyalty Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Customer Loyalty Overview</h3>
                <p className="text-sm text-gray-600">Recent loyalty activity and key customers</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customers
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 4)
                    .map(customer => (
                      <div key={customer.id} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-lg font-semibold text-gray-900">{customer.name}</div>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {customer.points >= 1500 ? 'Gold' : customer.points >= 500 ? 'Silver' : 'Bronze'}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Loyalty Points:</span>
                            <span className="font-semibold text-blue-600">{customer.points} pts</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Spent:</span>
                            <span className="font-semibold text-green-600">{customer.spent}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tier Progress:</span>
                            <span className="font-semibold text-purple-600">
                              {customer.points >= 500 ? 'VIP Member' : 'Regular Member'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'communications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Refill Reminders & Communications</h2>
                <p className="text-gray-600">Automated SMS/WhatsApp refill reminders</p>
              </div>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Send Campaign</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Communication Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable refill reminders</div>
                    <div className="text-sm text-gray-600">Send automated refill reminders to customers</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">SMS notifications</div>
                    <div className="text-sm text-gray-600">Send text message reminders</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">WhatsApp reminders</div>
                    <div className="text-sm text-gray-600">Send WhatsApp message reminders</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <RefillScheduler
              customer={{ id: 1, firstName: 'Sarah' }}
              onRefillScheduled={(prescription, channel, date) => {
                console.log('Refill scheduled:', { prescription, channel, date });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmScreen;
