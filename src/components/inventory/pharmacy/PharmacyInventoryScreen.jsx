import React, { useState, useEffect } from 'react';
import {
  Pill,
  FileText,
  AlertTriangle,
  Shield,
  Search,
  Plus,
  Calendar,
  Package,
  Activity,
  Clock,
  Warehouse,
  Truck,
  DollarSign,
  FileCheck,
  RefreshCw,
  Barcode,
  TestTube
} from 'lucide-react';

// Pharmacy-specific inventory components
import PharmacyDashboard from './pharmacy/PharmacyDashboard';
import DrugManagement from './pharmacy/DrugManagement';
import ControlledSubstances from './pharmacy/ControlledSubstances';
import OTCInventory from './pharmacy/OTCInventory';
import VaccineManagement from './pharmacy/VaccineManagement';
import CompoundingSupplies from './pharmacy/CompoundingSupplies';
import PharmacyReceiving from './pharmacy/PharmacyReceiving';
import PharmacyReports from './pharmacy/PharmacyReports';

const PharmacyInventoryScreen = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Pharmacy-specific stats
  const [pharmacyStats] = useState({
    totalDrugs: 245,
    expiringSoon: 12,
    lowStock: 8,
    controlledCount: 67,
    totalValue: 45280,
    vaccines: 15,
    compoundingItems: 89
  });

  // Pharmacy inventory tabs with specialized components
  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: Activity,
      component: PharmacyDashboard,
      description: 'Pharmacy inventory overview with safety alerts and compliance metrics'
    },
    {
      id: 'drugs',
      name: 'Drug Management',
      icon: Pill,
      component: DrugManagement,
      description: 'Comprehensive drug catalog with NDC, DEA schedule, and manufacturer info'
    },
    {
      id: 'controlled',
      name: 'Controlled Substances',
      icon: Shield,
      component: ControlledSubstances,
      description: 'DEA Schedule I-V medications with witness signatures and audit trails'
    },
    {
      id: 'otc',
      name: 'OTC Inventory',
      icon: Package,
      component: OTCInventory,
      description: 'Over-the-counter medications and healthcare products'
    },
    {
      id: 'vaccines',
      name: 'Vaccines',
      icon: Clock,
      component: VaccineManagement,
      description: 'Temperature-controlled vaccines with lot tracking and expiration alerts'
    },
    {
      id: 'compounding',
      name: 'Compounding',
      icon: FileText,
      component: CompoundingSupplies,
      description: 'Compounding ingredients, supplies, and quality control tracking'
    },
    {
      id: 'receiving',
      name: 'Receiving',
      icon: Truck,
      component: PharmacyReceiving,
      description: 'Drug receiving with manufacturer verification and lot assignment'
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: FileCheck,
      component: PharmacyReports,
      description: 'DEA Form 222, controlled substance logs, and expiry reports'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabData.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Pharmacy Inventory Header */}
      <div className="bg-white border-b-4 border-green-600 shadow-lg px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 rounded-lg p-3 shadow-lg">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pharmacy Inventory Management</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className="flex items-center text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  <Warehouse className="w-4 h-4 mr-1" />
                  Licensed Facility
                </span>
                <span className="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  <Shield className="w-4 h-4 mr-1" />
                  DEA Compliant
                </span>
                <span className="flex items-center text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                  <Activity className="w-4 h-4 mr-1" />
                  Safety Verified
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{new Date().toLocaleTimeString()}</div>
            <div className="text-sm text-gray-600">{new Date().toLocaleDateString()}</div>

            {pharmacyStats.expiringSoon > 0 && (
              <div className="bg-orange-100 px-3 py-2 rounded-lg border border-orange-300 mt-2">
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-800 font-medium">{pharmacyStats.expiringSoon} drugs expiring soon</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pharmacy Quick Stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Drugs</p>
                <p className="text-2xl font-bold text-blue-600">{pharmacyStats.totalDrugs}</p>
              </div>
              <Pill className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Controlled</p>
                <p className="text-2xl font-bold text-red-600">{pharmacyStats.controlledCount}</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{pharmacyStats.lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-purple-600">{pharmacyStats.expiringSoon}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vaccines</p>
                <p className="text-2xl font-bold text-green-600">{pharmacyStats.vaccines}</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compounding</p>
                <p className="text-2xl font-bold text-indigo-600">{pharmacyStats.compoundingItems}</p>
              </div>
              <TestTube className="w-8 h-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-xl font-bold text-green-600">${pharmacyStats.totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Pharmacy Inventory Tabs */}
      <div className="px-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600 bg-green-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <activeTabData.icon className="h-7 w-7 text-green-600" />
                <span>{activeTabData.name}</span>
              </h2>
              <p className="text-gray-600 mt-2">{activeTabData.description}</p>
            </div>

            <ActiveComponent />
          </div>
        </div>
      </div>

      {/* Compliance Footer */}
      <div className="px-6 py-4">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6" />
              <div>
                <h4 className="font-bold">DEA Compliance Active</h4>
                <p className="text-sm opacity-90">All controlled substance transactions logged and verified</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                License # PH123456
              </span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                DEA # AP987654321
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyInventoryScreen;
