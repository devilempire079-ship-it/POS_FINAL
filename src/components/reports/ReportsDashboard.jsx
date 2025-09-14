import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Settings
} from 'lucide-react';

const ReportsDashboard = () => {
  const [reportCategories, setReportCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for report categories
    const mockCategories = [
      {
        id: 'sales',
        name: 'Sales Reports',
        icon: TrendingUp,
        color: 'blue',
        description: 'Revenue, transactions, and sales performance analytics',
        reportCount: 8,
        reports: [
          { name: 'Daily Sales Summary', id: 'daily-sales', type: 'summary', lastGenerated: new Date('2025-09-02T08:00:00'), frequency: 'Daily' },
          { name: 'Product Performance', id: 'product-performance', type: 'product', lastGenerated: new Date('2025-08-30T14:30:00'), frequency: 'Weekly' },
          { name: 'Hourly Sales Trends', id: 'hourly-trends', type: 'trends', lastGenerated: new Date('2025-09-02T12:00:00'), frequency: 'Daily' },
          { name: 'Top Customers', id: 'top-customers', type: 'customer', lastGenerated: new Date('2025-08-28T16:45:00'), frequency: 'Monthly' },
          { name: 'Sales by Category', id: 'sales-by-category', type: 'category', lastGenerated: new Date('2025-09-01T10:15:00'), frequency: 'Weekly' },
          { name: 'Payment Method Analysis', id: 'payment-methods', type: 'payment', lastGenerated: new Date('2025-08-31T09:20:00'), frequency: 'Weekly' },
          { name: 'Loyalty Program Sales', id: 'loyalty-sales', type: 'loyalty', lastGenerated: new Date('2025-08-29T17:30:00'), frequency: 'Monthly' },
          { name: 'Staff Performance', id: 'staff-performance', type: 'staff', lastGenerated: new Date('2025-09-01T18:45:00'), frequency: 'Daily' }
        ]
      },
      {
        id: 'inventory',
        name: 'Inventory Reports',
        icon: Package,
        color: 'green',
        description: 'Stock levels, turnover, and supply chain analytics',
        reportCount: 6,
        reports: [
          { name: 'Stock Status Report', id: 'stock-status', type: 'status', lastGenerated: new Date('2025-09-02T09:00:00'), frequency: 'Daily' },
          { name: 'Inventory Turnover', id: 'inventory-turnover', type: 'turnover', lastGenerated: new Date('2025-08-29T11:30:00'), frequency: 'Monthly' },
          { name: 'Low Stock Alert', id: 'low-stock-alert', type: 'alerts', lastGenerated: new Date('2025-09-02T08:15:00'), frequency: 'Daily' },
          { name: 'Supplier Performance', id: 'supplier-performance', type: 'supplier', lastGenerated: new Date('2025-08-25T14:00:00'), frequency: 'Quarterly' },
          { name: 'Stock Movement History', id: 'stock-movement', type: 'movement', lastGenerated: new Date('2025-09-01T15:45:00'), frequency: 'Weekly' },
          { name: 'ABC Analysis', id: 'abc-analysis', type: 'analysis', lastGenerated: new Date('2025-08-30T10:20:00'), frequency: 'Monthly' }
        ]
      },
      {
        id: 'customers',
        name: 'Customer Analytics',
        icon: Users,
        color: 'purple',
        description: 'Customer behavior, loyalty, and segmentation insights',
        reportCount: 5,
        reports: [
          { name: 'Customer Lifetime Value', id: 'clv', type: 'clv', lastGenerated: new Date('2025-08-28T13:15:00'), frequency: 'Monthly' },
          { name: 'Retention Analysis', id: 'retention', type: 'retention', lastGenerated: new Date('2025-08-31T16:30:00'), frequency: 'Monthly' },
          { name: 'Loyalty Program Report', id: 'loyalty-program', type: 'loyalty', lastGenerated: new Date('2025-08-30T12:45:00'), frequency: 'Weekly' },
          { name: 'Customer Segmentation', id: 'segmentation', type: 'segmentation', lastGenerated: new Date('2025-08-29T09:00:00'), frequency: 'Monthly' },
          { name: 'New vs Returning', id: 'new-vs-returning', type: 'comparison', lastGenerated: new Date('2025-09-01T11:20:00'), frequency: 'Weekly' }
        ]
      },
      {
        id: 'financial',
        name: 'Financial Reports',
        icon: DollarSign,
        color: 'emerald',
        description: 'Profit/loss, margins, and financial performance analysis',
        reportCount: 4,
        reports: [
          { name: 'Profit & Loss Statement', id: 'pnl', type: 'pnl', lastGenerated: new Date('2025-08-31T15:00:00'), frequency: 'Monthly' },
          { name: 'Gross Margin Analysis', id: 'margin-analysis', type: 'margin', lastGenerated: new Date('2025-09-01T10:30:00'), frequency: 'Monthly' },
          { name: 'Cost Analysis', id: 'cost-analysis', type: 'cost', lastGenerated: new Date('2025-08-29T14:20:00'), frequency: 'Weekly' },
          { name: 'Cash Flow Summary', id: 'cash-flow', type: 'cashflow', lastGenerated: new Date('2025-08-30T16:45:00'), frequency: 'Monthly' }
        ]
      }
    ];

    setTimeout(() => {
      setReportCategories(mockCategories);
      setLoading(false);
    }, 500);
  }, []);

  const handleGenerateReport = (reportId) => {
    alert(`Generating report: ${reportId}`);
    // In a real implementation, this would trigger report generation
  };

  const handleViewReport = (reportId) => {
    alert(`Viewing report details: ${reportId}`);
    // In a real implementation, this would navigate to report details
  };

  const handleDownloadReport = (reportId, format = 'pdf') => {
    alert(`Downloading report ${reportId} as ${format.toUpperCase()}`);
    // In a real implementation, this would trigger download
  };

  const filteredReports = (reports) => {
    return reports.filter(report =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatusColor = (lastGenerated) => {
    const daysSince = (new Date() - lastGenerated) / (1000 * 60 * 60 * 24);
    if (daysSince < 1) return 'text-green-600 bg-green-100';
    if (daysSince < 7) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Advanced Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive business intelligence and reporting suite</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>New Report</span>
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Reports</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="sales">Sales Reports</option>
                <option value="inventory">Inventory Reports</option>
                <option value="customers">Customer Analytics</option>
                <option value="financial">Financial Reports</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {reportCategories.reduce((total, category) =>
              total + filteredReports(category.reports).length, 0
            )} reports found
          </div>
        </div>
      </div>

      {/* Report Categories Grid */}
      <div className="space-y-8">
        {(filterCategory === 'all' ? reportCategories : reportCategories.filter(cat => cat.id === filterCategory))
          .map(category => {
            const Icon = category.icon;
            const filteredCategoryReports = filteredReports(category.reports);

            if (filteredCategoryReports.length === 0) return null;

            return (
              <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Category Header */}
                <div className={`px-6 py-4 bg-gradient-to-r from-${category.color}-500 to-${category.color}-600 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-8 w-8" />
                      <div>
                        <h2 className="text-xl font-bold">{category.name}</h2>
                        <p className="text-sm opacity-90">{category.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{filteredCategoryReports.length}</div>
                      <div className="text-sm opacity-90">Reports</div>
                    </div>
                  </div>
                </div>

                {/* Reports Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategoryReports.map(report => (
                      <div key={report.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">Type: {report.type}</p>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className={`px-2 py-1 rounded-full ${getStatusColor(report.lastGenerated)}`}>
                                {report.frequency}
                              </span>
                              <span className="text-gray-500">
                                Updated {report.lastGenerated.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewReport(report.id)}
                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-600 transition duration-200 flex items-center justify-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleGenerateReport(report.id)}
                            className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-600 transition duration-200 flex items-center space-x-1 justify-center"
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span>Generate</span>
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => {}}
                              className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition duration-200"
                            >
                              <Download className="h-4 w-4 text-gray-600" />
                            </button>
                            {/* Download options would be a dropdown */}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Category Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {category.name} Summary
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Reports: {filteredCategoryReports.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Quick Actions Footer */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">🚀 Advanced Analytics Tools</h2>
          <p className="text-lg opacity-90">Unlock deeper business insights with our analytics suite</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-10 rounded-lg p-6 hover:bg-opacity-20 transition-all cursor-pointer">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-Time Dashboard</h3>
              <p className="text-sm opacity-90 mb-4">Live business metrics and performance indicators</p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
                View Live Dashboard
              </button>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-6 hover:bg-opacity-20 transition-all cursor-pointer">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Custom Reports</h3>
              <p className="text-sm opacity-90 mb-4">Build custom reports with drag-and-drop simplicity</p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
                Create Report
              </button>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-6 hover:bg-opacity-20 transition-all cursor-pointer">
            <div className="text-center">
              <Download className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Data Export</h3>
              <p className="text-sm opacity-90 mb-4">Download reports in multiple formats</p>
              <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
