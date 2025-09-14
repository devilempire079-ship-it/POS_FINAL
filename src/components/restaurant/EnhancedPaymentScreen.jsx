import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Smartphone,
  Gift,
  Split,
  Receipt,
  Calculator,
  Percent,
  Plus,
  Minus,
  CheckCircle,
  X,
  Printer,
  Mail,
  Download,
  ArrowLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useOrderManagement } from '../../hooks/OrderManagementContext';
import ReceiptGenerator from './ReceiptGenerator';

const EnhancedPaymentScreen = ({ tableId, onClose, onPaymentComplete }) => {
  const { getOrderByTable, processPayment, completeOrder, calculateTotals } = useOrderManagement();

  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountReason, setDiscountReason] = useState('');

  // Load order when component mounts
  useEffect(() => {
    const tableOrder = getOrderByTable(tableId);
    if (tableOrder) {
      setOrder(tableOrder);
    }
  }, [tableId, getOrderByTable]);

  // Calculate totals with discounts
  const calculateDiscountedTotals = () => {
    if (!order) return { subtotal: 0, tax: 0, total: 0, finalTotal: 0 };

    const baseTotals = calculateTotals(order.items);
    let discountedSubtotal = baseTotals.subtotal;

    // Apply discount
    if (discountAmount > 0) {
      if (discountType === 'percentage') {
        discountedSubtotal = baseTotals.subtotal * (1 - discountAmount / 100);
      } else {
        discountedSubtotal = Math.max(0, baseTotals.subtotal - discountAmount);
      }
    }

    const tax = discountedSubtotal * 0.08; // 8% tax
    const total = discountedSubtotal + tax;
    const finalTotal = total + tipAmount;

    return { subtotal: discountedSubtotal, tax, total, finalTotal };
  };

  const totals = calculateDiscountedTotals();

  // Payment method options
  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: DollarSign, color: 'bg-green-500' },
    { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'debit', name: 'Debit Card', icon: CreditCard, color: 'bg-purple-500' },
    { id: 'mobile', name: 'Mobile Pay', icon: Smartphone, color: 'bg-orange-500' },
    { id: 'gift', name: 'Gift Card', icon: Gift, color: 'bg-pink-500' },
  ];

  // Tip percentage options
  const tipOptions = [
    { percentage: 0, label: 'No Tip' },
    { percentage: 10, label: '10%' },
    { percentage: 15, label: '15%' },
    { percentage: 18, label: '18%' },
    { percentage: 20, label: '20%' },
    { percentage: 25, label: '25%' },
  ];

  // Handle tip selection
  const handleTipSelect = (percentage) => {
    setTipPercentage(percentage);
    const tipValue = (totals.total * percentage) / 100;
    setTipAmount(tipValue);
    setCustomTip('');
  };

  // Handle custom tip
  const handleCustomTip = (value) => {
    const tipValue = parseFloat(value) || 0;
    setTipAmount(tipValue);
    setTipPercentage(0);
    setCustomTip(value);
  };

  // Handle discount application
  const applyDiscount = () => {
    // Here you could add validation or manager approval logic
    console.log(`Applied ${discountType} discount: ${discountAmount}${discountType === 'percentage' ? '%' : '$'} - ${discountReason}`);
  };

  // Handle payment processing
  const handlePayment = async () => {
    if (!order) return;

    setIsProcessing(true);
    try {
      // Process the payment
      const result = await processPayment(paymentMethod, totals.finalTotal, tipAmount);

      if (result.success) {
        // Complete the order
        await completeOrder(tableId);

        // Show receipt
        setShowReceipt(true);

        // Call parent callback
        if (onPaymentComplete) {
          onPaymentComplete(result.order);
        }
      } else {
        alert('Payment failed: ' + result.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    const methodData = paymentMethods.find(m => m.id === method);
    if (methodData) {
      const IconComponent = methodData.icon;
      return <IconComponent className="w-5 h-5" />;
    }
    return <CreditCard className="w-5 h-5" />;
  };

  if (showReceipt) {
    return (
      <ReceiptGenerator
        order={order}
        onClose={() => {
          setShowReceipt(false);
          onClose();
        }}
        onPrint={(order) => console.log('Printing receipt for order:', order)}
        onEmail={(order, email) => console.log('Emailing receipt to:', email)}
        onDownload={(order) => console.log('Downloading receipt for order:', order)}
      />
    );
  }

  if (!order) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No active order found for this table</p>
          <Button onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Payment - Table {order.tableNumber}
            </CardTitle>
            <Button onClick={onClose} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Order Summary */}
        <div className="space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <div className="font-medium">{item.quantity}x {item.name}</div>
                      {item.notes && (
                        <div className="text-sm text-gray-600 italic">{item.notes}</div>
                      )}
                    </div>
                    <div className="font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              {/* Discount Section */}
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-gray-900">Discount (Optional)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                        placeholder={discountType === 'percentage' ? '10' : '5.00'}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm">
                        {discountType === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="Discount reason (e.g., Manager comp, Loyalty program)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {discountAmount > 0 && (
                  <Button onClick={applyDiscount} size="sm" className="w-full">
                    Apply Discount
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Totals */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%):</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discountAmount}{discountType === 'percentage' ? '%' : '$'}):</span>
                    <span>-{formatCurrency(discountType === 'percentage' ?
                      (calculateTotals(order.items).subtotal * discountAmount / 100) :
                      discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tip:</span>
                  <span>{formatCurrency(tipAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3">
                  <span>Total:</span>
                  <span>{formatCurrency(totals.finalTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Payment Options */}
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <method.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{method.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Split Payment Toggle */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">Split Payment</span>
                <button
                  onClick={() => setSplitPayment(!splitPayment)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    splitPayment ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      splitPayment ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Tip Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Add Tip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Tip Options */}
              <div className="grid grid-cols-3 gap-2">
                {tipOptions.map((option) => (
                  <button
                    key={option.percentage}
                    onClick={() => handleTipSelect(option.percentage)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      tipPercentage === option.percentage
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-gray-600">
                      {formatCurrency((totals.total * option.percentage) / 100)}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Tip */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Tip Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={customTip}
                    onChange={(e) => handleCustomTip(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getPaymentIcon(paymentMethod)}
                    <div>
                      <div className="font-medium capitalize">{paymentMethod.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-600">Amount: {formatCurrency(totals.finalTotal)}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Ready
                  </Badge>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-3 text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete Payment - {formatCurrency(totals.finalTotal)}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentScreen;
