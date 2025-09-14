import React, { useState, useEffect } from 'react';
import {
  Crown,
  Plus,
  Edit,
  Trash2,
  Settings,
  Target,
  Gift,
  TrendingUp,
  Users,
  Star,
  Award,
  CheckCircle,
  XCircle,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Calculator,
  ShoppingCart,
  RefreshCw
} from 'lucide-react';

const TierManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [activeTab, setActiveTab] = useState('tiers');
  const [selectedTier, setSelectedTier] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [editingPointRule, setEditingPointRule] = useState(null);
  const [showBasicRuleModal, setShowBasicRuleModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeRuleTab, setActiveRuleTab] = useState('basic');

  // Form states for create/edit
  const [newTier, setNewTier] = useState({
    name: '',
    displayName: '',
    color: '#6366F1',
    icon: 'crown',
    customIcon: null, // For uploaded images
    customIconPreview: null, // Base64 preview
    description: '',
    minPoints: 0,
    maxPoints: 499,
    meritRules: [
      {
        type: 'points',
        operator: 'between',
        minValue: 0,
        maxValue: 499,
        timeframe: 'lifetime'
      }
    ],
    benefits: [
      {
        type: 'discount',
        name: 'Tier Discount',
        value: 5,
        description: 'Percentage discount on all purchases'
      }
    ],
    tierOrder: 1,
    isActive: true
  });

  const [newPointRule, setNewPointRule] = useState({
    name: '',
    type: 'product_category',
    active: true,
    description: '',
    triggers: [
      {
        conditionType: 'category',
        category: 'Prescription',
        operator: 'contains',
        points: 10,
        multiplier: 1.0
      }
    ],
    scheduling: {
      activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      startTime: '00:00',
      endTime: '23:59',
      specialEvents: []
    },
    limits: {
      maxPointsPerDay: 1000,
      maxPointsPerMonth: 5000,
      maxUses: 100
    },
    expiry: {
      type: 'none',
      days: 365
    },
    stacking: {
      allowStacking: false,
      priority: 1,
      excludeRules: []
    },
    notifications: {
      customerEmail: false,
      staffNotification: true,
      pointsAwarded: true
    }
  });

  // Minimal data structure for initial testing
  const [tiers, setTiers] = useState([
    {
      id: 'bronze',
      name: 'Bronze Member',
      displayName: '🥉 Bronze',
      color: '#CD7F32',
      description: 'Welcome to our loyalty program',
      minPoints: 0,
      isActive: true,
      benefits: ['5% Discount', 'Basic Support']
    },
    {
      id: 'silver',
      name: 'Silver Elite',
      displayName: '🥈 Silver',
      color: '#C0C0C0',
      description: 'Our valued customers',
      minPoints: 500,
      isActive: true,
      benefits: ['10% Discount', 'Priority Support']
    }
  ]);

  const [pointRules, setPointRules] = useState([
    {
      id: 'rule1',
      name: 'Base Points Rule',
      type: 'product_category',
      active: true,
      description: 'Earn points on purchases'
    }
  ]);

  // Loading effect with error handling
  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate component initialization
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check for required dependencies
        if (typeof React === 'undefined') {
          throw new Error('React is not available');
        }

        setLoading(false);
      } catch (err) {
        console.error('TierManagement loading error:', err);
        setError('Failed to load component: ' + err.message);
        setLoading(false);
      }
    };

    loadComponent();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Tier management functions
  const handleCreateTier = () => {
    const tier = {
      ...newTier,
      id: Date.now().toString(),
      benefits: newTier.benefits.filter(b => b.trim() !== '')
    };
    setTiers([...tiers, tier]);
    setShowCreateModal(false);
    resetNewTier();
  };

  const handleEditTier = (tier) => {
    setEditingTier(tier);
    setNewTier({
      name: tier.name,
      displayName: tier.displayName,
      color: tier.color,
      description: tier.description,
      minPoints: tier.minPoints,
      isActive: tier.isActive,
      benefits: [...tier.benefits]
    });
  };

  const handleUpdateTier = () => {
    setTiers(tiers.map(tier =>
      tier.id === editingTier.id ? { ...newTier, id: editingTier.id } : tier
    ));
    setEditingTier(null);
    resetNewTier();
  };

  const handleDeleteTier = (tier) => {
    setConfirmDelete({ type: 'tier', item: tier });
  };

  const confirmDeleteItem = () => {
    if (confirmDelete.type === 'tier') {
      setTiers(tiers.filter(tier => tier.id !== confirmDelete.item.id));
    } else if (confirmDelete.type === 'rule') {
      setPointRules(pointRules.filter(rule => rule.id !== confirmDelete.item.id));
    }
    setConfirmDelete(null);
  };

  const resetNewTier = () => {
    setNewTier({
      name: '',
      displayName: '',
      color: '#6366F1',
      description: '',
      minPoints: 0,
      isActive: true,
      benefits: ['']
    });
  };

  // Point rule management functions
  const handleCreatePointRule = () => {
    const rule = {
      ...newPointRule,
      id: Date.now().toString()
    };
    setPointRules([...pointRules, rule]);
    setShowCreateRuleModal(false);
    resetNewPointRule();
  };

  const handleEditPointRule = (rule) => {
    setEditingPointRule(rule);
    setNewPointRule({
      name: rule.name || '',
      type: rule.type || 'product_category',
      active: rule.active !== undefined ? rule.active : true,
      description: rule.description || '',
      pointsConfiguration: rule.pointsConfiguration || {
        basePoints: 0,
        bonusPoints: 0,
        minimumPurchaseAmount: 0,
        maximumPointsPerTransaction: 100,
        pointMultiplier: 1.0,
        roundingRule: 'nearest',
        minimumPoints: 0,
        maximumPoints: 1000
      },
      triggers: rule.triggers || [{
        conditionType: 'category',
        category: 'Prescription',
        operator: 'contains',
        points: 10,
        multiplier: 1.0
      }],
      scheduling: rule.scheduling || {
        activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        startTime: '00:00',
        endTime: '23:59',
        specialEvents: []
      },
      limits: rule.limits || {
        maxPointsPerDay: 1000,
        maxPointsPerMonth: 5000,
        maxUses: 100
      },
      expiry: rule.expiry || {
        type: 'none',
        days: 365
      },
      stacking: rule.stacking || {
        allowStacking: false,
        priority: 1,
        excludeRules: []
      },
      notifications: rule.notifications || {
        customerEmail: false,
        staffNotification: true,
        pointsAwarded: true
      }
    });
    // Also reset the tab to basic when editing
    setActiveRuleTab('basic');
  };

  const handleUpdatePointRule = () => {
    setPointRules(pointRules.map(rule =>
      rule.id === editingPointRule.id ? { ...newPointRule, id: editingPointRule.id } : rule
    ));
    setEditingPointRule(null);
    resetNewPointRule();
  };

  const handleDeletePointRule = (rule) => {
    setConfirmDelete({ type: 'rule', item: rule });
  };

  const resetNewPointRule = () => {
    setNewPointRule({
      name: '',
      type: 'product_category',
      active: true,
      description: '',
      pointsConfiguration: {
        basePoints: 0,
        bonusPoints: 0,
        minimumPurchaseAmount: 0,
        maximumPointsPerTransaction: 100,
        pointMultiplier: 1.0,
        roundingRule: 'nearest',
        minimumPoints: 0,
        maximumPoints: 1000
      },
      triggers: [
        {
          conditionType: 'category',
          category: 'Prescription',
          operator: 'contains',
          points: 10,
          multiplier: 1.0,
          minValue: 0,
          maxValue: 9999,
          timeframe: 'lifetime'
        }
      ],
      scheduling: {
        activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        startTime: '00:00',
        endTime: '23:59',
        specialEvents: []
      },
      limits: {
        maxPointsPerDay: 1000,
        maxPointsPerMonth: 5000,
        maxUses: 100
      },
      expiry: {
        type: 'none',
        days: 365
      },
      stacking: {
        allowStacking: false,
        priority: 1,
        excludeRules: []
      },
      notifications: {
        customerEmail: false,
        staffNotification: true,
        pointsAwarded: true
      }
    });
    // Also reset the tab to basic
    setActiveRuleTab('basic');
  };

  // Icon upload handler
  const handleIconUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (PNG, JPG, GIF, SVG, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewTier({
        ...newTier,
        customIcon: file,
        customIconPreview: e.target.result,
        icon: 'custom'
      });
    };
    reader.readAsDataURL(file);
  };

  // Error boundary component
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-3 mb-4">
          <XCircle className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Component Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 inline mr-2" />
          Retry Loading
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Loading Tier Management</h3>
            <p className="text-gray-600">Initializing loyalty system...</p>
          </div>
        </div>
      </div>
    );
  }

  const TierCard = ({ tier }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: tier.color + '20', color: tier.color }}
            >
              {tier.displayName.split(' ')[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
              <p className="text-sm text-gray-600">{tier.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditTier(tier)}
              className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
              title="Edit tier"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteTier(tier)}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
              title="Delete tier"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">Requirements</div>
          <div className="text-sm font-medium text-gray-900">
            Minimum Points: {tier.minPoints}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-2">Benefits</div>
          <div className="flex flex-wrap gap-2">
            {tier.benefits.map((benefit, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Status: <span className={`font-medium ${tier.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {tier.isActive ? 'Active' : 'Inactive'}
              </span>
            </span>
            <span className="text-gray-600">
              {tier.benefits.length} benefits
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const PointRuleCard = ({ rule }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: rule.active ? '#10B98120' : '#EF444420' }}>
            <Settings className="h-6 w-6" style={{ color: rule.active ? '#059669' : '#DC2626' }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{rule.name}</h3>
            <p className="text-gray-600">{rule.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditPointRule(rule)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="Edit rule"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeletePointRule(rule)}
            className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
            title="Delete rule"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Type: <span className="font-medium capitalize">{rule.type.replace('_', ' ')}</span>
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          rule.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {rule.active ? 'Active' : 'Disabled'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tier Management</h1>
          <p className="text-gray-600 mt-2">Manage customer loyalty tiers and points rules</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRetry}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4 inline mr-1" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5 inline mr-2" />
            Create New Tier
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('tiers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tiers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏆 Loyalty Tiers
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚙️ Point Rules Engine
          </button>
        </nav>
      </div>

      {activeTab === 'tiers' && (
        <div className="space-y-6">
          {/* Tier Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Tiers</p>
                  <p className="text-3xl font-bold text-blue-900">{tiers.length}</p>
                </div>
                <Award className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Active Tiers</p>
                  <p className="text-3xl font-bold text-green-900">{tiers.filter(t => t.isActive).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Total Benefits</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {tiers.reduce((sum, tier) => sum + tier.benefits.length, 0)}
                  </p>
                </div>
                <Gift className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Tier List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tiers.map((tier) => (
              <TierCard key={tier.id} tier={tier} />
            ))}
          </div>

          {tiers.length === 0 && (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900">No tiers yet</h3>
              <p className="text-sm text-gray-500 mt-2">Get started by creating your first loyalty tier</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Rules Tab Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Point Rules Engine</h2>
              <p className="text-gray-600 mt-1">Configure automatic point calculation rules for your customers</p>
            </div>
            <button
              onClick={() => setShowBasicRuleModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Settings className="h-5 w-5 inline mr-2" />
              Create Rule
            </button>
          </div>

          {/* Point Rules Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Active Rules</p>
                  <p className="text-3xl font-bold text-green-900">{pointRules.filter(r => r.active).length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Rules</p>
                  <p className="text-3xl font-bold text-blue-900">{pointRules.length}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Categories</p>
                  <p className="text-3xl font-bold text-orange-900">2</p>
                </div>
                <Calculator className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Point Rules List */}
          <div className="space-y-4">
            {pointRules.map((rule) => (
              <PointRuleCard key={rule.id} rule={rule} />
            ))}
          </div>

          {pointRules.length === 0 && (
            <div className="text-center py-12">
              <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900">No point rules</h3>
              <p className="text-sm text-gray-500 mt-2">Create rules to automate points calculation</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Tier Modal */}
      {(showCreateModal || editingTier) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTier ? 'Edit Tier' : 'Create Advanced Loyalty Tier'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTier(null);
                    resetNewTier();
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Basic Configuration */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Basic Configuration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tier Name *</label>
                      <input
                        type="text"
                        value={newTier.name}
                        onChange={(e) => setNewTier({...newTier, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., VIP Customer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                      <input
                        type="text"
                        value={newTier.displayName}
                        onChange={(e) => setNewTier({...newTier, displayName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 🌟 VIP"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newTier.description}
                      onChange={(e) => setNewTier({...newTier, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the tier and its value proposition..."
                    />
                  </div>
                </div>

                {/* Visual Design */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-purple-600" />
                    Visual Design
                  </h3>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                    <input
                      type="color"
                      value={newTier.color}
                      onChange={(e) => setNewTier({...newTier, color: e.target.value})}
                      className="w-full h-12 border border-gray-300 rounded-xl cursor-pointer"
                    />
                  </div>

                  {/* Icon Selection */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>

                    {/* Icon Preview */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div
                        className="w-16 h-16 border-2 border-gray-300 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: newTier.color + '20' }}
                      >
                        {newTier.customIconPreview ? (
                          <img
                            src={newTier.customIconPreview}
                            alt="Custom Icon"
                            className="w-12 h-12 object-contain rounded"
                          />
                        ) : (
                          <span className="text-2xl">
                            {newTier.icon === 'crown' ? '👑' :
                             newTier.icon === 'star' ? '⭐' :
                             newTier.icon === 'diamond' ? '💎' :
                             newTier.icon === 'trophy' ? '🏆' :
                             newTier.icon === 'medal' ? '🥇' :
                             newTier.icon === 'badge' ? '🏅' :
                             newTier.icon === 'shield' ? '🛡️' :
                             newTier.icon === 'key' ? '🔑' :
                             '👑'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div className="font-medium">Icon Preview</div>
                        <div className="text-xs">
                          {newTier.customIconPreview ? 'Custom Icon' : 'Selected Icon'}
                        </div>
                      </div>
                    </div>

                    {/* Icon Options Tabs */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setNewTier({...newTier, icon: 'crown', customIcon: null, customIconPreview: null})}
                            className={`px-3 py-1 text-sm rounded ${newTier.icon === 'crown' && !newTier.customIconPreview ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                          >
                            Predefined Icons
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewTier({...newTier, icon: 'custom', customIcon: null, customIconPreview: null})}
                            className={`px-3 py-1 text-sm rounded ${newTier.customIconPreview ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                          >
                            Custom Icon
                          </button>
                        </div>
                      </div>

                      {/* Predefined Icons Grid */}
                      {!newTier.customIconPreview && (
                        <div className="p-4">
                          <div className="grid grid-cols-4 gap-4">
                            {[
                              { value: 'crown', emoji: '👑', label: 'Crown' },
                              { value: 'star', emoji: '⭐', label: 'Star' },
                              { value: 'diamond', emoji: '💎', label: 'Diamond' },
                              { value: 'trophy', emoji: '🏆', label: 'Trophy' },
                              { value: 'medal', emoji: '🥇', label: 'Medal' },
                              { value: 'badge', emoji: '🏅', label: 'Badge' },
                              { value: 'shield', emoji: '🛡️', label: 'Shield' },
                              { value: 'key', emoji: '🔑', label: 'Key' }
                            ].map((iconOption) => (
                              <button
                                key={iconOption.value}
                                type="button"
                                onClick={() => setNewTier({...newTier, icon: iconOption.value, customIcon: null, customIconPreview: null})}
                                className={`p-3 border-2 rounded-lg text-center hover:border-blue-500 transition-colors ${
                                  newTier.icon === iconOption.value ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                              >
                                <div className="text-2xl mb-1">{iconOption.emoji}</div>
                                <div className="text-xs text-gray-600">{iconOption.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Custom Icon Upload */}
                      {newTier.icon === 'custom' || newTier.customIconPreview && (
                        <div className="p-4">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Custom Icon</label>
                              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                                <div className="space-y-2 text-center">
                                  {newTier.customIconPreview ? (
                                    <div className="flex flex-col items-center">
                                      <img
                                        src={newTier.customIconPreview}
                                        alt="Custom Icon Preview"
                                        className="w-20 h-20 object-contain mb-4 rounded"
                                      />
                                      <div className="flex space-x-2">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleIconUpload(e)}
                                          className="hidden"
                                          id="icon-upload"
                                        />
                                        <label
                                          htmlFor="icon-upload"
                                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 cursor-pointer"
                                        >
                                          Change Icon
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => setNewTier({...newTier, customIcon: null, customIconPreview: null, icon: 'crown'})}
                                          className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                        >
                                          Remove Custom
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <div className="mx-auto h-12 w-12 text-gray-400">
                                        <svg className="h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleIconUpload(e)}
                                          className="hidden"
                                          id="icon-upload"
                                        />
                                        <label
                                          htmlFor="icon-upload"
                                          className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                          Upload Icon
                                        </label>
                                        <p className="mt-2">or drag and drop</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, SVG, WebP up to 5MB</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {newTier.customIcon && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center text-green-800 text-sm">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Custom icon uploaded successfully
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Points Range & Merit Requirements */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Points Range & Requirements
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Points</label>
                      <input
                        type="number"
                        value={newTier.minPoints}
                        onChange={(e) => setNewTier({...newTier, minPoints: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Points</label>
                      <input
                        type="number"
                        value={newTier.maxPoints}
                        onChange={(e) => setNewTier({...newTier, maxPoints: parseInt(e.target.value) || 9999})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="499"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Merit Rules</label>
                    <div className="space-y-3">
                      {newTier.meritRules.slice(1).map((rule, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <input
                            type="text"
                            value={rule.condition}
                            onChange={(e) => {
                              const updatedRules = [...newTier.meritRules];
                              updatedRules[index + 1].condition = e.target.value;
                              setNewTier({...newTier, meritRules: updatedRules});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="e.g., Must have 10+ purchases"
                          />
                          <button
                            onClick={() => {
                              const updatedRules = newTier.meritRules.filter((_, i) => i !== index + 1);
                              setNewTier({...newTier, meritRules: updatedRules});
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const updatedRules = [...newTier.meritRules, {
                            type: 'custom',
                            condition: '',
                            timeframe: 'lifetime'
                          }];
                          setNewTier({...newTier, meritRules: updatedRules});
                        }}
                        className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-blue-300"
                      >
                        <Plus className="h-4 w-4 inline mr-1" />
                        Add Merit Rule
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Benefits Configuration */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-orange-600" />
                    Advanced Benefits
                  </h3>

                  <div className="space-y-4">
                    {newTier.benefits.map((benefit, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                            <select
                              value={benefit.type}
                              onChange={(e) => {
                                const updatedBenefits = [...newTier.benefits];
                                updatedBenefits[index].type = e.target.value;
                                setNewTier({...newTier, benefits: updatedBenefits});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              <option value="discount">Discount %</option>
                              <option value="free_shipping">Free Shipping</option>
                              <option value="bonus_points">Bonus Points</option>
                              <option value="priority">Priority Service</option>
                              <option value="early_access">Early Access</option>
                              <option value="custom">Custom Benefit</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Benefit Name</label>
                            <input
                              type="text"
                              value={benefit.name}
                              onChange={(e) => {
                                const updatedBenefits = [...newTier.benefits];
                                updatedBenefits[index].name = e.target.value;
                                setNewTier({...newTier, benefits: updatedBenefits});
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              placeholder="e.g., 10% Discount"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            {benefit.type === 'discount' || benefit.type === 'bonus_points' ? (
                              <>
                                <input
                                  type="number"
                                  value={benefit.value || ''}
                                  onChange={(e) => {
                                    const updatedBenefits = [...newTier.benefits];
                                    updatedBenefits[index].value = parseFloat(e.target.value) || 0;
                                    setNewTier({...newTier, benefits: updatedBenefits});
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm w-16"
                                  placeholder="10"
                                />
                                <span className="text-xs text-gray-500">
                                  {benefit.type === 'discount' ? '%' : 'pts'}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-gray-500">No value</span>
                            )}

                            {newTier.benefits.length > 1 && (
                              <button
                                onClick={() => {
                                  const updatedBenefits = newTier.benefits.filter((_, i) => i !== index);
                                  setNewTier({...newTier, benefits: updatedBenefits});
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                          <input
                            type="text"
                            value={benefit.description}
                            onChange={(e) => {
                              const updatedBenefits = [...newTier.benefits];
                              updatedBenefits[index].description = e.target.value;
                              setNewTier({...newTier, benefits: updatedBenefits});
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Detailed description of the benefit..."
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => setNewTier({
                        ...newTier,
                        benefits: [
                          ...newTier.benefits,
                          {
                            type: 'discount',
                            name: 'New Benefit',
                            value: 0,
                            description: ''
                          }
                        ]
                      })}
                      className="px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 w-full"
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      Add Advanced Benefit
                    </button>
                  </div>
                </div>

                {/* Settings & Activation */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gray-600" />
                    Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tier Priority/Order</label>
                      <input
                        type="number"
                        value={newTier.tierOrder}
                        onChange={(e) => setNewTier({...newTier, tierOrder: parseInt(e.target.value) || 1})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1"
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Lower numbers = higher priority</p>
                    </div>

                    <div className="flex items-center space-x-3 pt-8">
                      <input
                        type="checkbox"
                        id="tierActive"
                        checked={newTier.isActive}
                        onChange={(e) => setNewTier({...newTier, isActive: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="tierActive" className="text-sm font-medium text-gray-700">Activate Tier</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTier(null);
                    resetNewTier();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTier ? handleUpdateTier : handleCreateTier}
                  disabled={!newTier.name.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  {editingTier ? 'Update Tier' : 'Create Advanced Tier'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Point Rules Engine Modal */}
      {(showCreateRuleModal || editingPointRule) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Calculator className="h-8 w-8 mr-3 text-green-600" />
                  {editingPointRule ? 'Edit Advanced Point Rule' : 'Advanced Point Rules Engine'}
                </h2>
                <button
                  onClick={() => {
                    // Safe modal close with state validation
                    try {
                      setShowCreateRuleModal(false);
                      setEditingPointRule(null);
                      resetNewPointRule();
                      console.log('Modal closed successfully');
                    } catch (error) {
                      console.error('Error closing modal:', error);
                      // Force close on error
                      setShowCreateRuleModal(false);
                      setEditingPointRule(null);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Rule Configuration Tabs */}
                <div className="border border-gray-200 rounded-2xl">
                  <div className="bg-gray-50 border-b border-gray-200">
                    <nav className="flex px-6 py-4" id="ruleTabs">
                      <button
                        onClick={() => setActiveRuleTab('basic')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg mr-2 transition-colors ${
                          activeRuleTab === 'basic' ? 'text-gray-900 bg-white' : 'text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        📝 Basic Settings
                      </button>
                      <button
                        onClick={() => setActiveRuleTab('triggers')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg mr-2 transition-colors ${
                          activeRuleTab === 'triggers' ? 'text-gray-900 bg-white' : 'text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        🎯 Point Triggers
                      </button>
                      <button
                        onClick={() => setActiveRuleTab('limits')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg mr-2 transition-colors ${
                          activeRuleTab === 'limits' ? 'text-gray-900 bg-white' : 'text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        📏 Usage Limits
                      </button>
                      <button
                        onClick={() => setActiveRuleTab('schedule')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg mr-2 transition-colors ${
                          activeRuleTab === 'schedule' ? 'text-gray-900 bg-white' : 'text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        🕒 Schedule & Time
                      </button>
                      <button
                        onClick={() => setActiveRuleTab('advanced')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeRuleTab === 'advanced' ? 'text-gray-900 bg-white' : 'text-gray-600 bg-transparent hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        🎛️ Advanced Options
                      </button>
                    </nav>
                  </div>

                  <div className="p-6">
                    {/* Basic Settings Tab */}
                    {activeRuleTab === 'basic' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name *</label>
                            <input
                              type="text"
                              value={newPointRule.name}
                              onChange={(e) => setNewPointRule({...newPointRule, name: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="e.g., Prescription Bonus Points"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type</label>
                            <select
                              value={newPointRule.type}
                              onChange={(e) => setNewPointRule({...newPointRule, type: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="product_category">Product Category Bonus</option>
                              <option value="order_value">Order Value Threshold</option>
                              <option value="visit_milestone">Visit Milestone Bonus</option>
                              <option value="time_based">Time-based Bonus</option>
                              <option value="loyalty_tier">Loyalty Tier Multiplier</option>
                              <option value="combined_purchase">Combined Purchase</option>
                              <option value="bulk_purchase">Bulk Purchase Discount</option>
                              <option value="referral">Referral Points</option>
                              <option value="birthday_special">Birthday Special</option>
                              <option value="first_purchase">First Purchase Welcome</option>
                              <option value="loyalty_anniversary">Loyalty Anniversary</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={newPointRule.description}
                            onChange={(e) => setNewPointRule({...newPointRule, description: e.target.value})}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Describe when this rule triggers and what points are awarded..."
                          />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                            <Calculator className="h-4 w-4 mr-2" />
                            Custom Points Settings
                          </h5>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Base Points *</label>
                              <input
                                type="number"
                                value={newPointRule.pointsConfiguration.basePoints}
                                onChange={(e) => setNewPointRule({
                                  ...newPointRule,
                                  pointsConfiguration: {
                                    ...newPointRule.pointsConfiguration,
                                    basePoints: parseInt(e.target.value) || 0
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="0"
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Bonus Points</label>
                              <input
                                type="number"
                                value={newPointRule.pointsConfiguration.bonusPoints}
                                onChange={(e) => setNewPointRule({
                                  ...newPointRule,
                                  pointsConfiguration: {
                                    ...newPointRule.pointsConfiguration,
                                    bonusPoints: parseInt(e.target.value) || 0
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="0"
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Min Purchase Amount</label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                  type="number"
                                  value={newPointRule.pointsConfiguration.minimumPurchaseAmount}
                                  onChange={(e) => setNewPointRule({
                                    ...newPointRule,
                                    pointsConfiguration: {
                                      ...newPointRule.pointsConfiguration,
                                      minimumPurchaseAmount: parseFloat(e.target.value) || 0
                                    }
                                  })}
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="0.00"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Max Points Per Transaction</label>
                              <input
                                type="number"
                                value={newPointRule.pointsConfiguration.maximumPointsPerTransaction}
                                onChange={(e) => setNewPointRule({
                                  ...newPointRule,
                                  pointsConfiguration: {
                                    ...newPointRule.pointsConfiguration,
                                    maximumPointsPerTransaction: parseInt(e.target.value) || 0
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="100"
                                min="0"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Point Multiplier</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={newPointRule.pointsConfiguration.pointMultiplier}
                                  onChange={(e) => setNewPointRule({
                                    ...newPointRule,
                                    pointsConfiguration: {
                                      ...newPointRule.pointsConfiguration,
                                      pointMultiplier: parseFloat(e.target.value) || 1.0
                                    }
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="1.0"
                                  step="0.1"
                                  min="0"
                                />
                                <span className="text-xs text-gray-500">x</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Rounding Rule</label>
                              <select
                                value={newPointRule.pointsConfiguration.roundingRule}
                                onChange={(e) => setNewPointRule({
                                  ...newPointRule,
                                  pointsConfiguration: {
                                    ...newPointRule.pointsConfiguration,
                                    roundingRule: e.target.value
                                  }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="nearest">Round to nearest</option>
                                <option value="up">Always round up</option>
                                <option value="down">Always round down</option>
                                <option value="none">No rounding</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="ruleActive"
                            checked={newPointRule.active}
                            onChange={(e) => setNewPointRule({...newPointRule, active: e.target.checked})}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <label htmlFor="ruleActive" className="text-sm font-medium text-gray-700">Activate This Rule</label>
                        </div>
                      </div>
                    )} {/* This was missing */}

                    {/* Point Triggers Tab */}
                    {activeRuleTab === 'triggers' && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Point Earning Triggers</h4>

                        <div className="space-y-4">
                          {newPointRule.triggers.map((trigger, index) => (
                            <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Trigger Type</label>
                                  <select
                                    value={trigger.conditionType}
                                    onChange={(e) => {
                                      const updatedTriggers = [...newPointRule.triggers];
                                      updatedTriggers[index].conditionType = e.target.value;
                                      setNewPointRule({...newPointRule, triggers: updatedTriggers});
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  >
                                    <option value="category">Product Category</option>
                                    <option value="specific_product">Specific Product</option>
                                    <option value="brand">Brand Name</option>
                                    <option value="price_range">Price Range</option>
                                    <option value="purchase_amount">Purchase Amount</option>
                                    <option value="visit_count">Visit Count</option>
                                    <option value="time_of_day">Time of Day</option>
                                  </select>
                                </div>

                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
                                  <input
                                    type="text"
                                    value={trigger.category}
                                    onChange={(e) => {
                                      const updatedTriggers = [...newPointRule.triggers];
                                      updatedTriggers[index].category = e.target.value;
                                      setNewPointRule({...newPointRule, triggers: updatedTriggers});
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="e.g., Prescription, OTC, Medical"
                                  />
                                </div>

                                <div className="flex items-center space-x-2">
                                  <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Points</label>
                                    <input
                                      type="number"
                                      value={trigger.points}
                                      onChange={(e) => {
                                        const updatedTriggers = [...newPointRule.triggers];
                                        updatedTriggers[index].points = parseInt(e.target.value) || 0;
                                        setNewPointRule({...newPointRule, triggers: updatedTriggers});
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      placeholder="10"
                                    />
                                  </div>

                                  {newPointRule.triggers.length > 1 && (
                                    <button
                                      onClick={() => {
                                        const updatedTriggers = newPointRule.triggers.filter((_, i) => i !== index);
                                        setNewPointRule({...newPointRule, triggers: updatedTriggers});
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded mt-4"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
                                  <select
                                    value={trigger.operator}
                                    onChange={(e) => {
                                      const updatedTriggers = [...newPointRule.triggers];
                                      updatedTriggers[index].operator = e.target.value;
                                      setNewPointRule({...newPointRule, triggers: updatedTriggers});
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  >
                                    <option value="contains">Contains</option>
                                    <option value="equals">Equals</option>
                                    <option value="starts_with">Starts With</option>
                                    <option value="ends_with">Ends With</option>
                                    <option value="greater_than">Greater Than</option>
                                    <option value="less_than">Less Than</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Multiplier</label>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="number"
                                      value={trigger.multiplier}
                                      onChange={(e) => {
                                        const updatedTriggers = [...newPointRule.triggers];
                                        updatedTriggers[index].multiplier = parseFloat(e.target.value) || 1.0;
                                        setNewPointRule({...newPointRule, triggers: updatedTriggers});
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      placeholder="1.0"
                                      step="0.1"
                                    />
                                    <span className="text-xs text-gray-500">x</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            const updatedTriggers = [...newPointRule.triggers, {
                              conditionType: 'category',
                              category: 'New Category',
                              operator: 'contains',
                              points: 0,
                              multiplier: 1.0
                            }];
                            setNewPointRule({...newPointRule, triggers: updatedTriggers});
                          }}
                          className="w-full px-4 py-3 text-sm text-green-600 hover:bg-green-50 rounded-xl border-2 border-dashed border-green-300"
                        >
                          <Plus className="h-4 w-4 inline mr-2" />
                          Add New Trigger
                        </button>
                      </div>
                    )}

                    {/* Usage Limits Tab */}
                    {activeRuleTab === 'limits' && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Usage Limits & Restrictions</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Points Per Day</label>
                            <input
                              type="number"
                              value={newPointRule.limits.maxPointsPerDay}
                              onChange={(e) => setNewPointRule({
                                ...newPointRule,
                                limits: {...newPointRule.limits, maxPointsPerDay: parseInt(e.target.value) || 0}
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="1000"
                            />
                            <p className="text-xs text-gray-500 mt-1">Set 0 for no daily limit</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Points Per Month</label>
                            <input
                              type="number"
                              value={newPointRule.limits.maxPointsPerMonth}
                              onChange={(e) => setNewPointRule({
                                ...newPointRule,
                                limits: {...newPointRule.limits, maxPointsPerMonth: parseInt(e.target.value) || 0}
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="5000"
                            />
                            <p className="text-xs text-gray-500 mt-1">Set 0 for no monthly limit</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Uses</label>
                          <input
                            type="number"
                            value={newPointRule.limits.maxUses}
                            onChange={(e) => setNewPointRule({
                              ...newPointRule,
                              limits: {...newPointRule.limits, maxUses: parseInt(e.target.value) || 0}
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="100"
                          />
                          <p className="text-xs text-gray-500 mt-1">Total times this rule can trigger (set 0 for unlimited)</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h5 className="text-sm font-medium text-blue-900">Usage Tracking</h5>
                              <p className="text-xs text-blue-700 mt-1">
                                These limits help prevent gaming of the point system and ensure fair distribution.
                                The system will automatically track and enforce these limits across all customers.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Schedule & Time Tab */}
                    {activeRuleTab === 'schedule' && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Schedule & Time Restrictions</h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Active Days</label>
                          <div className="grid grid-cols-7 gap-2">
                            {[
                              { key: 'monday', label: 'Mon' },
                              { key: 'tuesday', label: 'Tue' },
                              { key: 'wednesday', label: 'Wed' },
                              { key: 'thursday', label: 'Thu' },
                              { key: 'friday', label: 'Fri' },
                              { key: 'saturday', label: 'Sat' },
                              { key: 'sunday', label: 'Sun' }
                            ].map((day) => (
                              <button
                                key={day.key}
                                type="button"
                                onClick={() => {
                                  const updatedDays = newPointRule.scheduling.activeDays.includes(day.key)
                                    ? newPointRule.scheduling.activeDays.filter(d => d !== day.key)
                                    : [...newPointRule.scheduling.activeDays, day.key];
                                  setNewPointRule({
                                    ...newPointRule,
                                    scheduling: {...newPointRule.scheduling, activeDays: updatedDays}
                                  });
                                }}
                                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                                  newPointRule.scheduling.activeDays.includes(day.key)
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                            <input
                              type="time"
                              value={newPointRule.scheduling.startTime}
                              onChange={(e) => setNewPointRule({
                                ...newPointRule,
                                scheduling: {...newPointRule.scheduling, startTime: e.target.value}
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                            <input
                              type="time"
                              value={newPointRule.scheduling.endTime}
                              onChange={(e) => setNewPointRule({
                                ...newPointRule,
                                scheduling: {...newPointRule.scheduling, endTime: e.target.value}
                              })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                              <h5 className="text-sm font-medium text-yellow-900">Time-based Earnings</h5>
                              <p className="text-xs text-yellow-700 mt-1">
                                Set specific days and times when this rule should be active. For example,
                                "Double points on weekends" or "Happy hour bonus discounts".
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Advanced Options Tab */}
                    {activeRuleTab === 'advanced' && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">Advanced Rule Configuration</h4>

                        {/* Expiry Settings */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">Point Expiry</h5>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Type</label>
                              <select
                                value={newPointRule.expiry.type}
                                onChange={(e) => setNewPointRule({
                                  ...newPointRule,
                                  expiry: {...newPointRule.expiry, type: e.target.value}
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="none">No Expiry</option>
                                <option value="days">After X Days</option>
                                <option value="end_of_year">End of Year</option>
                                <option value="end_of_quarter">End of Quarter</option>
                              </select>
                            </div>

                            {newPointRule.expiry.type === 'days' && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Days to Expiry</label>
                                <input
                                  type="number"
                                  value={newPointRule.expiry.days}
                                  onChange={(e) => setNewPointRule({
                                    ...newPointRule,
                                    expiry: {...newPointRule.expiry, days: parseInt(e.target.value) || 365}
                                  })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  placeholder="365"
                                  min="1"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stacking Rules */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">Rule Stacking</h5>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="allowStacking"
                                checked={newPointRule.stacking.allowStacking}
                                onChange={(e) => setNewPointRule({
                                  ...newPointRule,
                                  stacking: {...newPointRule.stacking, allowStacking: e.target.checked}
                                })}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label htmlFor="allowStacking" className="text-sm font-medium text-gray-700">
                                Allow stacking with other rules
                              </label>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Priority Level</label>
                              <input
                                type="number"
                                value={newPointRule.stacking.priority}
                                onChange={(e) => setNewPointRule({
                                  ...newPointRule,
                                  stacking: {...newPointRule.stacking, priority: parseInt(e.target.value) || 1}
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="1"
                                min="1"
                              />
                              <p className="text-xs text-gray-500 mt-1">Higher numbers = higher priority (1-10)</p>
                            </div>
                          </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h5 className="text-sm font-semibold text-gray-700 mb-3">Notifications & Alerts</h5>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="customerEmail"
                                checked={newPointRule.notifications.customerEmail}
                                onChange={(e) => setNewPointRule({
                                  ...newPointRule,
                                  notifications: {...newPointRule.notifications, customerEmail: e.target.checked}
                                })}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label htmlFor="customerEmail" className="text-sm font-medium text-gray-700">
                                Send email notifications to customers
                              </label>
                            </div>

                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id="staffNotification"
                                checked={newPointRule.notifications.staffNotification}
                                onChange={(e) => setNewPointRule({
                                  ...newPointRule,
                                  notifications: {...newPointRule.notifications, staffNotification: e.target.checked}
                                })}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label htmlFor="staffNotification" className="text-sm font-medium text-gray-700">
                                Notify staff when rule triggers
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowCreateRuleModal(false);
                      setEditingPointRule(null);
                      resetNewPointRule();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingPointRule ? handleUpdatePointRule : handleCreatePointRule}
                    disabled={!newPointRule.name.trim()}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    {editingPointRule ? 'Update Advanced Rule' : 'Create Advanced Rule'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Confirmation</h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this {confirmDelete.type}?
                  </p>
                </div>
              </div>

              <div className="mb-6 text-sm text-gray-700">
                <strong>{confirmDelete.item.name}</strong>
                {confirmDelete.type === 'tier' && (
                  <div className="mt-2">
                    <p>• Minimum Points: {confirmDelete.item.minPoints}</p>
                    <p>• Benefits: {confirmDelete.item.benefits.length}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteItem}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete {confirmDelete.type === 'tier' ? 'Tier' : 'Rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic Rule Creation Modal */}
      {showBasicRuleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Calculator className="h-8 w-8 mr-3 text-green-600" />
                  Create New Point Rule
                </h2>
                <button
                  onClick={() => setShowBasicRuleModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name *</label>
                    <input
                      type="text"
                      value={newPointRule.name}
                      onChange={(e) => setNewPointRule({...newPointRule, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Prescription Bonus Points"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type</label>
                    <select
                      value={newPointRule.type}
                      onChange={(e) => setNewPointRule({...newPointRule, type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="product_category">Product Category Bonus</option>
                      <option value="order_value">Order Value Threshold</option>
                      <option value="visit_milestone">Visit Milestone Bonus</option>
                      <option value="time_based">Time-based Bonus</option>
                      <option value="loyalty_tier">Loyalty Tier Multiplier</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newPointRule.description}
                    onChange={(e) => setNewPointRule({...newPointRule, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe when this rule triggers and what points are awarded..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                    <Calculator className="h-4 w-4 mr-2" />
                    Points Configuration
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Base Points</label>
                      <input
                        type="number"
                        value={newPointRule.pointsConfiguration?.basePoints || 0}
                        onChange={(e) => setNewPointRule({
                          ...newPointRule,
                          pointsConfiguration: {
                            ...newPointRule.pointsConfiguration,
                            basePoints: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Point Multiplier</label>
                      <input
                        type="number"
                        value={newPointRule.pointsConfiguration?.pointMultiplier || 1.0}
                        onChange={(e) => setNewPointRule({
                          ...newPointRule,
                          pointsConfiguration: {
                            ...newPointRule.pointsConfiguration,
                            pointMultiplier: parseFloat(e.target.value) || 1.0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="1.0"
                        step="0.1"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Min Purchase Amount</label>
                      <input
                        type="number"
                        value={newPointRule.pointsConfiguration?.minimumPurchaseAmount || 0}
                        onChange={(e) => setNewPointRule({
                          ...newPointRule,
                          pointsConfiguration: {
                            ...newPointRule.pointsConfiguration,
                            minimumPurchaseAmount: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="basicRuleActive"
                    checked={newPointRule.active}
                    onChange={(e) => setNewPointRule({...newPointRule, active: e.target.checked})}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="basicRuleActive" className="text-sm font-medium text-gray-700">Activate This Rule</label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowBasicRuleModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleCreatePointRule();
                      setShowBasicRuleModal(false);
                    }}
                    disabled={!newPointRule.name.trim()}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 inline mr-2" />
                    Create Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TierManagement;
