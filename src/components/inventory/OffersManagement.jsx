import React, { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  Package,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  Filter,
  Search,
  Tag,
  ShoppingCart,
  Target,
  Zap,
  Settings,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  X,
  PlusCircle,
  MinusCircle,
  Wand2,
  BarChart3,
  Users as UsersIcon,
  ShoppingBag,
  Timer,
  MapPin,
  Star,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('offers');

  // Enhanced Form states with advanced features
  const [offerForm, setOfferForm] = useState({
    name: '',
    type: 'custom',
    description: '',
    isActive: true,

    // Advanced Scheduling
    schedule: {
      startDate: '',
      endDate: '',
      daysOfWeek: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      },
      timeBlocks: [],
      dateRanges: []
    },

    // Advanced Targeting
    targeting: {
      customerTypes: [],
      purchaseHistory: {
        minOrders: 0,
        minSpent: 0,
        specificProducts: [],
        timeFrame: 'all_time'
      },
      cartConditions: {
        minimumItems: 0,
        minimumSpend: 0,
        categories: [],
        specificProducts: [],
        maxDiscountItems: 0
      },
      exclusions: {
        products: [],
        categories: [],
        customers: []
      }
    },

    // Custom Rules Engine
    rules: [],

    // Product Selection
    productSelection: {
      include: {
        specific: [],
        categories: [],
        tags: [],
        price_range: { min: 0, max: 0 },
        stock_status: 'any'
      },
      exclude: {
        specific: [],
        categories: [],
        tags: []
      },
      quantity_rules: {
        minimum: 1,
        maximum: 0,
        multiple_of: 1,
        recommended: 0
      }
    },

    // Offer Actions
    actions: [],

    // Advanced Settings
    settings: {
      usageLimit: 0,
      stacking: true,
      priority: 1,
      autoApply: true,
      requiresCode: false,
      code: '',
      maxUsesPerCustomer: 0
    },

    // Analytics
    analytics: {
      redemptions: 0,
      totalSavings: 0,
      revenueImpact: 0,
      roi: 0
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offersRes, productsRes, categoriesRes] = await Promise.all([
        api.get('/offers'),
        api.get('/products'),
        api.get('/categories')
      ]);

      setOffers(offersRes.data || []);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load offers data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    try {
      const response = await api.post('/offers', offerForm);
      setOffers([...offers, response.data]);
      setShowCreateDialog(false);
      resetForm();
      toast.success('Offer created successfully');
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Failed to create offer');
    }
  };

  const handleUpdateOffer = async () => {
    try {
      const response = await api.put(`/offers/${selectedOffer.id}`, offerForm);
      setOffers(offers.map(offer =>
        offer.id === selectedOffer.id ? response.data : offer
      ));
      setShowEditDialog(false);
      setSelectedOffer(null);
      resetForm();
      toast.success('Offer updated successfully');
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('Failed to update offer');
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      await api.delete(`/offers/${offerId}`);
      setOffers(offers.filter(offer => offer.id !== offerId));
      toast.success('Offer deleted successfully');
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Failed to delete offer');
    }
  };

  const handleDuplicateOffer = (offer) => {
    const duplicatedOffer = {
      ...offer,
      id: undefined,
      name: `${offer.name} (Copy)`,
      isActive: false
    };
    setOfferForm(duplicatedOffer);
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setOfferForm({
      name: '',
      type: 'combo',
      description: '',
      isActive: true,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      daysOfWeek: [],
      minimumPurchase: 0,
      maximumDiscount: 0,
      customerGroups: [],
      usageLimit: 0,
      comboItems: [],
      comboPrice: 0,
      discountPercent: 0,
      targetItems: [],
      targetCategories: [],
      buyQuantity: 1,
      getQuantity: 1,
      buyItems: [],
      getItems: [],
      fixedPrice: 0,
      fixedItems: []
    });
  };

  const getOfferTypeIcon = (type) => {
    switch (type) {
      case 'combo': return <Package className="w-4 h-4" />;
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'bogo': return <Gift className="w-4 h-4" />;
      case 'fixed': return <DollarSign className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getOfferTypeColor = (type) => {
    switch (type) {
      case 'combo': return 'bg-blue-100 text-blue-800';
      case 'percentage': return 'bg-green-100 text-green-800';
      case 'bogo': return 'bg-purple-100 text-purple-800';
      case 'fixed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSavings = (offer) => {
    // This would be calculated based on offer type and items
    return 0;
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    if (filter === 'active') return offer.isActive;
    if (filter === 'inactive') return !offer.isActive;
    if (filter === 'combo') return offer.type === 'combo';
    if (filter === 'percentage') return offer.type === 'percentage';
    if (filter === 'bogo') return offer.type === 'bogo';
    if (filter === 'fixed') return offer.type === 'fixed';
    return true;
  }).filter(offer =>
    offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎯 Advanced Offers Management</h2>
          <p className="text-gray-600 mt-1">Create unlimited custom offers with advanced targeting and scheduling</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowRuleBuilder(true)}
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Rule Builder
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-600" />
                  Create Advanced Custom Offer
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Build unlimited custom offers with advanced conditions and targeting
                </p>
              </DialogHeader>
              <EnhancedOfferForm
                form={offerForm}
                setForm={setOfferForm}
                products={products}
                categories={categories}
                onSubmit={handleCreateOffer}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="offers" className="flex items-center">
            <Gift className="w-4 h-4 mr-2" />
            Offers ({offers.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Rules Engine
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center">
            <Copy className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Offers Tab */}
        <TabsContent value="offers" className="mt-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search offers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Offers</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                    <SelectItem value="custom">Custom Offers</SelectItem>
                    <SelectItem value="combo">Combo Offers</SelectItem>
                    <SelectItem value="percentage">Percentage Discounts</SelectItem>
                    <SelectItem value="bogo">Buy One Get One</SelectItem>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredOffers.map(offer => (
              <Card key={offer.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getOfferTypeIcon(offer.type)}
                      <CardTitle className="text-lg font-semibold">{offer.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={offer.isActive}
                        onCheckedChange={async (checked) => {
                          try {
                            await api.patch(`/offers/${offer.id}`, { isActive: checked });
                            setOffers(offers.map(o =>
                              o.id === offer.id ? { ...o, isActive: checked } : o
                            ));
                            toast.success(`Offer ${checked ? 'activated' : 'deactivated'}`);
                          } catch (error) {
                            toast.error('Failed to update offer status');
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getOfferTypeColor(offer.type)} font-medium`}>
                      {offer.type.toUpperCase()}
                    </Badge>
                    {offer.isActive ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    {offer.settings?.requiresCode && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        <Tag className="w-3 h-3 mr-1" />
                        Code Required
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {offer.description || 'No description provided'}
                  </p>

                  {/* Enhanced Offer Details */}
                  <div className="space-y-3 mb-4">
                    {offer.type === 'custom' && offer.rules && (
                      <div className="text-sm">
                        <div className="font-medium text-purple-700 mb-1">Custom Rules:</div>
                        <div className="text-xs text-gray-600 bg-purple-50 p-2 rounded">
                          {offer.rules.length} condition{offer.rules.length !== 1 ? 's' : ''} applied
                        </div>
                      </div>
                    )}

                    {offer.type === 'combo' && (
                      <div className="text-sm">
                        <div className="font-medium text-blue-700">Combo Price:</div>
                        <div className="text-lg font-bold text-blue-600">${offer.comboPrice?.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{offer.comboItems?.length || 0} items included</div>
                      </div>
                    )}

                    {offer.type === 'percentage' && (
                      <div className="text-sm">
                        <div className="font-medium text-green-700">{offer.discountPercent}% Discount</div>
                        <div className="text-xs text-gray-500">
                          {offer.targetItems?.length || 0} items, {offer.targetCategories?.length || 0} categories
                        </div>
                      </div>
                    )}

                    {offer.type === 'bogo' && (
                      <div className="text-sm">
                        <div className="font-medium text-purple-700">
                          Buy {offer.buyQuantity}, Get {offer.getQuantity} Free
                        </div>
                        <div className="text-xs text-gray-500">
                          {offer.buyItems?.length || 0} qualifying items
                        </div>
                      </div>
                    )}

                    {offer.type === 'fixed' && (
                      <div className="text-sm">
                        <div className="font-medium text-orange-700">Fixed Bundle Price:</div>
                        <div className="text-lg font-bold text-orange-600">${offer.fixedPrice?.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{offer.fixedItems?.length || 0} items included</div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Schedule & Targeting Info */}
                  <div className="space-y-2 mb-4">
                    {(offer.schedule?.startDate || offer.schedule?.endDate) && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {offer.schedule.startDate && new Date(offer.schedule.startDate).toLocaleDateString()}
                        {offer.schedule.startDate && offer.schedule.endDate && ' - '}
                        {offer.schedule.endDate && new Date(offer.schedule.endDate).toLocaleDateString()}
                      </div>
                    )}

                    {offer.targeting?.customerTypes?.length > 0 && (
                      <div className="flex items-center text-xs text-gray-500">
                        <UsersIcon className="w-3 h-3 mr-1" />
                        {offer.targeting.customerTypes.length} customer type{offer.targeting.customerTypes.length !== 1 ? 's' : ''}
                      </div>
                    )}

                    {offer.analytics?.redemptions > 0 && (
                      <div className="flex items-center text-xs text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {offer.analytics.redemptions} redemptions
                      </div>
                    )}
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setOfferForm(offer);
                        setShowEditDialog(true);
                      }}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateOffer(offer)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredOffers.length === 0 && (
            <Card className="mt-6">
              <CardContent className="pt-12 pb-12 text-center">
                <Gift className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No offers found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first advanced custom offer to get started with unlimited promotions'
                  }
                </p>
                {!searchTerm && filter === 'all' && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom Offer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRuleBuilder(true)}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Use Rule Builder
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <OffersAnalytics offers={offers} />
        </TabsContent>

        {/* Rules Engine Tab */}
        <TabsContent value="rules" className="mt-6">
          <RulesEngine offers={offers} setOffers={setOffers} />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <OfferTemplates onSelectTemplate={(template) => {
            setOfferForm(template);
            setShowCreateDialog(true);
          }} />
        </TabsContent>
      </Tabs>

      {/* Enhanced Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="w-5 h-5 mr-2 text-blue-600" />
              Edit Advanced Offer
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Modify your custom offer with advanced conditions and targeting
            </p>
          </DialogHeader>
          {selectedOffer && (
            <EnhancedOfferForm
              form={offerForm}
              setForm={setOfferForm}
              products={products}
              categories={categories}
              onSubmit={handleUpdateOffer}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedOffer(null);
                resetForm();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rule Builder Dialog */}
      <Dialog open={showRuleBuilder} onOpenChange={setShowRuleBuilder}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Wand2 className="w-5 h-5 mr-2 text-purple-600" />
              Visual Rule Builder
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Build complex offer conditions with drag & drop simplicity
            </p>
          </DialogHeader>
          <RuleBuilder
            onSaveRule={(rule) => {
              setOfferForm(prev => ({
                ...prev,
                rules: [...(prev.rules || []), rule]
              }));
              setShowRuleBuilder(false);
              setShowCreateDialog(true);
            }}
            onCancel={() => setShowRuleBuilder(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Enhanced Offer Form Component
const EnhancedOfferForm = ({ form, setForm, products, categories, onSubmit, onCancel }) => {
  const [activeSection, setActiveSection] = useState('basic');

  const updateForm = (path, value) => {
    const keys = path.split('.');
    setForm(prev => {
      const newForm = { ...prev };
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  const sections = [
    { id: 'basic', name: 'Basic Info', icon: Info },
    { id: 'scheduling', name: 'Scheduling', icon: Calendar },
    { id: 'targeting', name: 'Targeting', icon: Target },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'rules', name: 'Rules', icon: Settings },
    { id: 'settings', name: 'Settings', icon: Zap }
  ];

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {section.name}
            </button>
          );
        })}
      </div>

      {/* Basic Information Section */}
      {activeSection === 'basic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Offer Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="e.g., Mega Weekend Deal"
              />
            </div>
            <div>
              <Label htmlFor="type">Offer Type *</Label>
              <Select value={form.type} onValueChange={(value) => updateForm('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Rules</SelectItem>
                  <SelectItem value="combo">Combo Offer</SelectItem>
                  <SelectItem value="percentage">Percentage Discount</SelectItem>
                  <SelectItem value="bogo">Buy One Get One</SelectItem>
                  <SelectItem value="fixed">Fixed Price Bundle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              placeholder="Brief description of the offer"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => updateForm('isActive', checked)}
            />
            <Label>Offer is Active</Label>
          </div>
        </div>
      )}

      {/* Scheduling Section */}
      {activeSection === 'scheduling' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Advanced Scheduling</h3>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.schedule.startDate}
                onChange={(e) => updateForm('schedule.startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={form.schedule.endDate}
                onChange={(e) => updateForm('schedule.endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Active Days</Label>
            <div className="grid grid-cols-7 gap-2">
              {Object.entries({
                monday: 'Mon',
                tuesday: 'Tue',
                wednesday: 'Wed',
                thursday: 'Thu',
                friday: 'Fri',
                saturday: 'Sat',
                sunday: 'Sun'
              }).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => updateForm(`schedule.daysOfWeek.${key}`, !form.schedule.daysOfWeek[key])}
                  className={`p-2 text-sm font-medium rounded-md border transition-colors ${
                    form.schedule.daysOfWeek[key]
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Blocks */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Time Blocks</Label>
            <div className="space-y-2">
              {form.schedule.timeBlocks.map((block, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                  <Select
                    value={block.day}
                    onValueChange={(value) => {
                      const newBlocks = [...form.schedule.timeBlocks];
                      newBlocks[index].day = value;
                      updateForm('schedule.timeBlocks', newBlocks);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="time"
                    value={block.start}
                    onChange={(e) => {
                      const newBlocks = [...form.schedule.timeBlocks];
                      newBlocks[index].start = e.target.value;
                      updateForm('schedule.timeBlocks', newBlocks);
                    }}
                    className="w-32"
                  />

                  <span className="text-gray-500">to</span>

                  <Input
                    type="time"
                    value={block.end}
                    onChange={(e) => {
                      const newBlocks = [...form.schedule.timeBlocks];
                      newBlocks[index].end = e.target.value;
                      updateForm('schedule.timeBlocks', newBlocks);
                    }}
                    className="w-32"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newBlocks = form.schedule.timeBlocks.filter((_, i) => i !== index);
                      updateForm('schedule.timeBlocks', newBlocks);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => {
                  const newBlocks = [...form.schedule.timeBlocks, { day: 'monday', start: '09:00', end: '17:00' }];
                  updateForm('schedule.timeBlocks', newBlocks);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Time Block
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Targeting Section */}
      {activeSection === 'targeting' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Advanced Targeting</h3>

          {/* Customer Types */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Customer Types</Label>
            <div className="flex flex-wrap gap-2">
              {['loyal', 'vip', 'new', 'returning', 'all'].map(type => (
                <button
                  key={type}
                  onClick={() => {
                    const currentTypes = form.targeting.customerTypes;
                    const newTypes = currentTypes.includes(type)
                      ? currentTypes.filter(t => t !== type)
                      : [...currentTypes, type];
                    updateForm('targeting.customerTypes', newTypes);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    form.targeting.customerTypes.includes(type)
                      ? 'bg-blue-100 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Purchase History */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minOrders">Minimum Orders</Label>
              <Input
                id="minOrders"
                type="number"
                value={form.targeting.purchaseHistory.minOrders}
                onChange={(e) => updateForm('targeting.purchaseHistory.minOrders', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="minSpent">Minimum Spent ($)</Label>
              <Input
                id="minSpent"
                type="number"
                step="0.01"
                value={form.targeting.purchaseHistory.minSpent}
                onChange={(e) => updateForm('targeting.purchaseHistory.minSpent', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Cart Conditions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minItems">Minimum Items</Label>
              <Input
                id="minItems"
                type="number"
                value={form.targeting.cartConditions.minimumItems}
                onChange={(e) => updateForm('targeting.cartConditions.minimumItems', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="minSpend">Minimum Cart Total ($)</Label>
              <Input
                id="minSpend"
                type="number"
                step="0.01"
                value={form.targeting.cartConditions.minimumSpend}
                onChange={(e) => updateForm('targeting.cartConditions.minimumSpend', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      {activeSection === 'products' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Product Selection</h3>

          {/* Include Products */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Include Products</Label>
            <div className="space-y-3">
              <Select
                onValueChange={(productId) => {
                  const product = products.find(p => p.id === productId);
                  if (product && !form.productSelection.include.specific.includes(productId)) {
                    updateForm('productSelection.include.specific', [
                      ...form.productSelection.include.specific,
                      productId
                    ]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add specific products..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.price?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Products */}
              <div className="flex flex-wrap gap-2">
                {form.productSelection.include.specific.map(productId => {
                  const product = products.find(p => p.id === productId);
                  return product ? (
                    <Badge key={productId} variant="secondary" className="flex items-center space-x-1">
                      <span>{product.name}</span>
                      <button
                        onClick={() => {
                          updateForm('productSelection.include.specific',
                            form.productSelection.include.specific.filter(id => id !== productId)
                          );
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice">Min Price ($)</Label>
              <Input
                id="minPrice"
                type="number"
                step="0.01"
                value={form.productSelection.include.price_range.min}
                onChange={(e) => updateForm('productSelection.include.price_range.min', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                step="0.01"
                value={form.productSelection.include.price_range.max}
                onChange={(e) => updateForm('productSelection.include.price_range.max', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Quantity Rules */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minQty">Min Quantity</Label>
              <Input
                id="minQty"
                type="number"
                value={form.productSelection.quantity_rules.minimum}
                onChange={(e) => updateForm('productSelection.quantity_rules.minimum', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="maxQty">Max Quantity</Label>
              <Input
                id="maxQty"
                type="number"
                value={form.productSelection.quantity_rules.maximum}
                onChange={(e) => updateForm('productSelection.quantity_rules.maximum', parseInt(e.target.value) || 0)}
                placeholder="0 = unlimited"
              />
            </div>
            <div>
              <Label htmlFor="multipleOf">Multiple Of</Label>
              <Input
                id="multipleOf"
                type="number"
                value={form.productSelection.quantity_rules.multiple_of}
                onChange={(e) => updateForm('productSelection.quantity_rules.multiple_of', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rules Section */}
      {activeSection === 'rules' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Custom Rules Engine</h3>
          <div className="text-center py-8 text-gray-500">
            <Settings className="mx-auto h-12 w-12 mb-4" />
            <p>Advanced rules will be configured here</p>
            <p className="text-sm mt-2">Use the Rule Builder button for visual rule creation</p>
          </div>
        </div>
      )}

      {/* Settings Section */}
      {activeSection === 'settings' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Advanced Settings</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                value={form.settings.usageLimit}
                onChange={(e) => updateForm('settings.usageLimit', parseInt(e.target.value) || 0)}
                placeholder="0 = unlimited"
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={form.settings.priority}
                onChange={(e) => updateForm('settings.priority', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.settings.autoApply}
              onCheckedChange={(checked) => updateForm('settings.autoApply', checked)}
            />
            <Label>Auto-apply at checkout</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.settings.stacking}
              onCheckedChange={(checked) => updateForm('settings.stacking', checked)}
            />
            <Label>Allow stacking with other offers</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.settings.requiresCode}
              onCheckedChange={(checked) => updateForm('settings.requiresCode', checked)}
            />
            <Label>Requires promo code</Label>
          </div>

          {form.settings.requiresCode && (
            <div>
              <Label htmlFor="promoCode">Promo Code</Label>
              <Input
                id="promoCode"
                value={form.settings.code}
                onChange={(e) => updateForm('settings.code', e.target.value)}
                placeholder="SUMMER2025"
              />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
          {form.id ? 'Update Offer' : 'Create Offer'}
        </Button>
      </div>
    </div>
  );
};

// Analytics Component
const OffersAnalytics = ({ offers }) => {
  const totalOffers = offers.length;
  const activeOffers = offers.filter(o => o.isActive).length;
  const totalRedemptions = offers.reduce((sum, o) => sum + (o.analytics?.redemptions || 0), 0);
  const totalSavings = offers.reduce((sum, o) => sum + (o.analytics?.totalSavings || 0), 0);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Offers Analytics</h3>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalOffers}</div>
              <div className="text-sm text-gray-600">Total Offers</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeOffers}</div>
              <div className="text-sm text-gray-600">Active Offers</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalRedemptions}</div>
              <div className="text-sm text-gray-600">Total Redemptions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${totalSavings.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Savings</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="mx-auto h-12 w-12 mb-4" />
            <p>Advanced analytics charts will be displayed here</p>
            <p className="text-sm mt-2">Performance metrics, ROI analysis, and trend charts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Rules Engine Component
const RulesEngine = ({ offers, setOffers }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Rules Engine</h3>
      <div className="text-center py-12 text-gray-500">
        <Settings className="mx-auto h-12 w-12 mb-4" />
        <p>Advanced rules engine interface</p>
        <p className="text-sm mt-2">Manage complex offer conditions and logic</p>
      </div>
    </div>
  );
};

// Offer Templates Component
const OfferTemplates = ({ onSelectTemplate }) => {
  const templates = [
    {
      name: 'Happy Hour Special',
      type: 'percentage',
      description: '25% off drinks during happy hour',
      discountPercent: 25,
      schedule: {
        daysOfWeek: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true },
        timeBlocks: [{ day: 'monday', start: '17:00', end: '19:00' }]
      }
    },
    {
      name: 'Family Meal Deal',
      type: 'combo',
      description: 'Burger, fries, and drink combo',
      comboItems: [],
      comboPrice: 12.99
    },
    {
      name: 'Loyalty Reward',
      type: 'percentage',
      description: 'Special discount for loyal customers',
      discountPercent: 15,
      targeting: {
        customerTypes: ['loyal', 'vip']
      }
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Offer Templates</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onSelectTemplate(template)}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardHeader>
            <CardContent>
              <Badge className="mb-3">{template.type}</Badge>
              <Button className="w-full" variant="outline">
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Rule Builder Component
const RuleBuilder = ({ onSaveRule, onCancel }) => {
  const [rule, setRule] = useState({
    condition: 'AND',
    rules: [
      {
        type: 'cart_total',
        operator: '>=',
        value: 25
      }
    ],
    action: {
      type: 'discount_percentage',
      value: 10
    }
  });

  return (
    <div className="space-y-6">
      <div className="text-center py-8 text-gray-500">
        <Wand2 className="mx-auto h-12 w-12 mb-4" />
        <p>Visual Rule Builder Interface</p>
        <p className="text-sm mt-2">Drag & drop conditions and actions</p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSaveRule(rule)} className="bg-purple-600 hover:bg-purple-700">
          Save Rule
        </Button>
      </div>
    </div>
  );
};

// Offer Form Component (Legacy - keeping for compatibility)
const OfferForm = ({ form, setForm, products, categories, onSubmit, onCancel }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (form.type === 'combo') {
      setForm({
        ...form,
        comboItems: [...(form.comboItems || []), {
          productId: product.id,
          name: product.name,
          quantity: 1,
          originalPrice: product.price
        }]
      });
    } else if (form.type === 'percentage') {
      setForm({
        ...form,
        targetItems: [...(form.targetItems || []), product.id]
      });
    } else if (form.type === 'bogo') {
      setForm({
        ...form,
        buyItems: [...(form.buyItems || []), product.id]
      });
    } else if (form.type === 'fixed') {
      setForm({
        ...form,
        fixedItems: [...(form.fixedItems || []), {
          productId: product.id,
          name: product.name,
          quantity: 1,
          originalPrice: product.price
        }]
      });
    }
  };

  const removeItem = (index, type) => {
    if (type === 'combo') {
      setForm({
        ...form,
        comboItems: form.comboItems.filter((_, i) => i !== index)
      });
    } else if (type === 'percentage') {
      setForm({
        ...form,
        targetItems: form.targetItems.filter((_, i) => i !== index)
      });
    } else if (type === 'bogo') {
      setForm({
        ...form,
        buyItems: form.buyItems.filter((_, i) => i !== index)
      });
    } else if (type === 'fixed') {
      setForm({
        ...form,
        fixedItems: form.fixedItems.filter((_, i) => i !== index)
      });
    }
  };

  const calculateOriginalPrice = () => {
    if (form.type === 'combo' && form.comboItems) {
      return form.comboItems.reduce((total, item) => total + (item.originalPrice * item.quantity), 0);
    }
    if (form.type === 'fixed' && form.fixedItems) {
      return form.fixedItems.reduce((total, item) => total + (item.originalPrice * item.quantity), 0);
    }
    return 0;
  };

  const calculateSavings = () => {
    const original = calculateOriginalPrice();
    if (form.type === 'combo') {
      return Math.max(0, original - (form.comboPrice || 0));
    }
    if (form.type === 'fixed') {
      return Math.max(0, original - (form.fixedPrice || 0));
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Offer Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., Family Meal Deal"
          />
        </div>
        <div>
          <Label htmlFor="type">Offer Type *</Label>
          <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="combo">Combo Offer</SelectItem>
              <SelectItem value="percentage">Percentage Discount</SelectItem>
              <SelectItem value="bogo">Buy One Get One</SelectItem>
              <SelectItem value="fixed">Fixed Price Bundle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of the offer"
        />
      </div>

      {/* Offer Type Specific Fields */}
      {form.type === 'combo' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Combo Items</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Add Products to Combo</Label>
              <Select onValueChange={handleProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.price?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="comboPrice">Combo Price *</Label>
              <Input
                id="comboPrice"
                type="number"
                step="0.01"
                value={form.comboPrice}
                onChange={(e) => setForm({ ...form, comboPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Combo Items List */}
          <div className="space-y-2">
            {form.comboItems?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500">x{item.quantity}</span>
                  <span className="text-sm text-gray-500">${item.originalPrice?.toFixed(2)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index, 'combo')}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Savings Preview */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Original Price:</span>
              <span>${calculateOriginalPrice().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Combo Price:</span>
              <span>${(form.comboPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-green-600">
              <span>You Save:</span>
              <span>${calculateSavings().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {form.type === 'percentage' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Percentage Discount</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountPercent">Discount Percentage *</Label>
              <Input
                id="discountPercent"
                type="number"
                min="0"
                max="100"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: parseFloat(e.target.value) || 0 })}
                placeholder="25"
              />
            </div>
            <div>
              <Label htmlFor="maximumDiscount">Maximum Discount</Label>
              <Input
                id="maximumDiscount"
                type="number"
                step="0.01"
                value={form.maximumDiscount}
                onChange={(e) => setForm({ ...form, maximumDiscount: parseFloat(e.target.value) || 0 })}
                placeholder="10.00"
              />
            </div>
          </div>

          <div>
            <Label>Add Target Products</Label>
            <Select onValueChange={handleProductSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select products to discount..." />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - ${product.price?.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Items List */}
          <div className="space-y-2">
            {form.targetItems?.map((productId, index) => {
              const product = products.find(p => p.id === productId);
              return product ? (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-gray-500">${product.price?.toFixed(2)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index, 'percentage')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {form.type === 'bogo' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Buy One Get One Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyQuantity">Buy Quantity</Label>
              <Input
                id="buyQuantity"
                type="number"
                min="1"
                value={form.buyQuantity}
                onChange={(e) => setForm({ ...form, buyQuantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label htmlFor="getQuantity">Get Quantity</Label>
              <Input
                id="getQuantity"
                type="number"
                min="1"
                value={form.getQuantity}
                onChange={(e) => setForm({ ...form, getQuantity: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div>
            <Label>Add Qualifying Products</Label>
            <Select onValueChange={handleProductSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select products for BOGO..." />
              </SelectTrigger>
              <SelectContent>
                {products.map(product => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - ${product.price?.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* BOGO Items List */}
          <div className="space-y-2">
            {form.buyItems?.map((productId, index) => {
              const product = products.find(p => p.id === productId);
              return product ? (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-gray-500">${product.price?.toFixed(2)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index, 'bogo')}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {form.type === 'fixed' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Fixed Price Bundle</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Add Products to Bundle</Label>
              <Select onValueChange={handleProductSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - ${product.price?.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fixedPrice">Fixed Bundle Price *</Label>
              <Input
                id="fixedPrice"
                type="number"
                step="0.01"
                value={form.fixedPrice}
                onChange={(e) => setForm({ ...form, fixedPrice: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Fixed Items List */}
          <div className="space-y-2">
            {form.fixedItems?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500">x{item.quantity}</span>
                  <span className="text-sm text-gray-500">${item.originalPrice?.toFixed(2)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index, 'fixed')}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Savings Preview */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Original Price:</span>
              <span>${calculateOriginalPrice().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Fixed Price:</span>
              <span>${(form.fixedPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-green-600">
              <span>You Save:</span>
              <span>${calculateSavings().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Schedule Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Advanced Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minimumPurchase">Minimum Purchase</Label>
            <Input
              id="minimumPurchase"
              type="number"
              step="0.01"
              value={form.minimumPurchase}
              onChange={(e) => setForm({ ...form, minimumPurchase: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input
              id="usageLimit"
              type="number"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })}
              placeholder="0 = unlimited"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700">
          {form.id ? 'Update Offer' : 'Create Offer'}
        </Button>
      </div>
    </div>
  );
};

export default OffersManagement;
