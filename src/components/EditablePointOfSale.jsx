import React, { useState } from 'react';
import { Button } from './ui/button.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import {
  CreditCard,
  Banknote,
  Receipt,
  Check,
  HandCoins,
  Trash2,
  Search,
  Hash,
  Plus,
  Percent,
  MessageSquare,
  DollarSign,
  Save,
  RotateCcw,
  CreditCard as PaymentIcon,
  UserPlus,
  Pause
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditablePointOfSale = ({
  subtotal,
  onDeleteAll,
  onSaveSale,
  onRefund,
  onProcessPayment
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState('walk-in');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [comment, setComment] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Configuration state
  const [config, setConfig] = useState({
    paymentMethods: [
      { key: 'cash', label: 'Cash', icon: Banknote, color: 'bg-green-500 hover:bg-green-600', enabled: true },
      { key: 'credit', label: 'Credit Card', icon: CreditCard, color: 'bg-blue-500 hover:bg-blue-600', enabled: true },
      { key: 'debit', label: 'Debit Card', icon: CreditCard, color: 'bg-blue-600 hover:bg-blue-700', enabled: true },
      { key: 'check', label: 'Check', icon: Receipt, color: 'bg-blue-400 hover:bg-blue-500', enabled: true },
      { key: 'loan', label: 'Loan', icon: HandCoins, color: 'bg-blue-300 hover:bg-blue-400', enabled: true },
    ],
    customers: [
      { value: 'walk-in', label: 'Walk-in Customer' },
      { value: 'john-doe', label: 'John Doe' },
      { value: 'jane-smith', label: 'Jane Smith' },
      { value: 'mike-wilson', label: 'Mike Wilson' },
    ],
    actionButtons: [
      { key: 'search', label: 'Search', icon: Search, enabled: true },
      { key: 'quantity', label: 'Quantity', icon: Hash, enabled: true },
      { key: 'barcode', label: 'Barcode', icon: Hash, enabled: true },
      { key: 'new-sale', label: 'New sale', icon: Plus, enabled: true },
    ],
    features: {
      discountEnabled: true,
      commentEnabled: true,
      cashDrawerEnabled: true,
      quantityEditEnabled: true,
      barcodeEnabled: true,
    },
    theme: {
      primaryColor: 'bg-blue-600',
      accentColor: 'bg-gray-100',
    }
  });

  // Edit states
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({ label: '', color: 'bg-blue-500 hover:bg-blue-600' });
  const [newCustomer, setNewCustomer] = useState('');

  const discountedSubtotal = subtotal * (1 - discountPercent / 100);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const enabledPaymentMethods = config.paymentMethods.filter(method => method.enabled);
  const enabledActionButtons = config.actionButtons.filter(button => button.enabled);

  const saveConfiguration = () => {
    localStorage.setItem('posConfiguration', JSON.stringify(config));
    toast.success('Configuration saved');
    setIsConfigOpen(false);
  };

  const loadConfiguration = () => {
    const saved = localStorage.getItem('posConfiguration');
    if (saved) {
      setConfig(JSON.parse(saved));
      toast.success('Configuration loaded');
    }
  };

  const resetConfiguration = () => {
    setConfig({
      paymentMethods: [
        { key: 'cash', label: 'Cash', icon: Banknote, color: 'bg-green-500 hover:bg-green-600', enabled: true },
        { key: 'credit', label: 'Credit Card', icon: CreditCard, color: 'bg-blue-500 hover:bg-blue-600', enabled: true },
        { key: 'debit', label: 'Debit Card', icon: CreditCard, color: 'bg-blue-600 hover:bg-blue-700', enabled: true },
        { key: 'check', label: 'Check', icon: Receipt, color: 'bg-blue-400 hover:bg-blue-500', enabled: true },
        { key: 'loan', label: 'Loan', icon: HandCoins, color: 'bg-blue-300 hover:bg-blue-400', enabled: true },
      ],
      customers: [
        { value: 'walk-in', label: 'Walk-in Customer' },
        { value: 'john-doe', label: 'John Doe' },
        { value: 'jane-smith', label: 'Jane Smith' },
        { value: 'mike-wilson', label: 'Mike Wilson' },
      ],
      actionButtons: [
        { key: 'search', label: 'Search', icon: Search, enabled: true },
        { key: 'quantity', label: 'Quantity', icon: Hash, enabled: true },
        { key: 'barcode', label: 'Barcode', icon: Hash, enabled: true },
        { key: 'new-sale', label: 'New sale', icon: Plus, enabled: true },
      ],
      features: {
        discountEnabled: true,
        commentEnabled: true,
        cashDrawerEnabled: true,
        quantityEditEnabled: true,
        barcodeEnabled: true,
      },
      theme: {
        primaryColor: 'bg-blue-600',
        accentColor: 'bg-gray-100',
      }
    });
    toast.info('Configuration reset to defaults');
  };

  const addPaymentMethod = () => {
    if (!newPaymentMethod.label.trim()) return;

    const method = {
      key: newPaymentMethod.label.toLowerCase().replace(/\s+/g, '-'),
      label: newPaymentMethod.label,
      icon: CreditCard,
      color: newPaymentMethod.color,
      enabled: true
    };

    setConfig(prev => ({
      ...prev,
      paymentMethods: [...prev.paymentMethods, method]
    }));

    setNewPaymentMethod({ label: '', color: 'bg-blue-500 hover:bg-blue-600' });
    toast.success('Payment method added');
  };

  const removePaymentMethod = (key) => {
    setConfig(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter(method => method.key !== key)
    }));
    toast.info('Payment method removed');
  };

  const updatePaymentMethod = (key, updates) => {
    setConfig(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map(method =>
        method.key === key ? { ...method, ...updates } : method
      )
    }));
  };

  const addCustomer = () => {
    if (!newCustomer.trim()) return;

    const customer = {
      value: newCustomer.toLowerCase().replace(/\s+/g, '-'),
      label: newCustomer
    };

    setConfig(prev => ({
      ...prev,
      customers: [...prev.customers, customer]
    }));

    setNewCustomer('');
    toast.success('Customer added');
  };

  const removeCustomer = (value) => {
    setConfig(prev => ({
      ...prev,
      customers: prev.customers.filter(customer => customer.value !== value)
    }));
    toast.info('Customer removed');
  };

  const updateFeature = (feature, enabled) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: enabled
      }
    }));
  };

  const updateActionButton = (key, enabled) => {
    setConfig(prev => ({
      ...prev,
      actionButtons: prev.actionButtons.map(button =>
        button.key === key ? { ...button, enabled } : button
      )
    }));
  };

  return (
    <div className="bg-white p-4 rounded-lg border h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-foreground">Point of Sale</h2>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteAll}
            className="bg-red-500 hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Top Action Buttons */}
      {enabledActionButtons.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {enabledActionButtons.map((button) => (
            <Button key={button.key} variant="outline" size="sm">
              {React.createElement(button.icon, { className: "w-4 h-4 mr-1" })}
              {button.label}
            </Button>
          ))}
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Search customer functionality')}
            className="flex items-center justify-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('New customer functionality')}
            className="flex items-center justify-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            New customer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Hold transaction functionality')}
            className="flex items-center justify-center"
          >
            <Pause className="w-4 h-4 mr-2" />
            Hold
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Recall transaction functionality')}
            className="flex items-center justify-center"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Recall
          </Button>
        </div>
      </div>

      {/* Payment Method Buttons */}
      {enabledPaymentMethods.length > 0 && (
        <div className="mb-4">
          <div className={`grid gap-2 mb-3`} style={{ gridTemplateColumns: `repeat(${Math.min(enabledPaymentMethods.length, 3)}, 1fr)` }}>
            {enabledPaymentMethods.map((method) => {
              const isSelected = selectedPaymentMethod === method.key;
              return (
                <Button
                  key={method.key}
                  onClick={() => handlePaymentMethodSelect(method.key)}
                  className={`${method.color} text-white ${isSelected ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  size="sm"
                >
                  {React.createElement(method.icon, { className: "w-4 h-4 mb-1" })}
                  <span className="text-xs">{method.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Options */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {config.features.discountEnabled && (
          <Button variant="outline" size="sm">
            <Percent className="w-4 h-4 mr-1" />
            Discount
          </Button>
        )}
        {config.features.commentEnabled && (
          <Button variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-1" />
            Comment
          </Button>
        )}
        {config.features.cashDrawerEnabled && (
          <Button variant="outline" size="sm">
            <DollarSign className="w-4 h-4 mr-1" />
            Cash drawer
          </Button>
        )}
      </div>

      {/* Discount Input */}
      {config.features.discountEnabled && (
        <div className="mb-4">
          <label className="block text-sm mb-1">Discount (%):</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="w-24"
          />
        </div>
      )}

      {/* Comment Input */}
      {config.features.commentEnabled && (
        <div className="mb-4">
          <label className="block text-sm mb-1">Comment:</label>
          <Input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
          />
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Bottom Actions */}
      <div className="space-y-3 mt-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSaveSale}>
            <Save className="w-4 h-4 mr-1" />
            Save sale
          </Button>
          <Button variant="outline" size="sm" onClick={onRefund}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Refund
          </Button>
        </div>

        <Button
          className={`w-full ${config.theme.primaryColor} hover:${config.theme.primaryColor.replace('bg-', 'hover:bg-')} text-white`}
          onClick={() => selectedPaymentMethod && onProcessPayment(selectedPaymentMethod)}
          disabled={!selectedPaymentMethod || subtotal === 0 || enabledPaymentMethods.length === 0}
        >
          <PaymentIcon className="w-4 h-4 mr-2" />
          Process Payment
        </Button>
      </div>

      {/* Subtotal Display */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center text-lg">
          <span>Subtotal:</span>
          <div className="text-right">
            {discountPercent > 0 && config.features.discountEnabled && (
              <div className="text-sm text-muted-foreground line-through">
                ${subtotal.toFixed(2)}
              </div>
            )}
            <span className="font-medium">${discountedSubtotal.toFixed(2)}</span>
            {discountPercent > 0 && config.features.discountEnabled && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {discountPercent}% off
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { EditablePointOfSale };
