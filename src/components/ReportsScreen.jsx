import React, { useState } from 'react';
import {
  BarChart,
  PieChart,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  FileText,
  Settings,
  Activity
} from 'lucide-react';
import { useBusinessType } from '../hooks/useBusinessType';

// Import report components
import ReportsDashboard from './reports/ReportsDashboard';
import RealTimeDashboard from './reports/RealTimeDashboard';
import AdvancedAnalyticsDashboard from './reports/AdvancedAnalyticsDashboard';
import PerformanceKPIs from './reports/PerformanceKPIs';
import PredictiveAnalytics from './reports/PredictiveAnalytics';
import RestaurantReports from './reports/RestaurantReports';

const ReportsScreen = () => {
  const { businessType } = useBusinessType();
  const isRestaurant = businessType?.code === 'restaurant';
  const [activeTab, setActiveTab] = useState('dashboard');

  const baseTabs = [
    {
      id: 'dashboard',
      name: 'Report Center',
      icon: FileText,
      description: 'All reports and analytics in one place'
    },
    {
      id: 'realtime',
      name: 'Real-Time',
      icon: Activity,
      description: 'Live sales monitoring'
    },
    {
      id: 'advanced',
      name: 'Advanced Analytics',
      icon: BarChart,
      description: 'AI-powered business insights'
    },
    {
      id: 'kpis',
      name: 'Performance KPIs',
      icon: TrendingUp,
      description: 'Key performance indicators'
    },
    {
      id: 'predictive',
      name: 'Predictive Analytics',
      icon: PieChart,
      description: 'Future trends and forecasting'
    }
  ];

  const restaurantTabs = [
    {
      id: 'restaurant',
      name: 'Restaurant Analytics',
      icon: BarChart,
      description: 'Table analytics, menu performance, and staff metrics'
    }
  ];

  const tabs = isRestaurant ? [...baseTabs, ...restaurantTabs] : baseTabs;

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📈 Business Intelligence & Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive reporting and data analytics for informed decision making</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-center focus:outline-none transition-all duration-200 min-w-0 ${
                  isActive
                    ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <activeTabData.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeTabData.name}</h2>
                <p className="text-gray-600">{activeTabData.description}</p>
              </div>
            </div>
          </div>

          <div className="min-h-[500px]">
            {activeTab === 'dashboard' && <ReportsDashboard />}
            {activeTab === 'realtime' && <RealTimeDashboard />}
            {activeTab === 'advanced' && <AdvancedAnalyticsDashboard />}
            {activeTab === 'kpis' && <PerformanceKPIs />}
            {activeTab === 'predictive' && <PredictiveAnalytics />}
            {activeTab === 'restaurant' && isRestaurant && <RestaurantReports />}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">📊 Data-Driven Decision Making</h2>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            Leverage real-time analytics and predictive insights to optimize operations, 
            improve customer satisfaction, and drive business growth.
          </p>
          <div className="flex justify-center space-x-6 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm opacity-80">Data Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm opacity-80">Real-Time Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">AI</div>
              <div className="text-sm opacity-80">Powered Insights</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;
