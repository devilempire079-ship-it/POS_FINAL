import React, { useState, useEffect } from 'react';
import api from '../services/api';

const PermissionManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');

  // Permission structure
  const resources = [
    { key: 'dashboard', name: 'Dashboard', icon: '📊' },
    { key: 'sales', name: 'Sales', icon: '💰' },
    { key: 'customers', name: 'Customers', icon: '👥' },
    { key: 'products', name: 'Products', icon: '📦' },
    { key: 'inventory', name: 'Inventory', icon: '📋' },
    { key: 'reports', name: 'Reports', icon: '📈' },
    { key: 'users', name: 'Users', icon: '👤' },
    { key: 'settings', name: 'Settings', icon: '⚙️' },
    { key: 'loyalty', name: 'Loyalty', icon: '⭐' },
    { key: 'suppliers', name: 'Suppliers', icon: '🚚' }
  ];

  const actions = [
    { key: 'view', name: 'View', color: 'bg-blue-100 text-blue-800' },
    { key: 'create', name: 'Create', color: 'bg-green-100 text-green-800' },
    { key: 'edit', name: 'Edit', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'delete', name: 'Delete', color: 'bg-red-100 text-red-800' },
    { key: 'export', name: 'Export', color: 'bg-purple-100 text-purple-800' }
  ];

  // Field permissions for different resources
  const fieldPermissions = {
    customers: [
      { key: 'firstName', name: 'First Name' },
      { key: 'lastName', name: 'Last Name' },
      { key: 'email', name: 'Email' },
      { key: 'phone', name: 'Phone' },
      { key: 'address', name: 'Address' },
      { key: 'loyaltyPoints', name: 'Loyalty Points' },
      { key: 'totalSpent', name: 'Total Spent' },
      { key: 'customerType', name: 'Customer Type' },
      { key: 'notes', name: 'Notes' }
    ],
    products: [
      { key: 'name', name: 'Name' },
      { key: 'description', name: 'Description' },
      { key: 'price', name: 'Price' },
      { key: 'cost', name: 'Cost' },
      { key: 'stockQty', name: 'Stock Quantity' },
      { key: 'category', name: 'Category' },
      { key: 'sku', name: 'SKU' },
      { key: 'barcode', name: 'Barcode' },
      { key: 'supplier', name: 'Supplier' }
    ],
    sales: [
      { key: 'totalAmount', name: 'Total Amount' },
      { key: 'paymentType', name: 'Payment Type' },
      { key: 'customer', name: 'Customer' },
      { key: 'items', name: 'Items' },
      { key: 'discount', name: 'Discount' },
      { key: 'taxAmount', name: 'Tax Amount' },
      { key: 'notes', name: 'Notes' }
    ]
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesRes, usersRes] = await Promise.all([
        api.get('/api/permissions/templates'),
        api.get('/api/users')
      ]);

      setTemplates(templatesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load permission data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}/permissions`);
      setUserPermissions(response.data);
    } catch (error) {
      console.error('Error loading user permissions:', error);
      alert('Failed to load user permissions');
    }
  };

  const assignTemplateToUser = async (userId, templateId) => {
    try {
      await api.post(`/api/users/${userId}/assign-template`, { templateId });
      alert('Permission template assigned successfully!');
      await loadUserPermissions(userId);
    } catch (error) {
      console.error('Error assigning template:', error);
      alert('Failed to assign permission template');
    }
  };

  const updateUserPermissions = async (userId, permissions) => {
    try {
      await api.put(`/api/users/${userId}/permissions`, { permissions });
      alert('User permissions updated successfully!');
      await loadUserPermissions(userId);
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update user permissions');
    }
  };

  const createCustomTemplate = async () => {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    const templateDescription = prompt('Enter template description:');
    if (!templateDescription) return;

    // Create default permissions for the new template
    const defaultPermissions = [];
    resources.forEach(resource => {
      actions.forEach(action => {
        defaultPermissions.push({
          resource: resource.key,
          action: action.key,
          allowed: false
        });
      });
    });

    try {
      await api.post('/api/permissions/templates', {
        name: templateName,
        description: templateDescription,
        permissions: defaultPermissions
      });

      alert('Custom template created successfully!');
      await loadData();
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create custom template');
    }
  };

  const PermissionMatrix = ({ permissions, onChange, readOnly = false }) => {
    const getPermissionValue = (resource, action, field = null) => {
      const perm = permissions.find(p =>
        p.resource === resource &&
        p.action === action &&
        (field ? p.field === field : !p.field)
      );
      return perm ? perm.allowed : false;
    };

    const handlePermissionChange = (resource, action, field = null, value) => {
      if (readOnly) return;

      const newPermissions = [...permissions];
      const existingIndex = newPermissions.findIndex(p =>
        p.resource === resource &&
        p.action === action &&
        (field ? p.field === field : !p.field)
      );

      if (existingIndex >= 0) {
        newPermissions[existingIndex].allowed = value;
      } else {
        newPermissions.push({
          resource,
          action,
          field,
          allowed: value
        });
      }

      onChange(newPermissions);
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 border-b text-left">Resource</th>
              {actions.map(action => (
                <th key={action.key} className="px-4 py-2 border-b text-center">
                  {action.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <React.Fragment key={resource.key}>
                {/* Main resource row */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b font-medium">
                    {resource.icon} {resource.name}
                  </td>
                  {actions.map(action => (
                    <td key={action.key} className="px-4 py-2 border-b text-center">
                      <input
                        type="checkbox"
                        checked={getPermissionValue(resource.key, action.key)}
                        onChange={(e) => handlePermissionChange(resource.key, action.key, null, e.target.checked)}
                        disabled={readOnly}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                  ))}
                </tr>

                {/* Field-level permissions */}
                {fieldPermissions[resource.key] && (
                  <tr>
                    <td colSpan={actions.length + 1} className="px-4 py-2 bg-gray-100">
                      <div className="text-sm text-gray-600 mb-2">Field-level permissions:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {fieldPermissions[resource.key].map(field => (
                          <div key={field.key} className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-20">{field.name}:</span>
                            <div className="flex space-x-1">
                              {actions.slice(0, 3).map(action => ( // Only view, create, edit for fields
                                <label key={action.key} className="flex items-center space-x-1">
                                  <input
                                    type="checkbox"
                                    checked={getPermissionValue(resource.key, action.key, field.key)}
                                    onChange={(e) => handlePermissionChange(resource.key, action.key, field.key, e.target.checked)}
                                    disabled={readOnly}
                                    className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-xs">{action.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Permission Management</h1>
        <p className="text-gray-600">Manage user permissions and access control</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {[
            { key: 'templates', label: 'Permission Templates', icon: '📋' },
            { key: 'users', label: 'User Permissions', icon: '👥' },
            { key: 'custom', label: 'Custom Templates', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Permission Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.filter(t => t.isSystem).map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    {template.isDefault && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="text-xs text-gray-500">
                    {template.permissions?.length || 0} permissions • {template._count?.users || 0} users
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Permission Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Users List */}
              <div>
                <h3 className="font-medium mb-3">Select User</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map(user => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        loadUserPermissions(user.id);
                      }}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">Role: {user.role}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Permissions */}
              <div>
                {selectedUser ? (
                  <div>
                    <h3 className="font-medium mb-3">
                      Permissions for {selectedUser.name}
                    </h3>

                    {/* Template Assignment */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign Permission Template
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            assignTemplateToUser(selectedUser.id, e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a template...</option>
                        {templates.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Current Permissions */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Current Permissions</h4>
                      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded">
                        {userPermissions.length > 0 ? (
                          <PermissionMatrix
                            permissions={userPermissions}
                            onChange={(permissions) => updateUserPermissions(selectedUser.id, permissions)}
                          />
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            No permissions assigned
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Select a user to view their permissions
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Templates Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Custom Permission Templates</h2>
              <button
                onClick={createCustomTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Create Custom Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.filter(t => !t.isSystem).map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Custom
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="text-xs text-gray-500">
                    {template.permissions?.length || 0} permissions • {template._count?.users || 0} users
                  </div>
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit Template
                  </button>
                </div>
              ))}

              {templates.filter(t => !t.isSystem).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No custom templates created yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>

              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Permission Matrix</h3>
                <PermissionMatrix
                  permissions={selectedTemplate.permissions || []}
                  onChange={() => {}}
                  readOnly={true}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;
