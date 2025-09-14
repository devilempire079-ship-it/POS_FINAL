import React, { useState } from 'react';
import { useBusinessType } from '../hooks/useBusinessType.jsx';

const SettingsScreen = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  const tabs = [
    { id: 'general', name: 'General' },
    { id: 'business', name: 'Business Type' },
    { id: 'users', name: 'Users & Roles' },
    { id: 'printer', name: 'Printer' },
    { id: 'tax', name: 'Tax' },
    { id: 'backup', name: 'Backup' },
  ];

  // Mock user data
  const users = [
    { id: 1, name: 'Admin User', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Cashier 1', role: 'Cashier', status: 'Active' },
    { id: 3, name: 'Manager User', role: 'Manager', status: 'Active' },
  ];

  const roles = [
    { id: 1, name: 'Admin', permissions: 'Full access to all features' },
    { id: 2, name: 'Cashier', permissions: 'Sales only' },
    { id: 3, name: 'Manager', permissions: 'Sales, reports, limited inventory' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your POS system configuration</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Business Type Settings */}
          {activeTab === 'business' && (
            <BusinessTypeTab />
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    defaultValue="My POS Store"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>(GMT-05:00) Eastern Time</option>
                    <option>(GMT-06:00) Central Time</option>
                    <option>(GMT-07:00) Mountain Time</option>
                    <option>(GMT-08:00) Pacific Time</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="notifications"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                  Enable notifications
                </label>
              </div>
              
              <div className="pt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Users & Roles */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Users & Roles</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Add User
                </button>
              </div>
              
              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Roles Section */}
              <div className="pt-6">
                <h3 className="text-md font-semibold text-gray-800 mb-4">Roles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{role.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{role.permissions}</p>
                      <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                        Edit Permissions
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Printer Settings */}
          {activeTab === 'printer' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Printer Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Printer Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Receipt Printer</option>
                    <option>Label Printer</option>
                    <option>Standard Printer</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Printer Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Epson TM-T88V"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Connection Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>USB</option>
                    <option>Network</option>
                    <option>Bluetooth</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address (if network)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-3">
                  Save Settings
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Test Print
                </button>
              </div>
            </div>
          )}

          {/* Tax Settings */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Tax Settings</h2>
              
              <div className="flex items-center">
                <input
                  id="tax-enabled"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="tax-enabled" className="ml-2 block text-sm text-gray-900">
                  Enable tax calculation
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="10"
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Sales Tax"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Save Tax Settings
                </button>
              </div>
            </div>
          )}

          {/* Backup Settings */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800">Backup & Restore</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Automatic Backups</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Backups are automatically created daily at 2:00 AM and stored locally.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Create Backup</h3>
                  <p className="text-sm text-gray-500 mb-4">Manually create a backup of your data</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Create Backup Now
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Restore Backup</h3>
                  <p className="text-sm text-gray-500 mb-4">Restore your system from a previous backup</p>
                  <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                    Restore from Backup
                  </button>
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Backup History</h3>
                <div className="border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-09-01 02:00</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12.4 MB</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">Download</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2025-08-31 02:00</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">12.3 MB</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">Download</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Business Type Tab Component
const BusinessTypeTab = () => {
  const {
    businessType,
    businessTypes,
    updateBusinessType,
    loading,
    getCurrentSubtype,
    updateSubtype,
    isSubtype
  } = useBusinessType();
  const [pendingSelection, setPendingSelection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSubtype, setPendingSubtype] = useState(null);
  const [isSavingSubtype, setIsSavingSubtype] = useState(false);

  const currentSubtype = getCurrentSubtype();

  const handleSelectBusinessType = (typeId) => {
    const selectedType = businessTypes.find(type => type.id === typeId);
    if (selectedType) {
      setPendingSelection(selectedType);
    }
  };

  const handleConfirmSelection = async () => {
    if (!pendingSelection) return;

    try {
      setIsSaving(true);
      await updateBusinessType(pendingSelection.id);
      setPendingSelection(null);
      // Show success message
      alert(`Business type changed to ${pendingSelection.name} successfully!`);
    } catch (error) {
      console.error('Error saving business type:', error);
      alert('Failed to save business type. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSelection = () => {
    setPendingSelection(null);
  };

  const handleSelectSubtype = (subtypeCode) => {
    setPendingSubtype(subtypeCode);
  };

  const handleConfirmSubtype = async () => {
    if (!pendingSubtype) return;

    try {
      setIsSavingSubtype(true);
      await updateSubtype(pendingSubtype);
      setPendingSubtype(null);
      alert(`Restaurant type changed to ${pendingSubtype.replace('_', ' ').toUpperCase()} successfully!`);
    } catch (error) {
      console.error('Error saving restaurant subtype:', error);
      alert('Failed to save restaurant type. Please try again.');
    } finally {
      setIsSavingSubtype(false);
    }
  };

  const handleCancelSubtype = () => {
    setPendingSubtype(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading business types...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Business Type Selection</h2>
        <p className="text-gray-600">Choose the type of business for your POS system</p>
      </div>

      {/* Current Business Type */}
      {businessType && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">{businessType.icon}</div>
            <div>
              <h3 className="font-medium text-green-800">Current Business Type: {businessType.name}</h3>
              <p className="text-sm text-green-600">{businessType.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Selection Confirmation */}
      {pendingSelection && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-2xl mr-3">{pendingSelection.icon}</div>
              <div>
                <h3 className="font-medium text-yellow-800">Selected: {pendingSelection.name}</h3>
                <p className="text-sm text-yellow-600">{pendingSelection.description}</p>
                <p className="text-xs text-yellow-700 mt-1">Click "Save Configuration" to apply this change</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCancelSelection}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={isSaving}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Business Type Selection */}
      <div>
        <h3 className="text-md font-medium text-gray-800 mb-4">Available Business Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businessTypes.map((type) => {
            const isCurrent = businessType?.id === type.id;
            const isPending = pendingSelection?.id === type.id;

            return (
              <div
                key={type.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  isCurrent
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : isPending
                    ? 'border-yellow-500 bg-yellow-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
                onClick={() => handleSelectBusinessType(type.id)}
              >
                <div className="flex items-center mb-3">
                  <div className="text-3xl mr-3">{type.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{type.name}</h4>
                    {isCurrent && (
                      <span className="text-xs text-green-600 font-medium">Current Selection</span>
                    )}
                    {isPending && (
                      <span className="text-xs text-yellow-600 font-medium">Pending Selection</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Restaurant Subtype Selection - Only show for restaurant business type */}
      {businessType?.code === 'restaurant' && businessType.subtypes && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Restaurant Type Configuration</h3>
              <p className="text-sm text-orange-600">Choose your specific restaurant service model</p>
            </div>
            {currentSubtype && (
              <div className="text-right">
                <div className="text-sm font-medium text-orange-800">
                  Current: {businessType.subtypes[currentSubtype]?.name || currentSubtype}
                </div>
                <div className="text-xs text-orange-600">
                  {businessType.subtypes[currentSubtype]?.description}
                </div>
              </div>
            )}
          </div>

          {/* Pending Subtype Selection */}
          {pendingSubtype && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{businessType.subtypes[pendingSubtype]?.icon}</div>
                  <div>
                    <h4 className="font-medium text-yellow-800">Selected: {businessType.subtypes[pendingSubtype]?.name}</h4>
                    <p className="text-sm text-yellow-600">{businessType.subtypes[pendingSubtype]?.description}</p>
                    <p className="text-xs text-yellow-700 mt-1">Click "Save Restaurant Type" to apply this change</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancelSubtype}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    disabled={isSavingSubtype}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSubtype}
                    disabled={isSavingSubtype}
                    className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400 flex items-center"
                  >
                    {isSavingSubtype ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Restaurant Type'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Restaurant Subtype Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(businessType.subtypes).map(([subtypeCode, subtype]) => {
              const isCurrent = currentSubtype === subtypeCode;
              const isPending = pendingSubtype === subtypeCode;

              return (
                <div
                  key={subtypeCode}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    isCurrent
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : isPending
                      ? 'border-yellow-500 bg-yellow-50 shadow-md'
                      : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                  }`}
                  onClick={() => handleSelectSubtype(subtypeCode)}
                >
                  <div className="flex items-center mb-3">
                    <div className="text-3xl mr-3">{subtype.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{subtype.name}</h4>
                      {isCurrent && (
                        <span className="text-xs text-orange-600 font-medium">Current Selection</span>
                      )}
                      {isPending && (
                        <span className="text-xs text-yellow-600 font-medium">Pending Selection</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{subtype.description}</p>

                  {/* Features List */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-700">Features:</div>
                    <div className="flex flex-wrap gap-1">
                      {subtype.features.tables && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Tables</span>
                      )}
                      {subtype.features.reservations && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Reservations</span>
                      )}
                      {subtype.features.counter && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Counter</span>
                      )}
                      {subtype.features.driveThru && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Drive-Thru</span>
                      )}
                      {subtype.features.takeout && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Takeout</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Restaurant Type Information */}
          <div className="mt-6 bg-orange-100 border border-orange-300 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-orange-800">Restaurant Type Configuration</h4>
                <div className="mt-2 text-sm text-orange-700">
                  <p>Each restaurant type offers different features and workflows:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><strong>Fine Dining:</strong> Full table service with reservations and formal dining experience</li>
                    <li><strong>Casual Dining:</strong> Table service with counter options for flexibility</li>
                    <li><strong>Quick Service:</strong> Counter and drive-thru with fast preparation workflows</li>
                  </ul>
                  <p className="mt-2 font-medium">Select your restaurant type and click "Save Restaurant Type" to apply changes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Business Type Configuration</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Changing your business type will:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Update the sales screen layout and features</li>
                <li>Modify available product categories and workflows</li>
                <li>Adjust reporting and analytics views</li>
                <li>Configure business-specific settings and preferences</li>
              </ul>
              <p className="mt-2 font-medium">Select a business type and click "Save Configuration" to apply changes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
